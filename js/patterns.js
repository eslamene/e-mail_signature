// Pattern generation functions
function generatePattern(patternType, color, opacity, width, height, scale) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  
  const base = parseColorToRgb(color || '#D4B982');
  const alpha = opacity || 0.3;
  
  // Set default styles
  ctx.fillStyle = `rgba(${base.r},${base.g},${base.b},${alpha})`;
  ctx.strokeStyle = `rgba(${base.r},${base.g},${base.b},${alpha})`;
  
  switch(patternType) {
    case 'circles':
      return generateCirclesPattern(ctx, width, height, scale, base, alpha);
    case 'concentric-squares':
      return generateConcentricSquaresPattern(ctx, width, height, scale, base, alpha);
    case 'concentric-triangles':
      return generateConcentricTrianglesPattern(ctx, width, height, scale, base, alpha);
    case 'concentric-hexagons':
      return generateConcentricHexagonsPattern(ctx, width, height, scale, base, alpha);
    case 'concentric-diamonds':
      return generateConcentricDiamondsPattern(ctx, width, height, scale, base, alpha);
    case 'gradient-circles':
      return generateGradientCirclesPattern(ctx, width, height, scale, base, alpha);
    case 'gradient-blobs':
      return generateGradientBlobsPattern(ctx, width, height, scale, base, alpha);
    case 'gradient-feathers':
      return generateGradientFeathersPattern(ctx, width, height, scale, base, alpha);
    case 'gradient-rectangles':
      return generateGradientRectanglesPattern(ctx, width, height, scale, base, alpha);
    case 'gradient-arrows':
      return generateGradientArrowsPattern(ctx, width, height, scale, base, alpha);
    case 'gradient-diamonds':
      return generateGradientDiamondsPattern(ctx, width, height, scale, base, alpha);
    case 'gradient-swoosh':
      return generateGradientSwooshPattern(ctx, width, height, scale, base, alpha);
    case 'gradient-rings':
      return generateGradientRingsPattern(ctx, width, height, scale, base, alpha);
    default:
      return generateCirclesPattern(ctx, width, height, scale, base, alpha);
  }
}

function generateCirclesPattern(ctx, width, height, scale, base, alpha) {
  const centerX = Math.round(50 * scale) + Math.round(52 * scale);
  const centerY = height / 2;
  const baseAlphas = [0.26, 0.20, 0.14, 0.08, 0.04];
  const radii = [80, 140, 200, 260, 320].map(r => Math.round(r * scale));
  
  for (let i = 0; i < radii.length; i++) {
    ctx.beginPath();
    const gain = 0.6 + (alpha ** 1.1) * 1.6;
    const a = Math.max(0, Math.min(1, baseAlphas[i] * gain));
    ctx.fillStyle = `rgba(${base.r},${base.g},${base.b},${a})`;
    ctx.arc(centerX, centerY, radii[i], 0, Math.PI * 2);
    ctx.fill();
  }
  return ctx;
}

function generateConcentricSquaresPattern(ctx, width, height, scale, base, alpha) {
  const centerX = Math.round(50 * scale) + Math.round(52 * scale);
  const centerY = height / 2;
  const baseAlphas = [0.26, 0.20, 0.14, 0.08, 0.04];
  const radii = [80, 140, 200, 260, 320].map(r => Math.round(r * scale));
  
  for (let i = 0; i < radii.length; i++) {
    ctx.beginPath();
    const gain = 0.6 + (alpha ** 1.1) * 1.6;
    const a = Math.max(0, Math.min(1, baseAlphas[i] * gain));
    ctx.fillStyle = `rgba(${base.r},${base.g},${base.b},${a})`;
    const sideLength = radii[i] * 1.8;
    const halfSide = sideLength / 2;
    ctx.fillRect(centerX - halfSide, centerY - halfSide, sideLength, sideLength);
  }
  return ctx;
}

function generateConcentricTrianglesPattern(ctx, width, height, scale, base, alpha) {
  const centerX = Math.round(50 * scale) + Math.round(52 * scale);
  const centerY = height / 2;
  const baseAlphas = [0.26, 0.20, 0.14, 0.08, 0.04];
  const radii = [80, 140, 200, 260, 320].map(r => Math.round(r * scale));
  
  for (let i = 0; i < radii.length; i++) {
    ctx.beginPath();
    const gain = 0.6 + (alpha ** 1.1) * 1.6;
    const a = Math.max(0, Math.min(1, baseAlphas[i] * gain));
    ctx.fillStyle = `rgba(${base.r},${base.g},${base.b},${a})`;
    const sideLength = radii[i] * 2.0;
    const triangleHeight = sideLength * 0.866;
    ctx.moveTo(centerX, centerY - triangleHeight / 2);
    ctx.lineTo(centerX - sideLength / 2, centerY + triangleHeight / 2);
    ctx.lineTo(centerX + sideLength / 2, centerY + triangleHeight / 2);
    ctx.closePath();
    ctx.fill();
  }
  return ctx;
}

function generateConcentricHexagonsPattern(ctx, width, height, scale, base, alpha) {
  const centerX = Math.round(50 * scale) + Math.round(52 * scale);
  const centerY = height / 2;
  const baseAlphas = [0.26, 0.20, 0.14, 0.08, 0.04];
  const radii = [80, 140, 200, 260, 320].map(r => Math.round(r * scale));
  
  for (let i = 0; i < radii.length; i++) {
    ctx.beginPath();
    const gain = 0.6 + (alpha ** 1.1) * 1.6;
    const a = Math.max(0, Math.min(1, baseAlphas[i] * gain));
    ctx.fillStyle = `rgba(${base.r},${base.g},${base.b},${a})`;
    const hexRadius = radii[i] * 1.2;
    for (let j = 0; j < 6; j++) {
      const angle = (j / 6) * Math.PI * 2;
      const x = centerX + Math.cos(angle) * hexRadius;
      const y = centerY + Math.sin(angle) * hexRadius;
      if (j === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fill();
  }
  return ctx;
}

function generateConcentricDiamondsPattern(ctx, width, height, scale, base, alpha) {
  const centerX = Math.round(50 * scale) + Math.round(52 * scale);
  const centerY = height / 2;
  const baseAlphas = [0.26, 0.20, 0.14, 0.08, 0.04];
  const radii = [80, 140, 200, 260, 320].map(r => Math.round(r * scale));
  
  for (let i = 0; i < radii.length; i++) {
    ctx.beginPath();
    const gain = 0.6 + (alpha ** 1.1) * 1.6;
    const a = Math.max(0, Math.min(1, baseAlphas[i] * gain));
    ctx.fillStyle = `rgba(${base.r},${base.g},${base.b},${a})`;
    const halfDiagonal = radii[i] * 1.4;
    ctx.moveTo(centerX, centerY - halfDiagonal);
    ctx.lineTo(centerX + halfDiagonal, centerY);
    ctx.lineTo(centerX, centerY + halfDiagonal);
    ctx.lineTo(centerX - halfDiagonal, centerY);
    ctx.closePath();
    ctx.fill();
  }
  return ctx;
}

function generateGradientCirclesPattern(ctx, width, height, scale, base, alpha) {
  const circles = [
    { x: width * 0.2, y: height * 0.2, radius: Math.round(120 * scale), opacity: alpha * 0.3 },
    { x: width * 0.8, y: height * 0.3, radius: Math.round(100 * scale), opacity: alpha * 0.25 },
    { x: width * 0.3, y: height * 0.7, radius: Math.round(90 * scale), opacity: alpha * 0.2 },
    { x: width * 0.7, y: height * 0.8, radius: Math.round(110 * scale), opacity: alpha * 0.35 }
  ];
  
  circles.forEach(circle => {
    const gradient = ctx.createRadialGradient(circle.x, circle.y, 0, circle.x, circle.y, circle.radius);
    gradient.addColorStop(0, `rgba(${base.r},${base.g},${base.b},${circle.opacity})`);
    gradient.addColorStop(0.7, `rgba(${base.r},${base.g},${base.b},${circle.opacity * 0.5})`);
    gradient.addColorStop(1, `rgba(${base.r},${base.g},${base.b},0)`);
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(circle.x, circle.y, circle.radius, 0, Math.PI * 2);
    ctx.fill();
  });
  return ctx;
}

function generateGradientBlobsPattern(ctx, width, height, scale, base, alpha) {
  const blobs = [
    { x: width * 0.15, y: height * 0.15, size: Math.round(150 * scale), opacity: alpha * 0.4 },
    { x: width * 0.85, y: height * 0.25, size: Math.round(130 * scale), opacity: alpha * 0.3 },
    { x: width * 0.25, y: height * 0.75, size: Math.round(140 * scale), opacity: alpha * 0.35 },
    { x: width * 0.75, y: height * 0.85, size: Math.round(120 * scale), opacity: alpha * 0.25 }
  ];
  
  blobs.forEach(blob => {
    const gradient = ctx.createRadialGradient(blob.x, blob.y, 0, blob.x, blob.y, blob.size);
    gradient.addColorStop(0, `rgba(${base.r},${base.g},${base.b},${blob.opacity})`);
    gradient.addColorStop(0.6, `rgba(${base.r},${base.g},${base.b},${blob.opacity * 0.3})`);
    gradient.addColorStop(1, `rgba(${base.r},${base.g},${base.b},0)`);
    ctx.fillStyle = gradient;
    ctx.beginPath();
    const points = 8;
    for (let i = 0; i < points; i++) {
      const angle = (i / points) * Math.PI * 2;
      const radius = blob.size * (0.7 + Math.sin(angle * 3) * 0.3);
      const x = blob.x + Math.cos(angle) * radius;
      const y = blob.y + Math.sin(angle) * radius;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.quadraticCurveTo(blob.x, blob.y, x, y);
    }
    ctx.closePath();
    ctx.fill();
  });
  return ctx;
}

function generateGradientFeathersPattern(ctx, width, height, scale, base, alpha) {
  const feathers = [
    { x: width * 0.15, y: height * 0.2, length: Math.round(120 * scale), angle: -30, opacity: alpha * 0.4 },
    { x: width * 0.85, y: height * 0.3, length: Math.round(100 * scale), angle: 45, opacity: alpha * 0.35 },
    { x: width * 0.2, y: height * 0.8, length: Math.round(110 * scale), angle: 15, opacity: alpha * 0.3 },
    { x: width * 0.8, y: height * 0.7, length: Math.round(90 * scale), angle: -45, opacity: alpha * 0.25 }
  ];
  
  feathers.forEach(feather => {
    const gradient = ctx.createLinearGradient(
      feather.x, feather.y,
      feather.x + Math.cos(feather.angle * Math.PI / 180) * feather.length,
      feather.y + Math.sin(feather.angle * Math.PI / 180) * feather.length
    );
    gradient.addColorStop(0, `rgba(${base.r},${base.g},${base.b},${feather.opacity})`);
    gradient.addColorStop(0.7, `rgba(${base.r},${base.g},${base.b},${feather.opacity * 0.3})`);
    gradient.addColorStop(1, `rgba(${base.r},${base.g},${base.b},0)`);
    ctx.fillStyle = gradient;
    ctx.beginPath();
    const endX = feather.x + Math.cos(feather.angle * Math.PI / 180) * feather.length;
    const endY = feather.y + Math.sin(feather.angle * Math.PI / 180) * feather.length;
    const midX = feather.x + Math.cos(feather.angle * Math.PI / 180) * feather.length * 0.5;
    const midY = feather.y + Math.sin(feather.angle * Math.PI / 180) * feather.length * 0.5;
    ctx.moveTo(feather.x, feather.y);
    ctx.quadraticCurveTo(midX + Math.sin(feather.angle * Math.PI / 180) * feather.length * 0.2, 
                        midY - Math.cos(feather.angle * Math.PI / 180) * feather.length * 0.2, endX, endY);
    ctx.quadraticCurveTo(midX - Math.sin(feather.angle * Math.PI / 180) * feather.length * 0.2, 
                        midY + Math.cos(feather.angle * Math.PI / 180) * feather.length * 0.2, feather.x, feather.y);
    ctx.closePath();
    ctx.fill();
  });
  return ctx;
}

function generateGradientRectanglesPattern(ctx, width, height, scale, base, alpha) {
  const rectangles = [
    { x: width * 0.1, y: height * 0.1, w: Math.round(40 * scale), h: Math.round(200 * scale), opacity: alpha * 0.3 },
    { x: width * 0.8, y: height * 0.2, w: Math.round(35 * scale), h: Math.round(180 * scale), opacity: alpha * 0.25 },
    { x: width * 0.05, y: height * 0.3, w: Math.round(30 * scale), h: Math.round(150 * scale), opacity: alpha * 0.2 },
    { x: width * 0.9, y: height * 0.1, w: Math.round(25 * scale), h: Math.round(160 * scale), opacity: alpha * 0.35 }
  ];
  
  rectangles.forEach(rect => {
    const gradient = ctx.createLinearGradient(rect.x, rect.y, rect.x, rect.y + rect.h);
    gradient.addColorStop(0, `rgba(${base.r},${base.g},${base.b},${rect.opacity})`);
    gradient.addColorStop(0.5, `rgba(${base.r},${base.g},${base.b},${rect.opacity * 0.6})`);
    gradient.addColorStop(1, `rgba(${base.r},${base.g},${base.b},0)`);
    ctx.fillStyle = gradient;
    ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
  });
  return ctx;
}

function generateGradientArrowsPattern(ctx, width, height, scale, base, alpha) {
  const arrows = [
    { x: width * 0.2, y: height * 0.2, size: Math.round(80 * scale), angle: 45, opacity: alpha * 0.4 },
    { x: width * 0.8, y: height * 0.3, size: Math.round(70 * scale), angle: -30, opacity: alpha * 0.35 },
    { x: width * 0.3, y: height * 0.8, size: Math.round(75 * scale), angle: 120, opacity: alpha * 0.3 },
    { x: width * 0.7, y: height * 0.7, size: Math.round(65 * scale), angle: -60, opacity: alpha * 0.25 }
  ];
  
  arrows.forEach(arrow => {
    const gradient = ctx.createRadialGradient(arrow.x, arrow.y, 0, arrow.x, arrow.y, arrow.size);
    gradient.addColorStop(0, `rgba(${base.r},${base.g},${base.b},${arrow.opacity})`);
    gradient.addColorStop(0.6, `rgba(${base.r},${base.g},${base.b},${arrow.opacity * 0.4})`);
    gradient.addColorStop(1, `rgba(${base.r},${base.g},${base.b},0)`);
    ctx.fillStyle = gradient;
    ctx.save();
    ctx.translate(arrow.x, arrow.y);
    ctx.rotate(arrow.angle * Math.PI / 180);
    ctx.beginPath();
    ctx.moveTo(0, -arrow.size * 0.5);
    ctx.lineTo(arrow.size * 0.3, -arrow.size * 0.2);
    ctx.lineTo(arrow.size * 0.1, -arrow.size * 0.2);
    ctx.lineTo(arrow.size * 0.1, arrow.size * 0.2);
    ctx.lineTo(arrow.size * 0.3, arrow.size * 0.2);
    ctx.lineTo(0, arrow.size * 0.5);
    ctx.lineTo(-arrow.size * 0.3, arrow.size * 0.2);
    ctx.lineTo(-arrow.size * 0.1, arrow.size * 0.2);
    ctx.lineTo(-arrow.size * 0.1, -arrow.size * 0.2);
    ctx.lineTo(-arrow.size * 0.3, -arrow.size * 0.2);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  });
  return ctx;
}

function generateGradientDiamondsPattern(ctx, width, height, scale, base, alpha) {
  const diamonds = [
    { x: width * 0.2, y: height * 0.3, size: Math.round(100 * scale), opacity: alpha * 0.4 },
    { x: width * 0.8, y: height * 0.2, size: Math.round(90 * scale), opacity: alpha * 0.35 },
    { x: width * 0.3, y: height * 0.8, size: Math.round(85 * scale), opacity: alpha * 0.3 },
    { x: width * 0.7, y: height * 0.7, size: Math.round(95 * scale), opacity: alpha * 0.25 }
  ];
  
  diamonds.forEach(diamond => {
    const gradient = ctx.createRadialGradient(diamond.x, diamond.y, 0, diamond.x, diamond.y, diamond.size);
    gradient.addColorStop(0, `rgba(${base.r},${base.g},${base.b},${diamond.opacity})`);
    gradient.addColorStop(0.5, `rgba(${base.r},${base.g},${base.b},${diamond.opacity * 0.5})`);
    gradient.addColorStop(1, `rgba(${base.r},${base.g},${base.b},0)`);
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.moveTo(diamond.x, diamond.y - diamond.size * 0.5);
    ctx.lineTo(diamond.x + diamond.size * 0.5, diamond.y);
    ctx.lineTo(diamond.x, diamond.y + diamond.size * 0.5);
    ctx.lineTo(diamond.x - diamond.size * 0.5, diamond.y);
    ctx.closePath();
    ctx.fill();
  });
  return ctx;
}

function generateGradientSwooshPattern(ctx, width, height, scale, base, alpha) {
  const swooshes = [
    { startX: 0, startY: height * 0.3, endX: width * 0.7, endY: height * 0.1, size: Math.round(80 * scale), opacity: alpha * 0.4 },
    { startX: width * 0.3, startY: height, endX: width, endY: height * 0.7, size: Math.round(70 * scale), opacity: alpha * 0.3 }
  ];
  
  swooshes.forEach(swoosh => {
    const gradient = ctx.createLinearGradient(swoosh.startX, swoosh.startY, swoosh.endX, swoosh.endY);
    gradient.addColorStop(0, `rgba(${base.r},${base.g},${base.b},0)`);
    gradient.addColorStop(0.3, `rgba(${base.r},${base.g},${base.b},${swoosh.opacity})`);
    gradient.addColorStop(0.7, `rgba(${base.r},${base.g},${base.b},${swoosh.opacity * 0.6})`);
    gradient.addColorStop(1, `rgba(${base.r},${base.g},${base.b},0)`);
    ctx.fillStyle = gradient;
    ctx.beginPath();
    const midX = (swoosh.startX + swoosh.endX) / 2;
    const midY = (swoosh.startY + swoosh.endY) / 2;
    ctx.moveTo(swoosh.startX, swoosh.startY);
    ctx.quadraticCurveTo(midX, midY, swoosh.endX, swoosh.endY);
    ctx.quadraticCurveTo(midX, midY + swoosh.size, swoosh.startX, swoosh.startY);
    ctx.closePath();
    ctx.fill();
  });
  return ctx;
}

function generateGradientRingsPattern(ctx, width, height, scale, base, alpha) {
  const centerX = Math.round(118 * scale) + Math.round(52 * scale);
  const centerY = height / 2;
  const rings = [
    { radius: Math.round(80 * scale), opacity: alpha * 0.3 },
    { radius: Math.round(140 * scale), opacity: alpha * 0.25 },
    { radius: Math.round(200 * scale), opacity: alpha * 0.2 },
    { radius: Math.round(260 * scale), opacity: alpha * 0.15 },
    { radius: Math.round(320 * scale), opacity: alpha * 0.1 }
  ];
  
  rings.forEach(ring => {
    const gradient = ctx.createRadialGradient(centerX, centerY, ring.radius * 0.7, centerX, centerY, ring.radius);
    gradient.addColorStop(0, `rgba(${base.r},${base.g},${base.b},0)`);
    gradient.addColorStop(0.5, `rgba(${base.r},${base.g},${base.b},${ring.opacity})`);
    gradient.addColorStop(1, `rgba(${base.r},${base.g},${base.b},0)`);
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(centerX, centerY, ring.radius, 0, Math.PI * 2);
    ctx.fill();
  });
  return ctx;
}
