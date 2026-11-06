/**
 * Script to generate static/preview.png (1200x630 OpenGraph / Discord Embed Image)
 * Design: Option C - 3D Perspective UI Mockup + Mascot Showcase
 */
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const WIDTH = 1200;
const HEIGHT = 630;

const mascotPath = path.join(__dirname, '..', 'static', 'GCSim-to-GO.png');
const outputPath = path.join(__dirname, '..', 'static', 'preview.png');
const tempHtmlPath = path.join(__dirname, 'temp-preview.html');

const mascotBase64 = fs.readFileSync(mascotPath).toString('base64');
const mascotDataUri = `data:image/png;base64,${mascotBase64}`;

const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@500;600;700;800&family=JetBrains+Mono:wght@500;600;700&display=swap');

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    html, body {
      width: ${WIDTH}px;
      height: ${HEIGHT}px;
      overflow: hidden;
      font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif;
      background: #080b14;
      color: #f8fafc;
      -webkit-font-smoothing: antialiased;
    }

    .canvas {
      position: relative;
      width: ${WIDTH}px;
      height: ${HEIGHT}px;
      background: linear-gradient(135deg, #070a12 0%, #0f172a 50%, #090d16 100%);
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 56px;
      overflow: hidden;
    }

    /* Subtle Dot Grid */
    .grid-bg {
      position: absolute;
      inset: 0;
      background-image: radial-gradient(rgba(255, 255, 255, 0.07) 1px, transparent 1px);
      background-size: 28px 28px;
      opacity: 0.55;
      pointer-events: none;
    }

    /* Ambient Glows */
    .glow-left {
      position: absolute;
      left: -60px;
      bottom: -60px;
      width: 480px;
      height: 480px;
      background: radial-gradient(circle, rgba(37, 99, 235, 0.28) 0%, transparent 70%);
      filter: blur(40px);
      pointer-events: none;
    }

    .glow-right {
      position: absolute;
      right: 40px;
      top: 30px;
      width: 520px;
      height: 520px;
      background: radial-gradient(circle, rgba(99, 102, 241, 0.24) 0%, rgba(56, 189, 248, 0.12) 50%, transparent 72%);
      filter: blur(45px);
      pointer-events: none;
    }

    /* Left Column: Mascot + Branding */
    .left-col {
      position: relative;
      z-index: 20;
      width: 43%;
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
    }

    .mascot-wrap {
      position: relative;
      display: flex;
      justify-content: center;
      align-items: center;
      margin-bottom: 14px;
    }

    .mascot-halo {
      display: none;
    }

    .mascot-img {
      position: relative;
      width: 285px;
      height: auto;
      -webkit-mask-image: radial-gradient(closest-side, #000 82%, transparent 99%);
      mask-image: radial-gradient(closest-side, #000 82%, transparent 99%);
      filter: drop-shadow(0 18px 30px rgba(0, 0, 0, 0.85));
    }

    .brand-title {
      font-size: 40px;
      font-weight: 800;
      letter-spacing: -0.025em;
      line-height: 1.15;
      color: #ffffff;
      margin-bottom: 10px;
      text-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
    }

    .brand-title .accent {
      background: linear-gradient(90deg, #38bdf8 0%, #818cf8 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    .brand-desc {
      font-size: 15.5px;
      font-weight: 500;
      color: #cbd5e1;
      line-height: 1.5;
      max-width: 390px;
      margin-bottom: 16px;
    }

    .author-pill {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 6px 16px;
      border-radius: 9999px;
      background: rgba(15, 23, 42, 0.85);
      border: 1px solid rgba(99, 102, 241, 0.35);
      font-size: 13px;
      font-weight: 600;
      color: #94a3b8;
      box-shadow: 0 4px 14px rgba(0, 0, 0, 0.4);
    }

    .author-pill span {
      color: #818cf8;
      font-weight: 700;
    }

    /* Right Column: 3D Tilted UI Window */
    .right-col {
      position: relative;
      z-index: 10;
      width: 55%;
      display: flex;
      justify-content: center;
      align-items: center;
    }

    .window-3d {
      width: 100%;
      transform: perspective(1150px) rotateX(8deg) rotateY(-13deg) rotateZ(1.8deg);
      background: rgba(17, 23, 40, 0.95);
      border: 2px solid rgba(99, 102, 241, 0.48);
      border-radius: 22px;
      padding: 24px;
      box-shadow:
        24px 32px 65px rgba(0, 0, 0, 0.85),
        0 0 40px rgba(99, 102, 241, 0.18),
        inset 0 1px 1px rgba(255, 255, 255, 0.12);
    }

    /* Window Header */
    .win-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding-bottom: 16px;
      margin-bottom: 18px;
      border-bottom: 1px solid rgba(51, 65, 85, 0.65);
    }

    .win-dots {
      display: flex;
      gap: 8px;
    }

    .dot {
      width: 12px;
      height: 12px;
      border-radius: 50%;
    }
    .dot.red { background: #f43f5e; }
    .dot.amber { background: #f59e0b; }
    .dot.green { background: #10b981; }

    .win-file {
      font-family: 'JetBrains Mono', monospace;
      font-size: 13px;
      font-weight: 600;
      color: #94a3b8;
      background: rgba(15, 23, 42, 0.8);
      padding: 4px 12px;
      border-radius: 8px;
      border: 1px solid rgba(51, 65, 85, 0.7);
    }

    /* Section Header inside Window */
    .sec-bar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 12px;
    }

    .sec-title {
      font-size: 12px;
      font-weight: 800;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: #cbd5e1;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .sec-num {
      width: 20px;
      height: 20px;
      border-radius: 50%;
      background: rgba(99, 102, 241, 0.2);
      border: 1px solid rgba(99, 102, 241, 0.5);
      color: #818cf8;
      font-size: 11px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .status-badges {
      display: flex;
      gap: 6px;
    }

    .badge-inc {
      font-size: 11px;
      font-weight: 700;
      padding: 2px 9px;
      border-radius: 999px;
      background: rgba(16, 185, 129, 0.16);
      color: #34d399;
      border: 1px solid rgba(16, 185, 129, 0.35);
    }

    .badge-ign {
      font-size: 11px;
      font-weight: 700;
      padding: 2px 9px;
      border-radius: 999px;
      background: rgba(244, 63, 94, 0.16);
      color: #fb7185;
      border: 1px solid rgba(244, 63, 94, 0.35);
    }

    /* Modifier Chips Grid */
    .chips-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
      margin-bottom: 20px;
      font-family: 'JetBrains Mono', monospace;
      font-size: 13px;
      font-weight: 600;
    }

    .chip {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 10px 14px;
      border-radius: 10px;
    }

    .chip.active {
      background: rgba(6, 78, 59, 0.38);
      border: 1px solid rgba(16, 185, 129, 0.45);
      color: #ecfdf5;
    }

    .chip.active .chip-tag {
      font-size: 11px;
      color: #34d399;
      background: rgba(16, 185, 129, 0.18);
      padding: 2px 7px;
      border-radius: 5px;
    }

    .chip.ignored {
      background: rgba(76, 5, 25, 0.35);
      border: 1px solid rgba(244, 63, 94, 0.4);
      color: #fda4af;
    }

    .chip.ignored .chip-name {
      text-decoration: line-through;
      opacity: 0.75;
    }

    .chip.ignored .chip-tag {
      font-size: 11px;
      color: #fb7185;
      background: rgba(244, 63, 94, 0.18);
      padding: 2px 7px;
      border-radius: 5px;
    }

    /* Code Output Box */
    .code-box {
      background: #090d16;
      border: 1px solid rgba(51, 65, 85, 0.8);
      border-radius: 14px;
      padding: 16px 18px;
      font-family: 'JetBrains Mono', monospace;
      font-size: 13px;
      line-height: 1.65;
      color: #cbd5e1;
      position: relative;
    }

    .copy-pill {
      position: absolute;
      top: 12px;
      right: 12px;
      font-family: 'Plus Jakarta Sans', sans-serif;
      font-size: 11px;
      font-weight: 700;
      padding: 4px 10px;
      border-radius: 7px;
      background: linear-gradient(135deg, #6366f1 0%, #3b82f6 100%);
      color: #ffffff;
      box-shadow: 0 4px 12px rgba(99, 102, 241, 0.4);
    }

    .c-key { color: #c084fc; }
    .c-str { color: #fde047; }
    .c-prop { color: #38bdf8; }
    .c-val { color: #34d399; }
  </style>
</head>
<body>
  <div class="canvas">
    <div class="grid-bg"></div>
    <div class="glow-left"></div>
    <div class="glow-right"></div>

    <!-- Left Branding & Mascot -->
    <div class="left-col">
      <div class="mascot-wrap">
        <div class="mascot-halo"></div>
        <img class="mascot-img" src="${mascotDataUri}" alt="Mascot" />
      </div>
      <h1 class="brand-title">
        GCSim to <span class="accent">GO-MultiOpt</span>
      </h1>
      <p class="brand-desc">
        Drop your simulation file, filter team buffs, and optimize your build in Genshin Optimizer.
      </p>
      <div class="author-pill">
        Enhanced by <span>DarkJake#6238</span>
      </div>
    </div>

    <!-- Right 3D Tilted UI Window -->
    <div class="right-col">
      <div class="window-3d">
        <div class="win-header">
          <div class="win-dots">
            <span class="dot red"></span>
            <span class="dot amber"></span>
            <span class="dot green"></span>
          </div>
          <span class="win-file">simulation_config.gz</span>
        </div>

        <div class="sec-bar">
          <div class="sec-title">
            <span class="sec-num">2</span>
            Simulation Modifiers &amp; Buffs
          </div>
          <div class="status-badges">
            <span class="badge-inc">12 Active</span>
            <span class="badge-ign">1 Ignored</span>
          </div>
        </div>

        <div class="chips-grid">
          <div class="chip active">
            <span>✓ mh-4pc</span>
            <span class="chip-tag">Active</span>
          </div>
          <div class="chip active">
            <span>✓ furina-burst</span>
            <span class="chip-tag">Active</span>
          </div>
          <div class="chip active">
            <span>✓ kazuha-c2</span>
            <span class="chip-tag">Active</span>
          </div>
          <div class="chip ignored">
            <span class="chip-name">✕ widsith-r5</span>
            <span class="chip-tag">Ignored</span>
          </div>
        </div>

        <div class="code-box">
          <div class="copy-pill">Copy Config</div>
          <div>{ <span class="c-key">"name"</span>: <span class="c-str">"Custom Multi-Opt (1)"</span>,</div>
          <div>&nbsp;&nbsp;<span class="c-prop">"targets"</span>: [{</div>
          <div>&nbsp;&nbsp;&nbsp;&nbsp;<span class="c-val">"weight"</span>: <span class="c-str">14.2</span>, <span class="c-val">"path"</span>: [<span class="c-str">"charged"</span>, <span class="c-str">"dmg"</span>]</div>
          <div>&nbsp;&nbsp;}] }</div>
        </div>
      </div>
    </div>
  </div>
</body>
</html>`;

fs.writeFileSync(tempHtmlPath, html, 'utf8');

const browserCandidates = [
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'
];

const browserPath = browserCandidates.find((p) => fs.existsSync(p));
if (!browserPath) {
  console.error('No Chromium browser found to render preview.png');
  process.exit(1);
}

const fileUrl = 'file:///' + tempHtmlPath.replace(/\\/g, '/');

execFileSync(browserPath, [
  '--headless=new',
  '--disable-gpu',
  '--hide-scrollbars',
  `--window-size=${WIDTH},${HEIGHT}`,
  '--force-device-scale-factor=1',
  `--screenshot=${outputPath}`,
  fileUrl
]);

fs.unlinkSync(tempHtmlPath);
console.log('✅ Generated static/preview.png successfully!');
