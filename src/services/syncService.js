import * as syncModel from '../models/syncModel.js';

export function paginaLogin(req, res, next) {
    try {
        res.status(200).render('pages/index');
    } catch (erro) {
        next(erro);
    }
}

export function paginaHome(req, res, next) {
    try {
        const dados = {
            "botoes": [
                { "id": "btnNovoRelatorio", "nome": "Novo relatório" },
                { "id": "btnConfiguracoes", "nome": "Configurações" }
            ], "relatorios": [
                { "id": 1, "nome": "Relatório 1" }
            ]
        };
        res.status(200).render('pages/home', dados);
    } catch (erro) {
        next(erro);
    }
}

export async function paginaUsuarios(req, res, next) {
    try {
        const usuarios = await syncModel.getAllUser();

        const usuariosFormatados = usuarios.map(usuario => ({
            ...usuario, // Mantém as propriedades originais do usuário
            ativo: usuario.ativo === true ? "Sim" : "Não",
            created_at: new Date(usuario.created_at).toLocaleDateString('pt-BR'),
        }));

        const dadosFuncionarios = {
            "tableidheader": "tabela-usuarios",
            "tableid": "corpo-tabela-usuarios",
            "thead": [
                "Id",
                "Nome Completo",
                "Email",
                "Empresa",
                "Criado em",
                "Permissão",
                "Ativo",
                "Ações"
            ],
            "tbody": usuariosFormatados
        }
        res.status(200).render('pages/usuarios', dadosFuncionarios);
    } catch (erro) {
        next(erro);
    }
}

export async function editarUsuario(req, res, next) {
    try {
        if(!req.params.id) {
            throw new Error("ID do usuário não fornecido");
        }
        const idUsuario = req.params.id;
        const usuario = await syncModel.getUserById(idUsuario);
        if (!usuario) {
            throw new Error("Usuário não encontrado");
        }

        const dadosFormulario = {
            formTitle: "Editar Usuário",
            idForm: "editarUsuarioForm",
            formAction: `/adm/user/${idUsuario}`,
            formMethod: "PUT",
            redirectUrl: "/adm",
            inputs: [
                { id: "nomeCompleto", label: "Nome Completo", name: "nomeCompleto", type: "text", required: true, value: usuario.nome, placeholder: "Digite o nome completo" },
                { id: "email", label: "Email", name: "email", type: "email", required: true, value: usuario.email, placeholder: "Digite o email" },
                { id: "senha", label: "Nova senha(Digite apenas se quiser alterar)", name: "senha", type: "password", placeholder: "Digite a senha" },
                { id: "empresa", label: "Empresa", name: "empresa", type: "text", required: true, value: usuario.empresa, placeholder: "Digite a empresa" },
                { id: "permissao", label: "Permissão", name: "permissao", type: "select", required: true, value: usuario.permissao, options: [
                    { value: "Everest", label: "Everest" },
                    { value: "Terceiro", label: "Terceiro" }
                ] },
                { id: "ativo", label: "Ativo", name: "ativo", type: "select", required: true, value: usuario.ativo, options: [
                    { value: "1", label: "Sim" },
                    { value: "0", label: "Não" }
                ] }
            ]
        }
        res.status(200).render('pages/form', dadosFormulario);
    } 
    catch (erro) {
        next(erro);
    }
}

export function novoUsuario(req, res, next) {
    try {
        const dadosFormulario = {
            formTitle: "Novo Usuário",
            idForm:"novoUsuarioForm",
            formAction: "/adm/user",
            formMethod: "POST",
            redirectUrl: "/adm",
            inputs: [
                { id: "nomeCompleto", label: "Nome Completo", name: "nomeCompleto", type: "text", required: true, placeholder: "Digite o nome completo" },
                { id: "email", label: "Email", name: "email", type: "email", required: true, placeholder: "Digite o email" },
                { id: "senha", label: "Senha", name: "senha", type: "password", placeholder: "Digite a senha" },
                { id: "empresa", label: "Empresa", name: "empresa", type: "text", required: true, placeholder: "Digite a empresa" },
                { id: "permissao", label: "Permissão", name: "permissao", type: "select", required: true, value: "Terceiro", options: [
                    { value: "Everest", label: "Everest" },
                    { value: "Terceiro", label: "Terceiro" }
                ] },
                { id: "ativo", label: "Ativo", name: "ativo", type: "select", required: true, options: [
                    { value: "1", label: "Sim" },
                    { value: "0", label: "Não" }
                ] }
            ]
        }
        res.status(200).render('pages/form', dadosFormulario);
    } 
    catch (erro) {
        next(erro);
    }
}

export async function atualizarUsuario(req, res, next) {
    try {
        const dadosUsuario = req.body;
        const resultado = await syncModel.atualizarUsuario(req.params.id, dadosUsuario);
        if (resultado) {
            res.status(200).json({ message: "Usuário atualizado com sucesso" });
        } else {
            res.status(404).json({ message: "Usuário não encontrado" });
        }
    } catch (erro) {
        next(erro);
    }
}

export async function criarUsuario(req, res, next) {
    try {
        const dadosUsuario = req.body;
        const resultado = await syncModel.criarUsuario(dadosUsuario);
        if (resultado) {
            res.status(201).json({ message: "Usuário criado com sucesso" });
        } else {
            res.status(400).json({ message: "Erro ao criar usuário" });
        }
    } catch (erro) {
        next(erro);
    }
}

