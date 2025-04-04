document.addEventListener("DOMContentLoaded", () => {
    const dropArea = document.getElementById("drop-area");
    const placeholder = document.getElementById("placeholder-text");
  
    function updatePlaceholder() {
      const content = dropArea.textContent.replace(/\s/g, '');
      if (content.length > 0) {
        placeholder.classList.add("hidden");
      } else {
        placeholder.classList.remove("hidden");
      }
    }
  
    // Escuchar cuando el usuario escribe o pega
    dropArea.addEventListener("input", updatePlaceholder);
    dropArea.addEventListener("paste", () => {
      setTimeout(updatePlaceholder, 0); // esperar a que se pegue el contenido
    });
  
    updatePlaceholder(); // Ejecutar al cargar
  });
