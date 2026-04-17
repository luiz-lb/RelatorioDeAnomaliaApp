async function enviarFormulario(idForm, method, formData, redirectUrl) {
    // Fazer requisão via HTTP usando Axios do FormData serializado, para a URL definida no atributo action do formulário
    try {
        const response = await axios({
            method: method,
            url: $(`#${idForm}`).attr('action'),
            data: formData,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });
        alert(response.data.message);
        if (redirectUrl !== '' ) {
            window.location.href = redirectUrl;
        } else if(response.data.redirectUrl) {
            window.location.href = response.data.redirectUrl;
        }
        else {
            return response.data;
        }
    } catch (error) {
        alert(error.response?.data?.message || "Ocorreu um erro ao enviar o formulário.");
        console.error(error);
    }
}

$(document).ready(function () {
    $('.btnSend').click(function (e) {
        // Evitar o comportamento padrão do botão (submissão do formulário)
        e.preventDefault();
        const idForm = $(this).data('form-id');
        const method = $(this).data('method');
        const redirectUrl = $(this).data('redirect');
        const formData = $(`#${idForm}`).serialize();

        enviarFormulario(idForm, method, formData, redirectUrl ? redirectUrl : '');
    });
    // Mostrar erro de login com SweetAlert, usando as variáveis CSS da paleta
    const loginErrorEl = document.getElementById('loginErrorMessage');
    if (loginErrorEl && loginErrorEl.value) {
        const msg = loginErrorEl.value;
        const root = getComputedStyle(document.documentElement);
        const bg = (root.getPropertyValue('--bg-color') || '#fff').trim();
        const text = (root.getPropertyValue('--text-dark') || '#333').trim();
        const accent = (root.getPropertyValue('--accent') || '#BF3939').trim();

        Swal.fire({
            title: 'Erro no login',
            text: msg,
            icon: 'error',
            background: bg,
            color: text,
            confirmButtonColor: accent,
            confirmButtonText: 'Fechar'
        });
    }

    $('#formUpload').submit(async function (e) {
        // Pegando foto e descrição que o usuario subiu
        e.preventDefault();

        // Preciso enviar tambem a descricao da nao conformidade, entao vou usar FormData ao invés de serializar o formulário
        const arquivo = $('#arquivoInput')[0].files[0];
        const descricao = $('#descricao').val();
        const formData = new FormData();
        formData.append('arquivo', arquivo);
        formData.append('descricao', descricao);
        const idRelatorio = $(this).data('relatorio');

        // Enviando resposta pro backend
        try {
            const resposta = await fetch(`/fiscalizacao/edit/nao-conformidade/${idRelatorio}`, {
                method: 'POST',
                body: formData
            });

            const dados = await resposta.json();

            if (dados.sucesso) {
                // Se editar aqui, editar tambem no ejs de fiscalizacao
                const novaImagem = $(`<img src="${dados.caminhoDaImagem}">`);
                const Descricao = $(`<p>${dados.descricao}</p>`);
                $('#galeria').append(novaImagem);
                $('#galeria').append(Descricao);

                // Limpa o input
                this.reset();
            } else {
                alert('Erro ao subir a imagem: ' + dados.mensagem);
            }
        } catch (erro) {
            console.error("Erro na requisição:", erro);
            alert("Ocorreu um erro de conexão com o servidor.");
        }
    });
});

// Confirmação de logout com SweetAlert
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

// Mostrar SweetAlert de carregamento ao submeter o formulário de login
$(document).on('submit', '#formLogin', function (e) {
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
        return true;
    }
});

// Busca de relatórios (filtro client-side)
(function () {
    function normalize(text) {
        return (text || '').toString().toLowerCase();
    }

    function filterReports(query) {
        const rows = document.querySelectorAll('#tabela-corpo tr');
        const q = normalize(query);
        rows.forEach(row => {
            const target = normalize(row.getAttribute('data-search'));
            if (!q || target.indexOf(q) !== -1) {
                row.style.display = '';
            } else {
                row.style.display = 'none';
            }
        });
    }

    // debounce — evita chamadas repetidas rápidas
    function debounce(fn, wait) {
        let t;
        return function (...args) {
            clearTimeout(t);
            t = setTimeout(() => fn.apply(this, args), wait);
        };
    }

    const searchInput = document.getElementById('reportSearch');
    const clearBtn = document.getElementById('clearSearch');
    const mobileSearchInput = document.getElementById('reportSearchMobile');
    const clearBtnMobile = document.getElementById('clearSearchMobile');
    const toggleMobileBtn = document.getElementById('toggleMobileSearch');
    const mobileSearchContainer = document.getElementById('mobileSearchContainer');

    const debouncedHandler = debounce(function (value) {
        filterReports(value);
    }, 180);

    if (searchInput) {
        searchInput.addEventListener('input', function (e) { debouncedHandler(e.target.value); });
    }
    if (mobileSearchInput) {
        mobileSearchInput.addEventListener('input', function (e) { debouncedHandler(e.target.value); });
    }

    if (clearBtn) {
        clearBtn.addEventListener('click', function () {
            if (searchInput) searchInput.value = '';
            filterReports('');
            if (searchInput) searchInput.focus();
        });
    }
    if (clearBtnMobile) {
        clearBtnMobile.addEventListener('click', function () {
            if (mobileSearchInput) mobileSearchInput.value = '';
            filterReports('');
            if (mobileSearchInput) mobileSearchInput.focus();
        });
    }

    if (toggleMobileBtn && mobileSearchContainer) {
        toggleMobileBtn.addEventListener('click', function () {
            mobileSearchContainer.classList.toggle('d-none');
            const isVisible = !mobileSearchContainer.classList.contains('d-none');
            if (isVisible) {
                // focar o input móvel quando aberto
                setTimeout(() => { if (mobileSearchInput) mobileSearchInput.focus(); }, 60);
            }
        });
    }
})();

function testesweetalert() {
    Swal.fire({

        title: 'Bootstrap 5 theme',
        theme: 'bootstrap-5',
        title: 'Teste de SweetAlert',
        text: 'Este é um teste para verificar se o SweetAlert está funcionando corretamente.',
        icon: 'success',
        confirmButtonText: 'OK'
    });
}

$("#topSelect").on("change", function() {
    const top = $(this).val();
    // Lógica para atualizar a lista de relatórios com o novo valor de "top"
    window.location.href = `/fiscalizacao?top=${top}`;
});

