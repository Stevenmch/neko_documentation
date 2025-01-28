// Verifica compatibilidad con SpeechRecognition
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

if (!SpeechRecognition) {
  alert("Tu navegador no soporta el reconocimiento de voz.");
} else {
  // Inicializa reconocimiento de voz
  const recognition = new SpeechRecognition();
  recognition.lang = "es-ES"; // Configura idioma a español
  recognition.continuous = false; // Una sola grabación por botón
  recognition.interimResults = false; // Solo resultados finales

  // Variables
  let isRecording = false; // Controla el estado de la grabación
  const startButton = document.getElementById("startButton");
  const output = document.getElementById("output");

  // Maneja clic en el botón
  startButton.addEventListener("click", () => {
    if (isRecording) {
      console.log("Grabación ya en curso.");
      return;
    }

    console.log("Iniciando grabación...");
    isRecording = true;
    recognition.start(); // Inicia el reconocimiento de voz
    output.innerText = "Escuchando...";
  });

  // Texto reconocido
  recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript; // Obtiene texto
    console.log("Texto reconocido:", transcript);
    output.innerText = `Texto reconocido: ${transcript}`;
  };

  // Reconocimiento terminado
  recognition.onend = () => {
    console.log("Grabación detenida.");
    isRecording = false;
  };

  // Manejo de errores
  recognition.onerror = (event) => {
    console.error("Error de reconocimiento:", event.error);
    output.innerText = `Error: ${event.error}`;
    isRecording = false;
  };
}
