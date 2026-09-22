/* Native links and visible content first; motion is a progressive enhancement. */
(() => {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = matchMedia('(hover: hover) and (pointer: fine)');
  const motionAllowed = () => !reduced.matches && document.body.dataset.motion !== 'off';
  const activeAnimations = new Set();
  const resetters = new Set();
  const animate = (node, frames, options) => {
    if (!motionAllowed() || !node.animate) return null;
    const animation = node.animate(frames, options);
    activeAnimations.add(animation);
    animation.finished.then(() => activeAnimations.delete(animation), () => activeAnimations.delete(animation));
    return animation;
  };
  const reset = () => {
    activeAnimations.forEach(animation => animation.cancel()); activeAnimations.clear();
    resetters.forEach(stop => stop());
  };
  reduced.addEventListener('change', () => { if (!motionAllowed()) reset(); });
  new MutationObserver(() => { if (!motionAllowed()) reset(); }).observe(document.body, { attributes: true, attributeFilter: ['data-motion'] });
  addEventListener('pagehide', reset);

  if ('IntersectionObserver' in window) {
    // Observe individual reading blocks, not their section containers. Using the
    // independent translate property lets a hover transform keep working mid-entry.
    const revealSelectors = [
      '[data-reveal]', '.section-heading', '.about > p', '.interests > span',
      '.profile-identity', '.profile .institution', '.profile .contact-links',
      '.research-item > .item-meta', '.research-item > h3', '.research-item > p',
      '.research-item > .paper-actions', '.research-item > .abstract',
      '.experience', '.education', '.honors > li',
      '.home-salon > a', '.home .summary > *',
      '.home-profile > .home-avatar', '.home-profile > .home-title',
      '.home-profile > .home-subtitle', '.home-profile > .links',
      '.archive .single-title', '.archive .group-title', '.archive-item', '.categories-card .card-item',
      '.page.single:not(.summary) > .single-title',
      '#content > h2', '#content > h3', '#content > h4', '#content > p',
      '#content > blockquote', '#content > figure', '#content > table',
      '#content > .code-block', '#content > .highlight', '#content > pre',
      '#content > ul > li', '#content > ol > li',
      '.about-links > a', '.guestbook-links > *', '.music-track'
    ];
    let firstBatch = true;
    const observer = new IntersectionObserver(entries => {
      let order = 0;
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        observer.unobserve(entry.target);
        entry.target.dataset.revealState = 'seen';
        const isText = entry.target.matches('p, h2, h3, h4, .section-heading');
        const immediatelyReadable = firstBatch || entry.boundingClientRect.top < innerHeight * .42;
        const frames = [
          { opacity: immediatelyReadable ? 1 : .65, translate: `0 ${immediatelyReadable ? 6 : isText ? 9 : 12}px` },
          { opacity: 1, translate: '0 0' }
        ];
        if (!immediatelyReadable && document.body.classList.contains('academic-site')) frames.splice(1, 0, { opacity: 1, translate: '0 -.6px', offset: .8 });
        animate(entry.target, frames, { duration: immediatelyReadable ? 430 : isText ? 510 : 590, delay: Math.min(order++, 3) * 28, fill: 'backwards', easing: 'cubic-bezier(.16,1,.3,1)' });
      });
      firstBatch = false;
    }, { threshold: .04, rootMargin: '0px 0px -24px 0px' });
    const candidates = [...document.querySelectorAll(revealSelectors.join(','))];
    const candidateSet = new Set(candidates);
    candidates.forEach(node => {
      // Prevent compound motion on nested archive rows or custom reveal groups.
      let parent = node.parentElement;
      while (parent && !candidateSet.has(parent)) parent = parent.parentElement;
      if (parent) return;
      node.classList.add('content-motion');
      node.dataset.revealState = 'pending';
      observer.observe(node);
    });
  }

  // Retargetable position and shape springs give the glass a following tail.
  // Only this decorative layer deforms; link text and hit areas stay still.
  document.querySelectorAll('[data-sliding-nav], #header-desktop .menu-inner, .site-switch, .studio-switch').forEach(nav => {
    const links = [...nav.querySelectorAll(':scope > a[href]:not([href^="javascript"]):not(.theme-switch):not(.language-switcher)')];
    if (!links.length) return;
    const indicator = document.createElement('span');
    indicator.className = 'nav-indicator'; indicator.setAttribute('aria-hidden', 'true');
    nav.append(indicator); nav.classList.add('sliding-nav');
    let current = null, target = null, velocity = [0, 0, 0, 0];
    let frame = 0, time = 0, hover = null, axis = 0, strain = 0, strainVelocity = 0;
    let bounds = [nav.clientWidth, nav.clientHeight];
    const clamp = (n, min, max) => Math.min(Math.max(n, min), Math.max(min, max));
    const paint = () => {
      const stretch = 1 + clamp(strain, -.035, .20);
      // Conserving area keeps a moving capsule liquid instead of inflating it.
      const width = Math.min(bounds[0], Math.max(1, current[2] * (axis === 0 ? stretch : 1 / stretch)));
      const height = Math.min(bounds[1], Math.max(1, current[3] * (axis === 1 ? stretch : 1 / stretch)));
      const speed = velocity[axis] + velocity[axis + 2] / 2;
      const tail = clamp(speed * .004, -current[axis + 2] * .045, current[axis + 2] * .045);
      const x = clamp(current[0] + (current[2] - width) / 2 - (axis === 0 ? tail : 0), 0, bounds[0] - width);
      const y = clamp(current[1] + (current[3] - height) / 2 - (axis === 1 ? tail : 0), 0, bounds[1] - height);
      indicator.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      indicator.style.width = `${width}px`;
      indicator.style.height = `${height}px`;
      const light = clamp(speed / 20, -34, 34);
      indicator.style.setProperty('--nav-flow-x', `${50 + (axis === 0 ? light : 0)}%`);
      indicator.style.setProperty('--nav-flow-y', `${50 + (axis === 1 ? light : -28)}%`);
      indicator.style.setProperty('--nav-flow-light', `${Math.min(.72, .16 + Math.abs(strain) * 2.8)}`);
    };
    const stop = () => {
      cancelAnimationFrame(frame); frame = 0; time = 0; velocity.fill(0);
      strain = 0; strainVelocity = 0;
      if (target) { current = [...target]; paint(); }
      nav.classList.remove('is-travelling');
    };
    resetters.add(stop);
    const tick = now => {
      const dt = Math.min((now - (time || now - 16)) / 1000, .025); time = now;
      let resting = true;
      for (let i = 0; i < 4; i++) {
        velocity[i] += ((target[i] - current[i]) * 370 - velocity[i] * 31) * dt;
        current[i] += velocity[i] * dt;
        if (Math.abs(target[i] - current[i]) > .06 || Math.abs(velocity[i]) > .06) resting = false;
      }
      const speed = Math.abs(velocity[axis] + velocity[axis + 2] / 2);
      const desiredStrain = .18 * Math.tanh(speed / 420);
      strainVelocity += ((desiredStrain - strain) * 260 - strainVelocity * 20) * dt;
      strain += strainVelocity * dt;
      if (Math.abs(strain) > .0003 || Math.abs(strainVelocity) > .003) resting = false;
      paint();
      if (resting || !motionAllowed()) stop();
      else frame = requestAnimationFrame(tick);
    };
    const move = link => {
      if (!link || !link.offsetWidth) { stop(); indicator.style.opacity = '0'; return; }
      bounds = [nav.clientWidth, nav.clientHeight];
      const first = links[0], last = links[links.length - 1];
      const nextAxis = Math.abs(last.offsetTop - first.offsetTop) > Math.abs(last.offsetLeft - first.offsetLeft) ? 1 : 0;
      const changedAxis = nextAxis !== axis; axis = nextAxis;
      target = [link.offsetLeft, link.offsetTop, link.offsetWidth, link.offsetHeight];
      indicator.style.opacity = '1';
      if (!current || !motionAllowed() || changedAxis) { stop(); return; }
      if (target.every((n, i) => Math.abs(n - current[i]) < .05)) return;
      nav.classList.add('is-travelling');
      if (!frame) frame = requestAnimationFrame(tick);
    };
    const selected = () => links.find(link => link.hasAttribute('aria-current') || link.classList.contains('active') || link.classList.contains('selected'));
    const restore = () => move(hover || (links.includes(document.activeElement) ? document.activeElement : selected()));
    links.forEach(link => {
      link.addEventListener('pointerenter', event => { if (event.pointerType !== 'touch') { hover = link; move(link); } });
      link.addEventListener('focus', () => move(link));
      link.addEventListener('click', () => {
        hover = null; move(link);
        const icon = link.querySelector('.nav-icon');
        if (icon) animate(icon, [{ scale: '1' }, { scale: '1.17', offset: .36 }, { scale: '1' }], { duration: 410, easing: 'cubic-bezier(.22,1,.36,1)' });
      });
    });
    nav.addEventListener('pointerleave', () => { hover = null; restore(); });
    nav.addEventListener('focusout', event => { if (!nav.contains(event.relatedTarget)) move(selected()); });
    new MutationObserver(restore).observe(nav, { subtree: true, attributes: true, attributeFilter: ['aria-current'] });
    if ('ResizeObserver' in window) {
      const resize = new ResizeObserver(restore); resize.observe(nav); links.forEach(link => resize.observe(link));
    }
    document.fonts?.ready.then(restore); restore();
  });

  // Track light only during interaction. There is no idle pointer animation loop.
  document.querySelectorAll('[data-lens]:not([data-lens=window]), .academic-topbar, #header-desktop .header-wrapper, #header-mobile .header-container, .profile nav, .studio-switch, .academic-site .portrait, .academic-site .paper-actions a, .academic-site .abstract-icon, .academic-site .paper-badge, .academic-site .interests > span').forEach(surface => {
    surface.classList.add('glass-surface');
    const sheen = document.createElement('i');
    sheen.className = 'glass-sheen'; sheen.setAttribute('aria-hidden', 'true'); surface.append(sheen);
    let frame = 0, point = null;
    const clear = () => { cancelAnimationFrame(frame); frame = 0; surface.classList.remove('is-illuminated'); };
    resetters.add(clear);
    surface.addEventListener('pointermove', event => {
      if (!motionAllowed() || !finePointer.matches || event.pointerType === 'touch') return;
      point = [event.clientX, event.clientY];
      if (frame) return;
      frame = requestAnimationFrame(() => {
        const bounds = surface.getBoundingClientRect();
        surface.style.setProperty('--light-x', `${point[0] - bounds.left}px`);
        surface.style.setProperty('--light-y', `${point[1] - bounds.top}px`);
        surface.classList.add('is-illuminated'); frame = 0;
      });
    }, { passive: true });
    surface.addEventListener('pointerleave', clear);
  });

  // Only small, existing action controls follow the pointer. Reading text stays put.
  document.querySelectorAll('.academic-site .paper-actions a, .academic-site .profile-links a').forEach(control => {
    let bounds = null, frame = 0, point = null;
    const clear = () => {
      cancelAnimationFrame(frame); frame = 0; bounds = null;
      control.style.removeProperty('translate');
    };
    resetters.add(clear);
    control.addEventListener('pointerenter', event => {
      if (motionAllowed() && finePointer.matches && event.pointerType !== 'touch') bounds = control.getBoundingClientRect();
    });
    control.addEventListener('pointermove', event => {
      if (!bounds || !motionAllowed() || !finePointer.matches || event.pointerType === 'touch') return;
      point = [event.clientX, event.clientY];
      if (frame) return;
      frame = requestAnimationFrame(() => {
        const x = Math.max(-2, Math.min(2, (point[0] - bounds.left - bounds.width / 2) / bounds.width * 4));
        const y = Math.max(-1.5, Math.min(1.5, (point[1] - bounds.top - bounds.height / 2) / bounds.height * 3));
        control.style.translate = `${x}px ${y}px`; frame = 0;
      });
    }, { passive: true });
    ['pointerleave', 'pointercancel', 'blur'].forEach(event => control.addEventListener(event, clear));
    finePointer.addEventListener('change', clear);
  });

  // Independent scale avoids fighting hover transforms and navigation geometry.
  document.querySelectorAll('.profile nav a, .site-switch a, .studio-switch a, .profile-links a, .paper-actions a, .home-salon > a, .abstract summary, .theme-switch, .petal-toggle, #menu-toggle-mobile, a[data-lens=chip], a[data-lens=control]').forEach(control => {
    let animation = null, pressed = false;
    const feedback = control.matches('.abstract summary') ? control.querySelector('.abstract-icon') || control : control;
    const scale = () => getComputedStyle(feedback).scale === 'none' ? '1' : getComputedStyle(feedback).scale;
    const cancel = () => { animation?.cancel(); animation = null; pressed = false; };
    resetters.add(cancel);
    const press = () => {
      if (!motionAllowed() || pressed) return;
      const start = scale(); animation?.cancel(); pressed = true;
      animation = animate(feedback, [{ scale: start }, { scale: feedback === control ? '.966' : '.92' }], { duration: 125, fill: 'forwards', easing: 'cubic-bezier(.2,.8,.2,1)' });
    };
    const release = () => {
      if (!pressed) return;
      const start = scale(); animation?.cancel(); pressed = false;
      animation = animate(feedback, [{ scale: start }, { scale: '1.015', offset: .44 }, { scale: '1' }], { duration: 390, easing: 'cubic-bezier(.22,1,.36,1)' });
    };
    control.addEventListener('pointerdown', event => { if (event.button === 0) press(); });
    ['pointerup', 'pointercancel', 'pointerleave', 'blur'].forEach(event => control.addEventListener(event, release));
    control.addEventListener('keydown', event => { if (!event.repeat && ['Enter', ' '].includes(event.key)) press(); });
    control.addEventListener('keyup', release);
  });

  const progress = document.querySelector('.reading-progress');
  const timeline = document.querySelector('.academic-site .experience-list');
  let frame = 0, lastY = scrollY, directionDistance = 0, previousDirection = 0;
  const update = () => {
    frame = 0;
    const distance = document.documentElement.scrollHeight - innerHeight;
    if (progress) progress.style.transform = `scaleX(${distance > 0 ? Math.min(1, Math.max(0, scrollY / distance)) : 0})`;
    if (timeline) {
      const bounds = timeline.getBoundingClientRect();
      timeline.style.setProperty('--timeline-progress', Math.max(0, Math.min(1, (innerHeight * .7 - bounds.top) / Math.max(bounds.height, 1))));
    }
    document.body.classList.toggle('is-scrolled', scrollY > 24);
    const delta = scrollY - lastY;
    const direction = Math.sign(delta);
    if (direction && direction !== previousDirection) directionDistance = 0;
    directionDistance += Math.abs(delta);
    if (direction) previousDirection = direction;
    if (scrollY < 260 || (direction < 0 && directionDistance > 16)) document.body.classList.remove('is-reading');
    else if (direction > 0 && directionDistance > 28) document.body.classList.add('is-reading');
    lastY = scrollY;
  };
  const schedule = () => { if (!frame) frame = requestAnimationFrame(update); };
  addEventListener('scroll', schedule, { passive: true });
  addEventListener('resize', schedule); addEventListener('load', schedule);
  if ('ResizeObserver' in window) new ResizeObserver(schedule).observe(document.body);
  update();

  addEventListener('keydown', event => {
    const search = document.querySelector('#header-desktop.open');
    if (event.key === 'Escape' && search) {
      document.querySelector('#mask')?.click();
      document.querySelector('#search-toggle-desktop')?.focus();
    }
  });

  // Preserve the theme's menu behavior; animate its presentation and add Escape.
  const menu = document.querySelector('#menu-toggle-mobile');
  const menuPanel = document.querySelector('#menu-mobile');
  if (menu && menuPanel) {
    menu.setAttribute('role', 'button'); menu.tabIndex = 0;
    menu.setAttribute('aria-label', 'Toggle navigation');
    menu.setAttribute('aria-controls', 'menu-mobile');
    let wasOpen = false;
    const sync = () => {
      const open = menu.classList.contains('active');
      menu.setAttribute('aria-expanded', String(open));
      if (open && !wasOpen) {
        animate(menuPanel, [{ opacity: 0, transform: 'translateY(-7px) scale(.975)' }, { opacity: 1, transform: 'none' }], { duration: 360, easing: 'cubic-bezier(.16,1,.3,1)' });
        menuPanel.querySelectorAll('a.menu-item').forEach((item, index) => animate(item, [{ opacity: 0, transform: 'translateY(-5px)' }, { opacity: 1, transform: 'none' }], { duration: 300, delay: Math.min(index, 5) * 24, easing: 'ease-out' }));
      }
      wasOpen = open;
    };
    new MutationObserver(sync).observe(menu, { attributes: true, attributeFilter: ['class'] }); sync();
    menu.addEventListener('keydown', event => { if (['Enter', ' '].includes(event.key)) { event.preventDefault(); menu.click(); } });
    addEventListener('keydown', event => {
      if (event.key === 'Escape' && menu.classList.contains('active')) { menu.click(); menu.focus(); }
    });
  }
})();
