// BOTONES
const btn = document.getElementById("btn");
const muteBtn = document.getElementById("muteBtn");
const downloadBtn = document.getElementById("downloadBtn");

// =======================
// 🔊 AUDIO SPIDERMAN AUTO
// =======================
let audioCtx = null;
let isMuted = false;
let intervalMelodia = null;

const notas = {
  C4: 261, D4: 293, E4: 329,
  F4: 349, G4: 392, A4: 440,
  B4: 493, C5: 523, D5: 587
};

// 🕷️ patrón más reconocible (ritmo clave)
const melodia = [
  "E4","E4","G4","A4",
  "G4","E4","D4","E4",

  "E4","E4","G4","A4",
  "C5","B4","A4","G4",

  "G4","A4","C5","D5",
  "C5","A4","G4","E4"
];

// 🔘 MUTE
muteBtn.addEventListener("click", () => {
  isMuted = !isMuted;
  muteBtn.innerText = isMuted ? "🔇 Sonido OFF" : "🔊 Sonido ON";
  if (isMuted) detenerSonido();
});

// ▶️ INICIAR
btn.addEventListener("click", () => {
  iniciarSonido();
  generar();
});

function iniciarSonido() {
  if (isMuted) return;

  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }

  if (audioCtx.state === "suspended") {
    audioCtx.resume();
  }

  let i = 0;

  intervalMelodia = setInterval(() => {
    if (isMuted) return;

    const nota = melodia[i];

    // 🎵 principal
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.type = "square";
    osc.frequency.value = notas[nota];
    gain.gain.value = 0.12;

    // 🔊 bajo
    const bass = audioCtx.createOscillator();
    const bassGain = audioCtx.createGain();

    bass.type = "triangle";
    bass.frequency.value = notas[nota] / 2;
    bassGain.gain.value = 0.06;

    osc.connect(gain);
    bass.connect(bassGain);

    gain.connect(audioCtx.destination);
    bassGain.connect(audioCtx.destination);

    osc.start();
    bass.start();

    osc.stop(audioCtx.currentTime + 0.16);
    bass.stop(audioCtx.currentTime + 0.16);

    i = (i + 1) % melodia.length;

  }, 125);
}

function detenerSonido() {
  if (intervalMelodia) {
    clearInterval(intervalMelodia);
    intervalMelodia = null;
  }
}

// =======================
// 💾 DESCARGA
// =======================
downloadBtn.addEventListener("click", () => {
  const canvas = document.getElementById("canvas");

  if (!canvas || canvas.width === 0) {
    alert("Primero genera la imagen 😉");
    return;
  }

  const link = document.createElement("a");
  link.download = "Lys_pixel_art.png";
  link.href = canvas.toDataURL("image/png");
  link.click();
});

// =======================
// 🎮 COLOR
// =======================
function quantizeColor(r, g, b) {
  const levels = 6;
  const step = 255 / (levels - 1);

  r = Math.round(r / step) * step;
  g = Math.round(g / step) * step;
  b = Math.round(b / step) * step;

  return [r, g, b];
}

// =======================
// 🎨 GENERAR
// =======================
function generar() {
  const img = new Image();
  img.src = "imagen.jpg";

  const barra = document.getElementById("barra");
  const texto = document.getElementById("textoProgreso");

  img.onload = function () {

    const canvas = document.getElementById("canvas");
    const ctx = canvas.getContext("2d");

    const scale = 0.15;

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

    pixels.sort(() => Math.random() - 0.5);

    let i = 0;
    const total = pixels.length;

    // ⚡ VELOCIDAD X4
    function dibujarPixel() {
      const velocidad = 4;

      for (let v = 0; v < velocidad; v++) {

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

        r = Math.min(255, r * 1.2);
        g = Math.min(255, g * 1.2);
        b = Math.min(255, b * 1.2);

        [r, g, b] = quantizeColor(r, g, b);

        ctx.fillStyle = `rgba(${r},${g},${b},${a})`;
        ctx.fillRect(
          x * pixelSize,
          y * pixelSize,
          pixelSize,
          pixelSize
        );

        i++;
      }

      const porcentaje = Math.floor((i / total) * 100);
      barra.style.width = porcentaje + "%";
      texto.innerText = "Generando... " + porcentaje + "%";

      requestAnimationFrame(dibujarPixel);
    }

    dibujarPixel();
  };
}
