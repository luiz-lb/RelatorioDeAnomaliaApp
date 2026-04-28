async function enviarFormulario(idForm, method, formData, redirectUrl) {
    const root = getComputedStyle(document.documentElement);
    const bg = (root.getPropertyValue('--bg-color') || '#fff').trim();
    const text = (root.getPropertyValue('--text-dark') || '#333').trim();

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

        Swal.fire({
            title: 'Sucesso',
            text: response.data.message,
            icon: 'success',
            background: bg,
            color: text,
            confirmButtonText: 'OK',
            customClass: {
                popup: 'rounded-4 shadow p-3 p-md-4',
                title: 'fs-5 fw-bold mb-2',
                confirmButton: 'btn btn-accent rounded-pill px-4 shadow-sm m-0'
            },
            buttonsStyling: false
        }).then(() => {
            if (redirectUrl !== '' ) {
                window.location.href = redirectUrl;
            } else if(response.data.redirectUrl) {
                window.location.href = response.data.redirectUrl;
            }
        });

        if (!redirectUrl && !response.data.redirectUrl) {
            return response.data;
        }
    } catch (error) {
        Swal.fire({
            title: 'Erro',
            text: error.response?.data?.message || "Ocorreu um erro ao enviar o formulário.",
            icon: 'error',
            background: bg,
            color: text,
            confirmButtonText: 'Fechar',
            customClass: {
                popup: 'rounded-4 shadow p-3 p-md-4',
                title: 'fs-5 fw-bold mb-2',
                confirmButton: 'btn btn-accent rounded-pill px-4 shadow-sm m-0'
            },
            buttonsStyling: false
        });
        console.error(error);
    }
}

$(document).ready(function () {
    $('.btnSend').click(function (e) {
        // Evitar o comportamento padrão do botão (submissão do formulário)
        e.preventDefault();
        const idForm = $(this).data('form-id');
        const formElement = document.getElementById(idForm);

        // Verifica se os campos obrigatórios foram preenchidos
        if (formElement && !formElement.checkValidity()) {
            formElement.classList.add('was-validated'); // Ativa o feedback visual em vermelho nos campos
            
            const root = getComputedStyle(document.documentElement);
            const bg = (root.getPropertyValue('--bg-color') || '#fff').trim();
            const text = (root.getPropertyValue('--text-dark') || '#333').trim();
            
            Swal.fire({
                title: 'Atenção',
                text: 'Ocorreu um erro ao enviar o formulário. Preencha todos os campos obrigatórios.',
                icon: 'warning',
                background: bg,
                color: text,
                confirmButtonText: 'Fechar',
                customClass: {
                    popup: 'rounded-4 shadow p-3 p-md-4',
                    title: 'fs-5 fw-bold mb-2',
                    confirmButton: 'btn btn-accent rounded-pill px-4 shadow-sm m-0'
                },
                buttonsStyling: false
            });
            return; // Interrompe a função aqui
        }

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
                // Remove a mensagem de empty state se for a primeira imagem subida
                $('#empty-state-galeria').remove();

                // Estilização atualizada para combinar com os cards do EJS
                const conformidadeDiv = $(`
                    <div id="div-${dados.idNaoConformidade}" class="col-12 col-sm-6 col-lg-4">
                        <div class="card h-100 shadow-sm border-0 rounded-4">
                            <img src="${dados.caminhoDaImagem}" alt="Imagem da não conformidade" class="card-img-top rounded-top-4 img-nao-conformidade">
                            <div class="card-body d-flex flex-column">
                                <p id="descricao-${dados.idNaoConformidade}" class="card-text text-muted small flex-grow-1">${dados.descricao}</p>
                                <div class="d-flex gap-2 mt-3">
                                    <button id="editar-${dados.idNaoConformidade}" data-relatorio="${idRelatorio}" class="btn btn-sm btn-outline-secondary rounded-pill px-3 btn-editar flex-grow-1">Editar</button>
                                    <button id="excluir-${dados.idNaoConformidade}" data-relatorio="${idRelatorio}" class="btn btn-sm btn-outline-danger rounded-pill px-3 btn-excluir flex-grow-1">Excluir</button>
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
        
        const root = getComputedStyle(document.documentElement);
        const bg = (root.getPropertyValue('--bg-color') || '#fff').trim();
        const text = (root.getPropertyValue('--text-dark') || '#333').trim();

        // Mostrando switch alert para editar apenas a descrição. Depois usando ajax para enviar a nova descrição pro backend e atualizar na tela sem precisar dar refresh
        Swal.fire({
            title: 'Editar Não Conformidade',
            input: 'textarea',
            inputLabel: 'Altere a descrição da imagem:',
            inputValue: $(`#descricao-${id}`).text().trim(),
            showCancelButton: true,
            confirmButtonText: 'Salvar',
            cancelButtonText: 'Cancelar',
            background: bg,
            color: text,
            customClass: {
                popup: 'rounded-4 shadow p-3 p-md-4',
                title: 'fs-5 fw-bold mb-2',
                inputLabel: 'text-start w-100 d-block text-muted small mb-2',
                input: 'form-control shadow-sm m-0 w-100 mw-100',
                actions: 'd-flex flex-wrap gap-2 w-100 justify-content-center mt-4',
                confirmButton: 'btn btn-accent rounded-pill px-4 shadow-sm m-0',
                cancelButton: 'btn btn-light border rounded-pill px-4 text-secondary m-0'
            },
            buttonsStyling: false,
            preConfirm: (novaDescricao) => {
                if (!novaDescricao || novaDescricao.trim() === '') {
                    Swal.showValidationMessage('A descrição não pode estar vazia');
                }
                return novaDescricao.trim();
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
                            background: bg,
                            color: text,
                            confirmButtonText: 'Fechar',
                            customClass: {
                                popup: 'rounded-4',
                                confirmButton: 'btn btn-accent rounded-pill px-4 shadow-sm'
                            },
                            buttonsStyling: false
                        });
                    } else {
                        Swal.fire({
                            title: 'Erro',
                            text: dados.mensagem,
                            icon: 'error',
                            background: bg,
                            color: text,
                            confirmButtonText: 'Fechar',
                            customClass: {
                                popup: 'rounded-4',
                                confirmButton: 'btn btn-accent rounded-pill px-4 shadow-sm'
                            },
                            buttonsStyling: false
                        });
                    }
                } catch (erro) {
                    console.error("Erro na requisição:", erro);
                    Swal.fire({
                        title: 'Erro',
                        text: 'Ocorreu um erro de conexão com o servidor.',
                        icon: 'error',
                        background: bg,
                        color: text,
                        confirmButtonText: 'Fechar',
                        customClass: {
                            popup: 'rounded-4',
                            confirmButton: 'btn btn-accent rounded-pill px-4 shadow-sm'
                        },
                        buttonsStyling: false
                    });
                }
            }
        });
    });

    $(document).on('click', '.btn-excluir', function () {
        const id = this.id.split('-')[1]; // extrai o ID do botão (formato: excluir-123)
        const idRelatorio = $(`#excluir-${id}`).data('relatorio');
        
        const root = getComputedStyle(document.documentElement);
        const bg = (root.getPropertyValue('--bg-color') || '#fff').trim();
        const text = (root.getPropertyValue('--text-dark') || '#333').trim();

        Swal.fire({
            title: 'Excluir não conformidade',
            text: 'Tem certeza que deseja excluir esta não conformidade?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Sim, excluir',
            cancelButtonText: 'Cancelar',
            background: bg,
            color: text,
            customClass: {
                popup: 'rounded-4 shadow p-3 p-md-4',
                title: 'fs-5 fw-bold mb-2',
                htmlContainer: 'm-0 text-muted',
                actions: 'd-flex flex-wrap gap-2 w-100 justify-content-center mt-4',
                confirmButton: 'btn btn-danger rounded-pill px-4 shadow-sm m-0',
                cancelButton: 'btn btn-light border rounded-pill px-4 text-secondary m-0'
            },
            buttonsStyling: false
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
                            background: bg,
                            color: text,
                            confirmButtonText: 'Fechar',
                            customClass: {
                                popup: 'rounded-4',
                                confirmButton: 'btn btn-accent rounded-pill px-4 shadow-sm'
                            },
                            buttonsStyling: false
                        });
                    }
                    else {
                        Swal.fire({
                            title: 'Erro',
                            text: dados.mensagem,
                            icon: 'error',
                            background: bg,
                            color: text,
                            confirmButtonText: 'Fechar',
                            customClass: {
                                popup: 'rounded-4',
                                confirmButton: 'btn btn-accent rounded-pill px-4 shadow-sm'
                            },
                            buttonsStyling: false
                        });
                    }
                } catch (erro) {
                    console.error("Erro na requisição:", erro);
                    Swal.fire({
                        title: 'Erro',
                        text: 'Ocorreu um erro de conexão com o servidor.',
                        icon: 'error',
                        background: bg,
                        color: text,
                        confirmButtonText: 'Fechar',
                        customClass: {
                            popup: 'rounded-4',
                            confirmButton: 'btn btn-accent rounded-pill px-4 shadow-sm'
                        },
                        buttonsStyling: false
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
        const rows = document.querySelectorAll('#tabela-corpo .searchable-item, #tabela-corpo tr');
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

$("#topSelect").on("change", function() {
    const top = $(this).val();
    // Lógica para atualizar a lista de relatórios com o novo valor de "top"
    window.location.href = `/fiscalizacao?top=${top}`;
});

async function baixarRelatorio(idRelatorio) {
    try {
        const res = await fetch(`/fiscalizacao/edit/${idRelatorio}/pdf`);

        if (!res.ok) {
            const erro = await res.json();
            await Swal.fire({
                icon: 'warning',
                title: 'Download indisponível',
                text: erro.mensagem || 'Não foi possível baixar o relatório.',
                confirmButtonColor: '#1a3c5e'
            });
            return;
        }

        const blob = await res.blob();
        const url  = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href     = url;
        link.download = `Relatorio_${idRelatorio}.pdf`;
        link.click();
        URL.revokeObjectURL(url);

    } catch (err) {
        await Swal.fire({
            icon: 'error',
            title: 'Erro',
            text: 'Erro ao tentar baixar o relatório.',
            confirmButtonColor: '#1a3c5e'
        });
    }
}