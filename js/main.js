// Main initialization and event handlers

// Initialize global state
window.selectedColor = CONFIG.defaultFgColor;
window.selectedBgColor = CONFIG.defaultBgColor;
window.logoBase64 = "";
window.logoColors = new Array(CONFIG.logoColorCount).fill(null);

async function updateSignature() {
  const name = document.getElementById("fullName")?.value || "";
  const title = document.getElementById("jobTitle")?.value || "";
  const phone = document.getElementById("phone")?.value || "";
  const email = document.getElementById("email")?.value || "";
  const website = document.getElementById("website")?.value || "";
  const address = document.getElementById("address")?.value || "";
  const rights1 = document.getElementById("rights1")?.value || "";
  const rights2 = document.getElementById("rights2")?.value || "";
  const opacity = document.getElementById("bgOpacity")?.value / 100 || 0.5;
  const rights2Italic = document.getElementById("rights2Italic")?.checked || false;
  const rights2UseFg = document.getElementById("rights2UseFg")?.checked || true;
  const verticalPositionVal = parseInt(document.getElementById("verticalPosition")?.value || 30);
  const horizontalPositionVal = parseInt(document.getElementById("horizontalPosition")?.value || 10);
  const patternType = document.getElementById("bgPattern")?.value || 'circles';
  const signatureContent = document.getElementById("signatureContent");
  
  if (!signatureContent) return;

  const fullImage = await buildFullSignatureImage({ 
    name, title, phone, email, website, address, rights1, rights2, 
    rights2Italic, rights2UseFg, logoSrc: window.logoBase64, 
    fg: window.selectedColor, ringsOpacity: opacity, 
    ringsColor: window.selectedBgColor, 
    verticalPositionPercent: verticalPositionVal,
    horizontalPositionPercent: horizontalPositionVal,
    patternType 
  });

  signatureContent.innerHTML = `
    <img src="${fullImage.src}" alt="email signature" width="${fullImage.width}" height="${fullImage.height}" style="display:block; width:${fullImage.width}px; height:auto;" />`;

  const preview = document.getElementById("signature-preview");
  if (preview) preview.style.background = "#ffffff";
}

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  // Initialize palettes
  renderPalette();
  updateSliderVisual();
  updateVerticalPositionVisual();
  updateHorizontalPositionVisual();
  
  // Set up input listeners
  document.querySelectorAll("input").forEach(el => {
    el.addEventListener("input", updateSignature);
  });
  
  // Slider listeners
  const bgOpacity = document.getElementById("bgOpacity");
  if (bgOpacity) {
    bgOpacity.addEventListener("input", () => {
      updateSignature();
      updateSliderVisual();
    });
  }
  
  const verticalPosition = document.getElementById("verticalPosition");
  if (verticalPosition) {
    verticalPosition.addEventListener("input", () => {
      updateSignature();
      updateVerticalPositionVisual();
    });
  }
  
  const horizontalPosition = document.getElementById("horizontalPosition");
  if (horizontalPosition) {
    horizontalPosition.addEventListener("input", () => {
      updateSignature();
      updateHorizontalPositionVisual();
    });
  }
  
  // Template and pattern selectors
  const templateSelect = document.getElementById("templateSelect");
  if (templateSelect) {
    templateSelect.addEventListener("change", () => {
      if (window.applyTemplate) window.applyTemplate(templateSelect.value);
    });
  }
  
  const bgPattern = document.getElementById("bgPattern");
  if (bgPattern) {
    bgPattern.addEventListener("change", updateSignature);
  }
  
  // Logo upload handlers
  const logoUpload = document.getElementById("logoUpload");
  const logoUploadArea = document.getElementById('logoUploadArea');
  const removeLogo = document.getElementById('removeLogo');
  
  if (logoUploadArea && logoUpload) {
    logoUploadArea.addEventListener('click', () => {
      logoUpload.click();
    });
    
    logoUploadArea.addEventListener('dragover', (e) => {
      e.preventDefault();
      logoUploadArea.classList.add('border-blue-400', 'bg-blue-50');
    });
    
    logoUploadArea.addEventListener('dragleave', (e) => {
      e.preventDefault();
      logoUploadArea.classList.remove('border-blue-400', 'bg-blue-50');
    });
    
    logoUploadArea.addEventListener('drop', (e) => {
      e.preventDefault();
      logoUploadArea.classList.remove('border-blue-400', 'bg-blue-50');
      const files = e.dataTransfer.files;
      if (files.length > 0) {
        const file = files[0];
        if (isValidImageFile(file)) {
          logoUpload.files = files;
          handleLogoUpload(file);
        } else {
          showToast('Please select a valid image file (PNG, JPG, JPEG, SVG)', 'error');
        }
      }
    });
  }
  
  if (logoUpload) {
    logoUpload.addEventListener("change", () => {
      const file = logoUpload.files[0];
      if (file && isValidImageFile(file)) {
        handleLogoUpload(file);
      } else if (file) {
        showToast('Please select a valid image file (PNG, JPG, JPEG, SVG)', 'error');
      }
    });
  }
  
  if (removeLogo) {
    removeLogo.addEventListener('click', (e) => {
      e.stopPropagation();
      clearLogo();
    });
  }
  
  // Load templates
  if (window.loadTemplates) window.loadTemplates();
  
  // Initial signature update
  updateSignature();
});

// Export to window
window.updateSignature = updateSignature;

