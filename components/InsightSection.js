
export function renderInsightSection() {
  return `
    <div class="card-enterprise animate-modal-in p-12 text-center">
      <div class="w-20 h-20 bg-emerald-50 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-inner shadow-emerald-100/50">
        <svg class="w-10 h-10 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
        </svg>
      </div>
      
      <h2 style="font-family: 'Outfit', sans-serif;" class="text-2xl font-bold text-[#0F172A] mb-4">
        설문에 참여해 주셔서 감사합니다
      </h2>
      <p class="text-slate-500 text-sm font-medium mb-12 leading-relaxed max-w-sm mx-auto">
        제공해주신 소중한 의견은 PreSales Lab의 세미나 품질을 개선하는 데 큰 도움이 됩니다.
      </p>

      <div class="pt-6 border-t border-slate-100">
        <button
          id="reset-btn"
          class="px-10 py-3 bg-white border border-slate-200 rounded-xl text-slate-600 text-xs font-bold uppercase tracking-widest hover:bg-slate-50 hover:border-slate-300 transition-all active:scale-95 shadow-sm"
        >
          새로운 응답 작성하기
        </button>
      </div>
    </div>
  `;
}

export function attachInsightListeners(onReset) {
  const btn = document.getElementById('reset-btn');
  if (btn) {
    btn.onclick = onReset;
  }
}
