/* V1 is a fail-closed preview: no network, persistence, credentials, or authentication simulation. */
(() => {
  'use strict';
  const form = document.getElementById('matching-form');
  const fields = document.getElementById('form-fields');
  const sections = [...document.querySelectorAll('[data-step]')];
  const dialogs = [...document.querySelectorAll('dialog')];
  const status = document.getElementById('form-status');
  const progress = document.getElementById('application-progress');
  const progressLabel = document.getElementById('progress-label');
  let dialogOpener = null;
  let dirty = false;
  const controlsFor = (name) => [...form.querySelectorAll(`[name="${name}"]`)];
  const namesIn = (scope) => [...new Set([...scope.querySelectorAll('input[required],select[required],textarea[required]')].map(input => input.name).concat(scope.querySelector('[name="preferredRegions"]') ? ['preferredRegions'] : []))];
  const allNames = namesIn(form);
  const yearInput = document.getElementById('birthYear');
  yearInput.max = String(new Date().getFullYear());

  function errorFor(name) {
    const controls = controlsFor(name);
    const input = controls[0];
    if (name === 'preferredRegions') return controls.some(c => c.checked) ? '' : '선호 지역을 한 곳 이상 선택해주세요.';
    if (input.type === 'radio') return controls.some(c => c.checked) ? '' : '항목을 선택해주세요.';
    if (input.type === 'checkbox') return input.checked ? '' : '체험 안내를 확인해주세요.';
    const value = input.value.trim();
    if (!value) return '필수 항목을 입력해주세요.';
    if (input.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return '올바른 이메일 형식으로 입력해주세요.';
    if (name === 'birthYear' && (!/^\d{4}$/.test(value) || Number(value) < 1900 || Number(value) > Number(yearInput.max))) return `1900~${yearInput.max} 사이의 출생연도 4자리를 입력해주세요.`;
    if (input.maxLength > 0 && value.length > input.maxLength) return `${input.maxLength}자 이하로 입력해주세요.`;
    return '';
  }

  function renderError(name, message) {
    const messageNode = document.getElementById(`${name}-error`);
    if (messageNode) messageNode.textContent = message;
    for (const input of controlsFor(name)) {
      if (message) input.setAttribute('aria-invalid', 'true');
      else input.removeAttribute('aria-invalid');
      if (messageNode) {
        const ids = new Set((input.getAttribute('aria-describedby') || '').split(' ').filter(Boolean));
        ids.add(messageNode.id);
        input.setAttribute('aria-describedby', [...ids].join(' '));
      }
    }
  }

  function focusField(name) {
    const input = controlsFor(name)[0];
    input.focus({ preventScroll: true });
    (input.closest('.field') || input.closest('.consent-row') || input).scrollIntoView({ behavior: motion(), block: 'center' });
  }

  function validate(scope) {
    const errors = namesIn(scope).map(name => ({ name, message: errorFor(name) }));
    errors.forEach(({ name, message }) => renderError(name, message));
    const invalid = errors.filter(({ message }) => message);
    if (invalid.length) {
      status.textContent = `아직 ${invalid.length}개 항목을 확인해주세요. 첫 번째 항목으로 이동합니다.`;
      focusField(invalid[0].name);
      return false;
    }
    status.textContent = '';
    return true;
  }

  function updateProgress() {
    const complete = allNames.filter(name => !errorFor(name)).length;
    const percentage = Math.round(complete / allNames.length * 100);
    progress.value = percentage;
    progress.textContent = `${percentage}%`;
    progressLabel.textContent = `${percentage}%`;
    sections.forEach(section => {
      const completeStep = namesIn(section).every(name => !errorFor(name));
      const link = document.querySelector(`[data-step-link="${section.dataset.step}"]`);
      link.querySelector('.step-check').textContent = completeStep ? '✓' : '';
      link.setAttribute('aria-label', `${section.dataset.step}단계 ${completeStep ? '필수 항목 작성 완료' : '작성하기'}`);
    });
  }

  function motion() { return window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth'; }
  function goTo(id, focusHeading = false) {
    const target = document.getElementById(id);
    target.scrollIntoView({ behavior: motion(), block: 'start' });
    if (focusHeading) {
      const heading = target.querySelector('h3') || target;
      heading.tabIndex = -1;
      heading.focus({ preventScroll: true });
    }
  }

  function openDialog(id) {
    dialogOpener = document.activeElement;
    document.getElementById(id).showModal();
    document.body.classList.add('modal-open');
  }
  function closeDialog(dialog) { dialog.close(); }

  document.querySelectorAll('[data-open]').forEach(button => button.addEventListener('click', () => openDialog(button.dataset.open)));
  dialogs.forEach(dialog => {
    dialog.querySelectorAll('[data-close]').forEach(button => button.addEventListener('click', () => closeDialog(dialog)));
    dialog.addEventListener('close', () => {
      document.body.classList.remove('modal-open');
      if (dialogOpener?.isConnected) dialogOpener.focus({ preventScroll: true });
    });
    dialog.addEventListener('click', event => {
      if (event.target !== dialog) return;
      const rect = dialog.getBoundingClientRect();
      if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) closeDialog(dialog);
    });
  });

  form.addEventListener('input', event => {
    dirty = true;
    const name = event.target.name;
    if (name && event.target.getAttribute('aria-invalid')) renderError(name, errorFor(name));
    const counter = document.querySelector(`[data-counter="${event.target.id}"]`);
    if (counter) counter.textContent = `${event.target.value.length} / ${event.target.maxLength}`;
    status.textContent = '';
    updateProgress();
  });
  form.addEventListener('change', event => {
    if (event.target.name === 'preferredRegions') {
      const regions = controlsFor('preferredRegions');
      if (event.target.checked && event.target.value === '지역무관') regions.forEach(input => { if (input !== event.target) input.checked = false; });
      else if (event.target.checked) regions.find(input => input.value === '지역무관').checked = false;
      renderError('preferredRegions', errorFor('preferredRegions'));
    }
    if (event.target.type === 'radio') renderError(event.target.name, errorFor(event.target.name));
    updateProgress();
  });
  form.addEventListener('focusout', event => {
    if (event.target.required && !['checkbox', 'radio'].includes(event.target.type) && event.target.value) renderError(event.target.name, errorFor(event.target.name));
  });
  document.querySelectorAll('[data-next]').forEach(button => button.addEventListener('click', () => {
    const step = Number(button.dataset.next);
    if (validate(document.getElementById(`step-${step}`))) goTo(`step-${step + 1}`, true);
  }));
  form.addEventListener('submit', event => {
    event.preventDefault();
    if (validate(form)) openDialog('complete-dialog');
  });
  // Prevent Enter in a single-line field from unexpectedly opening the final completion dialog.
  form.addEventListener('keydown', event => {
    if (event.key === 'Enter' && event.target.tagName === 'INPUT' && !['checkbox','radio'].includes(event.target.type)) event.preventDefault();
  });
  document.getElementById('review-draft').addEventListener('click', () => {
    closeDialog(document.getElementById('complete-dialog'));
    goTo('step-1', true);
  });
  document.getElementById('clear-draft').addEventListener('click', () => {
    closeDialog(document.getElementById('complete-dialog'));
    resetDraft();
    goTo('home');
  });
  function resetDraft() {
    form.reset();
    allNames.forEach(name => renderError(name, ''));
    document.querySelector('[data-counter="lifestyle"]').textContent = '0 / 800';
    status.textContent = '';
    dirty = false;
    updateProgress();
  }
  // Clear transient inputs before a browser back/forward cache can retain them.
  window.addEventListener('pagehide', resetDraft);
  window.addEventListener('pageshow', event => { if (event.persisted) resetDraft(); });
  window.addEventListener('beforeunload', event => { if (dirty) { event.preventDefault(); event.returnValue = ''; } });

  let scheduled = false;
  function updateActiveStep() {
    const threshold = window.innerWidth <= 760 ? 240 : 180;
    const active = sections.filter(section => section.getBoundingClientRect().top <= threshold).at(-1) || sections[0];
    document.querySelectorAll('[data-step-link]').forEach(link => {
      if (link.dataset.stepLink === active.dataset.step) link.setAttribute('aria-current', 'step');
      else link.removeAttribute('aria-current');
    });
    scheduled = false;
  }
  window.addEventListener('scroll', () => { if (!scheduled) { scheduled = true; requestAnimationFrame(updateActiveStep); } }, { passive: true });
  if ('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) { entry.target.classList.add('visible'); observer.unobserve(entry.target); }
    }), { threshold: 0.03 });
    document.querySelectorAll('.reveal').forEach(element => { element.classList.add('observe'); observer.observe(element); });
  }
  fields.disabled = false;
  resetDraft();
  updateActiveStep();
  // Read-only assistance exposes progress, never profile values or contact information.
  if (document.modelContext?.registerTool) {
    const lifecycle = new AbortController();
    try {
      Promise.resolve(document.modelContext.registerTool({
        name: 'get_application_progress',
        title: '신청서 작성 진행도 확인',
        description: '체험 신청서의 필수 항목 작성 진행률과 단계별 완료 여부만 조회합니다. 입력한 개인정보는 반환하지 않습니다.',
        inputSchema: { type:'object', properties:{}, additionalProperties:false },
        annotations: { readOnlyHint:true, untrustedContentHint:false },
        execute(input) {
          if (!input || typeof input !== 'object' || Array.isArray(input) || Object.keys(input).length) throw new Error('빈 객체만 입력할 수 있습니다.');
          return { mode:'preview', submitted:false, percent:Number(progress.value), steps:sections.map(section => ({ step:Number(section.dataset.step), complete:namesIn(section).every(name => !errorFor(name)) })) };
        }
      }, { signal:lifecycle.signal })).catch(() => {});
    } catch { /* The form remains fully usable if the optional browser API is unavailable. */ }
    window.addEventListener('pagehide', () => lifecycle.abort(), { once:true });
  }
})();
