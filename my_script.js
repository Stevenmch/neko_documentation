document.addEventListener("DOMContentLoaded", () => {
  const startButton = document.getElementById("start");
  const stopButton = document.getElementById("stop");
  const output = document.getElementById("output");

  // Comprueba si el navegador soporta la API
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

  if (!SpeechRecognition) {
    alert("Lo siento, tu navegador no soporta la API de Web Speech.");
    startButton.disabled = true;
    return;
  }

  // Inicializa la API de reconocimiento de voz
  const recognition = new SpeechRecognition();
  recognition.lang = "es-ES"; // Configura el idioma
  recognition.interimResults = true; // Muestra resultados parciales
  recognition.continuous = true; // Habilita el reconocimiento continuo

  // Almacena si el reconocimiento está activo
  let isRecording = false;

  // Inicia la grabación
  startButton.addEventListener("click", () => {
    if (isRecording) return;

    console.log("Iniciando la grabación...");
    isRecording = true;
    recognition.start();
    startButton.style.display = "none";
    stopButton.style.display = "inline-block";
    output.innerText = "Escuchando...";
  });

  // Detiene la grabación
  stopButton.addEventListener("click", () => {
    if (!isRecording) return;

    console.log("Deteniendo la grabación...");
    isRecording = false;
    recognition.stop();
    startButton.style.display = "inline-block";
    stopButton.style.display = "none";
    output.innerText += " (Grabación detenida)";
  });

  // Maneja los resultados de la grabación
  recognition.onresult = (event) => {
    let transcript = "";
    for (const result of event.results) {
      transcript += result[0].transcript + " ";
    }
    output.innerText = transcript.trim();
    console.log("Texto transcrito:", transcript);
  };

  // Maneja errores
  recognition.onerror = (event) => {
    console.error("Error en el reconocimiento:", event.error);
    alert(`Error: ${event.error}`);
    stopButton.click(); // Detener la grabación en caso de error
  };

  // Cuando termina la grabación automáticamente
  recognition.onend = () => {
    if (isRecording) {
      isRecording = false;
      startButton.style.display = "inline-block";
      stopButton.style.display = "none";
      output.innerText += " (Reconocimiento terminado)";
      console.log("El reconocimiento ha terminado.");
    }
  };
});
