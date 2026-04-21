document.getElementById("btn").addEventListener("click", generar);

function generar() {
  const img = new Image();
  img.src = "imagen.jpg";

  img.onerror = () => alert("❌ No se encontró la imagen");

  img.onload = function () {
    const canvas = document.getElementById("canvas");
    const ctx = canvas.getContext("2d");

    const scale = 0.08;

    const w = Math.floor(img.width * scale);
    const h = Math.floor(img.height * scale);

    // Canvas temporal (imagen pequeña)
    const tempCanvas = document.createElement("canvas");
    const tctx = tempCanvas.getContext("2d");

    tempCanvas.width = w;
    tempCanvas.height = h;

    tctx.drawImage(img, 0, 0, w, h);

    const data = tctx.getImageData(0, 0, w, h).data;

    // Canvas final
    canvas.width = img.width;
    canvas.height = img.height;

    ctx.imageSmoothingEnabled = false;

    const pixelSize = Math.floor(img.width / w);

    // Crear lista de píxeles
    let pixels = [];

    for (let yy = 0; yy < h; yy++) {
      for (let xx = 0; xx < w; xx++) {
        pixels.push({ x: xx, y: yy });
      }
    }

    // 🔥 Mezclar para efecto "dibujado a mano"
    pixels.sort(() => Math.random() - 0.5);

    let i = 0;

    function dibujarPixel() {
      if (i >= pixels.length) return;

      const { x, y } = pixels[i];

      const index = (y * w + x) * 4;

      const r = data[index];
      const g = data[index + 1];
      const b = data[index + 2];
      const a = data[index + 3] / 255;

      ctx.fillStyle = `rgba(${r},${g},${b},${a})`;
      ctx.fillRect(
        x * pixelSize,
        y * pixelSize,
        pixelSize,
        pixelSize
      );

      i++;

      // 🎨 velocidad (ajusta aquí)
      setTimeout(dibujarPixel, 1);
    }

    dibujarPixel();
  };
}
