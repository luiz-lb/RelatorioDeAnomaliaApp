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

    if(!resultadoHeader) {
        console.log('Relatório não encontrado ou acesso negado para o usuário ID:', idUsuario);
        throw new Error('Relatório não encontrado ou acesso negado.');
    }

    console.log('Consulta feita com sucesso.');

    const resultado = {
        header: resultadoHeader,
        body: resultadoBody
    };

    return resultado;
}