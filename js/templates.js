// Template handling functions

let templates = {};
let jobTitles = [];
let filteredJobTitles = [];
let selectedIndex = -1;

async function fetchToDataURL(path) {
  try {
    const res = await fetch(path);
    if (!res.ok) return null;
    const blob = await res.blob();
    return await new Promise(resolve => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.readAsDataURL(blob);
    });
  } catch (e) {
    return null;
  }
}

async function applyTemplate(key) {
  if (!key || !templates[key]) return;
  const t = templates[key];
  
  const fieldMap = {
    fullName: "fullName",
    jobTitle: "jobTitle",
    phone: "phone",
    website: "website",
    address: "address",
    rights1: "rights1",
    rights2: "rights2",
  };
  
  Object.entries(fieldMap).forEach(([srcKey, elId]) => {
    const el = document.getElementById(elId);
    if (el && t && t.fields && Object.prototype.hasOwnProperty.call(t.fields, srcKey)) {
      el.value = t.fields[srcKey] || "";
    }
  });
  
  // Email field is kept empty - user must enter their own email
  const emailEl = document.getElementById("email");
  if (emailEl) emailEl.value = "";
  
  // Apply default pattern if specified
  if (t && t.defaultPattern) {
    const patternSelect = document.getElementById("bgPattern");
    if (patternSelect) {
      patternSelect.value = t.defaultPattern;
      // Trigger change event to ensure signature updates
      patternSelect.dispatchEvent(new Event('change', { bubbles: true }));
    }
  }
  
  try {
    let dataUrl = null;
    if (t && Array.isArray(t.logos)) {
      for (const p of t.logos) { 
        dataUrl = await fetchToDataURL(p); 
        if (dataUrl) break; 
      }
    } else if (t && t.logo) {
      dataUrl = await fetchToDataURL(t.logo);
    }
    
    if (dataUrl) {
      window.logoBase64 = dataUrl;
      if (window.showTemplateLogoPreview) {
        window.showTemplateLogoPreview(dataUrl, t.logos ? t.logos[0] : t.logo);
      }
      const img = new Image();
      img.src = window.logoBase64;
      img.onload = () => {
        const colorThief = new ColorThief();
        try {
          const palette = colorThief.getPalette(img, 6);
          window.logoColors = palette.map(rgb => `rgb(${rgb[0]},${rgb[1]},${rgb[2]})`);
          if (window.renderPalette) window.renderPalette();
          if (window.logoColors[0]) window.selectedColor = window.logoColors[0];
          const brightest = palette.reduce((best, c) => {
            const lum = 0.2126*c[0] + 0.7152*c[1] + 0.0722*c[2];
            return (!best || lum > best.lum) ? { color: `rgb(${c[0]},${c[1]},${c[2]})`, lum } : best;
          }, null);
          if (brightest && brightest.color) window.selectedBgColor = brightest.color;
        } catch (e) { /* ignore color extraction errors */ }
        if (window.updateSignature) window.updateSignature();
      };
    } else {
      if (window.clearLogo) window.clearLogo();
      showToast("Template logo not found. Place files under /logos.", "error");
    }
  } catch (e) {
    showToast("Failed to load template logo.", "error");
  }
}

// Load templates from JSON
function loadTemplates() {
  fetch('templates.json')
    .then(r => r.ok ? r.json() : null)
    .then(data => {
      if (!data || !Array.isArray(data.templates)) return;
      const select = document.getElementById('templateSelect');
      [...select.querySelectorAll('option')].forEach(opt => { 
        if (opt.value) opt.remove(); 
      });
      templates = {};
      data.templates.forEach(t => {
        templates[t.key] = t;
        const opt = document.createElement('option');
        opt.value = t.key;
        opt.textContent = t.label || t.key;
        select.appendChild(opt);
      });
      
      if (data.common && data.common.jobTitles) {
        jobTitles = data.common.jobTitles;
        filteredJobTitles = [...jobTitles];
        // Update window variables so they're accessible globally
        window.jobTitles = jobTitles;
        window.filteredJobTitles = filteredJobTitles;
        if (window.setupJobTitleAutocomplete) {
          window.setupJobTitleAutocomplete();
        }
      }
    }).catch(() => {});
}

// Export for use in other modules
window.templates = templates;
window.jobTitles = jobTitles;
window.filteredJobTitles = filteredJobTitles;
window.selectedIndex = selectedIndex;
window.applyTemplate = applyTemplate;
window.loadTemplates = loadTemplates;

