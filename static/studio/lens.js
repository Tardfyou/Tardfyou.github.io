/* A rounded lens distorts the backdrop only. Foreground text remains untouched. */
(() => {
  // WebKit accepts url() syntactically but does not render SVG backdrop filters.
  // Its CSS fallback keeps the same clear material, without the displacement.
  if (!/Chrome\//.test(navigator.userAgent) || !CSS.supports('backdrop-filter', 'url("#studio-lens")')) return;
  const ns = 'http://www.w3.org/2000/svg';
  const make = (name, attributes) => {
    const node = document.createElementNS(ns, name);
    Object.entries(attributes).forEach(([key, value]) => node.setAttribute(key, value));
    return node;
  };
  const svg = make('svg', { width: 0, height: 0, 'aria-hidden': 'true', focusable: 'false' });
  svg.style.cssText = 'position:absolute;pointer-events:none;overflow:hidden';
  const defs = make('defs', {}); svg.append(defs); document.body.append(svg);
  const surfaces = new Map();
  const selector = '[data-lens], .academic-topbar, .profile nav, #header-desktop .header-wrapper, #header-mobile .header-container, .studio-switch, .academic-site .paper-badge, .academic-site .paper-actions a, .academic-site .interests > span, .academic-site .abstract-icon';

  document.querySelectorAll(selector).forEach((element, index) => {
    const id = `studio-lens-${index}`;
    const filter = make('filter', { id, x: 0, y: 0, width: '100%', height: '100%', 'color-interpolation-filters': 'sRGB' });
    const map = make('feImage', { x: 0, y: 0, width: '100%', height: '100%', preserveAspectRatio: 'none', result: 'lens-map' });
    const displacement = make('feDisplacementMap', { in: 'SourceGraphic', in2: 'lens-map', xChannelSelector: 'R', yChannelSelector: 'G' });
    filter.append(map, displacement); defs.append(filter);
    surfaces.set(element, { id, map, displacement, geometry: '' });
  });

  // Snell-law bezel profile adapted from DevSam7t3/liquid-glass (MIT).
  // See THIRD_PARTY_NOTICES.md and licenses/devsam-liquid-glass-MIT.txt.
  // Normalized units share one lookup table across all lens sizes.
  const refractionProfile = (() => {
    const samples = 128, eta = 1 / 1.5, thickness = .6;
    const surface = x => Math.sqrt(Math.max(0, 1 - (1 - x) ** 2));
    const profile = new Float32Array(samples + 1);
    let maximum = 0;
    for (let i = 0; i < samples; i++) {
      const x = i / samples, height = surface(x);
      const slope = (surface(Math.min(1, x + .0001)) - height) / .0001;
      const normalLength = Math.hypot(slope, 1);
      const nx = -slope / normalLength, ny = -1 / normalLength;
      const k = 1 - eta * eta * (1 - ny * ny);
      const ray = eta * ny + Math.sqrt(Math.max(0, k));
      const rx = -ray * nx, ry = eta - ray * ny;
      profile[i] = Math.max(0, rx * (height + thickness) / ry);
      maximum = Math.max(maximum, profile[i]);
    }
    for (let i = 0; i < samples; i++) profile[i] /= maximum || 1;
    return profile;
  })();
  const bezelBend = (t, edgeWidth) => {
    const position = t * (refractionProfile.length - 1);
    const index = Math.min(Math.floor(position), refractionProfile.length - 2);
    const mix = position - index;
    const refraction = refractionProfile[index] * (1 - mix) + refractionProfile[index + 1] * mix;
    // A subpixel shoulder joins the unfiltered exterior without a hard seam.
    const edge = Math.min(1, t / edgeWidth);
    return refraction * edge * edge * (3 - 2 * edge);
  };

  const update = element => {
    const state = surfaces.get(element);
    const width = element.offsetWidth, height = element.offsetHeight;
    if (!width || !height) return;
    const radius = Math.min(parseFloat(getComputedStyle(element).borderTopLeftRadius) || 0, width / 2, height / 2);
    const geometry = `${width}:${height}:${radius}`;
    if (geometry === state.geometry) return;
    state.geometry = geometry;
    state.width = width; state.height = height; state.radius = radius;
    const compact = element.matches('[data-lens=chip], [data-lens=control], .paper-badge, .paper-actions a, .interests > span, .abstract-icon, .studio-switch');
    const depth = Math.min(compact ? 8 : 18, height * .28);
    const edgeWidth = Math.min(.18, .75 / depth);
    const strength = compact ? 3.2 : element.dataset.lens === 'window' ? 8 : 10;
    // Cache a small normal map at layout changes, never at scroll/pointer rate.
    const resolution = Math.min(1, Math.sqrt(100000 / (width * height)));
    const canvas = document.createElement('canvas');
    canvas.width = Math.ceil(width * resolution); canvas.height = Math.ceil(height * resolution);
    const context = canvas.getContext('2d');
    if (!context) return;
    const pixels = context.createImageData(canvas.width, canvas.height);
    for (let y = 0; y < canvas.height; y++) {
      for (let x = 0; x < canvas.width; x++) {
        const px = (x + .5) / canvas.width * width - width / 2;
        const py = (y + .5) / canvas.height * height - height / 2;
        const qx = Math.abs(px) - (width / 2 - radius);
        const qy = Math.abs(py) - (height / 2 - radius);
        const ox = Math.max(qx, 0), oy = Math.max(qy, 0);
        const length = Math.hypot(ox, oy);
        const inside = radius - length - Math.min(Math.max(qx, qy), 0);
        let nx = length ? ox / length : +(qx > qy);
        let ny = length ? oy / length : +(qy >= qx);
        nx *= Math.sign(px); ny *= Math.sign(py);
        // The center is clear; curvature is concentrated in the rounded bevel.
        const t = Math.max(0, Math.min(1, inside / depth));
        const bend = inside > 0 && inside < depth ? bezelBend(t, edgeWidth) : 0;
        const i = (y * canvas.width + x) * 4;
        pixels.data[i] = Math.round(128 - nx * bend * 120);
        pixels.data[i + 1] = Math.round(128 - ny * bend * 120);
        pixels.data[i + 2] = 128; pixels.data[i + 3] = 255;
      }
    }
    context.putImageData(pixels, 0, 0);
    // Percentages resolve against the 0-sized SVG host in Chromium. Use the
    // target's CSS pixels so the map bends the rim instead of shifting the pane.
    state.map.setAttribute('width', width);
    state.map.setAttribute('height', height);
    state.map.setAttribute('href', canvas.toDataURL());
    state.strength = strength * 2;
    state.displacement.setAttribute('scale', state.strength);
    element.style.setProperty('--lens-filter', `url("#${state.id}") blur(.55px) saturate(1.12)`);
    element.classList.add('lens-ready');
  };
  surfaces.forEach((_, element) => update(element));
  if ('ResizeObserver' in window) {
    let timer = 0;
    const changed = new Set();
    const observer = new ResizeObserver(entries => {
      entries.forEach(entry => changed.add(entry.target));
      clearTimeout(timer);
      timer = setTimeout(() => { changed.forEach(update); changed.clear(); }, 100);
    });
    surfaces.forEach((_, element) => observer.observe(element));
    addEventListener('pagehide', () => { clearTimeout(timer); changed.clear(); });
    addEventListener('pageshow', () => surfaces.forEach((_, element) => update(element)));
  }

  // Surface tension belongs to the decorative rim, never the text or hit box.
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const reduceTransparency = matchMedia('(prefers-reduced-transparency: reduce)');
  const highContrast = matchMedia('(prefers-contrast: more)');
  const finePointer = matchMedia('(hover: hover) and (pointer: fine)');
  const liquidAllowed = () => !reduceMotion.matches && !reduceTransparency.matches && !highContrast.matches && document.body.dataset.motion !== 'off';
  const cancelRims = new Set();
  const stopRims = () => cancelRims.forEach(stop => stop());
  [reduceMotion, reduceTransparency, highContrast, finePointer].forEach(query => query.addEventListener('change', stopRims));
  new MutationObserver(() => { if (!liquidAllowed()) stopRims(); }).observe(document.body, { attributes: true, attributeFilter: ['data-motion'] });
  addEventListener('pagehide', stopRims); addEventListener('resize', stopRims);

  surfaces.forEach((state, element) => {
    if (!element.matches('.academic-topbar, #header-desktop .header-wrapper, .profile nav, .studio-switch, .paper-badge, .paper-actions a, [data-lens=chip], [data-lens=control], a[data-lens=tile]')) return;
    const rim = make('svg', { class: 'liquid-rim', 'aria-hidden': 'true', focusable: 'false', preserveAspectRatio: 'none' });
    const gradient = make('radialGradient', { id: `${state.id}-light`, gradientUnits: 'userSpaceOnUse', r: 100 });
    [[0,'#fff',.98],[.32,'#edf5ff',.9],[.7,'#9eb6d2',.55],[1,'#bdcfe2',.28]].forEach(([offset,color,opacity]) => gradient.append(make('stop', { offset, 'stop-color': color, 'stop-opacity': opacity })));
    const rimDefs = make('defs', {}); rimDefs.append(gradient);
    const path = make('path', { fill: 'none', stroke: `url(#${state.id}-light)`, 'stroke-width': 1.25, 'vector-effect': 'non-scaling-stroke' });
    const shade = make('path', { fill: 'none', stroke: 'rgba(85,119,160,.22)', 'stroke-width': 1.4, transform: 'translate(0 .45)', 'vector-effect': 'non-scaling-stroke' });
    rim.append(rimDefs, shade, path); element.append(rim); element.classList.add('liquid-surface');
    let points = [], perimeter = 0, geometry = '', frame = 0, previousTime = 0;
    let center = 0, targetCenter = 0, height = 0, targetHeight = 0, speed = 0, pressed = false;
    let lastPointer = null, spread = 42;
    const borderColor = element.style.borderColor;

    const prepare = () => {
      if (geometry === state.geometry) return;
      geometry = state.geometry;
      const width = state.width, height = state.height;
      if (!width || !height) return;
      rim.setAttribute('viewBox', `0 0 ${width} ${height}`);
      const inset = .65, right = width - inset, bottom = height - inset;
      const radius = Math.max(1, state.radius - inset);
      const horizontal = Math.max(0, width - 2 * inset - 2 * radius);
      const vertical = Math.max(0, height - 2 * inset - 2 * radius);
      const arc = Math.PI * radius / 2;
      const lengths = [horizontal, arc, vertical, arc, horizontal, arc, vertical, arc];
      perimeter = lengths.reduce((sum, length) => sum + length, 0);
      const count = Math.max(48, Math.min(240, Math.ceil(perimeter / 10)));
      points = Array.from({ length: count }, (_, index) => {
        const distance = index / count * perimeter;
        let t = distance, segment = 0;
        while (segment < 7 && t > lengths[segment]) t -= lengths[segment++];
        if (segment === 0) return { x: inset + radius + t, y: inset, nx: 0, ny: -1, distance };
        if (segment === 2) return { x: right, y: inset + radius + t, nx: 1, ny: 0, distance };
        if (segment === 4) return { x: right - radius - t, y: bottom, nx: 0, ny: 1, distance };
        if (segment === 6) return { x: inset, y: bottom - radius - t, nx: -1, ny: 0, distance };
        const corner = (segment - 1) / 2;
        const angle = -Math.PI / 2 + corner * Math.PI / 2 + t / radius;
        const cx = corner < 2 ? right - radius : inset + radius;
        const cy = corner === 0 || corner === 3 ? inset + radius : bottom - radius;
        return { x: cx + Math.cos(angle) * radius, y: cy + Math.sin(angle) * radius, nx: Math.cos(angle), ny: Math.sin(angle), distance };
      });
    };
    const paint = () => {
      let lightPoint = points[0], lightDistance = Infinity;
      const vertices = points.map(point => {
        const gap = Math.abs(point.distance - center) % perimeter;
        const distance = Math.min(gap, perimeter - gap);
        if (distance < lightDistance) { lightPoint = point; lightDistance = distance; }
        const wave = Math.exp(-distance * distance / (2 * spread * spread)) - .15 * Math.exp(-distance * distance / (5 * spread * spread));
        return [point.x + point.nx * height * wave, point.y + point.ny * height * wave];
      });
      const midpoint = (a, b) => `${((a[0] + b[0]) / 2).toFixed(2)} ${((a[1] + b[1]) / 2).toFixed(2)}`;
      let curve = `M ${midpoint(vertices.at(-1), vertices[0])}`;
      vertices.forEach((point, index) => { curve += ` Q ${point[0].toFixed(2)} ${point[1].toFixed(2)} ${midpoint(point, vertices[(index + 1) % vertices.length])}`; });
      path.setAttribute('d', `${curve} Z`); shade.setAttribute('d', `${curve} Z`);
      gradient.setAttribute('cx', lightPoint.x); gradient.setAttribute('cy', lightPoint.y); gradient.setAttribute('r', spread * 2.5);
      rim.style.opacity = Math.min(.95, Math.abs(height) * .55 + Math.min(.25, Math.abs(speed) * .008));
      // The edge's optical depth responds to pressure without rebuilding its map.
      state.displacement.setAttribute('scale', (state.strength * (1 + height * .025)).toFixed(3));
    };
    const clear = () => {
      cancelAnimationFrame(frame); frame = 0; previousTime = 0; height = 0; targetHeight = 0; speed = 0; pressed = false; lastPointer = null;
      rim.style.opacity = '0'; element.style.borderColor = borderColor;
      element.classList.remove('is-liquid-active');
      if (state.strength) state.displacement.setAttribute('scale', state.strength);
    };
    cancelRims.add(clear);
    const tick = now => {
      if (!liquidAllowed() || !points.length) { clear(); return; }
      const dt = Math.min((now - (previousTime || now - 16)) / 1000, .025); previousTime = now;
      let gap = targetCenter - center;
      if (Math.abs(gap) > perimeter / 2) gap -= Math.sign(gap) * perimeter;
      center = (center + gap * Math.min(1, dt * 20) + perimeter) % perimeter;
      speed += ((targetHeight - height) * 240 - speed * 21) * dt;
      height += speed * dt; paint();
      if (Math.abs(targetHeight - height) < .012 && Math.abs(speed) < .025 && Math.abs(gap) < .1) {
        frame = 0; previousTime = 0;
        if (!targetHeight) clear();
      } else frame = requestAnimationFrame(tick);
    };
    const wake = () => { if (!frame) frame = requestAnimationFrame(tick); };
    const pointAt = event => {
      prepare(); if (!points.length) return;
      const bounds = element.getBoundingClientRect();
      const x = (event.clientX - bounds.left) * state.width / bounds.width;
      const y = (event.clientY - bounds.top) * state.height / bounds.height;
      let nearest = points[0], distance = Infinity;
      points.forEach(point => { const d = Math.hypot(point.x - x, point.y - y); if (d < distance) { nearest = point; distance = d; } });
      const now = performance.now();
      const pointerSpeed = lastPointer ? Math.min(1, Math.hypot(x-lastPointer.x,y-lastPointer.y) / Math.max(16,now-lastPointer.time)) : 0;
      lastPointer = { x, y, time: now };
      if (!element.classList.contains('is-liquid-active')) center = nearest.distance;
      targetCenter = nearest.distance;
      const reach = Math.max(0, 1 - distance / 42);
      const compact = state.height < 48;
      targetHeight = (pressed ? (compact ? 2.4 : 3.7) : reach * (compact ? 1.7 : 2.8)) + reach * pointerSpeed * .7;
      spread = Math.min(64, Math.max(24, state.height * .55)) + pointerSpeed * 12;
      if (targetHeight > .08) { element.classList.add('is-liquid-active'); element.style.borderColor = 'transparent'; }
      wake();
    };
    element.addEventListener('pointermove', event => {
      if (liquidAllowed() && finePointer.matches && event.pointerType !== 'touch' && event.target.closest('.liquid-surface') === element) pointAt(event);
    }, { passive: true });
    element.addEventListener('pointerdown', event => {
      if (!liquidAllowed() || event.button !== 0 || event.target.closest('.liquid-surface') !== element) return;
      pressed = true; pointAt(event);
      // A quick tap can begin and end before the next frame; retain its impulse.
      speed = Math.min(36, speed + 26);
    }, { passive: true });
    const release = () => { pressed = false; targetHeight = 0; lastPointer = null; if (points.length && height) wake(); };
    ['pointerleave','pointerup','pointercancel','blur'].forEach(type => element.addEventListener(type, release));
  });
})();
