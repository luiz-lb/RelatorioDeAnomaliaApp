import * as syncService  from '../services/syncService.js';

export function paginaLogin(req, res, next) {
    syncService.paginaLogin(req, res, next);
}

export function login(req, res, next) {
    syncService.login(req, res, next);
}

export function paginaHome(req, res, next) {
    syncService.paginaHome(req, res, next);
}

export function paginaUsuarios(req, res, next) {
    syncService.paginaUsuarios(req, res, next);
}

