import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  ShieldCheck,
  FileText,
  Car,
  Home,
  Lock,
  Eye,
  CheckCircle2,
  ArrowLeft,
  Scale,
  Sparkles,
  Cookie,
  BarChart3,
  HelpCircle,
  Clock,
  Database,
  Mail,
  UserCheck,
  Gift,
  AlertCircle
} from 'lucide-react';

export const TermsPrivacyPage = () => {
  const { setActiveTab } = useApp();
  const [activeLegalTab, setActiveLegalTab] = useState('privacy_lgpd'); // 'driver', 'host', 'privacy_lgpd', 'google_cookies'

  return (
    <div className="min-h-screen bg-slate-50 py-10 pb-24 animate-in fade-in duration-200">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Top Breadcrumb & Back button */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <button
            type="button"
            onClick={() => setActiveTab('landing')}
            className="inline-flex items-center gap-2 text-xs font-extrabold text-slate-600 hover:text-sky-600 bg-white px-4 py-2.5 rounded-xl border border-slate-200 shadow-2xs transition cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Voltar ao Início</span>
          </button>

          <div className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-800 text-xs font-black px-3.5 py-1.5 rounded-full border border-emerald-200">
            <Scale className="w-3.5 h-3.5 text-emerald-600" />
            <span>Documento Oficial VagaGo • Vigência 2026</span>
          </div>
        </div>

        {/* Header Title */}
        <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 text-white rounded-3xl p-8 sm:p-10 shadow-xl relative overflow-hidden space-y-3">
          <div className="inline-flex items-center gap-2 bg-white/10 text-purple-300 text-xs font-extrabold px-3 py-1 rounded-full border border-white/10">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Termos de Uso, Privacidade e Segurança Jurídica</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
            Privacidade, Dados & Conformidade LGPD
          </h1>
          <p className="text-slate-300 text-sm max-w-2xl leading-relaxed">
            Conheça as diretrizes de proteção aos seus dados pessoais, telemetria de uso, finalidades de tratamento e direitos fundamentais, em total conformidade com a <strong>LGPD (Lei nº 13.709/2018)</strong> e o Código Civil Brasileiro.
          </p>
        </div>

        {/* Navigation Switch / Tabs Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 bg-white p-2 rounded-2xl border border-slate-200 shadow-sm text-xs font-extrabold">
          
          <button
            type="button"
            onClick={() => setActiveLegalTab('privacy_lgpd')}
            className={`p-3 rounded-xl transition flex flex-col sm:flex-row items-center justify-center gap-2 cursor-pointer ${
              activeLegalTab === 'privacy_lgpd'
                ? 'bg-purple-900 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Lock className="w-4 h-4 shrink-0" />
            <span>Privacidade & LGPD</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveLegalTab('driver')}
            className={`p-3 rounded-xl transition flex flex-col sm:flex-row items-center justify-center gap-2 cursor-pointer ${
              activeLegalTab === 'driver'
                ? 'bg-sky-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Car className="w-4 h-4 shrink-0" />
            <span>Termos do Motorista</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveLegalTab('host')}
            className={`p-3 rounded-xl transition flex flex-col sm:flex-row items-center justify-center gap-2 cursor-pointer ${
              activeLegalTab === 'host'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Home className="w-4 h-4 shrink-0" />
            <span>Termos do Anfitrião</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveLegalTab('google_cookies')}
            className={`p-3 rounded-xl transition flex flex-col sm:flex-row items-center justify-center gap-2 cursor-pointer ${
              activeLegalTab === 'google_cookies'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Cookie className="w-4 h-4 shrink-0" />
            <span>Cookies & Google</span>
          </button>

        </div>

        {/* CONTENT PANEL */}
        <div className="bg-white p-6 sm:p-10 rounded-3xl border border-slate-200 shadow-sm space-y-8 text-slate-700 text-sm leading-relaxed">
          
          {/* TAB 1: PRIVACIDADE & LGPD */}
          {activeLegalTab === 'privacy_lgpd' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="border-b border-slate-100 pb-4">
                <span className="text-xs font-bold text-purple-700 uppercase tracking-wider">Lei Geral de Proteção de Dados (Lei nº 13.709/2018)</span>
                <h2 className="text-2xl font-black text-slate-900 mt-1">Política de Privacidade & Transparência de Dados</h2>
                <p className="text-xs text-slate-500 mt-1">Vigência: 2026 • Cidade de Itabuna - BA / Brasil</p>
              </div>

              <div className="space-y-6">
                
                {/* 1. Compromisso */}
                <div className="space-y-2">
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-purple-700" />
                    <span>1. Compromisso com a Privacidade e Segurança dos Dados</span>
                  </h3>
                  <p>
                    A plataforma <strong>VagaGo</strong> adota rigorosas práticas de governança de dados pessoais, atuando como Controladora dos dados em conformidade estrita com a <strong>LGPD (Lei Federal nº 13.709/2018)</strong>, com o Marco Civil da Internet (Lei nº 12.965/2014) e com o Código de Defesa do Consumidor.
                  </p>
                </div>

                {/* 2. Mapeamento de Dados */}
                <div className="space-y-3">
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <Database className="w-5 h-5 text-purple-700" />
                    <span>2. Dados Coletados pelo Sistema e Finalidades Específicas</span>
                  </h3>
                  <p>
                    Para proporcionar segurança nas garagens, controle de acesso e melhoria contínua da experiência de estacionamento em Itabuna, coletamos e tratamos as seguintes categorias de dados:
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 text-xs">
                    
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1.5">
                      <strong className="text-slate-900 font-black flex items-center gap-1.5">
                        👤 Dados Cadastrais & Identificação
                      </strong>
                      <p className="text-slate-600 leading-relaxed">
                        • <strong>Nome completo e CPF:</strong> Identificação inequívoca perante anfitriões e portarias.<br/>
                        • <strong>E-mail e Telefone (WhatsApp):</strong> Notificações instantâneas de reserva, check-in e suporte do Concierge.<br/>
                        • <strong>Data de Nascimento:</strong> Validação de maioridade civil e relacionamento comemorativo (aniversários).
                      </p>
                    </div>

                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1.5">
                      <strong className="text-slate-900 font-black flex items-center gap-1.5">
                        🚗 Dados do Veículo Cadastrado
                      </strong>
                      <p className="text-slate-600 leading-relaxed">
                        • <strong>Placa, Marca, Modelo e Cor:</strong> Autorização e conferência obrigatória pelo síndico, anfitrião ou portaria eletrônica.<br/>
                        • <strong>Tipo de Veículo (Hatch, Sedan, SUV, Moto):</strong> Compatibilidade com as dimensões físicas da vaga.
                      </p>
                    </div>

                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1.5">
                      <strong className="text-slate-900 font-black flex items-center gap-1.5">
                        📍 Telemetria & Geolocalização
                      </strong>
                      <p className="text-slate-600 leading-relaxed">
                        • <strong>Bairros de Busca (Centro, Góes Calmon, etc.):</strong> Apresentação das vagas mais próximas.<br/>
                        • <strong>Horários de Entrada, Saída e Permanência:</strong> Cálculo exato de tarifas, tolerância e auditoria de sinistros.
                      </p>
                    </div>

                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1.5">
                      <strong className="text-slate-900 font-black flex items-center gap-1.5">
                        💳 Dados Financeiros & Transacionais
                      </strong>
                      <p className="text-slate-600 leading-relaxed">
                        • <strong>Chave PIX e Comprovantes:</strong> Liquidação de pagamentos e repasses líquidos de 90% aos proprietários.<br/>
                        • <strong>Histórico de Saldo e Recargas:</strong> Extrato detalhado na Carteira Digital VagaGo.
                      </p>
                    </div>

                  </div>
                </div>

                {/* 3. Bases Legais */}
                <div className="space-y-3">
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <Scale className="w-5 h-5 text-purple-700" />
                    <span>3. Bases Legais Conforme a LGPD (Art. 7º)</span>
                  </h3>
                  <div className="space-y-2 text-xs">
                    <div className="p-3 bg-purple-50/70 rounded-xl border border-purple-200">
                      <strong className="text-purple-950 font-black">I. Execução de Contrato (Art. 7º, V):</strong>
                      <p className="text-purple-900 mt-0.5">
                        O tratamento de dados cadastrais, veiculares e financeiros é indispensável para formalizar a reserva de garagem, liberar o portão e realizar o repasse ao anfitrião.
                      </p>
                    </div>

                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                      <strong className="text-slate-900 font-black">II. Legítimo Interesse & Prevenção a Fraudes (Art. 7º, IX):</strong>
                      <p className="text-slate-600 mt-0.5">
                        Utilizado para segurança condominial, moderação em tempo real contra golpes pelo Vagago Concierge, apuração de avarias e aprimoramento da cobertura de garagens em bairros com alta demanda.
                      </p>
                    </div>

                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                      <strong className="text-slate-900 font-black">III. Consentimento para Marketing & CRM com Direito de Opt-Out (Art. 7º, I):</strong>
                      <p className="text-slate-600 mt-0.5">
                        O envio de cupons promocionais, benefícios de aniversário e campanhas de "Days Off" baseia-se no consentimento. O usuário pode, a qualquer instante, revogar o recebimento de comunicações de marketing através das configurações de perfil ou enviando solicitação para <strong>privacidade@vagago.com.br</strong>.
                      </p>
                    </div>
                  </div>
                </div>

                {/* 4. Direitos do Titular */}
                <div className="space-y-2">
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <UserCheck className="w-5 h-5 text-purple-700" />
                    <span>4. Seus Direitos como Titular de Dados (Art. 18 da LGPD)</span>
                  </h3>
                  <p>
                    Você pode exercer seus direitos garantidos por lei de forma gratuita e facilitada a qualquer momento:
                  </p>
                  <ul className="list-disc pl-5 space-y-1.5 text-xs text-slate-600">
                    <li><strong>Confirmação e Acesso:</strong> Obter confirmação da existência de tratamento e cópia dos seus dados.</li>
                    <li><strong>Correção:</strong> Solicitar a atualização de dados incompletos, inexatos ou desatualizados.</li>
                    <li><strong>Anonimização ou Eliminação:</strong> Solicitar a exclusão definitiva da sua conta e dados tratados sob consentimento, resguardados os prazos legais de guarda fiscal.</li>
                    <li><strong>Revogação do Consentimento:</strong> Desativar o recebimento de novidades ou promoções sem afetar a prestação do serviço de reservas.</li>
                  </ul>
                </div>

                {/* 5. Contato DPO */}
                <div className="p-4 bg-gradient-to-r from-purple-900 to-slate-900 text-white rounded-2xl flex items-center justify-between gap-4">
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-mono text-purple-300 uppercase font-black">Encarregado de Dados (DPO)</span>
                    <h4 className="font-bold text-sm text-white">Canal Oficial de Privacidade VagaGo</h4>
                    <p className="text-xs text-slate-300">Dúvidas ou solicitações de titulares: <strong>privacidade@vagago.com.br</strong></p>
                  </div>
                  <Mail className="w-8 h-8 text-purple-300 shrink-0" />
                </div>

              </div>
            </div>
          )}

          {/* TAB 2: TERMOS DO MOTORISTA */}
          {activeLegalTab === 'driver' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="border-b border-slate-100 pb-4">
                <span className="text-xs font-bold text-sky-600 uppercase tracking-wider">Locatário de Vagas</span>
                <h2 className="text-2xl font-black text-slate-900">Termos e Condições para Motoristas</h2>
                <p className="text-xs text-slate-500 mt-1">Última atualização: Fevereiro de 2026</p>
              </div>

              <div className="space-y-4">
                <h3 className="text-base font-bold text-slate-900">1. Natureza do Serviço</h3>
                <p>
                  O <strong>VagaGo</strong> é uma plataforma tecnológica de intermediação que conecta motoristas em busca de vagas privativas de estacionamento a proprietários e anfitriões que possuem espaços disponíveis. O VagaGo não é proprietário direto dos imóveis anunciados.
                </p>

                <h3 className="text-base font-bold text-slate-900">2. Reservas, Check-In e Acesso</h3>
                <p>
                  Ao realizar a reserva e confirmar o pagamento via PIX ou saldo na carteira, o motorista recebe as instruções exclusivas de acesso (código de portão eletrônico, orientação de portaria ou QR Code). O acesso é pessoal, intransferível e restrito exclusivamente ao veículo cadastrado no momento da reserva.
                </p>

                <h3 className="text-base font-bold text-slate-900">3. Horários e Tolerância</h3>
                <p>
                  O motorista compromete-se a respeitar estritamente o horário de entrada e saída contratado. É concedida uma tolerância de <strong>15 minutos</strong> após o término do período. Ultrapassado esse prazo, horas adicionais serão cobradas automaticamente com base na tarifa horária da vaga.
                </p>

                <h3 className="text-base font-bold text-slate-900">4. Política de Cancelamento e Reembolso</h3>
                <ul className="list-disc pl-5 space-y-1 text-xs text-slate-600">
                  <li><strong>Cancelamento até 1 hora antes do início:</strong> Reembolso de 100% do valor em créditos na Carteira VagaGo imediatamente.</li>
                  <li><strong>Cancelamento com menos de 1 hora:</strong> Retenção de 50% do valor referente à taxa de reserva do anfitrião.</li>
                  <li><strong>Não comparecimento (No-Show):</strong> Sem direito a reembolso.</li>
                </ul>

                <h3 className="text-base font-bold text-slate-900">5. Responsabilidade pelo Veículo</h3>
                <p>
                  O motorista deve zelar pelas instalações da garagem, manter o veículo devidamente trancado e não deixar objetos de alto valor visíveis no interior do carro. O anfitrião compromete-se a manter a segurança informada no anúncio (câmeras, portão fechado).
                </p>
              </div>
            </div>
          )}

          {/* TAB 3: TERMOS DO ANFITRIÃO */}
          {activeLegalTab === 'host' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="border-b border-slate-100 pb-4">
                <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Locador de Vagas</span>
                <h2 className="text-2xl font-black text-slate-900">Termos e Condições para Anfitriões</h2>
                <p className="text-xs text-slate-500 mt-1">Última atualização: Fevereiro de 2026</p>
              </div>

              <div className="space-y-4">
                <h3 className="text-base font-bold text-slate-900">1. Legitimidade e Propriedade do Espaço</h3>
                <p>
                  O Anfitrião declara ser o legítimo proprietário, locatário com permissão ou possuidor legal do espaço de garagem cadastrado. Em caso de condomínios residenciais ou comerciais, o Anfitrião declara estar em conformidade com a convenção condominial aplicável.
                </p>

                <h3 className="text-base font-bold text-slate-900">2. Veracidade do Anúncio</h3>
                <p>
                  Todas as fotos, dimensões (comprimento, largura, altura), tipo de vaga (coberta, descoberta, livre, presa) e recursos de segurança devem corresponder fielmente à realidade do local. Anúncios com informações falsas serão imediatamente suspensos.
                </p>

                <h3 className="text-base font-bold text-slate-900">3. Divisão de Receitas e Taxa de Serviço</h3>
                <p>
                  O VagaGo adota uma política de remuneração 100% transparente:
                </p>
                <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 text-emerald-950 text-xs font-bold space-y-1">
                  <div>💰 <strong>90% do valor da locação</strong> pertence integralmente ao Anfitrião.</div>
                  <div>⚡ <strong>10% taxa de serviço</strong> retida pelo VagaGo para cobertura de tecnologia, processamento PIX e suporte.</div>
                </div>

                <h3 className="text-base font-bold text-slate-900">4. Campanhas Promocionais de "Day Off" (Taxa Zero)</h3>
                <p>
                  Em datas comemorativas selecionadas pela administração (ex: feriados de Itabuna ou datas comemorativas), a VagaGo poderá ativar o <strong>Day Off</strong>, que concede <strong>0% de comissão da plataforma</strong> para reservas contratadas naquela data específica, transferindo 100% da receita líquida para o anfitrião.
                </p>

                <h3 className="text-base font-bold text-slate-900">5. Repasse Financeiro e Saques PIX</h3>
                <p>
                  Os valores referentes a reservas concluídas são creditados no saldo do Anfitrião e ficam disponíveis para transferência via chave PIX cadastrada, com liquidação rápida e sem taxas ocultas.
                </p>
              </div>
            </div>
          )}

          {/* TAB 4: COOKIES & GOOGLE */}
          {activeLegalTab === 'google_cookies' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="border-b border-slate-100 pb-4">
                <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">Políticas de Terceiros e Métricas</span>
                <h2 className="text-2xl font-black text-slate-900">Cookies, Google Analytics & Google AdSense</h2>
                <p className="text-xs text-slate-500 mt-1">Políticas de conformidade digital e publicidade transparente</p>
              </div>

              <div className="space-y-4">
                <h3 className="text-base font-bold text-slate-900">1. O que são Cookies e como os utilizamos?</h3>
                <p>
                  Cookies são pequenos arquivos de texto armazenados no seu navegador para manter sua sessão ativa, lembrar preferências de busca (ex: Cidade de Itabuna) e garantir a navegação rápida e segura na plataforma.
                </p>

                <h3 className="text-base font-bold text-slate-900">2. Google Analytics</h3>
                <p>
                  Utilizamos o <strong>Google Analytics</strong> para coletar dados estatísticos anônimos de navegação (como páginas mais visitadas, tempo de permanência e taxa de conversão). Essas informações nos ajudam a aprimorar a usabilidade da plataforma e não identificam o usuário individualmente.
                </p>

                <h3 className="text-base font-bold text-slate-900">3. Google AdSense e Publicidade de Terceiros</h3>
                <p>
                  O VagaGo pode exibir anúncios veiculados pelo <strong>Google AdSense</strong>. O Google utiliza cookies (como o cookie DART) para veicular anúncios aos usuários com base em suas visitas anteriores ao nosso site e a outros sites na internet.
                </p>
                <ul className="list-disc pl-5 space-y-1 text-xs text-slate-600">
                  <li>Os usuários podem desativar a publicidade personalizada acessando as <strong>Configurações de Anúncios do Google</strong>.</li>
                  <li>Nenhum dado sensível ou dado cadastral financeiro é compartilhado com redes de publicidade.</li>
                </ul>

                <h3 className="text-base font-bold text-slate-900">4. Como desativar ou gerenciar Cookies</h3>
                <p>
                  Você pode gerenciar ou desativar os cookies nas configurações do seu navegador a qualquer momento.
                </p>
              </div>
            </div>
          )}

        </div>

        {/* Footer Support Card */}
        <div className="p-6 bg-slate-100 rounded-2xl border border-slate-200 text-center space-y-2">
          <div className="text-xs font-bold text-slate-800">Dúvidas jurídicas ou precisa de suporte?</div>
          <p className="text-xs text-slate-500">
            Nossa equipe jurídica e de atendimento ao usuário está à disposição pelo e-mail <strong>suporte@vagago.com.br</strong>
          </p>
        </div>

      </div>
    </div>
  );
};
