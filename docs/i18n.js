const STORAGE_KEY = 'yt-autolike-language';
const FALLBACK_LANGUAGE = 'en';

const resources = {
  en: {
    translation: {
      accessibility: {
        skipLink: 'Skip to main content',
      },
      viewport: {
        title: 'Viewport Not Supported',
        body: 'This page is optimised for screens between <strong>280 px</strong> and <strong>3840 px</strong> wide. Please resize your browser window or switch to a supported device.',
        hint: 'Current width is outside the supported range.',
      },
      nav: {
        menuOpenLabel: 'Open navigation menu',
        menuCloseLabel: 'Close navigation menu',
        features: 'Features',
        modes: 'Auto-Like Modes',
        marketplace: 'Marketplace Status',
        manual: 'Manual Installation Guide',
        privacy: 'Privacy',
        thanks: 'Thanks',
      },
      language: {
        label: 'Language',
      },
      actions: {
        githubLabel: 'Open the YT AutoLike GitHub repository in a new tab',
        linkedinLabel: "Open Vijay Gangatharan's LinkedIn profile in a new tab",
      },
      hero: {
        title: 'Support Creators <span class="highlight">Automatically</span>',
        body: 'The ultimate privacy-first browser extension that likes YouTube videos and Shorts after you watch them. Set it, forget it, and support your favorite channels.',
        marketplaceCta: 'View Marketplace Status',
        manualCta: 'Manual Installation Guide',
      },
      features: {
        title: 'Why YT AutoLike?',
        modes: {
          title: 'Auto-Like Modes',
          body: 'Global, Only Shorts, Only Videos, or Whitelist Only. You are in control.',
        },
        threshold: {
          title: 'Custom Threshold',
          body: 'Set a watch percentage (10% to 90%) to trigger the like automatically.',
        },
        private: {
          title: '100% Private',
          body: 'No servers. No tracking. Everything stays locally on your device.',
        },
      },
      modes: {
        title: 'Auto-Like Modes',
        global: {
          title: '🌐 Global',
          body: "The default mode — set it and forget it! 🙌 YT AutoLike will automatically like <strong>both</strong> regular YouTube videos <em>and</em> Shorts once you've hit your watch threshold. Perfect if you just want everything handled without thinking about it.",
        },
        shorts: {
          title: '⚡ Only Shorts',
          body: 'A Shorts-only lane! 🎬 Auto-likes kick in exclusively on YouTube Shorts — those quick vertical videos you binge through. Great if you love supporting short-form creators but prefer to manually like longer videos yourself.',
        },
        videos: {
          title: '🎞️ Only Videos',
          body: "For the long-form lovers. 📺 Only standard YouTube videos (not Shorts) will get the auto-like treatment. Ideal if you're super selective about Shorts but want to automatically support the channels you actually sit down and watch.",
        },
        whitelist: {
          title: '✅ Whitelist Only',
          body: "Your VIP list. 🌟 Auto-likes happen <em>only</em> for channels you've explicitly approved. Everyone else? No automatic like. Perfect if you want laser-precise control — only your favourite creators get the love, automatically.",
        },
      },
      browser: {
        chromeAlt: 'Chrome logo',
        edgeAlt: 'Microsoft Edge logo',
        firefoxAlt: 'Firefox logo',
      },
      marketplace: {
        title: 'Marketplace Status',
        comingSoon: 'Coming soon',
        pending: 'Yet to release',
        pendingBody: 'Yet to release in marketplace.',
        chrome: {
          title: 'Chrome Web Store',
          body: 'Chrome Web Store marketplace listing is coming soon.',
          cardLabel: 'Chrome Web Store marketplace status: coming soon',
        },
        edge: {
          title: 'Microsoft Edge Add-ons',
          cardLabel: 'Microsoft Edge Add-ons marketplace status: yet to release',
        },
        firefox: {
          title: 'Firefox Add-ons',
          cardLabel: 'Firefox Add-ons marketplace status: yet to release',
        },
      },
      manual: {
        title: 'Manual Installation Guide',
        intro:
          'Use this guide when a marketplace listing is not available for your browser yet. Manual installs depend on files you keep locally, so treat the downloaded package and extracted folder as part of the installation.',
        shared: {
          permanentFolder:
            "Move the ZIP to a <strong>permanent folder</strong> — don't delete it later or the extension will break.",
          extract: 'Extract the ZIP inside that folder.',
          loadUnpacked: 'Click <strong>Load unpacked</strong> and select the extracted folder.',
        },
        chrome: {
          title: 'Chrome / Chromium',
          cardLabel: 'Manual installation steps for Chrome and Chromium',
          step1Prefix: 'Download the',
          or: 'or',
          chromeZipLabel: 'Download the latest Chrome ZIP from GitHub releases in a new tab',
          chromiumZipLabel: 'Download the latest Chromium ZIP from GitHub releases in a new tab',
          openExtensions: 'Open <code>chrome://extensions/</code> in your browser.',
          developerMode: 'Toggle on <strong>Developer mode</strong> (top-right switch).',
        },
        firefox: {
          title: 'Firefox',
          cardLabel: 'Manual installation steps for Firefox',
          step1Prefix: 'Download the',
          firefoxZipLabel: 'Download the latest Firefox ZIP from GitHub releases in a new tab',
          permanentFolder:
            'Move the ZIP to a <strong>permanent folder</strong> — Firefox needs it there to stay installed.',
          openDebugging: 'Open <code>about:debugging#/runtime/this-firefox</code> in Firefox.',
          loadTemporary: 'Click <strong>Load Temporary Add-on...</strong>',
          selectZip: 'Select the ZIP file you downloaded.',
        },
        edge: {
          title: 'Microsoft Edge',
          cardLabel: 'Manual installation steps for Microsoft Edge',
          step1Prefix: 'Download the',
          edgeZipLabel: 'Download the latest Edge ZIP from GitHub releases in a new tab',
          openExtensions: 'Open <code>edge://extensions/</code> in Edge.',
          developerMode: 'Toggle on <strong>Developer mode</strong> (left sidebar).',
        },
      },
      privacy: {
        title: 'Your Data, Your Business',
        body: 'Unlike other extensions, YT AutoLike is completely open-source and local. We never collect, sell, or view your watch history.',
        linkLabel: 'Read the YT AutoLike privacy policy on GitHub in a new tab',
      },
      thanks: {
        title: 'Thanks',
        body: 'YT AutoLike exists because of open-source tools, prior art, and community contributions.',
        acknowledgementsLabel: 'Read acknowledgements on GitHub in a new tab',
        contributorsLabel: 'View contributors on GitHub in a new tab',
      },
      footer: {
        copyright: '© 2026 YT AutoLike. Released under the MIT License.',
        issueLabel: 'Report an issue on GitHub in a new tab',
      },
    },
  },
};

let syncMenuState = () => {};

const getInitialLanguage = () => {
  const storedLanguage = localStorage.getItem(STORAGE_KEY);

  if (storedLanguage && resources[storedLanguage]) {
    return storedLanguage;
  }

  return FALLBACK_LANGUAGE;
};

const applyTranslations = () => {
  document.documentElement.lang = i18next.language || FALLBACK_LANGUAGE;

  document.querySelectorAll('[data-i18n]').forEach((element) => {
    element.textContent = i18next.t(element.dataset.i18n);
  });

  document.querySelectorAll('[data-i18n-html]').forEach((element) => {
    element.innerHTML = i18next.t(element.dataset.i18nHtml);
  });

  document.querySelectorAll('[data-i18n-attr]').forEach((element) => {
    element.dataset.i18nAttr.split(',').forEach((binding) => {
      const [attribute, key] = binding.split(':').map((part) => part.trim());

      if (attribute && key) {
        element.setAttribute(attribute, i18next.t(key));
      }
    });
  });
};

const initMenu = () => {
  const menuToggle = document.querySelector('.menu-toggle');
  const navMenu = document.getElementById('nav-menu');

  if (!menuToggle || !navMenu) {
    return;
  }

  const setMenuState = (isOpen) => {
    navMenu.classList.toggle('open', isOpen);
    menuToggle.setAttribute('aria-expanded', String(isOpen));
    menuToggle.setAttribute(
      'aria-label',
      i18next.t(isOpen ? 'nav.menuCloseLabel' : 'nav.menuOpenLabel'),
    );
  };

  syncMenuState = () => {
    setMenuState(navMenu.classList.contains('open'));
  };

  menuToggle.addEventListener('click', () => {
    setMenuState(!navMenu.classList.contains('open'));
  });

  document.querySelectorAll('#nav-menu a').forEach((link) => {
    link.addEventListener('click', () => {
      setMenuState(false);
    });
  });

  setMenuState(false);
};

const initLanguageSelect = () => {
  const languageSelect = document.getElementById('language-select');

  if (!languageSelect) {
    return;
  }

  languageSelect.value = i18next.language || FALLBACK_LANGUAGE;
  languageSelect.addEventListener('change', async (event) => {
    const nextLanguage = event.target.value;
    await i18next.changeLanguage(nextLanguage);
    localStorage.setItem(STORAGE_KEY, nextLanguage);
    applyTranslations();
    syncMenuState();
  });
};

i18next
  .init({
    lng: getInitialLanguage(),
    fallbackLng: FALLBACK_LANGUAGE,
    resources,
  })
  .then(() => {
    applyTranslations();
    initLanguageSelect();
    initMenu();
  });
