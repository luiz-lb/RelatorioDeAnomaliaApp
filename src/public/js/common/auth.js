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
        const root = getComputedStyle(document.documentElement);
        const bg = (root.getPropertyValue('--bg-color') || '#fff').trim();
        const text = (root.getPropertyValue('--text-dark') || '#333').trim();
        const accent = (root.getPropertyValue('--accent') || '#BF3939').trim();

        Swal.fire({
            title: 'Confirmar saída',
            text: 'Deseja realmente sair do sistema?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Sair',
            cancelButtonText: 'Cancelar',
            background: bg,
            color: text,
            confirmButtonColor: accent
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