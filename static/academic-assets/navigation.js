(() => {
  const nav = document.querySelector('.profile nav');
  if (!nav) return;
  const links = [...nav.querySelectorAll('a[href^="#"]')];
  const sections = links.map(link => document.querySelector(link.getAttribute('href')));
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const motionAllowed = () => !reducedMotion.matches && document.body.dataset.motion !== 'off';
  let scheduled = false;
  let currentIndex = -1;
  let jumpTarget = -1;
  let jumpTimeout = 0;

  function clearJump() {
    jumpTarget = -1;
    clearTimeout(jumpTimeout);
    jumpTimeout = 0;
  }
  function destination(section) {
    const margin = parseFloat(getComputedStyle(section).scrollMarginTop) || 0;
    const padding = parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) || 0;
    const top = section.getBoundingClientRect().top + window.scrollY - margin - padding;
    return Math.max(0, Math.min(top, document.documentElement.scrollHeight - window.innerHeight));
  }

  function setCurrent(index) {
    if (index === currentIndex) return;
    currentIndex = index;
    links.forEach((link, i) => {
      if (i === index) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
      sections[i]?.classList.toggle('is-current', i === index);
    });

  }
  function updateCurrentSection() {
    scheduled = false;
    if (jumpTarget >= 0) {
      if (Math.abs(window.scrollY - destination(sections[jumpTarget])) > 4) return;
      clearJump();
    }
    const readingLine = Math.min(window.innerHeight * 0.3, 220);
    let current = 0;
    sections.forEach((section, index) => {
      if (section && section.getBoundingClientRect().top <= readingLine) current = index;
    });
    if (window.scrollY > 0 && window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 4) current = links.length - 1;
    setCurrent(current);
  }
  function scheduleUpdate() {
    if (scheduled) return;
    scheduled = true;
    window.requestAnimationFrame(updateCurrentSection);
  }
  links.forEach((link, index) => link.addEventListener('click', event => {
    if (event.defaultPrevented || event.button > 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || !sections[index]) return;
    clearJump();
    jumpTarget = index;
    setCurrent(index);
    // Keep the clicked destination selected while native smooth scrolling passes
    // intermediate sections. A bounded fallback covers interrupted browser scrolls.
    jumpTimeout = window.setTimeout(() => { clearJump(); scheduleUpdate(); }, 1800);
    scheduleUpdate();
  }));
  function resumeTracking() { clearJump(); scheduleUpdate(); }
  window.addEventListener('wheel', resumeTracking, { passive: true });
  window.addEventListener('touchstart', resumeTracking, { passive: true });
  window.addEventListener('keydown', event => {
    if (['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End', ' ', 'Escape', 'Tab'].includes(event.key)) resumeTracking();
  });
  window.addEventListener('popstate', () => {
    // Native hash navigation may emit popstate for the click we are handling.
    if (jumpTarget >= 0 && window.location.hash === links[jumpTarget].getAttribute('href')) return;
    resumeTracking();
  });
  window.addEventListener('pagehide', clearJump);
  window.addEventListener('pageshow', scheduleUpdate);
  window.addEventListener('scrollend', scheduleUpdate);
  window.addEventListener('scroll', scheduleUpdate, { passive: true });
  window.addEventListener('resize', scheduleUpdate);
  window.addEventListener('load', scheduleUpdate, { once: true });
  document.fonts.ready.then(scheduleUpdate);
  updateCurrentSection();
  document.querySelectorAll('details.abstract').forEach(details => {
    const summary = details.querySelector('summary');
    let desiredOpen = details.open;
    let animation = null;
    let contentAnimation = null;
    const label = summary.querySelector('.abstract-label');
    const paragraph = details.querySelector('p');
    details.dataset.expanded = String(desiredOpen);
    function settle() {
      if (animation) {
        animation.onfinish = null;
        animation.cancel();
        animation = null;
      }
      contentAnimation?.cancel();
      contentAnimation = null;
      details.open = desiredOpen;
      details.style.height = '';
      details.style.overflow = '';
      scheduleUpdate();
    }
    summary.addEventListener('click', event => {
      event.preventDefault();
      const startHeight = details.getBoundingClientRect().height;
      desiredOpen = !desiredOpen;
      details.dataset.expanded = String(desiredOpen);
      summary.setAttribute('aria-expanded', String(desiredOpen));
      if (label) label.textContent = desiredOpen ? 'Hide abstract' : 'Read abstract';
      details.closest('.research-item')?.classList.toggle('is-expanded', desiredOpen);
      if (animation) {
        animation.onfinish = null;
        animation.cancel();
      }
      if (!motionAllowed() || !details.animate) { settle(); return; }
      details.style.height = '';
      details.open = true;
      const border = parseFloat(getComputedStyle(details).borderTopWidth) + parseFloat(getComputedStyle(details).borderBottomWidth);
      const padding = parseFloat(getComputedStyle(details).paddingTop) + parseFloat(getComputedStyle(details).paddingBottom);
      const summaryMargin = parseFloat(getComputedStyle(summary).marginTop) + parseFloat(getComputedStyle(summary).marginBottom);
      const endHeight = desiredOpen ? details.getBoundingClientRect().height : summary.offsetHeight + summaryMargin + border + padding;
      details.style.overflow = 'hidden';
      details.style.height = `${startHeight}px`;
      contentAnimation?.cancel();
      if (desiredOpen && paragraph) contentAnimation = paragraph.animate([
        { opacity: 0, transform: 'translateY(7px)' },
        { opacity: 1, transform: 'translateY(0)' }
      ], { duration: 340, delay: 45, fill: 'backwards', easing: 'cubic-bezier(.16,1,.3,1)' });
      const heights = desiredOpen
        ? [{ height: `${startHeight}px` }, { height: `${endHeight + 3}px`, offset: .8 }, { height: `${endHeight}px` }]
        : [{ height: `${startHeight}px` }, { height: `${endHeight}px` }];
      animation = details.animate(heights, { duration: desiredOpen ? 480 : 320, easing: 'cubic-bezier(.16,1,.3,1)', fill: 'forwards' });
      animation.onfinish = settle;
    });
    window.addEventListener('resize', settle);
    reducedMotion.addEventListener('change', settle);
    new MutationObserver(() => { if (!motionAllowed()) settle(); }).observe(document.body, { attributes: true, attributeFilter: ['data-motion'] });
  });
})();
