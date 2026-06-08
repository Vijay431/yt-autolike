const STORAGE_KEY = 'yt-autolike-language';
const FALLBACK_LANGUAGE = 'en';

const mergeTranslations = (base, overrides) => {
  const merged = { ...base };

  Object.entries(overrides).forEach(([key, value]) => {
    if (
      value &&
      typeof value === 'object' &&
      !Array.isArray(value) &&
      base[key] &&
      typeof base[key] === 'object'
    ) {
      merged[key] = mergeTranslations(base[key], value);
      return;
    }

    merged[key] = value;
  });

  return merged;
};

const englishGlobal = {
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
};

const createResource = (overrides) => ({
  translation: mergeTranslations(englishGlobal, overrides),
});

const resources = {
  'en-US': createResource({
    viewport: {
      body: 'This page is optimized for screens between <strong>280 px</strong> and <strong>3840 px</strong> wide. Please resize your browser window or switch to a supported device.',
    },
    modes: {
      whitelist: {
        body: "Your VIP list. 🌟 Auto-likes happen <em>only</em> for channels you've explicitly approved. Everyone else? No automatic like. Perfect if you want laser-precise control — only your favorite creators get the love, automatically.",
      },
    },
  }),
  'en-GB': createResource({
    hero: {
      body: 'The ultimate privacy-first browser extension that likes YouTube videos and Shorts after you watch them. Set it, forget it, and support your favourite channels.',
    },
    modes: {
      videos: {
        body: "For the long-form lovers. 📺 Only standard YouTube videos (not Shorts) will get the auto-like treatment. Ideal if you're selective about Shorts but want to automatically support the channels you actually sit down and watch.",
      },
    },
  }),
  en: {
    translation: englishGlobal,
  },
  ta: createResource({
    accessibility: { skipLink: 'முக்கிய உள்ளடக்கத்துக்கு செல்லவும்' },
    viewport: {
      title: 'திரை அளவு ஆதரிக்கப்படவில்லை',
      body: 'இந்த பக்கம் <strong>280 px</strong> முதல் <strong>3840 px</strong> அகலமுள்ள திரைகளுக்காக மேம்படுத்தப்பட்டுள்ளது. உங்கள் உலாவி சாளரத்தை மாற்றவும் அல்லது ஆதரிக்கப்படும் சாதனத்துக்கு மாறவும்.',
      hint: 'தற்போதைய அகலம் ஆதரிக்கப்படும் வரம்புக்கு வெளியே உள்ளது.',
    },
    nav: {
      menuOpenLabel: 'வழிசெலுத்தல் மெனுவைத் திறக்கவும்',
      menuCloseLabel: 'வழிசெலுத்தல் மெனுவை மூடவும்',
      features: 'அம்சங்கள்',
      modes: 'Auto-Like முறைகள்',
      marketplace: 'மார்க்கெட்பிளேஸ் நிலை',
      manual: 'கையேடு நிறுவல் வழிகாட்டி',
      privacy: 'தனியுரிமை',
      thanks: 'நன்றி',
    },
    language: { label: 'மொழி' },
    actions: {
      githubLabel: 'YT AutoLike GitHub களஞ்சியத்தை புதிய தாவலில் திறக்கவும்',
      linkedinLabel: 'Vijay Gangatharan LinkedIn சுயவிவரத்தை புதிய தாவலில் திறக்கவும்',
    },
    hero: {
      title: 'படைப்பாளர்களை <span class="highlight">தானாக</span> ஆதரிக்கவும்',
      body: 'YouTube வீடியோக்கள் மற்றும் Shorts-ஐ நீங்கள் பார்த்த பிறகு தானாக லைக் செய்யும் privacy-first உலாவி நீட்டிப்பு. அமைத்து விடுங்கள்; உங்களுக்கு பிடித்த சேனல்களை ஆதரிக்க அது வேலை செய்யும்.',
      marketplaceCta: 'மார்க்கெட்பிளேஸ் நிலையைப் பார்க்கவும்',
      manualCta: 'கையேடு நிறுவல் வழிகாட்டி',
    },
    features: {
      title: 'ஏன் YT AutoLike?',
      modes: {
        title: 'Auto-Like முறைகள்',
        body: 'Global, Only Shorts, Only Videos, அல்லது Whitelist Only. கட்டுப்பாடு உங்களிடம்.',
      },
      threshold: {
        title: 'தனிப்பயன் வரம்பு',
        body: 'தானாக லைக் செய்ய 10% முதல் 90% வரை பார்க்கும் சதவீதத்தை அமைக்கவும்.',
      },
      private: {
        title: '100% தனியுரிமை',
        body: 'சர்வர்கள் இல்லை. கண்காணிப்பு இல்லை. அனைத்தும் உங்கள் சாதனத்தில் உள்ளூராகவே இருக்கும்.',
      },
    },
    modes: {
      title: 'Auto-Like முறைகள்',
      global: {
        title: '🌐 Global',
        body: 'இயல்புநிலை முறை — அமைத்து மறந்துவிடலாம்! 🙌 உங்கள் பார்வை வரம்பை அடைந்ததும் YT AutoLike வழக்கமான YouTube வீடியோக்களையும் Shorts-ஐயும் <strong>இரண்டையும்</strong> தானாக லைக் செய்யும். யோசிக்காமல் அனைத்தையும் கவனிக்கச் செய்ய விரும்பினால் சிறந்தது.',
      },
      shorts: {
        title: '⚡ Only Shorts',
        body: 'Shorts-க்கு மட்டும் ஒரு பாதை! 🎬 விரைவான செங்குத்து YouTube Shorts-இல் மட்டும் auto-like இயங்கும். குறும்பட படைப்பாளர்களை ஆதரிக்க விரும்பியும் நீளமான வீடியோக்களை நீங்களே லைக் செய்ய விரும்பினாலும் இது உதவும்.',
      },
      videos: {
        title: '🎞️ Only Videos',
        body: 'நீளமான வீடியோக்களை விரும்புபவர்களுக்கு. 📺 Shorts அல்லாத வழக்கமான YouTube வீடியோக்களுக்கு மட்டுமே auto-like இயங்கும். Shorts-ஐ தேர்ந்தெடுத்து கையாள விரும்பியும், நீங்கள் அமர்ந்து பார்க்கும் சேனல்களை தானாக ஆதரிக்க விரும்பினாலும் சிறந்தது.',
      },
      whitelist: {
        title: '✅ Whitelist Only',
        body: 'உங்கள் VIP பட்டியல். 🌟 நீங்கள் வெளிப்படையாக அனுமதித்த சேனல்களுக்கு <em>மட்டுமே</em> auto-like நடக்கும். மற்றவர்களுக்கு தானாக லைக் இல்லை. துல்லியமான கட்டுப்பாடு வேண்டும் என்றால் இது சரியானது.',
      },
    },
    browser: {
      chromeAlt: 'Chrome லோகோ',
      edgeAlt: 'Microsoft Edge லோகோ',
      firefoxAlt: 'Firefox லோகோ',
    },
    marketplace: {
      title: 'மார்க்கெட்பிளேஸ் நிலை',
      comingSoon: 'விரைவில் வருகிறது',
      pending: 'இன்னும் வெளியிடப்படவில்லை',
      pendingBody: 'மார்க்கெட்பிளேஸில் இன்னும் வெளியிடப்படவில்லை.',
      chrome: {
        title: 'Chrome Web Store',
        body: 'Chrome Web Store மார்க்கெட்பிளேஸ் பட்டியல் விரைவில் வருகிறது.',
        cardLabel: 'Chrome Web Store மார்க்கெட்பிளேஸ் நிலை: விரைவில் வருகிறது',
      },
      edge: {
        title: 'Microsoft Edge Add-ons',
        cardLabel: 'Microsoft Edge Add-ons மார்க்கெட்பிளேஸ் நிலை: இன்னும் வெளியிடப்படவில்லை',
      },
      firefox: {
        title: 'Firefox Add-ons',
        cardLabel: 'Firefox Add-ons மார்க்கெட்பிளேஸ் நிலை: இன்னும் வெளியிடப்படவில்லை',
      },
    },
    manual: {
      title: 'கையேடு நிறுவல் வழிகாட்டி',
      intro:
        'உங்கள் உலாவிக்கான மார்க்கெட்பிளேஸ் பட்டியல் இன்னும் இல்லாதபோது இந்த வழிகாட்டியைப் பயன்படுத்தவும். கையேடு நிறுவலுக்கு உள்ளூர் கோப்புகள் தேவைப்படுகின்றன; எனவே பதிவிறக்கிய package மற்றும் extract செய்யப்பட்ட folder-ஐ நிறுவலின் பகுதியாக வைத்துக்கொள்ளுங்கள்.',
      shared: {
        permanentFolder:
          'ZIP-ஐ <strong>நிரந்தர folder</strong> ஒன்றுக்கு மாற்றவும் — பின்னர் அதை நீக்கினால் extension வேலை செய்யாது.',
        extract: 'அந்த folder-க்குள் ZIP-ஐ extract செய்யவும்.',
        loadUnpacked:
          '<strong>Load unpacked</strong> என்பதைக் கிளிக் செய்து extract செய்த folder-ஐ தேர்ந்தெடுக்கவும்.',
      },
      chrome: {
        title: 'Chrome / Chromium',
        cardLabel: 'Chrome மற்றும் Chromium கையேடு நிறுவல் படிகள்',
        step1Prefix: 'பதிவிறக்கவும்',
        or: 'அல்லது',
        chromeZipLabel:
          'புதிய தாவலில் GitHub releases-இல் இருந்து சமீபத்திய Chrome ZIP-ஐ பதிவிறக்கவும்',
        chromiumZipLabel:
          'புதிய தாவலில் GitHub releases-இல் இருந்து சமீபத்திய Chromium ZIP-ஐ பதிவிறக்கவும்',
        openExtensions: 'உங்கள் உலாவியில் <code>chrome://extensions/</code> திறக்கவும்.',
        developerMode: '<strong>Developer mode</strong> ஐ இயக்கவும் (மேல்-வலது switch).',
      },
      firefox: {
        title: 'Firefox',
        cardLabel: 'Firefox கையேடு நிறுவல் படிகள்',
        step1Prefix: 'பதிவிறக்கவும்',
        firefoxZipLabel:
          'புதிய தாவலில் GitHub releases-இல் இருந்து சமீபத்திய Firefox ZIP-ஐ பதிவிறக்கவும்',
        permanentFolder:
          'ZIP-ஐ <strong>நிரந்தர folder</strong> ஒன்றுக்கு மாற்றவும் — நிறுவல் தொடர Firefox-க்கு அது அங்கே தேவை.',
        openDebugging: 'Firefox-இல் <code>about:debugging#/runtime/this-firefox</code> திறக்கவும்.',
        loadTemporary: '<strong>Load Temporary Add-on...</strong> என்பதைக் கிளிக் செய்யவும்',
        selectZip: 'நீங்கள் பதிவிறக்கிய ZIP கோப்பைத் தேர்ந்தெடுக்கவும்.',
      },
      edge: {
        title: 'Microsoft Edge',
        cardLabel: 'Microsoft Edge கையேடு நிறுவல் படிகள்',
        step1Prefix: 'பதிவிறக்கவும்',
        edgeZipLabel:
          'புதிய தாவலில் GitHub releases-இல் இருந்து சமீபத்திய Edge ZIP-ஐ பதிவிறக்கவும்',
        openExtensions: 'Edge-இல் <code>edge://extensions/</code> திறக்கவும்.',
        developerMode: '<strong>Developer mode</strong> ஐ இயக்கவும் (இடது sidebar).',
      },
    },
    privacy: {
      title: 'உங்கள் தரவு, உங்கள் கட்டுப்பாடு',
      body: 'மற்ற extension-களைப் போலல்லாமல், YT AutoLike முழுமையாக open-source மற்றும் local. உங்கள் watch history-ஐ நாம் சேகரிக்கவோ, விற்கவோ, பார்க்கவோ மாட்டோம்.',
      linkLabel: 'YT AutoLike privacy policy-ஐ GitHub-இல் புதிய தாவலில் படிக்கவும்',
    },
    thanks: {
      title: 'நன்றி',
      body: 'Open-source கருவிகள், முன் முயற்சிகள், மற்றும் community பங்களிப்புகள் காரணமாக YT AutoLike உருவானது.',
      acknowledgementsLabel: 'GitHub-இல் acknowledgements-ஐ புதிய தாவலில் படிக்கவும்',
      contributorsLabel: 'GitHub-இல் contributors-ஐ புதிய தாவலில் பார்க்கவும்',
    },
    footer: {
      copyright: '© 2026 YT AutoLike. MIT License கீழ் வெளியிடப்பட்டது.',
      issueLabel: 'GitHub-இல் issue ஒன்றை புதிய தாவலில் தெரிவிக்கவும்',
    },
  }),
  hi: createResource({
    accessibility: { skipLink: 'मुख्य सामग्री पर जाएं' },
    viewport: {
      title: 'व्यूपोर्ट समर्थित नहीं है',
      body: 'यह पेज <strong>280 px</strong> से <strong>3840 px</strong> चौड़ी स्क्रीन के लिए अनुकूलित है। कृपया अपनी ब्राउज़र विंडो का आकार बदलें या समर्थित डिवाइस पर स्विच करें।',
      hint: 'वर्तमान चौड़ाई समर्थित सीमा से बाहर है।',
    },
    nav: {
      menuOpenLabel: 'नेविगेशन मेन्यू खोलें',
      menuCloseLabel: 'नेविगेशन मेन्यू बंद करें',
      features: 'विशेषताएं',
      modes: 'Auto-Like मोड',
      marketplace: 'मार्केटप्लेस स्थिति',
      manual: 'मैनुअल इंस्टॉलेशन गाइड',
      privacy: 'गोपनीयता',
      thanks: 'धन्यवाद',
    },
    language: { label: 'भाषा' },
    actions: {
      githubLabel: 'YT AutoLike GitHub repository को नए टैब में खोलें',
      linkedinLabel: 'Vijay Gangatharan की LinkedIn profile को नए टैब में खोलें',
    },
    hero: {
      title: 'Creators को <span class="highlight">अपने आप</span> support करें',
      body: 'YouTube videos और Shorts देखने के बाद उन्हें अपने आप like करने वाला privacy-first browser extension. इसे सेट करें, भूल जाएं, और अपने पसंदीदा channels को support करें.',
      marketplaceCta: 'Marketplace status देखें',
      manualCta: 'Manual installation guide',
    },
    features: {
      title: 'YT AutoLike क्यों?',
      modes: {
        title: 'Auto-Like मोड',
        body: 'Global, Only Shorts, Only Videos, या Whitelist Only. नियंत्रण आपके पास है.',
      },
      threshold: {
        title: 'Custom threshold',
        body: 'Auto-like trigger करने के लिए watch percentage (10% से 90%) सेट करें.',
      },
      private: {
        title: '100% private',
        body: 'कोई server नहीं. कोई tracking नहीं. सब कुछ आपके device पर local रहता है.',
      },
    },
    modes: {
      title: 'Auto-Like मोड',
      global: {
        title: '🌐 Global',
        body: 'Default mode — सेट करें और भूल जाएं! 🙌 जब आपका watch threshold पूरा होगा, YT AutoLike regular YouTube videos <strong>और</strong> Shorts दोनों को अपने आप like करेगा. अगर आप बिना सोचे सब कुछ संभालना चाहते हैं, तो यह सही है.',
      },
      shorts: {
        title: '⚡ Only Shorts',
        body: 'Shorts-only lane! 🎬 Auto-likes सिर्फ YouTube Shorts पर चलेंगे — वे quick vertical videos जिन्हें आप लगातार देखते हैं. Short-form creators को support करना चाहते हैं लेकिन long videos खुद like करना चाहते हैं, तो यह अच्छा है.',
      },
      videos: {
        title: '🎞️ Only Videos',
        body: 'Long-form lovers के लिए. 📺 सिर्फ standard YouTube videos (Shorts नहीं) पर auto-like होगा. अगर आप Shorts को खुद संभालना चाहते हैं लेकिन जिन channels को बैठकर देखते हैं उन्हें अपने आप support करना चाहते हैं, तो यह सही है.',
      },
      whitelist: {
        title: '✅ Whitelist Only',
        body: 'आपकी VIP list. 🌟 Auto-likes <em>सिर्फ</em> उन channels के लिए होंगे जिन्हें आपने साफ तौर पर approve किया है. बाकी के लिए automatic like नहीं. Precise control चाहिए, तो यह mode आपके लिए है.',
      },
    },
    browser: {
      chromeAlt: 'Chrome logo',
      edgeAlt: 'Microsoft Edge logo',
      firefoxAlt: 'Firefox logo',
    },
    marketplace: {
      title: 'Marketplace status',
      comingSoon: 'जल्द आ रहा है',
      pending: 'अभी release नहीं हुआ',
      pendingBody: 'Marketplace में अभी release नहीं हुआ.',
      chrome: {
        title: 'Chrome Web Store',
        body: 'Chrome Web Store marketplace listing जल्द आ रही है.',
        cardLabel: 'Chrome Web Store marketplace status: जल्द आ रहा है',
      },
      edge: {
        title: 'Microsoft Edge Add-ons',
        cardLabel: 'Microsoft Edge Add-ons marketplace status: अभी release नहीं हुआ',
      },
      firefox: {
        title: 'Firefox Add-ons',
        cardLabel: 'Firefox Add-ons marketplace status: अभी release नहीं हुआ',
      },
    },
    manual: {
      title: 'Manual installation guide',
      intro:
        'जब आपके browser के लिए marketplace listing उपलब्ध न हो, तब इस guide का उपयोग करें. Manual installs local files पर निर्भर करते हैं, इसलिए downloaded package और extracted folder को installation का हिस्सा मानकर रखें.',
      shared: {
        permanentFolder:
          'ZIP को एक <strong>permanent folder</strong> में रखें — बाद में इसे delete करेंगे तो extension टूट जाएगा.',
        extract: 'ZIP को उसी folder में extract करें.',
        loadUnpacked: '<strong>Load unpacked</strong> पर click करें और extracted folder चुनें.',
      },
      chrome: {
        title: 'Chrome / Chromium',
        cardLabel: 'Chrome और Chromium के manual installation steps',
        step1Prefix: 'Download करें',
        or: 'या',
        chromeZipLabel: 'GitHub releases से latest Chrome ZIP नए tab में download करें',
        chromiumZipLabel: 'GitHub releases से latest Chromium ZIP नए tab में download करें',
        openExtensions: 'अपने browser में <code>chrome://extensions/</code> खोलें.',
        developerMode: '<strong>Developer mode</strong> on करें (top-right switch).',
      },
      firefox: {
        title: 'Firefox',
        cardLabel: 'Firefox के manual installation steps',
        step1Prefix: 'Download करें',
        firefoxZipLabel: 'GitHub releases से latest Firefox ZIP नए tab में download करें',
        permanentFolder:
          'ZIP को एक <strong>permanent folder</strong> में रखें — installed रहने के लिए Firefox को यह वहीं चाहिए.',
        openDebugging: 'Firefox में <code>about:debugging#/runtime/this-firefox</code> खोलें.',
        loadTemporary: '<strong>Load Temporary Add-on...</strong> पर click करें',
        selectZip: 'आपने जो ZIP file download की है, उसे चुनें.',
      },
      edge: {
        title: 'Microsoft Edge',
        cardLabel: 'Microsoft Edge के manual installation steps',
        step1Prefix: 'Download करें',
        edgeZipLabel: 'GitHub releases से latest Edge ZIP नए tab में download करें',
        openExtensions: 'Edge में <code>edge://extensions/</code> खोलें.',
        developerMode: '<strong>Developer mode</strong> on करें (left sidebar).',
      },
    },
    privacy: {
      title: 'आपका data, आपका control',
      body: 'दूसरे extensions के विपरीत, YT AutoLike पूरी तरह open-source और local है. हम आपकी watch history कभी collect, sell, या view नहीं करते.',
      linkLabel: 'YT AutoLike privacy policy को GitHub पर नए tab में पढ़ें',
    },
    thanks: {
      title: 'धन्यवाद',
      body: 'YT AutoLike open-source tools, prior art, और community contributions की वजह से मौजूद है.',
      acknowledgementsLabel: 'GitHub पर acknowledgements नए tab में पढ़ें',
      contributorsLabel: 'GitHub पर contributors नए tab में देखें',
    },
    footer: {
      copyright: '© 2026 YT AutoLike. MIT License के तहत release किया गया.',
      issueLabel: 'GitHub पर issue नए tab में report करें',
    },
  }),
  'zh-CN': createResource({
    accessibility: { skipLink: '跳到主要内容' },
    viewport: {
      title: '不支持当前视口',
      body: '此页面针对宽度在 <strong>280 px</strong> 到 <strong>3840 px</strong> 之间的屏幕进行了优化。请调整浏览器窗口大小，或切换到受支持的设备。',
      hint: '当前宽度超出支持范围。',
    },
    nav: {
      menuOpenLabel: '打开导航菜单',
      menuCloseLabel: '关闭导航菜单',
      features: '功能',
      modes: 'Auto-Like 模式',
      marketplace: '应用商店状态',
      manual: '手动安装指南',
      privacy: '隐私',
      thanks: '致谢',
    },
    language: { label: '语言' },
    actions: {
      githubLabel: '在新标签页中打开 YT AutoLike GitHub 仓库',
      linkedinLabel: '在新标签页中打开 Vijay Gangatharan 的 LinkedIn 资料',
    },
    hero: {
      title: '<span class="highlight">自动</span>支持创作者',
      body: '这是一款隐私优先的浏览器扩展，会在你观看 YouTube 视频和 Shorts 后自动点赞。设置一次，然后放心支持你喜爱的频道。',
      marketplaceCta: '查看应用商店状态',
      manualCta: '手动安装指南',
    },
    features: {
      title: '为什么选择 YT AutoLike？',
      modes: {
        title: 'Auto-Like 模式',
        body: 'Global、Only Shorts、Only Videos 或 Whitelist Only。控制权在你手中。',
      },
      threshold: {
        title: '自定义阈值',
        body: '设置观看百分比（10% 到 90%），达到后自动触发点赞。',
      },
      private: {
        title: '100% 私密',
        body: '没有服务器。没有跟踪。一切都保存在你的设备本地。',
      },
    },
    modes: {
      title: 'Auto-Like 模式',
      global: {
        title: '🌐 Global',
        body: '默认模式 — 设置后就不用管了！🙌 达到观看阈值后，YT AutoLike 会自动为常规 YouTube 视频<em>和</em> Shorts <strong>两者</strong>点赞。如果你希望一切自动处理，这个模式很合适。',
      },
      shorts: {
        title: '⚡ Only Shorts',
        body: '只面向 Shorts 的模式！🎬 Auto-like 只会在 YouTube Shorts 上触发，也就是那些快速滑看的竖屏短视频。适合想支持短视频创作者，但希望自己手动点赞长视频的用户。',
      },
      videos: {
        title: '🎞️ Only Videos',
        body: '为长视频爱好者准备。📺 只有标准 YouTube 视频（不包括 Shorts）会获得 auto-like。适合对 Shorts 更挑剔，但希望自动支持认真观看频道的用户。',
      },
      whitelist: {
        title: '✅ Whitelist Only',
        body: '你的 VIP 列表。🌟 Auto-like <em>只会</em>发生在你明确批准的频道上。其他频道不会自动点赞。适合需要精准控制的用户。',
      },
    },
    browser: {
      chromeAlt: 'Chrome 标志',
      edgeAlt: 'Microsoft Edge 标志',
      firefoxAlt: 'Firefox 标志',
    },
    marketplace: {
      title: '应用商店状态',
      comingSoon: '即将推出',
      pending: '尚未发布',
      pendingBody: '尚未在应用商店发布。',
      chrome: {
        title: 'Chrome Web Store',
        body: 'Chrome Web Store 应用商店页面即将推出。',
        cardLabel: 'Chrome Web Store 应用商店状态：即将推出',
      },
      edge: {
        title: 'Microsoft Edge Add-ons',
        cardLabel: 'Microsoft Edge Add-ons 应用商店状态：尚未发布',
      },
      firefox: {
        title: 'Firefox Add-ons',
        cardLabel: 'Firefox Add-ons 应用商店状态：尚未发布',
      },
    },
    manual: {
      title: '手动安装指南',
      intro:
        '当你的浏览器暂时没有应用商店页面时，请使用此指南。手动安装依赖你本地保留的文件，因此请把下载的 package 和解压后的 folder 视为安装的一部分。',
      shared: {
        permanentFolder:
          '将 ZIP 移到一个<strong>永久 folder</strong> 中 — 之后不要删除，否则 extension 会失效。',
        extract: '在该 folder 中解压 ZIP。',
        loadUnpacked: '点击 <strong>Load unpacked</strong>，然后选择解压后的 folder。',
      },
      chrome: {
        title: 'Chrome / Chromium',
        cardLabel: 'Chrome 和 Chromium 的手动安装步骤',
        step1Prefix: '下载',
        or: '或',
        chromeZipLabel: '在新标签页中从 GitHub releases 下载最新的 Chrome ZIP',
        chromiumZipLabel: '在新标签页中从 GitHub releases 下载最新的 Chromium ZIP',
        openExtensions: '在浏览器中打开 <code>chrome://extensions/</code>。',
        developerMode: '打开 <strong>Developer mode</strong>（右上角开关）。',
      },
      firefox: {
        title: 'Firefox',
        cardLabel: 'Firefox 的手动安装步骤',
        step1Prefix: '下载',
        firefoxZipLabel: '在新标签页中从 GitHub releases 下载最新的 Firefox ZIP',
        permanentFolder:
          '将 ZIP 移到一个<strong>永久 folder</strong> 中 — Firefox 需要它保留在那里才能继续安装。',
        openDebugging: '在 Firefox 中打开 <code>about:debugging#/runtime/this-firefox</code>。',
        loadTemporary: '点击 <strong>Load Temporary Add-on...</strong>',
        selectZip: '选择你下载的 ZIP 文件。',
      },
      edge: {
        title: 'Microsoft Edge',
        cardLabel: 'Microsoft Edge 的手动安装步骤',
        step1Prefix: '下载',
        edgeZipLabel: '在新标签页中从 GitHub releases 下载最新的 Edge ZIP',
        openExtensions: '在 Edge 中打开 <code>edge://extensions/</code>。',
        developerMode: '打开 <strong>Developer mode</strong>（左侧边栏）。',
      },
    },
    privacy: {
      title: '你的数据，由你掌控',
      body: '与其他扩展不同，YT AutoLike 完全开源并在本地运行。我们绝不会收集、出售或查看你的观看历史。',
      linkLabel: '在 GitHub 新标签页中阅读 YT AutoLike 隐私政策',
    },
    thanks: {
      title: '致谢',
      body: 'YT AutoLike 的存在离不开开源工具、前人的工作和社区贡献。',
      acknowledgementsLabel: '在 GitHub 新标签页中阅读 acknowledgements',
      contributorsLabel: '在 GitHub 新标签页中查看 contributors',
    },
    footer: {
      copyright: '© 2026 YT AutoLike。基于 MIT License 发布。',
      issueLabel: '在 GitHub 新标签页中报告 issue',
    },
  }),
  te: createResource({
    accessibility: { skipLink: 'ప్రధాన కంటెంట్‌కి వెళ్లండి' },
    viewport: {
      title: 'వ్యూపోర్ట్ సపోర్ట్ చేయబడలేదు',
      body: 'ఈ పేజీ <strong>280 px</strong> మరియు <strong>3840 px</strong> వెడల్పు ఉన్న స్క్రీన్‌ల కోసం ఆప్టిమైజ్ చేయబడింది. దయచేసి మీ బ్రౌజర్ విండో పరిమాణాన్ని మార్చండి లేదా సపోర్ట్ ఉన్న పరికరానికి మారండి.',
      hint: 'ప్రస్తుత వెడల్పు సపోర్ట్ ఉన్న పరిధి వెలుపల ఉంది.',
    },
    nav: {
      menuOpenLabel: 'నావిగేషన్ మెనును తెరవండి',
      menuCloseLabel: 'నావిగేషన్ మెనును మూసివేయండి',
      features: 'ఫీచర్లు',
      modes: 'ఆటో-లైక్ మోడ్‌లు',
      marketplace: 'మార్కెట్‌ప్లేస్ స్థితి',
      manual: 'మాన్యువల్ ఇన్‌స్టాలేషన్ గైడ్',
      privacy: 'గోప్యత',
      thanks: 'కృతజ్ఞతలు',
    },
    language: { label: 'భాష' },
    actions: {
      githubLabel: 'కొత్త ట్యాబ్‌లో YT ఆటోలైక్ GitHub రిపోజిటరీని తెరవండి',
      linkedinLabel: 'కొత్త ట్యాబ్‌లో విజయ్ గంగాధరన్ లింక్డ్‌ఇన్ ప్రొఫైల్‌ను తెరవండి',
    },
    hero: {
      title: 'క్రియేటర్లకు <span class="highlight">ఆటోమేటిక్‌గా</span> సపోర్ట్ చేయండి',
      body: 'మీరు YouTube వీడియోలు మరియు షార్ట్‌లను చూసిన తర్వాత వాటిని ఆటోమేటిక్‌గా లైక్ చేసే ప్రైవసీ-ఫస్ట్ బ్రౌజర్ ఎక్స్‌టెన్షన్. దీన్ని సెట్ చేయండి, మర్చిపోండి మరియు మీకు ఇష్టమైన ఛానెల్‌లకు సపోర్ట్ చేయండి.',
      marketplaceCta: 'మార్కెట్‌ప్లేస్ స్థితిని చూడండి',
      manualCta: 'మాన్యువల్ ఇన్‌స్టాలేషన్ గైడ్',
    },
    features: {
      title: 'YT ఆటోలైక్ ఎందుకు?',
      modes: {
        title: 'ఆటో-లైక్ మోడ్‌లు',
        body: 'గ్లోబల్, కేవలం షార్ట్‌లు, కేవలం వీడియోలు లేదా వైట్‌లిస్ట్ మాత్రమే. నియంత్రణ మీ చేతుల్లో ఉంది.',
      },
      threshold: {
        title: 'కస్టమ్ థ్రెషోల్డ్',
        body: 'ఆటో-లైక్‌ని ట్రిగ్గర్ చేయడానికి వాచ్ శాతాన్ని (10% నుండి 90%) సెట్ చేయండి.',
      },
      private: {
        title: '100% గోప్యత',
        body: 'సర్వర్లు లేవు. ట్రాకింగ్ లేదు. అంతా మీ పరికరంలోనే ఉంటుంది.',
      },
    },
    modes: {
      title: 'ఆటో-లైక్ మోడ్‌లు',
      global: {
        title: '🌐 గ్లోబల్',
        body: 'డిఫాల్ట్ మోడ్ — దీన్ని సెట్ చేసి మర్చిపోండి! 🙌 మీ వాచ్ థ్రెషోల్డ్ చేరుకున్న తర్వాత YT ఆటోలైక్ సాధారణ YouTube వీడియోలు <strong>మరియు</strong> షార్ట్‌లు రెండింటినీ ఆటోమేటిక్‌గా లైక్ చేస్తుంది. మీరు ఆలోచించకుండా ప్రతిదీ నిర్వహించాలనుకుంటే పర్ఫెక్ట్.',
      },
      shorts: {
        title: '⚡ షార్ట్‌లు మాత్రమే',
        body: 'షార్ట్‌ల కోసం మాత్రమే! 🎬 ఆటో-లైక్‌లు ప్రత్యేకంగా YouTube షార్ట్‌లలో మాత్రమే పని చేస్తాయి — మీరు వేగంగా చూసే చిన్న నిలువు వీడియోలు. మీరు షార్ట్-ఫామ్ క్రియేటర్లకు సపోర్ట్ చేయాలనుకుంటే మరియు పొడవైన వీడియోలను మాన్యువల్‌గా లైక్ చేయాలనుకుంటే ఇది అద్భుతమైనది.',
      },
      videos: {
        title: '🎞️ వీడియోలు మాత్రమే',
        body: 'పొడవైన వీడియోలను ఇష్టపడేవారి కోసం. 📺 కేవలం సాధారణ YouTube వీడియోలకు మాత్రమే (షార్ట్‌లకు కాదు) ఆటో-లైక్ పని చేస్తుంది. మీరు షార్ట్‌ల గురించి సెలెక్టివ్‌గా ఉండి, మీరు నిజంగా కూర్చుని చూసే ఛానెల్‌లకు ఆటోమేటిక్‌గా సపోర్ట్ చేయాలనుకుంటే ఆదర్శంగా ఉంటుంది.',
      },
      whitelist: {
        title: '✅ వైట్‌లిస్ట్ మాత్రమే',
        body: 'మీ VIP జాబితా. 🌟 మీరు స్పష్టంగా ఆమోదించిన ఛానెల్‌లకు <em>మాత్రమే</em> ఆటో-లైక్‌లు జరుగుతాయి. మిగతా వారందరికీ? ఆటోమేటిక్ లైక్ ఉండదు. మీకు ఖచ్చితమైన నియంత్రణ కావాలంటే పర్ఫెక్ట్ — మీకు ఇష్టమైన క్రియేటర్లకు మాత్రమే ఆటోమేటిక్‌గా లైక్ అందుతుంది.',
      },
    },
    browser: {
      chromeAlt: 'క్రోమ్ లోగో',
      edgeAlt: 'మైక్రోసాఫ్ట్ ఎడ్జ్ లోగో',
      firefoxAlt: 'ఫైర్‌ఫాక్స్ లోగో',
    },
    marketplace: {
      title: 'మార్కెట్‌ప్లేస్ స్థితి',
      comingSoon: 'త్వరలో వస్తోంది',
      pending: 'ఇంకా విడుదల కాలేదు',
      pendingBody: 'మార్కెట్‌ప్లేస్‌లో ఇంకా విడుదల కాలేదు.',
      chrome: {
        title: 'క్రోమ్ వెబ్ స్టోర్',
        body: 'క్రోమ్ వెబ్ స్టోర్ మార్కెట్‌ప్లేస్ జాబితా త్వరలో వస్తోంది.',
        cardLabel: 'క్రోమ్ వెబ్ స్టోర్ మార్కెట్‌ప్లేస్ స్థితి: త్వరలో వస్తోంది',
      },
      edge: {
        title: 'మైక్రోసాఫ్ట్ ఎడ్జ్ యాడ్-ఆన్‌లు',
        cardLabel: 'మైక్రోసాఫ్ట్ ఎడ్జ్ యాడ్-ఆన్‌ల మార్కెట్‌ప్లేస్ స్థితి: ఇంకా విడుదల కాలేదు',
      },
      firefox: {
        title: 'ఫైర్‌ఫాక్స్ యాడ్-ఆన్‌లు',
        cardLabel: 'ఫైర్‌ఫాక్స్ యాడ్-ఆన్‌ల మార్కెట్‌ప్లేస్ స్థితి: ఇంకా విడుదల కాలేదు',
      },
    },
    manual: {
      title: 'మాన్యువల్ ఇన్‌స్టాలేషన్ గైడ్',
      intro:
        'మీ బ్రౌజర్ కోసం మార్కెట్‌ప్లేస్ జాబితా ఇంకా అందుబాటులో లేనప్పుడు ఈ గైడ్‌ని ఉపయోగించండి. మాన్యువల్ ఇన్‌స్టాల్‌లు మీరు స్థానికంగా ఉంచే ఫైల్‌లపై ఆధారపడి ఉంటాయి, కాబట్టి డౌన్‌లోడ్ చేయబడిన ప్యాకేజీని మరియు ఎక్స్‌ట్రాక్ట్ చేయబడిన ఫోల్డర్‌ను ఇన్‌స్టాలేషన్‌లో భాగంగా పరిగణించండి.',
      shared: {
        permanentFolder:
          'ZIP ని <strong>శాశ్వత ఫోల్డర్‌</strong>కి తరలించండి — దాన్ని తర్వాత తొలగించవద్దు లేకుంటే ఎక్స్‌టెన్షన్ పని చేయదు.',
        extract: 'ఆ ఫోల్డర్ లోపల ZIP ని ఎక్స్‌ట్రాక్ట్ చేయండి.',
        loadUnpacked:
          '<strong>లోడ్ అన్‌ప్యాక్డ్</strong> క్లిక్ చేసి, ఎక్స్‌ట్రాక్ట్ చేయబడిన ఫోల్డర్‌ను ఎంచుకోండి.',
      },
      chrome: {
        title: 'క్రోమ్ / క్రోమియం',
        cardLabel: 'క్రోమ్ మరియు క్రోమియం కోసం మాన్యువల్ ఇన్‌స్టాలేషన్ దశలు',
        step1Prefix: 'డౌన్‌లోడ్ చేయండి',
        or: 'లేదా',
        chromeZipLabel: 'కొత్త ట్యాబ్‌లో GitHub విడుదలల నుండి తాజా క్రోమ్ ZIPని డౌన్‌లోడ్ చేయండి',
        chromiumZipLabel:
          'కొత్త ట్యాబ్‌లో GitHub విడుదలల నుండి తాజా క్రోమియం ZIPని డౌన్‌లోడ్ చేయండి',
        openExtensions: 'మీ బ్రౌజర్‌లో <code>chrome://extensions/</code> తెరవండి.',
        developerMode: '<strong>డెవలపర్ మోడ్</strong> ఆన్ చేయండి (ఎగువ-కుడి స్విచ్).',
      },
      firefox: {
        title: 'ఫైర్‌ఫాక్స్',
        cardLabel: 'ఫైర్‌ఫాక్స్ కోసం మాన్యువల్ ఇన్‌స్టాలేషన్ దశలు',
        step1Prefix: 'డౌన్‌లోడ్ చేయండి',
        firefoxZipLabel:
          'కొత్త ట్యాబ్‌లో GitHub విడుదలల నుండి తాజా ఫైర్‌ఫాక్స్ ZIPని డౌన్‌లోడ్ చేయండి',
        permanentFolder:
          'ZIP ని <strong>శాశ్వత ఫోల్డర్‌</strong>కి తరలించండి — ఇన్‌స్టాల్ చేసి ఉంచడానికి ఫైర్‌ఫాక్స్‌కు అది అక్కడే ఉండాలి.',
        openDebugging: 'ఫైర్‌ఫాక్స్‌లో <code>about:debugging#/runtime/this-firefox</code> తెరవండి.',
        loadTemporary: '<strong>తాత్కాలిక యాడ్-ఆన్‌ను లోడ్ చేయి...</strong> క్లిక్ చేయండి',
        selectZip: 'మీరు డౌన్‌లోడ్ చేసిన ZIP ఫైల్‌ను ఎంచుకోండి.',
      },
      edge: {
        title: 'మైక్రోసాఫ్ట్ ఎడ్జ్',
        cardLabel: 'మైక్రోసాఫ్ట్ ఎడ్జ్ కోసం మాన్యువల్ ఇన్‌స్టాలేషన్ దశలు',
        step1Prefix: 'డౌన్‌లోడ్ చేయండి',
        edgeZipLabel: 'కొత్త ట్యాబ్‌లో GitHub విడుదలల నుండి తాజా ఎడ్జ్ ZIPని డౌన్‌లోడ్ చేయండి',
        openExtensions: 'ఎడ్జ్‌లో <code>edge://extensions/</code> తెరవండి.',
        developerMode: '<strong>డెవలపర్ మోడ్</strong> ఆన్ చేయండి (ఎడమ సైడ్‌బార్).',
      },
    },
    privacy: {
      title: 'మీ డేటా, మీ ఇష్టం',
      body: 'ఇతర ఎక్స్‌టెన్షన్‌ల వలె కాకుండా, YT ఆటోలైక్ పూర్తిగా ఓపెన్-సోర్స్ మరియు లోకల్. మేము మీ వీక్షణ చరిత్రను ఎప్పుడూ సేకరించము, విక్రయించము లేదా చూడము.',
      linkLabel: 'కొత్త ట్యాబ్‌లో GitHub లో YT ఆటోలైక్ గోప్యతా విధానాన్ని చదవండి',
    },
    thanks: {
      title: 'కృతజ్ఞతలు',
      body: 'ఓపెన్-సోర్స్ టూల్స్, మునుపటి ఆర్ట్ మరియు కమ్యూనిటీ సహకారాల కారణంగా YT ఆటోలైక్ ఉనికిలో ఉంది.',
      acknowledgementsLabel: 'కొత్త ట్యాబ్‌లో GitHub లో అక్నాలెడ్జ్‌మెంట్స్ చదవండి',
      contributorsLabel: 'కొత్త ట్యాబ్‌లో GitHub లో కంట్రిబ్యూటర్స్‌ని చూడండి',
    },
    footer: {
      copyright: '© 2026 YT ఆటోలైక్. MIT లైసెన్స్ కింద విడుదల చేయబడింది.',
      issueLabel: 'కొత్త ట్యాబ్‌లో GitHub లో సమస్యను నివేదించండి',
    },
  }),
  kn: createResource({
    accessibility: { skipLink: 'ಮುಖ್ಯ ವಿಷಯಕ್ಕೆ ಹೋಗಿ' },
    viewport: {
      title: 'ವ್ಯೂಪೋರ್ಟ್ ಬೆಂಬಲಿಸಿಲ್ಲ',
      body: 'ಈ ಪುಟವನ್ನು <strong>280 px</strong> ಮತ್ತು <strong>3840 px</strong> ಅಗಲದ ಪರದೆಗಳಿಗಾಗಿ ಆಪ್ಟಿಮೈಸ್ ಮಾಡಲಾಗಿದೆ. ದಯವಿಟ್ಟು ನಿಮ್ಮ ಬ್ರೌಸರ್ ವಿಂಡೋವನ್ನು ಮರುಗಾತ್ರಗೊಳಿಸಿ ಅಥವಾ ಬೆಂಬಲಿತ ಸಾಧನಕ್ಕೆ ಬದಲಾಯಿಸಿ.',
      hint: 'ಪ್ರಸ್ತುತ ಅಗಲವು ಬೆಂಬಲಿತ ಶ್ರೇಣಿಯ ಹೊರಗಿದೆ.',
    },
    nav: {
      menuOpenLabel: 'ನ್ಯಾವಿಗೇಷನ್ ಮೆನು ತೆರೆಯಿರಿ',
      menuCloseLabel: 'ನ್ಯಾವಿಗೇಷನ್ ಮೆನು ಮುಚ್ಚಿ',
      features: 'ವೈಶಿಷ್ಟ್ಯಗಳು',
      modes: 'ಆಟೋ-ಲೈಕ್ ಮೋಡ್‌ಗಳು',
      marketplace: 'ಮಾರುಕಟ್ಟೆ ಸ್ಥಿತಿ',
      manual: 'ಹಸ್ತಚಾಲಿತ ಅನುಸ್ಥಾಪನಾ ಮಾರ್ಗದರ್ಶಿ',
      privacy: 'ಗೌಪ್ಯತೆ',
      thanks: 'ಧನ್ಯವಾದಗಳು',
    },
    language: { label: 'ಭಾಷೆ' },
    actions: {
      githubLabel: 'ಹೊಸ ಟ್ಯಾಬ್‌ನಲ್ಲಿ YT ಆಟೋಲೈಕ್ GitHub ರೆಪೊಸಿಟರಿಯನ್ನು ತೆರೆಯಿರಿ',
      linkedinLabel: 'ಹೊಸ ಟ್ಯಾಬ್‌ನಲ್ಲಿ ವಿಜಯ್ ಗಂಗಾಧರನ್ ಅವರ ಲಿಂಕ್ಡ್‌ಇನ್ ಪ್ರೊಫೈಲ್ ತೆರೆಯಿರಿ',
    },
    hero: {
      title: 'ಕ್ರಿಯೇಟರ್‌ಗಳಿಗೆ <span class="highlight">ಸ್ವಯಂಚಾಲಿತವಾಗಿ</span> ಬೆಂಬಲ ನೀಡಿ',
      body: 'ನೀವು YouTube ವೀಡಿಯೊಗಳು ಮತ್ತು ಶಾರ್ಟ್ಸ್‌ಗಳನ್ನು ನೋಡಿದ ನಂತರ ಸ್ವಯಂಚಾಲಿತವಾಗಿ ಲೈಕ್ ಮಾಡುವ ಗೌಪ್ಯತೆ-ಮೊದಲ ಬ್ರೌಸರ್ ವಿಸ್ತರಣೆ. ಇದನ್ನು ಹೊಂದಿಸಿ, ಮರೆತುಬಿಡಿ ಮತ್ತು ನಿಮ್ಮ ನೆಚ್ಚಿನ ಚಾನಲ್‌ಗಳಿಗೆ ಬೆಂಬಲ ನೀಡಿ.',
      marketplaceCta: 'ಮಾರುಕಟ್ಟೆ ಸ್ಥಿತಿ ವೀಕ್ಷಿಸಿ',
      manualCta: 'ಹಸ್ತಚಾಲಿತ ಅನುಸ್ಥಾಪನಾ ಮಾರ್ಗದರ್ಶಿ',
    },
    features: {
      title: 'YT ಆಟೋಲೈಕ್ ಏಕೆ?',
      modes: {
        title: 'ಆಟೋ-ಲೈಕ್ ಮೋಡ್‌ಗಳು',
        body: 'ಗ್ಲೋಬಲ್, ಕೇವಲ ಶಾರ್ಟ್ಸ್, ಕೇವಲ ವೀಡಿಯೊಗಳು ಅಥವಾ ವೈಟ್‌ಲಿಸ್ಟ್ ಮಾತ್ರ. ನಿಯಂತ್ರಣ ನಿಮ್ಮ ಕೈಯಲ್ಲಿದೆ.',
      },
      threshold: {
        title: 'ಕಸ್ಟಮ್ ಥ್ರೆಶೋಲ್ಡ್',
        body: 'ಆಟೋ-ಲೈಕ್ ಅನ್ನು ಪ್ರಚೋದಿಸಲು ವೀಕ್ಷಣಾ ಶೇಕಡಾವಾರು (10% ರಿಂದ 90%) ಹೊಂದಿಸಿ.',
      },
      private: {
        title: '100% ಗೌಪ್ಯತೆ',
        body: 'ಯಾವುದೇ ಸರ್ವರ್‌ಗಳಿಲ್ಲ. ಯಾವುದೇ ಟ್ರ್ಯಾಕಿಂಗ್ ಇಲ್ಲ. ಎಲ್ಲವೂ ನಿಮ್ಮ ಸಾಧನದಲ್ಲಿ ಸ್ಥಳೀಯವಾಗಿ ಉಳಿಯುತ್ತದೆ.',
      },
    },
    modes: {
      title: 'ಆಟೋ-ಲೈಕ್ ಮೋಡ್‌ಗಳು',
      global: {
        title: '🌐 ಗ್ಲೋಬಲ್',
        body: 'ಡೀಫಾಲ್ಟ್ ಮೋಡ್ — ಇದನ್ನು ಹೊಂದಿಸಿ ಮತ್ತು ಮರೆತುಬಿಡಿ! 🙌 ನಿಮ್ಮ ವೀಕ್ಷಣಾ ಮಿತಿಯನ್ನು ತಲುಪಿದ ನಂತರ YT ಆಟೋಲೈಕ್ ಸಾಮಾನ್ಯ YouTube ವೀಡಿಯೊಗಳು <strong>ಮತ್ತು</strong> ಶಾರ್ಟ್ಸ್ ಎರಡನ್ನೂ ಸ್ವಯಂಚಾಲಿತವಾಗಿ ಲೈಕ್ ಮಾಡುತ್ತದೆ. ನೀವು ಯೋಚಿಸದೆ ಎಲ್ಲವನ್ನೂ ನಿರ್ವಹಿಸಲು ಬಯಸಿದರೆ ಇದು ಪರಿಪೂರ್ಣವಾಗಿದೆ.',
      },
      shorts: {
        title: '⚡ ಕೇವಲ ಶಾರ್ಟ್ಸ್',
        body: 'ಶಾರ್ಟ್ಸ್-ಮಾತ್ರ ಲೇನ್! 🎬 ಆಟೋ-ಲೈಕ್‌ಗಳು ಕೇವಲ YouTube ಶಾರ್ಟ್ಸ್‌ನಲ್ಲಿ ಮಾತ್ರ ಕಾರ್ಯನಿರ್ವಹಿಸುತ್ತವೆ — ನೀವು ವೇಗವಾಗಿ ನೋಡುವ ಆ ಸಣ್ಣ ಲಂಬ ವೀಡಿಯೊಗಳು. ಶಾರ್ಟ್-ಫಾರ್ಮ್ ಕ್ರಿಯೇಟರ್‌ಗಳಿಗೆ ಬೆಂಬಲ ನೀಡಲು ನೀವು ಇಷ್ಟಪಡುತ್ತಿದ್ದರೆ ಮತ್ತು ಉದ್ದನೆಯ ವೀಡಿಯೊಗಳನ್ನು ನೀವೇ ಹಸ್ತಚಾಲಿತವಾಗಿ ಲೈಕ್ ಮಾಡಲು ಬಯಸಿದರೆ ಇದು ಅದ್ಭುತವಾಗಿದೆ.',
      },
      videos: {
        title: '🎞️ ಕೇವಲ ವೀಡಿಯೊಗಳು',
        body: 'ಉದ್ದನೆಯ ರೂಪವನ್ನು ಇಷ್ಟಪಡುವವರಿಗಾಗಿ. 📺 ಕೇವಲ ಪ್ರಮಾಣಿತ YouTube ವೀಡಿಯೊಗಳಿಗೆ ಮಾತ್ರ (ಶಾರ್ಟ್ಸ್‌ಗಲ್ಲ) ಆಟೋ-ಲೈಕ್ ಕಾರ್ಯನಿರ್ವಹಿಸುತ್ತದೆ. ನೀವು ಶಾರ್ಟ್ಸ್ ಬಗ್ಗೆ ಆಯ್ದುಕೊಂಡಿದ್ದರೆ ಮತ್ತು ನೀವು ನಿಜವಾಗಿಯೂ ಕುಳಿತು ನೋಡುವ ಚಾನಲ್‌ಗಳಿಗೆ ಸ್ವಯಂಚಾಲಿತವಾಗಿ ಬೆಂಬಲ ನೀಡಲು ಬಯಸಿದರೆ ಆದರ್ಶವಾಗಿದೆ.',
      },
      whitelist: {
        title: '✅ ವೈಟ್‌ಲಿಸ್ಟ್ ಮಾತ್ರ',
        body: 'ನಿಮ್ಮ VIP ಪಟ್ಟಿ. 🌟 ನೀವು ಸ್ಪಷ್ಟವಾಗಿ ಅನುಮೋದಿಸಿದ ಚಾನಲ್‌ಗಳಿಗೆ <em>ಮಾತ್ರ</em> ಆಟೋ-ಲೈಕ್‌ಗಳು ಸಂಭವಿಸುತ್ತವೆ. ಉಳಿದ ಯಾರಿಗೂ? ಸ್ವಯಂಚಾಲಿತ ಲೈಕ್ ಇಲ್ಲ. ನಿಮಗೆ ನಿಖರವಾದ ನಿಯಂತ್ರಣ ಬೇಕಿದ್ದರೆ ಇದು ಪರಿಪೂರ್ಣ — ನಿಮ್ಮ ನೆಚ್ಚಿನ ಕ್ರಿಯೇಟರ್‌ಗಳು ಮಾತ್ರ ಸ್ವಯಂಚಾಲಿತವಾಗಿ ಲೈಕ್ ಪಡೆಯುತ್ತಾರೆ.',
      },
    },
    browser: {
      chromeAlt: 'ಕ್ರೋಮ್ ಲೋಗೋ',
      edgeAlt: 'ಮೈಕ್ರೋಸಾಫ್ಟ್ ಎಡ್ಜ್ ಲೋಗೋ',
      firefoxAlt: 'ಫೈರ್‌ಫಾಕ್ಸ್ ಲೋಗೋ',
    },
    marketplace: {
      title: 'ಮಾರುಕಟ್ಟೆ ಸ್ಥಿತಿ',
      comingSoon: 'ಶೀಘ್ರದಲ್ಲೇ ಬರಲಿದೆ',
      pending: 'ಇನ್ನೂ ಬಿಡುಗಡೆಯಾಗಿಲ್ಲ',
      pendingBody: 'ಮಾರುಕಟ್ಟೆಯಲ್ಲಿ ಇನ್ನೂ ಬಿಡುಗಡೆಯಾಗಿಲ್ಲ.',
      chrome: {
        title: 'ಕ್ರೋಮ್ ವೆಬ್ ಸ್ಟೋರ್',
        body: 'ಕ್ರೋಮ್ ವೆಬ್ ಸ್ಟೋರ್ ಮಾರುಕಟ್ಟೆ ಪಟ್ಟಿ ಶೀಘ್ರದಲ್ಲೇ ಬರಲಿದೆ.',
        cardLabel: 'ಕ್ರೋಮ್ ವೆಬ್ ಸ್ಟೋರ್ ಮಾರುಕಟ್ಟೆ ಸ್ಥಿತಿ: ಶೀಘ್ರದಲ್ಲೇ ಬರಲಿದೆ',
      },
      edge: {
        title: 'ಮೈಕ್ರೋಸಾಫ್ಟ್ ಎಡ್ಜ್ ಆಡ್-ಆನ್‌ಗಳು',
        cardLabel: 'ಮೈಕ್ರೋಸಾಫ್ಟ್ ಎಡ್ಜ್ ಆಡ್-ಆನ್‌ಗಳ ಮಾರುಕಟ್ಟೆ ಸ್ಥಿತಿ: ಇನ್ನೂ ಬಿಡುಗಡೆಯಾಗಿಲ್ಲ',
      },
      firefox: {
        title: 'ಫೈರ್‌ಫಾಕ್ಸ್ ಆಡ್-ಆನ್‌ಗಳು',
        cardLabel: 'ಫೈರ್‌ಫಾಕ್ಸ್ ಆಡ್-ಆನ್‌ಗಳ ಮಾರುಕಟ್ಟೆ ಸ್ಥಿತಿ: ಇನ್ನೂ ಬಿಡುಗಡೆಯಾಗಿಲ್ಲ',
      },
    },
    manual: {
      title: 'ಹಸ್ತಚಾಲಿತ ಅನುಸ್ಥಾಪನಾ ಮಾರ್ಗದರ್ಶಿ',
      intro:
        'ನಿಮ್ಮ ಬ್ರೌಸರ್‌ಗಾಗಿ ಮಾರುಕಟ್ಟೆ ಪಟ್ಟಿ ಇನ್ನೂ ಲಭ್ಯವಿಲ್ಲದಿದ್ದಾಗ ಈ ಮಾರ್ಗದರ್ಶಿಯನ್ನು ಬಳಸಿ. ಹಸ್ತಚಾಲಿತ ಅನುಸ್ಥಾಪನೆಗಳು ನೀವು ಸ್ಥಳೀಯವಾಗಿ ಇರಿಸುವ ಫೈಲ್‌ಗಳ ಮೇಲೆ ಅವಲಂಬಿತವಾಗಿರುತ್ತವೆ, ಆದ್ದರಿಂದ ಡೌನ್‌ಲೋಡ್ ಮಾಡಿದ ಪ್ಯಾಕೇಜ್ ಮತ್ತು ಹೊರತೆಗೆಯಲಾದ ಫೋಲ್ಡರ್ ಅನ್ನು ಅನುಸ್ಥಾಪನೆಯ ಭಾಗವಾಗಿ ಪರಿಗಣಿಸಿ.',
      shared: {
        permanentFolder:
          'ZIP ಅನ್ನು <strong>ಶಾಶ್ವತ ಫೋಲ್ಡರ್‌</strong>ಗೆ ಸರಿಸಿ — ಅದನ್ನು ನಂತರ ಅಳಿಸಬೇಡಿ ಇಲ್ಲದಿದ್ದರೆ ವಿಸ್ತರಣೆ ಕಾರ್ಯನಿರ್ವಹಿಸುವುದಿಲ್ಲ.',
        extract: 'ಆ ಫೋಲ್ಡರ್ ಒಳಗೆ ZIP ಅನ್ನು ಹೊರತೆಗೆಯಿರಿ.',
        loadUnpacked:
          '<strong>ಲೋಡ್ ಅನ್‌ಪ್ಯಾಕ್ಡ್</strong> ಕ್ಲಿಕ್ ಮಾಡಿ ಮತ್ತು ಹೊರತೆಗೆಯಲಾದ ಫೋಲ್ಡರ್ ಅನ್ನು ಆಯ್ಕೆ ಮಾಡಿ.',
      },
      chrome: {
        title: 'ಕ್ರೋಮ್ / ಕ್ರೋಮಿಯಂ',
        cardLabel: 'ಕ್ರೋಮ್ ಮತ್ತು ಕ್ರೋಮಿಯಂಗಾಗಿ ಹಸ್ತಚಾಲಿತ ಅನುಸ್ಥಾಪನಾ ಹಂತಗಳು',
        step1Prefix: 'ಡೌನ್‌ಲೋಡ್ ಮಾಡಿ',
        or: 'ಅಥವಾ',
        chromeZipLabel:
          'ಹೊಸ ಟ್ಯಾಬ್‌ನಲ್ಲಿ GitHub ಬಿಡುಗಡೆಗಳಿಂದ ಇತ್ತೀಚಿನ ಕ್ರೋಮ್ ZIP ಅನ್ನು ಡೌನ್‌ಲೋಡ್ ಮಾಡಿ',
        chromiumZipLabel:
          'ಹೊಸ ಟ್ಯಾಬ್‌ನಲ್ಲಿ GitHub ಬಿಡುಗಡೆಗಳಿಂದ ಇತ್ತೀಚಿನ ಕ್ರೋಮಿಯಂ ZIP ಅನ್ನು ಡೌನ್‌ಲೋಡ್ ಮಾಡಿ',
        openExtensions: 'ನಿಮ್ಮ ಬ್ರೌಸರ್‌ನಲ್ಲಿ <code>chrome://extensions/</code> ತೆರೆಯಿರಿ.',
        developerMode: '<strong>ಡೆವಲಪರ್ ಮೋಡ್</strong> ಅನ್ನು ಆನ್ ಮಾಡಿ (ಮೇಲಿನ-ಬಲ ಸ್ವಿಚ್).',
      },
      firefox: {
        title: 'ಫೈರ್‌ಫಾಕ್ಸ್',
        cardLabel: 'ಫೈರ್‌ಫಾಕ್ಸ್‌ಗಾಗಿ ಹಸ್ತಚಾಲಿತ ಅನುಸ್ಥಾಪನಾ ಹಂತಗಳು',
        step1Prefix: 'ಡೌನ್‌ಲೋಡ್ ಮಾಡಿ',
        firefoxZipLabel:
          'ಹೊಸ ಟ್ಯಾಬ್‌ನಲ್ಲಿ GitHub ಬಿಡುಗಡೆಗಳಿಂದ ಇತ್ತೀಚಿನ ಫೈರ್‌ಫಾಕ್ಸ್ ZIP ಅನ್ನು ಡೌನ್‌ಲೋಡ್ ಮಾಡಿ',
        permanentFolder:
          'ZIP ಅನ್ನು <strong>ಶಾಶ್ವತ ಫೋಲ್ಡರ್‌</strong>ಗೆ ಸರಿಸಿ — ಅನುಸ್ಥಾಪನೆಗೊಂಡಿರಲು ಫೈರ್‌ಫಾಕ್ಸ್‌ಗೆ ಅದು ಅಲ್ಲಿಯೇ ಇರಬೇಕು.',
        openDebugging:
          'ಫೈರ್‌ಫಾಕ್ಸ್‌ನಲ್ಲಿ <code>about:debugging#/runtime/this-firefox</code> ತೆರೆಯಿರಿ.',
        loadTemporary: '<strong>ತಾತ್ಕಾಲಿಕ ಆಡ್-ಆನ್ ಲೋಡ್ ಮಾಡಿ...</strong> ಕ್ಲಿಕ್ ಮಾಡಿ',
        selectZip: 'ನೀವು ಡೌನ್‌ಲೋಡ್ ಮಾಡಿದ ZIP ಫೈಲ್ ಅನ್ನು ಆಯ್ಕೆ ಮಾಡಿ.',
      },
      edge: {
        title: 'ಮೈಕ್ರೋಸಾಫ್ಟ್ ಎಡ್ಜ್',
        cardLabel: 'ಮೈಕ್ರೋಸಾಫ್ಟ್ ಎಡ್ಜ್‌ಗಾಗಿ ಹಸ್ತಚಾಲಿತ ಅನುಸ್ಥಾಪನಾ ಹಂತಗಳು',
        step1Prefix: 'ಡೌನ್‌ಲೋಡ್ ಮಾಡಿ',
        edgeZipLabel:
          'ಹೊಸ ಟ್ಯಾಬ್‌ನಲ್ಲಿ GitHub ಬಿಡುಗಡೆಗಳಿಂದ ಇತ್ತೀಚಿನ ಎಡ್ಜ್ ZIP ಅನ್ನು ಡೌನ್‌ಲೋಡ್ ಮಾಡಿ',
        openExtensions: 'ಎಡ್ಜ್‌ನಲ್ಲಿ <code>edge://extensions/</code> ತೆರೆಯಿರಿ.',
        developerMode: '<strong>ಡೆವಲಪರ್ ಮೋಡ್</strong> ಅನ್ನು ಆನ್ ಮಾಡಿ (ಎಡ ಸೈಡ್‌ಬಾರ್).',
      },
    },
    privacy: {
      title: 'ನಿಮ್ಮ ಡೇಟಾ, ನಿಮ್ಮ ಹಕ್ಕು',
      body: 'ಇತರ ವಿಸ್ತರಣೆಗಳಿಗಿಂತ ಭಿನ್ನವಾಗಿ, YT ಆಟೋಲೈಕ್ ಸಂಪೂರ್ಣವಾಗಿ ಓಪನ್-ಸೋರ್ಸ್ ಮತ್ತು ಸ್ಥಳೀಯವಾಗಿದೆ. ನಿಮ್ಮ ವೀಕ್ಷಣಾ ಇತಿಹಾಸವನ್ನು ನಾವು ಎಂದಿಗೂ ಸಂಗ್ರಹಿಸುವುದಿಲ್ಲ, ಮಾರಾಟ ಮಾಡುವುದಿಲ್ಲ ಅಥವಾ ನೋಡುವುದಿಲ್ಲ.',
      linkLabel: 'ಹೊಸ ಟ್ಯಾಬ್‌ನಲ್ಲಿ GitHub ನಲ್ಲಿ YT ಆಟೋಲೈಕ್ ಗೌಪ್ಯತೆ ನೀತಿಯನ್ನು ಓದಿ',
    },
    thanks: {
      title: 'ಧನ್ಯವಾದಗಳು',
      body: 'ಓಪನ್-ಸೋರ್ಸ್ ಪರಿಕರಗಳು, ಹಿಂದಿನ ಕಲೆ ಮತ್ತು ಸಮುದಾಯದ ಕೊಡುಗೆಗಳಿಂದಾಗಿ YT ಆಟೋಲೈಕ್ ಅಸ್ತಿತ್ವದಲ್ಲಿದೆ.',
      acknowledgementsLabel: 'ಹೊಸ ಟ್ಯಾಬ್‌ನಲ್ಲಿ GitHub ನಲ್ಲಿ ಸ್ವೀಕೃತಿಗಳನ್ನು ಓದಿ',
      contributorsLabel: 'ಹೊಸ ಟ್ಯಾಬ್‌ನಲ್ಲಿ GitHub ನಲ್ಲಿ ಕೊಡುಗೆದಾರರನ್ನು ವೀಕ್ಷಿಸಿ',
    },
    footer: {
      copyright: '© 2026 YT ಆಟೋಲೈಕ್. MIT ಪರವಾನಗಿ ಅಡಿಯಲ್ಲಿ ಬಿಡುಗಡೆ ಮಾಡಲಾಗಿದೆ.',
      issueLabel: 'ಹೊಸ ಟ್ಯಾಬ್‌ನಲ್ಲಿ GitHub ನಲ್ಲಿ ಸಮಸ್ಯೆಯನ್ನು ವರದಿ ಮಾಡಿ',
    },
  }),
  ml: createResource({
    accessibility: { skipLink: 'പ്രധാന ഉള്ളടക്കത്തിലേക്ക് പോകുക' },
    viewport: {
      title: 'വ്യൂപോർട്ട് പിന്തുണയ്ക്കുന്നില്ല',
      body: 'ഈ പേജ് <strong>280 px</strong> നും <strong>3840 px</strong> നും ഇടയിൽ വീതിയുള്ള സ്ക്രീനുകൾക്കായി ഒപ്റ്റിമൈസ് ചെയ്തിരിക്കുന്നു. ദയവായി നിങ്ങളുടെ ബ്രൗസർ വിൻഡോയുടെ വലിപ്പം മാറ്റുക അല്ലെങ്കിൽ പിന്തുണയ്ക്കുന്ന ഉപകരണത്തിലേക്ക് മാറുക.',
      hint: 'നിലവിലെ വീതി പിന്തുണയ്ക്കുന്ന പരിധിക്ക് പുറത്താണ്.',
    },
    nav: {
      menuOpenLabel: 'നാവിഗേഷൻ മെനു തുറക്കുക',
      menuCloseLabel: 'നാവിഗേഷൻ മെനു അടയ്ക്കുക',
      features: 'സവിശേഷതകൾ',
      modes: 'ഓട്ടോ-ലൈക്ക് മോഡുകൾ',
      marketplace: 'മാർക്കറ്റ്പ്ലേസ് സ്റ്റാറ്റസ്',
      manual: 'മാനുവൽ ഇൻസ്റ്റലേഷൻ ഗൈഡ്',
      privacy: 'സ്വകാര്യത',
      thanks: 'നന്ദി',
    },
    language: { label: 'ഭാഷ' },
    actions: {
      githubLabel: 'ഒരു പുതിയ ടാബിൽ YT ഓട്ടോലൈക്ക് GitHub റിപ്പോസിറ്ററി തുറക്കുക',
      linkedinLabel: 'ഒരു പുതിയ ടാബിൽ വിജയ് ഗംഗാധരൻ്റെ ലിങ്ക്ഡ്ഇൻ പ്രൊഫൈൽ തുറക്കുക',
    },
    hero: {
      title: 'ക്രിയേറ്റർമാരെ <span class="highlight">യാന്ത്രികമായി</span> പിന്തുണയ്ക്കുക',
      body: 'നിങ്ങൾ YouTube വീഡിയോകളും ഷോർട്ട്സുകളും കണ്ടതിനുശേഷം അവ യാന്ത്രികമായി ലൈക്ക് ചെയ്യുന്ന പ്രൈവസി-ഫസ്റ്റ് ബ്രൗസർ എക്സ്റ്റൻഷൻ. ഇത് സജ്ജമാക്കുക, മറക്കുക, നിങ്ങളുടെ പ്രിയപ്പെട്ട ചാനലുകളെ പിന്തുണയ്ക്കുക.',
      marketplaceCta: 'മാർക്കറ്റ്പ്ലേസ് സ്റ്റാറ്റസ് കാണുക',
      manualCta: 'മാനുവൽ ഇൻസ്റ്റലേഷൻ ഗൈഡ്',
    },
    features: {
      title: 'എന്തുകൊണ്ട് YT ഓട്ടോലൈക്ക്?',
      modes: {
        title: 'ഓട്ടോ-ലൈക്ക് മോഡുകൾ',
        body: 'ഗ്ലോബൽ, ഷോർട്ട്സ് മാത്രം, വീഡിയോകൾ മാത്രം, അല്ലെങ്കിൽ വൈറ്റ്‌ലിസ്റ്റ് മാത്രം. നിയന്ത്രണം നിങ്ങളുടെ കൈകളിലാണ്.',
      },
      threshold: {
        title: 'കസ്റ്റം ത്രെഷോൾഡ്',
        body: 'ഓട്ടോ-ലൈക്ക് പ്രവർത്തിപ്പിക്കുന്നതിന് വാച്ച് ശതമാനം (10% മുതൽ 90% വരെ) സജ്ജമാക്കുക.',
      },
      private: {
        title: '100% സ്വകാര്യത',
        body: 'സെർവറുകളില്ല. ട്രാക്കിംഗ് ഇല്ല. എല്ലാം നിങ്ങളുടെ ഉപകരണത്തിൽ പ്രാദേശികമായി തുടരുന്നു.',
      },
    },
    modes: {
      title: 'ഓട്ടോ-ലൈക്ക് മോഡുകൾ',
      global: {
        title: '🌐 ഗ്ലോബൽ',
        body: 'ഡിഫോൾട്ട് മോഡ് — ഇത് സജ്ജമാക്കി മറക്കുക! 🙌 നിങ്ങളുടെ വാച്ച് ത്രെഷോൾഡ് എത്തിക്കഴിഞ്ഞാൽ YT ഓട്ടോലൈക്ക് സാധാരണ YouTube വീഡിയോകളും <strong>അതുപോലെ</strong> ഷോർട്ട്സുകളും യാന്ത്രികമായി ലൈക്ക് ചെയ്യും. നിങ്ങൾ ചിന്തിക്കാതെ എല്ലാം കൈകാര്യം ചെയ്യാൻ ആഗ്രഹിക്കുന്നുവെങ്കിൽ ഇത് തികച്ചും അനുയോജ്യമാണ്.',
      },
      shorts: {
        title: '⚡ ഷോർട്ട്സ് മാത്രം',
        body: 'ഷോർട്ട്സിന് മാത്രമുള്ള പാത! 🎬 ഓട്ടോ-ലൈക്കുകൾ YouTube ഷോർട്ട്സിൽ മാത്രമേ പ്രവർത്തിക്കൂ — നിങ്ങൾ വേഗത്തിൽ കാണുന്ന ചെറിയ ലംബ വീഡിയോകൾ. ഷോർട്ട്-ഫോം ക്രിയേറ്റർമാരെ പിന്തുണയ്ക്കാൻ നിങ്ങൾ ആഗ്രഹിക്കുകയും ദൈർഘ്യമേറിയ വീഡിയോകൾ സ്വയം ലൈക്ക് ചെയ്യാൻ താൽപ്പര്യപ്പെടുകയും ചെയ്യുന്നുവെങ്കിൽ ഇത് വളരെ നല്ലതാണ്.',
      },
      videos: {
        title: '🎞️ വീഡിയോകൾ മാത്രം',
        body: 'ദൈർഘ്യമേറിയ വീഡിയോകൾ ഇഷ്ടപ്പെടുന്നവർക്ക്. 📺 സാധാരണ YouTube വീഡിയോകൾക്ക് (ഷോർട്ട്സ് അല്ല) മാത്രമേ ഓട്ടോ-ലൈക്ക് ലഭിക്കൂ. ഷോർട്ട്സുകളുടെ കാര്യത്തിൽ നിങ്ങൾ തിരഞ്ഞെടുപ്പ് നടത്തുകയും എന്നാൽ നിങ്ങൾ ഇരുന്ന് കാണുന്ന ചാനലുകളെ യാന്ത്രികമായി പിന്തുണയ്ക്കാൻ ആഗ്രഹിക്കുകയും ചെയ്യുന്നുവെങ്കിൽ ഇത് അനുയോജ്യമാണ്.',
      },
      whitelist: {
        title: '✅ വൈറ്റ്‌ലിസ്റ്റ് മാത്രം',
        body: 'നിങ്ങളുടെ VIP പട്ടിക. 🌟 നിങ്ങൾ വ്യക്തമായി അംഗീകരിച്ച ചാനലുകൾക്ക് <em>മാത്രമേ</em> ഓട്ടോ-ലൈക്കുകൾ സംഭവിക്കൂ. മറ്റെല്ലാവർക്കും? യാന്ത്രിക ലൈക്ക് ഇല്ല. നിങ്ങൾക്ക് കൃത്യമായ നിയന്ത്രണം വേണമെങ്കിൽ ഇത് തികച്ചും അനുയോജ്യമാണ് — നിങ്ങളുടെ പ്രിയപ്പെട്ട ക്രിയേറ്റർമാർക്ക് മാത്രമേ യാന്ത്രികമായി ലൈക്ക് ലഭിക്കൂ.',
      },
    },
    browser: {
      chromeAlt: 'ക്രോം ലോഗോ',
      edgeAlt: 'മൈക്രോസോഫ്റ്റ് എഡ്ജ് ലോഗോ',
      firefoxAlt: 'ഫയർഫോക്സ് ലോഗോ',
    },
    marketplace: {
      title: 'മാർക്കറ്റ്പ്ലേസ് സ്റ്റാറ്റസ്',
      comingSoon: 'ഉടൻ വരുന്നു',
      pending: 'ഇനിയും പുറത്തിറങ്ങിയിട്ടില്ല',
      pendingBody: 'മാർക്കറ്റ്പ്ലേസിൽ ഇനിയും പുറത്തിറങ്ങിയിട്ടില്ല.',
      chrome: {
        title: 'ക്രോം വെബ് സ്റ്റോർ',
        body: 'ക്രോം വെബ് സ്റ്റോർ മാർക്കറ്റ്പ്ലേസ് ലിസ്റ്റിംഗ് ഉടൻ വരുന്നു.',
        cardLabel: 'ക്രോം വെബ് സ്റ്റോർ മാർക്കറ്റ്പ്ലേസ് സ്റ്റാറ്റസ്: ഉടൻ വരുന്നു',
      },
      edge: {
        title: 'മൈക്രോസോഫ്റ്റ് എഡ്ജ് ആഡ്-ഓണുകൾ',
        cardLabel:
          'മൈക്രോസോഫ്റ്റ് എഡ്ജ് ആഡ്-ഓണുകളുടെ മാർക്കറ്റ്പ്ലേസ് സ്റ്റാറ്റസ്: ഇനിയും പുറത്തിറങ്ങിയിട്ടില്ല',
      },
      firefox: {
        title: 'ഫയർഫോക്സ് ആഡ്-ഓണുകൾ',
        cardLabel:
          'ഫയർഫോക്സ് ആഡ്-ഓണുകളുടെ മാർക്കറ്റ്പ്ലേസ് സ്റ്റാറ്റസ്: ഇനിയും പുറത്തിറങ്ങിയിട്ടില്ല',
      },
    },
    manual: {
      title: 'മാനുവൽ ഇൻസ്റ്റലേഷൻ ഗൈഡ്',
      intro:
        'നിങ്ങളുടെ ബ്രൗസറിനായി ഒരു മാർക്കറ്റ്പ്ലേസ് ലിസ്റ്റിംഗ് ഇതുവരെ ലഭ്യമല്ലാത്തപ്പോൾ ഈ ഗൈഡ് ഉപയോഗിക്കുക. മാനുവൽ ഇൻസ്റ്റാളുകൾ നിങ്ങൾ പ്രാദേശികമായി സൂക്ഷിക്കുന്ന ഫയലുകളെ ആശ്രയിച്ചിരിക്കുന്നു, അതിനാൽ ഡൗൺലോഡ് ചെയ്ത പാക്കേജും എക്സ്ട്രാക്റ്റ് ചെയ്ത ഫോൾഡറും ഇൻസ്റ്റാളേഷൻ്റെ ഭാഗമായി കണക്കാക്കുക.',
      shared: {
        permanentFolder:
          'ZIP ഒരു <strong>സ്ഥിരമായ ഫോൾഡറിലേക്ക്</strong> മാറ്റുക — ഇത് പിന്നീട് ഇല്ലാതാക്കരുത്, അല്ലാത്തപക്ഷം എക്സ്റ്റൻഷൻ പ്രവർത്തിക്കില്ല.',
        extract: 'ആ ഫോൾഡറിനുള്ളിൽ ZIP എക്സ്ട്രാക്റ്റ് ചെയ്യുക.',
        loadUnpacked:
          '<strong>ലോഡ് അൺപാക്ക്ഡ്</strong> ക്ലിക്ക് ചെയ്ത് എക്സ്ട്രാക്റ്റ് ചെയ്ത ഫോൾഡർ തിരഞ്ഞെടുക്കുക.',
      },
      chrome: {
        title: 'ക്രോം / ക്രോമിയം',
        cardLabel: 'ക്രോം, ക്രോമിയം എന്നിവയ്ക്കുള്ള മാനുവൽ ഇൻസ്റ്റലേഷൻ ഘട്ടങ്ങൾ',
        step1Prefix: 'ഡൗൺലോഡ് ചെയ്യുക',
        or: 'അല്ലെങ്കിൽ',
        chromeZipLabel:
          'പുതിയ ടാബിൽ GitHub റിലീസുകളിൽ നിന്ന് ഏറ്റവും പുതിയ ക്രോം ZIP ഡൗൺലോഡ് ചെയ്യുക',
        chromiumZipLabel:
          'പുതിയ ടാബിൽ GitHub റിലീസുകളിൽ നിന്ന് ഏറ്റവും പുതിയ ക്രോമിയം ZIP ഡൗൺലോഡ് ചെയ്യുക',
        openExtensions: 'നിങ്ങളുടെ ബ്രൗസറിൽ <code>chrome://extensions/</code> തുറക്കുക.',
        developerMode: '<strong>ഡെവലപ്പർ മോഡ്</strong> ഓണാക്കുക (മുകളിൽ-വലത് സ്വിച്ച്).',
      },
      firefox: {
        title: 'ഫയർഫോക്സ്',
        cardLabel: 'ഫയർഫോക്സിനുള്ള മാനുവൽ ഇൻസ്റ്റലേഷൻ ഘട്ടങ്ങൾ',
        step1Prefix: 'ഡൗൺലോഡ് ചെയ്യുക',
        firefoxZipLabel:
          'പുതിയ ടാബിൽ GitHub റിലീസുകളിൽ നിന്ന് ഏറ്റവും പുതിയ ഫയർഫോക്സ് ZIP ഡൗൺലോഡ് ചെയ്യുക',
        permanentFolder:
          'ZIP ഒരു <strong>സ്ഥിരമായ ഫോൾഡറിലേക്ക്</strong> മാറ്റുക — ഇൻസ്റ്റാൾ ചെയ്ത് തുടരാൻ ഫയർഫോക്സിന് അത് അവിടെ ആവശ്യമാണ്.',
        openDebugging: 'ഫയർഫോക്സിൽ <code>about:debugging#/runtime/this-firefox</code> തുറക്കുക.',
        loadTemporary: '<strong>താൽക്കാലിക ആಡ್-ഓൺ ലോഡ് ചെയ്യുക...</strong> ക്ലിക്ക് ചെയ്യുക',
        selectZip: 'നിങ്ങൾ ഡൗൺലോഡ് ചെയ്ത ZIP ഫയൽ തിരഞ്ഞെടുക്കുക.',
      },
      edge: {
        title: 'മൈക്രോസോഫ്റ്റ് എഡ്ജ്',
        cardLabel: 'മൈക്രോസോഫ്റ്റ് എഡ്ജിനുള്ള മാനുവൽ ഇൻസ്റ്റലേഷൻ ഘട്ടങ്ങൾ',
        step1Prefix: 'ഡൗൺലോഡ് ചെയ്യുക',
        edgeZipLabel:
          'പുതിയ ടാബിൽ GitHub റിലീസുകളിൽ നിന്ന് ഏറ്റവും പുതിയ എഡ്ജ് ZIP ഡൗൺലോഡ് ചെയ്യുക',
        openExtensions: 'എഡ്ജിൽ <code>edge://extensions/</code> തുറക്കുക.',
        developerMode: '<strong>ഡെവലപ്പർ മോഡ്</strong> ഓണാക്കുക (ഇടത് സൈഡ്ബാർ).',
      },
    },
    privacy: {
      title: 'നിങ്ങളുടെ ഡാറ്റ, നിങ്ങളുടെ അവകാശം',
      body: 'മറ്റ് എക്സ്റ്റൻഷനുകളിൽ നിന്ന് വ്യത്യസ്തമായി, YT ഓട്ടോലൈക്ക് പൂർണ്ണമായും ഓപ്പൺ-സോഴ്സും പ്രാദേശികവുമാണ്. ഞങ്ങൾ ഒരിക്കലും നിങ്ങളുടെ വാച്ച് ഹിസ്റ്ററി ശേഖരിക്കുകയോ വിൽക്കുകയോ കാണുകയോ ഇല്ല.',
      linkLabel: 'ഒരു പുതിയ ടാബിൽ GitHub-ൽ YT ഓട്ടോലൈക്ക് സ്വകാര്യതാ നയം വായിക്കുക',
    },
    thanks: {
      title: 'നന്ദി',
      body: 'ഓപ്പൺ-സോഴ്സ് ടൂളുകൾ, മുൻകാല വർക്കുകൾ, കമ്മ്യൂണിറ്റി സംഭാവനകൾ എന്നിവ കാരണമാണ് YT ഓട്ടോലൈക്ക് നിലനിൽക്കുന്നത്.',
      acknowledgementsLabel: 'ഒരു പുതിയ ടാബിൽ GitHub-ൽ അക്നോളജ്മെൻ്റുകൾ വായിക്കുക',
      contributorsLabel: 'ഒരു പുതിയ ടാബിൽ GitHub-ൽ സംഭാവകർ കാണുക',
    },
    footer: {
      copyright: '© 2026 YT ഓട്ടോലൈക്ക്. MIT ലൈസൻസിന് കീഴിൽ പുറത്തിറക്കി.',
      issueLabel: 'ഒരു പുതിയ ടാബിൽ GitHub-ൽ പ്രശ്നം റിപ്പോർട്ട് ചെയ്യുക',
    },
  }),
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

if (typeof window !== 'undefined') {
  window.YTAutoLikeI18n = {
    fallbackLanguage: FALLBACK_LANGUAGE,
    resources,
  };
}

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
