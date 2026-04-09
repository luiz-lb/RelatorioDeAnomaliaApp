import * as syncModel from '../models/syncModel.js';

export async function getUsers(dadosFuncionarios) {
    const usuarios = await syncModel.getAllUser();

    const usuariosFormatados = usuarios.map(usuario => ({
        ...usuario, // Mantém as propriedades originais do usuário
        ativo: usuario.ativo === true ? "Sim" : "Não",
        created_at: new Date(usuario.created_at).toLocaleDateString('pt-BR'),
    }));
    
    return usuariosFormatados;
}

export async function getUser(id) {
    const usuario = await syncModel.getUserById(id);
    if (!usuario) {
        throw new Error("Usuário não encontrado");
    }

    return usuario;
}

export async function updateUser(idUsuario, dadosUsuario) {
    const resultado = await syncModel.atualizarUsuario(idUsuario, dadosUsuario);
    return resultado;
}

export async function createdUser(dadosUsuario) {
    const resultado = await syncModel.criarUsuario(dadosUsuario);
    return resultado;
}

