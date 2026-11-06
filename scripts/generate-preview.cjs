// Script para generar preview.png combinando screenshot y logo
// Requisitos: npm install sharp
const sharp = require('sharp');
const path = require('path');

// Rutas de entrada
const screenshot = path.join(__dirname, '..', 'static', 'screenshot.png'); // Renombra tu screenshot así
const logo = path.join(__dirname, '..', 'static', 'logo.png'); // Renombra tu logo así
const output = path.join(__dirname, '..', 'static', 'preview.png');

// Opciones
const WIDTH = 1200;
const HEIGHT = 630;
const LOGO_SIZE = 180;
const LOGO_MARGIN = 32;
const TITLE = 'GCSim to GO-MultiOpt';

(async () => {
  // Redimensiona screenshot
  const base = await sharp(screenshot)
    .resize(WIDTH, HEIGHT, { fit: 'cover' })
    .toBuffer();

  // Redimensiona logo
  const logoBuf = await sharp(logo)
    .resize(LOGO_SIZE, LOGO_SIZE)
    .png()
    .toBuffer();

  // Agrega logo y texto
  let composite = [
    { input: logoBuf, top: HEIGHT - LOGO_SIZE - LOGO_MARGIN, left: WIDTH - LOGO_SIZE - LOGO_MARGIN }
  ];

  // Renderiza texto en SVG
  const svgText = `<svg width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}" xmlns="http://www.w3.org/2000/svg">
    <style>
      .title { fill: #7bb3ff; font-size: 64px; font-family: 'Segoe UI', 'Arial', sans-serif; font-weight: bold; text-shadow: 2px 2px 6px #222; }
    </style>
    <text x="50%" y="100" text-anchor="middle" class="title">${TITLE}</text>
  </svg>`;

  composite.push({ input: Buffer.from(svgText), top: 0, left: 0 });

  await sharp(base)
    .composite(composite)
    .png()
    .toFile(output);

  console.log('Imagen preview generada: static/preview.png');
})();
