export async function enviarFormulario(idForm, method, formData, redirectUrl) {
    const root = getComputedStyle(document.documentElement);
    const bg = (root.getPropertyValue('--bg-color') || '#fff').trim();
    const text = (root.getPropertyValue('--text-dark') || '#333').trim();

    try {
        const url = $(`#${idForm}`).attr('action');
        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: formData
        });
        
        const data = await response.json();

        if (redirectUrl !== '') {
            window.location.href = redirectUrl;
            return;
        }

        if (data.redirectUrl) {
            window.location.href = data.redirectUrl;
            return;
        }

        return data;
    } catch (error) {
        Swal.fire({
            title: 'Erro',
            text: error.response?.data?.message || 'Ocorreu um erro ao enviar o formulário.',
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
        console.error(error);
        return null;
    }
}

function buscadorCep() {
    const root = getComputedStyle(document.documentElement);
    const bg = (root.getPropertyValue('--bg-color') || '#fff').trim();
    const text = (root.getPropertyValue('--text-dark') || '#333').trim();

    const cep = $(this).val().replace(/\D/g, '');
    if (cep.length === 8) {
        const url = `https://viacep.com.br/ws/${cep}/json/`;
        $.getJSON(url, function (data) {
            if (!data.erro) {
                // Preenche os campos com os dados retornados pela API
                $('#endereco').val(data.logradouro);
                $('#municipio').val(data.localidade);
                $('#uf').val(data.uf);
            } else {
                Swal.fire({
                    title: 'Aviso',
                    text: 'CEP não encontrado.',
                    icon: 'warning',
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
        }).fail(function() {
            Swal.fire({
                title: 'Erro',
                text: 'Erro ao buscar as informações do CEP.',
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
        });
    }
};

function aplicarMascaras() {
    $('.date').mask('00/00/0000');
    $('.cep').mask('00000-000');
    $('.alturaTorre').mask('###0,00', {reverse: true});
}

export function initFormSubmissions() {
    if (!$('.btnSend').length) {
        return;
    }
    aplicarMascaras();

    $('.cepBuscador').on('blur', buscadorCep);

    $('.btnSend').on('click', function (e) {
        e.preventDefault();

        const idForm = $(this).data('form-id');
        const method = $(this).data('method');
        const redirectUrl = $(this).data('redirect');
        const formData = $(`#${idForm}`).serialize();

        enviarFormulario(idForm, method, formData, redirectUrl || '');
    });
}
