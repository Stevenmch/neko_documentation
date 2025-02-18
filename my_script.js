// Verifica compatibilidad con SpeechRecognition
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
if (!SpeechRecognition) {
    alert("Tu navegador no soporta el reconocimiento de voz.");
} else {
    const recognition = new SpeechRecognition();
    recognition.lang = "es-ES";
    recognition.continuous = false;
    recognition.interimResults = false;

    let isRecording = false;
    let isRecordingAsk = false;
    let accumulatedText = "";
    const startButton = document.getElementById("startButton");
    const stopButton = document.getElementById("stopButton");
    const output = document.getElementById("output");
    const askStartButton = document.getElementById("askStartButton"); 
    const askStopButton = document.getElementById("askStopButton"); 


    // Configuración de AWS con Cognito
    AWS.config.region = "us-east-1"; // Reemplázalo con tu región
    AWS.config.credentials = new AWS.CognitoIdentityCredentials({
        IdentityPoolId: "us-east-1:eb1fa3d7-3756-4cf6-9027-9f30eeb538b1" 
    });

    // Obtener credenciales antes de crear el cliente S3
    AWS.config.credentials.get((err) => {
        if (err) {
            console.error("Error obteniendo credenciales de Cognito", err);
            return;
        }
        console.log("Credenciales obtenidas correctamente");

    // 🔹 Crear instancia de S3 con credenciales temporales
    const s3 = new AWS.S3();

    // Funciones
    function listS3Objects() {
        const params = {
            Bucket: 'documentations3' 
            };
        return new Promise((resolve, reject) => {
            s3.listObjectsV2(params, (err, data) => {
                if (err) {
                reject(err);
                } else {
                const keys = data.Contents.map(item => item.Key);
                resolve(keys);
                }
            });
            });
        };
    function getS3Object(fileName) {
        const params = {
            Bucket: 'documentations3',
            Key: fileName
        };
        
        return new Promise((resolve, reject) => {
            s3.getObject(params, (err, data) => {
            if (err) {
                reject(err);
            } else {
                resolve(data.Body.toString('utf-8')); // Convertimos el buffer a string
            }
            });
        });
        }
    async function getAllFilesContent() {
        try {
            const files = await listS3Objects(); // Obtener lista de archivos
            const contentArray = await Promise.all(files.map(getS3Object)); // Leer archivos
            return contentArray.join("\n\n"); // Unir todo el texto
        } catch (error) {
            console.error("Error al obtener archivos:", error);
            return "";
        }
        }
          
          

    startButton.addEventListener("click", () => {
        console.log("Botón de inicio clickeado");
        if (isRecording || isRecordingAsk) return;
        isRecording = true;
        accumulatedText = "";
        recognition.start();
        output.innerText = "🔴Listening...";
    });
    stopButton.addEventListener("click", () => {
        if (!isRecording) return;
        isRecording = false;
        recognition.stop();
        output.innerText += "\n✅Your knowledge has been saved.";

        // Aqui debe estar el condicional pero no se porque
        if (accumulatedText.trim() !== "") {
            subirTextoAS3(accumulatedText); // Subir solo cuando se detiene
        }
    });

    // Función para los botones de "Ask"
    askStartButton.addEventListener("click", () => {
        if (isRecordingAsk || isRecording) return;
        isRecordingAsk = true;
        accumulatedText = "";
        recognition.start();
        output.innerText = "🔊 Recording (Ask Mode)...";
    });
    askStopButton.addEventListener("click", async () => {
        if (!isRecordingAsk) return;
        isRecordingAsk = false;
        recognition.stop();
        try {
            // Obtener el texto de todos los archivos en S3
            const text = await getAllFilesContent();
                
            // Mostrar el contenido en la interfaz
            output.innerText += "\nContenido de S3:\n" + text;
            
            // Aquí podrías enviarlo a ChatGPT si lo deseas
            // const respuesta = await askChatGPT(text);
            // output.innerText += "\nRespuesta de ChatGPT:\n" + respuesta;
            
        } catch (error) {
            output.innerText += "\nError al obtener los archivos: " + error;
        }

        
    });

    recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        // Aqui debe acumular el texto, pero no me queda claro como es capaz de mostrar todo el texto en la interfax
        accumulatedText += transcript + " ";
        output.innerText += `\n${transcript}`;
    };

    recognition.onend = () => {
        if (isRecording || isRecordingAsk) recognition.start();
    };

    recognition.onerror = (event) => {
        output.innerText = `Error: ${event.error}`;
        isRecording = false;
        isRecordingAsk = false;
    };

    // Se agrego esta funcion para cargar
    function subirTextoAS3(texto) {
        const params = {
            Bucket: "documentations3",
            Key: `transcripcion-${Date.now()}.txt`, // Nombre dinámico
            Body: texto,
            ContentType: "text/plain"
        };

        console.log("Subiendo archivo a S3...");
        s3.upload(params, function (err, data) {
            if (err) {
                console.log("Error al subir archivo:", err);
            } else {
                console.log("Archivo subido con éxito:", data.Location);
            }
        });

    }
  });
}
