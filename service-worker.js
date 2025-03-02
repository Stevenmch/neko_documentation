// Permite al usuario abrir el panel haciendo click en el icono o usando el atajo
chrome.sidePanel
  .setPanelBehavior({ openPanelOnActionClick: true })
  .catch((error) => console.error(error));
