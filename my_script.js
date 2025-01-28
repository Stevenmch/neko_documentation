// Verifica compatibilidad con SpeechRecognition
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

if (!SpeechRecognition) {
  alert("Tu navegador no soporta el reconocimiento de voz.");
} else {
  // Inicializa reconocimiento de voz
  const recognition = new SpeechRecognition();
  recognition.lang = "es-ES";
  recognition.continuous = false;
  recognition.interimResults = false;

  // Variables
  let isRecording = false;
  const startButton = document.getElementById("startButton");
  const stopButton = document.getElementById("stopButton");
  const output = document.getElementById("output");

  // Iniciar grabación
  startButton.addEventListener("click", () => {
    if (isRecording) return;
    isRecording = true;
    recognition.start();
    output.innerText = "Escuchando...";
  });

  // Detener grabación
  stopButton.addEventListener("click", () => {
    if (!isRecording) return;
    isRecording = false;
    recognition.stop();
    output.innerText += "\nGrabación detenida.";
  });

  // Texto reconocido
  recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript;
    output.innerText += `\n${transcript}`;
  };

  // Reiniciar si sigue activo
  recognition.onend = () => {
    if (isRecording) recognition.start();
  };

  // Manejo de errores
  recognition.onerror = (event) => {
    output.innerText = `Error: ${event.error}`;
    isRecording = false;
  };
}
