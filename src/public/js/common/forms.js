export async function enviarFormulario(idForm, method, formData, redirectUrl) {
    try {
        const response = await axiosClient({
            method,
            url: $(`#${idForm}`).attr('action'),
            data: formData,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });

        alert(response.data.message);

        if (redirectUrl !== '') {
            window.location.href = redirectUrl;
            return;
        }

        if (response.data.redirectUrl) {
            window.location.href = response.data.redirectUrl;
            return;
        }

        return response.data;
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
