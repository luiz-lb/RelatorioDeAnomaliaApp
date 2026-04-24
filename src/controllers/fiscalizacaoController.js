import * as fiscalizacaoService from '../services/fiscalizacaoService.js';

export async function validarIdRelatorioParams(req, res, next) {
    const idRelatorio = req.params.idRelatorio;
    const idRelatorioSessao = req.session.usuario.relatorio; // Obter o ID do relatório armazenado na sessão
    if (idRelatorio !== idRelatorioSessao) {
        return res.status(403).json({
            sucesso: false,
            mensagem: "ID do relatório inválido ou não corresponde ao relatório em edição."
        });
    }

    next();
}

export async function paginaHome(req, res, next) {
    try{
        const top = parseInt(req.query.top) || 10; // Obter o valor de "top" da query string, ou usar 10 como padrão
        const idUsuario = req.session.usuario.id_user; 
        const relatorio = await fiscalizacaoService.obterRelatoriosPorUsuario(idUsuario, top);

        const dados = {
            "botoes": [
                { "id": "btnNovoRelatorio", "nome": "Novo relatório", "link": "/fiscalizacao/novo" },
                { "id": "btnConfiguracoes", "nome": "Configurações", "link": "/adm" }
            ], 
            "relatorios": relatorio,
            "top": top
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
            redirectUrl: "/fiscalizacao",
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

        req.session.usuario.relatorio = idRelatorio; // Armazenar o ID do relatório na sessão para uso posterior

        res.status(200).render('pages/fiscalizacao', { resultadoHeader: dadosRelatorio.header, resultadoBody: dadosRelatorio.body, idRelatorio: idRelatorio });
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

export async function envioNaoConformidade(req, res, next) {
    try {
        const idRelatorio = req.params.idRelatorio;

        const resultado = await fiscalizacaoService.processarNaoConformidade(
            idRelatorio,
            req.file,
            req.body.descricao,
            req.session.usuario
        );

        return res.status(200).json({ sucesso: true, ...resultado });
    } catch (error) {
        next(error);
    }
}

export function editarNaoConformidade(req, res, next) {
    try {
        const idRelatorio = req.params.idRelatorio; // Obter o ID do relatório a partir dos parâmetros da rota
        const descricao = req.body.descricao;
        const idNaoConformidade = req.body.idNaoConformidade;

        console.log('Editando a não conformidade com ID:', idNaoConformidade, 'do relatório ID:', idRelatorio, 'com a nova descrição:', descricao);

        const resultado = fiscalizacaoService.editarNaoConformidade(idRelatorio, idNaoConformidade, descricao);

        console.log('Resultado da edição da não conformidade:', resultado);

        return res.status(200).json({ sucesso: true, mensagem: "Não conformidade editada com sucesso." });
    } catch (error) {
        console.error("Erro ao editar a não conformidade no banco:", error);
        return res.status(500).json({ sucesso: false, mensagem: "Erro interno ao editar a não conformidade no banco de dados." });
    }
}

export function excluirNaoConformidade(req, res, next) {
    try {
        const idRelatorio = req.params.idRelatorio; 
        const idNaoConformidade = req.body.idNaoConformidade; // Obter o ID da não conformidade a partir dos parâmetros da rota
        if(!idNaoConformidade) {
            return res.status(400).json({ sucesso: false, mensagem: "ID da não conformidade inválido." });
        }

        const resultado = fiscalizacaoService.excluirNaoConformidade(idRelatorio, idNaoConformidade);
        if (!resultado) {
            console.error("Erro ao excluir a não conformidade: Não conformidade não encontrada.");
            return res.status(404).json({ sucesso: false, mensagem: "Não conformidade não encontrada." });
        }
        return res.status(200).json({ sucesso: true, mensagem: "Não conformidade excluída com sucesso." });        
    } catch (error) {
        console.error("Erro ao excluir a não conformidade no banco:", error);
        return res.status(500).json({ sucesso: false, mensagem: "Erro interno ao excluir a não conformidade no banco de dados." });
    }
}

export async function pegarChecklistRelatorio(req, res, next) {
    try {
        const checklist = await fiscalizacaoService.obterChecklistRelatorio();
        if (!Array.isArray(checklist) || checklist.length === 0) {
            return res.status(404).json({
                sucesso: false,
                mensagem: "Checklist não encontrado para o relatório especificado."
            });
        }
        return res.status(200).json({ sucesso: true, checklist: checklist });

    } catch (error) {
        console.error("Erro ao obter o checklist do relatório:", error);
        return res.status(500).json({ sucesso: false, mensagem: "Erro interno ao obter o checklist do relatório." });
    }
}

export async function enviarRelatorio(req, res, next) {
    try {
        const idRelatorio = req.params.idRelatorio; // Obter o ID do relatório a partir dos parâmetros da rota
        const itensSelecionados = req.body.itensSelecionados;
        if (!Array.isArray(itensSelecionados) || itensSelecionados.length === 0) {
            return res.status(400).json({ sucesso: false, mensagem: "Nenhum item selecionado para envio." });
        }
        const resultado = await fiscalizacaoService.enviarRelatorio(idRelatorio, itensSelecionados);
        if (!resultado) {
            return res.status(500).json({ sucesso: false, mensagem: "Erro ao enviar o relatório." });
        }
        return res.status(200).json({ sucesso: true, mensagem: "Relatório enviado com sucesso." });
    } catch (error) {
        console.error("Erro ao enviar o relatório:", error);
        return res.status(500).json({ sucesso: false, mensagem: "Erro interno ao enviar o relatório." });
    }
}