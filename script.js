
/* ==========================================================================
   SHARED JAVASCRIPT FOR DAISYSYETE PROJECT
   ========================================================================== */

// --------- TAILWIND CONFIG (from HTML files) ---------
if (typeof tailwind !== 'undefined') {
  tailwind.config = {
    theme: {
      extend: {
        colors: {
          "primary-dark": "#163973",
          "brand-blue": "#2563EB",
          "dark-gray": "#374151",
          "light-bg": "#F9FAFB",
        },
      },
    },
  };
}

// --------- FIREBASE CONFIG ---------
const appId = typeof __app_id !== "undefined" ? __app_id : "default-app-id";
const firebaseConfig = typeof __firebase_config !== "undefined" 
  ? JSON.parse(__firebase_config) 
  : {};

// --------- FAQ ACCORDION FUNCTIONALITY ---------
function initFaqAccordion() {
  const faqItems = document.querySelectorAll(".faq-item");

  const setContentHeight = (item, isOpen) => {
    const content = item.querySelector(".faq-content");
    
    if (!content) return;
    
    if (isOpen) {
      // Force the content to be visible temporarily to measure
      content.style.maxHeight = 'none';
      content.style.overflow = 'visible';
      
      // Get the full height including all child content
      const height = content.scrollHeight;
      
      // Add extra padding buffer to ensure all content is visible
      const paddingBuffer = 20; // Extra buffer for margins
      const totalHeight = height + paddingBuffer;
      
      // Set the max-height with buffer
      content.style.maxHeight = totalHeight + "px";
      
      // Recalculate on resize
      const resizeHandler = () => {
        if (item.classList.contains('active')) {
          content.style.maxHeight = 'none';
          const newHeight = content.scrollHeight;
          content.style.maxHeight = (newHeight + paddingBuffer) + "px";
        }
      };
      window.addEventListener("resize", resizeHandler);
      item.resizeHandler = resizeHandler;
    } else {
      content.style.maxHeight = "0";
      content.style.overflow = 'hidden';
      // Remove resize listener
      if (item.resizeHandler) {
        window.removeEventListener("resize", item.resizeHandler);
      }
    }
  };

  // Initial Processing
  faqItems.forEach((item) => {
    if (item.classList.contains('initial-active')) {
      item.classList.add('active');
      const content = item.querySelector(".faq-content");
      content.style.maxHeight = 'none';
      const height = content.scrollHeight;
      content.style.maxHeight = height + 'px';
    }
  });

  // Event Listener setup - Allow multiple FAQs to be open
  faqItems.forEach((item) => {
    const toggle = item.querySelector(".faq-toggle");

    if (toggle) {
      toggle.addEventListener("click", () => {
        const isExpanded = item.classList.contains("active");

        if (isExpanded) {
          // Close this FAQ
          item.classList.remove("active");
          item.classList.remove("initial-active");
          setContentHeight(item, false);
        } else {
          // Open this FAQ (don't close others)
          item.classList.add("active");
          item.classList.remove("initial-active");
          setContentHeight(item, true);
        }
      });
    }
  });
}

// --------- SURVEY FUNCTIONALITY ---------
let currentStep = 0;
let acknowledgedPrivacy = false;
const steps = [
  { id: 'form-1', progress: 25 },
  { id: 'form-2', progress: 50 },
  { id: 'form-3', progress: 75 },
  { id: 'form-4', progress: 90 }
];

// Expose SQD questions on the window so other modules (survey-submission.js) can update them
window.sqdQuestions = window.sqdQuestions || [
  "SQD0. I am satisfied with the service that I availed.",
  "SQD1. I spent a reasonable amount of time for my transaction.",
  "SQD2. The office followed the transaction's requirements and steps based on the information provided.",
  "SQD3. The steps (including payment) I needed to do for my transaction were easy and simple.",
  "SQD4. I easily found information about my transaction from the office or its website.",
  "SQD5. I paid a reasonable amount of fees for my transaction. (If service was free, mark the 'N/A' option)",
  "SQD6. I feel the office was fair to everyone, or 'walang palakasan', during my transaction.",
  "SQD7. I was treated courteously by the staff, and (if asked for help) the staff was helpful.",
  "SQD8. I got what I needed from the government office, or if denied, the reason was explained to me clearly."
];

// Load questions from Firestore if Firebase is available
(async function loadQuestionsFromFirestore() {
  try {
    // Check if Firebase is initialized
    if (typeof firebase !== 'undefined' && firebase.firestore) {
      const db = firebase.firestore();
      const questionsRef = db.collection('survey_questions');
      
      // Set up real-time listener for SQD questions
      questionsRef
        .where('type', '==', 'SQD')
        .orderBy('order', 'asc')
        .onSnapshot((snapshot) => {
          const updatedQuestions = [];
          snapshot.forEach((doc) => {
            updatedQuestions.push(`${doc.data().code}. ${doc.data().text}`);
          });
          if (updatedQuestions.length > 0) {
            window.sqdQuestions = updatedQuestions;
            console.log('SQD Questions updated from Firestore:', window.sqdQuestions.length);
            // Optionally re-render if survey page is active
            if (typeof renderSQDQuestions === 'function' && document.getElementById('sqd-questions-container')) {
              renderSQDQuestions();
            }
          }
        });
    }
  } catch (error) {
    console.warn('Could not load questions from Firestore:', error);
  }
})();

const moods = [
  { label: 'Strongly Disagree', value: '1', icon: '<img src="User View/Survey/strongly disagree.png" alt="Strongly Disagree" class="w-12 h-10.5">' },
  { label: 'Disagree', value: '2', icon: '<img src="User View/Survey/disagree.png" alt="Strongly Disagree" class="w-12 h-10.5">' },
  { label: 'Neither Agree nor Disagree', value: '3', icon: '<img src="User View/Survey/neutral.png" alt="Strongly Disagree" class="w-12 h-10.5">' },
  { label: 'Agree', value: '4', icon: '<img src="User View/Survey/agree.png" alt="Strongly Disagree" class="w-12 h-10.5">' },
  { label: 'Strongly Agree', value: '5', icon: '<img src="User View/Survey/strongly agree.png" alt="Strongly Disagree" class="w-12 h-10.5">' },
  { label: 'Not Applicable', value: 'NA', icon: '<img src="User View/Survey/not applicable.png" alt="Strongly Disagree" class="w-12 h-10.5">' }
];

function renderSQDQuestions() {
  const sqdContainer = document.getElementById('sqd-questions-container');
  if (!sqdContainer) return;
  // Inject small style block to ensure consistent sizing and centered layout
  if (!document.getElementById('mood-styles')) {
    const style = document.createElement('style');
    style.id = 'mood-styles';
    style.textContent = `
      .mood-grid { display: flex; justify-content: space-between; gap: 0.5rem; }
      .mood-option { display: flex; flex-direction: column; align-items: center; width: 84px; }
      .mood-icon { display: flex; align-items: center; justify-content: center; height: 56px; width: 56px; border-radius: 9999px; cursor: pointer; transition: all 0.3s ease; }
      .mood-icon img { max-width: 48px; max-height: 48px; display: block; }
      .mood-label { min-height: 40px; text-align: center; font-size: 12px; margin-top: 6px; line-height: 1.1; white-space: normal; }
      .mood-icon.selected { outline: 2px solid #2563eb; box-shadow: 0 0 15px rgba(37,99,235,0.6), 0 4px 10px rgba(37,99,235,0.3); background-color: rgba(37,99,235,0.1); }
      .form-section.error { border: 2px solid #ef4444; }
    `;
    document.head.appendChild(style);
  }

  let html = '';
  (window.sqdQuestions || []).forEach((qText, index) => {
     const qId = `sqd${index}`;
    html += `
      <div class="form-section p-4 rounded-lg" id="${qId}-container">
        <p class="text-sm font-semibold mb-3">${qText} <span class="text-red-500">*</span></p>
        <div class="mood-grid">
    `;
    moods.forEach(mood => {
      // Use a fixed-size option block so text under icons doesn't change heights
      const safeLabel = mood.label.replace(/</g, '&lt;').replace(/>/g, '&gt;');
      html += `
        <div class="mood-option">
          <input type="radio" name="${qId}" value="${mood.value}" id="${qId}-${mood.value}" required class="hidden" data-label="${safeLabel}">
          <label for="${qId}-${mood.value}" class="mood-icon" onclick="selectMoodIcon(this, '${qId}')" title="${safeLabel}">
            ${mood.icon}
          </label>
          <span class="mood-label">${safeLabel}</span>
        </div>
      `;
    });
    html += `
        </div>
        <p id="${qId}-error" class="text-red-500 text-xs mt-3 hidden"></p>
      </div>
    `;
  });
  sqdContainer.innerHTML = html;

  window.selectMoodIcon = (labelElement, qName) => {
    const container = labelElement.closest('.form-section');
    container.querySelectorAll('.mood-icon').forEach(icon => {
      icon.classList.remove('selected');
    });
    labelElement.classList.add('selected');
    labelElement.previousElementSibling.checked = true;
    
    // Remove error styling when a valid selection is made
    container.classList.remove('error');
    const errorElement = document.getElementById(`${qName}-error`);
    if (errorElement) {
      errorElement.classList.add('hidden');
    }
    
    saveFormState(3);
  };
}

function handleCC1Change(selectedValue) {
  const form2 = document.getElementById('form-2');
  if (!form2) return;

  const cc2Container = form2.querySelector('.space-y-6 > .form-section:nth-child(2)');
  const cc3Container = form2.querySelector('.space-y-6 > .form-section:nth-child(3)');

  const cc2Inputs = form2.querySelectorAll('input[name="cc2"]');
  const cc3Inputs = form2.querySelectorAll('input[name="cc3"]');

  const cc2NA = form2.querySelector('input[name="cc2"][value="Not Applicable"]');
  const cc3NA = form2.querySelector('input[name="cc3"][value="Not Applicable"]');

  const shouldDisable = selectedValue === '4';

  if (shouldDisable) {
    cc2Container.classList.add('disabled-cc');
    cc3Container.classList.add('disabled-cc');

    cc2Inputs.forEach(input => {
      input.disabled = (input.value !== 'Not Applicable');
      if (input.value === 'Not Applicable') input.checked = true;
    });
    cc3Inputs.forEach(input => {
      input.disabled = (input.value !== 'Not Applicable');
      if (input.value === 'Not Applicable') input.checked = true;
    });
  } else {
    cc2Container.classList.remove('disabled-cc');
    cc3Container.classList.remove('disabled-cc');

    cc2Inputs.forEach(input => {
      input.disabled = false;
    });
    cc3Inputs.forEach(input => {
      input.disabled = false;
    });

    if (cc2NA && cc2NA.checked) cc2NA.checked = false;
    if (cc3NA && cc3NA.checked) cc3NA.checked = false;
  }
  
  saveFormState(2);
}

function showModal(id) {
  const modal = document.getElementById(id);
  if (modal) {
    modal.style.display = 'flex';
    document.body.classList.add('modal-open');
  }
}

function closeModal(id) {
  const modal = document.getElementById(id);
  if (modal) {
    modal.style.display = 'none';
    document.body.classList.remove('modal-open');
  }
}

function updateProgress(step) {
  const progress = steps[step - 1].progress;
  const progressBar = document.getElementById('progress-bar');
  const progressText = document.getElementById('progress-text');
  if (progressBar) progressBar.style.width = `${progress}%`;
  if (progressText) progressText.textContent = `${progress}% Complete`;
}

function showForm(step) {
  document.querySelectorAll('.survey-form').forEach(form => form.classList.add('hidden'));
  
  if (step > 0) {
    const form = document.getElementById(`form-${step}`);
    if (form) form.classList.remove('hidden');
    
    const header = document.getElementById('survey-header');
    if (header) header.classList.remove('hidden');

    const backBtn = document.getElementById('back-button');
    if (backBtn) backBtn.classList.toggle('hidden', step === 1);

    const nextBtn = document.getElementById('next-button');
    if (nextBtn) nextBtn.classList.add('hidden');
  }
}

function goToStep(step) {
  if (step < 1 || step > 4) return;
  
  currentStep = step;
  updateProgress(currentStep);
  showForm(currentStep);
  
  if (step === 3) {
    renderSQDQuestions();
  }
  
  loadFormState(currentStep);

  if (step === 1 && !acknowledgedPrivacy) {
    showModal('data-privacy-modal');
  }

  const nextBtn = document.getElementById('next-button');
  if (nextBtn) {
    if (currentStep === 2 || currentStep === 3) {
      nextBtn.classList.remove('hidden');
      nextBtn.onclick = (e) => {
        e.preventDefault();
        validateForm(currentStep);
      };
    } else {
      nextBtn.classList.add('hidden');
    }
  }
}

function goToHome() {
  clearAllSurveyData();
  window.location.href = "index.html";
}

function validateForm(step) {
  const form = document.getElementById(`form-${step}`);
  if (!form) return;

  const requiredFields = form.querySelectorAll('[required]');
  let isValid = true;
  
  let ageError = document.getElementById('age-error');
  if (ageError) ageError.classList.add('hidden');

  if (step === 1) {
    if (!acknowledgedPrivacy) {
      showModal('data-privacy-modal');
      return;
    }

    const ageInput = document.getElementById('age-input');
    if (ageInput) {
      const ageValue = ageInput.value.trim();
      const ageNumber = Number(ageValue);

      if (ageValue !== '' && (!Number.isInteger(ageNumber) || ageNumber < 1)) {
        if (ageError) {
          ageError.textContent = "Age must be a whole number (e.g., 25) and a positive number.";
          ageError.classList.remove('hidden');
        }
        return;
      }
    }
  }
  
  if (step === 4) {
    let emailInput = document.getElementById('email-input');
    let emailError = document.getElementById('email-error');
    if (emailError) emailError.classList.add('hidden');
    
    if (emailInput) {
      const emailValue = emailInput.value.trim();
      const requiredDomain = "@gmail.com";
      
      if (emailValue !== '' && !emailValue.toLowerCase().endsWith(requiredDomain)) {
        if (emailError) {
          emailError.textContent = `Please enter a valid email address ending with ${requiredDomain}.`;
          emailError.classList.remove('hidden');
        }
        isValid = false;
      }
    }
  }

  if (step < 4) {
    requiredFields.forEach(field => {
      if (field.type === 'radio') {
        const name = field.name;
        const radios = form.querySelectorAll(`[name="${name}"]`);
        let isChecked = Array.from(radios).some(r => r.checked);
        if (!isChecked) {
          isValid = false;
        }
      } else if (field.tagName === 'SELECT' && !field.value) {
        isValid = false;
      } else if (!field.value.trim()) {
        isValid = false;
      }
    });
  }

  if (isValid) {
    saveFormState(step);
    
    if (step === 4) {
      showModal('submit-confirm-modal');
    } else {
      goToStep(step + 1);
    }
  } else if (step < 4) {
    alert('Please fill out all required fields marked with an asterisk (*).');
  }
}

function proceedToSurvey() {
  if (acknowledgedPrivacy) {
    closeModal('data-privacy-modal');
    goToStep(1);
  }
}

function completeSurvey() {
  closeModal('submit-confirm-modal');
  showModal('thank-you-modal');
  setTimeout(goToHome, 3000);
}

function clearAllSurveyData() {
  for (let i = 1; i <= 4; i++) {
    localStorage.removeItem(`surveyFormState${i}`);
  }
  document.querySelectorAll('form').forEach(form => form.reset());
  acknowledgedPrivacy = false;
  document.querySelectorAll('.mood-icon.selected').forEach(icon => icon.classList.remove('selected'));
}

function saveFormState(step) {
  const form = document.getElementById(`form-${step}`);
  if (!form) return;

  const formData = new FormData(form);
  const state = {};
  for (let [name, value] of formData.entries()) {
    state[name] = value;
  }
  localStorage.setItem(`surveyFormState${step}`, JSON.stringify(state));
}

function loadFormState(step) {
  const form = document.getElementById(`form-${step}`);
  if (!form) return;

  const state = JSON.parse(localStorage.getItem(`surveyFormState${step}`)) || {};

  form.querySelectorAll('input[type="radio"], input[type="checkbox"]').forEach(input => input.checked = false);
  
  if (step === 3) {
    form.querySelectorAll('.mood-icon').forEach(icon => icon.classList.remove('selected'));
  }

  for (const name in state) {
    if (!name.startsWith('SQD') && name !== 'cc1' && name !== 'cc2' && name !== 'cc3' && name !== 'sex') {
      const field = form.querySelector(`[name="${name}"]`);
      if (field) field.value = state[name];
      continue;
    }

    const input = form.querySelector(`input[name="${name}"][value="${state[name]}"]`);
    
    if (input) {
      input.checked = true;
      
      if (step === 3 && name.startsWith('SQD')) {
        const label = form.querySelector(`label[for="${input.id}"]`);
        if (label) {
          label.classList.add('selected');
        }
      }
    }
  }
  
  if (step === 2) {
    const cc1Value = form.querySelector('input[name="cc1"]:checked')?.value;
    handleCC1Change(cc1Value || null);
  }
}

// --------- INITIALIZATION ---------
document.addEventListener('DOMContentLoaded', () => {
  // Initialize FAQ accordion if elements exist
  if (document.querySelectorAll(".faq-item").length > 0) {
    initFaqAccordion();
  }

  // Survey-specific initialization
  if (document.getElementById('form-1')) {
    document.querySelectorAll('.cc1-input').forEach(input => {
      input.addEventListener('change', (e) => handleCC1Change(e.target.value));
    });
    showModal('data-privacy-modal');
  }

  // Survey event listeners
  const backButton = document.getElementById('back-button');
  if (backButton) {
    backButton.addEventListener('click', (e) => {
      e.preventDefault();
      if (currentStep === 1) {
        goToHome();
      } else if (currentStep > 1) {
        goToStep(currentStep - 1);
      }
    });
  }

  const form1HomeLink = document.getElementById('form1-home-link');
  if (form1HomeLink) {
    form1HomeLink.addEventListener('click', (e) => {
      e.preventDefault();
      goToHome();
    });
  }

  const privacyCheckbox = document.getElementById('privacy-checkbox');
  if (privacyCheckbox) {
    privacyCheckbox.addEventListener('change', (e) => {
      const proceedBtn = document.getElementById('proceed-btn');
      acknowledgedPrivacy = e.target.checked;
      if (proceedBtn) {
        proceedBtn.disabled = !acknowledgedPrivacy;
        proceedBtn.classList.toggle('opacity-50', !acknowledgedPrivacy);
        proceedBtn.classList.toggle('cursor-not-allowed', !acknowledgedPrivacy);
        if (acknowledgedPrivacy) {
          proceedBtn.classList.add('hover:opacity-90');
          proceedBtn.classList.remove('hover:bg-blue-800');
        } else {
          proceedBtn.classList.remove('hover:opacity-90');
        }
      }
    });
  }

  // --------- BURGER MENU FUNCTIONALITY ---------
  const burgerBtn = document.getElementById('burgerBtn');
  const mobileNav = document.getElementById('mobileNav');

  if (burgerBtn && mobileNav) {
    burgerBtn.addEventListener('click', () => {
      burgerBtn.classList.toggle('active');
      mobileNav.classList.toggle('active');
    });

    // Close menu when clicking on a link and add active state with sliding underline
    const navLinks = mobileNav.querySelectorAll('a');
    navLinks.forEach(link => {
      // Add active class to current page link
      if (link.href === window.location.href || link.pathname === window.location.pathname) {
        link.classList.add('active');
      }

      link.addEventListener('click', () => {
        // Remove active class from all links
        navLinks.forEach(l => l.classList.remove('active'));
        // Add active class to clicked link
        link.classList.add('active');
        // Close menu
        burgerBtn.classList.remove('active');
        mobileNav.classList.remove('active');
      });
    });

    // Close menu on Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && mobileNav.classList.contains('active')) {
        burgerBtn.classList.remove('active');
        mobileNav.classList.remove('active');
      }
    });

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
      if (mobileNav.classList.contains('active') && 
          !mobileNav.contains(e.target) && 
          !burgerBtn.contains(e.target)) {
        burgerBtn.classList.remove('active');
        mobileNav.classList.remove('active');
      }
    });
  }
});
