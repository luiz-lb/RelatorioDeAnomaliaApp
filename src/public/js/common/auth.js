import { getThemeColors } from './theme.js';

export function showLoginError() {
    const loginErrorEl = document.getElementById('loginErrorMessage');
    if (!loginErrorEl || !loginErrorEl.value) {
        return;
    }

    const { background, text, accent } = getThemeColors();

    Swal.fire({
        title: 'Erro no login',
        text: loginErrorEl.value,
        icon: 'error',
        background,
        color: text,
        confirmButtonColor: accent,
        confirmButtonText: 'Fechar'
    });
}

export function initLogoutConfirmation() {
    $(document).on('click', '#btnLogout', function (e) {
        e.preventDefault();

        const { background, text, accent } = getThemeColors();

        Swal.fire({
            title: 'Confirmar saída',
            text: 'Deseja realmente sair do sistema?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Sair',
            cancelButtonText: 'Cancelar',
            background,
            color: text,
            confirmButtonColor: accent
        }).then((result) => {
            if (result.isConfirmed) {
                const form = document.getElementById('logoutForm');
                if (form) {
                    form.submit();
                }
            }
        });
    });
}

export function initLoginLoading() {
    $(document).on('submit', '#formLogin', function () {
        try {
            const { background, text } = getThemeColors();

            Swal.fire({
                title: 'Entrando...',
                html: 'Carregando, por favor aguarde...',
                allowOutsideClick: false,
                didOpen: () => {
                    Swal.showLoading();
                },
                background,
                color: text,
                showConfirmButton: false
            });
        } catch (err) {
            console.error('Erro ao mostrar loading SweetAlert:', err);
        }

        return true;
    });
}
