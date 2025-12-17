// Utility functions

function parseColorToRgb(color) {
  if (color.startsWith('rgb')) {
    const parts = color.replace(/rgba?\(|\)|\s/g, '').split(',');
    return { r: +parts[0], g: +parts[1], b: +parts[2] };
  }
  const hex = color.replace('#','');
  const bigint = parseInt(hex.length === 3 ? hex.split('').map(c=>c+c).join('') : hex, 16);
  return { r: (bigint >> 16) & 255, g: (bigint >> 8) & 255, b: bigint & 255 };
}

function hexToRgba(hex, opacity) {
  if (hex.startsWith("rgb")) return hex.replace(")", `,${opacity})`).replace("rgb","rgba");
  const bigint = parseInt(hex.replace("#",""), 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `rgba(${r},${g},${b},${opacity})`;
}

function fitContain(srcW, srcH, maxW, maxH) {
  const ratio = Math.min(maxW / srcW, maxH / srcH);
  return { drawW: Math.round(srcW * ratio), drawH: Math.round(srcH * ratio) };
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const i = new Image();
    i.crossOrigin = 'anonymous';
    i.onload = () => resolve(i);
    i.onerror = reject;
    i.src = src;
  });
}

function roundRect(ctx, x, y, w, h, r) {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + w - radius, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + radius);
  ctx.lineTo(x + w, y + h - radius);
  ctx.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);
  ctx.lineTo(x + radius, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

// Load SVG, tint fill color, and return as Image for canvas
async function loadTintedSvg(path, color) {
  try {
    const res = await fetch(path);
    const svg = await res.text();
    const tinted = svg.replace(/fill="#?[0-9A-Fa-f]{3,6}"/g, `fill="${color}"`);
    const blob = new Blob([tinted], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const image = await new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => { URL.revokeObjectURL(url); resolve(img); };
      img.onerror = err => { URL.revokeObjectURL(url); resolve(null); };
      img.src = url;
    });
    return image;
  } catch (e) {
    return null;
  }
}

// Rasterize SVG to PNG data URL for consistent canvas operations
function rasterizeSvgToPng(svgDataUrl, width, height) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = width; 
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0,0,width,height);
      ctx.drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL('image/png'));
    };
    img.onerror = reject;
    img.src = svgDataUrl;
  });
}

// Debounce helper to limit how often heavy operations (like canvas rendering) run
function debounce(fn, delay) {
  let timeoutId;
  return function debounced(...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      fn.apply(this, args);
    }, delay);
  };
}

// Lightweight toast notification
function showToast(message, type = "success") {
  const isError = type === "error";
  const toast = document.createElement("div");
  toast.className = `fixed left-1/2 -translate-x-1/2 top-6 z-50 px-4 py-2 rounded-lg shadow-lg text-white text-sm
    ${isError ? "bg-red-600" : "bg-green-600"} opacity-0 translate-y-2 transition-all duration-300`;
  toast.textContent = message;
  document.body.appendChild(toast);
  // animate in
  requestAnimationFrame(() => {
    toast.classList.remove("opacity-0", "translate-y-2");
    toast.classList.add("opacity-100", "translate-y-0");
  });
  // auto hide
  setTimeout(() => {
    toast.classList.remove("opacity-100", "translate-y-0");
    toast.classList.add("opacity-0", "translate-y-2");
    setTimeout(() => toast.remove(), 300);
  }, 2200);
}

