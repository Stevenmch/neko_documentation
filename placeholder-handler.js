document.addEventListener("DOMContentLoaded", () => {
  const dropArea = document.getElementById("drop-area");
  const placeholder = document.getElementById("placeholder-text");
  const sendButton = document.getElementById("send-button");

  const CLOUD_FUNCTION_URL = "https://callgemini-397605286686.us-central1.run.app";


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
  sendButton.addEventListener("click", async () => {
    const code = dropArea.textContent.replace(/\s/g, '');
    console.log("Código a documentar:", code);
    try {
      const response = await fetch(CLOUD_FUNCTION_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ code }),
      });

      const result = await response.text();
      
      // creamos el archivo Markdown
      const blob = new Blob([result], { type: 'text/markdown' });
      const url = URL.createObjectURL(blob);

      // Creamos el enlace de descarga
      const a = document.createElement('a');
      a.href = url;
      a.download = 'documentacion.md'; // nombre del archivo
      a.click();

      // Liberamos el objeto URL
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Error al enviar el código:", err);
    }
    // Aquí podrías enviar el código a tu backend o a la API de ChatGPT
  });
});
