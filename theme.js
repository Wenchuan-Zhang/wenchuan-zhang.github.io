// Apply the saved palette before the browser paints the page.
(() => {
  const key = 'wz-color-theme';
  const systemTheme = window.matchMedia('(prefers-color-scheme: dark)');
  const readPreference = () => {
    try {
      const saved = localStorage.getItem(key);
      return saved === 'dark' || saved === 'light' ? saved : null;
    } catch {
      return null;
    }
  };
  let preference = readPreference();
  let button;
  function applyTheme() {
    const theme = preference || (systemTheme.matches ? 'dark' : 'light');
    const dark = theme === 'dark';
    document.documentElement.dataset.theme = theme;
    document.querySelector('meta[name="theme-color"]').content = dark ? '#211f22' : '#faf9f6';
    if (button) {
      button.setAttribute('aria-pressed', String(dark));
      button.title = dark ? 'Switch to light mode' : 'Switch to dark mode';
    }
  }
  applyTheme();
  systemTheme.addEventListener('change', applyTheme);
  window.addEventListener('storage', event => {
    if (event.key === key || event.key === null) {
      preference = readPreference();
      applyTheme();
    }
  });
  document.addEventListener('DOMContentLoaded', () => {
    button = document.querySelector('.theme-toggle');
    button.hidden = false;
    applyTheme();
    button.addEventListener('click', () => {
      preference = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
      try { localStorage.setItem(key, preference); } catch { /* Private storage may be unavailable. */ }
      applyTheme();
    });
  });
})();
