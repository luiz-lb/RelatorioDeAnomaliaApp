//importando o axios para fazer requisições HTTP
import axios from 'axios';
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
    const result = await pool.request()
        .input('id', sql.Int, id)
        .input('nome', sql.VarChar(255), dadosUsuario.nomeCompleto)
        .input('email', sql.VarChar(255), dadosUsuario.email)
        .input('empresa', sql.VarChar(255), dadosUsuario.empresa)
        .input('permissao', sql.VarChar(50), dadosUsuario.permissao)
        .input('ativo', sql.Bit, dadosUsuario.ativo)
        .query('UPDATE usuarios SET nome = @nome, email = @email, empresa = @empresa, permissao = @permissao, ativo = @ativo WHERE id = @id');
    return result.rowsAffected[0] > 0;
}

export async function criarUsuario(dadosUsuario) {
    const pool = await poolPromise;
    const result = await pool.request()
        .input('nome', sql.VarChar(255), dadosUsuario.nomeCompleto)
        .input('email', sql.VarChar(255), dadosUsuario.email)
        .input('senha', sql.VarChar(255), dadosUsuario.senha)
        .input('empresa', sql.VarChar(255), dadosUsuario.empresa)
        .input('permissao', sql.VarChar(50), dadosUsuario.permissao)
        .input('ativo', sql.Bit, dadosUsuario.ativo)
        .query('INSERT INTO usuarios (nome, email, senha_hash, empresa, permissao, ativo) VALUES (@nome, @email, @senha, @empresa, @permissao, @ativo)');
    return result.rowsAffected[0] > 0;
}