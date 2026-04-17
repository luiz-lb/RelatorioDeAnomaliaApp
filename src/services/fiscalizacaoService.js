import * as fiscalizacaoModel from '../models/fiscalizacaoModel.js';
import { verificarPermissaoParaSql } from './authService.js';

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
    console.log('Consulta feita com sucesso. Número de relatórios encontrados: ', resultado.length);

    return resultado;
}

export async function salvarNaoConformidade(idRelatorio, caminhoArquivo, descricao) {
    try {
        const resultado = await fiscalizacaoModel.salvarNaoConformidade(idRelatorio, caminhoArquivo, descricao);
        console.log('Não conformidade salva com sucesso.');
        return resultado;
    } catch (error) {
        console.error('Erro ao salvar a não conformidade:', error);
        throw new Error('Não foi possível salvar a não conformidade. Tente novamente mais tarde.');
    }
}