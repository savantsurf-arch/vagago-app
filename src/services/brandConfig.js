// Configurações oficiais da marca, chat integrado (Crisp.chat) e dados institucionais do VagaGo

const env = typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env : {};

export const BRAND_CONFIG = {
  companyLegalName: 'VagaGo Tecnologia e Plataforma de Garagens LTDA',
  cnpjDisplay: env.VITE_COMPANY_CNPJ || 'Cadastro CNPJ em formalização • Itabuna - BA',
  city: 'Itabuna - BA',
  supportEmail: 'suporte@vagago.com.br',
  privacyEmail: 'privacidade@vagago.com.br',
  whatsappNumber: (env.VITE_WHATSAPP_NUMBER || '5573999990000').replace(/\D/g, ''),
  whatsappDisplay: env.VITE_WHATSAPP_DISPLAY || '(73) 99999-0000',
  // Configure VITE_CRISP_WEBSITE_ID no .env / Vercel para ativar seu painel Crisp.chat
  crispWebsiteId: (env.VITE_CRISP_WEBSITE_ID || '').trim(),
  serviceHours: 'Atendimento online • Seg a Sáb • 07h às 21h'
};

export function getWhatsAppUrl(message = 'Olá! Preciso de ajuda com uma vaga no VagaGo Itabuna.') {
  const digits = BRAND_CONFIG.whatsappNumber || '5573999990000';
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}

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

// Estrutura de depoimentos para validação e preenchimento com dados reais
// TODO: Não inventar números ou avaliações falsas. Preencher com depoimentos reais coletados de usuários e anfitriões de Itabuna.
export const ITABUNA_TESTIMONIALS = [
  {
    id: 'test_1',
    isPlaceholder: true,
    name: 'Depoimento de Motorista (Centro)',
    neighborhood: 'Centro / Av. Cinquentenário, Itabuna',
    role: 'Motorista • Usuário Frequente',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80',
    rating: 5,
    quote: '[TODO: Inserir depoimento real de motorista sobre economia de tempo ao estacionar no Centro de Itabuna]',
    todoNote: 'TODO: Preencher com nome, foto e frase real autorizada pelo usuário.'
  },
  {
    id: 'test_2',
    isPlaceholder: true,
    name: 'Depoimento de Motorista (Shopping)',
    neighborhood: 'Góes Calmon / Shopping Jequitibá, Itabuna',
    role: 'Motorista • Mensalista / Horista',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    rating: 5,
    quote: '[TODO: Inserir relato real sobre custo-benefício de garagem coberta e reserva garantida no Jequitibá]',
    todoNote: 'TODO: Preencher com avaliação real colhida na pesquisa de satisfação.'
  },
  {
    id: 'test_3',
    isPlaceholder: true,
    name: 'Depoimento de Anfitrião (Garagem)',
    neighborhood: 'Bairro Fátima / Jardim Vitória, Itabuna',
    role: 'Anfitrião de Garagem Privativa',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    rating: 5,
    quote: '[TODO: Inserir depoimento real do dono de garagem sobre a facilidade de gerar renda extra e repasse via Pix]',
    todoNote: 'TODO: Preencher com relato verificado de proprietário cadastrado na plataforma.'
  }
];

// Perguntas Frequentes (FAQ) com regras reais do produto
// TODO: Confirmar respostas e tolerâncias definitivas com o operador antes do lançamento em larga escala.
export const PLATFORM_FAQ = [
  {
    id: 'faq_pix',
    question: 'Como funciona o pagamento via Pix?',
    answer: 'O QR Code dinâmico e o código Pix Copia e Cola são gerados instantaneamente na finalização da reserva. A confirmação bancária ocorre em poucos segundos e os dados exatos de acesso ao portão são liberados imediatamente na tela.',
    todoNote: 'TODO: Confirmar tempo limite de expiração do QR Code (atualmente configurado em 15 minutos) e eventuais regras de comprovante bancário manual.'
  },
  {
    id: 'faq_cancellation',
    question: 'O que acontece se o motorista precisar cancelar a reserva?',
    answer: 'Cancelamentos solicitados com até 1 hora de antecedência em relação ao horário de início da reserva têm reembolso integral garantido (sem multa), estornado na carteira VagaGo ou na conta bancária.',
    todoNote: 'TODO: Confirmar política definitiva para cancelamentos efetuados com menos de 1 hora de antecedência ou no-show.'
  },
  {
    id: 'faq_host_payout',
    question: 'Como o dono da garagem recebe o dinheiro das reservas?',
    answer: 'O anfitrião recebe 90% do valor bruto da reserva diretamente na chave Pix cadastrada em seu perfil. A taxa da plataforma VagaGo é de apenas 10%, cobrindo infraestrutura, seguros operacionais e gateway.',
    todoNote: 'TODO: Confirmar se o repasse ao proprietário é instantâneo (D+0/D+1) ou por ciclo semanal/mensal.'
  }
];
