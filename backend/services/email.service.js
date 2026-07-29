export async function enviarCorreoVerificacion({
    to,
    alias,
    codigo,
}) {

    html: `
                <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f9f9f9; padding: 40px 20px; margin: 0;">
                    <div style="max-width: 500px; background-color: #ffffff; margin: 0 auto; padding: 40px; border-radius: 8px; border: 1px solid #eeeeee; box-shadow: 0 2px 10px rgba(0,0,0,0.02);">
                        
                        <h1 style="text-align: center; color: #111111; font-size: 22px; letter-spacing: 2px; margin-top: 0; margin-bottom: 30px;">
                            ENTRE LÍNEAS
                        </h1>
                        
                        <p style="color: #333333; font-size: 16px; line-height: 1.5; margin-bottom: 20px;">
                            Hola, <strong>${alias}</strong>:
                        </p>
                        
                        <p style="color: #444444; font-size: 15px; line-height: 1.6; margin-bottom: 30px;">
                            Gracias por unirte a nuestra comunidad. Para completar tu registro y habilitar tu cuenta, por favor ingresa el siguiente código de verificación:
                        </p>
                        
                        <div style="text-align: center; margin: 35px 0;">
                            <span style="display: inline-block; background-color: #111111; color: #ffffff; font-size: 28px; font-weight: bold; letter-spacing: 6px; padding: 15px 30px; border-radius: 4px;">
                                ${codigoPlano}
                            </span>
                        </div>
                        
                        <p style="color: #888888; font-size: 13px; text-align: center; border-top: 1px solid #eeeeee; padding-top: 20px; margin-top: 40px; margin-bottom: 0;">
                            Si no solicitaste crear una cuenta en Entre Líneas, puedes ignorar este mensaje de forma segura.
                        </p>
                    </div>
                </div>
            `
    ;

    const response = await fetch(
        "https://api.brevo.com/v3/smtp/email",
        {
            method: "POST",

            headers: {
                "accept": "application/json",
                "content-type": "application/json",
                "api-key": process.env.BREVO_API_KEY,
            },

            body: JSON.stringify({

                sender: {
                    name: "Entre Líneas",
                    email: "entrelineas.noreply@gmail.com"
                },

                to: [
                    {
                        email: to,
                        name: alias
                    }
                ],

                subject: "Verifica tu cuenta en Entre Líneas",

                htmlContent: html

            })

        }
    );

    const data = await response.json();

    if (!response.ok) {

        console.error(data);

        throw new Error(data.message || "Brevo error");

    }

    return data;

}