document.addEventListener("DOMContentLoaded", () => {
  const dropArea = document.getElementById("drop-area");
  const placeholder = document.getElementById("placeholder-text");
  const sendButton = document.getElementById("send-button");

  function updatePlaceholder() {
    const content = dropArea.textContent.replace(/\s/g, '');
    if (content.length > 0) {
      placeholder.classList.add("hidden");
      sendButton.disabled = false;
      sendButton.classList.add("enabled");
    } else {
      placeholder.classList.remove("hidden");
      sendButton.disabled = true;
      sendButton.classList.remove("enabled");
    }
  }

  // Escuchar cuando el usuario escribe o pega
  dropArea.addEventListener("input", updatePlaceholder);
  dropArea.addEventListener("paste", () => {
    setTimeout(updatePlaceholder, 0); // esperar a que se pegue el contenido
  });

  updatePlaceholder(); // Ejecutar al cargar
  // Acción cuando se hace clic en el botón
  sendButton.addEventListener("click", () => {
    const code = dropArea.textContent.replace(/\s/g, '');
    console.log("Código a documentar:", code);

    // Aquí podrías enviar el código a tu backend o a la API de ChatGPT
  });
});
