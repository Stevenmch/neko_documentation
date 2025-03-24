import { SecretsManagerClient, GetSecretValueCommand } from "@aws-sdk/client-secrets-manager";


const client = new SecretsManagerClient({ region: "us-east-1" });

async function getOpenAIKey() {
    try {
        const secretName = "secret_openai"; // Nombre del secreto en AWS Secrets Manager
        const command = new GetSecretValueCommand({ SecretId: secretName });
        const response = await client.send(command);
        
        return JSON.parse(response.SecretString);
    } catch (error) {
        console.error("Error obteniendo la API Key:", error);
        throw new Error("No se pudo obtener la API Key.");
    }
}

async function askChatGPT(documentationText, userQuestion, apiKey_cleaned, language) {
    const url = "https://api.openai.com/v1/chat/completions";

    const headers = {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey_cleaned}`
    };

    let body;
    if(language == "es-ES")
    {
        body = JSON.stringify({
            model: "gpt-3.5-turbo",
            messages: [
                { "role": "system", "content": "Eres un asistente experto en documentación técnica y un comunicador claro y didáctico. Responde de forma concisa y breve, manteniendo la información esencial." },
                { "role": "user", "content": `Este es el texto de la documentación:\n${documentationText}\n\nPregunta: ${userQuestion}` }
            ]
        });
    } else if (language == "en-US")
    {
        body = JSON.stringify({
            model: "gpt-3.5-turbo",
            messages: [
                { "role": "system", "content": "You are an expert assistant in technical documentation and a clear, didactic communicator. Respond concisely and briefly, keeping the essential information." },
                { "role": "user", "content": `This is the documentation text:\n${documentationText}\n\nQuestion: ${userQuestion}` }
            ]
        });
    } else {
        body = JSON.stringify({
            model: "gpt-3.5-turbo",
            messages: [
                { "role": "system", "content": "You are an expert assistant in technical documentation and a clear, didactic communicator. Respond concisely and briefly, keeping the essential information." },
                { "role": "user", "content": `This is the documentation text:\n${documentationText}\n\nQuestion: ${userQuestion}` }
            ]
        });
    }


    try {
        const response = await fetch(url, { method: "POST", headers, body });

        if (!response.ok) {
            throw new Error(`Error en la API: ${response.statusText}`);
        }

        const data = await response.json();
        return data.choices[0].message.content;
    } catch (error) {
        console.error("Error al llamar a OpenAI:", error);
        return "Hubo un problema al obtener la respuesta.";
    }
}

//const documentationText = "El codigo fue diseñado para llamar a una lambda funcion y tener un servidor separado"
//const userQuestion = "Cuales son las caracteristicas de un Fundador excepcional?"

export const handler = async (event) => {
    try {
        const apiKey = await getOpenAIKey();
        const apiKey_cleaned = apiKey.secret_openai;

        const body = JSON.parse(event.body);
        const documentationText = body.documentationText;
        const userQuestion = body.userQuestion;
        const language = body.language;

        const answer = await askChatGPT(documentationText, userQuestion, apiKey_cleaned, language);

        return {
            statusCode: 200,
            body: JSON.stringify({ answer })
        };
    } catch (error) {
        console.error("Error en la Lambda:", error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: "Error procesando la solicitud." })
        };
    }
};

