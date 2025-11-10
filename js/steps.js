// Step navigation functionality

let currentStep = 1;
const totalSteps = 6;
let hasCopiedSignature = false; // Track if user has copied signature

// Minimal SVG icons for steps
const stepIcons = {
  1: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>',
  2: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>',
  3: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>',
  4: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>',
  5: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"></path></svg>',
  6: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>'
};

const steps = [
  { id: 1, title: "Template & Logo" },
  { id: 2, title: "Personal Info" },
  { id: 3, title: "Contact" },
  { id: 4, title: "Additional" },
  { id: 5, title: "Styling" },
  { id: 6, title: "Preview" }
];

function initSteps() {
  renderStepIndicator();
  showStep(1);
  setupStepNavigation();
}

function renderStepIndicator() {
  const indicator = document.getElementById('stepIndicator');
  if (!indicator) return;
  
  indicator.innerHTML = steps.map((step, index) => {
    const isActive = step.id === currentStep;
    const isCompleted = step.id < currentStep;
    const stepNumber = step.id;
    const icon = stepIcons[step.id] || '';
    
    return `
      <div class="flex items-center flex-1">
        <div class="flex flex-col items-center flex-1 relative">
          <button 
            data-step="${step.id}" 
            class="step-button flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-200 ${
              isActive 
                ? 'bg-blue-600 border-blue-600 text-white shadow-md' 
                : isCompleted 
                  ? 'bg-green-500 border-green-500 text-white' 
                  : 'bg-white border-gray-300 text-gray-400 hover:border-gray-400'
            }"
            ${step.id <= currentStep ? '' : 'cursor-not-allowed opacity-50'}
          >
            ${icon}
          </button>
          <span class="mt-2 text-xs font-medium text-center ${
            isActive ? 'text-blue-600 font-semibold' : isCompleted ? 'text-green-600' : 'text-gray-500'
          }">${step.title}</span>
          ${isActive ? '<div class="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-8 h-0.5 bg-blue-600 rounded-full"></div>' : ''}
        </div>
        ${index < steps.length - 1 ? `
          <div class="flex-1 h-0.5 mx-1 ${
            step.id < currentStep ? 'bg-green-500' : 'bg-gray-200'
          } transition-colors duration-200"></div>
        ` : ''}
      </div>
    `;
  }).join('');
  
  // Add click handlers
  document.querySelectorAll('.step-button').forEach(btn => {
    const stepNum = parseInt(btn.dataset.step);
    if (stepNum <= currentStep) {
      btn.addEventListener('click', () => goToStep(stepNum));
    }
  });
}

function showStep(stepNumber) {
  currentStep = stepNumber;
  
  // Reset copied flag if navigating away from step 6
  if (stepNumber !== totalSteps) {
    hasCopiedSignature = false;
  }
  
  // Hide all steps
  document.querySelectorAll('.step-content').forEach(step => {
    step.classList.add('hidden');
  });
  
  // Show current step
  const currentStepEl = document.getElementById(`step${stepNumber}`);
  if (currentStepEl) {
    currentStepEl.classList.remove('hidden');
  }
  
  // Update step indicator
  renderStepIndicator();
  
  // Update navigation buttons
  updateNavigationButtons();
  
  // Scroll to top of form
  document.querySelector('.bg-white.rounded-xl').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function updateNavigationButtons() {
  const prevBtn = document.getElementById('prevStep');
  const nextBtn = document.getElementById('nextStep');
  const currentStepEl = document.getElementById('currentStepNumber');
  const totalStepsEl = document.getElementById('totalStepsNumber');
  
  if (currentStepEl) currentStepEl.textContent = currentStep;
  if (totalStepsEl) totalStepsEl.textContent = totalSteps;
  
  if (prevBtn) {
    prevBtn.disabled = currentStep === 1;
    prevBtn.classList.toggle('opacity-50', currentStep === 1);
    prevBtn.classList.toggle('cursor-not-allowed', currentStep === 1);
  }
  
  if (nextBtn) {
    if (currentStep === totalSteps) {
      nextBtn.textContent = 'Complete';
      nextBtn.classList.add('bg-green-600', 'hover:bg-green-700');
      nextBtn.classList.remove('bg-blue-600', 'hover:bg-blue-700');
      // Disable Complete button until user copies signature
      nextBtn.disabled = !hasCopiedSignature;
      nextBtn.classList.toggle('opacity-50', !hasCopiedSignature);
      nextBtn.classList.toggle('cursor-not-allowed', !hasCopiedSignature);
    } else {
      nextBtn.textContent = 'Next';
      nextBtn.classList.add('bg-blue-600', 'hover:bg-blue-700');
      nextBtn.classList.remove('bg-green-600', 'hover:bg-green-700');
      nextBtn.disabled = false;
      nextBtn.classList.remove('opacity-50', 'cursor-not-allowed');
    }
  }
}

function setupStepNavigation() {
  const prevBtn = document.getElementById('prevStep');
  const nextBtn = document.getElementById('nextStep');
  
  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      if (currentStep > 1) {
        goToStep(currentStep - 1);
      }
    });
  }
  
  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      // Step 6 (Complete) - restart process
      if (currentStep === totalSteps) {
        if (hasCopiedSignature) {
          // Show congratulations message
          if (window.showToast) {
            window.showToast('🎉 Congratulations! Your signature has been created successfully!', 'success');
          }
          
          // Reset the process after a short delay
          setTimeout(() => {
            resetProcess();
          }, 1500);
        } else {
          // User hasn't copied yet
          if (window.showToast) {
            window.showToast('Please copy your signature first using one of the copy buttons above.', 'error');
          }
        }
      } else if (validateCurrentStep()) {
        // For other steps, validate before proceeding
        if (currentStep < totalSteps) {
          goToStep(currentStep + 1);
        }
      }
    });
  }
}

function validateCurrentStep() {
  const requiredFields = {
    2: ['fullName', 'jobTitle', 'website'],
    3: ['emailUsername', 'phone']
  };
  
  const fields = requiredFields[currentStep];
  if (!fields) return true; // No validation needed for this step
  
  const missing = [];
  fields.forEach(fieldId => {
    let field = document.getElementById(fieldId);
    let isValid = false;
    
    // Special handling for email
    if (fieldId === 'emailUsername') {
      if (window.validateEmailField) {
        isValid = window.validateEmailField();
      } else {
        isValid = field && field.value.trim() !== '';
      }
      if (!isValid) {
        missing.push('email');
        if (field) field.classList.add('border-red-500');
        setTimeout(() => {
          if (field) field.classList.remove('border-red-500');
        }, 2000);
      }
    } else {
      if (field && !field.value.trim()) {
        missing.push(fieldId);
        field.classList.add('border-red-500');
        setTimeout(() => field.classList.remove('border-red-500'), 2000);
      }
    }
  });
  
  if (missing.length > 0) {
    const fieldNames = missing.map(id => {
      if (id === 'emailUsername') return 'Email';
      const label = document.querySelector(`label[for="${id}"]`)?.textContent || id;
      return label.replace('*', '').trim();
    }).join(', ');
    showToast(`Please fill in: ${fieldNames}`, 'error');
    return false;
  }
  
  return true;
}

function goToStep(stepNumber) {
  if (stepNumber >= 1 && stepNumber <= totalSteps) {
    showStep(stepNumber);
  }
}

function resetProcess() {
  // Reset to step 1
  currentStep = 1;
  hasCopiedSignature = false;
  showStep(1);
  
  // Clear all form fields
  document.querySelectorAll('input[type="text"], input[type="email"], select').forEach(input => {
    if (input.id !== 'templateSelect') { // Keep template selection
      input.value = '';
    }
  });
  
  // Clear email username field specifically
  const emailUsername = document.getElementById('emailUsername');
  if (emailUsername) emailUsername.value = '';
  
  // Clear checkboxes
  document.getElementById('rights2Italic')?.removeAttribute('checked');
  document.getElementById('rights2UseFg')?.setAttribute('checked', 'checked');
  
  // Reset logo
  if (window.clearLogo) {
    window.clearLogo();
  }
  
  // Reset email domain
  if (window.setEmailFromTemplate) {
    const templateSelect = document.getElementById('templateSelect');
    if (templateSelect && templateSelect.value) {
      // Re-apply template if one was selected
      if (window.applyTemplate) {
        window.applyTemplate(templateSelect.value);
      }
    } else {
      // Reset to default
      if (window.setEmailFromTemplate) {
        window.setEmailFromTemplate('flagshipfintech.com', null);
      }
    }
  }
  
  // Reset signature preview
  if (window.updateSignature) {
    window.updateSignature();
  }
  
  // Scroll to top
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function markSignatureCopied() {
  hasCopiedSignature = true;
  updateNavigationButtons();
}

// Export functions
window.initSteps = initSteps;
window.goToStep = goToStep;
window.currentStep = currentStep;
window.markSignatureCopied = markSignatureCopied;

