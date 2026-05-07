import * as fiscalizacaoModel from '../models/fiscalizacaoModel.js';
import { verificarPermissaoParaSql } from './authService.js';
import { sendEmail } from '../utils/mailer.js';
import fs from 'fs';
import crypto from 'crypto';
import path from 'path';
import { gerarRelatorioPDF } from './pdfService.js';

const ano = new Date().getFullYear(); // Obter o ano atual
const mes = new Date().getMonth() + 1; // Obter o mês atual (0-11, por isso +1)
const dia = new Date().getDate(); // Obter o dia atual

function formatarData(data) {
    if (!data) return null;
    const d = new Date(data);
    const dia = String(d.getDate()).padStart(2, '0');
    const mes = String(d.getMonth() + 1).padStart(2, '0');
    const ano = d.getFullYear();
    const horas = String(d.getHours()).padStart(2, '0');
    const minutos = String(d.getMinutes()).padStart(2, '0');
    return `${dia}/${mes}/${ano} ${horas}:${minutos}`;
}

export async function criarRelatorio(dadosRelatorio) {
    try {
        const resultado = await fiscalizacaoModel.criarRelatorio(dadosRelatorio);
        console.log('Relatório criado com sucesso:', resultado);
        return resultado;
    } catch (error) {
        console.error('Erro ao criar relatório:', error);
        throw new Error('Não foi possível criar o relatório. Tente novamente mais tarde.');
    }
}

export async function obterRelatorioPorId(idRelatorio, idUsuario, permissaoUsuario) {
    console.log('Consultando relatório com ID: ', idRelatorio, '. Para o usuário do ID ', idUsuario, ' para edição.');
    //verificar se o usuário tem permissão para acessar o relatório
    const permissaoSql = await verificarPermissaoParaSql(permissaoUsuario);
    console.log('Relatorio consultado do id ', idRelatorio, 'com a permissao SQL', permissaoSql); // Log para verificar o valor de permissaoSql
    const resultadoHeader = await fiscalizacaoModel.obterRelatorioHeaderPorId(idRelatorio, idUsuario, permissaoSql);
    const resultadoBody = await fiscalizacaoModel.obterRelatorioPorId(idRelatorio);
    // fazendo o map no resultadoBody para ajustar o caminho da imagem, colocando só a parte "uploads/..." para o frontend conseguir acessar a imagem e mudando o nome da variavel de foto_path para caminhoDaImagem.
    const resultadoBodyAjustado = resultadoBody.map(item => {
        return {
            id: item.id,
            fiscalizacao_id: item.fiscalizacao_id,
            descricao: item.descricao,
            caminhoDaImagem: item.foto_path ? item.foto_path.replace(/\\/g, '/').split('src/public')[1] : null, // Ajusta o caminho da imagem para o formato correto para o frontend
        };
    });
    if(!resultadoHeader) {
        console.log('Relatório não encontrado ou acesso negado para o usuário ID:', idUsuario);
        throw new Error('Relatório não encontrado ou acesso negado.');
    }

    resultadoHeader.created_at = formatarData(resultadoHeader.created_at);

    console.log('Consulta feita com sucesso.');

    const resultado = {
        header: resultadoHeader,
        body: resultadoBodyAjustado
    };

    return resultado;
}

export async function obterRelatoriosPorUsuario(idUsuario, top = 10) {
    console.log('Consultando relatórios para o usuário do ID ', idUsuario);
    const resultado = await fiscalizacaoModel.obterRelatoriosPorUsuario(idUsuario, top);

    resultado.forEach(relatorio => {
        relatorio.created_at = formatarData(relatorio.created_at);
    });

    console.log('Consulta feita com sucesso. Número de relatórios encontrados: ', resultado.length);

    return resultado;
}

export async function salvarNaoConformidade(idRelatorio, caminhoArquivo, descricao, hash) {
    try {
        const resultado = await fiscalizacaoModel.salvarNaoConformidade(idRelatorio, caminhoArquivo, descricao, hash);
        console.log('Não conformidade salva com sucesso.');
        return resultado;
    } catch (error) {
        console.error('Erro ao salvar a não conformidade:', error);
        throw new Error('Não foi possível salvar a não conformidade. Tente novamente mais tarde.');
    }
}

export async function processarNaoConformidade(idRelatorio, arquivo, descricao, usuario) {
    if (!arquivo) {
        const erro = new Error("Você precisa selecionar uma imagem.");
        erro.statusCode = 400;
        throw erro;
    }

    // Calcular hash do arquivo para evitar duplicatas por múltiplos cliques
    const fileBuffer = fs.readFileSync(arquivo.path);
    const hash = crypto.createHash('sha256').update(fileBuffer).digest('hex');

    // Inicializar armazenamento de hashes na sessão se necessário
    if (!usuario.uploadHashes) usuario.uploadHashes = {};

    // Se já houver um hash idêntico para esse relatório, bloquear o envio
    if (usuario.uploadHashes[idRelatorio] === hash) {
        const resultado = { erro:"Imagem já foi enviada (duplicata detectada)."};
        // Apagando imagem duplicada do servidor para evitar acúmulo de arquivos
        fs.unlink(arquivo.path, (err) => {
            if (err) console.error('Erro ao apagar arquivo duplicado:', err);
        });
        return resultado;
    }

    // Salvar no banco de dados
    const idNaoConformidadeNova = await salvarNaoConformidade(idRelatorio, arquivo.path, descricao, hash);
    if (!idNaoConformidadeNova) {
        throw new Error("Erro ao salvar a não conformidade.");
    }

    // Ajustar caminho para o frontend (remove "src/public" do path)
    const caminhoDaImagem = arquivo.path.replace(/\\/g, '/').split('src/public')[1];

    // Marcar hash salvo para esse relatório
    usuario.uploadHashes[idRelatorio] = hash;

    return { caminhoDaImagem, descricao, id: idNaoConformidadeNova };
}

export async function editarNaoConformidade(idRelatorio, idNaoConformidade, descricao) {
    try {
        const resultado = await fiscalizacaoModel.editarNaoConformidade(idRelatorio, idNaoConformidade, descricao);
        console.log('Não conformidade editada com sucesso.');
        return resultado;
    } catch (error) {
        console.error('Erro ao editar a não conformidade:', error);
        throw new Error('Não foi possível editar a não conformidade. Tente novamente mais tarde.');
    }
}

export async function excluirNaoConformidade(idRelatorio, idNaoConformidade) {
    try {
        const resultado = await fiscalizacaoModel.excluirNaoConformidade(idRelatorio, idNaoConformidade);
        console.log('Não conformidade excluída com sucesso.');
        return resultado;
    } catch (error) {
        console.error('Erro ao excluir a não conformidade:', error);
        throw new Error('Não foi possível excluir a não conformidade. Tente novamente mais tarde.');
    }
}

export async function obterChecklistRelatorio() {
    try {
        const checklist = await fiscalizacaoModel.obterChecklistRelatorio();
        console.log('Checklist obtido com sucesso.');
        return checklist;
    } catch (error) {
        console.error('Erro ao obter o checklist do relatório:', error);
        throw new Error('Não foi possível obter o checklist do relatório. Tente novamente mais tarde.');
    }
}

async function criarEmailDeAviso(idRelatorio) {
    try {
        /*Tanto faz o id do usuário na chamada da função*/
        const relatorioEnviado = await fiscalizacaoModel.obterRelatorioHeaderPorId(idRelatorio, 1, " or 1=1");
        console.log('Relatório para e-mail de aviso obtido com sucesso:', relatorioEnviado);
        const htmlEnvioFeito = `<!DOCTYPE html>
            <html lang="pt-BR">
            <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Relatório de Anomalias</title>
            </head>
            <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f7f6;">
            
            <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f4f7f6; padding: 40px 20px;">
                <tr>
                <td align="center">
                    
                    <!-- Container Principal -->
                    <table width="600" cellpadding="0" cellspacing="0" border="0" style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.08); overflow: hidden;">
                    
                    <!-- Cabeçalho -->
                    <tr>
                        <td style="background-color: #1a365d; padding: 30px 40px; text-align: center;">
                        <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 600; letter-spacing: 0.5px;">Relatório de Anomalias</h1>
                        </td>
                    </tr>
                    
                    <!-- Corpo do E-mail -->
                    <tr>
                        <td style="padding: 40px;">
                        <p style="color: #333333; font-size: 16px; line-height: 1.6; margin-top: 0; margin-bottom: 25px;">
                            O usuário <strong>${relatorioEnviado.nome || 'N/A'}</strong> acabou de enviar um relatório:
                        </p>

                        <!-- Caixa de Detalhes -->
                        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f8fafc; border-left: 4px solid #3182ce; border-radius: 4px; margin-bottom: 30px;">
                            <tr>
                            <td style="padding: 20px;">
                                <table width="100%" cellpadding="0" cellspacing="0" border="0">
                                <tr>
                                    <td style="padding-bottom: 10px; color: #4a5568; font-size: 15px;">
                                    <strong>Site ID:</strong> <span style="color: #2d3748;">${relatorioEnviado.site_id || 'N/A'}</span>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding-bottom: 10px; color: #4a5568; font-size: 15px;">
                                    <strong>Data da criação:</strong> <span style="color: #2d3748;">${formatarData(relatorioEnviado.created_at) || 'N/A'}</span>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding-bottom: 10px; color: #4a5568; font-size: 15px;">
                                    <strong>Data do envio:</strong> <span style="color: #2d3748;">${formatarData(relatorioEnviado.enviado_em) || 'N/A'}</span>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="color: #4a5568; font-size: 15px;">
                                    <strong>Tipo de estrutura:</strong> <span style="color: #2d3748;">${relatorioEnviado.tipo_estrutura || 'N/A'}</span>
                                    </td>
                                </tr>
                                </table>
                            </td>
                            </tr>
                        </table>

                        <p style="color: #333333; font-size: 16px; line-height: 1.6; margin-bottom: 30px; text-align: center;">
                            Clique no link abaixo para visualizar.
                        </p>

                        <!-- Botão de Ação (CTA) -->
                        <table width="100%" cellpadding="0" cellspacing="0" border="0">
                            <tr>
                            <td align="center">
                                <a href="http://localhost:3000/fiscalizacao/edit/${idRelatorio}" target="_blank" style="display: inline-block; padding: 14px 32px; background-color: #3182ce; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px; text-align: center; transition: background-color 0.3s ease;">
                                Visualizar Relatório
                                </a>
                            </td>
                            </tr>
                        </table>
                        
                        </td>
                    </tr>
                    
                    <!-- Rodapé -->
                    <tr>
                        <td style="background-color: #f8fafc; padding: 20px; text-align: center; border-top: 1px solid #e2e8f0;">
                        <p style="color: #a0aec0; font-size: 13px; margin: 0; line-height: 1.5;">
                            Este é um e-mail automático gerado pelo sistema.<br>Por favor, não responda a esta mensagem.
                        </p>
                        </td>
                    </tr>
                    
                    </table>
                </td>
                </tr>
            </table>
            
            </body>
            </html>
        `;

        const configuracaoEmail = {
            message: {
                subject: "Relatório de Anomalias - Novo Envio",
                body: {
                    contentType: "HTML",
                    content: htmlEnvioFeito
                },
                toRecipients: [{ emailAddress: { address: 'luiz.silva@everestengenharia.com.br' } }]
            },
            saveToSentItems: "true"
        };

        console.log('Preparando para enviar o e-mail:', configuracaoEmail);
        return configuracaoEmail;
    } catch (error) {
        console.error('Erro ao criar a configuração do e-mail de aviso:', error);
        throw new Error('Não foi possível criar a configuração do e-mail de aviso. Tente novamente mais tarde.');
    }
}

export async function enviarRelatorio(idRelatorio, idUsuario, permissaoUsuario, itensSelecionados) {
    // Obter os dados do relatório ANTES da transação para evitar Deadlock (TimeOut).
    const dadosRelatorio = await obterRelatorioPorId(idRelatorio, idUsuario, permissaoUsuario);
    // Força o status na memória para sair a cor e texto corretos na geração visual do PDF
    dadosRelatorio.header.status = 'Finalizado';

    const transaction = await fiscalizacaoModel.iniciarTransacao();
    let transacaoConcluida = false; // Controle para não fazer rollback em transação fechada

    try {
        const resultadoCheckList = await fiscalizacaoModel.inserirCheckListSelecionados(transaction, idRelatorio, itensSelecionados);
        if (!resultadoCheckList) {
            throw new Error("Erro ao inserir checklist no banco de dados.");
        }
        // Atualiza status para Processando
        const resultadoStatus = await fiscalizacaoModel.atualizarRelatorioParaProcessando(transaction, idRelatorio);
        
        if (!resultadoStatus) {
            throw new Error("Erro ao atualizar o status do relatório para Processando.");
        }

        const pdfBuffer = await gerarRelatorioPDF(
            dadosRelatorio.header,
            dadosRelatorio.body,
            idRelatorio
        );

        // Configurar os caminhos e salvar o PDF gerado fisicamente no disco
        const nomeArquivoPdf = `Relatorio_Anomalias_${idRelatorio}.pdf`;
        const caminhoRelativoPdf = `src/relatoriosGerados/${ano}/${mes}/${dia}/${nomeArquivoPdf}`;

        const caminhoAbsoluto = path.join(process.cwd(), 'src', 'relatoriosGerados', `${ano}`, `${mes}`, `${dia}`);
        if (!fs.existsSync(caminhoAbsoluto)) fs.mkdirSync(caminhoAbsoluto, { recursive: true });
        fs.writeFileSync(path.join(caminhoAbsoluto, nomeArquivoPdf), pdfBuffer);
        console.log('PDF gerado e salvo no disco com sucesso.');

        // Atualiza o status para finalizado e insere o caminho do PDF
        await fiscalizacaoModel.finalizandoRelatorio(transaction, idRelatorio, caminhoRelativoPdf);

        // Confirma (Commit) a transação no banco de dados pois todos os passos deram certo!
        await fiscalizacaoModel.finalizarTransacao(transaction, true);
        transacaoConcluida = true; // Marca que o banco de dados já foi salvo com segurança!
        console.log('Transação efetivada no banco de dados com sucesso.');

        const configuracaoEmail = await criarEmailDeAviso(idRelatorio);

        // Delega o envio para a função de infraestrutura
        const remetente = "chamados@everestengenharia.com.br";
        const sucesso = await sendEmail(remetente, configuracaoEmail);
        if (!sucesso) {
            console.error('Falha ao enviar o e-mail de notificação, mas o processo principal já foi concluído.');
            return { sucesso: true, emailFalhou: true, mensagem: "Relatório gerado e finalizado, porém com falha ao enviar e-mail de aviso para a Everest." };
        }
        else {
            console.log('E-mail de notificação enviado com sucesso.');
            return { sucesso: true, mensagem: "Relatório enviado com sucesso." };
        }
    } catch (error) {
        // Se houver QUALQUER erro (falha na query, falha ao gerar PDF, disco cheio, etc.)
        if (!transacaoConcluida) {
            console.error('Falha no processo. Desfazendo alterações no banco de dados (Rollback)...');
            await fiscalizacaoModel.finalizarTransacao(transaction, false);
        }
        
        console.error('Erro ao enviar o relatório:', error);
        throw new Error('Não foi possível enviar o relatório. Tente novamente mais tarde.');
    }
}

export async function obterRelatorioPdfPorId(idRelatorio, idUsuario, permissaoUsuario) {
    try {
        const relatorioEnviado = await fiscalizacaoModel.obterRelatorioHeaderPorId(idRelatorio, idUsuario, permissaoUsuario);

        if (!relatorioEnviado) {
            throw new Error("Relatório não encontrado ou sem permissão de acesso.");
        }

        if (relatorioEnviado.status === 'Rascunho') {
            throw new Error("Relatório em rascunho não pode ser baixado.");
        }

        const caminhoDoArquivo = path.join(process.cwd(), relatorioEnviado.pdf_url);

        console.log('Caminho do arquivo PDF encontrado:', caminhoDoArquivo);

        // Verificar se o arquivo realmente existe no disco
        if (!fs.existsSync(caminhoDoArquivo)) {
            return {
                sucesso: false,
                mensagem: 'Arquivo PDF não encontrado no servidor.'
            };
        }

        // Nome que vai aparecer para o usuário quando ele baixar
        const nomeParaDownload = `Relatorio_Anomalias_${relatorioEnviado.site_id || idRelatorio}.pdf`;

        return { caminhoDoArquivo, nomeParaDownload };
    } catch (error) {
        console.error('Erro ao obter o caminho do PDF do relatório:', error);
        throw new Error('Não foi possível obter o caminho do PDF do relatório.');
    }
}