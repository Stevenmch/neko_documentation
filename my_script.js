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
    let accumulatedText = "";
    const startButton = document.getElementById("startButton");
    const stopButton = document.getElementById("stopButton");
    const output = document.getElementById("output");

    // Configuración de AWS (No pongas las credenciales aquí, usa Cognito o IAM Roles)
    AWS.config.update({
      accessKeyId: "",
      secretAccessKey: "",
      region: "us-east-1" // Ajusta según tu región
    });
    
    // Ahora puedes crear la instancia de S3
    const s3 = new AWS.S3();

    
    startButton.addEventListener("click", () => {
        console.log("Botón de inicio clickeado");
        if (isRecording) return;
        isRecording = true;
        accumulatedText = "";
        recognition.start();
        output.innerText = "Escuchando...";
    });

    stopButton.addEventListener("click", () => {
        if (!isRecording) return;
        isRecording = false;
        recognition.stop();
        output.innerText += "\nGrabación detenida.";

        // Aqui debe estar el condicional pero no se porque
        if (accumulatedText.trim() !== "") {
            subirTextoAS3(accumulatedText); // Subir solo cuando se detiene
        }
    });


    recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        // Aqui debe acumular el texto, pero no me queda claro como es capaz de mostrar todo el texto en la interfax
        accumulatedText += transcript + " ";
        output.innerText += `\n${transcript}`;
    };

    recognition.onend = () => {
        if (isRecording) recognition.start();
    };

    recognition.onerror = (event) => {
        output.innerText = `Error: ${event.error}`;
        isRecording = false;
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
}
