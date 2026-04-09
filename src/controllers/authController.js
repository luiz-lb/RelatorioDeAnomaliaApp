export function paginaLogin(req, res, next) {
    try {
        res.status(200).render('pages/index');
    } catch (error) {
        next(error);
    }
}