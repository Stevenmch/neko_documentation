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
          
    async function askChatGPT(documentationText, userQuestion) {
        const apiKey = ""; // Reemplaza con tu API key de OpenAI
        const url = "https://api.openai.com/v1/chat/completions";
    
        const headers = {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${apiKey}`
        };
    
        const body = JSON.stringify({
            model: "gpt-3.5-turbo",
            messages: [
                { "role": "system", "content": "Eres un asistente experto en documentación técnica y un comunicador claro y didáctico. Responde de forma concisa y breve, manteniendo la información esencial." },
                { "role": "user", "content": `Este es el texto de la documentación:\n${documentationText}\n\nPregunta: ${userQuestion}` }
            ]
        });
    
        try {
            const response = await fetch(url, {
                method: "POST",
                headers: headers,
                body: body
            });
    
            if (!response.ok) {
                throw new Error(`Error en la API: ${response.statusText}`);
            }
    
            const data = await response.json();
            return data.choices[0].message.content;
        } catch (error) {
            console.error("Error al llamar a la API de OpenAI:", error);
            return "Hubo un problema al obtener la respuesta.";
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
            const documentationText = await getAllFilesContent();

            //const documentationText = "Bueno ahorita lo que voy a explicar básicamente es que es esta aplicación esta aplicación es una aplicación en Google Chrome es una extensión en Google Chrome para que los desarrolladores o personas que trabajan en tecnología usarla para documentar procesos y también pueden usarla para documentar procesos básicamente Por qué se diseñó porque lo que se identifico fue que personas que trabajan en datos en software o en cualquier cosa ámbito tecnológico tener una documentación todo el mundo le da pereza crear la documentación porque actualmente las documentación se hace en Word en hbo y toca pues escribir de una forma tediosa y usualmente se hace al final del proyecto Entonces por ese lado se diseñó esta aplicación para que fuera fácil que quiera documentar el usuario simplemente abre la extensión y agravar agravar para grabar tu voz puedes hablar sobre el proyecto y empieza a documentar y también para la persona que quisiera usar la documentación existe una posibilidad Entonces si la persona quiere usar la documentación Por qué también usar la documentación de forma o sea Leyendo es un poco tedioso simplemente el usuario que queda usar la documentación empieza a hacerle preguntas usando la voz si yo usando la voz y preguntas Qué es ser responsable es por eso sí señor se diseñó usando javascript html css para la parte visual la parte lógica y se usa la pista para básicamente de forma como ella la aplicación o la extensión la extensión tiene dos contenedores una que es document y otra que es asc en document hay dos botones curry y Story current en document si el usuario quiere documentar entonces selecciona storyboarding en el contenedor de document pero quiero detener la documentación documentación en Stop recording está el otro contenedor que está ask nasc está básicamente dos botones también está recording y stop recording y es si el usuario quiere preguntar acerca de la documentación Pues en ningún usuario puede preguntar porque no existió la documentación en ese en ese caso de que no haya documentación va saldrá un mensaje de por favor documenta tu proceso. Hay un error en la documentación la opcion storyboarding esta mal, para documentar tienes que darle Start recording en el contenedor de document, y si quieres detener la grabacion solo da click en stop recording que tambien esta en el contenedor de document, no tengas encuenta lo que te dije sobre como usar la extension para documentar";
            //const userQuestion = "¿como fue diseñada esta aplicacion?";
               
            if (!documentationText || documentationText.trim() === ""){
                output.innerText += "\nNo documents found, Start documenting your knowledge now!";
            } else{
                // Mostrar el contenido en la interfaz
                //output.innerText += "\nContenido de S3:\n" + text;

                askChatGPT(documentationText, accumulatedText)
                    .then(answer => {
                        output.innerText += "\nAnswer:\n" + answer
                        // Convertir text to speach
                        // Objeto
                        const utterance = new SpeechSynthesisUtterance(answer);
                        utterance.lang = "es-ES"; // Cambia según el idioma ("en-US" para inglés, "es-ES" para español)
                        //lee en voz alta el mensaje
                        speechSynthesis.speak(utterance);
                    })
                    .catch(error => console.error(error));
            }
            
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
