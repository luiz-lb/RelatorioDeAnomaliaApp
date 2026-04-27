import * as fiscalizacaoModel from '../models/fiscalizacaoModel.js';
import { verificarPermissaoParaSql } from './authService.js';
import { sendEmail } from '../utils/mailer.js';
import fs from 'fs';
import crypto from 'crypto';

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

export async function enviarRelatorio(idRelatorio, itensSelecionados) {
    try {
        /*
        const resultado = await fiscalizacaoModel.inserirCheckListSelecionados(idRelatorio, itensSelecionados);
        if (!resultado) {
            throw new Error("Erro ao inserir checklist no banco de dados.");
        }
        console.log('Checklist do relatório atualizado com sucesso.');
        */


        //const resultado2 = await fiscalizacaoModel.enviarRelatorio(idRelatorio, itensSelecionados);
        //console.log('Relatório enviado com sucesso.');
        //return resultado;

        //Teste
        const htmlEnvioFeito = `<div style="font-family: Arial, sans-serif; color: #333;">
            <h2 style="color: #007BFF;">Relatório de Fiscalização Enviado</h2>
            <p>O relatório de fiscalização com ID <strong>${idRelatorio}</strong> foi enviado com sucesso.</p>
            <h3>Itens Selecionados:</h3>
            <ul>
                ${itensSelecionados.map(item => `<li>${item}</li>`).join('')}
            </ul>
            <p>Por favor, revise o relatório e tome as ações necessárias.</p>
        </div>
        `;

        const configuracaoEmail = {
            message: {
                subject: "Alerta de Erros - Rotina X",
                body: {
                    contentType: "HTML",
                    content: htmlEnvioFeito
                },
                toRecipients: [{ emailAddress: { address: 'luiz.silva@everestengenharia.com.br' } }]
            },
            saveToSentItems: "true"
        };

        console.log('Preparando para enviar o e-mail:', configuracaoEmail);

        // Delega o envio para a função de infraestrutura
        const remetente = "chamados@everestengenharia.com.br";
        const sucesso = await sendEmail(remetente, configuracaoEmail);
        if (!sucesso) {
            console.error('Falha ao enviar o e-mail de notificação.');
            // Aqui você pode decidir se quer lançar um erro ou apenas logar a falha, dependendo da criticidade do e-mail para o processo.
        }
        console.log('E-mail de notificação enviado com sucesso.');
        return sucesso;

    } catch (error) {
        console.error('Erro ao enviar o relatório:', error);
        throw new Error('Não foi possível enviar o relatório. Tente novamente mais tarde.');
    }
}