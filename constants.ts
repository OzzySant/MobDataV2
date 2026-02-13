export const BIBLE_VERSIONS = [
  { id: 'nvi', label: 'Nova Versão Internacional (NVI)' },
  { id: 'acf', label: 'Almeida Corrigida Fiel (ACF)' },
  { id: 'aa', label: 'Almeida e Atualizada (AA)' },
];

export const BIBLE_API_URLS: Record<string, string[]> = {
  nvi: [
    'https://raw.githubusercontent.com/thiagobodruk/biblia/master/json/nvi.json',
    'https://raw.githubusercontent.com/thiagobodruk/biblia/main/json/nvi.json',
    'https://cdn.jsdelivr.net/gh/thiagobodruk/biblia/json/nvi.json'
  ],
  acf: [
    'https://raw.githubusercontent.com/thiagobodruk/biblia/master/json/acf.json',
    'https://raw.githubusercontent.com/thiagobodruk/biblia/main/json/acf.json',
    'https://cdn.jsdelivr.net/gh/thiagobodruk/biblia/json/acf.json'
  ],
  aa: [
    'https://raw.githubusercontent.com/thiagobodruk/biblia/master/json/aa.json',
    'https://raw.githubusercontent.com/thiagobodruk/biblia/main/json/aa.json',
    'https://cdn.jsdelivr.net/gh/thiagobodruk/biblia/json/aa.json'
  ]
};

// Estratégia de Fallback Robusta para a Harpa
export const HARPA_API_URLS = [
    // Daniel Liberato (Formato Objeto com verses - Mais completo)
    'https://raw.githubusercontent.com/DanielLiberato/Harpa-Crista-JSON/master/harpa_crista.json',
    // Thiago Bodruk (Formato Array simples)
    'https://raw.githubusercontent.com/thiagobodruk/biblia/master/json/harpa.json',
    // Fallback original (OzzySant)
    'https://raw.githubusercontent.com/OzzySant/Biblia-Harpa/main/harpa_crista_640_hinos.json'
];