import * as fiscalizacaoService from '../services/fiscalizacaoService.js';
import upload from '../config/configMulter.js';
import multer from 'multer';


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
    const idRelatorio = req.params.idRelatorio; // Obter o ID do relatório a partir do corpo da requisição
    const idRelatorioSessao = req.session.usuario.relatorio; // Obter o ID do relatório armazenado na sessão
    if (idRelatorio !== idRelatorioSessao) {
        return res.status(400).json({ sucesso: false, mensagem: "ID do relatório inválido ou não corresponde ao relatório em edição." });
    }

    const processarUpload = upload.single('arquivo');

    processarUpload(req, res, function (err) {
        if (err instanceof multer.MulterError) {
            // Erros nativos do Multer (Ex: Arquivo passou de 5MB)
            return res.status(400).json({ sucesso: false, mensagem: `Erro de tamanho: ${err.message}` });
        } else if (err) {
            // Erros que nós criamos no nosso fileFilter (Ex: "Formato inválido...")
            return res.status(400).json({ sucesso: false, mensagem: err.message });
        }
        // Validando envio
        if (!req.file) {
            return res.status(400).json({ sucesso: false, mensagem: "Você precisa selecionar uma imagem." });
        }

        try {
            // Salvar no banco de dados
            const resultado = fiscalizacaoService.salvarNaoConformidade(idRelatorio, req.file.path, req.body.descricao);
            // Ajustando caminho de URL para tirar o caminho "src/public" e deixar só "uploads/..." para o frontend conseguir acessar a imagem corretamente. 
            const caminhoDaImagem = req.file.path.replace(/\\/g, '/').split('src/public')[1]; // Isso é para garantir que funcione tanto em Windows quanto em Linux/Mac, tirando a parte "src/public" do caminho e deixando só "uploads/..."
            if (!resultado) {
                console.error("Erro ao salvar a não conformidade.");
                return res.status(500).json({ sucesso: false, mensagem: "Erro ao salvar a não conformidade." });
            }
            // dizendo caminho da imagem pro frontend, pra ele já mostrar a imagem nova sem precisar atualizar a página
            return res.status(200).json({ sucesso: true, caminhoDaImagem: caminhoDaImagem, descricao: req.body.descricao });
        } catch (error) {
            console.error("Erro ao salvar no banco:", error);
            return res.status(500).json({ sucesso: false, mensagem: "Erro interno ao salvar no banco de dados." });
        }
    })
}