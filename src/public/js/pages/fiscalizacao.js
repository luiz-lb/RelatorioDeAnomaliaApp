function resetUploadState(form, submitButtons) {
    form.dataset.uploadInProgress = 'false';
    submitButtons.prop('disabled', false);
}

async function uploadNaoConformidade(event) {
    event.preventDefault();

    const form = event.currentTarget;
    if (form.dataset.uploadInProgress === 'true') {
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

        $('#galeria').append(dados.htmlDoCard);
        form.reset();
        resetUploadState(form, submitButtons);
    } catch (erro) {
        console.error('Erro na requisição:', erro);
        alert('Ocorreu um erro de conexão com o servidor.');
        resetUploadState(form, submitButtons);
    }
}

async function editarNaoConformidade() {
    const id = this.id.split('-')[1];
    const idRelatorio = $(`#editar-${id}`).data('relatorio');

    const result = await Swal.fire({
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
    });

    if (!result.isConfirmed) {
        return;
    }

    try {
        const resposta = await fetch(`/fiscalizacao/edit/nao-conformidade/${idRelatorio}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ descricao: result.value, idNaoConformidade: id })
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

        $(`#descricao-${id}`).text(result.value);
        await Swal.fire({
            title: 'Sucesso',
            text: 'Descrição atualizada com sucesso!',
            icon: 'success',
            confirmButtonText: 'Fechar'
        });
    } catch (erro) {
        console.error('Erro na requisição:', erro);
        await Swal.fire({
            title: 'Erro',
            text: 'Ocorreu um erro de conexão com o servidor.',
            icon: 'error',
            confirmButtonText: 'Fechar'
        });
    }
}

async function excluirNaoConformidade() {
    const id = this.id.split('-')[1];
    const idRelatorio = $(`#excluir-${id}`).data('relatorio');

    const result = await Swal.fire({
        title: 'Excluir não conformidade',
        text: 'Tem certeza que deseja excluir esta não conformidade?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sim',
        cancelButtonText: 'Cancelar'
    });

    if (!result.isConfirmed) {
        return;
    }

    try {
        const resposta = await fetch(`/fiscalizacao/edit/nao-conformidade/${idRelatorio}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ idNaoConformidade: id })
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

        $(`#div-${id}`).remove();
        await Swal.fire({
            title: 'Sucesso',
            text: 'Não conformidade excluída com sucesso!',
            icon: 'success',
            confirmButtonText: 'Fechar'
        });
    } catch (erro) {
        console.error('Erro na requisição:', erro);
        await Swal.fire({
            title: 'Erro',
            text: 'Ocorreu um erro de conexão com o servidor.',
            icon: 'error',
            confirmButtonText: 'Fechar'
        });
    }
}

async function enviarFormRelatorio(idRelatorio, checklistSelecionado) {
    try {
        const resposta = await fetch(`/fiscalizacao/enviar-relatorio/${idRelatorio}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ checklistSelecionado: checklistSelecionado })
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

export function initFiscalizacaoPage() {
    const formUpload = $('#formUpload');
    if (!formUpload.length) {
        return;
    }

    formUpload.on('submit', uploadNaoConformidade);
    $(document).on('click', '.btn-editar', editarNaoConformidade);
    $(document).on('click', '.btn-excluir', excluirNaoConformidade);
    $(document).on('click', '#btn-enviar-relatorio', enviarRelatorio);
}
