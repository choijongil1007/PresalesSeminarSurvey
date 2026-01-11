
let expectations = 3; // Default to neutral/good
let isExpectationSet = false;
let helpfulParts = [];
let recommend = null;

const options = [
  '프리세일즈 개요',
  'BSA Framework',
  '고객 여정 실습',
  '의견 교환 및 네트워킹'
];

export function renderSurveyForm(isSubmitting = false) {
  const isSubmitDisabled = !isExpectationSet || recommend === null || isSubmitting;

  return `
    <form id="survey-form" class="p-10 space-y-12">
      <!-- Q1 -->
      <section>
        <div class="flex justify-between items-end mb-6">
          <label class="block text-sm font-bold text-[#475569] uppercase tracking-wider">
            01. 세미나가 기대에 부합했나요? <span class="text-indigo-500">*</span>
          </label>
          <span id="expectations-value" class="text-lg font-black text-indigo-600 font-mono">
            ${isExpectationSet ? expectations : '-'}
          </span>
        </div>
        
        <div class="relative px-2">
          <!-- Discrete dots background -->
          <div class="absolute top-1/2 left-2 right-2 -translate-y-1/2 flex justify-between pointer-events-none px-[2px]">
            ${[1, 2, 3, 4, 5].map(i => `
              <div class="w-2 h-2 rounded-full ${expectations >= i && isExpectationSet ? 'bg-indigo-300' : 'bg-slate-200'} transition-colors"></div>
            `).join('')}
          </div>
          
          <input 
            type="range" 
            id="expectations-slider" 
            min="1" 
            max="5" 
            step="1" 
            value="${expectations}" 
            ${isSubmitting ? 'disabled' : ''}
            class="slider-enterprise relative z-20"
          />
        </div>

        <!-- Numeric labels underneath the slider -->
        <div class="flex justify-between px-2 -mt-1 mb-4 pointer-events-none">
          ${[1, 2, 3, 4, 5].map(i => `
            <span class="text-[11px] font-bold transition-all duration-200 w-4 text-center
              ${expectations === i && isExpectationSet ? 'text-indigo-600 scale-125' : 'text-slate-300'}">
              ${i}
            </span>
          `).join('')}
        </div>

        <div class="flex justify-between mt-2 px-1 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
          <span>전혀 그렇지 않다.</span>
          <span>매우 그렇다.</span>
        </div>
      </section>

      <!-- Q2 -->
      <section>
        <label class="block text-sm font-bold text-[#475569] uppercase tracking-wider mb-6">
          02. 가장 도움이 된 부분은? <span class="text-slate-400 text-xs font-normal capitalize">(복수 선택)</span>
        </label>
        <div class="grid grid-cols-1 gap-3">
          ${options.map((option) => {
            const isSelected = helpfulParts.includes(option);
            return `
            <button
              type="button"
              data-option="${option}"
              ${isSubmitting ? 'disabled' : ''}
              class="option-btn p-4 rounded-xl border transition-all flex items-center justify-between group
                ${isSelected
                  ? 'bg-indigo-50 border-indigo-200 text-indigo-700'
                  : 'border-slate-100 bg-slate-50/50 hover:bg-white hover:border-slate-200 text-slate-600'}
                ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}"
            >
              <span class="font-semibold text-sm">${option}</span>
              <div class="w-5 h-5 rounded-full flex items-center justify-center border transition-colors
                ${isSelected ? 'bg-indigo-600 border-indigo-600' : 'border-slate-300 group-hover:border-slate-400'}">
                ${isSelected ? `
                  <svg class="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
                  </svg>
                ` : ''}
              </div>
            </button>
            `;
          }).join('')}
        </div>
      </section>

      <!-- Q3 -->
      <section>
        <label class="block text-sm font-bold text-[#475569] uppercase tracking-wider mb-6">
          03. 회사/동료에게 추천할 의사가 있나요? <span class="text-indigo-500">*</span>
        </label>
        <div class="flex p-1 bg-slate-100 rounded-xl">
          ${['Yes', 'No'].map((choice) => `
            <button
              type="button"
              data-recommend="${choice}"
              ${isSubmitting ? 'disabled' : ''}
              class="recommend-btn flex-1 py-3 px-6 rounded-lg font-bold text-sm transition-all
                ${recommend === choice
                  ? 'bg-white text-[#0F172A] shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'}
                ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}"
            >
              ${choice === 'Yes' ? '네' : '아니요'}
            </button>
          `).join('')}
        </div>
      </section>

      <!-- Q4 -->
      <section>
        <label class="block text-sm font-bold text-[#475569] uppercase tracking-wider mb-4">
          04. 앞으로 추가하거나 개선할 점은?
        </label>
        <textarea
          id="improvements"
          ${isSubmitting ? 'disabled' : ''}
          placeholder="Share your feedback for future improvements..."
          class="input-enterprise h-32 resize-none bg-slate-50/50 ${isSubmitting ? 'opacity-50' : ''}"
        ></textarea>
      </section>

      <div class="pt-4">
        <button
          id="submit-btn"
          type="submit"
          ${isSubmitDisabled ? 'disabled' : ''}
          class="w-full py-4 rounded-xl font-bold text-sm uppercase tracking-widest transition-all shadow-xl
            ${!isSubmitDisabled
              ? 'bg-[#4F46E5] text-white hover:bg-indigo-700 active:scale-[0.98]' 
              : 'bg-slate-200 text-slate-400 cursor-not-allowed'}"
        >
          ${isSubmitting ? '제출 중...' : '완료'}
        </button>
      </div>
    </form>
  `;
}

export function attachSurveyListeners(onSubmit) {
  const form = document.getElementById('survey-form');
  if (!form) return;

  // Slider change
  const slider = document.getElementById('expectations-slider');
  const valueDisplay = document.getElementById('expectations-value');
  
  if (slider) {
    slider.oninput = (e) => {
      expectations = parseInt(e.target.value);
      isExpectationSet = true;
      if (valueDisplay) valueDisplay.textContent = expectations;
      
      // Update view to reflect number scaling/coloring below slider
      updateView();
      updateSubmitButtonState();
    };
  }

  form.querySelectorAll('.option-btn').forEach(btn => {
    btn.onclick = () => {
      const option = btn.dataset.option;
      if (helpfulParts.includes(option)) {
        helpfulParts = helpfulParts.filter(o => o !== option);
      } else {
        helpfulParts.push(option);
      }
      updateView();
    };
  });

  form.querySelectorAll('.recommend-btn').forEach(btn => {
    btn.onclick = () => {
      recommend = btn.dataset.recommend;
      updateView();
    };
  });

  form.onsubmit = async (e) => {
    e.preventDefault();
    const improvements = document.getElementById('improvements').value;
    await onSubmit({ expectations, helpfulParts, recommend, improvements });
    
    // Reset local state if successful (handled in App.js resetSurvey if needed, 
    // but we reset variables here for next session)
    expectations = 3;
    isExpectationSet = false;
    helpfulParts = [];
    recommend = null;
  };

  function updateSubmitButtonState() {
    const submitBtn = document.getElementById('submit-btn');
    const isSubmitDisabled = !isExpectationSet || recommend === null;
    if (submitBtn) {
      submitBtn.disabled = isSubmitDisabled;
      if (!isSubmitDisabled) {
        submitBtn.className = "w-full py-4 rounded-xl font-bold text-sm uppercase tracking-widest transition-all shadow-xl bg-[#4F46E5] text-white hover:bg-indigo-700 active:scale-[0.98]";
      } else {
        submitBtn.className = "w-full py-4 rounded-xl font-bold text-sm uppercase tracking-widest transition-all shadow-xl bg-slate-200 text-slate-400 cursor-not-allowed";
      }
    }
  }

  function updateView() {
    const mainContent = document.getElementById('main-content');
    const scrollPos = window.scrollY;
    const improvementsVal = document.getElementById('improvements') ? document.getElementById('improvements').value : '';
    
    // We re-render, App.js will handle the state passed into renderSurveyForm
    mainContent.innerHTML = `<div class="card-enterprise animate-modal-in overflow-hidden">${renderSurveyForm(false)}</div>`;
    
    if (document.getElementById('improvements')) {
      document.getElementById('improvements').value = improvementsVal;
    }
    attachSurveyListeners(onSubmit);
    window.scrollTo(0, scrollPos);
  }
}
