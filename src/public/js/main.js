
import { initFormSubmissions } from './common/forms.js';
import { initLoginLoading, initLogoutConfirmation, showLoginError } from './common/auth.js';
import { initReportSearch, initTopSelect } from './pages/home.js';
import { initFiscalizacaoPage } from './pages/fiscalizacao.js';

function initApp() {
    initFormSubmissions();
    showLoginError();
    initLoginLoading();
    initLogoutConfirmation();
    initReportSearch();
    initTopSelect();
    initFiscalizacaoPage();
}

$(document).ready(initApp);
