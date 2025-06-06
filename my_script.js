// Verifica compatibilidad con SpeechRecognition
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
if (!SpeechRecognition) {
    alert("Tu navegador no soporta el reconocimiento de voz.");
} else {
    const recognition = new SpeechRecognition();
    // Reconocer el lenguaje del usuario
    let userLang = navigator.language || navigator.languages[0];  
    console.log("Idioma del usuario:", userLang);
    // Configurar el idioma de reconocimiento
    if (userLang.startsWith("es")) {
        language = "es-ES"
        recognition.lang = language;
    } else if (userLang.startsWith("en")) {
        language = "en-US"
        recognition.lang = language;
    } else {
        language = "en-US"
        recognition.lang = language; // Inglés por defecto si el idioma no es español
    }

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

    // Obtener session_id almacenado anteriormente en el localstorage
    let userId = localStorage.getItem("userId");
    if (!userId) {
        userId = crypto.randomUUID();  // Genera un ID único
        localStorage.setItem("userId", userId);  // Guarda el ID en el navegador
    }
    console.log("User ID:", userId);

    // Generar un session_id único para la sesión actual
    let sessionId = sessionStorage.getItem("sessionId");

    if (!sessionId) {
        sessionId = crypto.randomUUID();  // Genera un ID único por sesión
        sessionStorage.setItem("sessionId", sessionId);  // Guarda el ID en sessionStorage
    }
    // Metrica inicio sesion
    async function sendDataToLambdaStart(user_id_params,event_type_params, session_id_params) {
        const url = "https://7kwity81l3.execute-api.us-east-1.amazonaws.com/dev";
    
        const data = {
            user_id: user_id_params,
            event_type: event_type_params,
            session_id: session_id_params
        };
    
        try {
            const response = await fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(data)
            });
    
            const result = await response.json();
            console.log("Respuesta de Lambda:", result);
        } catch (error) {
            console.error("Error enviando datos a Lambda:", error);
        }
    }
    sendDataToLambdaStart(userId,"Start Session",sessionId);
    

    
    // Declarar s3 globalmente para usarlo en el boton de trash-open
    // Configuración de AWS con Cognito
    AWS.config.region = "us-east-1"; // Reemplázalo con tu región
    AWS.config.credentials = new AWS.CognitoIdentityCredentials({
        IdentityPoolId: "us-east-1:eb1fa3d7-3756-4cf6-9027-9f30eeb538b1" 
    });
    const s3 = new AWS.S3();
   

    // Icono para eliminar todo del S3
    document.addEventListener("DOMContentLoaded", function () {
        const deleteIcon = document.querySelector(".document-delete-icon");
        // Verifica si el clic fue en el icono de eliminar
        if (deleteIcon) {
            deleteIcon.addEventListener("click", async function(){
                const confirmDelete = confirm("😯 Are you sure you want to delete everything you have documented?\n\n🛑 Everything you have ever documented will be deleted.");
                if (confirmDelete){
                    const successDeleted = await deleteS3Data();
                    
                    if (successDeleted){
                        alert("✅ All documents have been deleted successfully.");
                    }
                }
            });
        }
    });

    // Funcion para eliminar datos de mi s3
    async function deleteS3Data() {
        const bucketName = "documentations3";
        const folderPath = `anonymous/${userId}/project1/`;
    
        try {
            // Obtener la lista de objetos en el bucket
            const objects = await s3.listObjectsV2({ 
                Bucket: bucketName,
                Prefix: folderPath }).promise();
            
            // Si no existe contenido o si es null 
            if (!objects.Contents || objects.Contents.length === 0) {
                alert("No hay datos para eliminar.");
                return false;
            }
            
            // Filtrar solo archivos dentro de project1/ (asegurar que no borra el folder padre)
            const objectsToDelete = objects.Contents
            .filter(obj => obj.Key.startsWith(folderPath)) // Asegurar que son de project1/
            .map(obj => ({ Key: obj.Key }));

            console.log("📂 Objetos encontrados en S3:", objectsToDelete);
            // Eliminar los objetos
            const deleteResponse = await s3.deleteObjects({
                Bucket: bucketName,
                Delete: { Objects: objectsToDelete }
            }).promise();
            console.log("Respuesta de eliminación:", deleteResponse);
            
            // Verificar si hubo errores en la eliminación
            if (deleteResponse.Errors && deleteResponse.Errors.length > 0) {
                console.error("❌ Algunos archivos no pudieron eliminarse:", deleteResponse.Errors);
                alert("There was an error deleting some files.");
                return false;
            } else {
                return true;
            }

        } catch (error) {
            console.error("Error eliminando datos:", error);
            alert("Hubo un error al intentar eliminar los datos.");
            return false;
        }
    }

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
            Bucket: 'documentations3',
            Prefix: `anonymous/${userId}/project1/`
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
        // Obtener sesion id
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
            console.log(files)
            const contentArray = await Promise.all(files.map(getS3Object)); // Leer archivos
            return contentArray.join("\n\n"); // Unir todo el texto
        } catch (error) {
            console.error("Error al obtener archivos:", error);
            return "";
        }
        }
    
    async function callOpenAI(documentationText, userQuestion, language) {
        const response = await fetch("https://3zjuc0gp83.execute-api.us-east-1.amazonaws.com/prod/document-prod-openai", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ documentationText, userQuestion, language}) // ✅ Enviamos los dos valores esperados
        });
    
        const data = await response.json();
        return data.answer;
    }

    async function checkMicrophoneAccess() {
        try {
            // Revisa si el usuario permitio el acceso al microfono
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    
            // Cerrar el stream inmediatamente para liberar el micrófono
            stream.getTracks().forEach(track => track.stop());
    
            console.log("Micrófono disponible");
            return true;
        } catch (error) {
            console.log("Micrófono NO disponible:", error);
            return false;
        }
    }

    async function sendDataToLambda(user_id_params,event_type_params, session_id_params) {
        const url = "https://7kwity81l3.execute-api.us-east-1.amazonaws.com/dev";
    
        const data = {
            user_id: user_id_params,
            event_type: event_type_params,
            session_id: session_id_params
        };
    
        try {
            const response = await fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(data)
            });
    
            const result = await response.json();
            console.log("Respuesta de Lambda:", result);
        } catch (error) {
            console.error("Error enviando datos a Lambda:", error);
        }
    }

    startButton.addEventListener("click", async () => {
        console.log("Botón de inicio clickeado");
        if (isRecording || isRecordingAsk) return;
    
        const isAllowed = await checkMicrophoneAccess();
    
        if (isAllowed) {
            isRecording = true;
            accumulatedText = "";
            recognition.start();
            output.innerText = "🔴 Listening...";
        } else {
            // Si el micrófono no está disponible, abrir mic.html
            chrome.tabs.create({ url: chrome.runtime.getURL("mic.html") });
        }
    });
    stopButton.addEventListener("click", () => {
        if (!isRecording) return;
        isRecording = false;
        recognition.stop();
        output.innerText += "\n✅Your knowledge has been saved.";

        // Aqui debe estar el condicional pero no se porque
        if (accumulatedText.trim() !== "") {
            subirTextoAS3(accumulatedText); // Subir solo cuando se detiene
            // Metrica Documentar
            sendDataToLambda(userId,"Document",sessionId);
        }
    });
    // Función para los botones de "Ask"
    askStartButton.addEventListener("click", async () => {
        if (isRecordingAsk || isRecording) return;

        const isAllowed = await checkMicrophoneAccess();

        if (isAllowed) {
            isRecordingAsk = true;
            accumulatedText = "";
            recognition.start();
            output.innerText = "🔊 Recording (Ask Mode)...";
        } else {
            // Solicitar permiso
            chrome.tabs.create({ url: chrome.runtime.getURL("mic.html") })
        }          
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
                // Metrica Documentar
                sendDataToLambda(userId,"Ask",sessionId);
            } else{
                // Mostrar el contenido en la interfaz
                //output.innerText += "\nContenido de S3:\n" + text;

                callOpenAI(documentationText, accumulatedText, language)
                    .then(answer => {
                        output.innerText += "\nAnswer:\n" + answer
                        // Convertir text to speach
                        // Objeto
                        const utterance = new SpeechSynthesisUtterance(answer);
                        utterance.lang = language; // Cambia según el idioma ("en-US" para inglés, "es-ES" para español)
                        //lee en voz alta el mensaje
                        speechSynthesis.speak(utterance);
                    })
                    .catch(error => console.error(error));
                // Metrica Documentar
                sendDataToLambda(userId,"Ask",sessionId);
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
        // Obtener sesion id
        let userId = localStorage.getItem("userId");

        const folder_s3 = `anonymous/${userId}/project1/`
        const fileName = `transcripcion-${Date.now()}.txt`;
        const folderFullPath = `${folder_s3}${fileName}`
        const params = {
            Bucket: "documentations3",
            Key: folderFullPath, // Nombre dinámico
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
