function resetUploadState(form, submitButtons) {
    form.dataset.uploadInProgress = 'false';
    submitButtons.prop('disabled', false);
}

async function uploadNaoConformidade(event) {
    event.preventDefault();

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

    const arquivo = $('#arquivoInput')[0]?.files?.[0];
    const descricao = $('#descricao').val();
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

        if (!dados.sucesso) {
            alert(`Erro ao subir a imagem: ${dados.mensagem}`);
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
        alert('Ocorreu um erro de conexão com o servidor.');
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
}

async function enviarFormRelatorio(idRelatorio, checklistSelecionado) {
    try {
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
                confirmButtonText: 'Fechar'
            });
            return;
        }
        await Swal.fire({
            title: 'Sucesso',
            text: 'Relatório enviado com sucesso!',
            icon: 'success',
            confirmButtonText: 'Fechar'
        });
        return;
    } catch (erro) {
        console.error('Erro ao enviar relatorio para backend.');
        await Swal.fire({
            title: 'Erro',
            text: 'Erro ao enviar relatorio.',
            icon: 'error',
            confirmButtonText: 'Fechar'
        });
        return;
    }
}

async function enviarRelatorio() {
    try {
        const idRelatorio = $(this).data('relatorio');
        if (!idRelatorio) {
            await Swal.fire({
                title: 'Erro',
                text: 'ID do relatório não encontrado.',
                icon: 'error',
                confirmButtonText: 'Fechar'
            });
            return;
        }

        const resposta = await fetch(`/fiscalizacao/checklist/${idRelatorio}`, {
            method: 'GET'
        });

        const dados = await resposta.json();

        if (!dados.sucesso) {
            await Swal.fire({
                title: 'Erro',
                text: dados.mensagem,
                icon: 'error',
                confirmButtonText: 'Fechar'
            });
            return;
        }
        const checklist = dados.checklist;
        // colocando o checklist em uma variável para usar como checkbox no swal
        const checklistHtml = checklist.map((item) => `
            <label style="display:flex;gap:8px;align-items:center;margin:6px 0;">
                <input type="checkbox" class="swal-check-item" value="${item.id}">
                <span>${item.descricao}</span>
            </label>
        `).join('');

        const result = await Swal.fire({
            title: 'Enviar relatório',
            html: `
                <p style="margin-bottom:10px;">Selecione os itens do checklist que foram atendidos:</p>
                <div id="swal-checklist" style="text-align:left;max-height:250px;overflow:auto;">
                    ${checklistHtml}
                </div>
            `,
            focusConfirm: false,
            showCancelButton: true,
            confirmButtonText: 'Enviar',
            cancelButtonText: 'Cancelar',
            preConfirm: () => {
                const selecionados = Array.from(
                    $('#swal-checklist .swal-check-item:checked')
                ).map((el) => Number($(el).val()));

                // Regra: precisa marcar todos
                if (selecionados.length !== checklist.length) {
                    Swal.showValidationMessage('Você deve selecionar todos os campos para enviar o relatório.');
                    return false;
                }

                return selecionados;
            }
        });
        
        if (!result.isConfirmed) {
            return;
        }

        // Enviando o formulário para o backend com os itens do checklist selecionados
        await enviarFormRelatorio(idRelatorio, result.value);        

    } catch (erro) {
        console.error('Erro ao enviar relatorio.');
        await Swal.fire({
            title: 'Erro',
            text: 'Erro ao enviar relatorio.',
            icon: 'error',
            confirmButtonText: 'Fechar'
        });
        return;
    }    
}

async function baixarRelatorio() {
    try {
        const idRelatorio = $(this).data('idrelatorio');

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

export function initFiscalizacaoPage() {
    const formUpload = $('#formUpload');
    if (!formUpload.length) {
        return;
    }

    formUpload.on('submit', uploadNaoConformidade);
    $(document).on('click', '.btn-editar', editarNaoConformidade);
    $(document).on('click', '.btn-excluir', excluirNaoConformidade);
    $(document).on('click', '#btn-enviar-relatorio', enviarRelatorio);
    $(document).on('click', '#btn-baixar-relatorio', baixarRelatorio);
}
