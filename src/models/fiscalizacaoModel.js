// importando a configuração do banco de dados
import {sql, poolPromise} from '../config/dbConfig.js';

export async function criarRelatorio(dadosRelatorio) {
    const pool = await poolPromise;
    const result = await pool.request()
        .input('user_id', sql.Int, dadosRelatorio.usuarioId)
        .input('site_id', sql.VarChar(255), dadosRelatorio.siteId)
        .input('altura_torre', sql.Decimal(5, 2), dadosRelatorio.alturaTorre)
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
        .query(`Select f.id, u.nome, f.usuario_id, f.site_id, f.altura_torre, f.tipo_cadeado, f.tipo_estrutura, f.CEP, f.endereco, f.municipio, f.UF, f.created_at, f.status, f.enviado_em, f.pdf_url From fiscalizacoes As f Inner Join usuarios as u on u.id = f.usuario_id where f.id=@idRelatorio and (f.usuario_id=@idUsuario ${permissaoSql})`);
    return result.recordset[0];
}

export async function obterRelatorioPorId(idRelatorio) {
    const pool = await poolPromise;
    const result = await pool.request()
        .input('idRelatorio', sql.Int, idRelatorio)
        .query(`Select id, fiscalizacao_id, descricao, foto_path, foto_sharepoint_url From nao_conformidades where fiscalizacao_id=@idRelatorio`);
    return result.recordset;
}

export async function obterRelatoriosPorUsuario(idUsuario, permissaoUsuario, top = 10, status = "") {
    const pool = await poolPromise;
    const result = await pool.request()
        .input('idUsuario', sql.Int, idUsuario)
        .input('permissaoUsuario', sql.VarChar(50), permissaoUsuario)
        .input('top', sql.Int, top)
        .input('status', sql.VarChar(50), status)
        .query(`Select top (@top) id, usuario_id, site_id, altura_torre, tipo_cadeado, tipo_estrutura, CEP, endereco, municipio, UF, created_at, status From fiscalizacoes where (@permissaoUsuario = 'Everest' or usuario_id=@idUsuario) and (@status = '' or status = @status) order by created_at desc`);
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

export async function obterNaoConformidadesRelatorio(idRelatorio) {
    const pool = await poolPromise;
    const result = await pool.request()
        .input('idRelatorio', sql.Int, idRelatorio)
        .query(`Select id, descricao From nao_conformidades Where fiscalizacao_id = @idRelatorio Order by id`);
    return result.recordset;
}

export async function inserirCheckListSelecionados(transaction, idRelatorio, itensSelecionados) {
    const request = new sql.Request(transaction);
    
    // Garante que é um array para podermos iterar (trata caso venha como JSON string)
    const itens = Array.isArray(itensSelecionados) ? itensSelecionados : JSON.parse(itensSelecionados);
    
    if (!itens || itens.length === 0) {
        console.log('Nenhum item selecionado para inserir.');
        return false;
    }

    request.input('idRelatorio', sql.Int, idRelatorio);

    const values = itens.map((itemId, index) => {
        request.input(`item_${index}`, sql.Int, itemId);
        return `(@idRelatorio, @item_${index}, 1)`;
    });

    const query = `Insert Into checklist_respostas (fiscalizacao_id, checklist_item_id, checado) Values ${values.join(', ')}`;
    console.log('Query de inserção:', query);
    console.log('Itens a inserir:', itens);
    
    try {
        const result = await request.query(query);
        console.log('Resultado do insert:', result.rowsAffected);
        return result.rowsAffected[0] > 0;
    } catch (error) {
        console.error('Erro ao executar insert de checklist_respostas:', error);
        throw error;
    }
}

// --- Funções com Suporte a Transação ---

export async function iniciarTransacao() {
    const pool = await poolPromise;
    const transaction = new sql.Transaction(pool);
    await transaction.begin();
    return transaction;
}

export async function finalizarTransacao(transaction, sucesso = true) {
    if (sucesso) {
        await transaction.commit();
    } else {
        await transaction.rollback();
    }
}

export async function atualizarRelatorioParaProcessando(transaction, idRelatorio) {
    const request = new sql.Request(transaction);
    request.input('idRelatorio', sql.Int, idRelatorio);
    
    const result = await request.query(`Update fiscalizacoes Set status = 'Processando' Where id = @idRelatorio`);
    return result.rowsAffected[0] > 0;
}

export async function finalizandoRelatorio(transaction, idRelatorio, pdfUrl) {
    const request = new sql.Request(transaction);
    request.input('idRelatorio', sql.Int, idRelatorio);
    request.input('pdfUrl', sql.VarChar(255), pdfUrl);

    const result = await request.query(`Update fiscalizacoes Set status = 'Concluído', pdf_url = @pdfUrl, enviado_em = GETDATE() Where id = @idRelatorio`);
    return result.rowsAffected[0] > 0;
}
