
import { renderSurveyForm, attachSurveyListeners } from './components/SurveyForm.js';
import { renderInsightSection, attachInsightListeners } from './components/InsightSection.js';
import { renderAdminDashboard, attachAdminListeners } from './components/AdminDashboard.js';
import { db } from './lib/firebase.js';
import { collection, addDoc, getDocs, serverTimestamp, query, orderBy } from "firebase/firestore";

let state = {
  isSubmitted: false,
  isSubmitting: false,
  isAdminMode: false,
  isAuthModalOpen: false,
  isAuthenticated: false,
  formData: null,
  allResponses: []
};

const root = document.getElementById('root');

export function setState(newState) {
  state = { ...state, ...newState };
  render();
}

function generateSeminarId() {
  const now = new Date();
  const year = String(now.getFullYear()).slice(-2);
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return year + month;
}

async function handleSubmit(data) {
  if (state.isSubmitting) return;
  setState({ isSubmitting: true });
  try {
    const seminarId = generateSeminarId();
    await addDoc(collection(db, "survey_responses"), {
      ...data,
      seminarId: seminarId,
      submittedAt: serverTimestamp()
    });
    setState({ formData: data, isSubmitted: true, isSubmitting: false });
  } catch (error) {
    console.error("Error adding document: ", error);
    alert("데이터를 저장하는 중 오류가 발생했습니다. Firebase 규칙을 확인해주세요.");
    setState({ isSubmitting: false });
  }
}

async function handleAdminAccess() {
  if (state.isAuthenticated) {
    setState({ isAdminMode: !state.isAdminMode });
    return;
  }
  setState({ isAuthModalOpen: true });
}

async function verifyAdminCode(code) {
  if (code === "1007") {
    setState({ isSubmitting: true, isAuthModalOpen: false });
    try {
      const q = query(collection(db, "survey_responses"), orderBy("submittedAt", "desc"));
      const querySnapshot = await getDocs(q);
      const responses = [];
      querySnapshot.forEach((doc) => {
        responses.push({ id: doc.id, ...doc.data() });
      });
      setState({ 
        isAuthenticated: true, 
        isAdminMode: true, 
        allResponses: responses,
        isSubmitting: false 
      });
    } catch (error) {
      console.error("Error fetching documents: ", error);
      const msg = error.code === 'permission-denied' 
        ? "Firebase 보안 규칙에서 'read' 권한이 거부되었습니다. 규칙을 'allow read: if true;'로 수정해주세요."
        : "데이터를 불러오는 중 오류가 발생했습니다.";
      alert(msg);
      setState({ isSubmitting: false });
    }
  } else {
    alert("코드가 일치하지 않습니다.");
  }
}

function resetSurvey() {
  setState({ isSubmitted: false, isSubmitting: false, formData: null, isAdminMode: false, isAuthModalOpen: false });
}

function renderAuthModal() {
  if (!state.isAuthModalOpen) return '';
  return `
    <div id="auth-backdrop" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-modal-in">
      <div class="card-enterprise w-full max-w-sm p-8 shadow-2xl scale-100">
        <div class="text-center mb-6">
          <div class="w-12 h-12 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg class="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
            </svg>
          </div>
          <h3 class="text-xl font-bold text-slate-800">관리자 인증</h3>
          <p class="text-sm text-slate-500 mt-1">접근 코드를 입력하세요.</p>
        </div>
        
        <form id="auth-form" class="space-y-4">
          <input 
            type="password" 
            id="admin-code-input" 
            class="input-enterprise text-center text-2xl tracking-[1em] font-bold"
            placeholder="••••"
            autocomplete="off"
          />
          <div class="flex gap-2">
            <button type="button" id="close-auth-btn" class="flex-1 py-3 text-sm font-bold text-slate-500 hover:bg-slate-50 rounded-xl transition-colors">취소</button>
            <button type="submit" class="flex-1 py-3 text-sm font-bold bg-indigo-600 text-white hover:bg-indigo-700 rounded-xl shadow-lg shadow-indigo-200 transition-all">확인</button>
          </div>
        </form>
      </div>
    </div>
  `;
}

function render() {
  let content = "";
  if (state.isAdminMode) {
    content = renderAdminDashboard(state.allResponses);
  } else if (state.isSubmitted) {
    content = renderInsightSection();
  } else {
    content = `<div class="card-enterprise animate-modal-in overflow-hidden">${renderSurveyForm(state.isSubmitting)}</div>`;
  }

  root.innerHTML = `
    <div class="min-h-screen py-16 px-4 sm:px-6 lg:px-8 relative">
      <button id="admin-btn" class="absolute top-6 right-6 text-xs font-bold text-slate-400 hover:text-indigo-600 transition-colors uppercase tracking-widest flex items-center gap-2">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>
        ${state.isAdminMode ? 'Exit Admin' : 'Admin'}
      </button>

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
            ${state.isAdminMode ? '관리자 대시보드' : '공개 세미나 만족도 설문 조사'}
          </p>
        </header>

        <main id="main-content">
          ${content}
        </main>

        <footer class="mt-16 text-center text-slate-400 text-xs font-medium tracking-wide uppercase">
          &copy; 2024 PRESALES LAB. DESIGNED FOR EXCELLENCE.
        </footer>
      </div>
    </div>
    ${renderAuthModal()}
  `;

  document.getElementById('admin-btn').onclick = handleAdminAccess;

  // Modal event listeners
  if (state.isAuthModalOpen) {
    const authForm = document.getElementById('auth-form');
    const closeBtn = document.getElementById('close-auth-btn');
    const backdrop = document.getElementById('auth-backdrop');
    const input = document.getElementById('admin-code-input');

    // Use a small timeout to ensure DOM is ready before focusing
    if (input) {
      setTimeout(() => input.focus(), 50);
    }

    authForm.onsubmit = (e) => {
      e.preventDefault();
      verifyAdminCode(input.value);
    };

    closeBtn.onclick = () => setState({ isAuthModalOpen: false });
    backdrop.onclick = (e) => {
      if (e.target === backdrop) setState({ isAuthModalOpen: false });
    };
  }

  if (state.isAdminMode) {
    attachAdminListeners();
  } else if (state.isSubmitted) {
    attachInsightListeners(resetSurvey);
  } else {
    attachSurveyListeners(handleSubmit);
  }
}

export function initApp() {
  render();
}
