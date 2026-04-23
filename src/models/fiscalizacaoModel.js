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

export async function obterRelatorioHeaderPorId(idRelatorio, idUsuario, permissaoSql = "") {
    const pool = await poolPromise;
    const result = await pool.request()
        .input('idRelatorio', sql.Int, idRelatorio)
        .input('idUsuario', sql.Int, idUsuario)
        .query(`Select id, usuario_id, site_id, altura_torre, tipo_cadeado, tipo_estrutura, CEP, endereco, municipio, UF, created_at, status From fiscalizacoes where id=@idRelatorio and (usuario_id=@idUsuario ${permissaoSql})`);
    return result.recordset[0];
}

export async function obterRelatorioPorId(idRelatorio) {
    const pool = await poolPromise;
    const result = await pool.request()
        .input('idRelatorio', sql.Int, idRelatorio)
        .query(`Select id, fiscalizacao_id, descricao, foto_path, foto_sharepoint_url From nao_conformidades where fiscalizacao_id=@idRelatorio`);
    return result.recordset;
}

export async function obterRelatoriosPorUsuario(idUsuario, top = 10) {
    const pool = await poolPromise;
    const result = await pool.request()
        .input('idUsuario', sql.Int, idUsuario)
        .input('top', sql.Int, top)
        .query(`Select top (@top) id, usuario_id, site_id, altura_torre, tipo_cadeado, tipo_estrutura, CEP, endereco, municipio, UF, created_at, status From fiscalizacoes where usuario_id=@idUsuario order by created_at desc`);
    return result.recordset;
}

export async function salvarNaoConformidade(idRelatorio, caminhoArquivo, descricao, hash) {
    const pool = await poolPromise;
    const result = await pool.request()
        .input('fiscalizacao_id', sql.Int, idRelatorio)
        .input('descricao', sql.VarChar(255), descricao)
        .input('foto_path', sql.VarChar(255), caminhoArquivo)
        .input('hash_foto', sql.VarChar(64), hash)
        .query(`Insert into nao_conformidades(fiscalizacao_id, descricao, foto_path, hash_foto) Output inserted.id Values (@fiscalizacao_id, @descricao, @foto_path, @hash_foto)`);
    return result.recordset[0].id;
}

export async function editarNaoConformidade(idRelatorio, idNaoConformidade, descricao) {
    const pool = await poolPromise;
    const result = await pool.request()
        .input('idNaoConformidade', sql.Int, idNaoConformidade)
        .input('fiscalizacao_id', sql.Int, idRelatorio)
        .input('descricao', sql.VarChar(255), descricao)
        .query(`Update nao_conformidades set descricao=@descricao where id=@idNaoConformidade and fiscalizacao_id=@fiscalizacao_id`);
    return result.rowsAffected[0] > 0;
}

export async function excluirNaoConformidade(idRelatorio, idNaoConformidade) {
    const pool = await poolPromise;
    const result = await pool.request()
        .input('idNaoConformidade', sql.Int, idNaoConformidade)
        .input('fiscalizacao_id', sql.Int, idRelatorio)
        .query(`Delete from nao_conformidades where id=@idNaoConformidade and fiscalizacao_id=@fiscalizacao_id`);
    return result.rowsAffected[0] > 0;
}

export async function obterChecklistRelatorio() {
    const pool = await poolPromise;
    const result = await pool.request()
        .query(`Select id, descricao, ordem From checklist_itens Where Ativo = 1 Order by ordem`);
    return result.recordset;
}