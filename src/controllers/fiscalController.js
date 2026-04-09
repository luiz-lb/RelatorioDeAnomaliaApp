export function paginaHome(req, res, next) {
    try{
        const dados = {
            "botoes": [
                { "id": "btnNovoRelatorio", "nome": "Novo relatório", "link": "/fiscal/novo" },
                { "id": "btnConfiguracoes", "nome": "Configurações", "link": "/adm" }
            ], "relatorios": [
                { "id": 1, "nome": "Relatório 1" }//temporario, depois buscar do banco de dados
            ]
        };
        res.status(200).render('pages/home', dados);
    } catch (error) {
        next(error);
    }
}

export function paginaNovoRelatorio(req, res, next) {
    try {
        const dadosFormulario = {
            formTitle: "Novo Relatório",
            idForm: "novoRelatorioForm",
            formAction: "/fiscal",
            formMethod: "POST",
            btnText: "Próximo",
            redirectUrl: "/fiscal",//a resposta vai voltar para qual pagina vai fazer o redirecionamento
            inputs: [
                { id: "siteId", label: "Site ID", name: "siteId", type: "text", required: true, placeholder: "Digite o Site ID" },
                { id: "cep", label: "CEP", name: "cep", type: "text", placeholder: "Digite o CEP" },
                { id: "municipio", label: "Município", name: "municipio", type: "text", required: true, placeholder: "Digite o município" },
                { id: "uf", label: "UF", name: "uf", type: "text", required: true, placeholder: "Digite a UF" },
                { id: "endereco", label: "Endereço", name: "endereco", type: "text", required: true, placeholder: "Digite o endereço" },
                { id: "cadeado", label: "Tipo do cadeado", name: "cadeado", type: "text", required: true, placeholder: "Digite o tipo do cadeado do local" },
            ]
        }
        res.status(200).render('pages/form', dadosFormulario);
    } catch (error) {
        next(error);
    }
}

export function paginaEditarRelatorio(req, res, next) {
    try {

    } catch (error) {
        next(error);
    }
}