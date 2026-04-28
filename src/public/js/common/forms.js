export async function enviarFormulario(idForm, method, formData, redirectUrl) {
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
        alert(error.response?.data?.message || 'Ocorreu um erro ao enviar o formulário.');
        console.error(error);
        return null;
    }
}

function buscadorCep() {
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
                alert("CEP não encontrado.");
            }
        }).fail(function() {
            alert("Erro ao buscar as informações do CEP.");
        });
    }
};

function aplicarMascaras() {
    $('.date').mask('00/00/0000');
    $('.cep').mask('00000-000');
    $('.alturaTorre').mask('###0,00', {reverse: true});

    $('.selectUF').select2({
        theme: "bootstrap-5",
        width: '100%',
        placeholder: "Selecione uma UF", // O texto fica aqui agora
        allowClear: true // (Opcional) Adiciona um "x" para limpar
    });
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
