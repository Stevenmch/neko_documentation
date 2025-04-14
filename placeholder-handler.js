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
      console.log("Respuesta de la función:", result);

      // Aquí podrías mostrar el resultado en pantalla si quieres
      alert("Documentación generada:\n\n" + result);
    } catch (err) {
      console.error("Error al enviar el código:", err);
      alert("Hubo un error al generar la documentación.");
    }
    // Aquí podrías enviar el código a tu backend o a la API de ChatGPT
  });
});
