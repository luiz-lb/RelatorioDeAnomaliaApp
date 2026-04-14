async function enviarFormulario(idForm, method, formData, redirectUrl) {
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
        if(redirectUrl !==''){
            window.location.href = redirectUrl;
        }
        else {
            return response.data;
        }
    } catch (error) {
        alert(error.response?.data?.message || "Ocorreu um erro ao enviar o formulário.");
        console.error(error);
    }
}

$(document).ready(function() {
    $('.btnSend').click(function(e) {
        e.preventDefault();
        const idForm = $(this).data('form-id');
        const method = $(this).data('method');
        const redirectUrl = $(this).data('redirect');
        const formData = $(`#${idForm}`).serialize();

        enviarFormulario(idForm, method, formData, redirectUrl ? redirectUrl : '');
    });
});

