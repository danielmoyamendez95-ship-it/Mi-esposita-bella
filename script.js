function generar() {
  const img = new Image();
  img.src = "imagen.jpg";

  img.onload = function () {
    const canvas = document.getElementById("canvas");
    const ctx = canvas.getContext("2d");

    const scale = 0.08; // 🔥 controla lo pixelado

    const w = img.width * scale;
    const h = img.height * scale;

    // Paso 1: reducir imagen
    canvas.width = w;
    canvas.height = h;

    ctx.drawImage(img, 0, 0, w, h);

    // Guardar pixeles
    const imageData = ctx.getImageData(0, 0, w, h);

    // Paso 2: escalar grande sin suavizado
    canvas.width = img.width;
    canvas.height = img.height;

    ctx.imageSmoothingEnabled = false;

    ctx.putImageData(imageData, 0, 0);
    ctx.drawImage(canvas, 0, 0, w, h, 0, 0, img.width, img.height);
  };
}
