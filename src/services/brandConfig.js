// Configurações oficiais da marca, chat integrado (Crisp.chat) e dados institucionais do VagaGo

const env = typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env : {};

export const BRAND_CONFIG = {
  companyLegalName: 'VagaGo Tecnologia e Plataforma de Garagens LTDA',
  cnpjDisplay: env.VITE_COMPANY_CNPJ || 'Cadastro CNPJ em formalização • Itabuna - BA',
  city: 'Itabuna - BA',
  supportEmail: 'suporte@vagago.com.br',
  privacyEmail: 'privacidade@vagago.com.br',
  // Configure VITE_CRISP_WEBSITE_ID no .env / Vercel para ativar seu painel Crisp.chat
  crispWebsiteId: (env.VITE_CRISP_WEBSITE_ID || '').trim(),
  serviceHours: 'Atendimento online • Seg a Sáb • 07h às 21h'
};

// Garantias operacionais reais descritas nos Termos e fluxos da plataforma
export const PLATFORM_GUARANTEES = [
  {
    id: 'refund',
    title: 'Reembolso imediato garantido',
    description: 'Se a vaga reservada não estiver disponível na chegada ou você cancelar até 1h antes, devolvemos 100% do valor na hora.'
  },
  {
    id: 'verified',
    title: 'Motoristas e anfitriões identificados',
    description: 'Cadastro com CPF, telefone e placa do veículo registrados em cada reserva para segurança da garagem e do motorista.'
  },
  {
    id: 'protected_access',
    title: 'Senha e portão sob sigilo',
    description: 'O código de acesso, telefone do anfitrião e orientações da portaria só são revelados após o pagamento confirmado.'
  },
  {
    id: 'real_photos',
    title: 'Fotos reais do portão e iluminação',
    description: 'Anúncios exibem fotos da fachada, interior com referência de espaço e iluminação noturna para você decidir com segurança.'
  }
];

// Checklist visual: Galeria de Confiança das Garagens
export const GARAGE_TRUST_GALLERY = [
  {
    id: 'gate',
    step: '01 • Foto do Portão',
    title: 'Portão fechado e entrada aberta',
    description: 'Mostra a solidez do portão eletrônico, largura do acesso e referência exata da fachada na rua.',
    tag: '🚪 Acesso Identificado',
    image: 'https://images.unsplash.com/photo-1590674899484-d5640e854abe?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'interior',
    step: '02 • Foto do Interior',
    title: 'Espaço real e vaga coberta',
    description: 'Foto interna com referência de vagas demarcadas, altura de cobertura e facilidade para manobrar.',
    tag: '🚗 Noção Real de Espaço',
    image: 'https://images.unsplash.com/photo-1573348722427-f1d6819fdf98?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'lighting',
    step: '03 • Detalhe de Segurança',
    title: 'Iluminação noturna e monitoramento',
    description: 'Visão clara das luzes LED, câmeras 24h e área protegida para estacionar tranquilo a qualquer hora.',
    tag: '💡 Câmeras & Iluminação',
    image: 'https://images.unsplash.com/photo-1486006920555-c77dcf18193c?auto=format&fit=crop&w=800&q=80'
  }
];

// Relatos representativos da comunidade local em Itabuna - BA
export const ITABUNA_TESTIMONIALS = [
  {
    id: 'test_1',
    name: 'Maria S.',
    neighborhood: 'Bairro Fátima, Itabuna',
    role: 'Motorista frequente',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80',
    rating: 5,
    quote: 'Uso a vaga perto do Centro toda semana quando vou resolver coisas na Av. do Cinquentenário. Antes rodava quase 20 minutos, agora já chego com garagem certa!'
  },
  {
    id: 'test_2',
    name: 'Rafael Oliveira',
    neighborhood: 'Góes Calmon, Itabuna',
    role: 'Motorista • Região do Jequitibá',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    rating: 5,
    quote: 'Deixar o carro em garagem coberta perto do Shopping Jequitibá pagando por hora saiu mais barato e deu muito mais tranquilidade nos dias de chuva.'
  },
  {
    id: 'test_3',
    name: 'Juliana Peixoto',
    neighborhood: 'Centro / Jardim Vitória, Itabuna',
    role: 'Anfitriã verificada',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    rating: 5,
    quote: 'Minha garagem ficava vazia enquanto eu trabalhava fora. Cadastrei em poucos minutos, aprovo pelo celular e recebo meus repasses certinhos via PIX.'
  }
];
