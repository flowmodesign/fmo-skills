/** Pass this self-contained function to a browser's init-script API BEFORE
 * navigation. Sampling only: no page styles, loaders or renderers are changed. */
export function installPerformanceProbe() {
  if (window.__f0PerformanceProbe) return;
  const observers = [], supported = {}, tasks = [], shifts = [], frames = [], errors = [];
  let lcp = null, cls = 0, session = 0, firstShift = null, lastShift = null, previousFrame = 0, raf = 0, stopped = false;
  const owner = node => node?.closest?.('[data-f0-id]')?.getAttribute('data-f0-id') ?? null;
  const describe = node => node ? { tag: node.tagName, owner: owner(node), className: String(node.className ?? '').slice(0, 160) } : null;
  function observe(type, callback) {
    try {
      if (!PerformanceObserver.supportedEntryTypes?.includes(type)) { supported[type] = false; return; }
      const observer = new PerformanceObserver(list => callback(list.getEntries()));
      observer.observe({ type, buffered: true }); observers.push({ observer, callback }); supported[type] = true;
    } catch { supported[type] = false; }
  }
  observe('largest-contentful-paint', entries => {
    for (const entry of entries) lcp = { at: entry.startTime, size: entry.size, url: entry.url, element: describe(entry.element) };
  });
  observe('layout-shift', entries => {
    for (const entry of entries) {
      if (entry.hadRecentInput) continue;
      if (lastShift === null || entry.startTime - lastShift > 1000 || entry.startTime - firstShift > 5000) { session = 0; firstShift = entry.startTime; }
      lastShift = entry.startTime; session += entry.value; cls = Math.max(cls, session);
      if (shifts.length < 200) shifts.push({ at: entry.startTime, value: entry.value, elements: (entry.sources ?? []).map(source => describe(source.node)) });
    }
  });
  observe('longtask', entries => {
    for (const entry of entries) if (tasks.length < 500) tasks.push({ at: entry.startTime, duration: entry.duration });
  });
  const onError = event => { if (errors.length < 100) errors.push(String(event.message ?? event.reason ?? 'Resource failure')); };
  window.addEventListener('error', onError); window.addEventListener('unhandledrejection', onError);
  function tick(at) {
    if (stopped) return;
    if (!document.hidden && previousFrame && frames.length < 1200) frames.push(at - previousFrame);
    previousFrame = document.hidden ? 0 : at; raf = requestAnimationFrame(tick);
  }
  raf = requestAnimationFrame(tick);
  function visible(node) {
    if (document.hidden) return false;
    const box = node.getBoundingClientRect();
    if (!box.width || !box.height || box.bottom <= 0 || box.top >= innerHeight || box.right <= 0 || box.left >= innerWidth) return false;
    for (let parent = node; parent; parent = parent.parentElement) {
      const style = getComputedStyle(parent);
      if (style.display === 'none' || style.visibility === 'hidden' || style.visibility === 'collapse'
        || Number(style.opacity) === 0 || style.contentVisibility === 'hidden') return false;
    }
    return true;
  }
  const drain = () => { for (const { observer, callback } of observers) callback(observer.takeRecords()); };
  window.__f0PerformanceProbe = {
    snapshot() {
      drain();
      return {
        at: performance.now(), url: location.href, viewport: { width: innerWidth, height: innerHeight },
        reducedMotion: matchMedia('(prefers-reduced-motion: reduce)').matches, documentHidden: document.hidden,
        supported, lcp, cls, shifts: shifts.slice(), longTasks: tasks.slice(), frameIntervalsMs: frames.slice(), errors: errors.slice(),
        resources: performance.getEntriesByType('resource').slice(0, 2000).map(entry => ({
          url: entry.name, at: entry.startTime, duration: entry.duration, initiator: entry.initiatorType, transferSize: entry.transferSize,
        })),
        canvases: [...document.querySelectorAll('canvas')].map(node => ({ owner: owner(node), width: node.width, height: node.height, visible: visible(node) })),
        videos: [...document.querySelectorAll('video')].map(node => ({ owner: owner(node), src: node.currentSrc, paused: node.paused, visible: visible(node), readyState: node.readyState })),
        hiddenImages: [...document.querySelectorAll('img')].filter(node => !visible(node) && node.currentSrc).map(node => ({ owner: owner(node), src: node.currentSrc, complete: node.complete })),
        limitation: 'Observed samples only. Long tasks are not Lighthouse TBT or INP; frame intervals are not a cross-device FPS guarantee; canvas count is not WebGL context count.',
      };
    },
    stop() {
      if (stopped) return; stopped = true; drain(); cancelAnimationFrame(raf);
      for (const { observer } of observers) observer.disconnect();
      window.removeEventListener('error', onError); window.removeEventListener('unhandledrejection', onError);
    },
  };
}
