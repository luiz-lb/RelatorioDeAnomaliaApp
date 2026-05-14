function resetUploadState(form, submitButtons) {
    form.dataset.uploadInProgress = 'false';
    submitButtons.prop('disabled', false);
}

async function comprimirImagem(file, maxWidth = 1200, maxHeight = 1200, quality = 0.7) {
    return new Promise((resolve, reject) => {
        if (!file.type.startsWith('image/')) return resolve(file);
        
        const img = new Image();
        img.src = URL.createObjectURL(file);
        img.onload = () => {
            URL.revokeObjectURL(img.src);
            let width = img.width;
            let height = img.height;

            if (width > height && width > maxWidth) {
                height = Math.round((height * maxWidth) / width);
                width = maxWidth;
            } else if (height > width && height > maxHeight) {
                width = Math.round((width * maxHeight) / height);
                height = maxHeight;
            }

            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, width, height);

            canvas.toBlob((blob) => {
                resolve(new File([blob], file.name, { type: 'image/jpeg' }));
            }, 'image/jpeg', quality);
        };
        img.onerror = reject;
    });
}

async function uploadNaoConformidade(event) {
    event.preventDefault();

    const root = getComputedStyle(document.documentElement);
    const bg = (root.getPropertyValue('--bg-color') || '#fff').trim();
    const text = (root.getPropertyValue('--text-dark') || '#333').trim();

    const form = event.currentTarget;
    if (form.dataset.uploadInProgress === 'true') {
        return;
    } else if($('#descricao').val().trim() === '') {
        alert('A descrição da não conformidade é obrigatória.');
        return;
    }

    form.dataset.uploadInProgress = 'true';
    const submitButtons = $(form).find('button[type=submit], input[type=submit]');
    submitButtons.prop('disabled', true);

    let arquivo = $('#arquivoInput')[0]?.files?.[0];
    const descricao = $('#descricao').val();

    // Dispara o alerta
    Swal.mixin({
        toast: true,
        position: "top-end",
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
        didOpen: (toast) => {
            toast.onmouseenter = Swal.stopTimer;
            toast.onmouseleave = Swal.resumeTimer;
        }
    }).fire({
        title: "Enviando imagem..."
    });

    // Comprime a imagem antes de fazer o envio, caso seja uma foto
    if (arquivo && arquivo.type.startsWith('image/')) {
        try {
            arquivo = await comprimirImagem(arquivo);
        } catch (e) {
            console.error("Erro ao comprimir a imagem no celular, enviando a original.", e);
        }
    }

    const formData = new FormData();
    formData.append('arquivo', arquivo);
    formData.append('descricao', descricao);

    const idRelatorio = $(form).data('relatorio');

    try {
        const resposta = await fetch(`/fiscalizacao/edit/nao-conformidade/${idRelatorio}`, {
            method: 'POST',
            body: formData
        });

        const dados = await resposta.json();
        
        Swal.close(); // Fecha o spinner de carregamento

        if (!dados.sucesso) {
            Swal.fire({
                title: 'Erro',
                text: `Erro ao subir a imagem: ${dados.mensagem}`,
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
            resetUploadState(form, submitButtons);
            return;
        }

        console.log(dados.htmlDoCard);

        $('#galeria').append(dados.htmlDoCard);
        if($('#sem-naoconformidade').length>0) {
            $('#sem-naoconformidade').remove();
        }
        form.reset();
        resetUploadState(form, submitButtons);
    } catch (erro) {
        console.error('Erro na requisição:', erro);
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
        resetUploadState(form, submitButtons);
    }
}

async function editarNaoConformidade() {
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
}

async function excluirNaoConformidade() {
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
            confirmButton: 'btn btn-accent rounded-pill px-4 shadow-sm m-0',
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
}

async function enviarFormRelatorio(idRelatorio, checklistSelecionado) {
    const root = getComputedStyle(document.documentElement);
    const bg = (root.getPropertyValue('--bg-color') || '#fff').trim();
    const text = (root.getPropertyValue('--text-dark') || '#333').trim();

    try {
        Swal.fire({
            title: 'Gerando Relatório...',
            html: 'Processando os dados e gerando o PDF.<br>Por favor, aguarde...',
            allowOutsideClick: false,
            background: bg,
            color: text,
            didOpen: () => {
                Swal.showLoading();
            }
        });

        const resposta = await fetch(`/fiscalizacao/enviar-relatorio/${idRelatorio}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ itensSelecionados: checklistSelecionado })
        });

        const dados = await resposta.json();

        if (!dados.sucesso) {
            await Swal.fire({
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
            return;
        }

        await Swal.fire({
            title: dados.emailFalhou ? 'Atenção' : 'Comprovante de Envio',
            text: dados.mensagem || 'Relatório enviado com sucesso!',
            icon: dados.emailFalhou ? 'warning' : 'success',
            background: bg,
            color: text,
            confirmButtonText: 'Fechar',
            customClass: {
                popup: 'rounded-4',
                confirmButton: 'btn btn-accent rounded-pill px-4 shadow-sm'
            },
            buttonsStyling: false
        }).then(() => {
            window.location.reload();
        });
        return;
    } catch (erro) {
        console.error('Erro ao enviar relatorio para backend.');
        await Swal.fire({
            title: 'Erro',
            text: 'Erro ao enviar relatorio.',
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
        return;
    }
}

async function enviarRelatorio() {
    const root = getComputedStyle(document.documentElement);
    const bg = (root.getPropertyValue('--bg-color') || '#fff').trim();
    const text = (root.getPropertyValue('--text-dark') || '#333').trim();

    try {
        const idRelatorio = $(this).data('relatorio');
        if (!idRelatorio) {
            await Swal.fire({
                title: 'Erro',
                text: 'ID do relatório não encontrado.',
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
            return;
        }

        // Passo 1: Buscar o checklist padrão (itens ativos ordenados)
        const respostaChecklist = await fetch(`/fiscalizacao/checklist/${idRelatorio}`, {
            method: 'GET'
        });

        const dadosChecklist = await respostaChecklist.json();

        if (!dadosChecklist.sucesso) {
            await Swal.fire({
                title: 'Erro',
                text: dadosChecklist.mensagem,
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
            return;
        }

        const checklist = dadosChecklist.checklist;
        
        // Montar HTML do checklist ordenado por "ordem"
        const checklistHtml = checklist.map((item) => `
            <label style="display:flex;gap:8px;align-items:center;margin:6px 0;">
                <input type="checkbox" class="swal-check-item" value="${item.id}">
                <span>${item.descricao}</span>
            </label>
        `).join('');

        // Passo 2: Exibir modal com checklist para o usuário selecionar itens
        const result = await Swal.fire({
            title: 'Enviar relatório',
            html: `
                <p style="margin-bottom:10px;">Confirme os itens da fiscalização que foram atendidos:</p>
                <div id="swal-checklist" style="text-align:left;max-height:250px;overflow:auto;">
                    ${checklistHtml}
                </div>
            `,
            focusConfirm: false,
            showCancelButton: true,
            confirmButtonText: 'Enviar',
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
            buttonsStyling: false,
            preConfirm: () => {
                const selecionados = Array.from(
                    $('#swal-checklist .swal-check-item:checked')
                ).map((el) => Number($(el).val()));

                return selecionados;
            }
        });
        
        if (!result.isConfirmed) {
            return;
        }

        // Passo 3: Salvar as respostas do checklist no banco de dados
        const respostaSalvar = await fetch(`/fiscalizacao/checklist-respostas/${idRelatorio}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ itensSelecionados: result.value })
        });

        const dadosSalvar = await respostaSalvar.json();

        if (!dadosSalvar.sucesso) {
            await Swal.fire({
                title: 'Erro',
                text: dadosSalvar.mensagem || 'Erro ao salvar o checklist.',
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
            return;
        }

        // Passo 4: Prosseguir com o fluxo de envio do relatório
        await enviarFormRelatorio(idRelatorio, result.value);        

    } catch (erro) {
        console.error('Erro ao enviar relatorio.');
        await Swal.fire({
            title: 'Erro',
            text: 'Erro ao enviar relatorio.',
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
        return;
    }    
}

async function baixarRelatorio() {
    const root = getComputedStyle(document.documentElement);
    const bg = (root.getPropertyValue('--bg-color') || '#fff').trim();
    const text = (root.getPropertyValue('--text-dark') || '#333').trim();

    try {
        const idRelatorio = $(this).data('idrelatorio');

        Swal.fire({
            title: 'Iniciando download...',
            html: 'Buscando o arquivo PDF, por favor aguarde.',
            allowOutsideClick: false,
            background: bg,
            color: text,
            didOpen: () => {
                Swal.showLoading();
            }
        });

        const res = await fetch(`/fiscalizacao/edit/${idRelatorio}/pdf`);

        if (!res.ok) {
            const erro = await res.json();
            await Swal.fire({
                icon: 'warning',
                title: 'Download indisponível',
                text: erro.mensagem || 'Não foi possível baixar o relatório.',
                background: bg,
                color: text,
                confirmButtonText: 'Fechar',
                customClass: {
                    popup: 'rounded-4',
                    confirmButton: 'btn btn-accent rounded-pill px-4 shadow-sm'
                },
                buttonsStyling: false
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

        Swal.close();

    } catch (err) {
        await Swal.fire({
            icon: 'error',
            title: 'Erro',
            text: 'Erro ao tentar baixar o relatório.',
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

async function editarHeaderRelatorio() {
    const btn = $(this);
    const idRelatorio = btn.data('relatorio');
    const root = getComputedStyle(document.documentElement);
    const bg = (root.getPropertyValue('--bg-color') || '#fff').trim();
    const text = (root.getPropertyValue('--text-dark') || '#333').trim();

    const { value: formValues } = await Swal.fire({
        title: 'Editar Dados do Relatório',
        html: `
            <div class="row g-3 text-start">
                <div class="col-12">
                    <label class="small text-muted mb-1">Site ID</label>
                    <input id="swal-siteId" class="form-control shadow-sm" value="${$('#site-id').data('siteid') || ''}">
                </div>
                <div class="col-6">
                    <label class="small text-muted mb-1">Altura Torre (m)</label>
                    <input id="swal-alturaTorre" class="form-control shadow-sm" value="${$('#estrutura-altura').data('altura') || ''}">
                </div>
                <div class="col-6">
                    <label class="small text-muted mb-1">CEP</label>
                    <input id="swal-cep" class="form-control shadow-sm" value="${$('#cep').data('cep') || ''}">
                </div>
                <div class="col-8">
                    <label class="small text-muted mb-1">Município</label>
                    <input id="swal-municipio" class="form-control shadow-sm" value="${$('#endereço-completo').data('municipio') || ''}">
                </div>
                <div class="col-4">
                    <label class="small text-muted mb-1">UF</label>
                    <input id="swal-uf" class="form-control shadow-sm" maxlength="2" value="${$('#endereço-completo').data('uf') || ''}">
                </div>
                <div class="col-12">
                    <label class="small text-muted mb-1">Endereço</label>
                    <input id="swal-endereco" class="form-control shadow-sm" value="${$('#endereço-completo').data('endereco') || ''}">
                </div>
                <div class="col-6">
                    <label class="small text-muted mb-1">Tipo de Cadeado</label>
                    <input id="swal-cadeado" class="form-control shadow-sm" value="${$('#tipo-cadeado').data('cadeado') || ''}">
                </div>
                <div class="col-6">
                    <label class="small text-muted mb-1">Tipo de Estrutura</label>
                    <input id="swal-tipoEstrutura" class="form-control shadow-sm" value="${$('#estrutura-altura').data('estrutura') || ''}">
                </div>
            </div>
        `,
        focusConfirm: false,
        showCancelButton: true,
        confirmButtonText: 'Salvar Alterações',
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
        buttonsStyling: false,
        preConfirm: () => {
            return {
                siteId: $('#swal-siteId').val(),
                alturaTorre: $('#swal-alturaTorre').val(),
                cep: $('#swal-cep').val(),
                municipio: $('#swal-municipio').val(),
                uf: $('#swal-uf').val(),
                endereco: $('#swal-endereco').val(),
                cadeado: $('#swal-cadeado').val(),
                tipoEstrutura: $('#swal-tipoEstrutura').val()
            }
        }
    });

    if (formValues) {
        try {
            Swal.fire({
                title: 'Salvando...',
                allowOutsideClick: false,
                didOpen: () => Swal.showLoading()
            });

            const response = await fetch(`/fiscalizacao/edit/header/${idRelatorio}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formValues)
            });

            const result = await response.json();

            if (result.sucesso) {
                window.location.reload();
            } else {
                throw new Error(result.mensagem || 'Erro ao atualizar o cabeçalho.');
            }
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Erro',
                text: error.message
            });
        }
    }
}

export function initFiscalizacaoPage() {
    const formUpload = $('#formUpload');
    if (!formUpload.length && !$('#btn-baixar-relatorio').length) {
        return;
    }

    formUpload.on('submit', uploadNaoConformidade);
    $(document).on('click', '.btn-editar', editarNaoConformidade);
    $(document).on('click', '.btn-excluir', excluirNaoConformidade);
    $(document).on('click', '#btn-enviar-relatorio', enviarRelatorio);
    $(document).on('click', '#btn-baixar-relatorio', baixarRelatorio);
    $(document).on('click', '#btnEditarFisHeader', editarHeaderRelatorio);
}
