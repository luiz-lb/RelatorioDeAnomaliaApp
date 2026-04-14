import * as fiscalizacaoModel from '../models/fiscalizacaoModel.js';

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