import * as syncService  from '../services/syncService.js';

export function paginaLogin(req, res, next) {
    syncService.paginaLogin(req, res, next);
}

export function paginaHome(req, res, next) {
    syncService.paginaHome(req, res, next);
}

export function paginaUsuarios(req, res, next) {
    syncService.paginaUsuarios(req, res, next);
}

export function editarUsuario(req, res, next) {
    syncService.editarUsuario(req, res, next);
}

export function novoUsuario(req, res, next) {
    syncService.novoUsuario(req, res, next);
}