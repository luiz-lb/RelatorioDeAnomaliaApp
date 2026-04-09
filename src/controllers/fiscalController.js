export function paginaHome(req, res, next) {
    try{
        const dados = {
            "botoes": [
                { "id": "btnNovoRelatorio", "nome": "Novo relatório" },
                { "id": "btnConfiguracoes", "nome": "Configurações" }
            ], "relatorios": [
                { "id": 1, "nome": "Relatório 1" }//temporario, depois buscar do banco de dados
            ]
        };
        res.status(200).render('pages/home', dados);
    } catch (error) {
        next(error);
    }
}