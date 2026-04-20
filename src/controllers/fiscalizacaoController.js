import * as fiscalizacaoService from '../services/fiscalizacaoService.js';


export function paginaHome(req, res, next) {
    try{
        const dados = {
            "botoes": [
                { "id": "btnNovoRelatorio", "nome": "Novo relatório", "link": "/fiscalizacao/novo" },
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
            formAction: "/fiscalizacao/novo",
            formMethod: "POST",
            btnText: "Próximo",//a resposta vai voltar para qual pagina vai fazer o redirecionamento
            inputs: [
                { id: "siteId", label: "Site ID", name: "siteId", type: "text", required: true, placeholder: "Digite o Site ID" },
                { id: "alturaTorre", label: "Altura da Torre", name: "alturaTorre", type: "text", required: true, placeholder: "Digite a altura da torre" },
                { id: "cep", label: "CEP", name: "cep", type: "text", placeholder: "Digite o CEP" },
                { id: "municipio", label: "Município", name: "municipio", type: "text", required: true, placeholder: "Digite o município" },
                { id: "uf", label: "UF", name: "uf", type: "text", required: true, placeholder: "Digite a UF" },
                { id: "endereco", label: "Endereço", name: "endereco", type: "text", required: true, placeholder: "Digite o endereço" },
                { id: "cadeado", label: "Tipo do cadeado", name: "cadeado", type: "text", required: true, placeholder: "Digite o tipo do cadeado do local" },
                { id: "tipoEstrutura", label: "Tipo da Estrutura", name: "tipoEstrutura", type: "text", required: true, placeholder: "Digite o tipo da estrutura" }
            ]
        }
        res.status(200).render('pages/form', dadosFormulario);
    } catch (error) {
        next(error);
    }
}

export async function paginaEditarRelatorio(req, res, next) {
    try {
        const idRelatorio = req.params.id;
        const idUsuario = req.session.usuario.id_user;
        const permissaoUsuario = req.session.usuario.permissao;
        const dadosRelatorio = await fiscalizacaoService.obterRelatorioPorId(idRelatorio, idUsuario, permissaoUsuario);

        console.log('Relatório obtido para edição:');

        res.status(200).render('pages/fiscalizacao', { resultadoHeader: dadosRelatorio.header, resultadoBody: dadosRelatorio.body });
    } catch (error) {
        next(error);
    }
}

export async function salvarNovoRelatorio(req, res, next) {
    try {
        const { siteId, alturaTorre, cep, municipio, uf, endereco, cadeado, tipoEstrutura } = req.body;
        const usuarioId = req.session.usuario.id_user; // Exemplo de como obter o ID do usuário logado
        const status = "Rascunho"; // Status inicial do relatório

        const resultado = await fiscalizacaoService.criarRelatorio({ siteId, alturaTorre, cep, municipio, uf, endereco, cadeado, tipoEstrutura, usuarioId, status });
        console.log('Relatório criado com ID:', resultado);
        if (resultado) {
            console.log('Avisando pro usuário que o relatório foi criado com sucesso, ID:', resultado);
            res.status(201).json({ message: "Relatório criado com sucesso", relatorioId: resultado, redirectUrl: `/fiscalizacao/edit/${resultado}` });
        } else {            
            res.status(500).json({ message: "Erro ao criar o relatório" });
        }
    } catch (error) {
        next(error);
    }
}