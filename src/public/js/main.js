
import { initFormSubmissions } from './common/forms.js';
import { initLoginLoading, initLogoutConfirmation, showLoginError } from './common/auth.js';
import { initReportSearch, initUserSearch, initTopEStatusSelect } from './pages/home.js';
import { initFiscalizacaoPage } from './pages/fiscalizacao.js';

function initApp() {
    initFormSubmissions();
    showLoginError();
    initLoginLoading();
    initLogoutConfirmation();
    initReportSearch();
    initUserSearch();
    initTopEStatusSelect();
    initFiscalizacaoPage();
}

$(document).ready(initApp);
