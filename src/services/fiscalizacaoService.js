import * as fiscalizacaoModel from '../models/fiscalizacaoModel.js';

export async function criarRelatorio(dadosRelatorio) {
    const resultado = await fiscalizacaoModel.criarRelatorio(dadosRelatorio);
    return resultado;
}