import { BibleBook } from '../types';

// INSTRUÇÕES:
// 1. Vá em https://github.com/OzzySant/Biblia-Harpa
// 2. Encontre o arquivo da bíblia NVI (ex: nvi.json).
// 3. Copie o conteúdo e cole abaixo.

export const BIBLE_NVI: BibleBook[] = [
  {
    "abbrev": "gn",
    "name": "Gênesis",
    "chapters": [
      [
        "No princípio Deus criou os céus e a terra.",
        "Era a terra sem forma e vazia; trevas cobriam a face do abismo, e o Espírito de Deus se movia sobre a face das águas.",
        "Disse Deus: \"Haja luz\", e houve luz.",
        "Deus viu que a luz era boa, e separou a luz das trevas.",
        "Deus chamou à luz dia, e às trevas chamou noite. Passaram-se a tarde e a manhã; esse foi o primeiro dia."
      ]
      // ... Adicione os outros capítulos ...
    ]
  }
  // ... Adicione os outros livros ...
];