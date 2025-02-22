import { SecretsManagerClient, GetSecretValueCommand } from "@aws-sdk/client-secrets-manager";

const client = new SecretsManagerClient({ region: "us-east-1" });

export const handler = async (event) => {
    try {
        const secretName = "secret_openai"; 
        const command = new GetSecretValueCommand({ SecretId: secretName });
        const response = await client.send(command);
        const secret_test = JSON.parse(response.SecretString )
        const apiKey = secret_test.secret_openai;
        return apiKey;
    } catch (error) {
        console.error("Error obteniendo el secreto:", error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: "Error obteniendo el secreto" }),
        };
    }
};
