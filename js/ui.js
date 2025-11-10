// UI interaction functions

function renderPalette() {
  const colorPalette = document.getElementById("colorPalette");
  const bgColorPalette = document.getElementById("bgColorPalette");
  if (!colorPalette || !bgColorPalette) return;
  
  colorPalette.innerHTML = "";
  [...CONFIG.baseColors, ...(window.logoColors || [])].forEach(c => {
    const swatch = document.createElement("div");
    swatch.className = "color-swatch";
    if (c) {
      swatch.style.background = c;
      swatch.onclick = () => {
        window.selectedColor = c;
        if (window.updateSignature) window.updateSignature();
      };
    } else {
      swatch.style.background = "repeating-conic-gradient(#e5e7eb 0% 25%, transparent 0% 50%) 50% / 10px 10px";
      swatch.style.cursor = "not-allowed";
    }
    colorPalette.appendChild(swatch);
  });

  bgColorPalette.innerHTML = "";
  [...CONFIG.baseColors, ...(window.logoColors || [])].forEach(c => {
    const swatch = document.createElement("div");
    swatch.className = "color-swatch";
    if (c) {
      swatch.style.background = c;
      swatch.onclick = () => { 
        window.selectedBgColor = c; 
        if (window.updateSignature) window.updateSignature(); 
      };
    } else {
      swatch.style.background = "repeating-conic-gradient(#e5e7eb 0% 25%, transparent 0% 50%) 50% / 10px 10px";
      swatch.style.cursor = "not-allowed";
    }
    bgColorPalette.appendChild(swatch);
  });
}

function updateSliderVisual() {
  const bgOpacity = document.getElementById("bgOpacity");
  if (!bgOpacity) return;
  const value = bgOpacity.value;
  const percentage = value + '%';
  const opacityValue = document.getElementById('opacityValue');
  const sliderProgress = document.getElementById('sliderProgress');
  if (opacityValue) opacityValue.textContent = percentage;
  if (sliderProgress) sliderProgress.style.width = percentage;
}

function updateVerticalPositionVisual() {
  const verticalPosition = document.getElementById("verticalPosition");
  if (!verticalPosition) return;
  const value = parseInt(verticalPosition.value);
  const min = parseInt(verticalPosition.min);
  const max = parseInt(verticalPosition.max);
  const displayPercentage = value + '%';
  const range = max - min;
  const positionInRange = value - min;
  const progressPercentage = ((positionInRange / range) * 100) + '%';
  const verticalPositionValue = document.getElementById('verticalPositionValue');
  const verticalPositionProgress = document.getElementById('verticalPositionProgress');
  if (verticalPositionValue) verticalPositionValue.textContent = displayPercentage;
  if (verticalPositionProgress) verticalPositionProgress.style.width = progressPercentage;
}

function updateHorizontalPositionVisual() {
  const horizontalPosition = document.getElementById("horizontalPosition");
  if (!horizontalPosition) return;
  const value = parseInt(horizontalPosition.value);
  const min = parseInt(horizontalPosition.min);
  const max = parseInt(horizontalPosition.max);
  const displayPercentage = value + '%';
  const range = max - min;
  const positionInRange = value - min;
  const progressPercentage = ((positionInRange / range) * 100) + '%';
  const horizontalPositionValue = document.getElementById('horizontalPositionValue');
  const horizontalPositionProgress = document.getElementById('horizontalPositionProgress');
  if (horizontalPositionValue) horizontalPositionValue.textContent = displayPercentage;
  if (horizontalPositionProgress) horizontalPositionProgress.style.width = progressPercentage;
}

function isValidImageFile(file) {
  const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml'];
  const validExtensions = ['.png', '.jpg', '.jpeg', '.svg'];
  const fileName = file.name.toLowerCase();
  return validTypes.includes(file.type) || 
         validExtensions.some(ext => fileName.endsWith(ext));
}

function handleLogoUpload(file) {
  showLogoPreview(file);
  const reader = new FileReader();
  reader.onload = function(e) {
    const result = e.target.result;
    const isSvg = file.type === 'image/svg+xml' || (file.name || '').toLowerCase().endsWith('.svg');
    if (isSvg) {
      rasterizeSvgToPng(result, 512, 512).then((pngDataUrl) => {
        window.logoBase64 = pngDataUrl;
        extractLogoPaletteAndRender(pngDataUrl);
      }).catch(() => {
        showToast('Failed to process SVG logo', 'error');
      });
    } else {
      window.logoBase64 = result;
      extractLogoPaletteAndRender(result);
    }
  };
  reader.readAsDataURL(file);
}

function showLogoPreview(file) {
  const logoPreviewImg = document.getElementById('logoPreviewImg');
  const logoFileName = document.getElementById('logoFileName');
  const logoUploadArea = document.getElementById('logoUploadArea');
  const logoPreview = document.getElementById('logoPreview');
  if (!logoPreviewImg || !logoFileName || !logoUploadArea || !logoPreview) return;
  
  const reader = new FileReader();
  reader.onload = function(e) {
    logoPreviewImg.src = e.target.result;
    logoFileName.textContent = file.name;
    logoUploadArea.classList.add('hidden');
    logoPreview.classList.remove('hidden');
  };
  reader.readAsDataURL(file);
}

function clearLogo() {
  const logoUpload = document.getElementById('logoUpload');
  const logoUploadArea = document.getElementById('logoUploadArea');
  const logoPreview = document.getElementById('logoPreview');
  if (logoUpload) logoUpload.value = '';
  window.logoBase64 = null;
  if (logoUploadArea) logoUploadArea.classList.remove('hidden');
  if (logoPreview) logoPreview.classList.add('hidden');
  if (window.updateSignature) window.updateSignature();
  showToast('Logo removed', 'success');
}

function showTemplateLogoPreview(dataUrl, logoPath) {
  const logoPreviewImg = document.getElementById('logoPreviewImg');
  const logoFileName = document.getElementById('logoFileName');
  const logoUploadArea = document.getElementById('logoUploadArea');
  const logoPreview = document.getElementById('logoPreview');
  if (!logoPreviewImg || !logoFileName || !logoUploadArea || !logoPreview) return;
  
  logoPreviewImg.src = dataUrl;
  logoFileName.textContent = logoPath ? logoPath.split('/').pop() : 'Template Logo';
  logoUploadArea.classList.add('hidden');
  logoPreview.classList.remove('hidden');
}

function extractLogoPaletteAndRender(dataUrl) {
  const img = new Image();
  img.src = dataUrl;
  img.onload = () => {
    const colorThief = new ColorThief();
    try {
      const palette = colorThief.getPalette(img, 6);
      window.logoColors = palette.map(rgb => `rgb(${rgb[0]},${rgb[1]},${rgb[2]})`);
      renderPalette();
      if (window.logoColors[0]) window.selectedColor = window.logoColors[0];
      const brightest = palette.reduce((best, c) => {
        const lum = 0.2126*c[0] + 0.7152*c[1] + 0.0722*c[2];
        return (!best || lum > best.lum) ? { color: `rgb(${c[0]},${c[1]},${c[2]})`, lum } : best;
      }, null);
      if (brightest && brightest.color) window.selectedBgColor = brightest.color;
    } catch (err) {
      console.error("Color extraction failed", err);
    }
    if (window.updateSignature) window.updateSignature();
  };
}

function setupJobTitleAutocomplete() {
  const input = document.getElementById('jobTitle');
  const dropdown = document.getElementById('jobTitleDropdown');
  if (!input || !dropdown) return;
  
  input.addEventListener('focus', () => {
    if (input.value.trim() === '') {
      showJobTitleDropdown();
    }
  });
  
  input.addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase();
    window.filteredJobTitles = window.jobTitles.filter(title => 
      title.toLowerCase().includes(query)
    );
    window.selectedIndex = -1;
    showJobTitleDropdown();
  });
  
  input.addEventListener('keydown', (e) => {
    if (!dropdown.classList.contains('hidden')) {
      switch(e.key) {
        case 'ArrowDown':
          e.preventDefault();
          window.selectedIndex = Math.min(window.selectedIndex + 1, window.filteredJobTitles.length - 1);
          updateDropdownSelection();
          break;
        case 'ArrowUp':
          e.preventDefault();
          window.selectedIndex = Math.max(window.selectedIndex - 1, -1);
          updateDropdownSelection();
          break;
        case 'Enter':
          e.preventDefault();
          if (window.selectedIndex >= 0 && window.filteredJobTitles[window.selectedIndex]) {
            selectJobTitle(window.filteredJobTitles[window.selectedIndex]);
          }
          break;
        case 'Escape':
          hideJobTitleDropdown();
          break;
      }
    }
  });
  
  document.addEventListener('click', (e) => {
    if (!input.contains(e.target) && !dropdown.contains(e.target)) {
      hideJobTitleDropdown();
    }
  });
}

function showJobTitleDropdown() {
  const dropdown = document.getElementById('jobTitleDropdown');
  if (!dropdown) return;
  dropdown.innerHTML = '';
  
  // Ensure filteredJobTitles is initialized from jobTitles if empty
  if (!window.filteredJobTitles || window.filteredJobTitles.length === 0) {
    if (window.jobTitles && window.jobTitles.length > 0) {
      window.filteredJobTitles = [...window.jobTitles];
    }
  }
  
  if (!window.filteredJobTitles || window.filteredJobTitles.length === 0) {
    const noResults = document.createElement('div');
    noResults.className = 'px-4 py-2 text-gray-500 text-sm';
    noResults.textContent = 'No job titles found';
    dropdown.appendChild(noResults);
  } else {
    window.filteredJobTitles.forEach((title, index) => {
      const option = document.createElement('div');
      option.className = 'px-4 py-2 text-sm cursor-pointer hover:bg-gray-100 transition-colors';
      option.textContent = title;
      option.addEventListener('click', () => selectJobTitle(title));
      dropdown.appendChild(option);
    });
  }
  dropdown.classList.remove('hidden');
}

function hideJobTitleDropdown() {
  const dropdown = document.getElementById('jobTitleDropdown');
  if (dropdown) dropdown.classList.add('hidden');
  window.selectedIndex = -1;
}

function updateDropdownSelection() {
  const dropdown = document.getElementById('jobTitleDropdown');
  if (!dropdown) return;
  const options = dropdown.querySelectorAll('div');
  options.forEach((option, index) => {
    if (index === window.selectedIndex) {
      option.className = 'px-4 py-2 text-sm cursor-pointer bg-blue-100 text-blue-800 transition-colors';
    } else {
      option.className = 'px-4 py-2 text-sm cursor-pointer hover:bg-gray-100 transition-colors';
    }
  });
}

function selectJobTitle(title) {
  const input = document.getElementById('jobTitle');
  if (input) {
    input.value = title;
    if (window.updateSignature) window.updateSignature();
  }
  hideJobTitleDropdown();
}

// Export functions to window
window.renderPalette = renderPalette;
window.updateSliderVisual = updateSliderVisual;
window.updateVerticalPositionVisual = updateVerticalPositionVisual;
window.updateHorizontalPositionVisual = updateHorizontalPositionVisual;
window.isValidImageFile = isValidImageFile;
window.handleLogoUpload = handleLogoUpload;
window.showLogoPreview = showLogoPreview;
window.clearLogo = clearLogo;
window.showTemplateLogoPreview = showTemplateLogoPreview;
window.extractLogoPaletteAndRender = extractLogoPaletteAndRender;
window.setupJobTitleAutocomplete = setupJobTitleAutocomplete;
window.showJobTitleDropdown = showJobTitleDropdown;
window.hideJobTitleDropdown = hideJobTitleDropdown;
window.updateDropdownSelection = updateDropdownSelection;
window.selectJobTitle = selectJobTitle;

