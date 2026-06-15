import { useState, useCallback } from "react";
import {
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip
} from "recharts";
import {
  Home, Building2, ClipboardList, BarChart3, ChevronRight, ChevronLeft,
  CheckCircle2, Camera, FileText, Download, LogOut,
  Plus, Search, Bell, Activity, TrendingUp, Users, Award,
  ChevronDown, ChevronUp, X, Check, Star
} from "lucide-react";
import logoUrl from "../imports/Logo_Oficial_Branco_teste.png";

// ─── DATA ────────────────────────────────────────────────────────────────────

const PILARES = [
  { id: 1, code: "01", shortName: "Seleção Fornecedor", name: "Processo de Seleção do Fornecedor", weight: 5, totalQuestions: 15, simplifiedCount: 9, color: "#E24B4A" },
  { id: 2, code: "02", shortName: "Armazenagem e Manuseio", name: "Armazenagem, Distribuição e Manuseio", weight: 5, totalQuestions: 23, simplifiedCount: 11, color: "#EF9F27" },
  { id: 3, code: "03", shortName: "Especificação Técnica", name: "Especificação Técnica dos Lubrificantes", weight: 5, totalQuestions: 26, simplifiedCount: 12, color: "#63C25E" },
  { id: 4, code: "04", shortName: "Aplicação", name: "Critérios de Aplicação dos Lubrificantes", weight: 4, totalQuestions: 30, simplifiedCount: 14, color: "#3B8BD4" },
  { id: 5, code: "05", shortName: "Análises de Óleo", name: "Práticas do Programa de Análises de Óleo", weight: 4, totalQuestions: 27, simplifiedCount: 10, color: "#7F77DD" },
  { id: 6, code: "06", shortName: "Controle Contaminação", name: "Controle da Contaminação", weight: 4, totalQuestions: 30, simplifiedCount: 13, color: "#D4537E" },
  { id: 7, code: "07", shortName: "Gestão e Capacitação", name: "Gestão do Programa e Capacitação da Equipe", weight: 3, totalQuestions: 31, simplifiedCount: 11, color: "#1D9E75" },
  { id: 8, code: "08", shortName: "Padronização (SOPs)", name: "Padronização das Práticas de Lubrificação", weight: 3, totalQuestions: 35, simplifiedCount: 15, color: "#F96167" },
  { id: 9, code: "09", shortName: "SSM Ambiental", name: "Práticas de Segurança, Saúde e Meio Ambiente", weight: 3, totalQuestions: 9, simplifiedCount: 7, color: "#028090" },
];

const SIMPLIFIED_QUESTIONS = [
  { id: 1, pilarId: 1, responsavel: "Gestor", text: "Existe um contrato corporativo de compra de Lubrificantes?" },
  { id: 2, pilarId: 1, responsavel: "Gestor", text: "Existe uma metodologia específica e bem definida para selecionar fornecedores?" },
  { id: 3, pilarId: 1, responsavel: "Compras / Gestor", text: "O Contrato como Fornecedor prevê multa em caso de desacordos contratuais, principalmente relacionados a atrasos na entrega?" },
  { id: 4, pilarId: 1, responsavel: "Compras / Gestor", text: "A aquisição dos Lubrificantes, inclusive os de alta performance, são baseadas em critérios técnicos pré-estabelecidos e normas técnicas?" },
  { id: 5, pilarId: 1, responsavel: "Compras / Gestor", text: "Existe na empresa um processo de aquisição bem definido que mensure a capacidade técnica do fornecedor e o grau de performance de cada produto?" },
  { id: 6, pilarId: 1, responsavel: "Compras / Gestor", text: "A performance dos produtos representa pelo menos 1/3 na decisão pelo fornecedor?" },
  { id: 7, pilarId: 1, responsavel: "Compras/Fornecedor", text: "É levado em consideração no processo de seleção do fornecedor, sua localização e boas práticas de armazenagem dos lubrificantes?" },
  { id: 8, pilarId: 1, responsavel: "Compras/Fornecedor", text: "O fornecedor detém certificados de limpeza dos contentores comuns e a granel e são apresentados quando solicitados?" },
  { id: 9, pilarId: 1, responsavel: "ALLIANCE", text: "Há um controle eficiente do estoque mínimo a fim de comprar somente o necessário?" },
  { id: 10, pilarId: 2, responsavel: "ALLIANCE", text: "O lubrificante é entregue a uma área de armazenamento coberta?" },
  { id: 11, pilarId: 2, responsavel: "ALLIANCE", text: "As embalagens dos lubrificantes estão hermeticamente fechadas, limpas e em bom estado?" },
  { id: 12, pilarId: 2, responsavel: "ALLIANCE", text: "A embalagem do lubrificante exibe sua data de envase?" },
  { id: 13, pilarId: 2, responsavel: "ALLIANCE", text: "Após a recepção, a embalagem do lubrificante é identificada através de codificação interna da empresa?" },
  { id: 14, pilarId: 2, responsavel: "ALLIANCE", text: "As práticas de armazenamento incluem regras que definam detalhes do ambiente que limitem umidade e temperatura?" },
  { id: 15, pilarId: 2, responsavel: "ALLIANCE", text: "A rotatividade dos produtos é realizada de forma que os lubrificantes mais antigos são utilizados primeiramente (FIFO)?" },
  { id: 16, pilarId: 2, responsavel: "ALLIANCE", text: "O volume de lubrificante na sala de lubrificação é suficiente para abastecer a planta até a chegada de uma nova remessa?" },
  { id: 17, pilarId: 2, responsavel: "ALLIANCE", text: "A armazenagem das embalagens de óleo e graxa garante a limpeza e qualidade do produto na sala de lubrificação?" },
  { id: 18, pilarId: 2, responsavel: "ALLIANCE", text: "Há apenas uma embalagem de cada tipo de lubrificante aberta por sala de lubrificação?" },
  { id: 19, pilarId: 2, responsavel: "ALLIANCE", text: "Os utensílios de lubrificação (pincéis, funis, contentores, etc.) estão identificados e armazenados adequadamente?" },
  { id: 20, pilarId: 2, responsavel: "ALLIANCE", text: "Todos os lubrificantes designados a aplicações críticas são pré-filtrados antes de serem aplicados nas máquinas?" },
  { id: 21, pilarId: 3, responsavel: "ALLIANCE", text: "No levantamento do plano, a designação dos óleos lubrificantes obedece especificações do fabricante e/ou normas específicas?" },
  { id: 22, pilarId: 3, responsavel: "ALLIANCE", text: "O histórico das indicações fica arquivado para futuras consultas?" },
  { id: 23, pilarId: 3, responsavel: "ALLIANCE", text: "A designação das graxas obedece especificações do fabricante do equipamento e/ou normas específicas?" },
  { id: 24, pilarId: 3, responsavel: "ALLIANCE", text: "O histórico das indicações de graxa fica arquivado para futuras consultas?" },
  { id: 25, pilarId: 3, responsavel: "Gestor", text: "As condições críticas de cada equipamento são conhecidas e possuem indicações para o uso de lubrificantes de alta performance?" },
  { id: 26, pilarId: 3, responsavel: "Gestor", text: "A empresa possui registro de quais equipamentos utilizam lubrificantes de alta performance?" },
  { id: 27, pilarId: 3, responsavel: "Gestor/ALLIANCE", text: "Os reservatórios de óleo possuem marcações de nível máximo e mínimo de fácil visualização?" },
  { id: 28, pilarId: 3, responsavel: "Gestor/ALLIANCE", text: "As frequências de relubrificação foram calculadas através de sistemática específica ou indicação dos fabricantes?" },
  { id: 29, pilarId: 3, responsavel: "Gestor/ALLIANCE", text: "Existe sistema de identificação do intervalo de relubrificação para cada ponto na máquina?" },
  { id: 30, pilarId: 3, responsavel: "Gestor", text: "Condições operacionais críticas da máquina determinam a utilização de sistemas automáticos ou centralizados de lubrificação?" },
  { id: 31, pilarId: 3, responsavel: "Gestor", text: "São aplicados lubrificantes criteriosamente especificados nos sistemas automáticos ou centralizados?" },
  { id: 32, pilarId: 3, responsavel: "Gestor", text: "Existe registro de cada ponto onde é utilizada lubrificação automática ou centralizada?" },
  { id: 33, pilarId: 4, responsavel: "ALLIANCE", text: "O abastecimento ou troca de óleo seguem procedimentos de execução que incluam padrões para os utensílios?" },
  { id: 34, pilarId: 4, responsavel: "ALLIANCE", text: "Existe identificação em cada reservatório sobre o lubrificante instalado?" },
  { id: 35, pilarId: 4, responsavel: "ALLIANCE", text: "Existe gerenciamento informatizado das atividades de lubrificação que emita ordens de serviço?" },
  { id: 36, pilarId: 4, responsavel: "ALLIANCE", text: "Existe critério sistematizado que defina a troca de óleo (por condição ou outro)?" },
  { id: 37, pilarId: 4, responsavel: "ALLIANCE", text: "Todos os reservatórios sensíveis a contaminantes são reabastecidos com lubrificante pré-filtrado?" },
  { id: 38, pilarId: 4, responsavel: "ALLIANCE", text: "O abastecimento de reservatórios de graxa segue procedimentos de execução?" },
  { id: 39, pilarId: 4, responsavel: "ALLIANCE", text: "Existe identificação em cada reservatório de graxa indicando o tipo aplicado?" },
  { id: 40, pilarId: 4, responsavel: "ALLIANCE", text: "Existe gerenciamento informatizado das atividades de lubrificação de graxa?" },
  { id: 41, pilarId: 4, responsavel: "ALLIANCE", text: "O primeiro enchimento dos dispositivos automáticos segue procedimentos específicos?" },
  { id: 42, pilarId: 4, responsavel: "ALLIANCE", text: "Existe identificação em cada reservatório ou dispositivo automático sobre o lubrificante utilizado?" },
  { id: 43, pilarId: 4, responsavel: "ALLIANCE", text: "Existe gerenciamento informatizado dos sistemas automáticos de lubrificação?" },
  { id: 44, pilarId: 4, responsavel: "ALLIANCE", text: "O abastecimento dos sistemas centralizados segue procedimentos de execução específicos?" },
  { id: 45, pilarId: 4, responsavel: "ALLIANCE", text: "Existe identificação em cada reservatório de lubrificação centralizada sobre o tipo de lubrificante?" },
  { id: 46, pilarId: 4, responsavel: "ALLIANCE", text: "Existe gerenciamento informatizado dos sistemas de lubrificação centralizada?" },
  { id: 51, pilarId: 5, responsavel: "Gestor/ALLIANCE", text: "Todos os equipamentos críticos possuem cronograma de monitoramento por análise de óleo?" },
  { id: 52, pilarId: 5, responsavel: "Gestor/ALLIANCE", text: "Existe um pacote de análises para amostras que não passaram pelo teste primário?" },
  { id: 53, pilarId: 5, responsavel: "Gestor/ALLIANCE", text: "A análise de óleo prevê ensaios para viscosidade, integridade física, vida dos aditivos e partículas sólidas?" },
  { id: 54, pilarId: 5, responsavel: "Gestor/ALLIANCE", text: "Existem procedimentos para coleta de amostras de óleo com utensílios específicos?" },
  { id: 55, pilarId: 5, responsavel: "Gestor/ALLIANCE", text: "Os pontos de coletas foram estrategicamente pré-definidos com dispositivos que garantam repetibilidade?" },
  { id: 56, pilarId: 5, responsavel: "Gestor/ALLIANCE", text: "As frequências de amostragem seguem sistemática de acordo com tipo de equipamento e nível de criticidade?" },
  { id: 57, pilarId: 5, responsavel: "Gestor/ALLIANCE", text: "As frequências de amostragem são reavaliadas quando há alterações significativas nos resultados?" },
  { id: 58, pilarId: 5, responsavel: "Gestor/ALLIANCE", text: "As amostras são padronizadas para cada tipo de reservatório com estrutura de fácil interpretação (Normal/Crítico/Alerta)?" },
  { id: 59, pilarId: 5, responsavel: "Gestor/ALLIANCE", text: "Os resultados das análises de óleo são avaliados imediatamente após recebimento?" },
  { id: 60, pilarId: 5, responsavel: "Gestor", text: "Os técnicos executam serviços baseados nos resultados das análises e incorporam históricos de ações corretivas?" },
  { id: 61, pilarId: 6, responsavel: "Diretoria/Gestor", text: "A gerência industrial e de manutenção reconhecem o controle da contaminação como Fator Chave de Sucesso?" },
  { id: 62, pilarId: 6, responsavel: "Gestor", text: "A empresa usa sistemática para medir a saúde dos lubrificantes em uso com limites ideais para equipamentos críticos?" },
  { id: 63, pilarId: 6, responsavel: "Gestor/ALLIANCE", text: "Os cárteres e reservatórios hidráulicos críticos possuem filtros de ar, câmaras de expansão e protetores de rolamentos?" },
  { id: 64, pilarId: 6, responsavel: "Gestor/ALLIANCE", text: "Reservatórios em contato com umidade possuem estratégias para eliminação da causa da contaminação?" },
  { id: 65, pilarId: 6, responsavel: "Gestor/ALLIANCE", text: "Os técnicos de lubrificação são treinados em procedimentos de prevenção de contaminantes?" },
  { id: 66, pilarId: 6, responsavel: "ALLIANCE", text: "Os reservatórios são equipados com engates rápidos para filtragem e válvulas de dreno?" },
  { id: 67, pilarId: 6, responsavel: "Gestor/ALLIANCE", text: "Os reservatórios críticos são periodicamente tratados e filtrados proativamente?" },
  { id: 68, pilarId: 6, responsavel: "Gestor/ALLIANCE", text: "Em locais onde a contaminação não pode ser removida, a troca da carga é efetuada o mais rápido possível?" },
  { id: 69, pilarId: 6, responsavel: "Compras/Gestor", text: "A empresa mantém um padrão de qualidade técnica para seleção de elementos filtrantes e respiros?" },
  { id: 70, pilarId: 6, responsavel: "Gestor/ALLIANCE", text: "Os sistemas de filtragem utilizam respiros e elementos filtrantes combinados para equalizar a qualidade?" },
  { id: 71, pilarId: 6, responsavel: "ALLIANCE", text: "As trocas dos elementos filtrantes são baseadas nos indicadores de pressão?" },
  { id: 72, pilarId: 6, responsavel: "Gestor", text: "Os projetos e modificações nos equipamentos incluem planos de racionalização de elementos filtrantes?" },
  { id: 73, pilarId: 6, responsavel: "ALLIANCE", text: "Os procedimentos de inspeção incluem checagem da eficiência dos elementos filtrantes e vedações de bombas?" },
  { id: 74, pilarId: 7, responsavel: "Gestor/ALLIANCE", text: "Existe plano de capacitação técnica dos técnicos em lubrificação com avaliações frequentes e provas de certificação?" },
  { id: 75, pilarId: 7, responsavel: "Gestor/ALLIANCE", text: "Existe política bem definida sobre cursos e ações a serem tomadas caso o técnico não tenha os conhecimentos necessários?" },
  { id: 76, pilarId: 7, responsavel: "Gestor/ALLIANCE", text: "Existe plano de capacitação técnica dos supervisores de lubrificação com avaliações frequentes?" },
  { id: 77, pilarId: 7, responsavel: "Gestor/ALLIANCE", text: "Existe política bem definida para caso o supervisor não tenha os níveis de conhecimento necessários?" },
  { id: 78, pilarId: 7, responsavel: "Diretoria/Gestor", text: "Os gerentes de produção estão envolvidos com as atividades de lubrificação e participam de reuniões rotineiras?" },
  { id: 79, pilarId: 7, responsavel: "ALLIANCE", text: "Existe sistemática implantada para a condução, realização e controle das atividades de lubrificação?" },
  { id: 80, pilarId: 7, responsavel: "ALLIANCE", text: "Durante a execução das tarefas são realizadas inspeções para detecção e correção de não conformidades?" },
  { id: 81, pilarId: 7, responsavel: "ALLIANCE", text: "Existem rotas lógicas de lubrificação com elementos e tarefas similares agrupados para melhorar a eficiência?" },
  { id: 82, pilarId: 7, responsavel: "Gestor", text: "As metas do programa de lubrificação são regidas por estratégia central associada a metas de confiabilidade?" },
  { id: 83, pilarId: 7, responsavel: "Gestor", text: "São realizadas reuniões periódicas para verificar o cumprimento dos objetivos e possíveis correções?" },
  { id: 84, pilarId: 7, responsavel: "Gestor", text: "As expectativas de cumprimento da estratégia de lubrificação fazem parte das avaliações de desempenho dos profissionais?" },
  { id: 85, pilarId: 8, responsavel: "Gestor", text: "Existe procedimento bem definido para a seleção de fornecedores quanto à qualidade dos produtos?" },
  { id: 86, pilarId: 8, responsavel: "Gestor", text: "Existe procedimento detalhando condições de entrega, gestão de estoque, armazenagem e ferramentas para manuseio?" },
  { id: 87, pilarId: 8, responsavel: "Gestor", text: "Existe procedimento detalhando as normas técnicas para a seleção de lubrificantes em geral?" },
  { id: 88, pilarId: 8, responsavel: "Gestor", text: "Existe procedimento com métodos para determinar a forma de reabastecimento do estoque?" },
  { id: 89, pilarId: 8, responsavel: "ALLIANCE", text: "Existe procedimento com o método correto de fornecimento e reabastecimento de óleos, graxas e lubrificação centralizada?" },
  { id: 90, pilarId: 8, responsavel: "ALLIANCE", text: "Existe procedimento detalhando a forma de seleção dos pontos de coleta de amostras?" },
  { id: 91, pilarId: 8, responsavel: "ALLIANCE", text: "Existe procedimento que direcione o pacote de ensaios para cada equipamento e os limites aceitáveis?" },
  { id: 92, pilarId: 8, responsavel: "ALLIANCE", text: "Existe procedimento que determine os limites aceitáveis de contaminação para cada máquina?" },
  { id: 93, pilarId: 8, responsavel: "ALLIANCE", text: "Existe procedimento com melhores práticas de remoção de contaminantes e performance dos filtros?" },
  { id: 94, pilarId: 8, responsavel: "ALLIANCE", text: "Existe política bem definida para a confecção dos Procedimentos Operacionais Padrão relacionados à lubrificação?" },
  { id: 95, pilarId: 8, responsavel: "ALLIANCE", text: "Existe política ou plano estratégico contemplando os conhecimentos necessários e grade de treinamentos?" },
  { id: 96, pilarId: 9, responsavel: "Gestor", text: "Existem procedimentos para identificar, prevenir e combater riscos de incêndio associados à lubrificação?" },
  { id: 97, pilarId: 9, responsavel: "Gestor", text: "As FISPQ dos lubrificantes estão disponíveis em todos os locais de armazenamento?" },
  { id: 98, pilarId: 9, responsavel: "Gestor", text: "Quaisquer produtos com alto risco para dermatite ou problemas respiratórios estão claramente identificados?" },
  { id: 99, pilarId: 9, responsavel: "Gestor", text: "Inspeções rotineiras incluem relato de vazamentos de lubrificantes e correção imediata?" },
  { id: 100, pilarId: 9, responsavel: "Gestor", text: "A política de conservação da planta incorpora posição formal sobre a conservação de lubrificantes?" },
  { id: 101, pilarId: 9, responsavel: "Gestor", text: "Lubrificantes são impedidos de entrar em fossas abertas e esgotos?" },
  { id: 102, pilarId: 9, responsavel: "Gestor", text: "Reservatórios em vias navegáveis são avaliados para uso de produtos biodegradáveis e quanto a vazamentos?" },
];

// ─── TYPES ────────────────────────────────────────────────────────────────────

type Screen =
  | "login"
  | "dashboard"
  | "audits-list"
  | "companies"
  | "reports-hub"
  | "new-audit"
  | "audit-overview"
  | "simplified"
  | "pilars-menu"
  | "pilar-audit"
  | "radar"
  | "report";

interface Audit {
  id: string;
  company: string;
  sector: string;
  contact: string;
  startDate: string;
  status: "draft" | "in_progress" | "completed";
  simplifiedAnswers: Record<number, boolean | null>;
  fullAnswers: Record<number, { objectiveScore: boolean | null; qualityIndex: number | null; comment: string }>;
  notes: string;
  goodPractices: string;
  improvements: string;
}

// ─── HELPERS ─────────────────────────────────────────────────────────────────

function calcSimplifiedProgress(pilarId: number, answers: Record<number, boolean | null>) {
  const qs = SIMPLIFIED_QUESTIONS.filter(q => q.pilarId === pilarId);
  if (!qs.length) return 0;
  const answered = qs.filter(q => answers[q.id] !== undefined && answers[q.id] !== null).length;
  return answered / qs.length;
}

const DEMO_SCORES = [5.06, 5.64, 3.71, 4.10, 4.28, 2.94, 1.91, 1.92, 5.04];

const getScoreColor = (s: number) => s >= 5 ? "#1D9E75" : s >= 3 ? "#FF8310" : "#C0392B";

// ─── COMPONENTS ──────────────────────────────────────────────────────────────

function Chip({ label, color }: { label: string; color?: string }) {
  return (
    <span
      className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium tracking-wide"
      style={color
        ? { backgroundColor: color + "18", color }
        : { backgroundColor: "#F0F0EF", color: "#6E6E73" }
      }
    >
      {label}
    </span>
  );
}

function ProgressBar({ value, color = "#0B2A60", height = 4 }: { value: number; color?: string; height?: number }) {
  return (
    <div className="w-full rounded-full overflow-hidden" style={{ height, backgroundColor: "#E4E4E2" }}>
      <div
        className="rounded-full transition-all duration-500"
        style={{ width: `${Math.round(value * 100)}%`, height, backgroundColor: color }}
      />
    </div>
  );
}

function StatusChip({ status }: { status: Audit["status"] }) {
  const map = {
    draft: { label: "Rascunho", color: "#6E6E73" },
    in_progress: { label: "Em andamento", color: "#FF8310" },
    completed: { label: "Concluída", color: "#1D9E75" },
  };
  const { label, color } = map[status];
  return <Chip label={label} color={color} />;
}

// ─── SCREENS ─────────────────────────────────────────────────────────────────

function LoginScreen({ onLogin }: { onLogin: () => void }) {
  const [email, setEmail] = useState("auditor@alliancelub.com.br");
  const [password, setPassword] = useState("••••••••");

  return (
    <div className="flex flex-col h-full bg-[#0B2A60]">
      <div className="flex flex-col items-center justify-center flex-1 px-8 pt-16 pb-6">
        <img src={logoUrl} alt="Alliance Lub" className="w-48 object-contain mb-3" />
        <p className="text-white/40 text-xs tracking-widest uppercase">Auditoria 360°</p>
      </div>

      <div className="bg-[#F5F5F4] rounded-t-2xl px-6 pt-7 pb-10 flex flex-col gap-4">
        <div>
          <h2 className="text-[#1C1C1E] font-semibold">Acesse sua conta</h2>
          <p className="text-[#6E6E73] text-xs mt-0.5">Alliance Lub — Lubrificação e Gestão de Ativos</p>
        </div>

        <div className="flex flex-col gap-3">
          <div>
            <label className="text-[10px] font-semibold text-[#6E6E73] uppercase tracking-wider block mb-1.5">E-mail</label>
            <input
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full bg-white border border-[#E4E4E2] rounded-lg px-3.5 py-2.5 text-sm text-[#1C1C1E] outline-none focus:border-[#0B2A60] transition-colors"
            />
          </div>
          <div>
            <label className="text-[10px] font-semibold text-[#6E6E73] uppercase tracking-wider block mb-1.5">Senha</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full bg-white border border-[#E4E4E2] rounded-lg px-3.5 py-2.5 text-sm text-[#1C1C1E] outline-none focus:border-[#0B2A60] transition-colors"
            />
          </div>
        </div>

        <button
          onClick={onLogin}
          className="w-full py-3 rounded-lg text-white text-sm font-medium bg-[#0B2A60] hover:bg-[#0a2455] active:scale-[0.99] transition-all mt-1"
        >
          Entrar
        </button>

        <p className="text-center text-xs text-[#6E6E73]">
          <span className="text-[#FF8310] font-medium cursor-pointer">Esqueceu sua senha?</span>
        </p>
      </div>
    </div>
  );
}

function DashboardScreen({ onNav, audits, onNewAudit }: { onNav: (s: Screen, d?: any) => void; audits: Audit[]; onNewAudit: () => void }) {
  const completed = audits.filter(a => a.status === "completed").length;
  const inProgress = audits.filter(a => a.status === "in_progress").length;

  return (
    <div className="flex flex-col h-full">
      <div className="px-5 pt-12 pb-5 bg-[#0B2A60]">
        <div className="flex items-center justify-between mb-5">
          <div>
            <p className="text-white/50 text-xs">Olá, Auditor</p>
            <h1 className="text-white font-semibold">Painel de Controle</h1>
          </div>
          <div className="flex items-center gap-2">
            <button className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
              <Bell size={14} className="text-white/70" />
            </button>
            <div className="w-8 h-8 rounded-full bg-[#FF8310] flex items-center justify-center">
              <span className="text-white text-xs font-semibold">AL</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {[
            { label: "Este mês", value: audits.length, icon: <Activity size={12} /> },
            { label: "Concluídas", value: completed, icon: <CheckCircle2 size={12} /> },
            { label: "Em andamento", value: inProgress, icon: <TrendingUp size={12} /> },
          ].map(s => (
            <div key={s.label} className="bg-white/8 rounded-lg p-3 border border-white/10">
              <div className="flex items-center gap-1 text-white/40 mb-1.5">
                {s.icon}
                <span className="text-[10px]">{s.label}</span>
              </div>
              <p className="text-white font-semibold text-xl">{s.value}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-4 scrollbar-hide">
        <div className="flex gap-2 mb-5">
          <button
            onClick={onNewAudit}
            className="flex-1 flex items-center gap-2 py-2.5 px-4 rounded-lg bg-[#0B2A60] text-white text-sm font-medium"
          >
            <Plus size={15} />
            Nova Auditoria
          </button>
          <button className="flex items-center gap-2 py-2.5 px-4 bg-white rounded-lg text-[#1C1C1E] text-sm font-medium border border-[#E4E4E2]">
            <Building2 size={15} />
            Empresa
          </button>
        </div>

        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-[#1C1C1E] font-semibold text-sm">Auditorias Recentes</h2>
            <span className="text-[#FF8310] text-xs font-medium cursor-pointer">Ver todas</span>
          </div>

          {audits.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-12 h-12 rounded-lg bg-[#F0F0EF] flex items-center justify-center mb-3">
                <ClipboardList size={20} className="text-[#6E6E73]" />
              </div>
              <p className="text-[#1C1C1E] font-medium text-sm">Nenhuma auditoria ainda</p>
              <p className="text-[#6E6E73] text-xs mt-1">Crie sua primeira auditoria</p>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {audits.map(audit => {
                const answered = Object.values(audit.simplifiedAnswers).filter(v => v !== null && v !== undefined).length;
                const total = SIMPLIFIED_QUESTIONS.length;
                const progress = answered / total;
                return (
                  <button
                    key={audit.id}
                    onClick={() => onNav("audit-overview", audit)}
                    className="bg-white rounded-lg p-4 text-left border border-[#E4E4E2] active:bg-[#F5F5F4] transition-colors"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className="text-[#1C1C1E] font-medium text-sm">{audit.company}</p>
                        <p className="text-[#6E6E73] text-xs mt-0.5">{audit.sector} · {audit.startDate}</p>
                      </div>
                      <StatusChip status={audit.status} />
                    </div>
                    <ProgressBar value={progress} color="#FF8310" />
                    <p className="text-[#6E6E73] text-[10px] mt-1.5">{answered} / {total} questões</p>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function NewAuditScreen({ onBack, onCreate }: { onBack: () => void; onCreate: (a: Partial<Audit>) => void }) {
  const [company, setCompany] = useState("");
  const [sector, setSector] = useState("");
  const [contact, setContact] = useState("");
  const [startDate, setStartDate] = useState(new Date().toISOString().slice(0, 10));

  const SECTORS = ["Agronegócio", "Siderurgia", "Mineração", "Papel e Celulose", "Alimentos e Bebidas", "Química", "Petroquímica", "Automobilística", "Energia", "Outro"];

  return (
    <div className="flex flex-col h-full">
      <div className="px-5 pt-12 pb-5 bg-[#0B2A60]">
        <button onClick={onBack} className="flex items-center gap-1 text-white/50 text-xs mb-4">
          <ChevronLeft size={16} /> Voltar
        </button>
        <h1 className="text-white font-semibold">Nova Auditoria</h1>
        <p className="text-white/50 text-xs mt-0.5">Dados da empresa</p>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-5 scrollbar-hide">
        <div className="flex flex-col gap-4">
          {[
            { label: "Nome da Empresa *", value: company, set: setCompany, placeholder: "Ex: ADM Agro Brasil" },
            { label: "Contato", value: contact, set: setContact, placeholder: "Nome do responsável" },
          ].map(f => (
            <div key={f.label}>
              <label className="text-[10px] font-semibold text-[#6E6E73] uppercase tracking-wider block mb-1.5">{f.label}</label>
              <input
                value={f.value}
                onChange={e => f.set(e.target.value)}
                placeholder={f.placeholder}
                className="w-full bg-white border border-[#E4E4E2] rounded-lg px-3.5 py-2.5 text-sm text-[#1C1C1E] outline-none focus:border-[#0B2A60] transition-colors"
              />
            </div>
          ))}

          <div>
            <label className="text-[10px] font-semibold text-[#6E6E73] uppercase tracking-wider block mb-1.5">Setor Industrial</label>
            <select
              value={sector}
              onChange={e => setSector(e.target.value)}
              className="w-full bg-white border border-[#E4E4E2] rounded-lg px-3.5 py-2.5 text-sm text-[#1C1C1E] outline-none focus:border-[#0B2A60] transition-colors"
            >
              <option value="">Selecionar setor</option>
              {SECTORS.map(s => <option key={s}>{s}</option>)}
            </select>
          </div>

          <div>
            <label className="text-[10px] font-semibold text-[#6E6E73] uppercase tracking-wider block mb-1.5">Data de Início</label>
            <input
              type="date"
              value={startDate}
              onChange={e => setStartDate(e.target.value)}
              className="w-full bg-white border border-[#E4E4E2] rounded-lg px-3.5 py-2.5 text-sm text-[#1C1C1E] outline-none focus:border-[#0B2A60] transition-colors"
            />
          </div>

          <div className="bg-[#F0F0EF] rounded-lg p-4 mt-1">
            <p className="text-[#1C1C1E] font-medium text-xs mb-2">Esta auditoria incluirá:</p>
            <div className="flex flex-col gap-1.5">
              {[
                "102 questões — Checklist Simplificado",
                "226 questões — Auditoria Completa (9 pilares)",
                "Cálculo automático de pontuação",
                "Gráfico radar dos 9 pilares",
                "Relatório exportável",
              ].map(t => (
                <p key={t} className="text-[#6E6E73] text-xs flex items-center gap-1.5">
                  <Check size={10} className="text-[#1D9E75] flex-shrink-0" /> {t}
                </p>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="px-5 pb-8 pt-3 border-t border-[#E4E4E2]">
        <button
          onClick={() => { if (company) onCreate({ company, sector, contact, startDate }); }}
          disabled={!company}
          className="w-full py-3 rounded-lg text-white text-sm font-medium bg-[#0B2A60] disabled:opacity-30 active:scale-[0.99] transition-all"
        >
          Iniciar Auditoria
        </button>
      </div>
    </div>
  );
}

function AuditOverviewScreen({ audit, onNav, onBack }: { audit: Audit; onNav: (s: Screen, d?: any) => void; onBack: () => void }) {
  const answered = Object.values(audit.simplifiedAnswers).filter(v => v !== null && v !== undefined).length;
  const simplifiedProgress = answered / SIMPLIFIED_QUESTIONS.length;

  const tabs = [
    { id: "overview", label: "Geral" },
    { id: "simplified", label: "Checklist" },
    { id: "full", label: "Completa" },
    { id: "results", label: "Resultado" },
  ];
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <div className="flex flex-col h-full">
      <div className="px-5 pt-12 pb-0 bg-[#0B2A60]">
        <button onClick={onBack} className="flex items-center gap-1 text-white/50 text-xs mb-3">
          <ChevronLeft size={16} /> Auditorias
        </button>
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-white font-semibold">{audit.company}</h1>
            <p className="text-white/50 text-xs mt-0.5">{audit.sector} · {audit.startDate}</p>
          </div>
          <StatusChip status={audit.status} />
        </div>

        <div className="flex border-b border-white/10">
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`flex-1 pb-2.5 text-xs font-medium transition-all border-b-2 ${activeTab === t.id ? "text-white border-[#FF8310]" : "text-white/40 border-transparent"}`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-4 scrollbar-hide">
        {activeTab === "overview" && (
          <div className="flex flex-col gap-3">
            <div className="bg-white rounded-lg p-4 border border-[#E4E4E2]">
              <h3 className="text-[#1C1C1E] font-medium text-xs mb-3">Progresso Geral</h3>
              <div className="flex flex-col gap-3">
                <div>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="text-[#6E6E73]">Checklist Simplificado</span>
                    <span className="text-[#FF8310] font-medium">{Math.round(simplifiedProgress * 100)}%</span>
                  </div>
                  <ProgressBar value={simplifiedProgress} color="#FF8310" />
                </div>
                <div>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="text-[#6E6E73]">Auditoria Completa</span>
                    <span className="text-[#6E6E73] font-medium">0%</span>
                  </div>
                  <ProgressBar value={0} color="#3B8BD4" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-4 border border-[#E4E4E2]">
              <h3 className="text-[#1C1C1E] font-medium text-xs mb-3">9 Pilares</h3>
              <div className="flex flex-col gap-2.5">
                {PILARES.map(p => {
                  const prog = calcSimplifiedProgress(p.id, audit.simplifiedAnswers);
                  return (
                    <div key={p.id}>
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: p.color }} />
                        <span className="text-[#1C1C1E] text-xs flex-1 truncate">{p.shortName}</span>
                        <span className="text-[10px] font-medium" style={{ color: p.color }}>{Math.round(prog * 100)}%</span>
                      </div>
                      <ProgressBar value={prog} color={p.color} height={3} />
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex flex-col gap-2">
              {[
                { screen: "radar", icon: <Activity size={16} />, title: "Gráfico Radar", sub: "Visualizar pontuação dos pilares", color: "#3B8BD4" },
                { screen: "report", icon: <FileText size={16} />, title: "Relatório", sub: "Gerar e exportar relatório", color: "#FF8310" },
              ].map(item => (
                <button
                  key={item.screen}
                  onClick={() => onNav(item.screen as Screen, audit)}
                  className="flex items-center justify-between bg-white rounded-lg p-3.5 border border-[#E4E4E2] active:bg-[#F5F5F4] transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-md flex items-center justify-center" style={{ backgroundColor: item.color + "15" }}>
                      <span style={{ color: item.color }}>{item.icon}</span>
                    </div>
                    <div className="text-left">
                      <p className="text-[#1C1C1E] font-medium text-sm">{item.title}</p>
                      <p className="text-[#6E6E73] text-xs">{item.sub}</p>
                    </div>
                  </div>
                  <ChevronRight size={14} className="text-[#C7C7CC]" />
                </button>
              ))}
            </div>
          </div>
        )}

        {activeTab === "simplified" && (
          <div className="flex flex-col gap-2.5">
            <button
              onClick={() => onNav("simplified", audit)}
              className="w-full py-3 rounded-lg text-white text-sm font-medium bg-[#0B2A60] active:scale-[0.99] transition-all"
            >
              {answered > 0 ? "Continuar Checklist" : "Iniciar Checklist"}
            </button>
            {PILARES.map(p => {
              const prog = calcSimplifiedProgress(p.id, audit.simplifiedAnswers);
              const qs = SIMPLIFIED_QUESTIONS.filter(q => q.pilarId === p.id);
              const answeredCount = qs.filter(q => audit.simplifiedAnswers[q.id] !== undefined && audit.simplifiedAnswers[q.id] !== null).length;
              return (
                <div key={p.id} className="bg-white rounded-lg p-3.5 border border-[#E4E4E2]">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-6 h-6 rounded flex items-center justify-center text-white text-[10px] font-semibold flex-shrink-0" style={{ backgroundColor: p.color }}>
                      {p.code}
                    </div>
                    <p className="text-[#1C1C1E] text-xs font-medium flex-1 truncate">{p.shortName}</p>
                    <span className="text-[10px] font-medium" style={{ color: p.color }}>{answeredCount}/{qs.length}</span>
                  </div>
                  <ProgressBar value={prog} color={p.color} height={3} />
                </div>
              );
            })}
          </div>
        )}

        {activeTab === "full" && (
          <div className="flex flex-col gap-2">
            {PILARES.map(p => (
              <button
                key={p.id}
                onClick={() => onNav("pilar-audit", { audit, pilarId: p.id })}
                className="bg-white rounded-lg p-3.5 border border-[#E4E4E2] flex items-center gap-3 active:bg-[#F5F5F4] transition-colors"
              >
                <div className="w-8 h-8 rounded flex items-center justify-center text-white font-semibold text-xs flex-shrink-0" style={{ backgroundColor: p.color }}>
                  {p.code}
                </div>
                <div className="flex-1 text-left">
                  <p className="text-[#1C1C1E] text-xs font-medium leading-tight">{p.shortName}</p>
                  <p className="text-[#6E6E73] text-[10px] mt-0.5">{p.totalQuestions} questões · Peso {p.weight}</p>
                </div>
                <ChevronRight size={14} className="text-[#C7C7CC]" />
              </button>
            ))}
          </div>
        )}

        {activeTab === "results" && (
          <div className="flex flex-col gap-2">
            {[
              { screen: "radar", icon: <Activity size={16} />, title: "Gráfico Radar", sub: "9 pilares de lubrificação", color: "#3B8BD4" },
              { screen: "report", icon: <FileText size={16} />, title: "Relatório Completo", sub: "Exportar PDF · Excel", color: "#FF8310" },
            ].map(item => (
              <button
                key={item.screen}
                onClick={() => onNav(item.screen as Screen, audit)}
                className="flex items-center justify-between bg-white rounded-lg p-3.5 border border-[#E4E4E2] active:bg-[#F5F5F4] transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-md flex items-center justify-center" style={{ backgroundColor: item.color + "15" }}>
                    <span style={{ color: item.color }}>{item.icon}</span>
                  </div>
                  <div className="text-left">
                    <p className="text-[#1C1C1E] font-medium text-sm">{item.title}</p>
                    <p className="text-[#6E6E73] text-xs">{item.sub}</p>
                  </div>
                </div>
                <ChevronRight size={14} className="text-[#C7C7CC]" />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function SimplifiedChecklistScreen({ audit, onBack, onAnswer }: {
  audit: Audit;
  onBack: () => void;
  onAnswer: (qId: number, val: boolean | null) => void;
}) {
  const [expandedPilar, setExpandedPilar] = useState<number>(1);
  const answered = Object.values(audit.simplifiedAnswers).filter(v => v !== null && v !== undefined).length;
  const total = SIMPLIFIED_QUESTIONS.length;

  return (
    <div className="flex flex-col h-full">
      <div className="px-5 pt-12 pb-4 bg-[#0B2A60]">
        <button onClick={onBack} className="flex items-center gap-1 text-white/50 text-xs mb-3">
          <ChevronLeft size={16} /> {audit.company}
        </button>
        <h1 className="text-white font-semibold">Checklist Simplificado</h1>
        <div className="flex items-center justify-between mt-2 mb-2">
          <p className="text-white/50 text-xs">{answered} / {total} respondidas</p>
          <p className="text-[#FF8310] text-xs font-medium">{Math.round((answered / total) * 100)}%</p>
        </div>
        <ProgressBar value={answered / total} color="#FF8310" height={3} />
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-hide">
        {PILARES.map(pilar => {
          const qs = SIMPLIFIED_QUESTIONS.filter(q => q.pilarId === pilar.id);
          const answeredInPilar = qs.filter(q => audit.simplifiedAnswers[q.id] !== undefined && audit.simplifiedAnswers[q.id] !== null).length;
          const isExpanded = expandedPilar === pilar.id;

          return (
            <div key={pilar.id} className="border-b border-[#E4E4E2]">
              <button
                onClick={() => setExpandedPilar(isExpanded ? 0 : pilar.id)}
                className="w-full flex items-center gap-3 px-5 py-3 bg-white"
              >
                <div className="w-6 h-6 rounded flex items-center justify-center text-white text-[10px] font-semibold flex-shrink-0" style={{ backgroundColor: pilar.color }}>
                  {pilar.code}
                </div>
                <div className="flex-1 text-left">
                  <p className="text-[#1C1C1E] text-xs font-medium">{pilar.shortName}</p>
                </div>
                <span className="text-[10px] text-[#6E6E73]">{answeredInPilar}/{qs.length}</span>
                {answeredInPilar === qs.length && <CheckCircle2 size={13} className="text-[#1D9E75]" />}
                {isExpanded ? <ChevronUp size={14} className="text-[#C7C7CC]" /> : <ChevronDown size={14} className="text-[#C7C7CC]" />}
              </button>

              {isExpanded && (
                <div className="bg-[#F5F5F4]">
                  {qs.map((q, idx) => {
                    const ans = audit.simplifiedAnswers[q.id];
                    return (
                      <div key={q.id} className="px-5 py-3.5 border-t border-[#E4E4E2]">
                        <div className="flex items-start gap-2 mb-2.5">
                          <span className="text-[10px] text-[#C7C7CC] font-mono mt-0.5 flex-shrink-0">{idx + 1}.</span>
                          <p className="text-[#1C1C1E] text-xs leading-relaxed flex-1">{q.text}</p>
                        </div>
                        <div className="flex items-center justify-between">
                          <Chip label={q.responsavel} />
                          <div className="flex gap-1.5">
                            <button
                              onClick={() => onAnswer(q.id, ans === true ? null : true)}
                              className={`flex items-center gap-1 px-3 py-1.5 rounded text-xs font-medium transition-all ${ans === true ? "bg-[#1D9E75] text-white" : "bg-white text-[#1D9E75] border border-[#E4E4E2]"}`}
                            >
                              <Check size={10} /> Sim
                            </button>
                            <button
                              onClick={() => onAnswer(q.id, ans === false ? null : false)}
                              className={`flex items-center gap-1 px-3 py-1.5 rounded text-xs font-medium transition-all ${ans === false ? "bg-[#C0392B] text-white" : "bg-white text-[#C0392B] border border-[#E4E4E2]"}`}
                            >
                              <X size={10} /> Não
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
        <div className="h-8" />
      </div>
    </div>
  );
}

function PilarAuditScreen({ pilarId, audit, onBack }: { pilarId: number; audit: Audit; onBack: () => void }) {
  const pilar = PILARES.find(p => p.id === pilarId)!;
  const [currentQ, setCurrentQ] = useState(0);
  const [objectiveScore, setObjectiveScore] = useState<boolean | null>(null);
  const [qualityIndex, setQualityIndex] = useState<number | null>(null);
  const [comment, setComment] = useState("");

  const questions = Array.from({ length: pilar.totalQuestions }, (_, i) => ({
    id: (pilarId - 1) * 40 + i + 1,
    text: `Afirmação ${i + 1} do ${pilar.shortName}: A empresa possui padrões bem definidos para as atividades relacionadas a este critério, seguindo normas técnicas e boas práticas do setor.`,
  }));

  const QUALITY_LABELS = ["", "Pobre", "Pouca precisão", "Precisão limitada", "Base em pesquisas", "Alta qualidade"];

  return (
    <div className="flex flex-col h-full">
      <div className="px-5 pt-12 pb-4" style={{ backgroundColor: pilar.color }}>
        <button onClick={onBack} className="flex items-center gap-1 text-white/60 text-xs mb-3">
          <ChevronLeft size={16} /> Pilares
        </button>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-8 h-8 rounded bg-white/20 flex items-center justify-center text-white font-semibold text-xs">
            {pilar.code}
          </div>
          <div>
            <h1 className="text-white font-semibold text-sm">{pilar.shortName}</h1>
            <p className="text-white/60 text-xs">{currentQ + 1} / {questions.length}</p>
          </div>
        </div>
        <ProgressBar value={currentQ / questions.length} color="rgba(255,255,255,0.4)" height={3} />
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-5 scrollbar-hide">
        <div className="bg-white rounded-lg p-4 border border-[#E4E4E2] mb-4">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-[10px] font-mono text-[#C7C7CC]">#{questions[currentQ].id}</span>
            <span className="h-px flex-1 bg-[#E4E4E2]" />
          </div>
          <p className="text-[#1C1C1E] text-sm leading-relaxed">{questions[currentQ].text}</p>
        </div>

        <div className="mb-4">
          <p className="text-[10px] font-semibold text-[#6E6E73] uppercase tracking-wider mb-2">Avaliação Objetiva</p>
          <div className="flex gap-2">
            <button
              onClick={() => setObjectiveScore(objectiveScore === true ? null : true)}
              className={`flex-1 py-2.5 rounded text-sm font-medium transition-all ${objectiveScore === true ? "text-white" : "bg-white text-[#1D9E75] border border-[#E4E4E2]"}`}
              style={objectiveScore === true ? { backgroundColor: "#1D9E75" } : {}}
            >
              Verdadeiro
            </button>
            <button
              onClick={() => setObjectiveScore(objectiveScore === false ? null : false)}
              className={`flex-1 py-2.5 rounded text-sm font-medium transition-all ${objectiveScore === false ? "text-white" : "bg-white text-[#C0392B] border border-[#E4E4E2]"}`}
              style={objectiveScore === false ? { backgroundColor: "#C0392B" } : {}}
            >
              Falso
            </button>
          </div>
        </div>

        <div className="mb-4">
          <p className="text-[10px] font-semibold text-[#6E6E73] uppercase tracking-wider mb-2">Índice de Qualidade</p>
          <div className="flex gap-1.5">
            {[1, 2, 3, 4, 5].map(n => (
              <button
                key={n}
                onClick={() => setQualityIndex(qualityIndex === n ? null : n)}
                className={`flex-1 py-2.5 rounded text-sm font-medium transition-all ${qualityIndex === n ? "text-white" : "bg-white text-[#1C1C1E] border border-[#E4E4E2]"}`}
                style={qualityIndex === n ? { backgroundColor: pilar.color } : {}}
              >
                {n}
              </button>
            ))}
          </div>
          {qualityIndex && (
            <p className="text-[#6E6E73] text-[10px] mt-1.5 text-center">{QUALITY_LABELS[qualityIndex]}</p>
          )}
        </div>

        <div className="mb-4">
          <p className="text-[10px] font-semibold text-[#6E6E73] uppercase tracking-wider mb-2">Comentário</p>
          <textarea
            value={comment}
            onChange={e => setComment(e.target.value)}
            placeholder="Observações, evidências, referências..."
            rows={3}
            className="w-full bg-white border border-[#E4E4E2] rounded-lg px-3.5 py-2.5 text-sm text-[#1C1C1E] outline-none focus:border-[#0B2A60] transition-colors resize-none"
          />
        </div>

        <button className="w-full flex items-center gap-2 justify-center py-2.5 border border-dashed border-[#E4E4E2] rounded-lg text-[#6E6E73] text-xs">
          <Camera size={14} /> Anexar evidência fotográfica
        </button>
      </div>

      <div className="px-5 pb-8 pt-3 flex gap-2 border-t border-[#E4E4E2]">
        <button
          onClick={() => setCurrentQ(Math.max(0, currentQ - 1))}
          disabled={currentQ === 0}
          className="flex-1 py-2.5 rounded bg-white border border-[#E4E4E2] text-[#1C1C1E] text-sm font-medium disabled:opacity-30 flex items-center justify-center gap-1"
        >
          <ChevronLeft size={14} /> Anterior
        </button>
        <button
          onClick={() => setCurrentQ(Math.min(questions.length - 1, currentQ + 1))}
          className="flex-1 py-2.5 rounded text-white text-sm font-medium flex items-center justify-center gap-1"
          style={{ backgroundColor: pilar.color }}
        >
          {currentQ === questions.length - 1 ? "Concluir" : "Próxima"} <ChevronRight size={14} />
        </button>
      </div>
    </div>
  );
}

// Abreviações curtas para caber nos eixos do radar
const PILAR_LABELS = ["Seleção", "Armazenagem", "Especif.", "Aplicação", "Análises", "Contaminação", "Gestão", "SOPs", "SSM"];

function RadarScreen({ audit, onBack }: { audit: Audit; onBack: () => void }) {
  const radarData = PILARES.map((p, i) => ({
    subject: PILAR_LABELS[i],
    fullName: p.shortName,
    score: DEMO_SCORES[i],
    groupAvg: 4.2,
    color: p.color,
  }));

  const total = DEMO_SCORES.reduce((s, v) => s + v, 0) / DEMO_SCORES.length;
  const sorted = [...PILARES].map((p, i) => ({ ...p, score: DEMO_SCORES[i] })).sort((a, b) => b.score - a.score);

  return (
    <div className="flex flex-col h-full">
      <div className="px-5 pt-12 pb-5 bg-[#0B2A60]">
        <button onClick={onBack} className="flex items-center gap-1 text-white/50 text-xs mb-3">
          <ChevronLeft size={16} /> {audit.company}
        </button>
        <h1 className="text-white font-semibold">Gráfico Radar</h1>
        <p className="text-white/50 text-xs">9 Pilares de Lubrificação 360°</p>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 scrollbar-hide">
        {/* Score resumo */}
        <div className="bg-white rounded-lg p-4 mb-3 border border-[#E4E4E2] flex items-center gap-4">
          <div className="flex flex-col items-center min-w-[72px]">
            <p className="text-[10px] text-[#6E6E73] uppercase tracking-wider mb-1">Score Geral</p>
            <p className="text-3xl font-bold" style={{ color: getScoreColor(total) }}>{total.toFixed(2)}</p>
            <Chip label={total >= 5 ? "Bom" : total >= 3 ? "Médio" : "Crítico"} color={getScoreColor(total)} />
          </div>
          <div className="flex-1 border-l border-[#E4E4E2] pl-4">
            <p className="text-[#6E6E73] text-xs leading-relaxed">
              Média composta dos 9 pilares (pontuação objetiva × índice de qualidade).
            </p>
            <p className="text-[#1C1C1E] text-xs font-medium mt-1.5">Média do grupo: 4.20</p>
          </div>
        </div>

        {/* Gráfico radar */}
        <div className="bg-white rounded-lg pt-3 pb-2 px-1 mb-3 border border-[#E4E4E2]">
          <ResponsiveContainer width="100%" height={280}>
            <RadarChart data={radarData} margin={{ top: 16, right: 40, bottom: 16, left: 40 }}>
              <PolarGrid stroke="#E4E4E2" />
              <PolarAngleAxis
                dataKey="subject"
                tick={{ fill: "#1C1C1E", fontSize: 8.5, fontWeight: 500 }}
                tickLine={false}
              />
              <PolarRadiusAxis
                angle={90}
                domain={[0, 10]}
                tickCount={6}
                tick={{ fill: "#C7C7CC", fontSize: 7 }}
                axisLine={false}
                tickLine={false}
              />
              <Radar
                name="Média Grupo"
                dataKey="groupAvg"
                stroke="#C7C7CC"
                fill="#C7C7CC"
                fillOpacity={0.08}
                strokeWidth={1}
                strokeDasharray="4 3"
              />
              <Radar
                name={audit.company}
                dataKey="score"
                stroke="#0B2A60"
                fill="#0B2A60"
                fillOpacity={0.15}
                strokeWidth={2}
                dot={(props: any) => {
                  const { cx, cy, index } = props;
                  const color = PILARES[index]?.color ?? "#0B2A60";
                  return <circle key={index} cx={cx} cy={cy} r={4} fill={color} stroke="#fff" strokeWidth={1.5} />;
                }}
              />
              <Tooltip
                content={({ payload }) => {
                  if (!payload?.length) return null;
                  const d = payload[0]?.payload;
                  return (
                    <div className="bg-white rounded-lg shadow-sm p-2.5 border border-[#E4E4E2] text-xs">
                      <p className="font-medium text-[#1C1C1E] mb-1">{d.fullName}</p>
                      <p style={{ color: getScoreColor(d.score) }}>Score: <strong>{d.score.toFixed(2)}</strong></p>
                      <p className="text-[#6E6E73]">Grupo: {d.groupAvg.toFixed(2)}</p>
                    </div>
                  );
                }}
              />
            </RadarChart>
          </ResponsiveContainer>
          <div className="flex justify-center gap-5 pb-1">
            <div className="flex items-center gap-1.5">
              <div className="w-5 h-0.5 bg-[#0B2A60] rounded" />
              <span className="text-[10px] text-[#6E6E73]">{audit.company}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-5 border-t border-dashed border-[#C7C7CC]" />
              <span className="text-[10px] text-[#6E6E73]">Média do grupo</span>
            </div>
          </div>
        </div>

        {/* Detalhamento ordenado por score */}
        <div className="bg-white rounded-lg border border-[#E4E4E2] overflow-hidden mb-3">
          <div className="px-4 py-3 border-b border-[#E4E4E2] flex items-center justify-between">
            <h3 className="text-[#1C1C1E] font-medium text-xs">Detalhamento por Pilar</h3>
            <span className="text-[10px] text-[#6E6E73]">ordenado por score</span>
          </div>
          {sorted.map((p, rank) => (
            <div key={p.id} className="flex items-center gap-3 px-4 py-2.5 border-b border-[#E4E4E2] last:border-0">
              <span className="text-[10px] text-[#C7C7CC] w-4 flex-shrink-0">#{rank + 1}</span>
              <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: p.color }} />
              <p className="flex-1 text-[#1C1C1E] text-xs truncate">{p.shortName}</p>
              <div className="flex items-center gap-2">
                <div className="w-16">
                  <ProgressBar value={p.score / 10} color={p.color} height={3} />
                </div>
                <span className="text-xs font-medium w-8 text-right" style={{ color: getScoreColor(p.score) }}>
                  {p.score.toFixed(2)}
                </span>
              </div>
            </div>
          ))}
        </div>

        <button className="w-full py-3 rounded-lg flex items-center justify-center gap-2 bg-[#0B2A60] text-white text-sm font-medium active:scale-[0.99] transition-all">
          <Download size={14} /> Exportar Gráfico
        </button>
      </div>
    </div>
  );
}

function ReportScreen({ audit, onBack }: { audit: Audit; onBack: () => void }) {
  const answered = Object.values(audit.simplifiedAnswers).filter(v => v !== null && v !== undefined).length;
  const simYes = Object.values(audit.simplifiedAnswers).filter(v => v === true).length;
  const simNo = Object.values(audit.simplifiedAnswers).filter(v => v === false).length;

  return (
    <div className="flex flex-col h-full">
      <div className="px-5 pt-12 pb-5 bg-[#0B2A60]">
        <button onClick={onBack} className="flex items-center gap-1 text-white/50 text-xs mb-3">
          <ChevronLeft size={16} /> {audit.company}
        </button>
        <h1 className="text-white font-semibold">Relatório de Auditoria</h1>
        <p className="text-white/50 text-xs">Alliance Lub — Auditoria 360°</p>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-4 scrollbar-hide">
        <div className="bg-white rounded-lg p-4 border border-[#E4E4E2] mb-3">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded bg-[#0B2A60] flex items-center justify-center flex-shrink-0">
              <FileText size={16} className="text-white" />
            </div>
            <div className="flex-1">
              <h2 className="text-[#1C1C1E] font-semibold text-sm">{audit.company}</h2>
              <p className="text-[#6E6E73] text-xs mt-0.5">{audit.sector}</p>
              <p className="text-[#6E6E73] text-xs">Data: {audit.startDate}</p>
            </div>
          </div>
          <div className="mt-3 bg-[#F0F0EF] rounded p-3">
            <p className="text-[#6E6E73] text-[11px] leading-relaxed italic">
              "Esta Auditoria tem como base visita a campo por Engenheiro Especialista ALLIANCE e preenchimento de questionário com perguntas baseadas nas práticas do Programa de Lubrificação 360º ALLIANCE®."
            </p>
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 border border-[#E4E4E2] mb-3">
          <h3 className="text-[#1C1C1E] font-medium text-xs mb-3">Checklist Simplificado</h3>
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: "Respondidas", value: answered, color: "#1C1C1E" },
              { label: "Conformes", value: simYes, color: "#1D9E75" },
              { label: "Não conformes", value: simNo, color: "#C0392B" },
            ].map(s => (
              <div key={s.label} className="bg-[#F0F0EF] rounded p-2.5 text-center">
                <p className="font-semibold text-sm mb-0.5" style={{ color: s.color }}>{s.value}</p>
                <p className="text-[10px] text-[#6E6E73]">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg border border-[#E4E4E2] mb-3">
          <div className="px-4 py-3 border-b border-[#E4E4E2]">
            <h3 className="text-[#1C1C1E] font-medium text-xs">Pontuação por Pilar</h3>
            <p className="text-[#6E6E73] text-[10px]">Valores de referência — ADM Agro (fev–mar 2025)</p>
          </div>
          {PILARES.map((p, i) => {
            const score = DEMO_SCORES[i];
            const discScore = p.weight * 10;
            const percentile = ((score * discScore) / 100).toFixed(4);
            return (
              <div key={p.id} className="px-4 py-2.5 border-b border-[#E4E4E2] last:border-0">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: p.color }} />
                  <span className="text-[#1C1C1E] text-xs flex-1">{p.shortName}</span>
                  <span className="text-xs font-medium" style={{ color: getScoreColor(score) }}>{score.toFixed(4)}</span>
                </div>
                <div className="flex gap-3 text-[10px] text-[#6E6E73]">
                  <span>Disc.: {discScore}</span>
                  <span>Percentil: {percentile}</span>
                  <span>Peso: {p.weight}</span>
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex flex-col gap-2.5 mb-4">
          {[
            { label: "Boas Práticas Encontradas", placeholder: "Descreva as boas práticas observadas na empresa..." },
            { label: "Oportunidades de Melhoria", placeholder: "Liste as principais oportunidades de melhoria identificadas..." },
            { label: "Próximos Passos Alliance", placeholder: "Ações recomendadas para implantação da Lubrificação 360°..." },
          ].map(f => (
            <div key={f.label} className="bg-white rounded-lg p-4 border border-[#E4E4E2]">
              <p className="text-[#1C1C1E] font-medium text-xs mb-2">{f.label}</p>
              <textarea
                placeholder={f.placeholder}
                rows={3}
                className="w-full bg-[#F0F0EF] rounded px-3 py-2.5 text-xs text-[#1C1C1E] outline-none resize-none focus:ring-1 focus:ring-[#0B2A60] transition-all"
              />
            </div>
          ))}
        </div>

        <div className="flex gap-2 mb-8">
          <button className="flex-1 py-3 rounded flex items-center justify-center gap-2 bg-[#FF8310] text-white text-sm font-medium">
            <Download size={14} /> PDF
          </button>
          <button className="flex-1 py-3 rounded flex items-center justify-center gap-2 bg-[#1D9E75] text-white text-sm font-medium">
            <Download size={14} /> Excel
          </button>
          <button className="flex-1 py-3 rounded flex items-center justify-center gap-2 bg-[#0B2A60] text-white text-sm font-medium">
            <Users size={14} /> Compartilhar
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── AUDITS LIST SCREEN ───────────────────────────────────────────────────────

function AuditsListScreen({ audits, onNav, onNewAudit }: { audits: Audit[]; onNav: (s: Screen, d?: any) => void; onNewAudit: () => void }) {
  const [filter, setFilter] = useState<"all" | "in_progress" | "completed" | "draft">("all");
  const [search, setSearch] = useState("");

  const filtered = audits.filter(a => {
    const matchFilter = filter === "all" || a.status === filter;
    const matchSearch = a.company.toLowerCase().includes(search.toLowerCase()) || a.sector.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  const statusCount = {
    all: audits.length,
    in_progress: audits.filter(a => a.status === "in_progress").length,
    completed: audits.filter(a => a.status === "completed").length,
    draft: audits.filter(a => a.status === "draft").length,
  };

  return (
    <div className="flex flex-col h-full">
      <div className="px-5 pt-12 pb-4 bg-[#0B2A60]">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-white font-semibold">Auditorias</h1>
            <p className="text-white/50 text-xs mt-0.5">{audits.length} no total</p>
          </div>
          <button
            onClick={onNewAudit}
            className="w-8 h-8 rounded-full flex items-center justify-center bg-[#FF8310]"
          >
            <Plus size={16} className="text-white" />
          </button>
        </div>

        <div className="flex items-center gap-2 bg-white/10 rounded-lg px-3 py-2 mb-3">
          <Search size={13} className="text-white/40 flex-shrink-0" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar empresa ou setor..."
            className="flex-1 bg-transparent text-white text-xs outline-none placeholder:text-white/30"
          />
        </div>

        <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
          {(["all", "in_progress", "completed", "draft"] as const).map(f => {
            const labels = { all: "Todas", in_progress: "Em andamento", completed: "Concluídas", draft: "Rascunhos" };
            return (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`flex-shrink-0 px-3 py-1 rounded text-[11px] font-medium transition-all ${filter === f ? "bg-white text-[#0B2A60]" : "bg-white/10 text-white/50"}`}
              >
                {labels[f]} ({statusCount[f]})
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-4 scrollbar-hide">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-12 h-12 rounded-lg bg-[#F0F0EF] flex items-center justify-center mb-3">
              <ClipboardList size={20} className="text-[#6E6E73]" />
            </div>
            <p className="text-[#1C1C1E] font-medium text-sm">Nenhuma auditoria encontrada</p>
            <p className="text-[#6E6E73] text-xs mt-1">Ajuste os filtros ou crie uma nova</p>
            <button
              onClick={onNewAudit}
              className="mt-4 px-5 py-2 rounded bg-[#0B2A60] text-white text-xs font-medium"
            >
              Nova Auditoria
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {filtered.map(audit => {
              const answered = Object.values(audit.simplifiedAnswers).filter(v => v !== null && v !== undefined).length;
              const total = SIMPLIFIED_QUESTIONS.length;
              const progress = answered / total;
              const simYes = Object.values(audit.simplifiedAnswers).filter(v => v === true).length;

              return (
                <button
                  key={audit.id}
                  onClick={() => onNav("audit-overview", audit)}
                  className="bg-white rounded-lg p-4 text-left border border-[#E4E4E2] active:bg-[#F5F5F4] transition-colors"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded bg-[#F0F0EF] flex items-center justify-center flex-shrink-0">
                        <Building2 size={16} className="text-[#6E6E73]" />
                      </div>
                      <div>
                        <p className="text-[#1C1C1E] font-medium text-sm">{audit.company}</p>
                        <p className="text-[#6E6E73] text-xs">{audit.sector}</p>
                      </div>
                    </div>
                    <StatusChip status={audit.status} />
                  </div>

                  <div className="flex gap-2 mb-2.5">
                    <div className="flex-1 bg-[#F0F0EF] rounded p-2 text-center">
                      <p className="text-[#1C1C1E] font-semibold text-sm">{answered}</p>
                      <p className="text-[10px] text-[#6E6E73]">Respondidas</p>
                    </div>
                    <div className="flex-1 bg-[#F0F0EF] rounded p-2 text-center">
                      <p className="text-[#1D9E75] font-semibold text-sm">{simYes}</p>
                      <p className="text-[10px] text-[#6E6E73]">Conformes</p>
                    </div>
                    <div className="flex-1 bg-[#F0F0EF] rounded p-2 text-center">
                      <p className="text-[#1C1C1E] font-semibold text-xs">{audit.startDate.slice(0, 7)}</p>
                      <p className="text-[10px] text-[#6E6E73]">Data</p>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-[10px] text-[#6E6E73] mb-1">
                      <span>Progresso</span>
                      <span className="text-[#FF8310]">{Math.round(progress * 100)}%</span>
                    </div>
                    <ProgressBar value={progress} color="#FF8310" height={3} />
                  </div>
                </button>
              );
            })}
          </div>
        )}
        <div className="h-4" />
      </div>
    </div>
  );
}

// ─── COMPANIES SCREEN ─────────────────────────────────────────────────────────

const DEMO_COMPANIES = [
  { id: "c1", name: "ADM Agro Brasil Ltda.", sector: "Agronegócio", city: "Ribeirão Preto", state: "SP", contact: "João Carlos Silva", audits: 3, lastAudit: "2025-02-10", status: "active" as const },
  { id: "c2", name: "Usina Metalúrgica Santa Cruz", sector: "Siderurgia", city: "Volta Redonda", state: "RJ", contact: "Maria Fernanda Costa", audits: 1, lastAudit: "2025-01-15", status: "active" as const },
  { id: "c3", name: "Mineração Vale do Rio", sector: "Mineração", city: "Belo Horizonte", state: "MG", contact: "Carlos Eduardo Pinto", audits: 2, lastAudit: "2024-11-20", status: "active" as const },
  { id: "c4", name: "Fibria Papel e Celulose", sector: "Papel e Celulose", city: "Aracruz", state: "ES", contact: "Ana Paula Rodrigues", audits: 4, lastAudit: "2024-09-05", status: "active" as const },
  { id: "c5", name: "BRF Alimentos S.A.", sector: "Alimentos e Bebidas", city: "Videira", state: "SC", contact: "Roberto Henrique Lima", audits: 1, lastAudit: "2024-07-18", status: "inactive" as const },
];

function CompaniesScreen({ onNav }: { onNav: (s: Screen, d?: any) => void }) {
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [newName, setNewName] = useState("");
  const [newSector, setNewSector] = useState("");
  const [newCity, setNewCity] = useState("");

  const filtered = DEMO_COMPANIES.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.sector.toLowerCase().includes(search.toLowerCase())
  );

  const SECTOR_COLORS: Record<string, string> = {
    "Agronegócio": "#1D9E75", "Siderurgia": "#3B8BD4", "Mineração": "#EF9F27",
    "Papel e Celulose": "#63C25E", "Alimentos e Bebidas": "#FF8310",
    "Química": "#7F77DD", "Petroquímica": "#D4537E", "Automobilística": "#028090",
  };

  return (
    <div className="flex flex-col h-full">
      <div className="px-5 pt-12 pb-4 bg-[#0B2A60]">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-white font-semibold">Empresas</h1>
            <p className="text-white/50 text-xs mt-0.5">{DEMO_COMPANIES.length} clientes</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="w-8 h-8 rounded-full flex items-center justify-center"
            style={{ backgroundColor: showForm ? "rgba(255,255,255,0.15)" : "#FF8310" }}
          >
            {showForm ? <X size={16} className="text-white" /> : <Plus size={16} className="text-white" />}
          </button>
        </div>
        <div className="flex items-center gap-2 bg-white/10 rounded-lg px-3 py-2">
          <Search size={13} className="text-white/40 flex-shrink-0" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar empresa ou setor..."
            className="flex-1 bg-transparent text-white text-xs outline-none placeholder:text-white/30"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-4 scrollbar-hide">
        {showForm && (
          <div className="bg-white rounded-lg p-4 border border-[#E4E4E2] mb-3">
            <h3 className="text-[#1C1C1E] font-medium text-xs mb-3">Nova Empresa</h3>
            <div className="flex flex-col gap-2">
              <input value={newName} onChange={e => setNewName(e.target.value)} placeholder="Nome da empresa *" className="w-full bg-[#F0F0EF] rounded px-3 py-2.5 text-xs text-[#1C1C1E] outline-none focus:ring-1 focus:ring-[#0B2A60] transition-all" />
              <input value={newSector} onChange={e => setNewSector(e.target.value)} placeholder="Setor industrial" className="w-full bg-[#F0F0EF] rounded px-3 py-2.5 text-xs text-[#1C1C1E] outline-none focus:ring-1 focus:ring-[#0B2A60] transition-all" />
              <input value={newCity} onChange={e => setNewCity(e.target.value)} placeholder="Cidade / Estado" className="w-full bg-[#F0F0EF] rounded px-3 py-2.5 text-xs text-[#1C1C1E] outline-none focus:ring-1 focus:ring-[#0B2A60] transition-all" />
              <button onClick={() => { if (newName) setShowForm(false); }} className="w-full py-2.5 rounded bg-[#0B2A60] text-white text-xs font-medium">
                Cadastrar Empresa
              </button>
            </div>
          </div>
        )}

        <div className="flex flex-col gap-2">
          {filtered.map(company => {
            const color = SECTOR_COLORS[company.sector] ?? "#6E6E73";
            const initials = company.name.split(" ").slice(0, 2).map(w => w[0]).join("").toUpperCase();
            return (
              <div key={company.id} className="bg-white rounded-lg p-4 border border-[#E4E4E2]">
                <div className="flex items-start gap-3 mb-3">
                  <div
                    className="w-10 h-10 rounded flex items-center justify-center text-white font-semibold text-xs flex-shrink-0"
                    style={{ backgroundColor: color }}
                  >
                    {initials}
                  </div>
                  <div className="flex-1">
                    <p className="text-[#1C1C1E] font-medium text-sm leading-tight">{company.name}</p>
                    <p className="text-[#6E6E73] text-xs mt-0.5">{company.city}, {company.state}</p>
                    <Chip label={company.sector} color={color} />
                  </div>
                  <div className={`w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 ${company.status === "active" ? "bg-[#1D9E75]" : "bg-[#C7C7CC]"}`} />
                </div>

                <div className="flex gap-2 mb-3">
                  {[
                    { label: "Auditorias", value: company.audits, color: "#1C1C1E" },
                    { label: "Última audit.", value: company.lastAudit.slice(0, 7), color: "#1C1C1E" },
                    { label: "Contato", value: company.contact.split(" ")[0], color: "#1C1C1E" },
                  ].map(s => (
                    <div key={s.label} className="flex-1 bg-[#F0F0EF] rounded p-2 text-center overflow-hidden">
                      <p className="font-medium text-xs truncate" style={{ color: s.color }}>{s.value}</p>
                      <p className="text-[10px] text-[#6E6E73]">{s.label}</p>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => onNav("new-audit")}
                  className="w-full py-2 rounded border border-[#E4E4E2] text-[#1C1C1E] text-xs font-medium flex items-center justify-center gap-1 active:bg-[#F0F0EF] transition-colors"
                >
                  <Plus size={12} /> Nova Auditoria
                </button>
              </div>
            );
          })}
        </div>
        <div className="h-4" />
      </div>
    </div>
  );
}

// ─── REPORTS SCREEN ───────────────────────────────────────────────────────────

const DEMO_REPORTS = [
  { id: "r1", company: "ADM Agro Brasil Ltda.", date: "2025-02-10", type: "PDF", score: 4.27, status: "ready" as const },
  { id: "r2", company: "ADM Agro Brasil Ltda.", date: "2025-02-10", type: "Excel", score: 4.27, status: "ready" as const },
  { id: "r3", company: "Usina Metalúrgica Santa Cruz", date: "2025-01-15", type: "PDF", score: 3.41, status: "ready" as const },
  { id: "r4", company: "Mineração Vale do Rio", date: "2024-11-20", type: "PDF", score: 5.12, status: "ready" as const },
];

function ReportsScreen({ audits, onNav }: { audits: Audit[]; onNav: (s: Screen, d?: any) => void }) {
  const [activeSection, setActiveSection] = useState<"recent" | "analytics">("recent");

  return (
    <div className="flex flex-col h-full">
      <div className="px-5 pt-12 pb-0 bg-[#0B2A60]">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-white font-semibold">Relatórios</h1>
            <p className="text-white/50 text-xs mt-0.5">Central de exportação e análise</p>
          </div>
          <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
            <Download size={14} className="text-white/70" />
          </div>
        </div>

        <div className="flex border-b border-white/10">
          {(["recent", "analytics"] as const).map(s => (
            <button
              key={s}
              onClick={() => setActiveSection(s)}
              className={`flex-1 pb-2.5 text-xs font-medium transition-all border-b-2 ${activeSection === s ? "text-white border-[#FF8310]" : "text-white/40 border-transparent"}`}
            >
              {s === "recent" ? "Recentes" : "Análise Comparativa"}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-4 scrollbar-hide">
        {activeSection === "recent" && (
          <div className="flex flex-col gap-3">
            <div className="grid grid-cols-2 gap-2 mb-1">
              {[
                { label: "Relatórios gerados", value: DEMO_REPORTS.length, icon: <FileText size={14} />, color: "#FF8310" },
                { label: "Empresas auditadas", value: 4, icon: <Building2 size={14} />, color: "#0B2A60" },
                { label: "Score médio", value: "4.27", icon: <Star size={14} />, color: "#EF9F27" },
                { label: "Este mês", value: audits.length, icon: <Activity size={14} />, color: "#1D9E75" },
              ].map(s => (
                <div key={s.label} className="bg-white rounded-lg p-3.5 border border-[#E4E4E2]">
                  <div className="flex items-center gap-1.5 mb-2" style={{ color: s.color }}>
                    {s.icon}
                    <span className="text-[10px] text-[#6E6E73]">{s.label}</span>
                  </div>
                  <p className="text-[#1C1C1E] font-bold text-xl">{s.value}</p>
                </div>
              ))}
            </div>

            <div>
              <p className="text-[#1C1C1E] font-medium text-xs mb-2">Exportações Recentes</p>
              <div className="flex flex-col gap-1.5">
                {DEMO_REPORTS.map(r => (
                  <div key={r.id} className="bg-white rounded-lg p-3.5 border border-[#E4E4E2] flex items-center gap-3">
                    <div className="w-8 h-8 rounded flex items-center justify-center flex-shrink-0 bg-[#F0F0EF]">
                      <FileText size={15} style={{ color: r.type === "PDF" ? "#FF8310" : "#1D9E75" }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[#1C1C1E] font-medium text-xs truncate">{r.company}</p>
                      <p className="text-[#6E6E73] text-[10px]">{r.date} · {r.type}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className="text-xs font-medium" style={{ color: getScoreColor(r.score) }}>{r.score.toFixed(2)}</span>
                      <button className="text-[#FF8310] text-[10px] font-medium flex items-center gap-0.5">
                        <Download size={10} /> Baixar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-[#0B2A60] rounded-lg p-4">
              <p className="text-white font-medium text-sm mb-0.5">Gerar Novo Relatório</p>
              <p className="text-white/50 text-xs mb-3">Selecione uma auditoria para exportar</p>
              <div className="flex flex-col gap-1.5">
                {audits.map(a => (
                  <button
                    key={a.id}
                    onClick={() => onNav("report", a)}
                    className="flex items-center justify-between bg-white/8 rounded px-3 py-2.5 border border-white/10 active:bg-white/15 transition-colors"
                  >
                    <div className="text-left">
                      <p className="text-white text-xs font-medium">{a.company}</p>
                      <p className="text-white/40 text-[10px]">{a.startDate}</p>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <StatusChip status={a.status} />
                      <ChevronRight size={13} className="text-white/30" />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeSection === "analytics" && (
          <div className="flex flex-col gap-3">
            <div className="bg-white rounded-lg p-4 border border-[#E4E4E2]">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-[#1C1C1E] font-medium text-xs">Média dos 9 Pilares</h3>
                <span className="text-[10px] text-[#6E6E73]">Última auditoria</span>
              </div>
              <ResponsiveContainer width="100%" height={220}>
                <RadarChart data={PILARES.map((p, i) => ({ subject: p.shortName.split(" ")[0], score: DEMO_SCORES[i], groupAvg: 4.2 }))}>
                  <PolarGrid stroke="#E4E4E2" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: "#1C1C1E", fontSize: 9, fontWeight: 500 }} />
                  <PolarRadiusAxis angle={90} domain={[0, 10]} tick={false} axisLine={false} />
                  <Radar name="Grupo" dataKey="groupAvg" stroke="#C7C7CC" fill="#C7C7CC" fillOpacity={0.1} strokeWidth={1} strokeDasharray="4 3" />
                  <Radar name="Empresa" dataKey="score" stroke="#0B2A60" fill="#0B2A60" fillOpacity={0.12} strokeWidth={2} />
                </RadarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white rounded-lg border border-[#E4E4E2]">
              <div className="px-4 py-3 border-b border-[#E4E4E2]">
                <h3 className="text-[#1C1C1E] font-medium text-xs">Ranking dos Pilares</h3>
              </div>
              {[...PILARES]
                .map((p, i) => ({ ...p, score: DEMO_SCORES[i] }))
                .sort((a, b) => b.score - a.score)
                .map((p, rank) => (
                  <div key={p.id} className="flex items-center gap-3 px-4 py-2.5 border-b border-[#E4E4E2] last:border-0">
                    <span className="text-[10px] text-[#C7C7CC] w-4">#{rank + 1}</span>
                    <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: p.color }} />
                    <p className="flex-1 text-[#1C1C1E] text-xs truncate">{p.shortName}</p>
                    <div className="flex items-center gap-2">
                      <div className="w-14">
                        <ProgressBar value={p.score / 10} color={p.color} height={3} />
                      </div>
                      <span className="text-xs font-medium w-8 text-right" style={{ color: getScoreColor(p.score) }}>
                        {p.score.toFixed(2)}
                      </span>
                    </div>
                  </div>
                ))}
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="bg-white rounded-lg p-3.5 border border-[#E4E4E2] border-l-2" style={{ borderLeftColor: "#1D9E75" }}>
                <p className="text-[10px] font-medium text-[#1D9E75] uppercase tracking-wide mb-1">Melhor Pilar</p>
                <p className="text-[#1C1C1E] font-medium text-xs leading-tight">Armazenagem e Manuseio</p>
                <p className="text-[#1D9E75] font-bold text-lg mt-1">5.64</p>
              </div>
              <div className="bg-white rounded-lg p-3.5 border border-[#E4E4E2] border-l-2" style={{ borderLeftColor: "#C0392B" }}>
                <p className="text-[10px] font-medium text-[#C0392B] uppercase tracking-wide mb-1">Pilar Crítico</p>
                <p className="text-[#1C1C1E] font-medium text-xs leading-tight">Gestão e Capacitação</p>
                <p className="text-[#C0392B] font-bold text-lg mt-1">1.91</p>
              </div>
            </div>
          </div>
        )}
        <div className="h-4" />
      </div>
    </div>
  );
}

// ─── BOTTOM NAV ──────────────────────────────────────────────────────────────

function BottomNav({ activeTab, onTab }: { activeTab: string; onTab: (t: string) => void }) {
  const tabs = [
    { id: "home", icon: <Home size={19} />, label: "Início" },
    { id: "audits", icon: <ClipboardList size={19} />, label: "Auditorias" },
    { id: "companies", icon: <Building2 size={19} />, label: "Empresas" },
    { id: "reports", icon: <BarChart3 size={19} />, label: "Relatórios" },
  ];
  return (
    <div className="flex items-center bg-white border-t border-[#E4E4E2]" style={{ minHeight: 68 }}>
      {tabs.map(t => (
        <button
          key={t.id}
          onClick={() => onTab(t.id)}
          className="flex-1 flex flex-col items-center gap-0.5 pt-2.5 pb-2 transition-all"
        >
          <span className={activeTab === t.id ? "text-[#0B2A60]" : "text-[#C7C7CC]"}>{t.icon}</span>
          <span className={`text-[10px] font-medium ${activeTab === t.id ? "text-[#0B2A60]" : "text-[#C7C7CC]"}`}>{t.label}</span>
          {activeTab === t.id && <span className="w-4 h-0.5 bg-[#FF8310] rounded-full" />}
        </button>
      ))}
    </div>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────

export default function App() {
  {/* MARKER-MAKE-KIT-INVOKED */}
  const [screen, setScreen] = useState<Screen>("login");
  const [navData, setNavData] = useState<any>(null);
  const [audits, setAudits] = useState<Audit[]>([
    {
      id: "demo-1",
      company: "ADM Agro Brasil Ltda.",
      sector: "Agronegócio",
      contact: "João Carlos Silva",
      startDate: "2025-02-10",
      status: "in_progress",
      simplifiedAnswers: { 1: true, 2: true, 3: false, 4: true, 5: null, 10: true, 11: true, 21: false },
      fullAnswers: {},
      notes: "",
      goodPractices: "",
      improvements: "",
    },
  ]);
  const [bottomTab, setBottomTab] = useState("home");
  const [activeAudit, setActiveAudit] = useState<Audit | null>(null);

  const currentAudit = navData?.audit ?? activeAudit;

  const navigate = useCallback((s: Screen, data?: any) => {
    setScreen(s);
    setNavData(data ?? null);
    if (data?.audit) setActiveAudit(data.audit);
    if (data && !data.audit && (data.company || data.id)) setActiveAudit(data);
  }, []);

  const handleAnswer = useCallback((qId: number, val: boolean | null) => {
    setAudits(prev => prev.map(a => {
      if (a.id !== currentAudit?.id) return a;
      const updated = { ...a, simplifiedAnswers: { ...a.simplifiedAnswers, [qId]: val } };
      setActiveAudit(updated);
      return updated;
    }));
  }, [currentAudit]);

  const createAudit = useCallback((data: Partial<Audit>) => {
    const newAudit: Audit = {
      id: `audit-${Date.now()}`,
      company: data.company ?? "",
      sector: data.sector ?? "",
      contact: data.contact ?? "",
      startDate: data.startDate ?? new Date().toISOString().slice(0, 10),
      status: "in_progress",
      simplifiedAnswers: {},
      fullAnswers: {},
      notes: "",
      goodPractices: "",
      improvements: "",
    };
    setAudits(prev => [newAudit, ...prev]);
    setActiveAudit(newAudit);
    navigate("audit-overview", newAudit);
  }, [navigate]);

  const TAB_SCREENS = ["dashboard", "audits-list", "companies", "reports-hub"];
  const showBottomNav = TAB_SCREENS.includes(screen);

  const handleTabChange = (t: string) => {
    setBottomTab(t);
    const map: Record<string, Screen> = {
      home: "dashboard",
      audits: "audits-list",
      companies: "companies",
      reports: "reports-hub",
    };
    setScreen(map[t] ?? "dashboard");
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#111111]">
      <div
        className="relative flex flex-col overflow-hidden bg-[#F5F5F4]"
        style={{
          width: 390,
          height: 844,
          borderRadius: 44,
          boxShadow: "0 32px 64px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.06)",
        }}
      >
        {/* Status bar */}
        <div className="absolute top-0 left-0 right-0 z-50 flex items-center justify-between px-8 pt-3 pb-1">
          <span className="text-xs font-semibold text-white/70">9:41</span>
          <div className="w-24 h-5 bg-black rounded-full" />
          <span className="text-[10px] font-semibold text-white/70">●●●</span>
        </div>

        <div className="flex flex-col flex-1 overflow-hidden">
          {screen === "login" && (
            <LoginScreen onLogin={() => { setScreen("dashboard"); setBottomTab("home"); }} />
          )}
          {screen === "dashboard" && (
            <DashboardScreen
              onNav={(s, d) => { navigate(s, d); }}
              audits={audits}
              onNewAudit={() => navigate("new-audit")}
            />
          )}
          {screen === "audits-list" && (
            <AuditsListScreen audits={audits} onNav={navigate} onNewAudit={() => navigate("new-audit")} />
          )}
          {screen === "companies" && (
            <CompaniesScreen onNav={navigate} />
          )}
          {screen === "reports-hub" && (
            <ReportsScreen audits={audits} onNav={navigate} />
          )}
          {screen === "new-audit" && (
            <NewAuditScreen
              onBack={() => { setScreen("dashboard"); setBottomTab("home"); }}
              onCreate={createAudit}
            />
          )}
          {screen === "audit-overview" && currentAudit && (
            <AuditOverviewScreen
              audit={currentAudit}
              onNav={navigate}
              onBack={() => { setScreen("audits-list"); setBottomTab("audits"); }}
            />
          )}
          {screen === "simplified" && currentAudit && (
            <SimplifiedChecklistScreen
              audit={currentAudit}
              onBack={() => navigate("audit-overview", currentAudit)}
              onAnswer={handleAnswer}
            />
          )}
          {screen === "pilar-audit" && currentAudit && (
            <PilarAuditScreen
              pilarId={navData?.pilarId ?? 1}
              audit={currentAudit}
              onBack={() => navigate("audit-overview", currentAudit)}
            />
          )}
          {screen === "radar" && currentAudit && (
            <RadarScreen audit={currentAudit} onBack={() => navigate("audit-overview", currentAudit)} />
          )}
          {screen === "report" && currentAudit && (
            <ReportScreen audit={currentAudit} onBack={() => navigate("audit-overview", currentAudit)} />
          )}
        </div>

        {showBottomNav && (
          <BottomNav activeTab={bottomTab} onTab={handleTabChange} />
        )}
      </div>
    </div>
  );
}
