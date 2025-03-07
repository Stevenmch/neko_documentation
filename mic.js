async function requestMicrophone() {
    try {
        await navigator.mediaDevices.getUserMedia({ audio: true });
        console.log("✅ Micrófono permitido");

        window.parent.postMessage({ microphone: "granted" }, "*");
    } catch (error) {
        console.log("❌ Micrófono denegado");
        
        window.parent.postMessage({ microphone: "denied" }, "*");
    }
}

// Ejecutar solicitud de micrófono automáticamente cuando se cargue la página
requestMicrophone();

// Permitir reintentar si el botón vuelve a ser presionado
window.addEventListener("message", (event) => {
    if (event.data.requestMic) {
        requestMicrophone();
    }
});
