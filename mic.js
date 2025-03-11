async function requestMicrophone() {
    try {
        await navigator.mediaDevices.getUserMedia({ audio: true });
        console.log("✅ Micrófono permitido");

        // Crear y mostrar el mensaje en la página
        const message = document.createElement("p");
        message.textContent = "Cuando permitas el acceso al micrófono, ya puedes cerrar esta pestaña.";

        // Aplicar estilos para mejor visibilidad
        message.style.color = "white"; // Para que sea visible en el fondo negro
        message.style.fontSize = "20px"; // Texto más grande
        message.style.textAlign = "center";
        message.style.marginTop = "20px";
        message.style.padding = "10px";
        message.style.position = "fixed";
        message.style.top = "10%"; // Centrado verticalmente
        message.style.left = "150px"; // Ajuste para evitar que quede detrás del panel lateral
        message.style.transform = "translateY(-50%)"; // Ajuste fino para centrado vertical
        message.style.maxWidth = "calc(100% - 260px)"; // Para que no se salga de la pantalla
        document.body.appendChild(message);

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
