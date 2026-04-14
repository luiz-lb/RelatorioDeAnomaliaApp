// importando a configuração do banco de dados
import {sql, poolPromise} from '../config/dbConfig.js';

export async function criarRelatorio(dadosRelatorio) {
    const pool = await poolPromise;
    const result = await pool.request()
        .input('user_id', sql.Int, dadosRelatorio.usuarioId)
        .input('site_id', sql.VarChar(255), dadosRelatorio.siteId)
        .input('altura_torre', sql.VarChar(255), dadosRelatorio.alturaTorre)
        .input('tipo_cadeado', sql.VarChar(255), dadosRelatorio.cadeado)
        .input('endereco', sql.VarChar(255), dadosRelatorio.endereco)
        .input('CEP', sql.Int, dadosRelatorio.cep)
        .input('municipio', sql.VarChar(70), dadosRelatorio.municipio)
        .input('uf', sql.VarChar(2), dadosRelatorio.uf)
        .input('tipo_estrutura', sql.VarChar(255), dadosRelatorio.tipoEstrutura)
        .input('status', sql.VarChar(50), dadosRelatorio.status)
        .query('Insert into fiscalizacoes(usuario_id, site_id, altura_torre, tipo_cadeado, endereco, CEP, municipio, uf, tipo_estrutura, status) Output inserted.id Values (@user_id, @site_id, @altura_torre, @tipo_cadeado, @endereco, @CEP, @municipio, @uf, @tipo_estrutura, @status)');
    return result.recordset[0].id;
}