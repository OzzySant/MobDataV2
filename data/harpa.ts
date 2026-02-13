import { Hymn } from "../types";

// Dados Brutos fornecidos (Formato JSON Original)
const RAW_HARPA_DATA: Record<string, any> = {
  "-1": {
    "Author": "Daniel Liberato da Silva",
    "date": "11-11-2023",
    "github": "https://github.com/DanielLiberato",
    "linkedin": "https://www.linkedin.com/in/daniel-liberato/"
  },
  "1": {
    "hino": "1 - Chuvas de Graça",
    "coro": "Chuvas de graça, <br> Chuvas pedimos, Senhor; <br> Manda-nos chuvas constantes, <br> Chuvas do Consolador.",
    "verses": {
      "1": "Deus prometeu com certeza <br> Chuvas de graça mandar; <br> Ele nos dá fortaleza, <br> E ricas bênçãos sem par",
      "2": "Cristo nos tem concedido <br> O santo Consolador, <br> De plena paz nos enchido, <br> Para o reinado do amor.",
      "3": "Dá-nos, Senhor, amplamente, <br> Teu grande gozo e poder; <br> Fonte de amor permanente, <br> Põe dentro de nosso ser.",
      "4": "Faze os teus servos piedosos, <br> Dá-lhes virtude e valor, <br> Dando os teus dons preciosos, <br> Do santo Preceptor."
    }
  },
  "2": {
    "hino": "2 - Saudosa Lembrança",
    "coro": "Sim, eu porfiarei por essa terra de além; <br> E lá terminarei as muitas lutas de aquém; <br> Lá está meu bom Senhor, ao qual eu desejo ver; <br> Ele é tudo p’ra mim, e sem Ele não posso viver.",
    "verses": {
      "1": "Oh! que saudosa lembrança <br> Tenho de ti, ó Sião, <br> Terra que eu tanto amo, <br> Pois és do meu coração. <br> Eu para ti voarei, <br> Quando o Senhor meu voltar; <br> Pois Ele foi para o céu, <br> E breve vem me buscar.",
      "2": "Bela, mui bela, é a esperança, <br> Dos que vigiam por ti, <br> Pois eles recebem força, <br> Que só se encontra ali; <br> Os que procuram chegar <br> Ao teu regaço, ó Sião, <br> Livres serão de pecar <br> E de toda a tentação.",
      "3": "Diz a Sagrada Escritura, <br> Que são formosos os pés <br> Daqueles que boas novas <br> Levam para os infiéis; <br> E, se tão belo é falar <br> Dessas grandezas, aqui, <br> Que não será o gozar <br> A graça que existe ali!"
    }
  },
  "3": {
    "hino": "3 - Plena Paz",
    "coro": "Oh! glória ao meu Jesus! <br> Pois é digno de louvor; <br> É meu Rei, meu bom Pastor, <br> E meu Senhor. <br> Como os anjos, que O louvam, <br> Eu também O louvarei, <br> Entoando aleluias ao meu Rei!",
    "verses": {
      "1": "Plena paz e santo gozo, <br> Tenho em ti, ó meu Jesus! <br> Pois eu cri em Tua morte sobre a cruz; <br> No Senhor só confiando <br> Neste mundo viverei, <br> Entoando aleluias ao meu Rei!",
      "2": "O amor de Jesus Cristo <br> É mui grande para mim, <br> Pois Sua graça me encheu de amor sem fim. <br> Meu Jesus foi para a glória, <br> Mas um dia eu O verei, <br> Entoando aleluias ao meu Rei!",
      "3": "Este mundo não deseja <br> Tão bondoso Salvador, <br> Não sabendo agradecer Seu grande amor. <br> Eu, porém, estou gozando <br> Do favor da Sua lei, <br> Entoando aleluias ao meu Rei!",
      "4": "Quando o povo israelita <br> Com Jesus se concertar, <br> Dando glória ao Seu nome, sem cessar. <br> Nesse tempo, céu e terra <br> Hão de ser a mesma grei, <br> Entoando aleluias ao meu Rei!"
    }
  },
  "4": {
    "hino": "4 - Deus Velará Por Ti",
    "coro": "Deus cuidará de ti <br> No teu viver, no teu sofrer; <br> Seu olhar te acompanhará; <br> Deus velará por ti.",
    "verses": {
      "1": "Não desanimes, Deus proverá; <br> Deus velará por ti; <br> Sob Suas asas te acolherá; <br> Deus velará por ti.",
      "2": "Se o coração palpitar de dor, <br> Deus velará por ti; <br> Tu já provaste Seu terno amor. <br> Deus velará por ti.",
      "3": "Nos desalentos, nas provações, <br> Deus velará por ti; <br> Lembra-te dEle nas tentações; <br> Deus velará por ti.",
      "4": "Tudo o que pedes, Ele fará; <br> Deus velará por ti; <br> E o que precisas, não negará. <br> Deus velará por ti.",
      "5": "Como estiveres, não temas, vem! <br> Deus velará por ti; <br> Ele te entende e te ama bem! <br> Deus velará por ti."
    }
  },
  "5": {
    "hino": "5 - Ó Desce Fogo Santo",
    "coro": "Eu tudo a Deus consagro <br> Em Cristo, o vivo altar; <br> Ó desce, fogo santo, <br> Do céu vem tu selar!",
    "verses": {
      "1": "Espírito, alma e corpo, <br> Oferto a Ti, Senhor, <br> Como hóstia verdadeira, <br> Em oblação de amor.",
      "2": "Sou teu, ó Jesus Cristo! <br> Teu sangue me comprou; <br> Eu quero a Tua graça, <br> Pois de Ti sempre sou.",
      "3": "Espírito divino, <br> Do Pai a promissão; <br> Sedenta a alma pede, <br> A Ti, a santa unção."
    }
  }
};

export const HARPA_DATA: Hymn[] = Object.entries(RAW_HARPA_DATA)
  .filter(([key]) => key !== "-1")
  .map(([key, value]) => {
    const numero = parseInt(key);
    // Extract title from "Num - Title"
    const titleParts = value.hino ? value.hino.split(" - ") : ["", "Sem Título"];
    const titulo = titleParts.length > 1 ? titleParts.slice(1).join(" - ") : value.hino;

    const verses = value.verses || {};
    const sortedVerseKeys = Object.keys(verses).sort((a, b) => parseInt(a) - parseInt(b));
    
    const parts: string[] = [];
    
    // Preparar o refrão
    const chorus = (value.coro && value.coro.trim().length > 0)
      ? `[Coro]\n${value.coro.replace(/<br>/g, "\n").replace(/<br\s*\/>/g, "\n")}`
      : null;
    
    for (const k of sortedVerseKeys) {
      // Adicionar estrofe
      parts.push(verses[k].replace(/<br>/g, "\n").replace(/<br\s*\/>/g, "\n"));
      
      // Adicionar refrão após cada estrofe (intercalado)
      if (chorus) {
        parts.push(chorus);
      }
    }
    
    const lyrics = parts.join("\n\n");

    return {
      numero,
      titulo,
      letra: lyrics
    };
  })
  .sort((a, b) => a.numero - b.numero);