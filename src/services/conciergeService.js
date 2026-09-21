/**
 * VAGAGO CONCIERGE — Sistema Inteligente de Moderação e Suporte Operacional Integrado
 * 
 * Missão: Garantir comunicação ágil, segura e objetiva entre o Locatário (motorista)
 * e o Locador (dono da vaga) durante todo o ciclo de locação.
 */

// 1. Regex de Detecção de Vazamento de Contato Externo e Pagamento Fora da Plataforma
const PHONE_REGEX = /(\+?55\s?)?(\(?\d{2}\)?\s?)?(9\s?\d{4}[-\s]?\d{4}|\d{4}[-\s]?\d{4})/g;
const EMAIL_REGEX = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/gi;
const PIX_CPF_REGEX = /\b(\d{3}\.?\d{3}\.?\d{3}-?\d{2})\b/g;

// Palavras-chave de tentativa de levar para fora do app
const EXTERNAL_CHAT_KEYWORDS = [
  'whatsapp', 'whats', 'zap', 'zapzap', 'wpp', 'telegram', 'chama no zap',
  'me passa o zap', 'passa o whats', 'falar no whats', 'falar por fora',
  'contato por fora', 'meu numero', 'meu número', 'me liga', 'telefone',
  'instagram', 'insta', '@', 'direct', 'inbox', 'facebook', 'face', 'tiktok'
];

// Palavras-chave de pagamentos/chaves por fora
const EXTERNAL_PAYMENT_KEYWORDS = [
  'pix', 'chave pix', 'passa o pix', 'fazer um pix', 'manda o pix',
  'pagar por fora', 'dinheiro em mãos', 'dinheiro vivo', 'em dinheiro',
  'transferência', 'transferencia', 'ted', 'doc', 'depósito', 'deposito',
  'desconto por fora', 'cobrar por fora', 'pagar na hora'
];

// Gatilhos Operacionais
const EXTENSION_KEYWORDS = [
  'estender', 'ficar mais tempo', 'renovar', 'atrasar', 'mais horas',
  'posso ficar até', 'aumentar tempo', 'tempo extra', 'estender reserva',
  'vou demorar', 'vou me atrasar', 'prolongar', 'mais uma hora', 'mais 2 horas'
];

const ACCESS_GATE_KEYWORDS = [
  'não abre', 'nao abre', 'portão', 'portao', 'fechado', 'trancado',
  'interfone', 'portaria', 'vaga ocupada', 'carro preso', 'carro estacionado',
  'não consigo entrar', 'nao consigo entrar', 'leitor', 'tag', 'código',
  'codigo', 'como entro', 'como entrar', 'abrir portao', 'abrir portão'
];

const CANCELLATION_KEYWORDS = [
  'cancelar', 'reembolso', 'estorno', 'desistir', 'dinheiro de volta',
  'cancelamento', 'cobrança extra', 'cobrar a mais', 'taxa extra',
  'cobrou errado', 'desistência', 'desistencia'
];

const DAMAGE_INCIDENT_KEYWORDS = [
  'avaria', 'bateu', 'danificou', 'riscou', 'arranhou', 'amassou',
  'acidente', 'quebrou', 'furou o pneu', 'estragou', 'raspou'
];

/**
 * Normaliza o texto removendo acentuação e espaços extras para análise precisa
 */
export const normalizeText = (text = '') => {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
};

/**
 * Analisa a mensagem enviada pelo usuário (Locatário ou Locador)
 * Retorna status de moderação, texto higienizado e intervenção do Vagago Concierge se aplicável.
 */
export const analyzeConciergeMessage = (messageText = '', context = {}) => {
  if (!messageText || typeof messageText !== 'string') {
    return {
      isBlocked: false,
      hasViolation: false,
      moderatedText: messageText,
      conciergeIntervention: null
    };
  }

  const rawText = messageText;
  const clean = normalizeText(rawText);

  // -------------------------------------------------------------
  // REGRA CRÍTICA 1: BLOQUEIO DE CONTATO EXTERNO E PAGAMENTO FORA
  // -------------------------------------------------------------
  const containsPhone = PHONE_REGEX.test(rawText);
  const containsEmail = EMAIL_REGEX.test(rawText);
  const containsCPF = PIX_CPF_REGEX.test(rawText);
  const containsExternalChat = EXTERNAL_CHAT_KEYWORDS.some(kw => clean.includes(kw));
  const containsExternalPayment = EXTERNAL_PAYMENT_KEYWORDS.some(kw => clean.includes(kw));

  const isExternalLeak = containsPhone || containsEmail || containsCPF || containsExternalChat || containsExternalPayment;

  if (isExternalLeak) {
    return {
      isBlocked: true,
      hasViolation: true,
      violationType: 'SECURITY_LEAK',
      moderatedText: '🔒 [Conteúdo bloqueado por segurança — Mensagem externa não permitida]',
      conciergeIntervention: {
        type: 'security_alert',
        badge: '⚠️ Moderação de Segurança',
        info: 'Por motivos de segurança e para manter a garantia do seguro Vagago, todas as mensagens e pagamentos devem ser feitos exclusivamente pelo aplicativo.',
        action: 'Continue a conversa pelo chat protegido e utilize apenas os pagamentos e recursos oficiais da plataforma.',
        actionType: 'security'
      }
    };
  }

  // -------------------------------------------------------------
  // GATILHO OPERACIONAL 1: EXTENSÃO DE HORÁRIO
  // -------------------------------------------------------------
  if (EXTENSION_KEYWORDS.some(kw => clean.includes(kw))) {
    return {
      isBlocked: false,
      hasViolation: false,
      moderatedText: rawText,
      conciergeIntervention: {
        type: 'extension_help',
        badge: '⏱️ Extensão de Permanência',
        info: 'Para ficar mais tempo, o Locatário deve clicar em \'Estender Reserva\' na barra superior do chat antes do horário de término.',
        action: 'Clique no botão \'⏱️ Estender Reserva\' no topo do chat para adicionar horas adicionais garantidas.',
        actionType: 'extend_booking'
      }
    };
  }

  // -------------------------------------------------------------
  // GATILHO OPERACIONAL 2: ACESSO, PORTÃO OU VAGA OCUPADA
  // -------------------------------------------------------------
  if (ACCESS_GATE_KEYWORDS.some(kw => clean.includes(kw))) {
    return {
      isBlocked: false,
      hasViolation: false,
      moderatedText: rawText,
      conciergeIntervention: {
        type: 'access_help',
        badge: '🚪 Controle de Acesso',
        info: 'Locador, favor confirmar se o acesso via interfone/portaria ou aplicativo foi liberado para o veículo cadastrado.',
        action: 'Locatário, utilize o botão \'Abrir Portão\' pelo app ou apresente o QR Code na guarita.',
        actionType: 'open_gate'
      }
    };
  }

  // -------------------------------------------------------------
  // GATILHO OPERACIONAL 3: CANCELAMENTOS / REEMBOLSOS / COBRANÇAS
  // -------------------------------------------------------------
  if (CANCELLATION_KEYWORDS.some(kw => clean.includes(kw))) {
    return {
      isBlocked: false,
      hasViolation: false,
      moderatedText: rawText,
      conciergeIntervention: {
        type: 'cancellation_help',
        badge: '💳 Cancelamento & Reembolso',
        info: 'Cancelamentos são processados pela aba \'Minhas Reservas\' conforme a política de tolerância do app.',
        action: 'Acesse \'Minhas Reservas\' para cancelamento com estorno automático. Nenhuma cobrança extra fora do app é permitida.',
        actionType: 'view_bookings'
      }
    };
  }

  // -------------------------------------------------------------
  // GATILHO OPERACIONAL 4: AVARIAS E INCIDENTES
  // -------------------------------------------------------------
  if (DAMAGE_INCIDENT_KEYWORDS.some(kw => clean.includes(kw))) {
    return {
      isBlocked: false,
      hasViolation: false,
      moderatedText: rawText,
      conciergeIntervention: {
        type: 'damage_incident',
        badge: '🛡️ Protocolo de Proteção e Sinistro',
        info: 'Ocorrência registrada pelo protocolo de segurança e seguro da plataforma Vagago.',
        action: 'Fotografe os detalhes no local e acione o suporte de emergência pelo aplicativo.',
        actionType: 'emergency_support'
      }
    };
  }

  // Mensagem normal sem necessidade de intervenção
  return {
    isBlocked: false,
    hasViolation: false,
    moderatedText: rawText,
    conciergeIntervention: null
  };
};

/**
 * Atalhos rápidos sugeridos pelo Vagago Concierge para agilidade ao volante
 */
export const CONCIERGE_QUICK_ACTIONS = [
  { id: 'extend', label: '⏱️ Estender Reserva', text: 'Gostaria de estender o meu tempo de permanência na vaga.' },
  { id: 'gate', label: '🚪 Problema com Portão / Entrada', text: 'Estou no portão da garagem e preciso de ajuda com o acesso.' },
  { id: 'plate', label: '🚗 Confirmar Placa do Carro', text: 'Confirmando: o veículo que vai estacionar está com a placa cadastrada no app.' },
  { id: 'cancel', label: '❓ Política de Cancelamento', text: 'Como funciona o cancelamento ou reembolso da reserva?' }
];
