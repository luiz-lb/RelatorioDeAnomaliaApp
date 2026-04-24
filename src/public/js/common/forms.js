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

export function initFormSubmissions() {
    if (!$('.btnSend').length) {
        return;
    }

    $('.btnSend').on('click', function (e) {
        e.preventDefault();

        const idForm = $(this).data('form-id');
        const method = $(this).data('method');
        const redirectUrl = $(this).data('redirect');
        const formData = $(`#${idForm}`).serialize();

        enviarFormulario(idForm, method, formData, redirectUrl || '');
    });
}
