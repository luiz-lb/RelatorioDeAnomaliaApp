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

export function initFiscalizacaoPage() {
    const formUpload = $('#formUpload');
    if (!formUpload.length) {
        return;
    }

    formUpload.on('submit', uploadNaoConformidade);
    $(document).on('click', '.btn-editar', editarNaoConformidade);
    $(document).on('click', '.btn-excluir', excluirNaoConformidade);
}
