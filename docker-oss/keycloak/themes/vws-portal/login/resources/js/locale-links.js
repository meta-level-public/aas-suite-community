(function () {
  function setLocale(urlString, locale) {
    var u = new URL(urlString, window.location.origin);
    u.searchParams.set('kc_locale', locale);
    return u.toString();
  }

  function buildLocaleLinks() {
    var pageHeader = document.querySelector('.login-pf-page-header') || document.querySelector('.pf-v5-c-login__main-header');
    if (!pageHeader) return;

    var wrapper = document.createElement('div');
    wrapper.className = 'vws-locale-links';

    var de = document.createElement('a');
    de.href = setLocale(window.location.href, 'de');
    de.textContent = 'Deutsch';
    de.className = 'vws-locale-link';

    var sep = document.createElement('span');
    sep.className = 'vws-locale-sep';
    sep.textContent = '|';

    var en = document.createElement('a');
    en.href = setLocale(window.location.href, 'en');
    en.textContent = 'English';
    en.className = 'vws-locale-link';

    var currentLocale = (new URL(window.location.href)).searchParams.get('kc_locale') || '';
    if (currentLocale.toLowerCase() === 'de') de.classList.add('active');
    if (currentLocale.toLowerCase() === 'en') en.classList.add('active');

    wrapper.appendChild(de);
    wrapper.appendChild(sep);
    wrapper.appendChild(en);

    pageHeader.insertAdjacentElement('beforebegin', wrapper);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', buildLocaleLinks);
  } else {
    buildLocaleLinks();
  }
})();
