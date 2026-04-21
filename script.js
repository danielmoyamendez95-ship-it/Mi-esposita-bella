// BOTONES
const btn = document.getElementById("btn");
const muteBtn = document.getElementById("muteBtn");

btn.addEventListener("click", () => {
  iniciarSonido();
  generar();
});

// 🔊 AUDIO
let audioCtx = null;
let isMuted = false;
let intervalMelodia = null;

// 🎵 notas
const notas = {
  C4: 261,
  D4: 293,
  E4: 329,
  F4: 349,
  G4: 392,
  A4: 440,
  B4: 493,
  C5: 523,
  D5: 587
};

// 🕷️ melodía más estilo Spiderman
const melodia = [
  "E4","G4","A4","C5",
  "B4","A4","G4","E4",

  "G4","A4","C5","D5",
  "C5","A4","G4","E4",

  "E4","G4","A4","C5",
  "B4","A4","G4","E4"
];

// 🔘 MUTE
muteBtn.addEventListener("click", () => {
  isMuted = !isMuted;
  muteBtn.innerText = isMuted ? "🔇 Sonido OFF" : "🔊 Sonido ON";

  if (isMuted) detenerSonido();
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

    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.type = "square";
    osc.frequency.value = notas[melodia[i]];

    gain.gain.value = 0.12;

    osc.connect(gain);
    gain.connect(audioCtx.destination);

    osc.start();
    osc.stop(audioCtx.currentTime + 0.15);

    i = (i + 1) % melodia.length;

  }, 110);
}

function detenerSonido() {
  if (intervalMelodia) {
    clearInterval(intervalMelodia);
    intervalMelodia = null;
  }
}

// 🎮 FUNCIÓN MEJORADA (NO MATA COLOR)
function quantizeColor(r, g, b) {
  const levels = 6; // 🔥 más niveles = más color
  const step = 255 / (levels - 1);

  r = Math.round(r / step) * step;
  g = Math.round(g / step) * step;
  b = Math.round(b / step) * step;

  return [r, g, b];
}

// 🎨 GENERAR
function generar() {
  const img = new Image();
  img.src = "imagen.jpg";

  const barra = document.getElementById("barra");
  const texto = document.getElementById("textoProgreso");

  img.onerror = () => alert("❌ No se encontró la imagen");

  img.onload = function () {

    const canvas = document.getElementById("canvas");
    const ctx = canvas.getContext("2d");

    const scale = 0.15; // 🔥 MÁS DETALLE

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

      // 🔥 BOOST COLOR (clave)
      r = Math.min(255, r * 1.2);
      g = Math.min(255, g * 1.2);
      b = Math.min(255, b * 1.2);

      // 🎮 cuantización sin perder color
      [r, g, b] = quantizeColor(r, g, b);

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
