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

export function paginaUsuarios(req, res, next) {
    try {
        const dadosFuncionarios = {
            "tableidheader": "tabela-usuarios",
            "tableid": "corpo-tabela-usuarios",
            "thead": [
                "Id",
                "Nome Completo ",
                "Email",
                "Empresa",
                "Criado em",
                "Permissão",
                "Ativo",
                "Ações"
            ],
            "tbody": [
                {
                    "Id": "2023001",
                    "Nome": "Ana Souza",
                    "Email": "ana.souza@example.com",
                    "Empresa": "Everest",
                    "Criado em": "2023-01-01",
                    "Permissão": "Everest",
                    "Ativo": "Sim"
                },
                {
                    "Id": "2023011",
                    "Nome": "João Silva",
                    "Email": "joao.silva@example.com",
                    "Empresa": "KanBanize Fiscalização",
                    "Criado em": "2023-01-02",
                    "Permissão": "Fiscal",
                    "Ativo": "Sim"
                }
            ]
        }
        res.status(200).render('pages/usuarios', dadosFuncionarios);
    } catch (erro) {
        next(erro);
    }
}

export function editarUsuario(req, res, next) {
    try {
        //if(!req.params.id) {
          //  throw new Error("ID do usuário não fornecido");
        //}
        //const idUsuario = req.params.id;

        const dadosFormulario = {
            formTitle: "Ferramentas",
            formAction: "/tabletteste/teste",
            formMethod: "POST",
            inputs: [
                { id: "nomeCompleto", label: "Nome Completo", name: "nomeCompleto", type: "text", required: true, class: "" },
                { id: "email", label: "Email", name: "email", type: "email", required: true },
                { id: "teste", label: "Teste", name: "teste", type: "text", required: true },
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
            formAction: "/adm/new",
            formMethod: "POST",
            inputs: [
                { id: "nomeCompleto", label: "Nome Completo", name: "nomeCompleto", type: "text", required: true, class: "" },
                { id: "email", label: "Email", name: "email", type: "email", required: true },
                { id: "teste", label: "Teste", name: "teste", type: "text", required: true },
            ]
        }
        res.status(200).render('pages/form', dadosFormulario);
    } 
    catch (erro) {
        next(erro);
    }
}