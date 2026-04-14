import * as authService from '../services/authService.js';

export function paginaLogin(req, res, next) {
    try {
        res.status(200).render('pages/index');
    } catch (error) {
        next(error);
    }
}

export async function login(req, res, next) {
    try {
        const { username, password } = req.body;

        const resultado = await authService.autenticar(username, password);

        if (!resultado.sucesso) {
            return res.status(401).render('pages/index', { erroLogin : resultado.mensagem });
        }

        // Salva o usuário na sessão
        req.session.usuario = {
            id_user: resultado.id,
            permissao: resultado.permissao
        };

        if (resultado.permissao === 'Terceiro') {
            return res.redirect('/fiscalizacao');
        }

        if (resultado.permissao === 'Everest') {
            return res.redirect('/fiscalizacao');
        }

        return res.status(403).render('pages/index', { erroLogin : 'Permissão não reconhecida.' });

    } catch (error) {
        next(error);
    }
}

export function logout(req, res, next) {
    try {
        req.session.destroy(() => {
            res.redirect('/');
        });
    } catch (error) {
        next(error);
    }
}

// Middleware: apenas Everest
export function apenasEverest(req, res, next) {
    if (!req.session.usuario) {
        return res.redirect('/');
    }
    if (req.session.usuario.permissao !== 'Everest') {
        return res.status(403).render('pages/erro', { msg: 'Acesso negado.' });
    }
    next();
}

// Middleware: Terceiro
export function Terceiro(req, res, next) {
    if (!req.session.usuario) {
        return res.redirect('/');
    }
    if (req.session.usuario.permissao !== 'Terceiro' && req.session.usuario.permissao !== 'Everest') {
        return res.status(403).render('pages/erro', { msg: 'Acesso negado.' });
    }
    next();
}