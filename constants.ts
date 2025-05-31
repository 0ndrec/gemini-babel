
export interface Language {
  code: string;
  name: string;
  pluralForms?: string; // Optional: Specific plural forms string for .po header
}

export const LANGUAGES: Language[] = [
  { code: 'en', name: 'English', pluralForms: '"Plural-Forms: nplurals=2; plural=(n != 1);\\n"' },
  { code: 'es', name: 'Spanish', pluralForms: '"Plural-Forms: nplurals=2; plural=(n != 1);\\n"' },
  { code: 'fr', name: 'French', pluralForms: '"Plural-Forms: nplurals=2; plural=(n > 1);\\n"' },
  { code: 'de', name: 'German', pluralForms: '"Plural-Forms: nplurals=2; plural=(n != 1);\\n"' },
  { code: 'ja', name: 'Japanese', pluralForms: '"Plural-Forms: nplurals=1; plural=0;\\n"' },
  { code: 'zh-CN', name: 'Chinese (Simplified)', pluralForms: '"Plural-Forms: nplurals=1; plural=0;\\n"' },
  { code: 'hi', name: 'Hindi', pluralForms: '"Plural-Forms: nplurals=2; plural=(n != 1);\\n"' },
  { code: 'pt', name: 'Portuguese', pluralForms: '"Plural-Forms: nplurals=2; plural=(n != 1);\\n"' },
  { code: 'ru', name: 'Russian', pluralForms: '"Plural-Forms: nplurals=3; plural=(n%10==1 && n%100!=11 ? 0 : n%10>=2 && n%10<=4 && (n%100<10 || n%100>=20) ? 1 : 2);\\n"' },
  { code: 'ar', name: 'Arabic', pluralForms: '"Plural-Forms: nplurals=6; plural=(n==0 ? 0 : n==1 ? 1 : n==2 ? 2 : n%100>=3 && n%100<=10 ? 3 : n%100>=11 ? 4 : 5);\\n"' },
  { code: 'it', name: 'Italian', pluralForms: '"Plural-Forms: nplurals=2; plural=(n != 1);\\n"' },
  { code: 'ko', name: 'Korean', pluralForms: '"Plural-Forms: nplurals=1; plural=0;\\n"' },
  { code: 'he', name: 'Hebrew', pluralForms: '"Plural-Forms: nplurals=2; plural=(n != 1);\\n"' },
];
