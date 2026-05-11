
import { initFormSubmissions } from './common/forms.js';
import { initLoginLoading, initLogoutConfirmation, showLoginError } from './common/auth.js';
import { initReportSearch, initTopSelect, initUserSearch } from './pages/home.js';
import { initFiscalizacaoPage } from './pages/fiscalizacao.js';

function initApp() {
    initFormSubmissions();
    showLoginError();
    initLoginLoading();
    initLogoutConfirmation();
    initReportSearch();
    initUserSearch();
    initTopSelect();
    initFiscalizacaoPage();
}

$(document).ready(initApp);
