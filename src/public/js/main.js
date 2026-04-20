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

    //subindo a não conformidade com AJAX e mostrando na tela sem precisar dar refresh
    $('#formUpload').submit(async function (e) {
        // Pegando foto e descrição que o usuario subiu
        e.preventDefault();
        // Evitar múltiplos envios: desabilitar botão enquanto ocorre o upload
        if (this.dataset.uploadInProgress === 'true') return;
        this.dataset.uploadInProgress = 'true';
        const submitButtons = $(this).find('button[type=submit], input[type=submit]');
        submitButtons.prop('disabled', true);

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
                const conformidadeDiv = $(`
                                        <div id="div-${dados.idNaoConformidade}" class="col-12 col-sm-6 col-lg-4">
                                            <div class="card h-100 shadow-sm">
                                                <img src="${dados.caminhoDaImagem}" alt="Imagem da não conformidade" class="card-img-top" style="height: 200px; object-fit: cover;">
                                                <div class="card-body">
                                                    <p id="descricao-${dados.idNaoConformidade}" class="card-text">${dados.descricao}</p>
                                                    <div class="d-flex gap-2">
                                                        <button id="editar-${dados.idNaoConformidade}" data-relatorio="${idRelatorio}" class="btn btn-accent btn-sm btn-editar flex-grow-1">Editar</button>
                                                        <button id="excluir-${dados.idNaoConformidade}" data-relatorio="${idRelatorio}" class="btn btn-danger btn-sm btn-excluir flex-grow-1">Excluir</button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>`);
                $('#galeria').append(conformidadeDiv);

                // Limpa o input
                this.reset();
                // resetar estado do botão
                this.dataset.uploadInProgress = 'false';
                submitButtons.prop('disabled', false);
            } else {
                alert('Erro ao subir a imagem: ' + dados.mensagem);
                this.dataset.uploadInProgress = 'false';
                submitButtons.prop('disabled', false);
            }
        } catch (erro) {
            console.error("Erro na requisição:", erro);
            alert("Ocorreu um erro de conexão com o servidor.");
            this.dataset.uploadInProgress = 'false';
            submitButtons.prop('disabled', false);
        }
    });

    // Editar não conformidade
    $(document).on('click', '.btn-editar', function () {
        const id = this.id.split('-')[1]; // extrai o ID do botão (formato: editar-123)
        const idRelatorio = $(`#editar-${id}`).data('relatorio');
        // Mostrando switch alert para editar apenas a descrição. Depois usando ajax para enviar a nova descrição pro backend e atualizar na tela sem precisar dar refresh
        Swal.fire({
            title: 'Editar não conformidade',
            input: 'text',
            inputLabel: 'Descrição',
            inputValue: $(`#descricao-${id}`).text(),
            showCancelButton: true,
            confirmButtonText: 'Salvar',
            cancelButtonText: 'Cancelar',
            preConfirm: (novaDescricao) => {
                if (!novaDescricao) {
                    Swal.showValidationMessage('A descrição não pode estar vazia');
                }
            }
        })
        // Depois que o usuário clicar em salvar, enviar a nova descrição pro backend e atualizar na tela sem precisar dar refresh
        .then(async (result) => {
            if (result.isConfirmed) {
                const novaDescricao = result.value;
                // Enviar a nova descrição para o backend usando AJAX
                try {
                    const resposta = await fetch(`/fiscalizacao/edit/nao-conformidade/${idRelatorio}`, {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ descricao: novaDescricao, idNaoConformidade: id })
                    });

                    const dados = await resposta.json();

                    if (dados.sucesso) {
                        // Atualizar a descrição na tela sem precisar dar refresh
                        $(`#descricao-${id}`).text(novaDescricao);
                        Swal.fire({
                            title: 'Sucesso',
                            text: 'Descrição atualizada com sucesso!',
                            icon: 'success',
                            confirmButtonText: 'Fechar'
                        });
                    } else {
                        Swal.fire({
                            title: 'Erro',
                            text: dados.mensagem,
                            icon: 'error',
                            confirmButtonText: 'Fechar'
                        });
                    }
                } catch (erro) {
                    console.error("Erro na requisição:", erro);
                    Swal.fire({
                        title: 'Erro',
                        text: 'Ocorreu um erro de conexão com o servidor.',
                        icon: 'error',
                        confirmButtonText: 'Fechar'
                    });
                }
            }
        });
    });

    $(document).on('click', '.btn-excluir', function () {
        const id = this.id.split('-')[1]; // extrai o ID do botão (formato: excluir-123)
        const idRelatorio = $(`#excluir-${id}`).data('relatorio');
        Swal.fire({
            title: 'Excluir não conformidade',
            text: 'Tem certeza que deseja excluir esta não conformidade?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Sim',
            cancelButtonText: 'Cancelar',
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    const resposta = await fetch(`/fiscalizacao/edit/nao-conformidade/${idRelatorio}`, {
                        method: 'DELETE',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ idNaoConformidade: id })
                    });

                    const dados = await resposta.json();

                    if (dados.sucesso) {
                        // Remover a não conformidade da tela sem precisar dar refresh
                        $(`#div-${id}`).closest('.col-12').remove();
                        Swal.fire({
                            title: 'Sucesso',
                            text: 'Não conformidade excluída com sucesso!',
                            icon: 'success',
                            confirmButtonText: 'Fechar'
                        });
                    }
                    else {
                        Swal.fire({
                            title: 'Erro',
                            text: dados.mensagem,
                            icon: 'error',
                            confirmButtonText: 'Fechar'
                        });
                    }
                } catch (erro) {
                    console.error("Erro na requisição:", erro);
                    Swal.fire({
                        title: 'Erro',
                        text: 'Ocorreu um erro de conexão com o servidor.',
                        icon: 'error',
                        confirmButtonText: 'Fechar'
                    });
                }
            }
        });
    });
});

$(document).ready(function () {
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

