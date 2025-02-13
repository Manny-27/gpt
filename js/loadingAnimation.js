
// export function startLoadingAnimation(element) {
//     let dots = 0;
//     const originalText = element.textContent; // Guardar el texto original
  
//     // Intervalo para cambiar los puntos
//     const interval = setInterval(() => {
//       dots = (dots + 1) % 4; // Ciclo entre 0, 1, 2, 3
//       element.textContent = originalText + ".".repeat(dots); // Actualizar el texto
//     }, 500); // Cambiar cada 500ms
  
//     // Devolver una función para detener la animación
//     return () => {
//       clearInterval(interval); // Detener el intervalo
//       element.textContent = originalText; // Restaurar el texto original
//     };
//   }

export function startLoadingAnimation($whoElement) {
    $whoElement.classList.add("loading-animation");
  }
  
  export function stopLoadingAnimation($whoElement) {
    $whoElement.classList.remove("loading-animation");
  }
  