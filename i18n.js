/* ===== I18N.JS - Internationalization ===== */

const TRANSLATIONS = {
  en: {
    'nav-logo': '⬡ NEXUS',
    'hub-title': 'GAME HUB',
    'hub-subtitle': 'SELECT YOUR GAME AND BREAK YOUR RECORDS',
    'stats-title': '⚡ YOUR STATS',
    'total-points': 'Total Points',
    'high-score': 'HIGH SCORE',
    'play-now': 'PLAY NOW →',
    'settings-title': '⚙ SETTINGS',
    'lang-label': 'LANGUAGE',
    'sound-label': 'SOUND EFFECTS',
    'particles-label': 'PARTICLE EFFECTS',
    'clear-label': 'CLEAR HIGH SCORES',
    'clear-btn': 'CLEAR ALL',
    'logout-btn': 'LOGOUT',
    'logout-label': 'ACCOUNT',
    'on': 'ON',
    'off': 'OFF',
  },
  gr: {
    'nav-logo': '⬡ NEXUS',
    'hub-title': 'ΚΕΝΤΡΟ ΠΑΙΧΝΙΔΙΩΝ',
    'hub-subtitle': 'ΔΙΑΛΕΞΕ ΠΑΙΧΝΙΔΙ ΚΑΙ ΣΠΑΣΕ ΡΕΚΟΡ',
    'stats-title': '⚡ ΤΑ ΣΤΑΤΙΣΤΙΚΑ ΣΟΥ',
    'total-points': 'Σύνολο Πόντων',
    'high-score': 'ΥΨΗΛΟ ΣΚΟΡ',
    'play-now': 'ΠΑΙΞΕ ΤΩΡΑ →',
    'settings-title': '⚙ ΡΥΘΜΙΣΕΙΣ',
    'lang-label': 'ΓΛΩΣΣΑ',
    'sound-label': 'ΗΧΗΤΙΚΑ ΕΦΦΕ',
    'particles-label': 'ΕΦΦΕ ΣΩΜΑΤΙΔΙΩΝ',
    'clear-label': 'ΔΙΑΓΡΑΦΗ ΣΚΟΡ',
    'clear-btn': 'ΔΙΑΓΡΑΦΗ ΟΛΩΝ',
    'logout-btn': 'ΑΠΟΣΥΝΔΕΣΗ',
    'logout-label': 'ΛΟΓΑΡΙΑΣΜΟΣ',
    'on': 'ΕΝΑ',
    'off': 'ΑΠΟ',
  },
  ru: {
    'nav-logo': '⬡ NEXUS',
    'hub-title': 'ИГРОВОЙ ХАБ',
    'hub-subtitle': 'ВЫБЕРИ ИГРУ И ПОБЕЙ РЕКОРДЫ',
    'stats-title': '⚡ ТВОЯ СТАТИСТИКА',
    'total-points': 'Всего Очков',
    'high-score': 'РЕКОРД',
    'play-now': 'ИГРАТЬ →',
    'settings-title': '⚙ НАСТРОЙКИ',
    'lang-label': 'ЯЗЫК',
    'sound-label': 'ЗВУКОВЫЕ ЭФФЕКТЫ',
    'particles-label': 'ЭФФЕКТЫ ЧАСТИЦ',
    'clear-label': 'ОЧИСТИТЬ РЕКОРДЫ',
    'clear-btn': 'ОЧИСТИТЬ ВСЕ',
    'logout-btn': 'ВЫЙТИ',
    'logout-label': 'АККАУНТ',
    'on': 'ВКЛ',
    'off': 'ВЫКЛ',
  }
};

const I18n = {
  getCurrentLang() {
    return localStorage.getItem('gamehub_lang') || 'en';
  },
  setLang(lang) {
    localStorage.setItem('gamehub_lang', lang);
  },
  t(key) {
    const lang = this.getCurrentLang();
    return (TRANSLATIONS[lang] && TRANSLATIONS[lang][key]) || TRANSLATIONS['en'][key] || key;
  },
  apply() {
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      el.textContent = this.t(key);
    });
  }
};
