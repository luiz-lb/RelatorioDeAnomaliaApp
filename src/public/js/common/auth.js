import { getThemeColors } from './theme.js';

export function showLoginError() {
    const loginErrorEl = document.getElementById('loginErrorMessage');
    if (!loginErrorEl || !loginErrorEl.value) {
        return;
    }

    const { background, text } = getThemeColors();

    Swal.fire({
        title: 'Erro no login',
        text: loginErrorEl.value,
        icon: 'error',
        background,
        color: text,
        confirmButtonText: 'Fechar',
        customClass: {
            popup: 'rounded-4',
            confirmButton: 'btn btn-accent rounded-pill px-4 shadow-sm'
        },
        buttonsStyling: false
    });
}

export function initLogoutConfirmation() {
    $(document).on('click', '#btnLogout', function (e) {
        e.preventDefault();
        const root = getComputedStyle(document.documentElement);
        const bg = (root.getPropertyValue('--bg-color') || '#fff').trim();
        const text = (root.getPropertyValue('--text-dark') || '#333').trim();

        Swal.fire({
            title: 'Confirmar saída',
            text: 'Deseja realmente sair do sistema?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Sair',
            cancelButtonText: 'Cancelar',
            background: bg,
            color: text,
            customClass: {
                popup: 'rounded-4 shadow p-3 p-md-4',
                title: 'fs-5 fw-bold mb-2',
                actions: 'd-flex flex-wrap gap-2 w-100 justify-content-center mt-4',
                confirmButton: 'btn btn-accent rounded-pill px-4 shadow-sm m-0',
                cancelButton: 'btn btn-light border rounded-pill px-4 text-secondary m-0'
            },
            buttonsStyling: false
        }).then((result) => {
            if (result.isConfirmed) {
                const form = document.getElementById('logoutForm');
                if (form) form.submit();
            }
        });
    });
}

export function initLoginLoading() {
    $(document).on('submit', '#formLogin', function () {
        try {
            const root = getComputedStyle(document.documentElement);
            const bg = (root.getPropertyValue('--bg-color') || '#fff').trim();
            const text = (root.getPropertyValue('--text-dark') || '#333').trim();
            const accent = (root.getPropertyValue('--accent') || '#BF3939').trim();

            Swal.fire({
                title: 'Entrando...',
                html: 'Carregando, por favor aguarde...',
                allowOutsideClick: false,
                didOpen: () => {
                    Swal.showLoading();
                },
                background: bg,
                color: text,
                showConfirmButton: false,
                willClose: () => {
                    // nada
                }
            });
            // permitir que o formulário seja enviado normalmente (navegação/redirect)
            return true;
        } catch (err) {
            console.error('Erro ao mostrar loading SweetAlert:', err);
            return false;
        }
    });
}