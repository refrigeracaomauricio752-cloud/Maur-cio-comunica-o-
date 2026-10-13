import { MusicStyle } from '../services/audioMusicEngine';

export interface AdPreset {
  id: string;
  name: string;
  label: string;
  businessName: string;
  category: string;
  categoryLabel: string;
  highlights: string;
  servicePartner: string;
  location: string;
  phone: string;
  musicStyle: MusicStyle;
  voice: string;
  tone: string;
  description: string;
  defaultScript: {
    title: string;
    openingHook: string;
    narrationText: string;
    offersBulletPoints: string[];
    callToAction: string;
    carroDeSomScript: string;
    whatsappText: string;
  };
}

export const AD_PRESETS: AdPreset[] = [
  {
    id: 'mercado_elias',
    name: 'Mercado do Elias (Exemplo Principal)',
    label: '🛒 Mercado do Elias',
    businessName: 'Mercado do Elias',
    category: 'mercado_varejo',
    categoryLabel: 'Mercado e Mercearia',
    highlights: 'Cerveja trincando de gelada, carnes frescas no balcão refrigerado, frutas selecionadas, pão quentinho e as melhores ofertas da cidade!',
    servicePartner: 'Refrigeração Maurício',
    location: 'Rua Principal, 120 - Bairro Centro',
    phone: '(11) 98765-4321',
    musicStyle: 'sertanejo_alegre',
    voice: 'Fenrir',
    tone: 'animado_comercial',
    description: 'Propaganda alegre de supermercado com destaque na cerveja gelada e balcão refrigerado.',
    defaultScript: {
      title: 'Mega Ofertas do Mercado do Elias!',
      openingHook: 'Alô minha gente! Quer economizar e levar produto de primeira pra casa?',
      narrationText: 'Alô minha gente! No Mercado do Elias o preço é baixo e a qualidade é nota dez! Cerveja estupidamente gelada e balcões trincando com carnes e frios fresquinhos! Refrigeração garantida pela Refrigeração Maurício e atendimento de amigo! Vem correndo pro Mercado do Elias aproveitar as melhores ofertas da semana!',
      offersBulletPoints: [
        'Cerveja estupidamente gelada',
        'Carnes frescas e balcões impecáveis',
        'Preço imbatível e atendimento de primeira',
      ],
      callToAction: 'Vem correndo pro Mercado do Elias! Economia de verdade é aqui!',
      carroDeSomScript: 'ATENÇÃO, ATENÇÃO MORADORES! É NO MERCADO DO ELIAS! CERVEJA TRINCANDO DE GELADA, CARNES FRESQUINHAS E AS MAIORES OFERTAS DO BAIRRO! REFRIGERAÇÃO DE PRIMEIRA COM A REFRIGERAÇÃO MAURÍCIO! CORRE PRA CÁ QUE TEM PROMOÇÃO!',
      whatsappText: '🛒 *SUPER OFERTAS NO MERCADO DO ELIAS!* 🍺🥩\nCerveja estupidamente gelada e balcões com carnes e frios fresquinhos!\nVenha conferir hoje mesmo!\n📍 Rua Principal, 120\n📲 WhatsApp: (11) 98765-4321',
    },
  },
  {
    id: 'refrigeracao_mauricio',
    name: 'Refrigeração Maurício (Serviços Comerciais)',
    label: '❄️ Refrigeração Maurício',
    businessName: 'Refrigeração Maurício',
    category: 'servico_refrigeracao',
    categoryLabel: 'Serviços de Refrigeração & Climatização',
    highlights: 'Manutenção preventiva e corretiva de balcões refrigerados, câmaras frias, cervejeiras, freezers comerciais e instalação de ar-condicionado. Atendimento rápido e garantia!',
    servicePartner: 'Maurício Refrigeração Especializada',
    location: 'Atendemos toda a cidade e região',
    phone: '(11) 99887-1234',
    musicStyle: 'sertanejo_alegre',
    voice: 'Zephyr',
    tone: 'confianca_profissional',
    description: 'Propaganda dos serviços de manutenção de balcões e câmaras para mercados e comércios.',
    defaultScript: {
      title: 'Refrigeração Maurício - Solução Rápida e Garantida',
      openingHook: 'Atenção comerciantes e donos de mercados! Seu balcão ou câmara fria precisa de socorro?',
      narrationText: 'Atenção comerciantes! Não deixe suas mercadorias esquentarem! A Refrigeração Maurício resolve seu problema com agilidade e garantia! Conserto e manutenção de balcões refrigerados, câmaras frias, cervejeiras e ar-condicionado! Atendimento rápido em toda a região! Ligue agora para a Refrigeração Maurício e mantenha tudo trincando de gelado!',
      offersBulletPoints: [
        'Manutenção de balcões e câmaras frias',
        'Conserto de cervejeiras e freezers comerciais',
        'Atendimento rápido com garantia de serviço',
      ],
      callToAction: 'Chame a Refrigeração Maurício no WhatsApp e peça seu orçamento!',
      carroDeSomScript: 'ATENÇÃO COMÉRCIOS E MERCADOS! NÃO PERCA MERCADORIA! PRECISOU DE MANUTENÇÃO EM BALCÕES REFRIGERADOS E CÂMARAS FRIAS? CHAME A REFRIGERAÇÃO MAURÍCIO! AGILIDADE E CONFIANÇA GARANTIDAS!',
      whatsappText: '❄️ *REFRIGERAÇÃO MAURÍCIO* ❄️\nManutenção e instalação de balcões comerciais, câmaras frias e ar-condicionado!\nAtendimento rápido e peças originais.\n📲 WhatsApp: (11) 99887-1234',
    },
  },
  {
    id: 'acougue_carnes',
    name: 'Açougue & Casa de Carnes do Elias',
    label: '🥩 Açougue & Carnes Nobres',
    businessName: 'Açougue do Elias',
    category: 'acougue',
    categoryLabel: 'Açougue e Casa de Carnes',
    highlights: 'Picanha fatiada, costela gaúcha, carnes inspecionadas em balcões de inox refrigerados de primeira linha, linguiça caseira e carvão pro seu churrasco!',
    servicePartner: 'Refrigeração Maurício',
    location: 'Ao lado da praça da matriz',
    phone: '(11) 97654-3210',
    musicStyle: 'sertanejo_alegre',
    voice: 'Fenrir',
    tone: 'vendedor_entusiasmado',
    description: 'Comercial com apetite e ritmo sertanejo chamando a galera pro churrasco do final de semana.',
    defaultScript: {
      title: 'Churrasco Garantido no Açougue do Elias!',
      openingHook: 'Alô turma do churrasco! O fim de semana chegou com tudo!',
      narrationText: 'Alô turma do churrasco! No Açougue do Elias a carne é fresca e selecionada todo dia! Picanha suculenta, costela no ponto e linguiça artesanal com balcões refrigerados impecáveis pela Refrigeração Maurício! Vem buscar a melhor carne da cidade com o precinho que você adora! Açougue do Elias, o sabor do seu churrasco!',
      offersBulletPoints: [
        'Carnes nobres inspecionadas e frescas',
        'Picanha, costela e cortes especiais',
        'Balcões higienizados e bem refrigerados',
      ],
      callToAction: 'Venha conferir o Açougue do Elias ao lado da praça da matriz!',
      carroDeSomScript: 'ALÔ AMIGOS DO CHURRASCO! É NO AÇOUGUE DO ELIAS! PICANHA MACIA, COSTELA GAÚCHA E LINGUIÇA ARTESANAL! BALCÕES 100% REFRIGERADOS PELA REFRIGERAÇÃO MAURÍCIO! VEM PRO AÇOUGUE DO ELIAS!',
      whatsappText: '🥩 *AÇOUGUE DO ELIAS - CARNES ESPECIAIS* 🥩\nO melhor churrasco começa aqui! Picanha, costela e linguiça artesanal fresquinhas!\n📍 Ao lado da matriz\n📲 WhatsApp: (11) 97654-3210',
    },
  },
  {
    id: 'distribuidora_bebidas',
    name: 'Disk Bebidas & Depósito do Geladão',
    label: '🍺 Disk Bebidas & Distribuidora',
    businessName: 'Distribuidora Bebida Gelada',
    category: 'bebidas',
    categoryLabel: 'Distribuidora de Bebidas',
    highlights: 'Cerveja na temperatura negativa, refrigerantes em lata e 2 litros, gelo filtrado, carvão e entrega expressa na porta da sua casa ou comércio!',
    servicePartner: 'Refrigeração Maurício',
    location: 'Avenida Brasil, 500',
    phone: '(11) 96543-2109',
    musicStyle: 'forro_piseiro',
    voice: 'Puck',
    tone: 'festa_animada',
    description: 'Ritmo contagiante de piseiro/sertanejo para vender cerveja e bebidas geladas.',
    defaultScript: {
      title: 'Bebida Gelada na Sua Porta!',
      openingHook: 'Sede de cerveja gelada? A Distribuidora Bebida Gelada resolve!',
      narrationText: 'Alô minha gente! Festa sem cerveja gelada não dá! Na Distribuidora Bebida Gelada a cerveja tá trincando na temperatura negativa, com gelo filtrado, carvão e refrigerantes! É só pedir no WhatsApp que a gente entrega rapidinho na sua porta! Ligue agora e garanta a bebida mais gelada da cidade!',
      offersBulletPoints: [
        'Cerveja na temperatura negativa',
        'Gelo filtrado e carvão para churrasco',
        'Entrega rápida pelo WhatsApp',
      ],
      callToAction: 'Mande uma mensagem agora e receba em casa rapidinho!',
      carroDeSomScript: 'ATENÇÃO MINHA GENTE! CERVEJA TRINCANDO DE GELADA É NA DISTRIBUIDORA BEBIDA GELADA! REFRIGERANTES, GELO E CARVÃO COM ENTREGA IMEDIATA! CHAME NO ZAP AGORA!',
      whatsappText: '🍺 *DISK BEBIDAS GELADÃO* 🧊\nCerveja no ponto certo, gelo e carvão com entrega expressa!\n📲 Peça pelo WhatsApp: (11) 96543-2109',
    },
  },
  {
    id: 'ar_condicionado',
    name: 'Climatização & Ar-Condicionado Residencial',
    label: '🌬️ Climatização & Ar-Condicionado',
    businessName: 'Maurício Climatização',
    category: 'climatizacao',
    categoryLabel: 'Instalação de Ar Condicionado',
    highlights: 'Não passe calor nesse verão! Instalação limpa, recarga de gás, higienização completa e manutenção de split e inverter com facilidade de pagamento!',
    servicePartner: 'Refrigeração Maurício',
    location: 'Orçamento sem compromisso pelo WhatsApp',
    phone: '(11) 99887-1234',
    musicStyle: 'pop_acustico',
    voice: 'Kore',
    tone: 'agradavel_fresco',
    description: 'Comercial focado em conforto térmico e economia de energia no verão.',
    defaultScript: {
      title: 'Conforto e Frescor com a Maurício Climatização',
      openingHook: 'O calor tá apertando? Deixe sua casa e seu comércio bem fresquinhos!',
      narrationText: 'Não passe calor nesse verão! Com a Maurício Climatização você tem instalação limpa, recarga de gás e higienização completa para o seu ar-condicionado! Economize energia com equipamentos regulados e garanta o ar puro para toda a família! Peça seu orçamento sem compromisso hoje mesmo!',
      offersBulletPoints: [
        'Instalação limpa e rápida',
        'Higienização completa e recarga de gás',
        'Orçamento gratuito sem compromisso',
      ],
      callToAction: 'Chame a Maurício Climatização no WhatsApp e viva no fresco!',
      carroDeSomScript: 'ATENÇÃO MORADORES! NÃO PASSE CALOR! A MAURÍCIO CLIMATIZAÇÃO FAZ INSTALAÇÃO E MANUTENÇÃO DO SEU AR-CONDICIONADO COM PREÇO JUSTO E GARANTIA! CHAME NO ZAP!',
      whatsappText: '🌬️ *MAURÍCIO CLIMATIZAÇÃO & AR-CONDICIONADO* ❄️\nInstalação, manutenção preventiva e higienização completa.\n📲 Orçamento sem compromisso: (11) 99887-1234',
    },
  },
];
