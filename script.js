document.getElementById("btn").addEventListener("click", generar);

const muteBtn = document.getElementById("muteBtn");

let audioCtx;
let oscillator;
let isMuted = false;

// 🎮 PALETA 8-BIT
const palette = [
  [0, 0, 0],
  [255, 255, 255],
  [136, 0, 0],
  [170, 255, 238],
  [204, 68, 204],
  [0, 204, 85],
  [0, 0, 170],
  [238, 238, 119],
  [221, 136, 85],
  [102, 68, 0],
  [255, 119, 119],
  [51, 51, 51],
  [119, 119, 119],
  [170, 255, 102],
  [0, 136, 255],
  [187, 187, 187]
];

function getClosestColor(r, g, b) {
  let minDist = Infinity;
  let closest = palette[0];

  for (let p of palette) {
    const dr = r - p[0];
    const dg = g - p[1];
    const db = b - p[2];
    const dist = dr * dr + dg * dg + db * db;

    if (dist < minDist) {
      minDist = dist;
      closest = p;
    }
  }

  return closest;
}

// 🔘 MUTE
muteBtn.addEventListener("click", () => {
  isMuted = !isMuted;
  muteBtn.innerText = isMuted ? "🔇 Sonido OFF" : "🔊 Sonido ON";

  if (isMuted) detenerSonido();
});

// 🔊 SONIDO
function iniciarSonido() {
  if (isMuted) return;

  audioCtx = new (window.AudioContext || window.webkitAudioContext)();

  oscillator = audioCtx.createOscillator();
  const gainNode = audioCtx.createGain();

  oscillator.type = "square";
  oscillator.frequency.setValueAtTime(600, audioCtx.currentTime);

  gainNode.gain.setValueAtTime(0.05, audioCtx.currentTime);

  oscillator.connect(gainNode);
  gainNode.connect(audioCtx.destination);

  oscillator.start();
}

function detenerSonido() {
  if (oscillator) {
    oscillator.stop();
    oscillator.disconnect();
    oscillator = null;
  }
}

// 🎨 GENERAR
function generar() {
  const img = new Image();
  img.src = "imagen.jpg";

  const barra = document.getElementById("barra");
  const texto = document.getElementById("textoProgreso");

  img.onerror = () => alert("❌ No se encontró la imagen");

  img.onload = function () {

    iniciarSonido();

    const canvas = document.getElementById("canvas");
    const ctx = canvas.getContext("2d");

    const scale = 0.08;

    const w = Math.floor(img.width * scale);
    const h = Math.floor(img.height * scale);

    const tempCanvas = document.createElement("canvas");
    const tctx = tempCanvas.getContext("2d");

    tempCanvas.width = w;
    tempCanvas.height = h;

    tctx.drawImage(img, 0, 0, w, h);

    const data = tctx.getImageData(0, 0, w, h).data;

    canvas.width = img.width;
    canvas.height = img.height;

    ctx.imageSmoothingEnabled = false;

    const pixelSize = Math.floor(img.width / w);

    let pixels = [];

    for (let yy = 0; yy < h; yy++) {
      for (let xx = 0; xx < w; xx++) {
        pixels.push({ x: xx, y: yy });
      }
    }

    // 🎨 orden aleatorio (efecto mano)
    pixels.sort(() => Math.random() - 0.5);

    let i = 0;
    const total = pixels.length;

    function dibujarPixel() {
      if (i >= total) {
        texto.innerText = "✅ Completado";
        barra.style.width = "100%";
        detenerSonido();
        return;
      }

      const { x, y } = pixels[i];
      const index = (y * w + x) * 4;

      let r = data[index];
      let g = data[index + 1];
      let b = data[index + 2];
      const a = data[index + 3] / 255;

      // 🎮 aplicar 8-bit
      [r, g, b] = getClosestColor(r, g, b);

      ctx.fillStyle = `rgba(${r},${g},${b},${a})`;
      ctx.fillRect(
        x * pixelSize,
        y * pixelSize,
        pixelSize,
        pixelSize
      );

      i++;

      const porcentaje = Math.floor((i / total) * 100);
      barra.style.width = porcentaje + "%";
      texto.innerText = "Generando... " + porcentaje + "%";

      setTimeout(dibujarPixel, 1);
    }

    dibujarPixel();
  };
}
