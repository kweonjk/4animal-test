let questions, SCORE_MAP, RESULTS, CATEGORY_LABEL, SESSION_KEY;
let current = 0, answers = [], userName = '', currentTop = '', currentScores = {};
let pendingScores = null, adTimer = null;
let uploadedImageBase64 = null;
const AD_CONFIG = {
  image:   'https://thumbnail.coupangcdn.com/thumbnails/remote/492x492ex/image/vendor_inventory/9000/bdebac18f2de858ad4eb360b8e195ab0e50d69cee429dfb9d734dda81ffe.jpg',
  link:    'https://link.coupang.com/a/dZh5anXH7Q',
  title:   '지금 인기 상품을 확인해보세요!',
  btnText: '상품 보고 결과 확인하기',
};
const DEFAULT_ADMIN_PW = '4animal';
const EJS_PUBLIC_KEY = 'hKIxH-TLR18w4HQun';
const EJS_SERVICE_ID = 'service_0moj8bs';
const EJS_TEMPLATE_ID = 'template_9buriby';
// 하이브리드 임계값 (1-2위 % 격차)
const HYBRID_THRESHOLD = 15;
// 하이브리드 유형 해석 (6쌍)
const HYBRID = {
  '사-카': '결단력과 유연함을 동시에 갖춘 사람. 빠르게 움직이면서도 상황 변화에 맞춰 길을 바꿀 줄 압니다. 추진과 적응이 함께하는 균형형.',
  '사-양': '단호함과 따뜻함이 공존하는 사람. 결정은 분명하게 내리지만 그 결정이 사람을 다치게 하지 않도록 챙깁니다. 가장 신뢰받는 리더형.',
  '사-부': '실행력과 분석력을 모두 갖춘 전략가. 빠르게 결정하면서도 그 결정의 근거를 단단히 쌓아 올립니다. 가장 정확한 결과를 만드는 조합.',
  '카-양': '사교성과 진심이 함께하는 사람. 누구와도 잘 어울리지만 그 관계 하나하나에 마음을 깊이 둡니다. 사람을 연결하는 따뜻한 다리형.',
  '카-부': '창의성과 분석력을 겸비한 사람. 새로운 아이디어를 자유롭게 떠올리고, 그것을 차분히 검증해 발전시킵니다. 혁신을 현실로 만드는 조합.',
  '양-부': '배려와 신중함이 함께하는 사람. 누군가의 마음을 살피면서도 그 상황 전체를 깊이 이해하려 합니다. 가장 안전하고 깊은 신뢰를 주는 조합.'
};
// 유형 궁합 (각 유형의 best/growth/challenge 매칭)
const COMPATIBILITY = {
  '사': {
    best:      { type: '부', desc: '추진력과 분석력의 환상의 듀오. 함께 있으면 결정의 정확도가 가장 높아집니다.' },
    growth:    { type: '양', desc: '서로의 결핍을 채워주는 관계. 사자의 단호함이 양의 부드러움을 만나 더 단단해집니다.' },
    challenge: { type: '카', desc: '속도와 방향이 자주 어긋날 수 있습니다. 카멜레온의 즉흥성에 사자가 답답함을 느끼기 쉬워 서로의 방식을 인정하는 자세가 필요해요.' }
  },
  '카': {
    best:      { type: '양', desc: '활기와 안정의 가장 좋은 조합. 카멜레온의 새로움이 양의 따뜻함과 만나면 가장 편안한 관계가 됩니다.' },
    growth:    { type: '부', desc: '서로를 보완하는 관계. 카멜레온의 직관과 부엉이의 분석이 만나면 아이디어가 단단해집니다.' },
    challenge: { type: '사', desc: '추구하는 속도와 방식이 다를 수 있습니다. 카멜레온의 유연함이 사자에겐 우유부단으로 보일 수 있어 이해와 조율이 필요해요.' }
  },
  '양': {
    best:      { type: '카', desc: '안정과 활기가 어우러지는 조합. 양의 깊은 마음이 카멜레온의 밝은 에너지와 만나면 관계가 늘 새롭게 빛납니다.' },
    growth:    { type: '사', desc: '자기 표현을 자극받는 관계. 사자의 분명함이 양에게 자기 목소리를 내는 용기를 줍니다.' },
    challenge: { type: '부', desc: '감정 표현 방식이 다를 수 있습니다. 양의 직관적 공감과 부엉이의 논리적 사고가 부딪힐 수 있어 서로의 방식을 존중해야 해요.' }
  },
  '부': {
    best:      { type: '사', desc: '분석과 실행의 완벽한 조합. 부엉이의 깊은 사고가 사자의 추진력과 만나면 가장 신뢰할 수 있는 결과를 만듭니다.' },
    growth:    { type: '카', desc: '시야를 넓혀주는 관계. 부엉이의 깊이가 카멜레온의 다양성과 만나면 더 풍부한 답을 찾을 수 있습니다.' },
    challenge: { type: '양', desc: '의사결정 속도와 표현 방식이 다를 수 있습니다. 부엉이의 신중함이 양에겐 차갑게 느껴질 수 있어 따뜻한 표현이 도움이 됩니다.' }
  }
};

function saveSession(extra) { try { sessionStorage.setItem(SESSION_KEY, JSON.stringify(Object.assign({ current, answers, userName }, extra))); } catch(e) {} }
function clearSession() { try { sessionStorage.removeItem(SESSION_KEY); } catch(e) {} }
function showScreen(id) { document.querySelectorAll('.screen').forEach(s => s.classList.remove('active')); document.getElementById(id).classList.add('active'); window.scrollTo(0, 0); }
function startTest() { const nameVal = document.getElementById('user-name').value.trim(); if (!nameVal) { const errEl = document.getElementById('name-error'); errEl.style.display = 'block'; document.getElementById('user-name').focus(); return; } userName = nameVal; saveSession(); showScreen('screen-question'); renderQ(); }
function renderQ() { const q = questions[current]; const total = questions.length; const sel = answers[current]; document.getElementById('q-counter').textContent = `${current+1} / ${total}`; document.getElementById('q-num-bar').textContent = `Q${String(current+1).padStart(2,'0')}`; document.getElementById('q-text').textContent = q.q; document.getElementById('progress-fill').style.width = `${((current+1)/total)*100}%`; const opts = document.getElementById('options'); opts.innerHTML = ''; q.opts.forEach((txt, i) => { const btn = document.createElement('button'); const isSelected = sel.includes(i); const isDimmed = !isSelected && sel.length >= 2; btn.className = 'option-btn' + (isSelected ? ' selected' : '') + (isDimmed ? ' dimmed' : ''); btn.innerHTML = `<span class="option-label">${['A','B','C','D'][i]}</span><span>${txt}</span>`; btn.onclick = () => selectOpt(i); btn.setAttribute('aria-pressed', isSelected ? 'true' : 'false'); if (isDimmed) btn.setAttribute('aria-disabled', 'true'); opts.appendChild(btn); }); updateSelCount(); document.getElementById('btn-prev').style.visibility = current === 0 ? 'hidden' : 'visible'; document.getElementById('btn-next').style.display = current < total-1 ? 'block' : 'none'; document.getElementById('btn-next').disabled = sel.length === 0; document.getElementById('btn-submit').style.display = current === total-1 ? 'block' : 'none'; document.getElementById('btn-submit').disabled = sel.length === 0; }
function updateSelCount() { const count = answers[current].length; const el = document.getElementById('sel-count'); el.textContent = `${count} / 2`; el.classList.toggle('full', count >= 2); }
function selectOpt(i) { const sel = answers[current]; const idx = sel.indexOf(i); if (idx > -1) { sel.splice(idx, 1); } else if (sel.length < 2) { sel.push(i); } else { return; } document.querySelectorAll('.option-btn').forEach((btn, idx) => { const isSelected = sel.includes(idx); const isDimmed = !isSelected && sel.length >= 2; btn.classList.toggle('selected', isSelected); btn.classList.toggle('dimmed', isDimmed); btn.setAttribute('aria-pressed', isSelected ? 'true' : 'false'); if (isDimmed) btn.setAttribute('aria-disabled', 'true'); else btn.removeAttribute('aria-disabled'); }); updateSelCount(); saveSession(); const hasAny = sel.length > 0; document.getElementById('btn-next').disabled = !hasAny; document.getElementById('btn-submit').disabled = !hasAny; }
function nextQ() { if (answers[current].length === 0) return; current++; saveSession(); renderQ(); }
function prevQ() { if (current > 0) { current--; saveSession(); renderQ(); } }
function submitTest() { if (answers[current].length === 0) return; const scores = { '카':0, '사':0, '양':0, '부':0 }; answers.forEach((sel, i) => { sel.forEach(ans => { scores[SCORE_MAP[i][ans]] += 0.5; }); }); pendingScores = scores; showAd(); }
function showAd() { document.getElementById('ad-content').style.display = ''; document.getElementById('wait-screen').classList.remove('active'); const adImg = document.getElementById('ad-img'); const adWrap = document.getElementById('ad-image-wrap'); if (AD_CONFIG.image) { adImg.src = AD_CONFIG.image; adWrap.style.display = ''; adWrap.onclick = adLinkClick; } else { adWrap.style.display = 'none'; } document.getElementById('ad-title').textContent = AD_CONFIG.title; document.getElementById('ad-btn-text').textContent = AD_CONFIG.btnText; adTimer = null; saveSession({ screen: 'ad', scores: pendingScores }); showScreen('screen-ad'); }
function adLinkClick() { saveSession({ screen: 'ad', scores: pendingScores, adClicked: true }); window.open(AD_CONFIG.link, '_blank', 'noopener,noreferrer'); document.getElementById('ad-content').style.display = 'none'; const waitScreen = document.getElementById('wait-screen'); waitScreen.classList.add('active'); const WAIT = 10; let remain = WAIT; document.getElementById('wait-number').textContent = remain; document.getElementById('wait-progress').style.width = '100%'; adTimer = setInterval(() => { remain--; document.getElementById('wait-number').textContent = remain; document.getElementById('wait-progress').style.width = `${(remain / WAIT) * 100}%`; const waitEl = document.getElementById('wait-screen'); if (waitEl) { waitEl.setAttribute('aria-valuenow', remain); waitEl.setAttribute('aria-valuetext', `결과 표시까지 ${remain}초 남음`); } if (remain <= 0) { clearInterval(adTimer); adTimer = null; waitScreen.classList.remove('active'); showResult(pendingScores); } }, 1000); }
function encodeResult(name, top, scores) { const data = { n: name, t: top, s: scores }; return btoa(unescape(encodeURIComponent(JSON.stringify(data)))); }
function decodeResult(encoded) { try { return JSON.parse(decodeURIComponent(escape(atob(encoded)))); } catch(e) { return null; } }
function showResult(scores) { clearSession(); const total = Object.values(scores).reduce((a, b) => a + b, 0); const sorted = ['카','사','양','부'].sort((a, b) => scores[b] - scores[a]); const top = sorted[0]; const second = sorted[1]; const pcts = {}; if (total > 0) { let sum = 0; ['카','사','양','부'].forEach(k => { pcts[k] = Math.floor(scores[k] / total * 100); sum += pcts[k]; }); const remainder = 100 - sum; const keys = ['카','사','양','부'].sort((a, b) => (scores[b] / total * 100 - Math.floor(scores[b] / total * 100)) - (scores[a] / total * 100 - Math.floor(scores[a] / total * 100))); for (let i = 0; i < remainder; i++) pcts[keys[i]]++; } else { ['카','사','양','부'].forEach(k => { pcts[k] = 0; }); } currentTop = top; currentScores = scores; const r = RESULTS[top]; const r2 = RESULTS[second]; const encoded = encodeResult(userName, top, scores); history.pushState(null, '', location.pathname + '?r=' + encoded); const banner = document.getElementById('result-banner'); banner.style.background = `linear-gradient(135deg, ${r.color} 0%, ${r.mid} 100%)`; banner.style.color = 'white'; document.getElementById('result-name').textContent = `${userName}님의 결과`;
  document.getElementById('result-category-chip').textContent = CATEGORY_LABEL; document.getElementById('result-emoji').textContent = r.emoji; document.getElementById('result-type').textContent = r.name; document.getElementById('result-keywords').innerHTML = r.keywords.map(k => `<span class="kw-tag">#${k}</span>`).join(''); document.getElementById('result-sub').textContent = `「${r.sub}」`; document.getElementById('type-tags').innerHTML = `<div class="type-tag main-tag"><span class="tag-label">주 유형</span><span class="tag-animal">${r.emoji} ${r.name}</span><span class="tag-pct">${pcts[top]}%</span></div><div class="type-tag sub-tag"><span class="tag-label">부 유형</span><span class="tag-animal">${r2.emoji} ${r2.name}</span><span class="tag-pct">${pcts[second]}%</span></div>`; const sg = document.getElementById('score-grid'); sg.innerHTML = ''; ['카','사','양','부'].forEach(ak => { const rv = RESULTS[ak]; const isTop = (ak === top); const isSecond = (ak === second); const border = isTop ? rv.color : (isSecond ? rv.color + '88' : '#eee'); sg.innerHTML += `<div class="score-item" style="background:${rv.light};border:2px solid ${border}"><div class="score-item-top"><span class="s-label" style="color:${rv.color}">${rv.emoji} ${rv.name}</span><div class="s-bar-wrap"><div class="score-bar" style="background:#E0E0E0"><div class="score-bar-fill" style="width:${pcts[ak]}%;background:${rv.color}"></div></div></div><span class="s-num" style="color:${rv.color}">${pcts[ak]}%</span></div></div>`; }); document.getElementById('result-desc').textContent = r.desc; const dg = document.getElementById('detail-grid'); dg.innerHTML = `<div class="detail-box" style="background:${r.light};border:1.5px solid ${r.mid}"><h4 style="color:${r.color}">✅ 주요 강점</h4><ul>${r.pros.map(p=>`<li>${p}</li>`).join('')}</ul></div><div class="detail-box" style="background:#FFF8F8;border:1.5px solid #FFD0D0"><h4 style="color:#C00000">⚠️ 성장 포인트</h4><ul>${r.cons.map(c=>`<li>${c}</li>`).join('')}</ul></div>`; document.getElementById('tip-box').innerHTML = r.tip; const others = ['카','사','양','부'].filter(k => k !== top); const os = document.getElementById('other-section'); os.innerHTML = `<h3>🤝 다른 유형과 소통하는 법</h3><div class="other-cards">` + others.map(k => { const ov = RESULTS[k]; return `<div class="other-card"><div class="other-card-header" style="background:${ov.light}"><span class="o-emoji">${ov.emoji}</span><div><div class="o-name" style="color:${ov.color}">${ov.name}</div><div class="o-kw-row">${ov.keywords.map(k=>`<span class="o-kw-tag" style="color:${ov.color};border-color:${ov.color}40">${k}</span>`).join('')}</div><div class="o-brief">${ov.brief}</div></div></div><div class="other-card-body"><div class="comm-title">💬 이렇게 소통하세요</div><ul>${ov.comm.map(c => `<li>${c}</li>`).join('')}</ul></div></div>`; }).join('') + `</div>`;
  // 다른 유형 카드 아코디언 (첫 카드만 펼침)
  document.querySelectorAll('.other-card').forEach((card, idx) => {
    if (idx > 0) card.classList.add('collapsed');
    const header = card.querySelector('.other-card-header');
    if (header) {
      header.onclick = () => card.classList.toggle('collapsed');
    }
  });
  // 기존 하이브리드/궁합 요소 제거 (재실행 시 중복 방지)
  document.querySelectorAll('.hybrid-card, .compat-section').forEach(el => el.remove());
  // 하이브리드 유형 카드 (1-2위 격차 15% 이내일 때)
  const gap = pcts[top] - pcts[second];
  if (gap <= HYBRID_THRESHOLD && total > 0) {
    const order = ['사','카','양','부'];
    const i1 = order.indexOf(top), i2 = order.indexOf(second);
    const hybridKey = i1 < i2 ? `${top}-${second}` : `${second}-${top}`;
    const hybridDesc = HYBRID[hybridKey];
    if (hybridDesc) {
      const hr1 = RESULTS[top], hr2 = RESULTS[second];
      const hybridHtml = `<div class="hybrid-card"><div class="hybrid-label">🎭 당신은 하이브리드형</div><div class="hybrid-types">${hr1.emoji} ${hr1.name} + ${hr2.emoji} ${hr2.name}</div><div class="hybrid-desc">${hybridDesc}</div></div>`;
      document.getElementById('tip-box').insertAdjacentHTML('afterend', hybridHtml);
    }
  }
  // 유형 궁합 카드
  const compat = COMPATIBILITY[top];
  if (compat) {
    const bestT = RESULTS[compat.best.type], growthT = RESULTS[compat.growth.type], challengeT = RESULTS[compat.challenge.type];
    const compatHtml = `<div class="compat-section"><h3>🤝 유형 궁합</h3><div class="compat-cards"><div class="compat-card best"><div class="compat-emoji">${bestT.emoji}</div><div class="compat-info"><div class="compat-label">💖 가장 잘 맞는 유형</div><div class="compat-type">${bestT.name}</div><div class="compat-desc">${compat.best.desc}</div></div></div><div class="compat-card growth"><div class="compat-emoji">${growthT.emoji}</div><div class="compat-info"><div class="compat-label">🌱 함께 성장하는 유형</div><div class="compat-type">${growthT.name}</div><div class="compat-desc">${compat.growth.desc}</div></div></div><div class="compat-card challenge"><div class="compat-emoji">${challengeT.emoji}</div><div class="compat-info"><div class="compat-label">⚡ 주의가 필요한 유형</div><div class="compat-type">${challengeT.name}</div><div class="compat-desc">${compat.challenge.desc}</div></div></div></div></div>`;
    document.getElementById('other-section').insertAdjacentHTML('beforebegin', compatHtml);
  }
  injectShareImgButtons();
  injectResultRecommendBtn();
  recordResultStats(top);
  showScreen('screen-result'); }
function retryTest() { current = 0; answers = Array.from({length: questions.length}, () => []); currentTop = ''; currentScores = {}; clearSession(); history.pushState(null, '', location.pathname); showScreen('screen-intro'); }
function copyResultLink() { const url = location.href; const updateBtns = () => { showToast('✅ 링크가 복사됐어요!'); ['btn-share-link', 'btn-share-link-top'].forEach(id => { const btn = document.getElementById(id); if (btn) { btn.textContent = '✅ 복사됨!'; setTimeout(() => { btn.textContent = '🔗 링크 복사'; }, 2500); } }); }; navigator.clipboard.writeText(url).then(updateBtns).catch(() => { const ta = document.createElement('textarea'); ta.value = url; ta.style.position = 'fixed'; ta.style.opacity = '0'; document.body.appendChild(ta); ta.select(); document.execCommand('copy'); document.body.removeChild(ta); updateBtns(); }); }
function sendEmail() { document.getElementById('email-input').value = ''; document.getElementById('modal-status').textContent = ''; document.getElementById('btn-modal-send').disabled = false; document.getElementById('btn-modal-send').textContent = '📨 보내기'; document.getElementById('email-modal').classList.add('open'); setTimeout(() => document.getElementById('email-input').focus(), 100); trapFocus(document.getElementById('email-modal')); }
function closeEmailModal() { releaseFocusTrap(); document.getElementById('email-modal').classList.remove('open'); }
function doSendEmail() { const toEmail = document.getElementById('email-input').value.trim(); if (!toEmail || !toEmail.includes('@')) { document.getElementById('modal-status').innerHTML = '<span style="color:#C00000">올바른 이메일 주소를 입력해주세요.</span>'; return; }
  // 발송 횟수 제한 체크
  const now = Date.now();
  const HOUR = 60 * 60 * 1000;
  const DAY = 24 * HOUR;
  let history = [];
  try { history = JSON.parse(localStorage.getItem('email_history') || '[]'); } catch(e) { history = []; }
  history = history.filter(ts => now - ts < DAY);
  const recentHour = history.filter(ts => now - ts < HOUR).length;
  const recentDay = history.length;
  if (recentHour >= 3) {
    document.getElementById('modal-status').innerHTML = '<span style="color:#C00000">⚠️ 1시간에 최대 3통까지 발송 가능합니다. 잠시 후 다시 시도해주세요.</span>';
    return;
  }
  if (recentDay >= 10) {
    document.getElementById('modal-status').innerHTML = '<span style="color:#C00000">⚠️ 하루 최대 10통까지 발송 가능합니다. 내일 다시 시도해주세요.</span>';
    return;
  }
  const r = RESULTS[currentTop]; const total = Object.values(currentScores).reduce((a, b) => a + b, 0); const sorted = ['카','사','양','부'].sort((a,b) => currentScores[b] - currentScores[a]); const scoreLines = sorted.map(k => { const pct = total > 0 ? Math.round(currentScores[k] / total * 100) : 0; const mark = k === sorted[0] ? ' ★주' : (k === sorted[1] ? ' ☆부' : ''); return `${RESULTS[k].emoji} ${RESULTS[k].name}: ${pct}%${mark}`; }).join('\n'); const btn = document.getElementById('btn-modal-send'); btn.disabled = true; btn.textContent = '전송 중...'; document.getElementById('modal-status').textContent = ''; emailjs.send(EJS_SERVICE_ID, EJS_TEMPLATE_ID, { to_email: toEmail, user_name: userName, animal_type: r.name, animal_emoji: r.emoji, animal_sub: r.sub, scores: scoreLines, result_link: location.href }).then(() => { try { history.push(now); localStorage.setItem('email_history', JSON.stringify(history)); } catch(e) {} document.getElementById('modal-status').innerHTML = '✅ <span style="color:#2E8B2E">이메일이 성공적으로 전송됐어요!</span>'; btn.textContent = '✅ 전송 완료'; setTimeout(() => closeEmailModal(), 2000); }).catch((err) => { document.getElementById('modal-status').innerHTML = '<span style="color:#C00000">전송 실패. 잠시 후 다시 시도해주세요.</span>'; btn.disabled = false; btn.textContent = '📨 보내기'; console.error('EmailJS error:', err); }); }
function showToast(msg) { let toast = document.getElementById('toast'); if (!toast) { toast = document.createElement('div'); toast.id = 'toast'; toast.className = 'toast'; toast.setAttribute('role', 'status'); toast.setAttribute('aria-live', 'polite'); document.body.appendChild(toast); } toast.textContent = msg; toast.classList.add('show'); setTimeout(() => toast.classList.remove('show'), 2500); }
function loadAdConfig() { try { const saved = localStorage.getItem('ad_config'); if (saved) { const obj = JSON.parse(saved); if (obj.title) AD_CONFIG.title = obj.title; if (obj.btnText) AD_CONFIG.btnText = obj.btnText; } } catch(e) {} }
function handleImgUpload(e) { const file = e.target.files[0]; if (!file) return; const reader = new FileReader(); reader.onload = function(ev) { uploadedImageBase64 = ev.target.result; const preview = document.getElementById('img-preview'); preview.src = uploadedImageBase64; preview.style.display = 'block'; document.getElementById('upload-label-text').textContent = file.name; document.getElementById('cfg-image').value = ''; }; reader.readAsDataURL(file); }
function openAdmin() { uploadedImageBase64 = null; document.getElementById('admin-pw-input').value = ''; document.getElementById('admin-pw-error').textContent = ''; document.getElementById('admin-pw-screen').style.display = ''; document.getElementById('admin-settings-screen').style.display = 'none'; document.getElementById('admin-overlay').classList.add('open'); setTimeout(() => document.getElementById('admin-pw-input').focus(), 100); trapFocus(document.getElementById('admin-overlay')); }
function closeAdmin() { releaseFocusTrap(); document.getElementById('admin-overlay').classList.remove('open'); }
function adminLogin() { const pw = document.getElementById('admin-pw-input').value; const stored = localStorage.getItem('admin_pw') || DEFAULT_ADMIN_PW; if (pw === stored) { document.getElementById('admin-pw-screen').style.display = 'none'; document.getElementById('admin-settings-screen').style.display = ''; document.getElementById('admin-save-msg').textContent = ''; const currentImg = AD_CONFIG.image || ''; const preview = document.getElementById('img-preview'); if (currentImg) { preview.src = currentImg; preview.style.display = 'block'; document.getElementById('upload-label-text').textContent = '코드 고정 이미지'; document.getElementById('cfg-image').value = currentImg.startsWith('data:') ? '' : currentImg; } else { preview.style.display = 'none'; document.getElementById('upload-label-text').textContent = '코드 고정 이미지'; document.getElementById('cfg-image').value = ''; } document.getElementById('cfg-link').value = AD_CONFIG.link || ''; document.getElementById('cfg-title').value = AD_CONFIG.title || ''; document.getElementById('cfg-btntext').value = AD_CONFIG.btnText || ''; document.getElementById('cfg-newpw').value = ''; document.getElementById('cfg-newpw2').value = ''; document.getElementById('cfg-img-file').value = ''; const cfgImage = document.getElementById('cfg-image'); const cfgLink = document.getElementById('cfg-link'); const cfgImgFile = document.getElementById('cfg-img-file'); [cfgImage, cfgLink].forEach(el => { if (el) { el.disabled = true; el.readOnly = true; el.style.opacity = '0.6'; el.style.cursor = 'not-allowed'; el.style.background = '#F5F5F5'; } }); if (cfgImgFile) cfgImgFile.disabled = true; const uploadArea = document.querySelector('.img-upload-area'); if (uploadArea) { uploadArea.style.opacity = '0.6'; uploadArea.style.cursor = 'not-allowed'; uploadArea.style.pointerEvents = 'none'; } if (!document.getElementById('ad-fixed-notice')) { const notice = document.createElement('div'); notice.id = 'ad-fixed-notice'; notice.style.cssText = 'background:#FFF8E0;border:1.5px solid #E5B948;border-radius:8px;padding:10px 14px;font-size:0.85rem;color:#7A5A00;line-height:1.55;margin-bottom:14px;'; notice.innerHTML = '🔒 광고 이미지와 광고 링크는 <strong>코드에 고정</strong>되어 모든 방문자에게 동일하게 적용됩니다. 변경하려면 <code style="background:#FFE8B5;padding:1px 5px;border-radius:3px;">shared.js</code>의 <code style="background:#FFE8B5;padding:1px 5px;border-radius:3px;">AD_CONFIG</code>를 수정해주세요.'; const firstSection = document.querySelector('.admin-section'); if (firstSection) firstSection.parentNode.insertBefore(notice, firstSection); } } else { const err = document.getElementById('admin-pw-error'); err.textContent = '비밀번호가 틀렸어요.'; document.getElementById('admin-pw-input').value = ''; document.getElementById('admin-pw-input').focus(); setTimeout(() => { err.textContent = ''; }, 2500); } }
function saveAdminSettings() { const newpw = document.getElementById('cfg-newpw').value.trim(); const newpw2 = document.getElementById('cfg-newpw2').value.trim(); const msg = document.getElementById('admin-save-msg'); if (newpw || newpw2) { if (newpw !== newpw2) { msg.innerHTML = '<span style="color:#C00000">비밀번호가 일치하지 않아요.</span>'; return; } if (newpw.length < 4) { msg.innerHTML = '<span style="color:#C00000">비밀번호는 4자리 이상이어야 해요.</span>'; return; } localStorage.setItem('admin_pw', newpw); } AD_CONFIG.title = document.getElementById('cfg-title').value.trim() || '지금 인기 상품을 확인해보세요!'; AD_CONFIG.btnText = document.getElementById('cfg-btntext').value.trim() || '상품 보고 결과 확인하기'; localStorage.setItem('ad_config', JSON.stringify({ title: AD_CONFIG.title, btnText: AD_CONFIG.btnText })); msg.innerHTML = '✅ <span style="color:#2E8B2E">저장됐어요!</span>'; setTimeout(() => { msg.textContent = ''; closeAdmin(); }, 1500); }
window.addEventListener('DOMContentLoaded', () => {
  if (typeof QUIZ_DATA !== 'undefined') {
    questions = QUIZ_DATA.questions;
    SCORE_MAP = QUIZ_DATA.SCORE_MAP;
    RESULTS = QUIZ_DATA.RESULTS;
    CATEGORY_LABEL = QUIZ_DATA.CATEGORY_LABEL;
    SESSION_KEY = QUIZ_DATA.SESSION_KEY;
    answers = Array.from({length: questions.length}, () => []);
  }
  if (typeof emailjs !== 'undefined') { emailjs.init(EJS_PUBLIC_KEY); }
  // 관리자 모드 확인
  if (localStorage.getItem('admin_mode') === '1') {
    document.body.classList.add('admin-mode');
  }
  loadAdConfig();
  injectIntroShareBtn();
  const params = new URLSearchParams(location.search);
  const encoded = params.get('r');
  if (encoded) { const data = decodeResult(encoded); if (data && data.n && data.t && data.s) { userName = data.n; currentTop = data.t; currentScores = data.s; showResult(data.s); return; } }
  try {
    const saved = sessionStorage.getItem(SESSION_KEY);
    if (saved) { const state = JSON.parse(saved); if (!state) return; userName = state.userName || '익명'; document.getElementById('user-name').value = userName; if (state.screen === 'ad' && state.scores) { current = state.current; answers = state.answers || Array.from({length: questions.length}, () => []); pendingScores = state.scores; if (state.adClicked) { showResult(pendingScores); } else { showAd(); } return; } if (typeof state.current === 'number' && Array.isArray(state.answers)) { current = state.current; answers = state.answers; showScreen('screen-question'); renderQ(); } }
  } catch(e) {}
});

// html2canvas lazy load
function ensureHtml2Canvas() {
  return new Promise((resolve, reject) => {
    if (typeof html2canvas !== 'undefined') return resolve();
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.min.js';
    script.onload = resolve;
    script.onerror = () => reject(new Error('html2canvas 로드 실패'));
    document.head.appendChild(script);
  });
}

// 공유 카드 다운로드
async function downloadShareCard() {
  if (!currentTop || !RESULTS[currentTop]) {
    showToast('⚠️ 결과 데이터가 없어요');
    return;
  }

  const btns = document.querySelectorAll('.btn-share-img');
  btns.forEach(b => { b.disabled = true; b.textContent = '🖼️ 이미지 생성 중...'; });

  try {
    await ensureHtml2Canvas();

    const r = RESULTS[currentTop];
    const total = Object.values(currentScores).reduce((a, b) => a + b, 0);
    const sorted = ['카','사','양','부'].sort((a, b) => currentScores[b] - currentScores[a]);
    const top = sorted[0], second = sorted[1];
    const pcts = {};
    if (total > 0) {
      let sum = 0;
      ['카','사','양','부'].forEach(k => { pcts[k] = Math.floor(currentScores[k] / total * 100); sum += pcts[k]; });
      const remainder = 100 - sum;
      const keys = ['카','사','양','부'].sort((a, b) => (currentScores[b] / total * 100 - Math.floor(currentScores[b] / total * 100)) - (currentScores[a] / total * 100 - Math.floor(currentScores[a] / total * 100)));
      for (let i = 0; i < remainder; i++) pcts[keys[i]]++;
    } else {
      ['카','사','양','부'].forEach(k => { pcts[k] = 0; });
    }

    const r2 = RESULTS[second];

    // off-screen 카드 생성
    const card = document.createElement('div');
    card.className = 'share-card';
    card.style.setProperty('--card-bg-start', r.color);
    card.style.setProperty('--card-bg-end', r.mid);
    card.innerHTML = `
      <div class="share-card-chip">${CATEGORY_LABEL}</div>
      <div class="share-card-emoji">${r.emoji}</div>
      <div class="share-card-name">${r.name}</div>
      <div class="share-card-sub">「${r.sub}」</div>
      <div class="share-card-keywords">${r.keywords.map(k => `<div class="share-card-keyword">#${k}</div>`).join('')}</div>
      <div class="share-card-scores">
        <div class="share-card-score">
          <div class="share-card-score-label">🎯 주 유형</div>
          <div class="share-card-score-pct">${pcts[top]}%</div>
        </div>
        <div class="share-card-score">
          <div class="share-card-score-label">✨ ${r2.emoji} 부 유형</div>
          <div class="share-card-score-pct">${pcts[second]}%</div>
        </div>
      </div>
      <div class="share-card-footer"><span class="brand">4동물 유형검사</span> · 4animal.kr</div>
    `;
    document.body.appendChild(card);

    // html2canvas로 캡처
    const canvas = await html2canvas(card, {
      width: 1080,
      height: 1080,
      scale: 1,
      useCORS: true,
      backgroundColor: null,
      logging: false
    });

    // PNG 다운로드
    canvas.toBlob(blob => {
      const link = document.createElement('a');
      link.download = `4동물유형_${r.name}_${userName || '결과'}.png`;
      link.href = URL.createObjectURL(blob);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(link.href), 1000);
      document.body.removeChild(card);
      showToast('✅ 이미지가 저장됐어요!');
      btns.forEach(b => { b.disabled = false; b.textContent = '🖼️ 결과 카드 다운로드'; });
    }, 'image/png');
  } catch (err) {
    console.error('Share card error:', err);
    showToast('⚠️ 이미지 생성에 실패했어요');
    document.querySelectorAll('.share-card').forEach(c => c.remove());
    btns.forEach(b => { b.disabled = false; b.textContent = '🖼️ 결과 카드 다운로드'; });
  }
}

// 모달 포커스 트랩 유틸리티
let activeModalTrap = null;

function trapFocus(modalEl) {
  releaseFocusTrap();
  if (!modalEl) return;
  const focusable = modalEl.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
  const visible = Array.from(focusable).filter(el => el.offsetParent !== null && !el.disabled);
  if (visible.length === 0) return;
  const first = visible[0];
  const last = visible[visible.length - 1];

  const handler = (e) => {
    if (e.key === 'Tab') {
      const focusableNow = Array.from(modalEl.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])')).filter(el => el.offsetParent !== null && !el.disabled);
      if (focusableNow.length === 0) return;
      const f = focusableNow[0];
      const l = focusableNow[focusableNow.length - 1];
      if (e.shiftKey && document.activeElement === f) {
        e.preventDefault();
        l.focus();
      } else if (!e.shiftKey && document.activeElement === l) {
        e.preventDefault();
        f.focus();
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      if (modalEl.id === 'admin-overlay') closeAdmin();
      else if (modalEl.id === 'email-modal') closeEmailModal();
    }
  };
  modalEl.addEventListener('keydown', handler);
  activeModalTrap = { el: modalEl, handler };
}

function releaseFocusTrap() {
  if (activeModalTrap) {
    activeModalTrap.el.removeEventListener('keydown', activeModalTrap.handler);
    activeModalTrap = null;
  }
}

// 결과 화면에 다운로드 버튼 동적 추가
function injectShareImgButtons() {
  // 기존 동적 버튼 제거 (재실행 시 중복 방지)
  document.querySelectorAll('.share-row-img').forEach(el => el.remove());

  const topShareRow = document.querySelector('.share-row-top');
  const bottomShareRow = document.querySelector('.result-body .share-row:not(.share-row-top)');

  [topShareRow, bottomShareRow].forEach(parent => {
    if (!parent) return;
    const row = document.createElement('div');
    row.className = 'share-row-img';
    row.innerHTML = `<button class="btn-share-img" onclick="downloadShareCard()">🖼️ 결과 카드 다운로드</button>`;
    parent.insertAdjacentElement('afterend', row);
  });
}

// 검사 추천 링크 복사 (카테고리 URL만, 본인 결과 없이)
function shareTestLink() {
  const cleanUrl = location.origin + location.pathname;
  const fallback = (msg) => {
    const ta = document.createElement('textarea');
    ta.value = cleanUrl;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
    showToast(msg);
  };
  const onSuccess = () => showToast('🔗 검사 링크가 복사됐어요! 친구에게 공유해보세요');
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(cleanUrl).then(onSuccess).catch(() => fallback('🔗 링크가 복사됐어요!'));
  } else {
    fallback('🔗 링크가 복사됐어요!');
  }
}

// 인트로 화면에 추천 버튼 동적 삽입
function injectIntroShareBtn() {
  const intro = document.querySelector('.intro-body');
  if (!intro || intro.querySelector('.btn-recommend-intro')) return;
  const btn = document.createElement('button');
  btn.className = 'btn-recommend-intro';
  btn.type = 'button';
  btn.textContent = '🔗 친구에게 이 검사 추천하기';
  btn.onclick = shareTestLink;
  intro.appendChild(btn);
}

// 결과 화면에 추천 버튼 동적 삽입
function injectResultRecommendBtn() {
  if (document.querySelector('.btn-recommend-result')) return;
  const shareRow = document.querySelector('.result-body .share-row:not(.share-row-top)');
  if (!shareRow) return;
  const row = document.createElement('div');
  row.className = 'share-row-recommend';
  row.innerHTML = '<button class="btn-recommend-result" type="button" onclick="shareTestLink()">📨 이 검사 친구에게도 추천하기</button>';
  shareRow.parentNode.insertBefore(row, shareRow);
}

// ==================== 통계 카운터 (Abacus) ====================
const STATS_NAMESPACE = '4animal-test';
const STATS_CAT_MAP = {
  'quiz_state_일반': 'general',
  'quiz_state_직장': 'work',
  'quiz_state_연인': 'love',
  'quiz_state_가족': 'family',
  'quiz_state_친구': 'friend'
};
const STATS_ANIMAL_MAP = { '사': 'sa', '카': 'ka', '양': 'yang', '부': 'bu' };

function getStatsTodayKey() {
  const d = new Date();
  return `${d.getFullYear()}${String(d.getMonth()+1).padStart(2,'0')}${String(d.getDate()).padStart(2,'0')}`;
}

function statsHit(key) {
  try {
    fetch(`https://abacus.jasoncameron.dev/hit/${STATS_NAMESPACE}/${key}`, { method: 'GET', mode: 'cors' }).catch(() => {});
  } catch(e) {}
}

let statsRecorded = false;
function recordResultStats(topAnimal) {
  // URL 복원으로 진입한 경우는 카운트 안 함
  if (location.search.includes('r=')) return;
  if (statsRecorded) return;
  statsRecorded = true;
  const cat = STATS_CAT_MAP[SESSION_KEY];
  const animal = STATS_ANIMAL_MAP[topAnimal];
  if (!cat || !animal) return;
  const today = getStatsTodayKey();
  statsHit(`total-${cat}`);
  statsHit(`today-${today}-${cat}`);
  statsHit(`total-${cat}-${animal}`);
  statsHit(`today-${today}-${cat}-${animal}`);
}
