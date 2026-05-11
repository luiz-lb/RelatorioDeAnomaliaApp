// importando a configuração do banco de dados
import {sql, poolPromise} from '../config/dbConfig.js';

export async function getAllUser() {
    const pool = await poolPromise;
    const result = await pool.request()
        .query('SELECT id, nome, email, empresa, created_at, permissao, ativo FROM usuarios');
    return result.recordset;
}

export async function getUserById(id) {
    const pool = await poolPromise;
    const result = await pool.request()
        .input('id', sql.Int, id)
        .query('SELECT id, nome, email, ativo, created_at, empresa, permissao FROM usuarios WHERE id = @id');
    return result.recordset[0];
}

export async function atualizarUsuario(id, dadosUsuario) {
    const pool = await poolPromise;
    const request = pool.request();
    request.input('id', sql.Int, id);

    const camposParaAtualizar = [];
    
    // Mapeamento dinâmico: chave no objeto dadosUsuario => nome da coluna no Banco
    const mapping = [
        { key: 'nomeCompleto', col: 'nome', type: sql.VarChar(255) },
        { key: 'email', col: 'email', type: sql.VarChar(255) },
        { key: 'empresa', col: 'empresa', type: sql.VarChar(255) },
        { key: 'permissao', col: 'permissao', type: sql.VarChar(50) },
        { key: 'ativo', col: 'ativo', type: sql.Bit },
        { key: 'senha_hash', col: 'senha_hash', type: sql.VarChar(255) }
    ];

    mapping.forEach(item => {
        // Verifica se o campo existe no objeto e se não é uma string vazia
        if (dadosUsuario[item.key] !== undefined && dadosUsuario[item.key] !== '') {
            request.input(item.key, item.type, dadosUsuario[item.key]);
            camposParaAtualizar.push(`${item.col} = @${item.key}`);
        }
    });

    // Se nenhum campo foi alterado, apenas retorna sucesso para evitar erro de sintaxe SQL
    if (camposParaAtualizar.length === 0) return true;

    const query = `UPDATE usuarios SET ${camposParaAtualizar.join(', ')} WHERE id = @id`;
    const result = await request.query(query);
    return result.rowsAffected[0] > 0;
}

export async function criarUsuario(dadosUsuario, senha_hash) {
    const pool = await poolPromise;
    const result = await pool.request()
        .input('nome', sql.VarChar(255), dadosUsuario.nomeCompleto)
        .input('email', sql.VarChar(255), dadosUsuario.email)
        .input('senha', sql.VarChar(255), senha_hash)
        .input('empresa', sql.VarChar(255), dadosUsuario.empresa)
        .input('permissao', sql.VarChar(50), dadosUsuario.permissao)
        .input('ativo', sql.Bit, dadosUsuario.ativo)
        .query('INSERT INTO usuarios (nome, email, senha_hash, empresa, permissao, ativo) VALUES (@nome, @email, @senha, @empresa, @permissao, @ativo)');
    return result.rowsAffected[0] > 0;
}

export async function getUserByEmail(email) {
    const pool = await poolPromise;
    const result = await pool.request()
        .input('email', sql.VarChar(150), email)
        .query('SELECT id, nome, email, senha_hash, ativo, permissao FROM usuarios WHERE email = @email');
    return result.recordset[0];
}