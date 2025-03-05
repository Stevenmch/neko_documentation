async function requestMicrophone() {
    try {
        await navigator.mediaDevices.getUserMedia({ audio: true });
        console.log("✅ Micrófono permitido");

        // Guardamos el estado en chrome.storage
        chrome.storage.local.set({ micPermission: true });

        window.parent.postMessage({ microphone: "granted" }, "*");
    } catch (error) {
        console.log("❌ Micrófono denegado");

        // Guardamos que el usuario lo denegó
        chrome.storage.local.set({ micPermission: false });
        
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
