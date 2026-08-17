document.addEventListener('DOMContentLoaded', () => {

  // Mobile nav toggle
  const navToggle = document.querySelector('.nav-toggle');
  const mainNav = document.querySelector('.main-nav');
  if (navToggle && mainNav) {
    navToggle.addEventListener('click', () => {
      const expanded = navToggle.getAttribute('aria-expanded') === 'true';
      navToggle.setAttribute('aria-expanded', String(!expanded));
      mainNav.style.display = expanded ? 'none' : 'flex';
      if (!expanded) {
        mainNav.style.position = 'absolute';
        mainNav.style.top = '76px';
        mainNav.style.left = '0';
        mainNav.style.right = '0';
        mainNav.style.background = 'rgba(11,37,69,0.98)';
        mainNav.style.flexDirection = 'column';
        mainNav.style.padding = '16px 24px';
        mainNav.style.gap = '16px';
      }
    });
  }

  // Search widget tabs (flights/hotels toggle)
  document.querySelectorAll('.search-tabs').forEach(tabRow => {
    tabRow.querySelectorAll('.search-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        const widget = tabRow.closest('.search-widget');
        tabRow.querySelectorAll('.search-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        widget.querySelectorAll('.search-panel').forEach(p => {
          p.classList.toggle('active', p.dataset.tab === tab.dataset.tab);
        });
      });
    });
  });

  // Search form -> redirect to target page (static site, no backend)
  document.querySelectorAll('.search-panel form').forEach(form => {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const target = form.dataset.target;
      if (target) window.location.href = target;
    });
  });

  // Category chip toggle (hotels page)
  document.querySelectorAll('.chip-row').forEach(row => {
    row.querySelectorAll('.chip').forEach(chip => {
      chip.addEventListener('click', () => {
        row.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
      });
    });
  });

  // Contact form -> mailto fallback (static site, no backend)
  const contactForm = document.getElementById('contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('cf-name').value;
      const email = document.getElementById('cf-email').value;
      const topic = document.getElementById('cf-topic').value;
      const message = document.getElementById('cf-message').value;
      const subject = encodeURIComponent(`Support request: ${topic}`);
      const body = encodeURIComponent(`Name: ${name}\nEmail: ${email}\n\n${message}`);
      window.location.href = `mailto:info.roetravel@gmail.com?subject=${subject}&body=${body}`;
    });
  }

  // Dark mode toggle (theme already set pre-paint by the inline anti-flash script in <head>)
  const themeToggle = document.getElementById('theme-toggle');
  function setToggleIcon() {
    if (!themeToggle) return;
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    themeToggle.textContent = isDark ? '☀️' : '🌙';
  }
  setToggleIcon();
  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
      if (isDark) {
        document.documentElement.removeAttribute('data-theme');
        localStorage.setItem('roe-theme', 'light');
      } else {
        document.documentElement.setAttribute('data-theme', 'dark');
        localStorage.setItem('roe-theme', 'dark');
      }
      setToggleIcon();
    });
  }
});
