
export function renderAdminDashboard(responses) {
  if (!responses || responses.length === 0) {
    return `<div class="card-enterprise p-12 text-center text-slate-500 font-medium">데이터가 없습니다.</div>`;
  }

  // Grouping data by seminarId
  const groups = responses.reduce((acc, res) => {
    const id = res.seminarId || 'Unknown';
    if (!acc[id]) acc[id] = [];
    acc[id].push(res);
    return acc;
  }, {});

  const sortedGroupIds = Object.keys(groups).sort((a, b) => b.localeCompare(a));

  return `
    <div class="space-y-4">
      ${sortedGroupIds.map(id => {
        const groupResponses = groups[id];
        const avgRating = (groupResponses.reduce((sum, r) => sum + r.expectations, 0) / groupResponses.length).toFixed(1);
        
        // Helpful parts stats
        const partsCount = {};
        groupResponses.forEach(r => {
          (r.helpfulParts || []).forEach(p => {
            partsCount[p] = (partsCount[p] || 0) + 1;
          });
        });
        
        // Recommend stats
        const recommendCount = { Yes: 0, No: 0 };
        groupResponses.forEach(r => {
          if (r.recommend) recommendCount[r.recommend]++;
        });
        const yesPercent = Math.round((recommendCount.Yes / groupResponses.length) * 100);

        return `
          <div class="card-enterprise overflow-hidden transition-all duration-300">
            <button class="accordion-header w-full p-6 flex justify-between items-center hover:bg-slate-50 transition-colors" data-id="${id}">
              <div class="flex items-center gap-4">
                <span class="px-3 py-1 bg-indigo-100 text-indigo-700 text-xs font-bold rounded-full uppercase tracking-tighter">20${id.slice(0,2)}년 ${id.slice(2)}월</span>
                <h3 class="font-bold text-slate-800 text-lg">세미나 분석</h3>
              </div>
              <div class="flex items-center gap-6">
                <div class="flex items-center gap-1">
                  <span class="text-amber-400">★</span>
                  <span class="font-bold text-slate-700">${avgRating}</span>
                  <span class="text-slate-400 text-sm font-normal">(${groupResponses.length}명)</span>
                </div>
                <svg class="w-5 h-5 text-slate-400 transform transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </button>
            
            <div id="details-${id}" class="hidden border-t border-slate-100 p-8 space-y-10 bg-white">
              <!-- Q2. Helpful Parts (Bar Chart) -->
              <section>
                <h4 class="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6">가장 도움이 된 부분 (%)</h4>
                <div class="space-y-4">
                  ${Object.entries(partsCount).sort((a,b) => b[1] - a[1]).map(([label, count]) => {
                    const percent = Math.round((count / groupResponses.length) * 100);
                    return `
                      <div class="space-y-1.5">
                        <div class="flex justify-between text-xs font-bold text-slate-600">
                          <span>${label}</span>
                          <span>${percent}%</span>
                        </div>
                        <div class="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div class="h-full bg-indigo-500 rounded-full" style="width: ${percent}%"></div>
                        </div>
                      </div>
                    `;
                  }).join('')}
                </div>
              </section>

              <!-- Q3. Recommendation (Pie/Circle Chart) -->
              <section class="grid grid-cols-1 md:grid-cols-2 gap-8 items-center pt-6 border-t border-slate-50">
                <div>
                  <h4 class="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">추천 의사 (Yes/No)</h4>
                  <div class="flex items-center gap-4">
                    <div class="w-24 h-24 rounded-full border-8 border-slate-50 relative flex items-center justify-center" 
                         style="background: conic-gradient(#10b981 ${yesPercent}%, #f43f5e 0)">
                      <div class="absolute inset-0 m-2 bg-white rounded-full flex items-center justify-center">
                        <span class="text-sm font-black text-slate-700">${yesPercent}%</span>
                      </div>
                    </div>
                    <div class="space-y-1">
                      <div class="flex items-center gap-2 text-xs font-bold text-slate-600">
                        <div class="w-2 h-2 rounded-full bg-emerald-500"></div>
                        <span>추천 (${recommendCount.Yes})</span>
                      </div>
                      <div class="flex items-center gap-2 text-xs font-bold text-slate-600">
                        <div class="w-2 h-2 rounded-full bg-rose-500"></div>
                        <span>비추천 (${recommendCount.No})</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 class="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">평균 기대 부합도</h4>
                  <div class="text-4xl font-black text-indigo-600">${avgRating} <span class="text-sm text-slate-300 font-bold uppercase tracking-widest">/ 5.0</span></div>
                </div>
              </section>

              <!-- Q4. Improvements (Text List) -->
              <section class="pt-6 border-t border-slate-50">
                <h4 class="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">개선 및 추가 요청 사항</h4>
                <div class="space-y-2">
                  ${groupResponses.map(r => r.improvements ? `
                    <div class="p-3 bg-slate-50 rounded-lg text-sm text-slate-600 leading-relaxed border-l-4 border-slate-200">
                      ${r.improvements.replace(/\n/g, '<br>')}
                    </div>
                  ` : '').join('') || '<p class="text-xs text-slate-400 italic">의견 없음</p>'}
                </div>
              </section>
            </div>
          </div>
        `;
      }).join('')}
    </div>
  `;
}

export function attachAdminListeners() {
  document.querySelectorAll('.accordion-header').forEach(btn => {
    btn.onclick = () => {
      const id = btn.dataset.id;
      const details = document.getElementById(`details-${id}`);
      const arrow = btn.querySelector('svg');
      
      if (details.classList.contains('hidden')) {
        // Close others? (Optional)
        details.classList.remove('hidden');
        arrow.classList.add('rotate-180');
      } else {
        details.classList.add('hidden');
        arrow.classList.remove('rotate-180');
      }
    };
  });
}
