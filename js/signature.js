// Signature building functions

async function buildCompositeLogo(logoSrc) {
  const canvas = document.createElement("canvas");
  const width = 220;
  const height = 140;
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");

  ctx.clearRect(0, 0, width, height);

  const base = { r: 212, g: 185, b: 130 };
  const ringAlphas = [0.26, 0.20, 0.14, 0.08, 0.04];
  const radii = [70, 110, 150, 190, 230];

  const centerX = 80;
  const centerY = 70;

  for (let i = 0; i < radii.length; i++) {
    ctx.beginPath();
    ctx.fillStyle = `rgba(${base.r},${base.g},${base.b},${ringAlphas[i]})`;
    ctx.arc(centerX, centerY, radii[i], 0, Math.PI * 2);
    ctx.fill();
  }

  const cardW = 96;
  const cardH = 96;
  const cardX = centerX - cardW / 2;
  const cardY = centerY - cardH / 2;
  ctx.fillStyle = hexToRgba('#ffffff', 1);
  roundRect(ctx, cardX, cardY, cardW, cardH, 12);
  ctx.fill();

  const img = await loadImage(logoSrc);
  const inset = 12;
  const maxW = cardW - inset * 2;
  const maxH = cardH - inset * 2;
  const { drawW, drawH } = fitContain(img.width, img.height, maxW, maxH);
  const dx = cardX + (cardW - drawW) / 2;
  const dy = cardY + (cardH - drawH) / 2;
  ctx.drawImage(img, dx, dy, drawW, drawH);

  return canvas.toDataURL("image/png");
}

async function buildFullSignatureImage({ 
  name, title, phone, email, website, address = "", 
  rights1 = "", rights2 = "", rights2Italic = false, 
  rights2UseFg = true, logoSrc, fg, ringsOpacity = 1, 
  ringsColor, size = "large", verticalPositionPercent = 30,
  horizontalPositionPercent = 10, patternType = 'circles' 
}) {
  const config = CONFIG.sizeConfigs[size] || CONFIG.sizeConfigs.large;
  const scale = config.scale;
  
  const width = Math.round(1000 * scale);
  const height = Math.round(240 * scale);
  const dpr = Math.max(2, Math.round(window.devicePixelRatio || 1));
  const canvas = document.createElement('canvas');
  canvas.width = width * dpr;
  canvas.height = height * dpr;
  const ctx = canvas.getContext('2d');
  ctx.scale(dpr, dpr);
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, width, height);

  const patternCtx = generatePattern(patternType, ringsColor, ringsOpacity, width, height, scale);
  if (patternCtx && patternCtx.canvas) {
    ctx.drawImage(patternCtx.canvas, 0, 0);
  }

  const centerY = height / 2;
  const imgBox = Math.round(104 * scale);
  const gapBetweenLogoAndText = Math.round(28 * scale);
  
  // Logo stays at fixed position
  const imgX = Math.round(50 * scale);
  const imgY = centerY - imgBox / 2;
  
  if (logoSrc) {
    const img = await loadImage(logoSrc);
    const { drawW, drawH } = fitContain(img.width, img.height, imgBox, imgBox);
    const dx = imgX + (imgBox - drawW) / 2;
    const dy = imgY + (imgBox - drawH) / 2;
    ctx.drawImage(img, dx, dy, drawW, drawH);
  }

  // Text position is adjustable: 0% = close to logo, 100% = far right
  const minTextX = imgX + imgBox + gapBetweenLogoAndText; // Minimum position (right after logo)
  const maxTextX = width - Math.round(200 * scale); // Maximum position (leaving some right padding)
  const textX = minTextX + ((maxTextX - minTextX) * horizontalPositionPercent / 100);
  const primary = fg || '#111111';
  
  const fullNameHeight = Math.round(24 * scale);
  const jobTitleHeight = Math.round(18 * scale);
  const websiteTextHeight = Math.round(18 * scale);
  const contactRowVisualHeight = Math.round(18 * scale);
  const addressTextHeight = Math.round(14 * scale);
  const footerTextHeight = Math.round(14 * scale);
  
  let calculatedTextBlockHeight = 0;
  calculatedTextBlockHeight += fullNameHeight;
  calculatedTextBlockHeight += Math.round(4 * scale);
  calculatedTextBlockHeight += jobTitleHeight;
  calculatedTextBlockHeight += Math.round(8 * scale);
  calculatedTextBlockHeight += websiteTextHeight;
  calculatedTextBlockHeight += Math.round(16 * scale);
  calculatedTextBlockHeight += contactRowVisualHeight;
  calculatedTextBlockHeight += Math.round(26 * scale);
  
  if (address && address.trim().length > 0) {
    calculatedTextBlockHeight += addressTextHeight;
    calculatedTextBlockHeight += Math.round(4 * scale);
  }
  if (rights1 && rights1.trim().length > 0) {
    calculatedTextBlockHeight += footerTextHeight;
    calculatedTextBlockHeight += Math.round(4 * scale);
  }
  if (rights2 && rights2.trim().length > 0) {
    calculatedTextBlockHeight += footerTextHeight;
  }
  
  const bottomPaddingPercent = verticalPositionPercent;
  const topPaddingPercent = 100 - verticalPositionPercent;
  const totalPaddingPercent = topPaddingPercent + bottomPaddingPercent;
  const remainingSpace = height - calculatedTextBlockHeight;
  const topPadding = (remainingSpace * topPaddingPercent) / totalPaddingPercent;
  const textBlockTop = topPadding;
  let currentBaselineY = textBlockTop;
  
  ctx.fillStyle = primary;
  ctx.font = `700 ${fullNameHeight}px Inter, system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif`;
  ctx.textBaseline = 'top';
  ctx.fillText(name || "Full Name", textX, currentBaselineY);
  currentBaselineY += fullNameHeight + Math.round(4 * scale);
  
  ctx.fillStyle = 'rgba(17,24,39,0.7)';
  ctx.font = `500 ${jobTitleHeight}px Inter, system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif`;
  ctx.fillText(title || "Job Title", textX, currentBaselineY);
  currentBaselineY += jobTitleHeight + Math.round(8 * scale);
  
  // Website under job title
  const [globeIcon] = await Promise.all([
    loadTintedSvg('icons/global.svg', primary)
  ]);
  ctx.textBaseline = 'top';
  const websiteIconSize = Math.round(18 * scale);
  const websiteGapAfterIcon = Math.round(8 * scale);
  const websiteTextCenterY = currentBaselineY + websiteTextHeight / 2;
  if (globeIcon) { ctx.drawImage(globeIcon, textX, websiteTextCenterY - websiteIconSize/2, websiteIconSize, websiteIconSize); }
  ctx.fillStyle = 'rgba(17,24,39,0.9)';
  ctx.font = `400 ${websiteTextHeight}px Inter, system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif`;
  ctx.fillText(website || "Website", textX + websiteIconSize + websiteGapAfterIcon, currentBaselineY);
  currentBaselineY += websiteTextHeight + Math.round(16 * scale);
  
  // Phone and Email on same line
  ctx.textBaseline = 'middle';
  const contactRowCenterY = currentBaselineY + contactRowVisualHeight / 2;
  let cursorX = textX;
  const iconSize = Math.round(18 * scale);
  const gapAfterIcon = Math.round(8 * scale);
  const gapAfterText = Math.round(12 * scale);
  const sep = '|';
  const sepColor = 'rgba(107,114,128,0.9)';
  
  const [phoneIcon, emailIcon] = await Promise.all([
    loadTintedSvg('icons/user-id.svg', primary),
    loadTintedSvg('icons/inbox.svg', primary)
  ]);
  
  if (phoneIcon) { ctx.drawImage(phoneIcon, cursorX, contactRowCenterY - iconSize/2, iconSize, iconSize); }
  cursorX += iconSize + gapAfterIcon;
  ctx.fillStyle = 'rgba(17,24,39,0.9)';
  ctx.font = `400 ${contactRowVisualHeight}px Inter, system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif`;
  ctx.fillText(phone || "Phone", cursorX, contactRowCenterY);
  cursorX += ctx.measureText(phone || "Phone").width + gapAfterText;
  ctx.fillStyle = sepColor;
  ctx.fillText(sep, cursorX, contactRowCenterY);
  cursorX += 14;
  
  if (emailIcon) { ctx.drawImage(emailIcon, cursorX, contactRowCenterY - iconSize/2, iconSize, iconSize); }
  cursorX += iconSize + gapAfterIcon;
  ctx.fillStyle = 'rgba(17,24,39,0.9)';
  ctx.fillText(email || "Email", cursorX, contactRowCenterY);
  
  currentBaselineY += contactRowVisualHeight + Math.round(26 * scale);
  
  ctx.textBaseline = 'alphabetic';
  ctx.font = `400 ${addressTextHeight}px Inter, system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif`;
  
  if (address && address.trim().length > 0) {
    ctx.fillStyle = 'rgba(55,65,81,0.9)';
    ctx.fillText(address, textX, currentBaselineY);
    currentBaselineY += addressTextHeight + Math.round(4 * scale);
  }
  
  if (rights1 && rights1.trim().length > 0) {
    ctx.fillStyle = 'rgba(17,24,39,0.9)';
    ctx.fillText(rights1, textX, currentBaselineY);
    currentBaselineY += footerTextHeight + Math.round(4 * scale);
  }
  
  if (rights2 && rights2.trim().length > 0) {
    if (rights2UseFg) {
      const primaryRgb = parseColorToRgb(primary);
      ctx.fillStyle = `rgba(${primaryRgb.r},${primaryRgb.g},${primaryRgb.b},0.9)`;
    } else {
      ctx.fillStyle = 'rgba(107,114,128,0.95)';
    }
    ctx.font = `${rights2Italic ? 'italic ' : ''}400 ${footerTextHeight}px Inter, system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif`;
    ctx.fillText(rights2, textX, currentBaselineY);
  }

  return { src: canvas.toDataURL('image/png'), width, height };
}

// Download the final signature image as PNG
async function downloadSignature(size = 'large') {
  const requiredFields = [
    { id: 'fullName', name: 'Full Name' },
    { id: 'jobTitle', name: 'Job Title' },
    { id: 'email', name: 'Email', isEmail: true },
    { id: 'phone', name: 'Phone' },
    { id: 'website', name: 'Website' }
  ];
  
  const missingFields = requiredFields.filter(field => {
    if (field.isEmail) {
      const emailValue = window.getEmailValue ? window.getEmailValue() : '';
      return !emailValue || !emailValue.trim();
    }
    const element = document.getElementById(field.id);
    return !element || !element.value.trim();
  });
  
  if (missingFields.length > 0) {
    const fieldNames = missingFields.map(f => f.name).join(', ');
    showToast(`Please fill in the required fields: ${fieldNames}`, 'error');
    return;
  }
  
  const name = document.getElementById("fullName").value;
  const title = document.getElementById("jobTitle").value;
  const phone = document.getElementById("phone").value;
  const email = window.getEmailValue ? window.getEmailValue() : document.getElementById("email").value;
  const website = document.getElementById("website").value;
  const opacity = document.getElementById("bgOpacity").value / 100;
  const address = document.getElementById("address").value || "";
  const rights1 = document.getElementById("rights1").value || "";
  const rights2 = document.getElementById("rights2").value || "";
  const rights2Italic = document.getElementById("rights2Italic").checked;
  const rights2UseFg = document.getElementById("rights2UseFg").checked;
  const verticalPositionVal = parseInt(document.getElementById("verticalPosition").value);
  const horizontalPositionVal = parseInt(document.getElementById("horizontalPosition").value);
  const patternType = document.getElementById("bgPattern").value || 'circles';
  
  const options = { 
    name, title, phone, email, website, address, rights1, rights2, 
    rights2Italic, rights2UseFg, logoSrc: window.logoBase64, 
    fg: window.selectedColor, ringsOpacity: opacity, 
    ringsColor: window.selectedBgColor, size, 
    verticalPositionPercent: verticalPositionVal,
    horizontalPositionPercent: horizontalPositionVal,
    patternType 
  };
  
  const fullImage = await buildFullSignatureImage(options);
  
  const link = document.createElement('a');
  link.href = fullImage.src;
  link.download = `signature-${size}.png`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  showToast(`Signature (${size}) downloaded as PNG.`, "success");
}

// Export to window for onclick handlers
window.downloadSignature = downloadSignature;

