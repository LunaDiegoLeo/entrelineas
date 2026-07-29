export async function pruebaBrevo() {
    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
        method: "POST",
        headers: {
            "accept": "application/json",
            "content-type": "application/json",
            "api-key": process.env.BREVO_API_KEY
        },
        body: JSON.stringify({
            sender: {
                name: "Entre Líneas",
                email: "entrelineas.noreply@gmail.com"
            },
            to: [
                {
                    email: "23030379@itcelaya.edu.mx"
                }
            ],
            subject: "Prueba Brevo API",
            htmlContent: "<h1>¡Si ves este correo, Brevo funciona correctamente!</h1>"
        })
    });

    const data = await response.json();

    console.log("STATUS:", response.status);
    console.log("DATA:", data);

    return data;
}