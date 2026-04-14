import bcrypt from 'bcrypt';
import * as userModel from '../models/userModel.js';

export async function autenticar(email, senha) {
    const usuario = await userModel.getUserByEmail(email);

    if (!usuario) {
        return { sucesso: false, mensagem: 'Usuário ou senha inválidos.' };
    }

    if (!usuario.ativo) {
        return { sucesso: false, mensagem: 'Usuário inativo. Contate o administrador.' };
    }

    const senhaValida = await bcrypt.compare(senha, usuario.senha_hash);

    if (!senhaValida) {
        return { sucesso: false, mensagem: 'Usuário ou senha inválidos.' };
    }

    return {
        sucesso: true,
        permissao: usuario.permissao,
        id: usuario.id
    };
}