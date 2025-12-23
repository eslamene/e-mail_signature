// Email domain management

let currentEmailDomain = ""; // Will be set from template or first available domain
let availableDomains = [];
let isCustomDomain = false;

function initEmailDomain() {
  // Extract domains from templates
  if (window.templates && Object.keys(window.templates).length > 0) {
    availableDomains = [];
    
    Object.entries(window.templates).forEach(([key, t]) => {
      // Use emailDomain if exists, otherwise form from template key
      const domain = t.emailDomain || formDomainFromTemplateKey(key);
      if (domain && !availableDomains.includes(domain)) {
        availableDomains.push(domain);
      }
    });
  } else {
    // If templates not loaded yet, start with empty array
    // refreshEmailDomains() will populate it later
    availableDomains = [];
  }
  
  // Set up event listeners
  setupEmailDomainListeners();
  
  // Update domain display (will use default if no domain set yet)
  updateEmailDomainDisplay();
  updateEmailField();
}

function formDomainFromTemplateKey(templateKey) {
  // Convert template key to domain format
  // e.g., "Flagshipfintech" -> "flagshipfintech.com"
  // e.g., "cashfloweg" -> "cashfloweg.com"
  // e.g., "79-pay" -> "79-pay.com"
  if (!templateKey) return null;
  return templateKey.toLowerCase().trim() + '.com';
}

function refreshEmailDomains() {
  // Re-extract domains from templates (called after templates load)
  if (window.templates && Object.keys(window.templates).length > 0) {
    // Clear and rebuild from templates
    availableDomains = [];
    
    Object.entries(window.templates).forEach(([key, t]) => {
      // Use emailDomain if exists, otherwise form from template key
      const domain = t.emailDomain || formDomainFromTemplateKey(key);
      if (domain && !availableDomains.includes(domain)) {
        availableDomains.push(domain);
      }
    });
    
    // If no current domain is set and we have domains, set the first one as default
    if (availableDomains.length > 0 && !currentEmailDomain) {
      currentEmailDomain = availableDomains[0];
      updateEmailDomainDisplay();
      updateEmailField();
    }
  }
}

function setupEmailDomainListeners() {
  const usernameInput = document.getElementById('emailUsername');
  const domainToggle = document.getElementById('emailDomainToggle');
  const domainDropdown = document.getElementById('emailDomainDropdown');
  const customDomainBtn = document.getElementById('emailDomainCustom');
  const emailContainer = usernameInput?.closest('div');
  
  // Update email field when username changes
  if (usernameInput) {
    // Prevent "@" character and domain from being entered
    usernameInput.addEventListener('keydown', (e) => {
      // Prevent "@" key
      if (e.key === '@' || e.keyCode === 64) {
        e.preventDefault();
        if (window.showToast) {
          window.showToast('Domain is selected separately. Enter only your username.', 'error');
        }
        return false;
      }
    });
    
    usernameInput.addEventListener('input', (e) => {
      let value = e.target.value;
      
      // Remove "@" if user pasted or typed it
      if (value.includes('@')) {
        // Extract username part (before @)
        const atIndex = value.indexOf('@');
        value = value.substring(0, atIndex);
        e.target.value = value;
        
        if (window.showToast) {
          window.showToast('Domain is selected separately. Only username entered.', 'error');
        }
      }
      
      updateEmailField();
      if (window.updateSignature) window.updateSignature();
    });
    
    // Prevent pasting email addresses
    usernameInput.addEventListener('paste', (e) => {
      e.preventDefault();
      const pastedText = (e.clipboardData || window.clipboardData).getData('text');
      
      // Extract username from pasted email
      let username = pastedText;
      if (pastedText.includes('@')) {
        username = pastedText.split('@')[0];
      }
      
      // Clean username (remove invalid characters)
      username = username.replace(/[^a-zA-Z0-9._-]/g, '');
      
      e.target.value = username;
      updateEmailField();
      if (window.updateSignature) window.updateSignature();
      
      if (pastedText.includes('@') || domainPattern.test(pastedText)) {
        if (window.showToast) {
          window.showToast('Only username extracted. Domain is selected separately.', 'error');
        }
      }
    });
    
    usernameInput.addEventListener('blur', () => {
      validateEmailField();
    });
  }
  
  // Toggle domain dropdown
  if (domainToggle) {
    domainToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleDomainDropdown();
    });
  }
  
  // Close dropdown when clicking outside
  document.addEventListener('click', (e) => {
    if (domainDropdown && !emailContainer?.contains(e.target)) {
      hideDomainDropdown();
    }
  });
  
  // Custom domain button
  if (customDomainBtn) {
    customDomainBtn.addEventListener('click', () => {
      showCustomDomainInput();
    });
  }
  
  // Populate domain options
  populateDomainOptions();
}

function populateDomainOptions() {
  const optionsContainer = document.getElementById('emailDomainOptions');
  if (!optionsContainer) return;
  
  optionsContainer.innerHTML = '';
  
  availableDomains.forEach(domain => {
    const option = document.createElement('button');
    option.type = 'button';
    option.className = `w-full text-left px-3 py-2 text-sm rounded-md hover:bg-gray-100 transition-colors ${
      domain === currentEmailDomain ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-700'
    }`;
    option.textContent = `@${domain}`;
    option.addEventListener('click', () => {
      setEmailDomain(domain);
      hideDomainDropdown();
    });
    optionsContainer.appendChild(option);
  });
}

function toggleDomainDropdown() {
  const dropdown = document.getElementById('emailDomainDropdown');
  if (!dropdown) return;
  
  if (dropdown.classList.contains('hidden')) {
    showDomainDropdown();
  } else {
    hideDomainDropdown();
  }
}

function showDomainDropdown() {
  const dropdown = document.getElementById('emailDomainDropdown');
  if (!dropdown) return;
  
  dropdown.classList.remove('hidden');
  populateDomainOptions();
}

function hideDomainDropdown() {
  const dropdown = document.getElementById('emailDomainDropdown');
  if (dropdown) dropdown.classList.add('hidden');
}

function showCustomDomainInput() {
  hideDomainDropdown();
  const customDomain = prompt('Enter custom domain (e.g., example.com):', currentEmailDomain);
  if (customDomain && customDomain.trim()) {
    const domain = customDomain.trim().replace(/^@/, ''); // Remove @ if user added it
    if (domain.includes('@')) {
      showToast('Invalid domain format. Enter domain only (e.g., example.com)', 'error');
      return;
    }
    setEmailDomain(domain, true);
  }
}

function setEmailDomain(domain, isCustom = false) {
  currentEmailDomain = domain;
  isCustomDomain = isCustom;
  updateEmailDomainDisplay();
  updateEmailField();
  if (window.updateSignature) window.updateSignature();
}

function updateEmailDomainDisplay() {
  const domainDisplay = document.getElementById('emailDomain');
  if (domainDisplay) {
    if (currentEmailDomain) {
      domainDisplay.textContent = `@${currentEmailDomain}`;
    } else {
      domainDisplay.textContent = '@example.com'; // Placeholder until domain is set
    }
  }
}

function updateEmailField() {
  const usernameInput = document.getElementById('emailUsername');
  const emailField = document.getElementById('email');
  
  if (usernameInput && emailField) {
    const username = usernameInput.value.trim();
    if (username) {
      emailField.value = `${username}@${currentEmailDomain}`;
    } else {
      emailField.value = '';
    }
  }
}

function validateEmailField() {
  const usernameInput = document.getElementById('emailUsername');
  const emailField = document.getElementById('email');
  
  if (!usernameInput || !emailField) return true;
  
  const username = usernameInput.value.trim();
  const email = emailField.value;
  
  // Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  if (!username) {
    usernameInput.setCustomValidity('Username is required');
    return false;
  } else if (!emailRegex.test(email)) {
    usernameInput.setCustomValidity('Invalid email format');
    return false;
  } else {
    usernameInput.setCustomValidity('');
    return true;
  }
}

function getEmailValue() {
  const emailField = document.getElementById('email');
  return emailField ? emailField.value : '';
}

function setEmailFromTemplate(domain, templateKey = null) {
  // Priority: Use emailDomain from templates.json first
  if (domain) {
    // Use the emailDomain from templates.json
    setEmailDomain(domain, false);
  } else if (templateKey) {
    // Fallback: Only form from template key if emailDomain is not in templates.json
    const formedDomain = formDomainFromTemplateKey(templateKey);
    if (formedDomain) {
      setEmailDomain(formedDomain, false);
    }
  }
}

// Export functions
window.initEmailDomain = initEmailDomain;
window.refreshEmailDomains = refreshEmailDomains;
window.setEmailFromTemplate = setEmailFromTemplate;
window.getEmailValue = getEmailValue;
window.validateEmailField = validateEmailField;

