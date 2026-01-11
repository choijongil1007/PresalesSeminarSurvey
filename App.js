
import { renderSurveyForm, attachSurveyListeners } from './components/SurveyForm.js';
import { renderInsightSection, attachInsightListeners } from './components/InsightSection.js';
import { db } from './lib/firebase.js';
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

let state = {
  isSubmitted: false,
  isSubmitting: false,
  formData: null
};

const root = document.getElementById('root');

export function setState(newState) {
  state = { ...state, ...newState };
  render();
}

async function handleSubmit(data) {
  if (state.isSubmitting) return;

  setState({ isSubmitting: true });

  try {
    // Save data to Firebase Firestore
    await addDoc(collection(db, "survey_responses"), {
      ...data,
      submittedAt: serverTimestamp()
    });

    setState({
      formData: data,
      isSubmitted: true,
      isSubmitting: false
    });
  } catch (error) {
    console.error("Error adding document: ", error);
    alert("데이터를 저장하는 중 오류가 발생했습니다. 다시 시도해 주세요.");
    setState({ isSubmitting: false });
  }
}

function resetSurvey() {
  setState({
    isSubmitted: false,
    isSubmitting: false,
    formData: null
  });
}

function render() {
  const content = state.isSubmitted 
    ? renderInsightSection()
    : `<div class="card-enterprise animate-modal-in overflow-hidden">${renderSurveyForm(state.isSubmitting)}</div>`;

  root.innerHTML = `
    <div class="min-h-screen py-16 px-4 sm:px-6 lg:px-8">
      <div class="max-w-2xl mx-auto">
        <header class="text-center mb-12">
          <div class="inline-flex items-center justify-center p-3 bg-[#4F46E5] rounded-xl mb-6 shadow-lg shadow-indigo-200">
            <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
            </svg>
          </div>
          <h1 style="font-family: 'Outfit', sans-serif;" class="text-4xl font-bold text-[#0F172A] tracking-tight mb-3">
            PreSales Lab
          </h1>
          <p class="text-slate-500 font-medium">
            공개 세미나 만족도 설문 조사
          </p>
        </header>

        <main id="main-content">
          ${content}
        </main>

        <footer class="mt-16 text-center text-slate-400 text-xs font-medium tracking-wide">
          &copy; 2024 PRESALES LAB. DESIGNED FOR EXCELLENCE.
        </footer>
      </div>
    </div>
  `;

  if (state.isSubmitted) {
    attachInsightListeners(resetSurvey);
  } else {
    attachSurveyListeners(handleSubmit);
  }
}

export function initApp() {
  render();
}
