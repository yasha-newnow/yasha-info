import type { Theme } from "./contrast";

/**
 * Builds the tiny blocking script that runs BEFORE first paint (rendered inline
 * as the first child of <body> in layout.tsx). It picks the startup accent and
 * sets the CSS variables on :root so there is no color flash.
 *
 * Logic (mirrors the spec):
 *  1. If a valid manual choice is stored (`accent:manual`) → apply it (sticky).
 *  2. Otherwise pick a random preset, EXCLUDING the last one shown (`accent:last`),
 *     apply it, and remember it.
 *
 * The preset themes are precomputed on the server (pure `computeTheme`) and
 * embedded as JSON, so this script does NO color math. It also does not dispatch
 * `themechange` — the shader reads `window.__YASHA_THEME__` directly on mount
 * (its listener is attached later, in an effect, so an early event would be missed).
 *
 * The `transition:none` guard prevents the registered `@property --accent`
 * transition (declared on :root in globals.css) from animating this first set.
 */
export function buildThemeInitScript(presetThemes: Theme[]): string {
  const presetsJson = JSON.stringify(presetThemes);
  return `(function(){
  try {
    var P = ${presetsJson};
    var root = document.documentElement;
    function apply(t){
      root.style.transition = 'none';
      root.style.setProperty('--accent', t.accent);
      root.style.setProperty('--foreground', t.foreground);
      root.style.setProperty('--glass-overlay', t.glassOverlay);
      root.style.setProperty('--shadow-glass-color', t.shadowGlassColor);
      window.__YASHA_THEME__ = t;
      requestAnimationFrame(function(){ root.style.transition = ''; });
    }
    var manual = null;
    try {
      var raw = localStorage.getItem('accent:manual');
      if (raw) {
        var m = JSON.parse(raw);
        if (m && typeof m.accent === 'string' && /^#[0-9a-fA-F]{6}$/.test(m.accent)
            && typeof m.foreground === 'string' && typeof m.glassOverlay === 'string'
            && typeof m.shadowGlassColor === 'string' && typeof m.isLight === 'boolean') {
          manual = m;
        }
      }
    } catch(e){}
    if (manual) { apply(manual); return; }
    var last = null;
    try { last = localStorage.getItem('accent:last'); } catch(e){}
    var pool = P.filter(function(p){ return p.accent !== last; });
    if (!pool.length) pool = P;
    var pick = pool[Math.floor(Math.random() * pool.length)];
    apply(pick);
    try { localStorage.setItem('accent:last', pick.accent); } catch(e){}
  } catch(e){}
})();`;
}
