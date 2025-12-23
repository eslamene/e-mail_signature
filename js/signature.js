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
  const scaleMap = {
    small: .5,
    medium: 1,
    large: 1.5
  };
  const scale = scaleMap[size] || scaleMap.large;
  
  const width = Math.round(600 * scale);
  const height = Math.round(144 * scale);
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

  const centerY = height / 2;
  const layoutScale = 0.7; // tighten overall sizing (logo, gaps, text spacing)
  const imgBox = Math.round(104 * scale * layoutScale);
  const gapBetweenLogoAndText = Math.round(28 * scale * layoutScale);
  
  // Logo stays at fixed position
  const imgX = Math.round(50 * scale);
  const imgY = centerY - imgBox / 2;

  // Align pattern center to the logo center without moving the logo itself
  const logoCenterX = Math.round(50 * scale) + Math.round(imgBox / 2);
  const logoCenterY = centerY;
  // Shrink pattern size while keeping it centered to the logo
  const patternScale = 0.65;
  let patternCtx = null;
  try {
    patternCtx = generatePattern(patternType, ringsColor, ringsOpacity, width, height, scale, logoCenterX, logoCenterY, patternScale);
  } catch (e) {
    console.error('Pattern render failed, continuing without pattern', e);
  }
  if (patternCtx && patternCtx.canvas) {
    ctx.drawImage(patternCtx.canvas, 0, 0);
  }

  if (logoSrc) {
    const img = await loadImage(logoSrc);
    const { drawW, drawH } = fitContain(img.width, img.height, imgBox, imgBox);
    const dx = imgX + (imgBox - drawW) / 2;
    const dy = imgY + (imgBox - drawH) / 2;
    ctx.drawImage(img, dx, dy, drawW, drawH);
  }

  // Text position is adjustable: 0% = close to logo, 100% = far right
  const minTextX = imgX + imgBox + gapBetweenLogoAndText; // Minimum position (right after logo)
  const maxTextX = width - Math.round(220 * scale * layoutScale); // leave more right padding
  const textX = minTextX + ((maxTextX - minTextX) * horizontalPositionPercent / 100);
  const primary = fg || '#111111';

  // Reduce text sizing to better fit the smaller canvas
  const textScale = 0.5; // slightly smaller text to keep footer content within height
  const fullNameHeight = Math.round(24 * scale * textScale);
  const jobTitleHeight = Math.round(18 * scale * textScale);
  const websiteTextHeight = Math.round(18 * scale * textScale);
  const contactRowVisualHeight = Math.round(18 * scale * textScale);
  const addressTextHeight = Math.round(14 * scale * textScale);
  const footerTextHeight = Math.round(14 * scale * textScale);
  
  let calculatedTextBlockHeight = 0;
  calculatedTextBlockHeight += fullNameHeight;
  calculatedTextBlockHeight += Math.round(2 * scale * textScale); // tighter gap
  calculatedTextBlockHeight += jobTitleHeight;
  calculatedTextBlockHeight += Math.round(4 * scale * textScale); // tighter gap
  calculatedTextBlockHeight += websiteTextHeight;
  calculatedTextBlockHeight += Math.round(4 * scale * textScale); // tighter gap between website and contact
  calculatedTextBlockHeight += contactRowVisualHeight;
  calculatedTextBlockHeight += Math.round(12 * scale * textScale); // tighter gap
  
  if (address && address.trim().length > 0) {
    calculatedTextBlockHeight += addressTextHeight;
    calculatedTextBlockHeight += Math.round(2 * scale * textScale); // tighter gap
  }
  if (rights1 && rights1.trim().length > 0) {
    calculatedTextBlockHeight += footerTextHeight;
    calculatedTextBlockHeight += Math.round(2 * scale * textScale); // tighter gap
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
  const websiteIconSize = Math.round(18 * scale * textScale);
  const websiteGapAfterIcon = Math.round(8 * scale * textScale);
  const websiteTextCenterY = currentBaselineY + websiteTextHeight / 2;
  if (globeIcon) { ctx.drawImage(globeIcon, textX, websiteTextCenterY - websiteIconSize/2, websiteIconSize, websiteIconSize); }
  ctx.fillStyle = 'rgba(17,24,39,0.9)';
  ctx.font = `400 ${websiteTextHeight}px Inter, system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif`;
  ctx.fillText(website || "Website", textX + websiteIconSize + websiteGapAfterIcon, currentBaselineY);
  // Small gap between website row and phone/email row
  currentBaselineY += websiteTextHeight + Math.round(6 * scale * textScale);
  
  // Phone and Email on same line
  ctx.textBaseline = 'middle';
  const contactRowCenterY = currentBaselineY + contactRowVisualHeight / 2;
  let cursorX = textX;
  const iconSize = Math.round(18 * scale * textScale);
  const gapAfterIcon = Math.round(8 * scale * textScale);
  const gapAfterText = Math.round(8 * scale * textScale); // tighter inline gap
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
  
  currentBaselineY += contactRowVisualHeight + Math.round(8 * scale * textScale);
  // Minimal horizontal divider before address/footer
  const dividerY = currentBaselineY + Math.round(4 * scale * textScale);
  const dividerWidth = Math.round(320 * scale * textScale);
  ctx.strokeStyle = 'rgba(17,24,39,0.12)';
  ctx.lineWidth = Math.max(1, Math.round(1 * scale * textScale));
  ctx.beginPath();
  ctx.moveTo(textX, dividerY);
  ctx.lineTo(textX + dividerWidth, dividerY);
  ctx.stroke();
  // Add a bit more breathing room so address sits below the divider
  currentBaselineY = dividerY + Math.round(10 * scale * textScale);
  
  ctx.textBaseline = 'top';
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

// Generate pattern background as base64 image
function generatePatternBackground(patternType, color, opacity, width, height, scale, logoCenterX, logoCenterY) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  
  // White background
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, width, height);
  
  // Generate pattern
  const patternScale = 0.65;
  let patternCtx = null;
  try {
    patternCtx = generatePattern(patternType, color, opacity, width, height, scale, logoCenterX, logoCenterY, patternScale);
  } catch (e) {
    console.error('Pattern render failed', e);
  }
  if (patternCtx && patternCtx.canvas) {
    ctx.drawImage(patternCtx.canvas, 0, 0);
  }
  
  return canvas.toDataURL('image/png');
}

// Copy HTML inline signature to clipboard - Modern clients (Zoho, Gmail, etc.)
async function copyHtmlSignature() {
  await copyHtmlSignatureWithPattern(true);
}

// Copy HTML inline signature - Outlook compatible (no pattern background)
async function copyHtmlSignatureOutlook() {
  await copyHtmlSignatureWithPattern(false);
}

// Copy HTML inline signature - Text only (no images)
async function copyHtmlSignatureTextOnly() {
  await copyHtmlSignatureWithPattern(false, false);
}

// Core function to generate HTML signature
async function copyHtmlSignatureWithPattern(includePattern = true, includeImages = true) {
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
  const patternType = document.getElementById("bgPattern").value || 'circles';
  
  // Use large size for HTML signature
  const scale = 1.5; // large
  const width = Math.round(600 * scale);
  const height = Math.round(144 * scale);
  const centerY = height / 2;
  const layoutScale = 0.7;
  const imgBox = Math.round(104 * scale * layoutScale);
  const imgX = Math.round(50 * scale);
  const logoCenterX = imgX + Math.round(imgBox / 2);
  const logoCenterY = centerY;
  
  // Generate pattern background as base64 (only if includePattern is true)
  let patternBg = '';
  if (includePattern) {
    patternBg = generatePatternBackground(
      patternType, 
      window.selectedBgColor || '#D4B982', 
      opacity, 
      width, 
      height, 
      scale, 
      logoCenterX, 
      logoCenterY
    );
  }
  
  const logoSrc = includeImages ? (window.logoBase64 || '') : '';
  const primary = window.selectedColor || '#111111';
  const bgColor = window.selectedBgColor || '#D4B982';
  
  const escapeHtml = (str) => (str || '').replace(/[&<>"']/g, (ch) => {
    const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
    return map[ch] || ch;
  });
  
  // Load icons as base64 (only if includeImages is true)
  let globeIconBase64 = '';
  let phoneIconBase64 = '';
  let emailIconBase64 = '';
  
  if (includeImages) {
    const [globeIcon, phoneIcon, emailIcon] = await Promise.all([
      loadTintedSvg('icons/global.svg', primary),
      loadTintedSvg('icons/user-id.svg', primary),
      loadTintedSvg('icons/inbox.svg', primary)
    ]);
    
    if (globeIcon) {
      const iconCanvas = document.createElement('canvas');
      iconCanvas.width = 18;
      iconCanvas.height = 18;
      const iconCtx = iconCanvas.getContext('2d');
      iconCtx.drawImage(globeIcon, 0, 0, 18, 18);
      globeIconBase64 = iconCanvas.toDataURL('image/png');
    }
    if (phoneIcon) {
      const iconCanvas = document.createElement('canvas');
      iconCanvas.width = 18;
      iconCanvas.height = 18;
      const iconCtx = iconCanvas.getContext('2d');
      iconCtx.drawImage(phoneIcon, 0, 0, 18, 18);
      phoneIconBase64 = iconCanvas.toDataURL('image/png');
    }
    if (emailIcon) {
      const iconCanvas = document.createElement('canvas');
      iconCanvas.width = 18;
      iconCanvas.height = 18;
      const iconCtx = iconCanvas.getContext('2d');
      iconCtx.drawImage(emailIcon, 0, 0, 18, 18);
      emailIconBase64 = iconCanvas.toDataURL('image/png');
    }
  }
  
  // Build HTML structure with pattern background, logo, and text
  // Use pure table-based layout for maximum email client compatibility
  const bgStyle = includePattern && patternBg 
    ? `background-image:url('${patternBg}');background-repeat:no-repeat;background-size:${width}px ${height}px;background-position:left top;`
    : `background-color:${bgColor};`;
  
  const html = `
  <table cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;width:${width}px;height:${height}px;background-color:#ffffff;">
    <tr>
      <td style="padding:0;${bgStyle}">
        ${includePattern && patternBg ? `<!--[if mso]>
        <v:rect xmlns:v="urn:schemas-microsoft-com:vml" style="width:${width}px;height:${height}px;position:absolute;left:0;top:0;" strokecolor="none">
          <v:fill type="frame" src="${patternBg}" color="#ffffff" />
        </v:rect>
        <![endif]-->` : ''}
        <table cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;width:100%;">
          <tr>
            <td style="padding:0;vertical-align:middle;">
              <table cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;">
                <tr>
                  <td style="padding:0 ${Math.round(28 * scale * layoutScale)}px 0 ${Math.round(50 * scale)}px;vertical-align:middle;">
                    ${logoSrc ? `<img src="${logoSrc}" alt="Logo" width="${imgBox}" height="${imgBox}" style="display:block;width:${imgBox}px;height:${imgBox}px;object-fit:contain;border:0;" />` : ''}
                  </td>
                  <td style="padding:0;vertical-align:top;">
                    <table cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;font-family:Inter,system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif;">
                      <tr>
                        <td style="font-weight:700;font-size:${Math.round(24 * scale * 0.5)}px;color:${primary};padding:0 0 ${Math.round(2 * scale * 0.5)}px 0;line-height:1.2;">${escapeHtml(name)}</td>
                      </tr>
                      <tr>
                        <td style="font-weight:500;font-size:${Math.round(18 * scale * 0.5)}px;color:rgba(17,24,39,0.7);padding:0 0 ${Math.round(4 * scale * 0.5)}px 0;line-height:1.2;">${escapeHtml(title)}</td>
                      </tr>
                      <tr>
                        <td style="font-size:${Math.round(18 * scale * 0.5)}px;color:rgba(17,24,39,0.9);padding:0 0 ${Math.round(4 * scale * 0.5)}px 0;line-height:1.2;">
                          ${includeImages && globeIconBase64 ? `<img src="${globeIconBase64}" alt="" width="${Math.round(18 * scale * 0.5)}" height="${Math.round(18 * scale * 0.5)}" style="vertical-align:middle;width:${Math.round(18 * scale * 0.5)}px;height:${Math.round(18 * scale * 0.5)}px;margin-right:${Math.round(8 * scale * 0.5)}px;border:0;display:inline-block;" />` : '🌐 '}
                          <a href="${escapeHtml(website)}" style="color:rgba(17,24,39,0.9);text-decoration:none;">${escapeHtml(website)}</a>
                        </td>
                      </tr>
                      <tr>
                        <td style="font-size:${Math.round(18 * scale * 0.5)}px;color:rgba(17,24,39,0.9);padding:0 0 ${Math.round(12 * scale * 0.5)}px 0;line-height:1.2;">
                          ${includeImages && phoneIconBase64 ? `<img src="${phoneIconBase64}" alt="" width="${Math.round(18 * scale * 0.5)}" height="${Math.round(18 * scale * 0.5)}" style="vertical-align:middle;width:${Math.round(18 * scale * 0.5)}px;height:${Math.round(18 * scale * 0.5)}px;margin-right:${Math.round(8 * scale * 0.5)}px;border:0;display:inline-block;" />` : '📞 '}
                          ${escapeHtml(phone)}
                          <span style="padding:0 ${Math.round(8 * scale * 0.5)}px;color:rgba(107,114,128,0.9);">|</span>
                          ${includeImages && emailIconBase64 ? `<img src="${emailIconBase64}" alt="" width="${Math.round(18 * scale * 0.5)}" height="${Math.round(18 * scale * 0.5)}" style="vertical-align:middle;width:${Math.round(18 * scale * 0.5)}px;height:${Math.round(18 * scale * 0.5)}px;margin-right:${Math.round(8 * scale * 0.5)}px;border:0;display:inline-block;" />` : '✉️ '}
                          <a href="mailto:${escapeHtml(email)}" style="color:rgba(17,24,39,0.9);text-decoration:none;">${escapeHtml(email)}</a>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding:${Math.round(6 * scale * 0.5)}px 0;">
                          <hr style="border:none;border-top:1px solid rgba(107,114,128,0.3);margin:0;padding:0;" />
                        </td>
                      </tr>
                      ${address ? `
                      <tr>
                        <td style="font-size:${Math.round(14 * scale * 0.5)}px;color:rgba(55,65,81,0.9);padding:${Math.round(10 * scale * 0.5)}px 0 ${Math.round(2 * scale * 0.5)}px 0;line-height:1.2;">${escapeHtml(address)}</td>
                      </tr>` : ''}
                      ${rights1 ? `
                      <tr>
                        <td style="font-size:${Math.round(14 * scale * 0.5)}px;color:rgba(17,24,39,0.9);padding:0 0 ${Math.round(2 * scale * 0.5)}px 0;line-height:1.2;">${escapeHtml(rights1)}</td>
                      </tr>` : ''}
                      ${rights2 ? `
                      <tr>
                        <td style="font-size:${Math.round(14 * scale * 0.5)}px;color:${rights2UseFg ? primary : 'rgba(107,114,128,0.95)'};padding:0;line-height:1.2;${rights2Italic ? 'font-style:italic;' : ''}">${escapeHtml(rights2)}</td>
                      </tr>` : ''}
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>`;
  
  try {
    const blob = new Blob([html], { type: 'text/html' });
    const data = [new ClipboardItem({ 'text/html': blob })];
    await navigator.clipboard.write(data);
    let message = 'HTML signature copied. Paste directly into your email signature settings.';
    if (!includePattern && includeImages) {
      message = 'Outlook-compatible HTML signature copied (no pattern background).';
    } else if (!includeImages) {
      message = 'Text-only HTML signature copied (no images).';
    }
    showToast(message, 'success');
  } catch (err) {
    console.error('Failed to copy HTML signature', err);
    showToast('Copy to clipboard failed. Please try a different browser.', 'error');
  }
}

// Export to window for onclick handlers
window.downloadSignature = downloadSignature;
window.copyHtmlSignature = copyHtmlSignature;
window.copyHtmlSignatureOutlook = copyHtmlSignatureOutlook;
window.copyHtmlSignatureTextOnly = copyHtmlSignatureTextOnly;

