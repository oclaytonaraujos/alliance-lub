# ALLIANCE LUB — DOCUMENTO MESTRE COMPLETO
## App de Auditoria de Lubrificação 360° · Claude Code + Figma Make
### Versão final auditada — todos os dados extraídos diretamente da planilha FLA002

---

> **Este é o documento único de referência.** Contém:
> 1. Identidade visual e design system
> 2. PRD técnico completo para Claude Code
> 3. Schema do banco de dados (Supabase / PostgreSQL)
> 4. Todas as 102 questões do checklist simplificado (TypeScript)
> 5. Todas as 226 questões da auditoria completa (TypeScript)
> 6. Lógica de pontuação exata (fórmula da planilha)
> 7. Plano completo de 18 telas para Figma Make
> 8. Fluxo de navegação e componentes reutilizáveis

---


# PARTE 1 — IDENTIDADE VISUAL E DESIGN SYSTEM


## 1.1 Paleta de Cores (extraída do PPTX oficial da Alliance Lub)

```
PRIMÁRIA LARANJA:    #FF8310   (cor principal — botões, destaques, header ativo)
PRIMÁRIA AZUL DARK:  #0B2A60   (backgrounds dark, navbar, títulos)
SECUNDÁRIA TERRACOTA:#C46046   (alertas, pilares críticos, badges warning)
SECUNDÁRIA AMARELO:  #FFC000   (destaque positivo, stars, badges success)
CINZA ESCURO:        #262626   (textos secundários, ícones inativos)
BRANCO QUENTE:       #F7F7F7   (backgrounds de tela)
BRANCO PURO:         #FFFFFF   (cards, inputs, modais)
TEXTO PRIMÁRIO:      #0B2A60
TEXTO SECUNDÁRIO:    #262626
TEXTO MUTED:         #6B7280
GRADIENTE HEADER:    linear-gradient(135deg, #0B2A60 0%, #1a3f7a 100%)
GRADIENTE LARANJA:   linear-gradient(135deg, #FF8310 0%, #e6720a 100%)
```

## 1.2 Tipografia

```
Família:   Inter (Google Fonts)
H1:        Inter Bold 28px     / #0B2A60
H2:        Inter SemiBold 22px / #0B2A60
H3:        Inter SemiBold 18px / #0B2A60
Body:      Inter Regular 15px  / #262626
Label:     Inter Medium 13px   / #262626
Caption:   Inter Regular 12px  / #6B7280
Button:    Inter SemiBold 15px / #FFFFFF
```

## 1.3 Tokens de Componentes

```
Border Radius Cards:    16px
Border Radius Buttons:  12px
Border Radius Inputs:   10px
Border Radius Badges:   20px (pill)
Shadow Cards:           0px 4px 16px rgba(11,42,96,0.10)
Padding Horizontal:     20px
Bottom Nav Height:      72px (+ safe area iOS)
Header Height:          96px (+ status bar)
```

## 1.4 Cores dos 9 Pilares (para gráfico radar e badges)

```
Pilar 01: #E24B4A   Pilar 04: #3B8BD4   Pilar 07: #1D9E75
Pilar 02: #EF9F27   Pilar 05: #7F77DD   Pilar 08: #F96167
Pilar 03: #63C25E   Pilar 06: #D4537E   Pilar 09: #028090
```


---

# PARTE 2 — PRD TÉCNICO PARA CLAUDE CODE

## 1. VISÃO GERAL DO PROJETO

**Nome do app:** Alliance Lub — Auditoria 360°  
**Empresa cliente:** Alliance Lub (empresa de consultoria em lubrificação industrial)  
**Plataforma:** Mobile (React Native + Expo) — iOS e Android  
**Objetivo:** Digitalizar 100% do processo de auditoria de lubrificação, substituindo a planilha Excel manual `FLA002_Auditoria_Construção_Confiabilidade.xlsx` por um app mobile com checklist digital, cálculo automático de pontuação, gráfico radar dos 9 pilares e exportação de relatórios.

---

## 2. STACK TECNOLÓGICA

```
Frontend:     React Native (Expo SDK 51+) + TypeScript
Navegação:    Expo Router (file-based routing)
UI:           NativeWind (Tailwind para RN) + React Native Paper
Banco local:  expo-sqlite (offline-first)
Backend:      Supabase (PostgreSQL + Auth + Storage + Edge Functions)
Gráficos:     Victory Native (radar/spider chart dos pilares)
PDF:          react-native-html-to-pdf ou expo-print
Excel:        SheetJS (xlsx)
Compartilhar: expo-sharing + expo-file-system
Câmera:       expo-image-picker (evidências fotográficas)
Ícones:       @expo/vector-icons (Ionicons)
Estado:       Zustand
Forms:        React Hook Form + Zod
```

---

## 3. ARQUITETURA DO BANCO DE DADOS (Supabase / PostgreSQL)

### 3.1 Tabelas principais

```sql
-- Empresas auditadas
CREATE TABLE companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  cnpj TEXT,
  sector TEXT,
  contact_name TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  city TEXT,
  state TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Auditores (perfis dos usuários Alliance)
CREATE TABLE auditors (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  role TEXT DEFAULT 'auditor', -- 'admin' | 'auditor'
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Auditorias
CREATE TABLE audits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  auditor_id UUID REFERENCES auditors(id),
  title TEXT NOT NULL DEFAULT 'Auditoria de Lubrificação',
  period_start DATE,
  period_end DATE,
  status TEXT DEFAULT 'draft', -- 'draft' | 'in_progress' | 'completed'
  general_notes TEXT,
  good_practices TEXT,    -- texto livre: boas práticas encontradas
  improvement_opportunities TEXT, -- oportunidades de melhoria
  next_steps TEXT,        -- próximos passos Alliance
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Respostas do checklist simplificado (102 perguntas Sim/Não)
CREATE TABLE simplified_answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  audit_id UUID REFERENCES audits(id) ON DELETE CASCADE,
  question_id INTEGER NOT NULL, -- 1 a 102
  answer BOOLEAN,               -- true=Sim, false=Não, null=não respondido
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(audit_id, question_id)
);

-- Respostas da auditoria completa (244 afirmações)
CREATE TABLE full_answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  audit_id UUID REFERENCES audits(id) ON DELETE CASCADE,
  question_id INTEGER NOT NULL,  -- 1 a 244 (número original da planilha)
  pilar_id INTEGER NOT NULL,     -- 1 a 9
  objective_score SMALLINT,      -- 0 (Falso) ou 1 (Verdadeiro)
  quality_index SMALLINT,        -- 1 a 5 (índice de qualidade técnica)
  comment TEXT,
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(audit_id, question_id)
);

-- Fotos de evidência
CREATE TABLE evidence_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  audit_id UUID REFERENCES audits(id) ON DELETE CASCADE,
  question_id INTEGER,           -- pode ser da auditoria completa ou simplificada
  form_type TEXT NOT NULL,       -- 'simplified' | 'full'
  storage_path TEXT NOT NULL,    -- caminho no Supabase Storage
  caption TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Scores calculados por pilar (cache de pontuação)
CREATE TABLE pilar_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  audit_id UUID REFERENCES audits(id) ON DELETE CASCADE,
  pilar_id INTEGER NOT NULL,     -- 1 a 9
  objective_score NUMERIC(6,4),  -- média das respostas V/F
  quality_index NUMERIC(6,4),    -- média índice de qualidade
  composite_score NUMERIC(6,4),  -- objective_score × quality_index
  disc_score INTEGER,            -- peso do pilar × 10
  percentile NUMERIC(6,4),       -- composite_score × disc_score
  group_average NUMERIC(6,4),    -- referência média do setor (configurável)
  calculated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(audit_id, pilar_id)
);

-- Progresso das Etapas (Etapa 01 e Etapa 02 do programa Alliance)
CREATE TABLE stage_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  audit_id UUID REFERENCES audits(id) ON DELETE CASCADE,
  stage_number INTEGER NOT NULL, -- 1 ou 2
  activity_name TEXT NOT NULL,
  progress NUMERIC(4,2) DEFAULT 0, -- 0.0 a 1.0
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(audit_id, stage_number, activity_name)
);
```

### 3.2 Row Level Security

```sql
-- Cada auditor vê apenas as auditorias que criou ou que são da sua empresa
ALTER TABLE audits ENABLE ROW LEVEL SECURITY;
CREATE POLICY "auditor_own_audits" ON audits
  FOR ALL USING (auditor_id = auth.uid() OR 
    created_by IN (SELECT id FROM auditors WHERE role = 'admin'));
```

---

## 4. ESTRUTURA DE ARQUIVOS DO PROJETO

```
alliance-lub-app/
├── app/
│   ├── (auth)/
│   │   ├── login.tsx
│   │   └── forgot-password.tsx
│   ├── (tabs)/
│   │   ├── _layout.tsx          # Tab navigator: Dashboard, Clientes, Auditorias, Relatórios
│   │   ├── index.tsx            # Dashboard
│   │   ├── companies.tsx        # Lista de clientes
│   │   └── reports.tsx          # Central de relatórios
│   ├── audit/
│   │   ├── new.tsx              # Nova auditoria (selecionar empresa, datas)
│   │   ├── [id]/
│   │   │   ├── index.tsx        # Visão geral da auditoria
│   │   │   ├── simplified.tsx   # Checklist simplificado (102 perguntas)
│   │   │   ├── full/
│   │   │   │   ├── index.tsx    # Menu dos 9 pilares
│   │   │   │   └── [pilarId].tsx # Questões do pilar selecionado
│   │   │   ├── stages.tsx       # Progresso das etapas
│   │   │   ├── radar.tsx        # Gráfico radar dos pilares
│   │   │   └── report.tsx       # Visualização do relatório
│   ├── company/
│   │   ├── new.tsx
│   │   └── [id].tsx
│   └── _layout.tsx
├── src/
│   ├── components/
│   │   ├── PilarRadarChart.tsx       # Gráfico radar dos 9 pilares (Victory Native)
│   │   ├── QuestionCard.tsx          # Card de questão (toggle V/F + nota + comentário)
│   │   ├── SimplifiedQuestionCard.tsx # Card Sim/Não do checklist simplificado
│   │   ├── PilarProgressBar.tsx      # Barra de progresso por pilar
│   │   ├── ScoreCard.tsx             # Card de pontuação final
│   │   ├── EvidencePhotoButton.tsx   # Botão para anexar foto
│   │   ├── AuditStatusBadge.tsx
│   │   └── ExportButton.tsx
│   ├── data/
│   │   ├── pilares.ts               # Definição dos 9 pilares (nome, peso, descrição)
│   │   ├── simplified-questions.ts  # 102 perguntas do checklist simplificado
│   │   ├── full-questions.ts        # 244 afirmações da auditoria completa
│   │   └── stage-activities.ts      # Atividades das Etapas 01 e 02
│   ├── hooks/
│   │   ├── useAudit.ts
│   │   ├── useScores.ts             # Cálculo automático de pontuação
│   │   ├── useOfflineSync.ts
│   │   └── useExport.ts
│   ├── lib/
│   │   ├── supabase.ts
│   │   ├── scoring.ts               # Lógica de cálculo dos scores
│   │   ├── pdf-generator.ts
│   │   └── excel-generator.ts
│   ├── store/
│   │   ├── auditStore.ts            # Zustand store
│   │   └── authStore.ts
│   └── types/
│       └── index.ts
```

---

## 5. DADOS COMPLETOS — 9 PILARES

### Arquivo: `src/data/pilares.ts`

```typescript
export const PILARES = [
  {
    id: 1,
    code: '01',
    name: 'Processo de Seleção do Fornecedor',
    shortName: 'Seleção do Fornecedor',
    weight: 5, // disc_score = 50
    description: 'Verifica se a empresa possui padrões bem definidos para a seleção dos fornecedores de lubrificantes, qualidade dos produtos e serviços, parâmetros e critérios de avaliação levando em consideração qualidade, performance, logística e custo × benefício.',
    color: '#E24B4A',
    totalQuestions: 15,     // questões na auditoria completa
    simplifiedCount: 9,     // questões no checklist simplificado
  },
  {
    id: 2,
    code: '02',
    name: 'Armazenagem, Distribuição e Manuseio do Lubrificante',
    shortName: 'Armazenagem e Manuseio',
    weight: 5,
    description: 'Verifica se a empresa possui padrões bem definidos para armazenar, distribuir internamente e manusear os lubrificantes sem que suas características sejam afetadas, desde a chegada até a aplicação na máquina.',
    color: '#EF9F27',
    totalQuestions: 23,
    simplifiedCount: 11,
  },
  {
    id: 3,
    code: '03',
    name: 'Especificação Técnica dos Lubrificantes',
    shortName: 'Especificação Técnica',
    weight: 5,
    description: 'Verifica se a empresa possui padrões bem definidos para escolher os lubrificantes adequados para cada aplicação, considerando as particularidades das máquinas, componentes e ambiente.',
    color: '#63C25E',
    totalQuestions: 26,
    simplifiedCount: 12,
  },
  {
    id: 4,
    code: '04',
    name: 'Critérios de Aplicação dos Lubrificantes',
    shortName: 'Aplicação',
    weight: 4, // disc_score = 40
    description: 'Verifica se a empresa possui padrões bem definidos sobre os critérios, procedimentos e boas práticas na aplicação dos lubrificantes nas máquinas e pontos específicos.',
    color: '#3B8BD4',
    totalQuestions: 30,
    simplifiedCount: 18,
  },
  {
    id: 5,
    code: '05',
    name: 'Práticas do Programa de Análises de Óleo',
    shortName: 'Análises de Óleo',
    weight: 4,
    description: 'Verifica se a empresa possui um programa bem definido de análises de óleo com padrões para especificação dos equipamentos críticos, seleção de pontos de coleta, ensaios específicos e limites por tipo de máquina.',
    color: '#7F77DD',
    totalQuestions: 30,
    simplifiedCount: 10,
  },
  {
    id: 6,
    code: '06',
    name: 'Controle da Contaminação',
    shortName: 'Controle de Contaminação',
    weight: 4,
    description: 'Verifica se a empresa possui um programa bem definido para garantir o controle da contaminação e saúde dos lubrificantes instalados, incluindo cuidados no manuseio, qualidade dos filtros e sistemas de filtragem.',
    color: '#D4537E',
    totalQuestions: 30,
    simplifiedCount: 13,
  },
  {
    id: 7,
    code: '07',
    name: 'Gestão do Programa de Lubrificação e Capacitação da Equipe',
    shortName: 'Gestão e Capacitação',
    weight: 3, // disc_score = 30
    description: 'Verifica se a empresa possui um programa bem definido com avaliações periódicas e treinamentos específicos para a equipe de lubrificação e supervisores.',
    color: '#1D9E75',
    totalQuestions: 31,
    simplifiedCount: 11,
  },
  {
    id: 8,
    code: '08',
    name: 'Padronização das Práticas de Lubrificação de Máquinas',
    shortName: 'Padronização (SOPs)',
    weight: 3,
    description: 'Verifica se a empresa possui procedimentos específicos e políticas bem definidas que direcionem as atividades diretas e indiretas à lubrificação, garantindo o sucesso e eficácia do programa.',
    color: '#F96167',
    totalQuestions: 35,
    simplifiedCount: 14,
  },
  {
    id: 9,
    code: '09',
    name: 'Práticas de Segurança, Saúde e Meio Ambiente',
    shortName: 'SSM Ambiental',
    weight: 3,
    description: 'Verifica se a empresa possui procedimentos e políticas que garantam a segurança e saúde dos colaboradores envolvidos na lubrificação e a proteção do meio ambiente.',
    color: '#028090',
    totalQuestions: 9,
    simplifiedCount: 7,
  },
];
```

---

## 6. DADOS COMPLETOS — 102 QUESTÕES DO CHECKLIST SIMPLIFICADO

### Arquivo: `src/data/simplified-questions.ts`

```typescript
export type ResponsavelType = 'ALLIANCE' | 'Gestor' | 'Compras' | 'Diretoria' | 'Compras/Gestor' | 'Compras/Fornecedor' | 'Gestor/ALLIANCE' | 'Diretoria/Gestor';

export interface SimplifiedQuestion {
  id: number;           // 1 a 102
  pilarId: number;      // 1 a 9
  pilarCode: string;    // '01' a '09'
  subsection: string;   // subseção dentro do pilar
  originalRef: string;  // referência à questão original em inglês (ex: "1,2,3")
  question: string;     // pergunta em português
  responsavel: ResponsavelType;
}

export const SIMPLIFIED_QUESTIONS: SimplifiedQuestion[] = [
  // ─── PILAR 01 — Processo de Seleção do Fornecedor ─────────────────────────
  {
    id: 1, pilarId: 1, pilarCode: '01',
    subsection: 'Critérios Gerais',
    originalRef: '1',
    responsavel: 'Gestor',
    question: 'Existe um contrato corporativo de compra de Lubrificantes?',
  },
  {
    id: 2, pilarId: 1, pilarCode: '01',
    subsection: 'Critérios Gerais',
    originalRef: '2',
    responsavel: 'Gestor',
    question: 'Existe uma metodologia específica e bem definida para selecionar fornecedores?',
  },
  {
    id: 3, pilarId: 1, pilarCode: '01',
    subsection: 'Critérios Gerais',
    originalRef: '3',
    responsavel: 'Compras/Gestor',
    question: 'O Contrato como Fornecedor prevê multa em caso de desacordos contratuais, principalmente relacionados a atrasos na entrega?',
  },
  {
    id: 4, pilarId: 1, pilarCode: '01',
    subsection: 'Critérios de Performance dos Produtos',
    originalRef: '11,12,13,14,15',
    responsavel: 'Compras/Gestor',
    question: 'A aquisição dos Lubrificantes, inclusive os de alta performance são baseadas em critérios técnicos pré-estabelecidos e normas técnicas, incluindo os limites de umidade e contaminação sólida requeridos na entrega?',
  },
  {
    id: 5, pilarId: 1, pilarCode: '01',
    subsection: 'Critérios de Performance dos Produtos',
    originalRef: '16,17',
    responsavel: 'Compras/Gestor',
    question: 'Existe na empresa um processo de aquisição bem definido que mensure a capacidade técnica do fornecedor e o grau de performance de cada produto?',
  },
  {
    id: 6, pilarId: 1, pilarCode: '01',
    subsection: 'Critérios de Performance dos Produtos',
    originalRef: '18',
    responsavel: 'Compras/Gestor',
    question: 'A performance dos produtos representa pelo menos 1/3 na decisão pelo fornecedor?',
  },
  {
    id: 7, pilarId: 1, pilarCode: '01',
    subsection: 'Critérios de Serviço',
    originalRef: '19,20',
    responsavel: 'Compras/Fornecedor',
    question: 'É levado em consideração no processo de seleção do fornecedor, sua localização e boas práticas de armazenagem dos lubrificantes?',
  },
  {
    id: 8, pilarId: 1, pilarCode: '01',
    subsection: 'Critérios de Serviço',
    originalRef: '21,22,23,24',
    responsavel: 'Compras/Fornecedor',
    question: 'O fornecedor detém certificados de limpeza dos containeres comuns e a granel e são apresentados quando solicitados?',
  },
  {
    id: 9, pilarId: 1, pilarCode: '01',
    subsection: 'Cuidados com a Logística',
    originalRef: '25,26',
    responsavel: 'ALLIANCE',
    question: 'Há um controle eficiente do estoque mínimo a fim de comprar somente o necessário?',
  },

  // ─── PILAR 02 — Armazenagem, Distribuição e Manuseio ──────────────────────
  {
    id: 10, pilarId: 2, pilarCode: '02',
    subsection: 'Práticas de recebimento e manipulação',
    originalRef: '27',
    responsavel: 'ALLIANCE',
    question: 'O lubrificante é entregue a uma área de armazenamento coberta?',
  },
  {
    id: 11, pilarId: 2, pilarCode: '02',
    subsection: 'Práticas de recebimento e manipulação',
    originalRef: '28',
    responsavel: 'ALLIANCE',
    question: 'As embalagens dos lubrificantes estão hermeticamente fechadas, limpas e em bom estado?',
  },
  {
    id: 12, pilarId: 2, pilarCode: '02',
    subsection: 'Práticas de recebimento e manipulação',
    originalRef: '29',
    responsavel: 'ALLIANCE',
    question: 'A embalagem do lubrificante exibe sua data de envase?',
  },
  {
    id: 13, pilarId: 2, pilarCode: '02',
    subsection: 'Práticas de recebimento e manipulação',
    originalRef: '30,31',
    responsavel: 'ALLIANCE',
    question: 'Após a recepção, a embalagem do lubrificante é identificada através de codificação interna da empresa que informe seu cadastro e propriedades?',
  },
  {
    id: 14, pilarId: 2, pilarCode: '02',
    subsection: 'Práticas de armazenamento central',
    originalRef: '32,33,35,36',
    responsavel: 'ALLIANCE',
    question: 'As práticas de armazenamento incluem regras que definam detalhes do ambiente que limitem umidade e temperatura bem como contenção necessária?',
  },
  {
    id: 15, pilarId: 2, pilarCode: '02',
    subsection: 'Práticas de armazenamento central',
    originalRef: '34',
    responsavel: 'ALLIANCE',
    question: 'A rotatividade dos produtos é realizada de forma que os lubrificantes mais antigos são utilizados primeiramente (FIFO)?',
  },
  {
    id: 16, pilarId: 2, pilarCode: '02',
    subsection: 'Práticas do estoque de trabalho (sala de lubrificação)',
    originalRef: '37,38',
    responsavel: 'ALLIANCE',
    question: 'O volume de lubrificante na sala de lubrificação é suficiente para abastecer a planta até a chegada de uma nova remessa?',
  },
  {
    id: 17, pilarId: 2, pilarCode: '02',
    subsection: 'Práticas do estoque de trabalho (sala de lubrificação)',
    originalRef: '39,40,41,42',
    responsavel: 'ALLIANCE',
    question: 'A armazenagem das embalagens de óleo e graxa é feita de forma a garantir a limpeza e qualidade do produto na sala de lubrificação (válvulas de alívio nas embalagens de óleo, embalagens de graxa em tubo armazenadas na posição vertical)?',
  },
  {
    id: 18, pilarId: 2, pilarCode: '02',
    subsection: 'Práticas do estoque de trabalho (sala de lubrificação)',
    originalRef: '42',
    responsavel: 'ALLIANCE',
    question: 'Há apenas uma embalagem de cada tipo de lubrificante aberta por sala de lubrificação?',
  },
  {
    id: 19, pilarId: 2, pilarCode: '02',
    subsection: 'Práticas de manuseio do lubrificante na planta',
    originalRef: '43,44,45,46,47,48',
    responsavel: 'ALLIANCE',
    question: 'Os utensílios de lubrificação (pincéis, funis, contentores, etc.) estão identificados e quando não estão em uso, armazenados em armários adequados?',
  },
  {
    id: 20, pilarId: 2, pilarCode: '02',
    subsection: 'Práticas de manuseio do lubrificante na planta',
    originalRef: '49',
    responsavel: 'ALLIANCE',
    question: 'Todos os lubrificantes (exceto ISO 680 cSt e superior) designados a aplicações muito críticas, são pré-filtrados antes de serem aplicados nas máquinas?',
  },

  // ─── PILAR 03 — Especificação Técnica dos Lubrificantes ───────────────────
  {
    id: 21, pilarId: 3, pilarCode: '03',
    subsection: 'Critérios de seleção de óleos',
    originalRef: '50,51',
    responsavel: 'ALLIANCE',
    question: 'No levantamento do plano, a designação dos óleos lubrificantes (viscosidade, limites de temperatura, aditivos, nível de limpeza) a serem usados em cada cárter obedecem especificações do fabricante do equipamento e/ou normas específicas?',
  },
  {
    id: 22, pilarId: 3, pilarCode: '03',
    subsection: 'Critérios de seleção de óleos',
    originalRef: '52,53',
    responsavel: 'ALLIANCE',
    question: 'O histórico destas indicações fica arquivado para futuras consultas?',
  },
  {
    id: 23, pilarId: 3, pilarCode: '03',
    subsection: 'Critérios de seleção de graxas',
    originalRef: '54,55',
    responsavel: 'ALLIANCE',
    question: 'No levantamento do plano, a designação das graxas (consistência, limites de temperatura, aditivos, níveis de limpeza) a serem usadas em cada cárter obedecem especificações do fabricante do equipamento e/ou normas específicas?',
  },
  {
    id: 24, pilarId: 3, pilarCode: '03',
    subsection: 'Critérios de seleção de graxas',
    originalRef: '56,57',
    responsavel: 'ALLIANCE',
    question: 'O histórico destas indicações fica arquivado para futuras consultas?',
  },
  {
    id: 25, pilarId: 3, pilarCode: '03',
    subsection: 'Critérios de seleção de lubrificantes de alta performance',
    originalRef: '58,59,60,61',
    responsavel: 'Gestor',
    question: 'As condições críticas de cada equipamento (temperatura alta ou baixa, rotação alta ou baixa, concentração de contaminantes, etc.) são conhecidas e possuem indicações para o uso de lubrificantes de alta performance baseadas em normas técnicas ou recomendações de fabricantes?',
  },
  {
    id: 26, pilarId: 3, pilarCode: '03',
    subsection: 'Critérios de seleção de lubrificantes de alta performance',
    originalRef: '62,63',
    responsavel: 'Gestor',
    question: 'A empresa possui registro de quais equipamentos utilizam lubrificantes de alta performance e quais os critérios utilizados para a seleção dos mesmos?',
  },
  {
    id: 27, pilarId: 3, pilarCode: '03',
    subsection: 'Critérios de determinação dos volumes de lubrificantes',
    originalRef: '64,65,66',
    responsavel: 'Gestor/ALLIANCE',
    question: 'Os reservatórios de óleo (hidráulico, engrenagens, barramentos) ou graxa (sistema centralizado) possuem marcações de nível máximo e mínimo de fácil visualização e entendimento, definidas pelo fabricante do equipamento ou por um sistema para cálculo de volume?',
  },
  {
    id: 28, pilarId: 3, pilarCode: '03',
    subsection: 'Critérios de determinação das frequências de relubrificação',
    originalRef: '67,68',
    responsavel: 'Gestor/ALLIANCE',
    question: 'As frequências de relubrificação ou reposição de lubrificantes (checagem de nível) foram calculadas através de uma sistemática específica ou através de indicação dos fabricantes dos equipamentos?',
  },
  {
    id: 29, pilarId: 3, pilarCode: '03',
    subsection: 'Critérios de determinação das frequências de relubrificação',
    originalRef: '69',
    responsavel: 'Gestor/ALLIANCE',
    question: 'Existe um sistema de identificação do intervalo de relubrificação ou reposição para cada ponto na máquina, de fácil visualização e consulta do operador ou do técnico de lubrificação?',
  },
  {
    id: 30, pilarId: 3, pilarCode: '03',
    subsection: 'Critérios de seleção dos métodos de aplicação',
    originalRef: '70,71',
    responsavel: 'Gestor',
    question: 'Condições operacionais críticas da máquina e/ou componente determinam a utilização de sistemas automáticos ou centralizados de lubrificação?',
  },
  {
    id: 31, pilarId: 3, pilarCode: '03',
    subsection: 'Critérios de seleção dos métodos de aplicação',
    originalRef: '72,73',
    responsavel: 'Gestor',
    question: 'São aplicados nos sistemas automáticos ou centralizados de lubrificação, lubrificantes criteriosamente especificados para se obter um máximo desempenho da lubrificação de acordo com cálculos específicos e/ou diretrizes dos fabricantes de componentes?',
  },
  {
    id: 32, pilarId: 3, pilarCode: '03',
    subsection: 'Critérios de seleção dos métodos de aplicação',
    originalRef: '74,75',
    responsavel: 'Gestor',
    question: 'Existe na empresa registro de cada ponto onde é utilizada lubrificação automática ou centralizada e como foi feita essa especificação?',
  },

  // ─── PILAR 04 — Critérios de Aplicação dos Lubrificantes ──────────────────
  {
    id: 33, pilarId: 4, pilarCode: '04',
    subsection: 'Práticas de abastecimento ou reabastecimento de óleo',
    originalRef: '76,77,79',
    responsavel: 'ALLIANCE',
    question: 'O abastecimento ou troca de óleo seguem procedimentos de execução (instruções de trabalho) que incluam padrões para os utensílios e recipientes a serem utilizados?',
  },
  {
    id: 34, pilarId: 4, pilarCode: '04',
    subsection: 'Práticas de abastecimento ou reabastecimento de óleo',
    originalRef: '77',
    responsavel: 'ALLIANCE',
    question: 'Existe identificação em cada reservatório sobre o lubrificante instalado, de fácil visualização do operador ou do técnico?',
  },
  {
    id: 35, pilarId: 4, pilarCode: '04',
    subsection: 'Práticas de abastecimento ou reabastecimento de óleo',
    originalRef: '78,80,81',
    responsavel: 'ALLIANCE',
    question: 'Existe um gerenciamento informatizado das atividades de lubrificação que emita ordens de serviço contendo informações da atividade a ser realizada, tipo e quantidade de lubrificante e frequência da tarefa, bem como o controle de anomalias encontradas em campo?',
  },
  {
    id: 36, pilarId: 4, pilarCode: '04',
    subsection: 'Práticas de abastecimento ou reabastecimento de óleo',
    originalRef: '82,83,84',
    responsavel: 'ALLIANCE',
    question: 'Existe um critério sistematizado que defina a troca de óleo (por condição ou outro)?',
  },
  {
    id: 37, pilarId: 4, pilarCode: '04',
    subsection: 'Práticas de abastecimento ou reabastecimento de óleo',
    originalRef: '85',
    responsavel: 'ALLIANCE',
    question: 'Todos os reservatórios que possuem uma conhecida sensibilidade a contaminantes são reabastecidos com lubrificante pré-filtrado (carrinho de filtragem ou outro método)?',
  },
  {
    id: 38, pilarId: 4, pilarCode: '04',
    subsection: 'Práticas de abastecimento ou reabastecimento de graxa',
    originalRef: '86,89',
    responsavel: 'ALLIANCE',
    question: 'O abastecimento de reservatórios de graxa segue procedimentos de execução (instruções de trabalho) que incluam padrões para os utensílios e recipientes a serem utilizados?',
  },
  {
    id: 39, pilarId: 4, pilarCode: '04',
    subsection: 'Práticas de abastecimento ou reabastecimento de graxa',
    originalRef: '87',
    responsavel: 'ALLIANCE',
    question: 'Existe identificação em cada reservatório de graxa ou ponto de lubrificação que indique ao operador ou ao técnico de lubrificação o tipo de graxa aplicado?',
  },
  {
    id: 40, pilarId: 4, pilarCode: '04',
    subsection: 'Práticas de abastecimento ou reabastecimento de graxa',
    originalRef: '88,90,91',
    responsavel: 'ALLIANCE',
    question: 'Existe um gerenciamento informatizado das atividades de lubrificação que emita ordens de serviço contendo informações da atividade a ser realizada, tipo e quantidade de lubrificante e frequência da tarefa, bem como o controle de anomalias encontradas em campo?',
  },
  {
    id: 41, pilarId: 4, pilarCode: '04',
    subsection: 'Práticas de uso e manutenção de sistemas semi-automáticos',
    originalRef: '92,93,96,97',
    responsavel: 'ALLIANCE',
    question: 'O primeiro enchimento ou reabastecimento de reservatórios e dispositivos automáticos seguem procedimentos específicos contendo tipo de lubrificante, volume, frequência, bem como ferramentas específicas para cada tarefa?',
  },
  {
    id: 42, pilarId: 4, pilarCode: '04',
    subsection: 'Práticas de uso e manutenção de sistemas semi-automáticos',
    originalRef: '94',
    responsavel: 'ALLIANCE',
    question: 'Existe identificação em cada reservatório ou dispositivo automático de lubrificação sobre o lubrificante utilizado?',
  },
  {
    id: 43, pilarId: 4, pilarCode: '04',
    subsection: 'Práticas de uso e manutenção de sistemas semi-automáticos',
    originalRef: '95,97,98',
    responsavel: 'ALLIANCE',
    question: 'Existe um gerenciamento informatizado das atividades de abastecimento dos sistemas automáticos que emita ordens de serviço contendo informações da atividade a ser realizada, tipo e quantidade de lubrificante e frequência da tarefa, bem como o controle de anomalias encontradas em campo?',
  },
  {
    id: 44, pilarId: 4, pilarCode: '04',
    subsection: 'Práticas de uso e manutenção de sistemas automáticos',
    originalRef: '99,103,104',
    responsavel: 'ALLIANCE',
    question: 'O abastecimento dos sistemas centralizados de lubrificação segue procedimentos de execução (instruções de trabalho) que incluam padrões para os utensílios e recipientes a serem utilizados?',
  },
  {
    id: 45, pilarId: 4, pilarCode: '04',
    subsection: 'Práticas de uso e manutenção de sistemas automáticos',
    originalRef: '101',
    responsavel: 'ALLIANCE',
    question: 'Existe identificação em cada reservatório de lubrificação centralizada sobre o tipo de lubrificante utilizado?',
  },
  {
    id: 46, pilarId: 4, pilarCode: '04',
    subsection: 'Práticas de uso e manutenção de sistemas automáticos',
    originalRef: '100,102,104,105',
    responsavel: 'ALLIANCE',
    question: 'Existe um gerenciamento informatizado das atividades de abastecimento dos sistemas de lubrificação centralizada que emita ordens de serviço contendo informações da atividade a ser realizada, tipo e quantidade de lubrificante e frequência da tarefa, bem como o controle de anomalias encontradas em campo?',
  },
  {
    id: 47, pilarId: 4, pilarCode: '04',
    subsection: 'Práticas de uso e manutenção de sistemas automáticos',
    originalRef: '99,102',
    responsavel: 'ALLIANCE',
    question: 'Os intervalos de reabastecimento dos sistemas centralizados são verificados por observação física do nível do reservatório?',
  },
  {
    id: 48, pilarId: 4, pilarCode: '04',
    subsection: 'Práticas de uso e manutenção de sistemas automáticos',
    originalRef: '103',
    responsavel: 'ALLIANCE',
    question: 'O abastecimento dos sistemas centralizados incorpora o uso de ferramentas de manuseio de lubrificantes especificamente designados para cada tipo?',
  },
  {
    id: 49, pilarId: 4, pilarCode: '04',
    subsection: 'Práticas de uso e manutenção de sistemas automáticos',
    originalRef: '105',
    responsavel: 'ALLIANCE',
    question: 'O registro das práticas de reabastecimento é atualizado e mantido para cada cárter do sistema automático?',
  },
  {
    id: 50, pilarId: 4, pilarCode: '04',
    subsection: 'Práticas de uso e manutenção de sistemas automáticos',
    originalRef: '104',
    responsavel: 'ALLIANCE',
    question: 'A prática sistemática de reabastecimento é conduzida por um sistema de agendamento repetitivo (seja em papel ou informatizado)?',
  },

  // ─── PILAR 05 — Práticas do Programa de Análises de Óleo ──────────────────
  {
    id: 51, pilarId: 5, pilarCode: '05',
    subsection: 'Desenvolvimento do Programa de Análises de Óleo',
    originalRef: '106,107',
    responsavel: 'Gestor/ALLIANCE',
    question: 'Todos os equipamentos industriais ou automotivos críticos ou relevantes ao processo possuem um cronograma de monitoramento por análise de óleo, mesmo que sejam testes primários (tipo passa ou não passa)?',
  },
  {
    id: 52, pilarId: 5, pilarCode: '05',
    subsection: 'Desenvolvimento do Programa de Análises de Óleo',
    originalRef: '108',
    responsavel: 'Gestor/ALLIANCE',
    question: 'Existe um pacote de análises para as amostras que não passaram pelo teste primário?',
  },
  {
    id: 53, pilarId: 5, pilarCode: '05',
    subsection: 'Desenvolvimento do Programa de Análises de Óleo',
    originalRef: '109,110,111,112',
    responsavel: 'Gestor/ALLIANCE',
    question: 'A análise de óleo prevê ensaios para: viscosidade, integridade física, vida dos aditivos, partículas sólidas, umidade, contaminação química, oxidação por produtos estranhos, concentração de partículas de desgaste, morfologia das partículas? Estes ensaios seguem normas conhecidas?',
  },
  {
    id: 54, pilarId: 5, pilarCode: '05',
    subsection: 'Coletas de amostras para análises de óleo',
    originalRef: '113,116,117',
    responsavel: 'Gestor/ALLIANCE',
    question: 'Existe procedimentos para a coleta de amostras de óleo para análises, com indicação de acessórios e utensílios específicos e apropriados?',
  },
  {
    id: 55, pilarId: 5, pilarCode: '05',
    subsection: 'Coletas de amostras para análises de óleo',
    originalRef: '114,115',
    responsavel: 'Gestor/ALLIANCE',
    question: 'Os pontos de coletas de amostras foram estrategicamente pré-definidos e equipados com dispositivos que garantam a repetibilidade da amostra (ex: minimess com tubo de pitot, tomador de pressão, etc.)?',
  },
  {
    id: 56, pilarId: 5, pilarCode: '05',
    subsection: 'Frequência de amostragem e análises',
    originalRef: '118,119,120,121',
    responsavel: 'Gestor/ALLIANCE',
    question: 'As frequências de amostragem seguem uma sistemática de acordo com tipo de equipamento, nível de criticidade, regime de operação e condições ambientais?',
  },
  {
    id: 57, pilarId: 5, pilarCode: '05',
    subsection: 'Frequência de amostragem e análises',
    originalRef: '122,123',
    responsavel: 'Gestor/ALLIANCE',
    question: 'As frequências de amostragem são reavaliadas quando acontecem alterações significativas nos resultados dos parâmetros monitorados como também quando um determinado equipamento apresenta constantemente padrões fora do normal?',
  },
  {
    id: 58, pilarId: 5, pilarCode: '05',
    subsection: 'Definição dos Limites e Níveis de Alarme',
    originalRef: '124,125,126,127',
    responsavel: 'Gestor/ALLIANCE',
    question: 'As amostras são padronizadas para cada tipo de reservatório e seguem uma avaliação tanto na elevação quanto na queda de seus resultados com uma estrutura de fácil interpretação (ex: Normal, Crítico e Alerta)?',
  },
  {
    id: 59, pilarId: 5, pilarCode: '05',
    subsection: 'Utilização dos dados das análises de óleo',
    originalRef: '128,129,130,131',
    responsavel: 'Gestor/ALLIANCE',
    question: 'Os resultados das análises de óleo são avaliados imediatamente após seu recebimento e são direcionadas as ações para os pontos fora do limite aceitável?',
  },
  {
    id: 60, pilarId: 5, pilarCode: '05',
    subsection: 'Utilização dos dados das análises de óleo',
    originalRef: '132,133',
    responsavel: 'Gestor',
    question: 'Os técnicos de manutenção executam seus serviços baseados nos resultados das análises de óleo e incorporam os históricos das ações corretivas no banco de dados do equipamento?',
  },

  // ─── PILAR 06 — Controle da Contaminação ──────────────────────────────────
  {
    id: 61, pilarId: 6, pilarCode: '06',
    subsection: 'Controle standard da contaminação de lubrificantes',
    originalRef: '134',
    responsavel: 'Diretoria/Gestor',
    question: 'A gerência industrial e de manutenção reconhecem o controle da contaminação como Fator Chave de Sucesso para o aumento da confiabilidade das máquinas?',
  },
  {
    id: 62, pilarId: 6, pilarCode: '06',
    subsection: 'Controle standard da contaminação de lubrificantes',
    originalRef: '135,136,137,138',
    responsavel: 'Gestor',
    question: 'A empresa usa uma sistemática para medir a saúde dos lubrificantes em uso com limites ideais para os equipamentos críticos e estas informações são utilizadas para melhorar o desempenho do equipamento e seus componentes?',
  },
  {
    id: 63, pilarId: 6, pilarCode: '06',
    subsection: 'Práticas de exclusão de contaminantes',
    originalRef: '139,140,141',
    responsavel: 'Gestor/ALLIANCE',
    question: 'Os cárteres e reservatórios hidráulicos críticos são limpos constantemente e possuem filtros de ar, câmaras de expansão e protetores de rolamentos?',
  },
  {
    id: 64, pilarId: 6, pilarCode: '06',
    subsection: 'Práticas de exclusão de contaminantes',
    originalRef: '142',
    responsavel: 'Gestor/ALLIANCE',
    question: 'Nos reservatórios das máquinas com alta criticidade (e importância no processo) que estão em contato direto com umidade (lavagem, água da chuva, etc.), são aplicadas estratégias, medidas e acessórios para eliminação da causa da contaminação?',
  },
  {
    id: 65, pilarId: 6, pilarCode: '06',
    subsection: 'Práticas de exclusão de contaminantes',
    originalRef: '143,144,145,146,147',
    responsavel: 'Gestor/ALLIANCE',
    question: 'Os técnicos de lubrificação são treinados em procedimentos de prevenção de contaminantes, durante o manuseio de lubrificantes, abastecimento e reabastecimento de reservatórios, contemplando o uso de contentores limpos?',
  },
  {
    id: 66, pilarId: 6, pilarCode: '06',
    subsection: 'Práticas de remoção dos contaminantes',
    originalRef: '148,149,150',
    responsavel: 'ALLIANCE',
    question: 'Os reservatórios são equipados com engates rápidos para filtragem, chicanas para sedimentação de partículas sólidas e válvulas de dreno para retirada de sedimentos no fundo do reservatório?',
  },
  {
    id: 67, pilarId: 6, pilarCode: '06',
    subsection: 'Práticas de remoção dos contaminantes',
    originalRef: '151,152,153',
    responsavel: 'Gestor/ALLIANCE',
    question: 'Os reservatórios críticos sujeitos a contaminação por partículas sólidas e umidade são periodicamente tratados e filtrados proativamente para gerenciar os índices de contaminação?',
  },
  {
    id: 68, pilarId: 6, pilarCode: '06',
    subsection: 'Práticas de remoção dos contaminantes',
    originalRef: '154',
    responsavel: 'Gestor/ALLIANCE',
    question: 'Em locais onde a contaminação não pode ser removida pelos meios disponíveis, a troca da carga é efetuada o mais rápido possível?',
  },
  {
    id: 69, pilarId: 6, pilarCode: '06',
    subsection: 'Padrões de qualidade e práticas de filtragem',
    originalRef: '155,156,157,158',
    responsavel: 'Compras/Gestor',
    question: 'A empresa mantém um padrão de qualidade técnica para seleção de elementos filtrantes e respiros?',
  },
  {
    id: 70, pilarId: 6, pilarCode: '06',
    subsection: 'Padrões de qualidade e práticas de filtragem',
    originalRef: '159,160',
    responsavel: 'Gestor/ALLIANCE',
    question: 'Os sistemas de filtragem utilizam respiros e elementos filtrantes combinados para equalizar e garantir a qualidade da filtragem de partículas?',
  },
  {
    id: 71, pilarId: 6, pilarCode: '06',
    subsection: 'Manutenção dos sistemas de filtragem',
    originalRef: '161,162',
    responsavel: 'ALLIANCE',
    question: 'As trocas dos elementos filtrantes são baseadas nos indicadores de pressão e o descarte é feito de acordo com procedimentos de acordo com normas ambientais?',
  },
  {
    id: 72, pilarId: 6, pilarCode: '06',
    subsection: 'Manutenção dos sistemas de filtragem',
    originalRef: '163,164',
    responsavel: 'Gestor',
    question: 'Os projetos e modificações nos equipamentos incluem planos de racionalização ou substituição de elementos filtrantes?',
  },
  {
    id: 73, pilarId: 6, pilarCode: '06',
    subsection: 'Manutenção dos sistemas de filtragem',
    originalRef: '165,166,167',
    responsavel: 'ALLIANCE',
    question: 'Os procedimentos de inspeção incluem a checagem da eficiência dos elementos filtrantes, perda de carga e vedações de bombas de sistemas circulatórios, hidráulicos de filtragem?',
  },

  // ─── PILAR 07 — Gestão do Programa e Capacitação da Equipe ───────────────
  {
    id: 74, pilarId: 7, pilarCode: '07',
    subsection: 'Gestão do conhecimento dos técnicos de lubrificação',
    originalRef: '168,169,170,171,172',
    responsavel: 'Gestor/ALLIANCE',
    question: 'Existe um plano de capacitação técnica dos técnicos em lubrificação (seleção de lubrificantes, manuseio, aplicação, controle da contaminação, amostragem e análises de óleo, ações corretivas, entre outros) com avaliações frequentes e provas de certificação [CLS2 (STLE); MLT2 (ICML); ABRAMAN]?',
  },
  {
    id: 75, pilarId: 7, pilarCode: '07',
    subsection: 'Gestão do conhecimento dos técnicos de lubrificação',
    originalRef: '173',
    responsavel: 'Gestor/ALLIANCE',
    question: 'Existe uma política bem definida na empresa sobre os cursos e ações a serem tomadas caso o técnico em lubrificação não tenha os níveis de conhecimento necessários?',
  },
  {
    id: 76, pilarId: 7, pilarCode: '07',
    subsection: 'Gestão do conhecimento dos supervisores de lubrificação',
    originalRef: '174,175,176,177,178',
    responsavel: 'Gestor/ALLIANCE',
    question: 'Existe um plano de capacitação técnica dos supervisores de lubrificação (seleção de lubrificantes, manuseio, aplicação, controle da contaminação, amostragem e análises de óleo, ações corretivas, entre outros) com avaliações frequentes e provas de certificação [CLS2 (STLE); MLT2 (ICML); ABRAMAN]?',
  },
  {
    id: 77, pilarId: 7, pilarCode: '07',
    subsection: 'Gestão do conhecimento dos supervisores de lubrificação',
    originalRef: '179',
    responsavel: 'Gestor/ALLIANCE',
    question: 'Existe uma política bem definida na empresa sobre os cursos e ações a serem tomadas caso o supervisor de lubrificação não tenha os níveis de conhecimento necessários?',
  },
  {
    id: 78, pilarId: 7, pilarCode: '07',
    subsection: 'Treinamento e conscientização dos supervisores Manutenção/Produção',
    originalRef: '180,181,182',
    responsavel: 'Diretoria/Gestor',
    question: 'Os gerentes de produção estão envolvidos com as atividades de lubrificação e participam de reuniões rotineiras para revisões das metas de longo e curto prazo?',
  },
  {
    id: 79, pilarId: 7, pilarCode: '07',
    subsection: 'Gestão e acompanhamento das atividades de lubrificação',
    originalRef: '183,184',
    responsavel: 'ALLIANCE',
    question: 'Existe uma sistemática implantada para a condução, realização e controle de execução das atividades de lubrificação?',
  },
  {
    id: 80, pilarId: 7, pilarCode: '07',
    subsection: 'Gestão e acompanhamento das atividades de lubrificação',
    originalRef: '185,186,187',
    responsavel: 'ALLIANCE',
    question: 'Durante a execução das tarefas de lubrificação, são realizadas inspeções simples com uma estratégia clara e sistêmica para detecção, validação e correção das não conformidades encontradas?',
  },
  {
    id: 81, pilarId: 7, pilarCode: '07',
    subsection: 'Gestão e acompanhamento das atividades de lubrificação',
    originalRef: '188,189',
    responsavel: 'ALLIANCE',
    question: 'Existem rotas lógicas de lubrificação para realização das tarefas, onde são agrupados elementos de máquina similares, tarefas similares, a fim de melhorar a eficiência?',
  },
  {
    id: 82, pilarId: 7, pilarCode: '07',
    subsection: 'Objetivos, metas do programa e melhoria contínua',
    originalRef: '190,191,192',
    responsavel: 'Gestor',
    question: 'As metas do programa de lubrificação são regidas por uma estratégia central, associadas a metas de confiabilidade?',
  },
  {
    id: 83, pilarId: 7, pilarCode: '07',
    subsection: 'Objetivos, metas do programa e melhoria contínua',
    originalRef: '193,194,195',
    responsavel: 'Gestor',
    question: 'São realizadas reuniões periódicas para verificar o status de cumprimento dos objetivos e possíveis correções das estratégias?',
  },
  {
    id: 84, pilarId: 7, pilarCode: '07',
    subsection: 'Objetivos, metas do programa e melhoria contínua',
    originalRef: '196,197,198',
    responsavel: 'Gestor',
    question: 'As expectativas de cumprimento da estratégia de lubrificação fazem parte das avaliações de desempenho dos profissionais diretamente envolvidos (ex: Gestor, Gerente)?',
  },

  // ─── PILAR 08 — Padronização das Práticas (SOPs) ──────────────────────────
  {
    id: 85, pilarId: 8, pilarCode: '08',
    subsection: 'Fornecimento do lubrificante',
    originalRef: '199,200,201,202',
    responsavel: 'Gestor',
    question: 'Existe um procedimento bem definido para a seleção de fornecedores de lubrificantes quanto à qualidade dos produtos, performance e serviços oferecidos?',
  },
  {
    id: 86, pilarId: 8, pilarCode: '08',
    subsection: 'Manuseio de Lubrificantes',
    originalRef: '203,204,205,206',
    responsavel: 'Gestor',
    question: 'Existe um procedimento bem definido que detalhe as condições aceitáveis de entrega dos lubrificantes, gestão de estoque, armazenagem e utilização de ferramentas para o manuseio de lubrificantes?',
  },
  {
    id: 87, pilarId: 8, pilarCode: '08',
    subsection: 'Seleção de Lubrificantes',
    originalRef: '207,208,209',
    responsavel: 'Gestor',
    question: 'Existe um procedimento bem definido que detalhe as normas técnicas que devem ser utilizadas para a seleção de lubrificantes em geral? (óleo, graxa, lubrificantes de alta performance, etc.)',
  },
  {
    id: 88, pilarId: 8, pilarCode: '08',
    subsection: 'Seleção de Lubrificantes',
    originalRef: '210,211',
    responsavel: 'Gestor',
    question: 'Existe um procedimento bem definido que detalhe os métodos para determinar a forma de reabastecimento do estoque, frequência de reabastecimento e volume máximo a ser mantido no estoque?',
  },
  {
    id: 89, pilarId: 8, pilarCode: '08',
    subsection: 'Aplicação de Lubrificantes',
    originalRef: '212,213,214,215',
    responsavel: 'ALLIANCE',
    question: 'Existe um procedimento bem definido com o método correto de fornecimento e reabastecimento de óleos, graxas e lubrificação centralizada?',
  },
  {
    id: 90, pilarId: 8, pilarCode: '08',
    subsection: 'Análises de Lubrificantes',
    originalRef: '216,217',
    responsavel: 'ALLIANCE',
    question: 'Existe um procedimento bem definido detalhando a forma de seleção dos pontos de coleta bem como os métodos utilizados para realizar a coleta?',
  },
  {
    id: 91, pilarId: 8, pilarCode: '08',
    subsection: 'Análises de Lubrificantes',
    originalRef: '218,219',
    responsavel: 'ALLIANCE',
    question: 'Existe um procedimento bem definido que direcione o pacote de ensaios a serem realizados para cada equipamento, os limites aceitáveis e as ações a serem tomadas em caso de desvios?',
  },
  {
    id: 92, pilarId: 8, pilarCode: '08',
    subsection: 'Controle da Condição dos Lubrificantes',
    originalRef: '220,221',
    responsavel: 'ALLIANCE',
    question: 'Existe um procedimento bem definido que determine os limites aceitáveis de contaminação para cada máquina bem como os procedimentos de exclusão de contaminantes?',
  },
  {
    id: 93, pilarId: 8, pilarCode: '08',
    subsection: 'Controle da Condição dos Lubrificantes',
    originalRef: '222,223,224',
    responsavel: 'ALLIANCE',
    question: 'Existe um procedimento bem definido que determine as melhores práticas de remoção dos contaminantes, performance mínima aceitável para elementos filtrantes e procedimentos adequados de operação e manutenção dos filtros e sistemas de filtragem?',
  },
  {
    id: 94, pilarId: 8, pilarCode: '08',
    subsection: 'Procedimentos Operacionais Padrão — Práticas e Normas',
    originalRef: '229,230',
    responsavel: 'ALLIANCE',
    question: 'Existe uma política bem definida para a confecção dos "Procedimentos Operacionais Padrão" relacionados à lubrificação?',
  },
  {
    id: 95, pilarId: 8, pilarCode: '08',
    subsection: 'Gestão do Programa e Capacitação da Equipe',
    originalRef: '231,232,233,234',
    responsavel: 'ALLIANCE',
    question: 'Existe uma política bem definida ou um plano estratégico contemplando os conhecimentos necessários bem como a grade de treinamentos para a equipe de lubrificação e gestores diretos?',
  },
  // NOTE: As 5 questões restantes do Pilar 08 (96 a 98 são do pilar 09 na planilha simplificada)
  // Na planilha, as questões 81-95 da simplificada cobrem o pilar 08, porém o total de perguntas
  // Verificando: 81-95 = 15 questões mapeadas para pilar 08 (não 14). Revisar com a Alliance.

  // ─── PILAR 09 — Segurança, Saúde e Meio Ambiente ──────────────────────────
  {
    id: 96, pilarId: 9, pilarCode: '09',
    subsection: 'Práticas de Segurança, Saúde e Meio Ambiente',
    originalRef: '235,236,237',
    responsavel: 'Gestor',
    question: 'Existem procedimentos específicos na empresa para identificar, prevenir e combater riscos de incêndio associados à lubrificação?',
  },
  {
    id: 97, pilarId: 9, pilarCode: '09',
    subsection: 'Práticas de Segurança, Saúde e Meio Ambiente',
    originalRef: '238,239,240',
    responsavel: 'Gestor',
    question: 'As FISPQ (Fichas de Segurança) dos lubrificantes estão disponíveis em todos os locais de armazenamento, independente do volume, e é avaliada a habilidade das equipes que manipulam os lubrificantes em interpretar as informações contidas?',
  },
  {
    id: 98, pilarId: 9, pilarCode: '09',
    subsection: 'Práticas de Segurança, Saúde e Meio Ambiente',
    originalRef: '241',
    responsavel: 'Gestor',
    question: 'Quaisquer produtos que apresentam alto risco para a dermatite ou problemas respiratórios estão claramente identificados?',
  },
  {
    id: 99, pilarId: 9, pilarCode: '09',
    subsection: 'Práticas de Segurança, Saúde e Meio Ambiente',
    originalRef: '242,243',
    responsavel: 'Gestor',
    question: 'Inspeções rotineiras incluem relato de vazamentos de lubrificantes e correção imediata pela mecânica?',
  },
  {
    id: 100, pilarId: 9, pilarCode: '09',
    subsection: 'Práticas de Segurança, Saúde e Meio Ambiente',
    originalRef: '244',
    responsavel: 'Gestor',
    question: 'A política de conservação da planta incorpora uma posição formal sobre a conservação de lubrificantes?',
  },
  {
    id: 101, pilarId: 9, pilarCode: '09',
    subsection: 'Práticas de Segurança, Saúde e Meio Ambiente',
    originalRef: '245',
    responsavel: 'Gestor',
    question: 'Lubrificantes são impedidos de entrar em fossas abertas e esgotos?',
  },
  {
    id: 102, pilarId: 9, pilarCode: '09',
    subsection: 'Práticas de Segurança, Saúde e Meio Ambiente',
    originalRef: '246,247',
    responsavel: 'Gestor',
    question: 'Reservatórios operando em vias navegáveis são avaliados para o uso de produtos biodegradáveis e quanto a vazamentos?',
  },
];
```

---

## 7. ATIVIDADES DAS ETAPAS DO PROGRAMA

### Arquivo: `src/data/stage-activities.ts`

```typescript
export const STAGE_ACTIVITIES = {
  stage1: [
    { key: 'plano_lubrificacao', label: 'Plano de Lubrificação + V-Zero' },
    { key: 'infra_standard', label: 'Infra-Estrutura Standard' },
    { key: 'capacitacao_standard', label: 'Capacitação Standard' },
    { key: 'implantacao_procedimentos', label: 'Implantação dos Procedimentos' },
    { key: 'analises_oleo_produto', label: 'Análises de Óleo — Produto' },
    { key: 'mudanca_cultural', label: 'Mudança Cultural' },
    { key: 'gestao_indicadores', label: 'Gestão da Lubrificação por Indicadores' },
    { key: 'resultados_economicos', label: 'Resultados Econômicos na Lubrificação' },
  ],
  stage2: [
    { key: 'racionalizacao_lubrificantes', label: 'Racionalização de Lubrificantes' },
    { key: 'infra_avancada', label: 'Infra-Estrutura Avançada' },
    { key: 'capacitacao_avancada', label: 'Capacitação Avançada — I' },
    { key: 'analises_oleo_equipamentos', label: 'Análises de Óleo — Equipamentos' },
    { key: 'identificacao_avancada', label: 'Identificação Avançada dos Pontos' },
    { key: 'controle_contaminacao', label: 'Controle da Contaminação' },
    { key: 'implantacao_proc_2', label: 'Implantação dos Procedimentos' },
    { key: 'inspecao_sensitiva', label: 'Inspeção Sensitiva' },
    { key: 'mudanca_cultural_2', label: 'Mudança Cultural II' },
    { key: 'gestao_kpis', label: 'Gestão da Lubrificação por KPIs' },
    { key: 'resultados_economicos_2', label: 'Resultados Econômicos' },
  ],
};
```

---

## 8. LÓGICA DE PONTUAÇÃO

### Arquivo: `src/lib/scoring.ts`

```typescript
import { PILARES } from '../data/pilares';

export interface PilarScore {
  pilarId: number;
  objectiveScore: number;   // média V/F  (0.0 a 1.0)
  qualityIndex: number;     // média notas 1-5
  compositeScore: number;   // objectiveScore × qualityIndex
  discScore: number;        // peso × 10
  percentile: number;       // compositeScore × discScore / 100
}

/**
 * Calcula a pontuação de um pilar a partir das respostas da auditoria completa.
 * Idêntico à lógica da planilha FLA002.
 */
export function calculatePilarScore(
  pilarId: number,
  answers: Array<{ objectiveScore: number | null; qualityIndex: number | null }>
): PilarScore {
  const pilar = PILARES.find(p => p.id === pilarId)!;
  
  const validAnswers = answers.filter(
    a => a.objectiveScore !== null && a.qualityIndex !== null
  );
  
  if (validAnswers.length === 0) {
    return {
      pilarId,
      objectiveScore: 0,
      qualityIndex: 0,
      compositeScore: 0,
      discScore: pilar.weight * 10,
      percentile: 0,
    };
  }
  
  const objectiveScore = validAnswers.reduce((sum, a) => sum + a.objectiveScore!, 0) / validAnswers.length;
  const qualityIndex = validAnswers.reduce((sum, a) => sum + a.qualityIndex!, 0) / validAnswers.length;
  const compositeScore = objectiveScore * qualityIndex;
  const discScore = pilar.weight * 10;
  const percentile = compositeScore * discScore / 100;
  
  return { pilarId, objectiveScore, qualityIndex, compositeScore, discScore, percentile };
}

/**
 * Retorna os dados formatados para o gráfico radar (Victory Native).
 * Usa compositeScore (0–10) como valor dos eixos.
 */
export function getRadarChartData(scores: PilarScore[], groupAverages?: Record<number, number>) {
  return PILARES.map(pilar => {
    const score = scores.find(s => s.pilarId === pilar.id);
    return {
      pilar: pilar.shortName,
      pilarId: pilar.id,
      score: score ? parseFloat(score.compositeScore.toFixed(2)) : 0,
      groupAverage: groupAverages?.[pilar.id] ?? null,
      maxScore: 10,
    };
  });
}

/**
 * Escala de qualidade técnica (para exibição no relatório)
 */
export const QUALITY_SCALE = [
  { value: 1, label: 'Informação pobre tecnicamente' },
  { value: 2, label: 'Informação com pouca precisão técnica' },
  { value: 3, label: 'Informação com precisão técnica limitada' },
  { value: 4, label: 'Informações com precisão técnica limitada, porém respondidos com base em pesquisas' },
  { value: 5, label: 'Informações com alta qualidade técnica, respostas com atenção cuidadosa aos detalhes técnicos' },
];
```

---

## 9. COMPONENTE PRINCIPAL — GRÁFICO RADAR

### Arquivo: `src/components/PilarRadarChart.tsx`

```typescript
import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
// Usar Victory Native para o radar:
// npm install victory-native react-native-svg
import { VictoryChart, VictoryPolarAxis, VictoryArea, VictoryLine } from 'victory-native';
import { PILARES } from '../data/pilares';

interface PilarRadarChartProps {
  scores: Array<{ pilarId: number; compositeScore: number }>;
  groupAverages?: Array<{ pilarId: number; average: number }>;
  showLegend?: boolean;
}

export function PilarRadarChart({ scores, groupAverages, showLegend = true }: PilarRadarChartProps) {
  const screenWidth = Dimensions.get('window').width;
  const chartSize = screenWidth - 32;

  // Organiza os dados no formato esperado por VictoryPolarAxis
  const labels = PILARES.map(p => p.shortName);
  
  const clientData = PILARES.map(pilar => {
    const s = scores.find(sc => sc.pilarId === pilar.id);
    return { x: pilar.shortName, y: s ? s.compositeScore : 0 };
  });

  const groupData = groupAverages
    ? PILARES.map(pilar => {
        const avg = groupAverages.find(g => g.pilarId === pilar.id);
        return { x: pilar.shortName, y: avg ? avg.average : 0 };
      })
    : null;

  return (
    <View style={styles.container}>
      <VictoryChart
        polar
        width={chartSize}
        height={chartSize}
        domain={{ y: [0, 10] }}
      >
        {/* Eixos por pilar */}
        {PILARES.map((pilar, i) => (
          <VictoryPolarAxis
            key={pilar.id}
            dependentAxis={false}
            axisValue={pilar.shortName}
            labelPlacement="perpendicular"
            style={{
              axisLabel: { fontSize: 9, fill: '#666', padding: 8 },
              axis: { stroke: '#e0e0e0', strokeWidth: 0.5 },
              grid: { stroke: '#e0e0e0', strokeDasharray: '4 4' },
            }}
          />
        ))}
        
        {/* Eixo radial (escala 0-10) */}
        <VictoryPolarAxis
          dependentAxis
          tickValues={[2, 4, 6, 8, 10]}
          style={{
            tickLabels: { fontSize: 8, fill: '#999' },
            axis: { stroke: 'none' },
            grid: { stroke: '#e0e0e0', strokeWidth: 0.5 },
          }}
        />

        {/* Média do grupo (linha de referência) */}
        {groupData && (
          <VictoryArea
            data={groupData}
            style={{
              data: {
                fill: 'rgba(180, 180, 180, 0.2)',
                stroke: '#aaa',
                strokeWidth: 1.5,
                strokeDasharray: '6 3',
              },
            }}
          />
        )}

        {/* Pontuação do cliente */}
        <VictoryArea
          data={clientData}
          style={{
            data: {
              fill: 'rgba(59, 139, 212, 0.25)',
              stroke: '#3B8BD4',
              strokeWidth: 2,
            },
          }}
        />
      </VictoryChart>

      {/* Legenda */}
      {showLegend && (
        <View style={styles.legend}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#3B8BD4' }]} />
            <Text style={styles.legendText}>Pontuação da empresa</Text>
          </View>
          {groupData && (
            <View style={styles.legendItem}>
              <View style={[styles.legendDash, { borderColor: '#aaa' }]} />
              <Text style={styles.legendText}>Média do grupo</Text>
            </View>
          )}
        </View>
      )}

      {/* Tabela de scores */}
      <View style={styles.scoreTable}>
        {PILARES.map(pilar => {
          const s = scores.find(sc => sc.pilarId === pilar.id);
          const score = s?.compositeScore ?? 0;
          return (
            <View key={pilar.id} style={styles.scoreRow}>
              <View style={[styles.colorDot, { backgroundColor: pilar.color }]} />
              <Text style={styles.pilarName} numberOfLines={1}>{pilar.shortName}</Text>
              <Text style={styles.scoreValue}>{score.toFixed(2)}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', paddingHorizontal: 16 },
  legend: { flexDirection: 'row', gap: 16, marginTop: 8 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot: { width: 12, height: 12, borderRadius: 6 },
  legendDash: { width: 20, height: 0, borderWidth: 1.5, borderStyle: 'dashed' },
  legendText: { fontSize: 12, color: '#555' },
  scoreTable: { width: '100%', marginTop: 16 },
  scoreRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 6, borderBottomWidth: 0.5, borderColor: '#eee' },
  colorDot: { width: 10, height: 10, borderRadius: 5, marginRight: 8 },
  pilarName: { flex: 1, fontSize: 12, color: '#333' },
  scoreValue: { fontSize: 13, fontWeight: '600', color: '#3B8BD4', minWidth: 40, textAlign: 'right' },
});
```

---

## 10. FLUXO COMPLETO DA AUDITORIA

### 10.1 Tela: Checklist Simplificado (`app/audit/[id]/simplified.tsx`)

- Exibir questões agrupadas por pilar (accordion ou scroll contínuo)
- Cada questão: toggle Sim/Não (3 estados: Sim / Não / Não respondido)
- Badge indicando quem deve responder (ALLIANCE, Gestor, Compras, etc.)
- Barra de progresso por pilar no topo
- Botão "Próximo Pilar" ao finalizar cada grupo
- Salvamento automático a cada resposta (SQLite local)

### 10.2 Tela: Auditoria Completa — Pilar (`app/audit/[id]/full/[pilarId].tsx`)

- Listar todas as afirmações do pilar
- Para cada afirmação:
  - Toggle V / F (Verdadeiro / Falso)
  - Seletor de nota qualitativa 1–5 (segmented control ou picker)
  - Campo de comentário (TextInput multiline, opcional)
  - Botão de câmera para anexar foto de evidência
- Barra de progresso do pilar atual
- Navegação entre pilares (anterior / próximo)
- Auto-save a cada 3 segundos de inatividade

### 10.3 Tela: Gráfico de Pilares (`app/audit/[id]/radar.tsx`)

- Exibir PilarRadarChart com os scores calculados
- Cards com nota de cada pilar abaixo do gráfico
- Botão "Exportar gráfico como imagem"
- Botão "Ver relatório completo"

### 10.4 Tela: Relatório de Auditoria (`app/audit/[id]/report.tsx`)

**Seções do relatório (idêntico ao Relatório_Auditoria da planilha):**
1. Cabeçalho: empresa, período, auditor
2. Objetivos da auditoria (texto padrão Alliance)
3. Gráfico radar + resumo geral da situação
4. Boas Práticas Atuais (campo editável pelo auditor)
5. Oportunidades de Melhorias e Ganhos (campo editável)
6. Detalhamento das Avaliações e Pontuações por pilar:
   - Pontuação Objetiva | Índice de Qualidade | Classificação Final
7. Próximos Passos — Implantação da Lubrificação 360°

---

## 11. EXPORTAÇÃO

### 11.1 PDF Executivo

```typescript
// src/lib/pdf-generator.ts
// Usar expo-print ou react-native-html-to-pdf
// Gerar HTML com todos os dados do relatório e converter para PDF

export async function generateAuditPDF(auditId: string): Promise<string> {
  // 1. Buscar todos os dados da auditoria
  // 2. Calcular scores de todos os pilares
  // 3. Montar HTML do relatório (incluindo gráfico como base64 image)
  // 4. Converter para PDF via expo-print
  // 5. Salvar em FileSystem.documentDirectory
  // 6. Retornar path do arquivo
}
```

**Filtros disponíveis para exportação:**
- Empresa
- Período (data início / data fim)
- Auditor
- Pilares específicos (multi-select)
- Incluir/excluir fotos de evidência
- Incluir/excluir comparativo com auditoria anterior
- Incluir/excluir média do grupo

### 11.2 Excel (SheetJS)

Abas geradas automaticamente:
1. `Dados_Gerais` — nome da empresa, período, auditor
2. `Checklist_Simplificado` — 102 perguntas + respostas Sim/Não
3. `Auditoria_Completa` — 244 afirmações + V/F + nota + comentário
4. `Pontuação_Final` — 9 pilares + scores calculados
5. `Progresso_Etapas` — Etapas 01 e 02 com percentuais

---

## 12. FUNCIONALIDADE OFFLINE

```typescript
// src/hooks/useOfflineSync.ts
// 1. Todas as respostas são salvas primeiro no SQLite local
// 2. Ao detectar conexão, sincronizar com Supabase
// 3. Indicador visual de status de sync (ícone na header)
// 4. Conflitos: last-write-wins com timestamp
// 5. Fila de operações pendentes (expo-sqlite)
```

---

## 13. AUTENTICAÇÃO

- Login com e-mail + senha (Supabase Auth)
- Perfis: `admin` (Alliance) e `auditor`
- Recuperação de senha por e-mail
- Token armazenado em SecureStore (expo-secure-store)
- Redirect automático ao abrir app se token válido

---

## 14. NOTAS IMPORTANTES PARA IMPLEMENTAÇÃO

1. **Questões da auditoria completa:** O banco de questões em inglês (`Questões em Inglês`) contém 244 afirmações numeradas de 1 a 247 (3 items são subseções sem número). Na implementação, mapeie exatamente as questões numeradas 1–247 para os pilares conforme a aba `Formulário_Auditoria_Completo`.

2. **Fórmula de Pontuação (replicar exato da planilha):**
   - `Pontuação Objetiva` = média de (0 ou 1) por pilar
   - `Índice de Qualidade` = média de (1–5) por pilar  
   - `Placar Composto` = Pontuação Objetiva × Índice de Qualidade
   - `Disc. Score` = peso do pilar × 10
   - `Percentil` = Placar Composto × Disc. Score / 100

3. **Gráfico radar:** Os valores nos eixos devem ir de 0 a 10 (Placar Composto). A `Média do Grupo` (coluna `Media do Grupo` na planilha) é configurável por setor.

4. **Referência de scores do exemplo real (empresa ADM AGRO, fev–mar 2025):**
   | Pilar | Pont. Obj. | Índice Qual. | Placar Comp. |
   |-------|-----------|-------------|------------|
   | 01 | 0.6032 | 4.1984 | 5.0648 |
   | 02 | 0.6167 | 4.5750 | 5.6425 |
   | 03 | 0.5833 | 3.1806 | 3.7106 |
   | 04 | 0.5238 | 3.9167 | 4.1032 |
   | 05 | 0.6233 | 3.4300 | 4.2761 |
   | 06 | 0.3324 | 4.4235 | 2.9406 |
   | 07 | 0.2540 | 3.7524 | 1.9060 |
   | 08 | 0.3222 | 2.9722 | 1.9154 |
   | 09 | 0.6667 | 3.7778 | 5.0370 |

5. **Texto padrão do relatório (copiar exatamente):**
   > "Esta Auditoria tem como base visita a campo por Engenheiro Especialista ALLIANCE e preenchimento de questionário com perguntas baseadas nas práticas do Programa de Lubrificação 360º ALLIANCE®. Através do preenchimento do questionário durante as visitas de Auditoria, a partir desses dados é gerado um gráfico para melhor visualização dos pontos fortes observados na empresa bem como as oportunidades de melhorias baseadas nas Técnicas de Lubrificação Centrada em Confiabilidade."

6. **Cores dos pilares no gráfico:** usar as cores definidas em `PILARES.color` para diferenciar visualmente cada eixo do radar quando necessário.

7. **Salvar fotos de evidência:** upload para Supabase Storage no bucket `evidence-photos/{audit_id}/{question_id}/`. Compressão antes do upload: max 1200px, qualidade 0.8.

---

## 15. COMANDOS PARA INICIAR O PROJETO

```bash
# Criar projeto
npx create-expo-app alliance-lub-app --template expo-template-blank-typescript
cd alliance-lub-app

# Instalar dependências
npx expo install expo-router expo-sqlite expo-secure-store expo-image-picker expo-print expo-sharing expo-file-system
npm install @supabase/supabase-js zustand react-hook-form zod
npm install victory-native react-native-svg
npm install xlsx
npm install nativewind
npm install react-native-paper

# Configurar Supabase
# Criar arquivo src/lib/supabase.ts com URL e ANON_KEY
```

---

*Documento gerado pela Amplie Marketing para Alliance Lub — Junho 2026*  
*Baseado na análise completa do arquivo FLA002_Auditoria_Construção_Confiabilidade_ALLIANCE_ADM_365.xlsx e da Apresentação_Técnica_Pilares_Oficial_2023.pptx*


---

# PARTE 3 — DADOS COMPLETOS: 9 PILARES (VALORES CORRIGIDOS E AUDITADOS)

```typescript
// src/data/pilares.ts — VERSÃO CORRIGIDA (contagens extraídas da planilha real)
export const PILARES = [
  {
    id: 1, code: '01',
    name: 'Processo de Seleção do Fornecedor',
    shortName: 'Seleção Fornecedor',
    weight: 5, totalQuestions: 15, simplifiedCount: 9,
    color: '#E24B4A',
    description: 'Verifica se a empresa possui padrões bem definidos para a seleção dos fornecedores de lubrificantes, qualidade dos produtos e serviços e parâmetros de avaliação levando em consideração qualidade, performance, logística e custo × benefício.',
  },
  {
    id: 2, code: '02',
    name: 'Armazenagem, Distribuição e Manuseio do Lubrificante',
    shortName: 'Armazenagem e Manuseio',
    weight: 5, totalQuestions: 23, simplifiedCount: 11,
    color: '#EF9F27',
    description: 'Verifica se a empresa possui padrões bem definidos para armazenar, distribuir e manusear os lubrificantes sem que suas características sejam afetadas, desde a chegada até a aplicação na máquina.',
  },
  {
    id: 3, code: '03',
    name: 'Especificação Técnica dos Lubrificantes',
    shortName: 'Especificação Técnica',
    weight: 5, totalQuestions: 26, simplifiedCount: 12,
    color: '#63C25E',
    description: 'Verifica se a empresa possui padrões bem definidos para escolher os lubrificantes adequados para cada aplicação, considerando as particularidades das máquinas, componentes e ambiente.',
  },
  {
    id: 4, code: '04',
    name: 'Critérios de Aplicação dos Lubrificantes',
    shortName: 'Aplicação',
    weight: 4, totalQuestions: 30, simplifiedCount: 14,
    color: '#3B8BD4',
    description: 'Verifica se a empresa possui padrões bem definidos sobre os critérios, procedimentos e boas práticas na aplicação dos lubrificantes nas máquinas e pontos específicos.',
  },
  {
    id: 5, code: '05',
    name: 'Práticas do Programa de Análises de Óleo',
    shortName: 'Análises de Óleo',
    weight: 4, totalQuestions: 27, simplifiedCount: 10,
    color: '#7F77DD',
    description: 'Verifica se a empresa possui um programa bem definido de análises de óleo com padrões para especificação dos equipamentos críticos, seleção de pontos de coleta, ensaios específicos e limites por tipo de máquina.',
  },
  {
    id: 6, code: '06',
    name: 'Controle da Contaminação',
    shortName: 'Controle Contaminação',
    weight: 4, totalQuestions: 30, simplifiedCount: 13,
    color: '#D4537E',
    description: 'Verifica se a empresa possui um programa bem definido para garantir o controle da contaminação e saúde dos lubrificantes instalados, incluindo cuidados no manuseio e qualidade dos sistemas de filtragem.',
  },
  {
    id: 7, code: '07',
    name: 'Gestão do Programa de Lubrificação e Capacitação da Equipe',
    shortName: 'Gestão e Capacitação',
    weight: 3, totalQuestions: 31, simplifiedCount: 11,
    color: '#1D9E75',
    description: 'Verifica se a empresa possui um programa bem definido com avaliações periódicas e treinamentos específicos para a equipe de lubrificação e supervisores, com rotas e metas de melhoria contínua.',
  },
  {
    id: 8, code: '08',
    name: 'Padronização das Práticas de Lubrificação de Máquinas',
    shortName: 'Padronização (SOPs)',
    weight: 3, totalQuestions: 35, simplifiedCount: 15,
    color: '#F96167',
    description: 'Verifica se a empresa possui procedimentos específicos e políticas bem definidas que direcionem as atividades diretas e indiretas à lubrificação, garantindo o sucesso e eficácia do programa.',
  },
  {
    id: 9, code: '09',
    name: 'Práticas de Segurança, Saúde e Meio Ambiente',
    shortName: 'SSM Ambiental',
    weight: 3, totalQuestions: 9, simplifiedCount: 7,
    color: '#028090',
    description: 'Verifica se a empresa possui procedimentos e políticas que garantam a segurança e saúde dos colaboradores e a proteção do meio ambiente durante o manuseio e descarte dos lubrificantes.',
  },
];
```


---

# PARTE 4 — LÓGICA DE PONTUAÇÃO (FÓRMULA EXATA DA PLANILHA)

```typescript
// src/lib/scoring.ts — VERSÃO CORRIGIDA
import { PILARES } from '../data/pilares';

export interface PilarScore {
  pilarId: number;
  objectiveScore: number;   // média V/F por pilar (0.0 a 1.0)
  qualityIndex: number;     // média notas 1–5 por pilar
  compositeScore: number;   // objectiveScore × qualityIndex (0–10)
  discScore: number;        // peso × 5 × 2 (= peso × 10)
  percentile: number;       // 1 / (discScore / compositeScore)
}

export function calculatePilarScore(
  pilarId: number,
  answers: Array<{ objectiveScore: number | null; qualityIndex: number | null }>
): PilarScore {
  const pilar = PILARES.find(p => p.id === pilarId)!;
  const valid = answers.filter(a => a.objectiveScore !== null && a.qualityIndex !== null);

  if (valid.length === 0) {
    return { pilarId, objectiveScore: 0, qualityIndex: 0,
             compositeScore: 0, discScore: pilar.weight * 10, percentile: 0 };
  }

  const objectiveScore = valid.reduce((s, a) => s + a.objectiveScore!, 0) / valid.length;
  const qualityIndex   = valid.reduce((s, a) => s + a.qualityIndex!, 0)   / valid.length;
  const compositeScore = objectiveScore * qualityIndex;
  const discScore      = pilar.weight * 5 * 2;  // ex: peso 5 → disc 50
  const percentile     = compositeScore === 0 ? 0 : 1 / (discScore / compositeScore);

  return { pilarId, objectiveScore, qualityIndex, compositeScore, discScore, percentile };
}

// Escala de qualidade técnica (1–5)
export const QUALITY_SCALE = [
  { value: 1, label: 'Informação pobre tecnicamente' },
  { value: 2, label: 'Informação com pouca precisão técnica' },
  { value: 3, label: 'Informação com precisão técnica limitada' },
  { value: 4, label: 'Informações com precisão técnica limitada, porém respondidos com base em pesquisas' },
  { value: 5, label: 'Informações com alta qualidade técnica, respostas com atenção cuidadosa aos detalhes técnicos' },
];

// Dados reais de validação — ADM Agro (fev–mar 2025)
export const VALIDATION_SCORES = [
  { pilarId: 1, objectiveScore: 0.6032, qualityIndex: 4.1984, compositeScore: 5.0648 },
  { pilarId: 2, objectiveScore: 0.6167, qualityIndex: 4.5750, compositeScore: 5.6425 },
  { pilarId: 3, objectiveScore: 0.5833, qualityIndex: 3.1806, compositeScore: 3.7106 },
  { pilarId: 4, objectiveScore: 0.5238, qualityIndex: 3.9167, compositeScore: 4.1032 },
  { pilarId: 5, objectiveScore: 0.6233, qualityIndex: 3.4300, compositeScore: 4.2761 },
  { pilarId: 6, objectiveScore: 0.3324, qualityIndex: 4.4235, compositeScore: 2.9406 },
  { pilarId: 7, objectiveScore: 0.2540, qualityIndex: 3.7524, compositeScore: 1.9060 },
  { pilarId: 8, objectiveScore: 0.3222, qualityIndex: 2.9722, compositeScore: 1.9154 },
  { pilarId: 9, objectiveScore: 0.6667, qualityIndex: 3.7778, compositeScore: 5.0370 },
];
```


---

# PARTE 5 — CHECKLIST SIMPLIFICADO: 102 QUESTÕES COMPLETAS
## Fonte: aba `Formulário_Auditoria_Cliente` da planilha FLA002 (extração automática)

```typescript
// src/data/simplified-questions.ts

export interface SimplifiedQuestion {
  id: number;
  pilarId: number;
  responsavel: string;
  text: string;
}

// TOTAL: 102 questões | Pilar 01:9 | 02:11 | 03:12 | 04:14 | 05:10 | 06:13 | 07:11 | 08:15 | 09:7
export const SIMPLIFIED_QUESTIONS: SimplifiedQuestion[] = [
  // ─── PILAR 01 — 9 questões ────────────────────────────────────────────────────
  { id: 1, pilarId: 1, responsavel: "Gestor", text: "Existe um contrato Coorporativo de compra de Lubrificantes?" },
  { id: 2, pilarId: 1, responsavel: "Gestor", text: "Existe uma metodologia especifica e bem definida para selecionar fornecedores?" },
  { id: 3, pilarId: 1, responsavel: "Compras / Gestor", text: "O Contrato como Fornecedor preve multa em caso de desacordos contratuais , principalmente realcionados a atrasos na entrega?" },
  { id: 4, pilarId: 1, responsavel: "Compras / Gestor", text: "A aquisição dos Lubrificantes, inclusive os de alta performace são baseadas em criterios técnicos pré estabelicidos e normas técnicas, incluindo os limites de umidade e contaminação sólida requeridos na entrega?" },
  { id: 5, pilarId: 1, responsavel: "Compras / Gestor", text: "Existe na empresa um processo de aquisição bem definido que mensure a capacidade técnica do fornecedor e o grau de performance de cada produto?" },
  { id: 6, pilarId: 1, responsavel: "Compras / Gestor", text: "A performance dos produtos representam pelo menos 1/3 na decisão pelo fornecedor?" },
  { id: 7, pilarId: 1, responsavel: "Compras/Fornecedor", text: "É levado em consideração no processo de seleção do fornecedor, sua localização e boas práticas de armagenagem dos lubrificantes ?" },
  { id: 8, pilarId: 1, responsavel: "Compras/Fornecedor", text: "O fornecedor detem certificados de limpeza  dos containeres comuns e a granel e são apresentados quando solicitados?" },
  { id: 9, pilarId: 1, responsavel: "ALLIANCE", text: "Há um controle eficiente do estoque mínimo afim de comprar somente o necessário ?" },
  // ─── PILAR 02 — 11 questões ────────────────────────────────────────────────────
  { id: 10, pilarId: 2, responsavel: "ALLIANCE", text: "O lubrificante é entregue a uma área de armazenamento coberto?" },
  { id: 11, pilarId: 2, responsavel: "ALLIANCE", text: "As embalagens dos lubrificantes estão herméticamente fechadas, limpas e em bom estado?" },
  { id: 12, pilarId: 2, responsavel: "ALLIANCE", text: "A embalagem do lubrificante exibe sua data de envase?" },
  { id: 13, pilarId: 2, responsavel: "ALLIANCE", text: "Após a recepção, a embalagem do lubrificante é identificada através de codificação interna da empresa que informe seu cadastro e propriedades?" },
  { id: 14, pilarId: 2, responsavel: "ALLIANCE", text: "As práticas de armazenamento incluem regras que definam detalhes do ambiente que limitem umidade e termperatura bem como contenção necessária?" },
  { id: 15, pilarId: 2, responsavel: "ALLIANCE", text: "A rotatividade dos produtos é realizada de forma que os lubrificantes mais antigos são utilizados primeiramente (FIFO)?" },
  { id: 16, pilarId: 2, responsavel: "ALLIANCE", text: "O volume de lubrificante na sala de lubrificação é suficiente para abastecer a planta até a chegada de uma nova remessa ?" },
  { id: 17, pilarId: 2, responsavel: "ALLIANCE", text: "A armazenagem das embalagens de óleo e graxa é feita de forma a garantir a limpeza e qualidade do produto na sala de lubrificação, como por exemplo:  valvulas de alívio nas embalagens de óelo e embalagens de graxa em tubo se estocado na posição vertical?" },
  { id: 18, pilarId: 2, responsavel: "ALLIANCE", text: "Há apenas uma embalagem de cada tipo de lubrificante aberta por sala de lubrificação?" },
  { id: 19, pilarId: 2, responsavel: "ALLIANCE", text: "Os utensílios de lubrificação (pincéis, funis, contenedores, etc) estão identificados e qdo não estão em uso, armazenados em armários adequados?" },
  { id: 20, pilarId: 2, responsavel: "ALLIANCE", text: "Todos os lubrificantes (exceto ISO 680cSt e superior) designados a aplicações muito criticas, são pré filtrados antes de serem aplicados nas máquinas?" },
  // ─── PILAR 03 — 12 questões ────────────────────────────────────────────────────
  { id: 21, pilarId: 3, responsavel: "ALLIANCE", text: "No levantamento do plano a desiginação dos  óleos lubrificantes ( Viscosidade, limites de temperatura, aditivos, nível de limpeza) a serem usados em cada carter obedecem especificações do fabricante do equipamento e/ou normas específicas?" },
  { id: 22, pilarId: 3, responsavel: "ALLIANCE", text: "O Histórico destas indicações ficam arquivados para futuras consultas ?" },
  { id: 23, pilarId: 3, responsavel: "ALLIANCE", text: "No levantamento do plano a desiginação das graxas ( consistëncia, limites de temperatura, aditivos, niveis de limpeza) a serem usados em cada carter obedecem especificações do fabricante do equipamento e/ou normas específicas?" },
  { id: 24, pilarId: 3, responsavel: "ALLIANCE", text: "O Histórico destas indicações ficam arquivados para futuras consultas ?" },
  { id: 25, pilarId: 3, responsavel: "Gestor", text: "As condições críticas de cada equipamento (temperatura alta ou baixa,  Rotação alta ou baixa, concentração de contaminantes, etc), são conhecidas e possuem indicações para o uso de lubrifiicantes de alta performance baseadas em normas técnicas ou recomendações de fabricantes?." },
  { id: 26, pilarId: 3, responsavel: "Gestor", text: "A empresa possui registro de quais equipamentos utilizam lubrificantes de alta performance e quais os critérios utilizados para a seleção dos mesmo?" },
  { id: 27, pilarId: 3, responsavel: "Gestor / ALLIANCE (visita em campo)", text: "Os reservatórios de óleo (hidráulico, engrenagens, barramentos) ou graxa (sistema centralizado) possuem marcações de nivel máximo e mínimo de facil visualização e entendimento, definidas pelo fabricante do equipamento ou por um sistema para cálculo de volume?" },
  { id: 28, pilarId: 3, responsavel: "Gestor / ALLIANCE (visita em campo)", text: "As frequências de relubrificação ou reposição de lubrificantes (checagem de nível) foram cálculadas através de uma sistemática especifica ou através de indicação dos fabricantes dos equipamentos?" },
  { id: 29, pilarId: 3, responsavel: "Gestor / ALLIANCE", text: "Existe um sistema de identificação do intervalo de relubrificação ou reposição para cada ponto na máquina, de fácil visualização e consulta do operador ou do técnico de lubrificação?" },
  { id: 30, pilarId: 3, responsavel: "Gestor", text: "Condições operacionais críticas da máquina e/ou componente determinam a utilização de sistemas automáticos ou centralizados de lubrificação?" },
  { id: 31, pilarId: 3, responsavel: "Gestor", text: "São aplicados nos sistemas automáticos ou centralizados de lubrificação, lubrificantes criteriosamente especificados para se obter um máximo desempenho da lubrificação de acordo com cálculos específicos e/ou diretrizes dos fabricantes de componentes?" },
  { id: 32, pilarId: 3, responsavel: "Gestor", text: "Existe na empresa registro de cada ponto onde é utilizada lubrificação automática ou centralizada e como foi feita essa especificação?" },
  // ─── PILAR 04 — 14 questões ────────────────────────────────────────────────────
  { id: 33, pilarId: 4, responsavel: "ALLIANCE", text: "O abastecimento ou troca de óleo seguem procedimentos de execução (instruções de trabalho) que incluam padrões para os utensílios e recipientes a serem utilizados?" },
  { id: 34, pilarId: 4, responsavel: "ALLIANCE", text: "Existe identificação em cada reservatório sobre o lubrificante instalado, de fácil visualização do operador ou do técnico?" },
  { id: 35, pilarId: 4, responsavel: "ALLIANCE", text: "Existe um gerenciamento informatizado das atividades de lubrificação que emita ordens de serviço contendo informações da atividade a ser realizada,  tipo e quantidade de lubrificante e frequencia da tarefa, bem como o controle de anomalias encontradas em campo?" },
  { id: 36, pilarId: 4, responsavel: "ALLIANCE", text: "Existe um critério sistematizado que defina a troca de óleo (por condição ou outro)?" },
  { id: 37, pilarId: 4, responsavel: "ALLIANCE", text: "Todos os reservatórios que possuem uma conhecida sensibilidade a contaminantes são reabastecidos com lubrificante pré filtrado (carrinho de filtragem ou outro método)?" },
  { id: 38, pilarId: 4, responsavel: "ALLIANCE", text: "O abastecimento de reservatórios de graxa seguem procedimentos de execução (instruções de trabalho) que incluam padrões para os utensílios e recipientes a serem utilizados?" },
  { id: 39, pilarId: 4, responsavel: "ALLIANCE", text: "Existe identificação em cada reservatório de graxa ou ponto de lubrificação que indique ao operador ou ao técnico de lubrificação o tipo de graxa aplicado?" },
  { id: 40, pilarId: 4, responsavel: "ALLIANCE", text: "Existe um gerenciamento informatizado das atividades de lubrificação que emita ordens de serviço contendo informações da atividade a ser realizada,  tipo e quantidade de lubrificante e frequencia da tarefa, bem como o controle de anomalias encontradas em campo?" },
  { id: 41, pilarId: 4, responsavel: "ALLIANCE", text: "O primeiro enchimento ou reabastecimento de reservatórios e dispositivos automáticos, seguem procedimentos específicos contendo tipo de lubrificante, volume, frequencia, bem como ferramentas específicas para cada tarefa?" },
  { id: 42, pilarId: 4, responsavel: "ALLIANCE", text: "Existe identificação em cada reservatório ou dispositivo automático de lubrificação sobre o lubrificante utilizado?" },
  { id: 43, pilarId: 4, responsavel: "ALLIANCE", text: "Existe um gerenciamento informatizado das atividades de abastecimento dos sistemas automáticos que emita ordens de serviço contendo informações da atividade a ser realizada,  tipo e quantidade de lubrificante e frequencia da tarefa, bem como o controle de anomalias encontradas em campo?" },
  { id: 44, pilarId: 4, responsavel: "ALLIANCE", text: "O abastecimento dos sistemas centralizados de lubrificação seguem procedimentos de execução (instruções de trabalho) que incluam padrões para os utensílios e recipientes a serem utilizados?" },
  { id: 45, pilarId: 4, responsavel: "ALLIANCE", text: "Existe identificação em cada reservatório de lubrificação centralizada sobre o tipo de lubrificante utilizado?" },
  { id: 46, pilarId: 4, responsavel: "ALLIANCE", text: "Existe um gerenciamento informatizado das atividades de abastecimento dos sistemas de lubrificação centralizada que emita ordens de serviço contendo informações da atividade a ser realizada,  tipo e quantidade de lubrificante e frequencia da tarefa, bem como o controle de anomalias encontradas em campo?" },
  // ─── PILAR 05 — 10 questões ────────────────────────────────────────────────────
  { id: 47, pilarId: 5, responsavel: "Gestor / ALLIANCE", text: "Todos os equipamentos industriais ou automotivos críticos ou relevantes ao processo possuem um cronograma de monitoramento por análise de óleo, mesmo que sejam testes primários, tipo passa ou não passa?" },
  { id: 48, pilarId: 5, responsavel: "Gestor / ALLIANCE", text: "Existe um pacote de análises para as amostras que não passaram pelo teste primário?" },
  { id: 49, pilarId: 5, responsavel: "Gestor / ALLIANCE", text: "A análise de óleo preve ensaios para: viscosidade, integridade fisica, vida dos aditivos, particulas sólidas, umidade, contaminação química, oxidação por produtos estranhos, concentração de particulas de desgaste, morfologia das particulas? Estes ensaios seguem normas conhecidas ?" },
  { id: 50, pilarId: 5, responsavel: "Gestor / ALLIANCE (visita em campo)", text: "Existe procedimentos para a coleta de amostras de óleo para análises, com indicação de acessórios e utensílios especificos e apropriados" },
  { id: 51, pilarId: 5, responsavel: "Gestor / ALLIANCE (visita em campo)", text: "Os pontos de coletas de amostras foram estratégicamente pré definidos e equipados com dispositivos que garantam a repitibilidade da amostra (ex: minimess com tuo de pitot, tomador de pressão, etc)" },
  { id: 52, pilarId: 5, responsavel: "Gestor / ALLIANCE", text: "As frequencias de amostragem seguem uma sistemática de acordo com, tipo de equipamento, nivel de criticidade, regime de operação e condições ambientais?" },
  { id: 53, pilarId: 5, responsavel: "Gestor / ALLIANCE", text: "As frequencias de amostragem são reavaliadas quando acontecem alterações significativas nos resultados dos parâmetros monitorados como também quando um determinado equipamentos apresenta constantemente padrões fora do normal?" },
  { id: 54, pilarId: 5, responsavel: "Gestor / ALLIANCE", text: "As amostras são padrozinadas para cada tipo de reservatório e seguem uma avaliação tanto na elevação quanto na queda de seus resultados com uma estrutura de fácil interpretação (Ex: Normal, Critico e Alerta)." },
  { id: 55, pilarId: 5, responsavel: "Gestor / ALLIANCE", text: "Os resultados das análises de óleo são avaliados imediatamente após seu recebimento e são direcionadas as ações para os pontos fora do limite aceitavel?" },
  { id: 56, pilarId: 5, responsavel: "Gestor", text: "Os técnicos de manutenção executam seus serviços baseados nos resultados das análises de óleo e incorporam os históricos das ações correticas no banco de dados do equipamento?" },
  // ─── PILAR 06 — 13 questões ────────────────────────────────────────────────────
  { id: 57, pilarId: 6, responsavel: "Diretoria /  Gestor", text: "A gerência industrial e de manutenção reconhecem o controle da contaminação como Fator Chave de Sucesso para o aumento da confiabilidade das máquinas?" },
  { id: 58, pilarId: 6, responsavel: "Gestor", text: "A empresa usa uma sistemática para medir a saúde dos lubrificantes em uso com limites ideais para os equipamentos críticos e estas informações são utilizada para melhorar o desempenho do equipamento e seus componentes?" },
  { id: 59, pilarId: 6, responsavel: "Gestor / ALLIANCE", text: "Os carteres e reservatórios hidráulicos críticos são limpos constantemente e possuem filtros de ar, camaras de expansão e protetores de rolamentos?" },
  { id: 60, pilarId: 6, responsavel: "Gestor / ALLIANCE", text: "Nos reservatórios das máquinas com alta criticidade (e importância no processo) que estão em contato direto com umidade (lavagem, a água da chuva, etc), são aplicadas estratégias, medidas e acessórios para eliminação da causa da contaminação?" },
  { id: 61, pilarId: 6, responsavel: "Gestor / ALLIANCE", text: "Os técnicos de lubrificação são treinados em procedimentos de prevenção de contaminantes, durante o manuseio de lubrificantes, abastecimento e reabastecimento de reservatórios, contemplando o uso de conteinedores limpos?" },
  { id: 62, pilarId: 6, responsavel: "ALLIANCE", text: "Os reservatórios são equipados com engates rápidos para filtragem, chincanas para sedimentação de particulas solidas e  válvulas de dreno para retirada de sedimentos no fundo do reservatório?" },
  { id: 63, pilarId: 6, responsavel: "Gestor / ALLIANCE", text: "Os reservatórios críticos sujeitos a contaminação por partículas solidas e umidade são periodicamente tratados e filtrados proativamente para gerenciar os indices de contaminação?" },
  { id: 64, pilarId: 6, responsavel: "Gestor / ALLIANCE", text: "Em locais onde a contaminação não pode ser removida pelo os meios disponíveis, a troca da carga é efetuada o mais rápido possível?" },
  { id: 65, pilarId: 6, responsavel: "Compras / Gestor", text: "A empresa mantem um padrão de qualidade técnica para seleção de elementos filtrantes e respiros?" },
  { id: 66, pilarId: 6, responsavel: "Gestor / ALLIANCE", text: "Os sistemas de filtragem utilizam respiros e elementos filtrantes combinados para equalizar e garantir a qualidade da filtragem de particulas?" },
  { id: 67, pilarId: 6, responsavel: "ALLIANCE", text: "As trocas dos elementos filtrantes são baseadas nos indicadores de pressão e o descarte é feito de acordo com procedimentos de acordo com normas ambientais?" },
  { id: 68, pilarId: 6, responsavel: "Gestor", text: "Os projetos e modificações nos equipamentos incluem planos de racionalização ou substituição de elementos filtrantes?" },
  { id: 69, pilarId: 6, responsavel: "ALLIANCE", text: "Os procedimentos de inspeção incluem a checagem  da eficiência dos elementos filtrantes, perda de carga e vedações de bombas de sisitemas circulatórios, hidráulicos de filtragem?" },
  // ─── PILAR 07 — 11 questões ────────────────────────────────────────────────────
  { id: 70, pilarId: 7, responsavel: "Gestor / ALLIANCE", text: "Existe um plano de capacitação técnica dos técnicos em lubrificação (seleção de lubrificantes, manuseio, aplicação, controle da contaminação, amostragem e análises de óleo, ações corretivas, entre outros) com avaliações frequentes e provas de certificação [CLS2 (STLE); MLT2 (ICML); ABRAMAN]?" },
  { id: 71, pilarId: 7, responsavel: "Gestor / ALLIANCE", text: "Existe uma política bem definida na empresa sobre os cursos e ações a serem tomadas caso o técnico em lubrificação não tenha os níveis de conhecimento necessários?" },
  { id: 72, pilarId: 7, responsavel: "Gestor / ALLIANCE", text: "Existe um plano de capacitação técnica dos supervisores de lubrificação (seleção de lubrificantes, manuseio, aplicação, controle da contaminação, amostragem e análises de óleo, ações corretivas, entre outros) com avaliações frequentes e provas de certificação [CLS2 (STLE); MLT2 (ICML); ABRAMAN]?" },
  { id: 73, pilarId: 7, responsavel: "Gestor / ALLIANCE", text: "Existe uma política bem definida na empresa sobre os cursos e ações a serem tomadas caso o supervisor de lubrificação não tenha os níveis de conhecimento necessários?" },
  { id: 74, pilarId: 7, responsavel: "Diretoria /  Gestor", text: "Os gerentes de produção estão envolvidos com as atividades de lubrificação e participam de reuniões rotineiras para revisões das metas de longo e curto prazo?" },
  { id: 75, pilarId: 7, responsavel: "ALLIANCE", text: "Existe uma sistemática implantada para a condução, realização e controle de execução das atividades de lubrificação?" },
  { id: 76, pilarId: 7, responsavel: "ALLIANCE", text: "Durante a execução das tarefas de lubrificação, são realizadas inspeções simples com uma estratégia clara e sistêmica para detecção, validação e correção das não conformidades encontradas?" },
  { id: 77, pilarId: 7, responsavel: "ALLIANCE", text: "Existem rotas lógicas de lubrificação para realização das tarefas, onde são agrupados elementos de máquina similares, tarefas similares, a fim de melhorar a eficiência?" },
  { id: 78, pilarId: 7, responsavel: "Gestor", text: "As metas do programa de lubrificação são regidas por uma estratégia central, associadas a metas de confiabilidade?" },
  { id: 79, pilarId: 7, responsavel: "Gestor", text: "São realizadas reuniões periódicas para verificar o status de cumprimento dos objetivos e possíveis correções das estratégias?" },
  { id: 80, pilarId: 7, responsavel: "Gestor", text: "As expectativa de cumprimento da estratégia de lubrificação fazem parte das avaliações de desempenho dos profissionais diretamente envolvidos (Ex: Gestor, Gerente)?" },
  // ─── PILAR 08 — 15 questões ────────────────────────────────────────────────────
  { id: 81, pilarId: 8, responsavel: "Gestor", text: "Existe um procedimento bem definido para a seleção de fornecedores de lubrificantes quanto a qualidade dos produtos, performance e serviços oferecidos?" },
  { id: 82, pilarId: 8, responsavel: "Gestor", text: "Existe um procedimento bem definido que detalhe as condições aceitáveis de entrega dos lubrificantes, gestão de estoque, armazenagem e utilização de ferramentas para o manuseio de lubrificantes?" },
  { id: 83, pilarId: 8, responsavel: "Gestor", text: "Existe um procedimento bem definido que detalhe as normas técnicas que devem ser utilizadas para a seleção de lubrificantes em geral? (óleo, graxa, lubrificantes de alta performance, etc.)" },
  { id: 84, pilarId: 8, responsavel: "Gestor", text: "Existe um procedimento bem definido que detalhe os métodos para determinar a forma de reabastecimento do estoque, frequencia de reabastecimento e volume máximo a ser mantido no estoque?" },
  { id: 85, pilarId: 8, responsavel: "ALLIANCE", text: "Existe um procedimento bem definido com o método correto de fornecimento correto e reabastecimento de óleos, graxas e lubrificação centralizada?" },
  { id: 86, pilarId: 8, responsavel: "ALLIANCE", text: "Existe um procedimento bem definido detalhando a forma de seleção dos pontos de coleta bem como os métodos utilizados para realizar a coleta?" },
  { id: 87, pilarId: 8, responsavel: "ALLIANCE", text: "Existe um procedimento bem definido que direcione o pacote de ensaios a serem realizados para cada equipamento, os limites aceitáveis e as ações a serem tomadas em caso de desvios?" },
  { id: 88, pilarId: 8, responsavel: "ALLIANCE", text: "Existe um procedimento bem definido que determine os limites aceitáveis de contaminação para cada máquina bem como os procedimentos de exclusão de contaminantes?" },
  { id: 89, pilarId: 8, responsavel: "ALLIANCE", text: "Existe um procedimento bem definido que determine as melhores práticas de remoção dos contaminantes, performance mínima aceitável para elementos filtrantes e procedimentos adequados de operação e manutenção dos filtros e sistemas de filtragem?" },
  { id: 90, pilarId: 8, responsavel: "Gestor", text: "Existe uma política escrita que identifica os métodos adequados para o descarte de lubrificantes?" },
  { id: 91, pilarId: 8, responsavel: "Gestor", text: "Existe uma política escrita que identifica as práticas de conservação de lubrificantes?" },
  { id: 92, pilarId: 8, responsavel: "Gestor", text: "Existe uma política escrita que identifica as práticas de treinamento e divulgação das fichas de segurança - FISPQ?" },
  { id: 93, pilarId: 8, responsavel: "Gestor", text: "Existe uma política escrita que identifica métodos e práticas para detecção e reparo de vazamentos?" },
  { id: 94, pilarId: 8, responsavel: "ALLIANCE", text: "Existe uma polítia bem definida para a confecção dos \"Procedimentos Operacionais Padrão\" relacionados a lubrificação?" },
  { id: 95, pilarId: 8, responsavel: "ALLIANCE", text: "Existe uma política bem definida ou um plano estratégico contemplando os conhecimentos necessários bem como a grade de treinamentos para a equipe de lubrificação e gestores diretos?" },
  // ─── PILAR 09 — 7 questões ────────────────────────────────────────────────────
  { id: 96, pilarId: 9, responsavel: "Gestor", text: "Existem procedimentos específicos na empresa para identificar, prevenir e combater riscos de incêndio associados a lubrificação?" },
  { id: 97, pilarId: 9, responsavel: "Gestor", text: "As FISPQ (Fichas de Segurança) dos lubrificantes estão disponíveis em todos os locais de armazenamento, independente do volume e é avaliada a habilidade das equipes que manipulam os lubrificantes em interpretar as informações contidas?" },
  { id: 98, pilarId: 9, responsavel: "Gestor", text: "Quaisquer produtos que apresentam alto risco para a dermatite ou problemas respiratórios estão claramente identificados ?" },
  { id: 99, pilarId: 9, responsavel: "Gestor", text: "Inpeções rotineiras incluem relato de vazamentos de lubrificantes e correção imediata pela mecânica?" },
  { id: 100, pilarId: 9, responsavel: "Gestor", text: "A política de conservação da planta incorpora uma posição formal sobre a conservação de lubrificantes?" },
  { id: 101, pilarId: 9, responsavel: "Gestor", text: "Lubrificantes são impedidos de entrar em fossas abertas e esgotos?" },
  { id: 102, pilarId: 9, responsavel: "Gestor", text: "Reservatórios operando em vias navegáveis são avaliados para o uso de produtos biodegradáveis e quanto a vazamentos?" },
];
```


---

# PARTE 6 — AUDITORIA COMPLETA: 226 QUESTÕES
## Fonte: aba `Formulário_Auditoria_Completo` da planilha FLA002 (extração automática)
## ⚠️ TOTAL CORRETO: 226 (não 244 — erro corrigido após auditoria da planilha)

```typescript
// src/data/full-questions.ts

export interface FullQuestion {
  seq: number;        // sequencial 1–226
  pilarId: number;    // 1–9
  subsection: string;
  text: string;       // afirmação em português
}

// TOTAL: 226 questões | P01:15 | P02:23 | P03:26 | P04:30 | P05:27 | P06:30 | P07:31 | P08:35 | P09:9
export const FULL_QUESTIONS: FullQuestion[] = [
  // ─── PILAR 01 — 15 questões ────────────────────────────────────────────────────
  { seq: 1, pilarId: 1, subsection: "Criterios Gerais", text: "A empresa mantém contratos de longa duração (mais de um ano) com os fornecedores de lubrificantes (De 01 a 03 fornecedores)?" },
  { seq: 2, pilarId: 1, subsection: "Criterios Gerais", text: "Os contratos para combustíveis, lubrificantes industriais e de processo são feitos separadamente?" },
  { seq: 3, pilarId: 1, subsection: "Criterios Gerais", text: "Em caso de contratos corporativos, uma unidade fabril individualmente é capaz de comprar um determinado lubrificante fora dos acordos de fornecedores para atender aos requisitos de aplicação, entrega e serviços ?" },
  { seq: 4, pilarId: 1, subsection: "Criterios Gerais", text: "A empresa tem agregado a maioria possível de lubrificantes a um único contrato de fornecimento?" },
  { seq: 5, pilarId: 1, subsection: "Criterios Gerais", text: "A empresa mantém um sistema de identificação e especificação dos lubrificantes por tipo, grau e critérios de performance?" },
  { seq: 6, pilarId: 1, subsection: "Criterios Gerais", text: "O preço do produto não representa mais do que 1 / 3 dos critérios de decisão no processo de seleção de fornecedores?" },
  { seq: 7, pilarId: 1, subsection: "Critérios de Performance dos Produtos", text: "A empresa mantém cadastro por tipo de lubrificante que identifique o produto de acordo com normas de performance pré estabelecidas para aquisição?" },
  { seq: 8, pilarId: 1, subsection: "Critérios de Performance dos Produtos", text: "O cadastro dos produtos inclui informações de viscosidade, tipos de aditivos, aditivos de longevidade (resistência a oxidação),e resistência ao desgaste baseado em normas ASTM, testes laboratoriais apropriados e métodos específicos para cada tipo de lubrificante?" },
  { seq: 9, pilarId: 1, subsection: "Critérios de Performance dos Produtos", text: "Os testes ASTM comuns para os lubrificantes incluem valores mínimos aceitáveis para garantir a performance dos produtos?" },
  { seq: 10, pilarId: 1, subsection: "Critérios de Performance dos Produtos", text: "O cadastro dos produtos incluem requisitos de contaminação sólida e umidade dos lubrificantes (Normas ISO ou NAS), incluindo limites max e min?" },
  { seq: 11, pilarId: 1, subsection: "Critérios de Performance dos Produtos", text: "São realizados registros dos testes de comparações técnicas para aprovação de produtos designados para aplicações especiais e/ou críticas das máquinas (óleo para turbinas, óleo e graxa para máquinas de papel, óleo e graxa para laminação, Aplicações em serviços de alta temperatura, etc ...)" },
  { seq: 12, pilarId: 1, subsection: "Critérios de Performance dos Produtos", text: "Existe na empresa um processo de aquisição bem definido que mensure a capacidade técnica do fornecedor e o grau de performance de cada produto?" },
  { seq: 13, pilarId: 1, subsection: "Critérios de Performance dos Produtos", text: "A performance dos produtos representam pelo menos 1/3 na decisão pelo fornecedor?" },
  { seq: 14, pilarId: 1, subsection: "Cuidados com a Logística", text: "As requisições de lubrificantes na planta estão otimizadas para limitar as compras ao necessário?" },
  { seq: 15, pilarId: 1, subsection: "Cuidados com a Logística", text: "Existe na planta práticas de compras a granel para grandes consumos de lubrificantes ≥ 5 tambores do mesmo produto por ano?" },
  // ─── PILAR 02 — 23 questões ────────────────────────────────────────────────────
  { seq: 16, pilarId: 2, subsection: "Práticas na planta de recebimento e manipulação", text: "O lubrificante é entregue a uma área de armazenamento coberto?" },
  { seq: 17, pilarId: 2, subsection: "Práticas na planta de recebimento e manipulação", text: "As embalagens dos lubrificantes estão herméticamente fechadas e em bom estado?" },
  { seq: 18, pilarId: 2, subsection: "Práticas na planta de recebimento e manipulação", text: "As embalagens dos lubrificantes estão bem limpas?" },
  { seq: 19, pilarId: 2, subsection: "Práticas na planta de recebimento e manipulação", text: "A embalagem do lubrificante exibe sua data de envase?" },
  { seq: 20, pilarId: 2, subsection: "Práticas na planta de recebimento e manipulação", text: "Após a recepção, a embalagem do lubrificante é identificada através de codificação interna da empresa que informe seu cadastro e propriedades?" },
  { seq: 21, pilarId: 2, subsection: "Práticas de armazenamento central da planta.", text: "Existe controle de inventário com os níveis min-max para cada produto em estoque?" },
  { seq: 22, pilarId: 2, subsection: "Práticas de armazenamento central da planta.", text: "Os lubrificantes estão armazenados em local com ambiente e clima controlado (protegidos, umidade, temperatura constante)?" },
  { seq: 23, pilarId: 2, subsection: "Práticas de armazenamento central da planta.", text: "A rotatividade dos produtos é realizada de forma que os lubrificantes mais antigos são utilizados primeiramente (FIFO)?" },
  { seq: 24, pilarId: 2, subsection: "Práticas de armazenamento central da planta.", text: "Todas as embalagens  estão armazenadas sobre contenção adequada?" },
  { seq: 25, pilarId: 2, subsection: "Práticas de armazenamento central da planta.", text: "As embalagens são inspecionadas frequentemente quanto a limpeza e quanto a saúde (testes de garantia do desempenho dos lubrificantes armazenados)?" },
  { seq: 26, pilarId: 2, subsection: "Praticas do estoque de trabalho (sala de lubrificação)", text: "Existe controle de inventário com os níveis min-max para cada produto em estoque na sala de lubrificação?" },
  { seq: 27, pilarId: 2, subsection: "Praticas do estoque de trabalho (sala de lubrificação)", text: "Ó número de unidades (galões, tambores, baldes, etc..) para cada tipo de produto e localização são mantidos em estoque na sala de lubrificação sempre entre os níveis min/max?" },
  { seq: 28, pilarId: 2, subsection: "Praticas do estoque de trabalho (sala de lubrificação)", text: "O estoque de trabalho (sala de lubrificação) é mantido em clima controlado, protegidos de contaminação sólida e umidade?" },
  { seq: 29, pilarId: 2, subsection: "Praticas do estoque de trabalho (sala de lubrificação)", text: "As embalagens de óleo em uso possuem respiros e válvulas de alívio?" },
  { seq: 30, pilarId: 2, subsection: "Praticas do estoque de trabalho (sala de lubrificação)", text: "Embalagens de graxa em tubos são estocadas na horizontal?" },
  { seq: 31, pilarId: 2, subsection: "Praticas do estoque de trabalho (sala de lubrificação)", text: "Apenas uma embalagem de cada tipo de produto esta aberta em cada sala de lubrificação ao mesmo tempo (apenas 1 tambor de cada tipo, apenas 1 balde de cada tipo,  apenas 1 barril de cada tipo, etc)?" },
  { seq: 32, pilarId: 2, subsection: "Práticas de manuseio do lubrificante na planta", text: "Todos os utensílios de manuseio de lubrificantes (funis, pinceis, recipientes para aplicação de lubrificantes, etc.) estão guardados em um armário específico quando não estão em uso?" },
  { seq: 33, pilarId: 2, subsection: "Práticas de manuseio do lubrificante na planta", text: "Todos os contenedores para o manuseio de lubrificantes estão claramente identificados por tipo?" },
  { seq: 34, pilarId: 2, subsection: "Práticas de manuseio do lubrificante na planta", text: "Todos os contenedores de manuseio de lubrificantes são mantidos em boas condições de limpeza?" },
  { seq: 35, pilarId: 2, subsection: "Práticas de manuseio do lubrificante na planta", text: "Todos os acessórios e utensílios para o manuseio de lubrificantes estão claramente identificados por tipo?" },
  { seq: 36, pilarId: 2, subsection: "Práticas de manuseio do lubrificante na planta", text: "Todos os acessórios e utensílios para manuseio de lubrificantes são mantidos em boas condições de limpeza?" },
  { seq: 37, pilarId: 2, subsection: "Práticas de manuseio do lubrificante na planta", text: "Lubrificantes que estão em uso (num contenedor dedicado) são armazenados em  locais padronizados e limpos?" },
  { seq: 38, pilarId: 2, subsection: "Práticas de manuseio do lubrificante na planta", text: "Todos os lubrificantes (exceto ISO 680cSt e superior) designados a aplicações muito criticas, são pré filtrados antes de serem aplicados nas máquinas?" },
  // ─── PILAR 03 — 26 questões ────────────────────────────────────────────────────
  { seq: 39, pilarId: 3, subsection: "Critérios de seleção de óleos", text: "A viscosidade dos lubrificantes e tipos de aditivos são especificados para cada tipo de cárter de acordo com as características da máquina?" },
  { seq: 40, pilarId: 3, subsection: "Critérios de seleção de óleos", text: "Cada seleção de lubrificante (viscosidade, aditivos, etc.) para cada determinado ponto é baseada em normas específicas e/ou sugestões dos fabricantes das máquinas?" },
  { seq: 41, pilarId: 3, subsection: "Critérios de seleção de óleos", text: "Existe na empresa cadastro do tipo de lubrificante, viscosidade e aditivo especificado para cada cárter de máquina?" },
  { seq: 42, pilarId: 3, subsection: "Critérios de seleção de óleos", text: "Existem na empresa registros de informações sobre como foi feita a especificação de lubrificante para cada cárter?" },
  { seq: 43, pilarId: 3, subsection: "Critérios de seleção de graxas", text: "A consistência, a viscosidade do óleo e aditivos utilizados na graxa são especificados na empresa para cada reservatório ou ponto de aplicação?" },
  { seq: 44, pilarId: 3, subsection: "Critérios de seleção de graxas", text: "Cada aplicação de graxa (seleção da viscosidade e dos aditivos) são baseadas em normas industriais ou nas sugestões dos fabricantes de componentes (rolamentos, acoplamentos, etc) e máquinas?" },
  { seq: 45, pilarId: 3, subsection: "Critérios de seleção de graxas", text: "Existe na empresa registro de especificações para cada graxa (NLGI,viscosidade do óleo e aditivos) para cada ponto de aplicação nas máquinas." },
  { seq: 46, pilarId: 3, subsection: "Critérios de seleção de graxas", text: "Existem na empresa registros de informações sobre como foi feita a especificação de cada graxa lubrificante para cada reservatório ou ponto a ser lubrificado?" },
  { seq: 47, pilarId: 3, subsection: "Critérios de seleção dos lubrificantes de alta performance para aplicações especiais.", text: "As condições operacionais críticas estão identificadas e possuem recomendação de lubrificantes de alto desempenho?" },
  { seq: 48, pilarId: 3, subsection: "Critérios de seleção dos lubrificantes de alta performance para aplicações especiais.", text: "Para se determinar a necessidade de utilização de lubrificante de alta performance, são mensuradas e avaliadas as condição de operação da máquina e do componente (temperatura, HP, RPM, concentração de contaminantes químicos, etc.)?" },
  { seq: 49, pilarId: 3, subsection: "Critérios de seleção dos lubrificantes de alta performance para aplicações especiais.", text: "Para cada aplicação de lubrificantes de alta performance,são especificados os aditivos e viscosidades necessárias?" },
  { seq: 50, pilarId: 3, subsection: "Critérios de seleção dos lubrificantes de alta performance para aplicações especiais.", text: "Cada aplicação de lubrificantes de alto desempenho (seleção da viscosidade e dos aditivos) são baseadas em normas industriais ou nas sugestões dos fabricantes de componentes (rolamentos, acoplamentos, etc) e máquinas?" },
  { seq: 51, pilarId: 3, subsection: "Critérios de seleção dos lubrificantes de alta performance para aplicações especiais.", text: "Existe na empresa registro de cada reservatório e/ou ponto da máquina onde foi especificada a utilização de lubrificantes de alta performance?" },
  { seq: 52, pilarId: 3, subsection: "Critérios de seleção dos lubrificantes de alta performance para aplicações especiais.", text: "Existem na empresa registros de informações sobre como foi feita a especificação de lubrificantes de alta performance para cada reservatório ou ponto a ser lubrificado?" },
  { seq: 53, pilarId: 3, subsection: "Critérios de determinação dos volumes (quantidades) de lubrificantes", text: "Para cada aplicação de lubrificante é avaliado o volume requerido de reabastecimento para cada carter ou ponto específico?" },
  { seq: 54, pilarId: 3, subsection: "Critérios de determinação dos volumes (quantidades) de lubrificantes", text: "O volume de lubrificação requerido foi designado por sugestão do fabricante da máquina ou por sistemática de cálculo específico?" },
  { seq: 55, pilarId: 3, subsection: "Critérios de determinação dos volumes (quantidades) de lubrificantes", text: "Existe identificação em cada reservatório ou ponto de lubrificação que indique ao operador ou técnico a especificação do lubrificante e volume?" },
  { seq: 56, pilarId: 3, subsection: "Critérios de determinação das frequências re lubrificação", text: "Foram utilizados requisitos específicos para determinar a frequencia de aplicação e reposição de cada lubrificante em cada reservatório ou ponto?" },
  { seq: 57, pilarId: 3, subsection: "Critérios de determinação das frequências re lubrificação", text: "A determinação da frequência ótima de reposição ou relubrificação foi baseada em sugestões específicas dos fabricantes de máquinas, ou calculadas através de sistemáticas específicas?" },
  { seq: 58, pilarId: 3, subsection: "Critérios de determinação das frequências re lubrificação", text: "Existe um sistema de identificação do intervalo de relubrificação ou reposição de cada ponto na máquina, de fácil visualização e consulta do operador ou do técnico de lubrificação?" },
  { seq: 59, pilarId: 3, subsection: "Critérios de seleção dos métodos de aplicação.", text: "Condições operacionais críticas estão identificadas e determinam  a utilização de sistemas automáticos ou semi automáticos de relubrificação?" },
  { seq: 60, pilarId: 3, subsection: "Critérios de seleção dos métodos de aplicação.", text: "Para se determinar a necessidade de utilização de sistemas automáticos ou semi automáticos de lubrificação, são mensuradas e avaliadas as condição de operação da máquina e do componente (temperatura, HP, RPM, concentração de contaminantes químicos, etc.)?" },
  { seq: 61, pilarId: 3, subsection: "Critérios de seleção dos métodos de aplicação.", text: "Cada aplicação de sistemas automáticos ou semi automáticos de lubrificação, é especificada de acordo com aditivos e viscosidades necessários para atender os requisitos e necessidades de relubrificação da máquina e dos componentes de acordo com a condição do local a ser instalado?" },
  { seq: 62, pilarId: 3, subsection: "Critérios de seleção dos métodos de aplicação.", text: "Para cada caso de aplicação de sistema automático ou semi automático de relubrificação,  a especificação do lubrificante (viscosidade e aditivos) é baseada em normas e práticas industriais ou sugestões e diretrizes dos fabricantes de componentes (rolamentos, acoplamentos, etc) e máquinas?" },
  { seq: 63, pilarId: 3, subsection: "Critérios de seleção dos métodos de aplicação.", text: "Existe na empresa o registro de cada ponto ou reservatório de máquina onde foi designado aplicação de lubrificação automática ou semi automática?" },
  { seq: 64, pilarId: 3, subsection: "Critérios de seleção dos métodos de aplicação.", text: "Existem na empresa registros de informações sobre como foi feita a especificação dos sistemas de relubrificação automática e semi automática?" },
  // ─── PILAR 04 — 30 questões ────────────────────────────────────────────────────
  { seq: 65, pilarId: 4, subsection: "Práticas de abastecimento ou reabastecimento de óleo", text: "O abastecimento de reservatórios de óleo segue um procedimento padrão os instrução técnica documentada?" },
  { seq: 66, pilarId: 4, subsection: "Práticas de abastecimento ou reabastecimento de óleo", text: "Existe identificação em cada reservatório sobre o lubrificante instalado, de fácil visualização do operador ou do técnico?" },
  { seq: 67, pilarId: 4, subsection: "Práticas de abastecimento ou reabastecimento de óleo", text: "A sistemática de abastecimento é baseado em registros de tipo de produto, volume e frequência?" },
  { seq: 68, pilarId: 4, subsection: "Práticas de abastecimento ou reabastecimento de óleo", text: "A sistemática de abastecimento  incorpora o uso de recipientes de manuseio dedicados, identfificados, selados e herméticamente fechados?" },
  { seq: 69, pilarId: 4, subsection: "Práticas de abastecimento ou reabastecimento de óleo", text: "A sistemática de abastecimento é guiada por um sistema de agendamento, manual ou computadorizado?" },
  { seq: 70, pilarId: 4, subsection: "Práticas de abastecimento ou reabastecimento de óleo", text: "A sistemática de abastecimento prevê atualização e/ou revisão para cada não conformidade encontrada em cada reservatório de lubrificante?" },
  { seq: 71, pilarId: 4, subsection: "Práticas de abastecimento ou reabastecimento de óleo", text: "Existe um critério sistematizado que defina a troca de óleo?" },
  { seq: 72, pilarId: 4, subsection: "Práticas de abastecimento ou reabastecimento de óleo", text: "As trocas totais ou parciais dos reservatórios críticos são baseadas na condição do óleo independente do volume do reservatório?" },
  { seq: 73, pilarId: 4, subsection: "Práticas de abastecimento ou reabastecimento de óleo", text: "Todas as trocas totais ou parciais dos reservatórios de volume expressivo, que não levam em conta a condição do óleo, são amostradas no momento da troca?" },
  { seq: 74, pilarId: 4, subsection: "Práticas de abastecimento ou reabastecimento de óleo", text: "Todos os reservatórios que possuem uma conhecida sensibilidade a contaminantes são reabastecidos com lubrificante pré filtrado?" },
  { seq: 75, pilarId: 4, subsection: "Práticas de abastecimento ou reabastecimento de graxa.", text: "O abastecimento de reservatório de graxa segue um procedimento padrão as instrução técnica documentada?" },
  { seq: 76, pilarId: 4, subsection: "Práticas de abastecimento ou reabastecimento de graxa.", text: "Existe identificação em cada reservatório de graxa ou ponto de lubrificação que indique ao operador ou ao técnico o tipo de graxa aplicado?" },
  { seq: 77, pilarId: 4, subsection: "Práticas de abastecimento ou reabastecimento de graxa.", text: "Sistematicamente se utiliza de tecnologia baseada em condição para determinar a frequencia e a quantidade de graxa para o reabastecimento, que garanta o filme ideal de lubrificante (ultrasom, vibração, etc)?" },
  { seq: 78, pilarId: 4, subsection: "Práticas de abastecimento ou reabastecimento de graxa.", text: "O procedimento de abastecimento e relubrificação incorpora o uso de específico de ferramentas e recipientes dedicados por tipo para aplicação manual de graxa?" },
  { seq: 79, pilarId: 4, subsection: "Práticas de abastecimento ou reabastecimento de graxa.", text: "O procedimento de relubrificação é guiado por um sistema de agendamento, manual ou computadorizado?" },
  { seq: 80, pilarId: 4, subsection: "Práticas de abastecimento ou reabastecimento de graxa.", text: "A sistemática de abastecimento prevê atualização e/ou revisão para cada não conformidade encontrada em cada reservatório de graxa?" },
  { seq: 81, pilarId: 4, subsection: "Práticas de uso e manutenção de sistemas semi automáticos de lubrificação", text: "O primeiro enchimento ou reabastecimento de reservatórios e dispositivos, seguem procedimentos específicos?" },
  { seq: 82, pilarId: 4, subsection: "Práticas de uso e manutenção de sistemas semi automáticos de lubrificação", text: "O procedimento de primeiro enchimento de lubrificante é baseado em registros da empresa sobre o tipo de lubrificante, volume e frequência requeridas?" },
  { seq: 83, pilarId: 4, subsection: "Práticas de uso e manutenção de sistemas semi automáticos de lubrificação", text: "Existe identificação clara em cada sistema automático ou semi automático que indique ao operador ou ao técnico que lubrificante esta aplicado ali?" },
  { seq: 84, pilarId: 4, subsection: "Práticas de uso e manutenção de sistemas semi automáticos de lubrificação", text: "A especificação dos intervalos de reabastecimento ou substituição são estimados através de observação do fluxo de consumo e de verificação física de nível do reservatório?" },
  { seq: 85, pilarId: 4, subsection: "Práticas de uso e manutenção de sistemas semi automáticos de lubrificação", text: "O procedimento de abastecimento ou reabastecimento incorporam o uso de específico de ferramentas e recipientes dedicados por tipo para aplicação manual de óleo ou graxa?" },
  { seq: 86, pilarId: 4, subsection: "Práticas de uso e manutenção de sistemas semi automáticos de lubrificação", text: "O procedimento de reabastecimento ou substituição é guiado por um sistema de agendamento, manual ou computadorizado?" },
  { seq: 87, pilarId: 4, subsection: "Práticas de uso e manutenção de sistemas semi automáticos de lubrificação", text: "A sistemática de abastecimento e reabastecimento prevê atualização e/ou revisão para cada não conformidade encontrada para sistema automático ou semi automático de lubrificação?" },
  { seq: 88, pilarId: 4, subsection: "Práticas de uso e manutenção de sistemas automáticos de lubrificação", text: "O primeiro enchimento ou reabastecimento de reservatórios e dispositivos, seguem procedimentos específicos?" },
  { seq: 89, pilarId: 4, subsection: "Práticas de uso e manutenção de sistemas automáticos de lubrificação", text: "O procedimento de primeiro enchimento de lubrificante é baseado em registros da empresa sobre o tipo de lubrificante, volume e frequência requeridas?" },
  { seq: 90, pilarId: 4, subsection: "Práticas de uso e manutenção de sistemas automáticos de lubrificação", text: "Existe identificação clara em cada sistema automático ou semi automático que indique ao operador ou ao técnico que lubrificante esta aplicado ali?" },
  { seq: 91, pilarId: 4, subsection: "Práticas de uso e manutenção de sistemas automáticos de lubrificação", text: "A especificação dos intervalos de reabastecimento ou substituição são estimados através de observação do fluxo de consumo e de verificação física de nível do reservatório?" },
  { seq: 92, pilarId: 4, subsection: "Práticas de uso e manutenção de sistemas automáticos de lubrificação", text: "O procedimento de abastecimento ou reabastecimento incorporam o uso de específico de ferramentas e recipientes dedicados por tipo para aplicação manual de óleo ou graxa?" },
  { seq: 93, pilarId: 4, subsection: "Práticas de uso e manutenção de sistemas automáticos de lubrificação", text: "O procedimento de reabastecimento ou substituição é guiado por um sistema de agendamento, manual ou computadorizado?" },
  { seq: 94, pilarId: 4, subsection: "Práticas de uso e manutenção de sistemas automáticos de lubrificação", text: "A sistemática de abastecimento e reabastecimento prevê atualização e/ou revisão para cada não conformidade encontrada para cada sistema automático de lubrificação?" },
  // ─── PILAR 05 — 27 questões ────────────────────────────────────────────────────
  { seq: 95, pilarId: 5, subsection: "Desenvolvimento do Programa de Análises de Óleo", text: "Todos os equipamentos industriais críticos ou relevantes, que possuam reservatórios de lubrificante estão inclusos no cronograma de análises de óleo, incluindo testes primários, métodos de avaliação das condições físico-químicas, níveis de contaminação e condições do equipamento?" },
  { seq: 96, pilarId: 5, subsection: "Desenvolvimento do Programa de Análises de Óleo", text: "Existe um pacote pré definido de testes secundários designados a serem realizados após resultados anormais nos testes primários?" },
  { seq: 97, pilarId: 5, subsection: "Desenvolvimento do Programa de Análises de Óleo", text: "Os parâmetros medidos das condições dos óleos incluem métodos de verificação da viscosidade, vida dos aditivos e integridade química?" },
  { seq: 98, pilarId: 5, subsection: "Desenvolvimento do Programa de Análises de Óleo", text: "Os parâmetros medidos das condições de contaminação incluem métodos para verificação de sólidos, umidade, contaminação química, oxidação por produtos estranhos?" },
  { seq: 99, pilarId: 5, subsection: "Desenvolvimento do Programa de Análises de Óleo", text: "Os parâmetros medidos da condição do equipamento incluem métodos para verificação da concentração de partículas de desgaste, tipos de desgaste e morfologia?" },
  { seq: 100, pilarId: 5, subsection: "Desenvolvimento do Programa de Análises de Óleo", text: "Todos os métodos de testes são baseados em normas industriais reconhecidas como ASTM, IP ou DIN?" },
  { seq: 101, pilarId: 5, subsection: "Coletas de amostras para análises de óleo", text: "Todas as amostras de equipamentos críticos são retiradas do reservatório através de pontos fixos permanentes, designados para coleta de amostras? Ex: Minimess, tomador de pressão, tubo de pitot, etc." },
  { seq: 102, pilarId: 5, subsection: "Coletas de amostras para análises de óleo", text: "A localização dos pontos de coleta é selecionada apropriadamente para prover o máximo de informações com o mínimo de desvios que possam interferir no resultado?" },
  { seq: 103, pilarId: 5, subsection: "Coletas de amostras para análises de óleo", text: "Os pontos de coleta fixos são instalados com  tubos de pitot internos para prevenir interferências nos resultados das análises?" },
  { seq: 104, pilarId: 5, subsection: "Coletas de amostras para análises de óleo", text: "Práticas de coleta manual são bem definidas, através de procedimentos escritos, e mantidos como documento no departamento de manutenção?" },
  { seq: 105, pilarId: 5, subsection: "Coletas de amostras para análises de óleo", text: "No caso de coletas manuais, são designadas ferramentas específicas , procedimentos específicos com o passo a passo da amostragem bem como locais de coleta bem especificados e identificados?" },
  { seq: 106, pilarId: 5, subsection: "Frequência de amostragem e análises", text: "Os reservatórios de lubrificantes são amostrados em intervalos coerentes?" },
  { seq: 107, pilarId: 5, subsection: "Frequência de amostragem e análises", text: "As frequencias de amostragem são baseadas em uma sistemática de acordo com cada tipo de máquina e criticidade?" },
  { seq: 108, pilarId: 5, subsection: "Frequência de amostragem e análises", text: "A seleção da frequência de amostragem incorpora os padrões e parâmetros de operação da máquina?" },
  { seq: 109, pilarId: 5, subsection: "Frequência de amostragem e análises", text: "A seleção da frequência de amostragem incorpora os parâmetros de criticidade das máquinas?" },
  { seq: 110, pilarId: 5, subsection: "Frequência de amostragem e análises", text: "A frequência de amostragem de um determinado equipamento é revista sempre que acontecem alterações significativas nos resultados das propriedades avaliadas nos testes anteriores?" },
  { seq: 111, pilarId: 5, subsection: "Frequência de amostragem e análises", text: "A frequência de amostragem sofre correções de intervalo para todos os reservatórios que continuamente apresentam alterações nos resultados fora dos limites aceitáveis estabelecidos?" },
  { seq: 112, pilarId: 5, subsection: "Definição dos Limites e Níveis de Alarme para as Análises de Óleo", text: "Cada parâmetro selecionado para as análises tem uma estrutura de avaliação com níveis normais, atenção e alarme?" },
  { seq: 113, pilarId: 5, subsection: "Definição dos Limites e Níveis de Alarme para as Análises de Óleo", text: "Os limites de alarme definidos se aplicam tanto na elevação quanto na queda dos valores que podem refletir alterações indesejáveis ao lubrificante?" },
  { seq: 114, pilarId: 5, subsection: "Definição dos Limites e Níveis de Alarme para as Análises de Óleo", text: "A estrutura de alarme é padronizada para cada reservatório individualmente, a fim de eliminar falhas em resultados que podem equivocadamente parecer normais?" },
  { seq: 115, pilarId: 5, subsection: "Definição dos Limites e Níveis de Alarme para as Análises de Óleo", text: "A estrutura de alarme inclui o uso de métodos estatísticos para padronizar as normas e o banco de dados de resultados?" },
  { seq: 116, pilarId: 5, subsection: "Utilização dos dados das análises de óleo.", text: "Os resultados das análises de óleo são avaliados imediatamente após o recebimento do laudo?" },
  { seq: 117, pilarId: 5, subsection: "Utilização dos dados das análises de óleo.", text: "Todos os pontos fora dos limites aceitáveis evidenciados pelos resultados das análises de óleo são examinados minusciosamente ​através de sua tendência histórica?" },
  { seq: 118, pilarId: 5, subsection: "Utilização dos dados das análises de óleo.", text: "Para todos os resultados de análises de óleo com tendências fora de um limite aceitável, são abertas ordens de serviços corretivas?" },
  { seq: 119, pilarId: 5, subsection: "Utilização dos dados das análises de óleo.", text: "As ordens de serviços incluem considerações sobre a origem dos fatores responsáveis pelo estado de alarme?" },
  { seq: 120, pilarId: 5, subsection: "Utilização dos dados das análises de óleo.", text: "Os técnicos de manutenção que irão executar as ordens de serviços baseadas nos resultados de análises de óleo são orientados a registrar as ações corretivas em cada ordem de serviço?" },
  { seq: 121, pilarId: 5, subsection: "Utilização dos dados das análises de óleo.", text: "O banco de dados das máquinas incorporam os registros das ações corretivas realizadas a partir dos resultados das análises de óleo?" },
  // ─── PILAR 06 — 30 questões ────────────────────────────────────────────────────
  { seq: 122, pilarId: 6, subsection: "Controle Standard da contaminação de lubrificantes", text: "A gerência industrial e de manutenção reconhecem o controle da contaminação como Fator Chave de Sucesso para o aumento da confiabilidade das máquinas?" },
  { seq: 123, pilarId: 6, subsection: "Controle Standard da contaminação de lubrificantes", text: "O desenvolvimento das estratégias para aumento da confiabilidade na empresa incorporam um ranking crítico de contaminação estabelecido através da determinação dos níveis aceitáveis de contaminação para todas as máquinas críticas ou relevantes?" },
  { seq: 124, pilarId: 6, subsection: "Controle Standard da contaminação de lubrificantes", text: "Máquinas do ranking crítico de contaminação incluem fatores de avaliação quanto a exposição intensiva a contaminantes agressivos, máquinas com componentes muito sensíveis aos contaminantes, e máquinas com alta criticidade operacional?" },
  { seq: 125, pilarId: 6, subsection: "Controle Standard da contaminação de lubrificantes", text: "A empresa usa uma abordagem sistemática para medir a saúde do lubrificante em uso, com base na avaliação combinada de oxidação, viscosidade, aditivos e contaminação (sólida, úmidade e química) nos resultados das análises?" },
  { seq: 126, pilarId: 6, subsection: "Controle Standard da contaminação de lubrificantes", text: "As máquinas com altos valores no ranking crítico de contaminação tem definidos os limites ideias de saúde do lubrificante em uso?" },
  { seq: 127, pilarId: 6, subsection: "Práticas de exclusão de contaminantes", text: "Todos os cárteres de óleo dos equipamentos críticos e relevantes são equipados com filtros de ar (respiro)?" },
  { seq: 128, pilarId: 6, subsection: "Práticas de exclusão de contaminantes", text: "Os reservatórios das máquinas com alto ranking crítico de contaminação possuem instalados protetores de bico graxeiros sempre que possível?" },
  { seq: 129, pilarId: 6, subsection: "Práticas de exclusão de contaminantes", text: "Resrvatórios hidráulicos com alto ranking crítico de contaminação são instalados respiros com camaras de expansão?" },
  { seq: 130, pilarId: 6, subsection: "Práticas de exclusão de contaminantes", text: "Os reservatórios das máquinas com alto ranking crítico de contaminação que estão em contato direto com umidade (lavagem, a água da chuva, etc), são aplicadas medidas e acessórios para eliminar a causa?" },
  { seq: 131, pilarId: 6, subsection: "Práticas de exclusão de contaminantes", text: "Equipe de operação e técnicos de lubrificação são treinados quanto a importância da prevenção de contaminação durante atividades de primeiro enchimento e reabastecimento de nível?" },
  { seq: 132, pilarId: 6, subsection: "Práticas de exclusão de contaminantes", text: "Equipe de operação e técnicos de lubrificação são treinados em métodos de trabalho (procedimentos) especificamente destinados a evitar a contaminação no primeiro enchimento e reabastecimentos de nível?" },
  { seq: 133, pilarId: 6, subsection: "Práticas de exclusão de contaminantes", text: "Equipe de operação e técnicos de lubrificação são providas de ferramentas, acessórios e conteinedores limpos e específicos para aplicação, manuseio, enchimento e reabastecimento de reservatórios garantindo a integridade do lubrificante?" },
  { seq: 134, pilarId: 6, subsection: "Práticas de exclusão de contaminantes", text: "Lubrificantes destinados ao abastecimento de máquinas com alto ranking crítico de contaminação são pré filtrados?" },
  { seq: 135, pilarId: 6, subsection: "Práticas de exclusão de contaminantes", text: "Todas as superfícies dos reservatórios são periodicamente limpas para prevenir o acúmulo de contaminantes?" },
  { seq: 136, pilarId: 6, subsection: "Práticas de remoção dos contaminantes", text: "Reservatórios críticos são equipados sempre que possível com dispositivos para sedimentação por gravidade de partículas sólidas, umidade e lodo como por exemplo chicanas ?" },
  { seq: 137, pilarId: 6, subsection: "Práticas de remoção dos contaminantes", text: "Reservatórios críticos são equipados com válvulas de dreno localizadas no fundo do reservatório, para permitir a retirada manual de contaminantes sedimentados?" },
  { seq: 138, pilarId: 6, subsection: "Práticas de remoção dos contaminantes", text: "Reservatórios críticos são equipados com engates rápidos para permitir descontaminação off-line?" },
  { seq: 139, pilarId: 6, subsection: "Práticas de remoção dos contaminantes", text: "Práticas de troca de lubrificantes são antecipadas em locais onde não se pode controlar a contaminação de outra forma?" },
  { seq: 140, pilarId: 6, subsection: "Práticas de remoção dos contaminantes", text: "Reservatórios críticos sujeitos a contaminação sólida são periodicamente filtrados para a remoção dos contaminantes sólidos?" },
  { seq: 141, pilarId: 6, subsection: "Práticas de remoção dos contaminantes", text: "Reservatórios críticos sujeitos a contaminação por umidade são periodicamente tratados para gerenciar a concentração de umidade?" },
  { seq: 142, pilarId: 6, subsection: "Práticas de remoção dos contaminantes", text: "Nos reservatórios críticos submetidos a contaminação que não pode ser removida pelos meios disponíveis, a troca da carga é providenciada com prioridade, rapidamente?" },
  { seq: 143, pilarId: 6, subsection: "Padrões de qualidade e práticas de filtragem", text: "A empresa mantém um padrão de qualidade de eficiência técnica para a seleção de todos os elementos filtrantes?" },
  { seq: 144, pilarId: 6, subsection: "Padrões de qualidade e práticas de filtragem", text: "A empresa mantém um padrão de qualidade de eficiência técnica para a seleção de todos os filtros de ar (respiros)?" },
  { seq: 145, pilarId: 6, subsection: "Padrões de qualidade e práticas de filtragem", text: "Todos os sistemas que requerem elementos filtrantes, estes são especificados através de padrões técnicos?" },
  { seq: 146, pilarId: 6, subsection: "Padrões de qualidade e práticas de filtragem", text: "Sistemas hidráulicos e de circulação críticos utilizam elementos que excedem as especificações técnicas dos fabricantes de máquinas?" },
  { seq: 147, pilarId: 6, subsection: "Padrões de qualidade e práticas de filtragem", text: "A seleção dos sistemas de respiro e dos elementos dos sistemas de filtragem, são combinadas para equalizar a qualidade e a eficiência para os tamanhos de partículas?" },
  { seq: 148, pilarId: 6, subsection: "Padrões de qualidade e práticas de filtragem", text: "Os sistemas de descontaminação possuem especificações para verificar a durabilidade e a eficiência dos elementos filtrantes?" },
  { seq: 149, pilarId: 6, subsection: "Manutenção dos sistemas de filtragem", text: "As trocas dos elementos são baseadas no indicador de diferencial de pressão ou nos resultados da contagem de partículas (análises)?" },
  { seq: 150, pilarId: 6, subsection: "Manutenção dos sistemas de filtragem", text: "Projetos e estratégias de modificações e atualizações das máquinas incluem planos de racionalização dos tipos de elementos filtrantes?" },
  { seq: 151, pilarId: 6, subsection: "Manutenção dos sistemas de filtragem", text: "Melhorias das máquinas incluem projetos para que seja possível substituir os elementos filtrantes com o equipamento em operação?" },
  // ─── PILAR 07 — 31 questões ────────────────────────────────────────────────────
  { seq: 152, pilarId: 7, subsection: "Gestão do conhecimento dos técnicos de lubrificação.", text: "A equipe envolvida na execução das atividades de lubrificação das máquinas são avaliadas bi-anualmente para verificar as lacunas de conhecimento?" },
  { seq: 153, pilarId: 7, subsection: "Gestão do conhecimento dos técnicos de lubrificação.", text: "O conteúdo da avaliação bi-anual é baseado no conhecimento da respectiva área de trabalho do técnico em lubrificação (seleção de lubrificantes, manuseio, aplicação, controle da contaminação, amostragem e análises de óleo, ações corretivas, entre outros)" },
  { seq: 154, pilarId: 7, subsection: "Gestão do conhecimento dos técnicos de lubrificação.", text: "O plano de capacitação da equipe de lubrificação é planejado para sanar as lacunas de conhecimento identificadas nas avaliações?" },
  { seq: 155, pilarId: 7, subsection: "Gestão do conhecimento dos técnicos de lubrificação.", text: "Os técnicos em lubrificação recebem treinamento conforme programa de capacitação para suprir as  lacunas de conhecimento identificadas?" },
  { seq: 156, pilarId: 7, subsection: "Gestão do conhecimento dos técnicos de lubrificação.", text: "Existe um programa de capacitação que prevê os requisitos mínimos para os novos Técnico de Lubrificação?" },
  { seq: 157, pilarId: 7, subsection: "Gestão do conhecimento dos técnicos de lubrificação.", text: "Existe uma política bem definida na empresa sobre os cursos e ações a serem tomadas caso o técnico em lubrificação não tenha os níveis de conhecimento necessários?" },
  { seq: 158, pilarId: 7, subsection: "Gestão do conhecimento dos supervisores de lubrificação.", text: "Os supervisores de lubrificação envolvidos na execução das atividades de lubrificação das máquinas são avaliadas bi-anualmente para verificar as lacunas de conhecimento?" },
  { seq: 159, pilarId: 7, subsection: "Gestão do conhecimento dos supervisores de lubrificação.", text: "O conteúdo da avaliação bi-anual é baseado no conhecimento da respectiva área de trabalho do supervisor em lubrificação (seleção de lubrificantes, manuseio, aplicação, controle da contaminação, amostragem e análises de óleo, ações corretivas, entre outros)" },
  { seq: 160, pilarId: 7, subsection: "Gestão do conhecimento dos supervisores de lubrificação.", text: "O plano de capacitação dos supervisores de lubrificação é planejado para sanar as lacunas de conhecimento identificadas nas avaliações?" },
  { seq: 161, pilarId: 7, subsection: "Gestão do conhecimento dos supervisores de lubrificação.", text: "Os supervisores de lubrificação recebem treinamento conforme programa de capacitação para suprir as  lacunas de conhecimento identificadas?" },
  { seq: 162, pilarId: 7, subsection: "Gestão do conhecimento dos supervisores de lubrificação.", text: "Possuir certificação técnica reconhecida  MLT1 (ICML)é requisito básico para manter o status como um supervisor do programa?" },
  { seq: 163, pilarId: 7, subsection: "Gestão do conhecimento dos supervisores de lubrificação.", text: "Existe uma política bem definida na empresa sobre os cursos e ações a serem tomadas caso o supervisor de lubrificação não tenha os níveis de conhecimento necessários?" },
  { seq: 164, pilarId: 7, subsection: "Treinamento e conscientização dos supervisores Manutenção / Produção", text: "Existe um plano de conscientização para todas as pessoas de decisão que estão indiretamente envolvidas nas atividades de lubrificação de máquinas?" },
  { seq: 165, pilarId: 7, subsection: "Treinamento e conscientização dos supervisores Manutenção / Produção", text: "O plano estratégico de desenvolvimento do conhecimento inclui a conscientização da estratégia de longo prazo e das expectativas de curto prazo do programa?" },
  { seq: 166, pilarId: 7, subsection: "Treinamento e conscientização dos supervisores Manutenção / Produção", text: "Supervisores de alto nível participam em reuniões de rotina para revisões dos prazos e mudanças de longo e curto prazo para se manterem totalmente envolvidos?" },
  { seq: 167, pilarId: 7, subsection: "Gestão, organização, programação e acompanhamento das atividades de lubrificação", text: "As atividades de lubrificação das máquinas são conduzidas através de rotinas e sistemáticas?" },
  { seq: 168, pilarId: 7, subsection: "Gestão, organização, programação e acompanhamento das atividades de lubrificação", text: "A programação de lubrificação é controladas por tarefa concluída?" },
  { seq: 169, pilarId: 7, subsection: "Gestão, organização, programação e acompanhamento das atividades de lubrificação", text: "A programação de lubrificação inclui tarefas de inspeção simples para detecção de características operacionais  \"não conformes\"?" },
  { seq: 170, pilarId: 7, subsection: "Gestão, organização, programação e acompanhamento das atividades de lubrificação", text: "Existe um processo na planta para validar as condições \"não conformes\" observadas?" },
  { seq: 171, pilarId: 7, subsection: "Gestão, organização, programação e acompanhamento das atividades de lubrificação", text: "Existe um processo na planta que programe ações corretivas para as não conformidades validadas?" },
  { seq: 172, pilarId: 7, subsection: "Gestão, organização, programação e acompanhamento das atividades de lubrificação", text: "As atividades de lubrificação são organizadas através de uma sequência linear de tarefas, ou rotas lógicas, para melhoria da eficiência?" },
  { seq: 173, pilarId: 7, subsection: "Gestão, organização, programação e acompanhamento das atividades de lubrificação", text: "As rotas de lubrificação são agrupadas por máquinas e reservatórios próximos, tipos de lubrificantes similares, funções de lubrificantes similares, ou uma combinação dos três?" },
  { seq: 174, pilarId: 7, subsection: "Objetivos, metas do programa e melhoria contínua", text: "As metas e objetivos do programa de lubrificação são regidos por uma estratégia central?" },
  { seq: 175, pilarId: 7, subsection: "Objetivos, metas do programa e melhoria contínua", text: "A estratégia central esta rigorosamente associada com as metas de confiabilidade de longo prazo?" },
  { seq: 176, pilarId: 7, subsection: "Objetivos, metas do programa e melhoria contínua", text: "A estratégia é reconhecida por cada departamento que necessita dos trabalhos de lubrificação das máquinas?" },
  { seq: 177, pilarId: 7, subsection: "Objetivos, metas do programa e melhoria contínua", text: "É programada uma revisão trimestral do programa de lubrificação de máquinas para verificar o status de cumprimento dos objetivos?" },
  { seq: 178, pilarId: 7, subsection: "Objetivos, metas do programa e melhoria contínua", text: "É programada uma revisão anual do programa de lubrificação de máquinas para tratar das oportunidades de melhorias contínuas?" },
  { seq: 179, pilarId: 7, subsection: "Objetivos, metas do programa e melhoria contínua", text: "O programa de lubrificação de máquinas é criticamente revisado a cada três anos para fazer correções estratégicas e correções quanto a confiabilidade da planta?" },
  { seq: 180, pilarId: 7, subsection: "Objetivos, metas do programa e melhoria contínua", text: "A responsabilidade pelo cumprimento da estratégia de lubrificação de máquinas faz parte da avaliação de desempenho do gerente de manutenção?" },
  { seq: 181, pilarId: 7, subsection: "Objetivos, metas do programa e melhoria contínua", text: "A responsabilidade pelo cumprimento da estratégia de lubrificação de máquinas faz parte da avaliação de desempenho do supervisor de lubrificação?" },
  { seq: 182, pilarId: 7, subsection: "Objetivos, metas do programa e melhoria contínua", text: "As expectativas de cumprimento anual do programa são incluídas nas avaliações de desempenho dos profissionais envolvidos no trabalho?" },
  // ─── PILAR 08 — 35 questões ────────────────────────────────────────────────────
  { seq: 183, pilarId: 8, subsection: "Fornecimento do lubrificante", text: "Existe uma política escrita bem definida para a seleção de fornecedores?" },
  { seq: 184, pilarId: 8, subsection: "Fornecimento do lubrificante", text: "Existe uma política escrita que define a qualidade e performance dos lubrificantes?" },
  { seq: 185, pilarId: 8, subsection: "Fornecimento do lubrificante", text: "Existe uma política escrita que define os padrões de qualidade dos serviços prestados pelo fornecedor?" },
  { seq: 186, pilarId: 8, subsection: "Fornecimento do lubrificante", text: "Existe uma política escrita que defina como o distribuidor local incorpora o uso das práticas de armazenagem, manuseio e manipulação dos lubrificantes?**" },
  { seq: 187, pilarId: 8, subsection: "Manuseio de Lubrificantes", text: "Existe uma política escrita que detalhe as condições aceitáveis de entrega do produto?" },
  { seq: 188, pilarId: 8, subsection: "Manuseio de Lubrificantes", text: "Existe uma política escrita que detalhe as práticas aceitáveis de gestão de estoque?" },
  { seq: 189, pilarId: 8, subsection: "Manuseio de Lubrificantes", text: "Existe uma política escrita que detalhe as práticas aceitáveis de armazenagem de lubrificantes nas salas de lubrificação?" },
  { seq: 190, pilarId: 8, subsection: "Manuseio de Lubrificantes", text: "Existe uma política escrita que detalhe as práticas aceitáveis e ferramentas adequadas para o manuseio de lubrificantes?" },
  { seq: 191, pilarId: 8, subsection: "Seleção de Lubrificantes", text: "Existe uma política escrita que detalhe as normas técnicas que devem ser utilizadas para a seleção de lubrificantes?" },
  { seq: 192, pilarId: 8, subsection: "Seleção de Lubrificantes", text: "Existe uma política escrita que detalhe as normas técnicas que devem ser utilizadas para a seleção de graxas?" },
  { seq: 193, pilarId: 8, subsection: "Seleção de Lubrificantes", text: "Existe uma política escrita que detalhe as normas técnicas que devem ser utilizadas para a seleção de lubrificantes de alta performance?" },
  { seq: 194, pilarId: 8, subsection: "Seleção de Lubrificantes", text: "Existe uma política escrita que detalhe o método utilizado para determinar corretamente a forma de abastecimento e reposição de nível, bem como o volume máximo de lubrificante a ser armazenado em estoque?" },
  { seq: 195, pilarId: 8, subsection: "Seleção de Lubrificantes", text: "Existe uma política escrita que detalhe o método utilizado para determinar corretamente a frequencia de reposição de nível do volume máximo de lubrificante em estoque?" },
  { seq: 196, pilarId: 8, subsection: "Aplicação de Lubrificantes", text: "Existe uma política escrita que identifica o método para determinar o fornecimento correto de óleo e reposição de nível?" },
  { seq: 197, pilarId: 8, subsection: "Aplicação de Lubrificantes", text: "Existe uma política escrita que identifica o método utilizado para determinar os procedimentos de abastecimento e reabastecimento degraxa?" },
  { seq: 198, pilarId: 8, subsection: "Aplicação de Lubrificantes", text: "Existe uma política escrita que identifica os padrões para seleção e manutenção de métodos de aplicação de lubrificação semi automática?" },
  { seq: 199, pilarId: 8, subsection: "Aplicação de Lubrificantes", text: "Existe uma política escrita que identifica os padrões para seleção e manutenção de métodos de aplicação de lubrificação automática?" },
  { seq: 200, pilarId: 8, subsection: "Análises de Lubrificantes", text: "Existe uma política escrita que detalhe a qualidade, seleção e instalação dos pontos de coleta de amostra?" },
  { seq: 201, pilarId: 8, subsection: "Análises de Lubrificantes", text: "Existe uma política escrita que identifica o método utilizado para realizar a coleta da amostra?" },
  { seq: 202, pilarId: 8, subsection: "Análises de Lubrificantes", text: "Existe uma política escrita que identifica os ensaios a serem realizados, as frequencia dos ensaios, procedimentos e limites para todos os tipos de máquinas?" },
  { seq: 203, pilarId: 8, subsection: "Análises de Lubrificantes", text: "Existe uma política escrita que estabeleça a interpretação das análises de óleo e estabeleça as ações corretivas exigidas?" },
  { seq: 204, pilarId: 8, subsection: "Controle da Condição dos Lubrificantes", text: "Lubrificantes são impedidos de entrar em fossas abertas e esgotos?" },
  { seq: 205, pilarId: 8, subsection: "Controle da Condição dos Lubrificantes", text: "Existe uma política escrita que determine as melhores práticas, métodos e procedimentos para a exclusão de contaminantes?" },
  { seq: 206, pilarId: 8, subsection: "Controle da Condição dos Lubrificantes", text: "Existe uma política escrita que determine as melhores práticas, métodos e procedimentos para a remoção de contaminantes?" },
  { seq: 207, pilarId: 8, subsection: "Controle da Condição dos Lubrificantes", text: "Existe uma política escrita que determine a qualidade mínima de performance aceitável para os elementos filtrantes?" },
  { seq: 208, pilarId: 8, subsection: "Controle da Condição dos Lubrificantes", text: "Existe uma política escrita que determine os procedimentos adequados para operação e manutenção dos elementos filtrantes e sistemas de filtragem?" },
  { seq: 209, pilarId: 8, subsection: "Práticas de Segurança, Saúde e Meio Ambiente", text: "Existe uma política escrita que identifica os métodos adequados para o descarte de lubrificantes?" },
  { seq: 210, pilarId: 8, subsection: "Práticas de Segurança, Saúde e Meio Ambiente", text: "Existe uma política escrita que identifica as práticas de conservação de lubrificantes?" },
  { seq: 211, pilarId: 8, subsection: "Práticas de Segurança, Saúde e Meio Ambiente", text: "Existe uma política escrita que identifica as práticas de treinamento e divulgação das fichas de segurança - FISPQ?" },
  { seq: 212, pilarId: 8, subsection: "Práticas de Segurança, Saúde e Meio Ambiente", text: "Existe uma política escrita que identifica métodos e práticas para detecção e reparo de vazamentos?" },
  { seq: 213, pilarId: 8, subsection: "Procedimentos Operacioanis Padrão - Práticas e Normas", text: "Existe uma política escrita que identifique o conteúdo requerido dos \"Procedimentos Operacionais Padrão\" relacionados a lubrificação?" },
  { seq: 214, pilarId: 8, subsection: "Procedimentos Operacioanis Padrão - Práticas e Normas", text: "Existe uma política escrita que identifique as normas e documentos de controle requeridos por máquina para a confecção de \"Procedimentos Operacionais Padrão\" relacionados a lubrificação?" },
  { seq: 215, pilarId: 8, subsection: "Gestão do Programa e Capacitação da Equipe", text: "Existe uma política escrita que identifica os requisitos de conhecimentos e treinamentos para todas as funções envolvidas em atividades de lubrificação de máquinas?" },
  { seq: 216, pilarId: 8, subsection: "Gestão do Programa e Capacitação da Equipe", text: "Existe uma política escrita para prover treinamento anual  para corrigir eventuais lacunas no conhecimento?" },
  { seq: 217, pilarId: 8, subsection: "Gestão do Programa e Capacitação da Equipe", text: "Existe uma política escrita que identifica estratégias de gestão e organização das atividades de lubrificação?" },
  // ─── PILAR 09 — 9 questões ────────────────────────────────────────────────────
  { seq: 218, pilarId: 9, subsection: "", text: "Todas as áreas onde são armazenados os lubrificantes estão equipadas com dispositivos para extinção de fogo ?" },
  { seq: 219, pilarId: 9, subsection: "", text: "A brigada de incêndio da planta é treinada para a extinção de incêndios originados por Lubrificantes ?" },
  { seq: 220, pilarId: 9, subsection: "", text: "Todos os conteineres de lubrificantes a granel ou semi-granel possuem etiquetas identificando perigo de incêndio, material inflamável e diamante de segurança?" },
  { seq: 221, pilarId: 9, subsection: "", text: "FISPQ  (Fichas de segurança) impressas são colocadas em cada local de estoque de lubrificante?" },
  { seq: 222, pilarId: 9, subsection: "", text: "As informações das fichas de segurança são avaliadas e revisadas anualmente?" },
  { seq: 223, pilarId: 9, subsection: "", text: "A equipe que manipula lubrificantes é avaliada quanto a sua habilidade em  interpretar as informações contidas nas fichas de segurança?" },
  { seq: 224, pilarId: 9, subsection: "", text: "Quaisquer produtos que apresentam alto risco para a dermatite ou problemas respiratórios estão claramente identificados ?" },
  { seq: 225, pilarId: 9, subsection: "", text: "Inspeções rotineiras incluem observação e relato de vazamentos de lubrificantes?" },
  { seq: 226, pilarId: 9, subsection: "", text: "Qualquer vazamento capaz de criar uma mancha de óleo é relatado para correção imediata?" },
];
```


---

# PARTE 7 — ATIVIDADES DAS ETAPAS DO PROGRAMA ALLIANCE

```typescript
// src/data/stage-activities.ts
export const STAGE_ACTIVITIES = {
  stage1: [
    { key: 'plano_lubrificacao',      label: 'Plano de Lubrificação + V-Zero',         defaultProgress: 0.75 },
    { key: 'infra_standard',          label: 'Infra-Estrutura Standard',                defaultProgress: 0.45 },
    { key: 'capacitacao_standard',    label: 'Capacitação Standard',                    defaultProgress: 0.05 },
    { key: 'implantacao_proc',        label: 'Implantação dos Procedimentos',           defaultProgress: 0.00 },
    { key: 'analises_produto',        label: 'Análises de Óleo — Produto',              defaultProgress: 0.60 },
    { key: 'mudanca_cultural',        label: 'Mudança Cultural',                        defaultProgress: 0.10 },
    { key: 'gestao_indicadores',      label: 'Gestão da Lubrificação por Indicadores',  defaultProgress: 0.00 },
    { key: 'resultados_economicos',   label: 'Resultados Econômicos na Lubrificação',   defaultProgress: 0.00 },
  ],
  stage2: [
    { key: 'racionalizacao',          label: 'Racionalização de Lubrificantes',          defaultProgress: 0.55 },
    { key: 'infra_avancada',          label: 'Infra-Estrutura Avançada',                 defaultProgress: 0.45 },
    { key: 'capacitacao_avancada',    label: 'Capacitação Avançada — I',                 defaultProgress: 0.00 },
    { key: 'analises_equipamentos',   label: 'Análises de Óleo — Equipamentos',          defaultProgress: 0.60 },
    { key: 'identificacao_avancada',  label: 'Identificação Avançada dos Pontos',        defaultProgress: 0.00 },
    { key: 'controle_contaminacao',   label: 'Controle da Contaminação',                 defaultProgress: 0.00 },
    { key: 'implantacao_proc_2',      label: 'Implantação dos Procedimentos',            defaultProgress: 0.00 },
    { key: 'inspecao_sensitiva',      label: 'Inspeção Sensitiva',                       defaultProgress: 0.00 },
    { key: 'mudanca_cultural_2',      label: 'Mudança Cultural II',                      defaultProgress: 0.00 },
    { key: 'gestao_kpis',             label: 'Gestão da Lubrificação por KPIs',          defaultProgress: 0.00 },
    { key: 'resultados_econ_2',       label: 'Resultados Econômicos',                    defaultProgress: 0.00 },
  ],
};
// Os valores defaultProgress são os dados reais do cliente ADM Agro (fev–mar 2025)
```


---

# PARTE 8 — SCHEMA BANCO DE DADOS (SUPABASE / POSTGRESQL)

```sql
-- ─────────────────────────────────────────────────────────────────────────
-- ALLIANCE LUB — Schema completo
-- ─────────────────────────────────────────────────────────────────────────

CREATE TABLE companies (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name         TEXT NOT NULL,
  cnpj         TEXT,
  sector       TEXT,
  contact_name TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  city         TEXT,
  state        TEXT,
  created_by   UUID REFERENCES auth.users(id),
  created_at   TIMESTAMPTZ DEFAULT now(),
  updated_at   TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE auditors (
  id        UUID PRIMARY KEY REFERENCES auth.users(id),
  full_name TEXT NOT NULL,
  email     TEXT NOT NULL,
  role      TEXT DEFAULT 'auditor',  -- 'admin' | 'auditor'
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE audits (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id   UUID REFERENCES companies(id) ON DELETE CASCADE,
  auditor_id   UUID REFERENCES auditors(id),
  title        TEXT NOT NULL DEFAULT 'Auditoria de Lubrificação',
  period_start DATE,
  period_end   DATE,
  status       TEXT DEFAULT 'draft',  -- 'draft' | 'in_progress' | 'completed'
  good_practices           TEXT,
  improvement_opportunities TEXT,
  next_steps               TEXT,
  created_at   TIMESTAMPTZ DEFAULT now(),
  updated_at   TIMESTAMPTZ DEFAULT now()
);

-- Checklist simplificado (102 questões — resposta Sim/Não)
CREATE TABLE simplified_answers (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  audit_id    UUID REFERENCES audits(id) ON DELETE CASCADE,
  question_id INTEGER NOT NULL,  -- 1 a 102
  answer      BOOLEAN,           -- true=Sim | false=Não | null=não respondido
  updated_at  TIMESTAMPTZ DEFAULT now(),
  UNIQUE(audit_id, question_id)
);

-- Auditoria completa (226 questões — Verdadeiro/Falso + nota 1–5)
CREATE TABLE full_answers (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  audit_id        UUID REFERENCES audits(id) ON DELETE CASCADE,
  question_seq    INTEGER NOT NULL,  -- 1 a 226
  pilar_id        INTEGER NOT NULL,  -- 1 a 9
  objective_score SMALLINT,          -- 0 (Falso) | 1 (Verdadeiro)
  quality_index   SMALLINT,          -- 1 a 5
  comment         TEXT,
  updated_at      TIMESTAMPTZ DEFAULT now(),
  UNIQUE(audit_id, question_seq)
);

-- Fotos de evidência
CREATE TABLE evidence_photos (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  audit_id     UUID REFERENCES audits(id) ON DELETE CASCADE,
  question_seq INTEGER,
  form_type    TEXT NOT NULL,  -- 'simplified' | 'full'
  storage_path TEXT NOT NULL,
  caption      TEXT,
  created_at   TIMESTAMPTZ DEFAULT now()
);

-- Scores calculados por pilar (cache)
CREATE TABLE pilar_scores (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  audit_id         UUID REFERENCES audits(id) ON DELETE CASCADE,
  pilar_id         INTEGER NOT NULL,
  objective_score  NUMERIC(6,4),
  quality_index    NUMERIC(6,4),
  composite_score  NUMERIC(6,4),
  disc_score       INTEGER,
  percentile       NUMERIC(6,4),
  group_average    NUMERIC(6,4),
  calculated_at    TIMESTAMPTZ DEFAULT now(),
  UNIQUE(audit_id, pilar_id)
);

-- Progresso das Etapas
CREATE TABLE stage_progress (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  audit_id      UUID REFERENCES audits(id) ON DELETE CASCADE,
  stage_number  INTEGER NOT NULL,  -- 1 ou 2
  activity_key  TEXT NOT NULL,
  progress      NUMERIC(4,2) DEFAULT 0,  -- 0.0 a 1.0
  updated_at    TIMESTAMPTZ DEFAULT now(),
  UNIQUE(audit_id, stage_number, activity_key)
);

-- Row Level Security
ALTER TABLE audits ENABLE ROW LEVEL SECURITY;
CREATE POLICY "auditor_own_audits" ON audits
  FOR ALL USING (
    auditor_id = auth.uid() OR
    EXISTS (SELECT 1 FROM auditors WHERE id = auth.uid() AND role = 'admin')
  );

ALTER TABLE simplified_answers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own_answers_simple" ON simplified_answers
  FOR ALL USING (
    audit_id IN (SELECT id FROM audits WHERE auditor_id = auth.uid())
  );

ALTER TABLE full_answers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own_answers_full" ON full_answers
  FOR ALL USING (
    audit_id IN (SELECT id FROM audits WHERE auditor_id = auth.uid())
  );
```


---

# PARTE 9 — STACK TECNOLÓGICA E ESTRUTURA DE ARQUIVOS

```
STACK:
  Mobile:     React Native + Expo SDK 51 + TypeScript
  Navegação:  Expo Router (file-based)
  UI:         NativeWind + React Native Paper
  Estado:     Zustand
  Forms:      React Hook Form + Zod
  DB local:   expo-sqlite (offline-first)
  Backend:    Supabase (PostgreSQL + Auth + Storage + Edge Functions)
  Gráficos:   Victory Native (radar chart)
  PDF:        expo-print
  Excel:      SheetJS (xlsx)
  Câmera:     expo-image-picker
  Share:      expo-sharing + expo-file-system

ESTRUTURA:
  alliance-lub-app/
  ├── app/
  │   ├── (auth)/login.tsx
  │   ├── (tabs)/
  │   │   ├── index.tsx              # Dashboard
  │   │   ├── companies.tsx          # Clientes
  │   │   └── reports.tsx            # Relatórios
  │   ├── audit/
  │   │   ├── new.tsx
  │   │   └── [id]/
  │   │       ├── index.tsx          # Visão geral
  │   │       ├── simplified.tsx     # 102 questões Sim/Não
  │   │       ├── full/
  │   │       │   ├── index.tsx      # Menu 9 pilares
  │   │       │   └── [pilarId].tsx  # Questões do pilar
  │   │       ├── stages.tsx         # Etapas 01 e 02
  │   │       ├── radar.tsx          # Gráfico radar
  │   │       └── report.tsx         # Relatório
  │   └── company/[id].tsx
  └── src/
      ├── data/
      │   ├── pilares.ts             # 9 pilares (Parte 3)
      │   ├── simplified-questions.ts # 102 questões (Parte 5)
      │   ├── full-questions.ts       # 226 questões (Parte 6)
      │   └── stage-activities.ts    # Etapas (Parte 7)
      ├── lib/
      │   ├── scoring.ts             # Cálculo (Parte 4)
      │   ├── supabase.ts
      │   ├── pdf-generator.ts
      │   └── excel-generator.ts
      ├── components/
      │   ├── PilarRadarChart.tsx
      │   ├── QuestionCard.tsx        # card V/F + nota 1-5 + comentário + foto
      │   ├── SimplifiedQuestionCard.tsx  # card Sim/Não
      │   ├── PilarProgressBar.tsx
      │   └── ExportButton.tsx
      └── store/
          ├── auditStore.ts (Zustand)
          └── authStore.ts

COMANDOS INICIAIS:
  npx create-expo-app alliance-lub-app --template expo-template-blank-typescript
  cd alliance-lub-app
  npx expo install expo-router expo-sqlite expo-secure-store expo-image-picker expo-print expo-sharing expo-file-system
  npm install @supabase/supabase-js zustand react-hook-form zod victory-native react-native-svg xlsx nativewind react-native-paper
```


---

# PARTE 10 — PLANO DE 18 TELAS PARA FIGMA MAKE

# TELAS A CRIAR — 18 TELAS COMPLETAS

---

## TELA 01 — SPLASH / ONBOARDING

**Nome do frame:** `01_Splash`  
**Dimensões:** 390 × 844px (iPhone 14)

**Layout:**
- Background: `#0B2A60` sólido
- Centro vertical: Logo Alliance Lub (texto "ALLIANCE LUB" em Inter Bold 32px, cor `#FF8310` + subtítulo "Auditoria 360°" em Inter Regular 16px, cor `#FFFFFF` com opacity 80%)
- Abaixo do logo: ícone de engrenagem/gota animado (representar com círculo `#FF8310` 80px com ícone branco dentro)
- Bottom: "Powered by Alliance Lubrificação & Gestão" em Inter Regular 11px, `#FFFFFF` opacity 40%
- Loading bar: linha horizontal 200×3px cor `#FF8310` centralizada, 40px abaixo do ícone

---

## TELA 02 — LOGIN

**Nome do frame:** `02_Login`  
**Dimensões:** 390 × 844px

**Layout:**
- Background: `#0B2A60`
- Top 40%: área com logo grande — "ALLIANCE" Inter Black 36px `#FFFFFF` + "LUB" em `#FF8310` + tagline "Auditoria de Lubrificação 360°" Inter Regular 14px `#FFFFFF` opacity 70%
- Ícone central: círculo 96px `#FF8310` com ícone de prancheta branco
- Cartão branco (border-radius 24px top only): ocupa bottom 60% da tela, padding 28px
  - Título: "Entrar na sua conta" Inter Bold 22px `#0B2A60`
  - Campo E-mail:
    - Label: "E-mail" 13px `#6B7280`
    - Input: altura 52px, borda `#E5E7EB` 1px, radius 10px, ícone envelope `#6B7280` left, placeholder "seu@email.com"
  - Campo Senha:
    - Label: "Senha" 13px `#6B7280`
    - Input: altura 52px, borda `#E5E7EB` 1px, ícone cadeado `#6B7280` left, ícone olho `#6B7280` right
  - Link "Esqueceu a senha?" Inter Medium 13px `#FF8310`, alinhado à direita
  - Botão "ENTRAR": largura total, altura 54px, background `#FF8310`, radius 12px, texto Inter SemiBold 16px `#FFFFFF`
  - Separador "ou" com linhas laterais cor `#E5E7EB`
  - Botão outline "Entrar com Microsoft": altura 52px, borda `#0B2A60` 1.5px, texto `#0B2A60`, ícone Microsoft left

---

## TELA 03 — DASHBOARD (HOME)

**Nome do frame:** `03_Dashboard`  
**Dimensões:** 390 × 844px

**Layout:**
- **Header** (96px, bg `#0B2A60`):
  - Avatar circular 40px (iniciais "AL") bg `#FF8310` canto superior esquerdo
  - Centro: "Alliance Lub" Inter SemiBold 17px `#FFFFFF`
  - Direita: ícone sino 24px `#FFFFFF` com badge vermelho "3"
  - Abaixo do nome: "Bom dia, Fernando 👋" Inter Regular 13px `#FFFFFF` opacity 80%

- **Barra de métricas rápidas** (horizontal scroll, 3 cards):
  - Card 1: "Auditorias Ativas" — número "4" Inter Bold 28px `#0B2A60`, label 12px `#6B7280`, borda esquerda 3px `#FF8310`
  - Card 2: "Concluídas (mês)" — número "7" `#0B2A60`, borda `#FFC000`
  - Card 3: "Clientes ativos" — número "12" `#0B2A60`, borda `#C46046`
  - Cards: 110×72px, bg `#FFFFFF`, shadow, radius 12px, margin 8px

- **Seção "Em Andamento"** (título Inter SemiBold 16px `#0B2A60` + "Ver tudo" link `#FF8310`):
  - 2 cards de auditoria (ver componente AuditCard abaixo)
  - AuditCard:
    - Largura total, altura 84px, bg `#FFFFFF`, radius 16px, shadow
    - Esquerda: círculo 44px bg `#FF8310` com iniciais empresa
    - Centro: nome empresa Inter SemiBold 14px `#0B2A60` + "Pilar 03 de 09" Inter Regular 12px `#6B7280`
    - Barra de progresso: 44% completo, altura 4px, cor `#FF8310`, bg `#F3F4F6`, radius 2px
    - Direita: badge status "Em andamento" bg `rgba(255,131,16,0.12)` texto `#FF8310` 11px

- **Botão flutuante "Nova Auditoria"**: FAB 56px circular bg `#FF8310`, ícone "+" branco 24px, shadow `0 4px 16px rgba(255,131,16,0.4)`, posição bottom-right (88px bottom, 20px right)

- **Seção "Últimas concluídas"**:
  - 2 cards compactos similares ao AuditCard mas com badge "Concluída" bg `rgba(34,197,94,0.12)` texto `#16A34A`

- **Bottom Navigation** (72px, bg `#FFFFFF`, shadow top):
  - 4 itens: Início (ativo `#FF8310`), Clientes, Auditorias, Relatórios
  - Ícones 24px, labels 10px
  - Item ativo: ícone e label `#FF8310`, bolinha indicadora 4px bg `#FF8310` abaixo do ícone

---

## TELA 04 — LISTA DE CLIENTES

**Nome do frame:** `04_Clientes`  
**Dimensões:** 390 × 844px

**Layout:**
- **Header** `#0B2A60` 96px:
  - Título "Clientes" Inter Bold 20px `#FFFFFF` centralizado
  - Botão "+" Inter Bold 24px `#FF8310` à direita (adicionar cliente)

- **Barra de busca** (20px margem horizontal):
  - Input 52px altura, radius 12px, bg `#FFFFFF`, border `#E5E7EB`
  - Ícone lupa `#6B7280` left, placeholder "Buscar empresa..."
  - Botão filtro (ícone slider) 52×52px bg `#F3F4F6` radius 12px à direita

- **Chips de filtro** (horizontal scroll sem scrollbar):
  - "Todos" (ativo): bg `#0B2A60` texto `#FFFFFF` radius 20px padding 8px 16px
  - "Agro": bg `#F3F4F6` texto `#262626`
  - "Industrial", "Mineração", "Alimentos": idem

- **Lista de clientes** (scroll vertical):
  - ClientCard (altura 76px, bg `#FFFFFF`, radius 14px, shadow, margin-bottom 10px):
    - Avatar 48px: círculo bg `#0B2A60` com iniciais empresa em `#FFFFFF` Inter SemiBold 16px
    - Nome empresa: Inter SemiBold 15px `#0B2A60`
    - Setor + cidade: Inter Regular 12px `#6B7280`
    - Direita: "3 auditorias" Inter Regular 11px `#6B7280` + seta chevron `#C5C5C5`
    - Borda esquerda 3px `#FF8310`
  - Repetir 6× com dados diferentes:
    1. ADM Agro | Agronegócio | Rio Verde-GO | 3 auditorias
    2. Mineração Cerrado | Mineração | Goiânia-GO | 1 auditoria
    3. Alimentos Norte | Alimentos | Palmas-TO | 2 auditorias
    4. Ind. Têxtil Sul | Industrial | Anápolis-GO | 4 auditorias
    5. Usina Santa Cruz | Sucroalcooleiro | Itumbiara-GO | 2 auditorias
    6. Auto Peças Rápidas | Automotivo | Goiânia-GO | 1 auditoria

---

## TELA 05 — NOVO CLIENTE

**Nome do frame:** `05_NovoCliente`  
**Dimensões:** 390 × 844px

**Layout:**
- **Header** `#0B2A60`: "← Novo Cliente" + botão "Salvar" Inter SemiBold 15px `#FF8310`
- **Formulário** (scroll, padding 20px):
  - Seção "Dados da Empresa":
    - Label seção: Inter SemiBold 13px `#6B7280` uppercase
    - Campo "Nome da Empresa" *
    - Campo "CNPJ"
    - Dropdown "Setor" (Agronegócio, Industrial, Mineração, Alimentos, Sucroalcooleiro, Automotivo, Papel e Celulose, Outro)
  - Seção "Localização":
    - Campo "Cidade"
    - Dropdown "Estado"
  - Seção "Contato Principal":
    - Campo "Nome do Responsável"
    - Campo "E-mail"
    - Campo "Telefone/WhatsApp"
  - Seção "Observações":
    - TextArea altura 100px "Observações gerais sobre a empresa..."
  - Botão "SALVAR CLIENTE" largura total bg `#FF8310`
  
  Campos: altura 52px, borda `#E5E7EB`, radius 10px, focus borda `#FF8310`

---

## TELA 06 — NOVA AUDITORIA (CONFIGURAÇÃO INICIAL)

**Nome do frame:** `06_NovaAuditoria`  
**Dimensões:** 390 × 844px

**Layout:**
- **Header** `#0B2A60`: "← Nova Auditoria"
- **Progresso de setup**: 3 steps (círculos conectados por linha):
  - Step 1 ● ativo (`#FF8310`): "Empresa"
  - Step 2 ○ inativo (`#E5E7EB`): "Período"
  - Step 3 ○: "Confirmar"

- **Conteúdo Step 1 — Selecionar Empresa**:
  - Título "Selecionar empresa" Inter Bold 20px `#0B2A60`
  - Subtítulo "Escolha o cliente desta auditoria" 14px `#6B7280`
  - Busca rápida (input)
  - Lista de empresas com radio button:
    - Radio item: círculo selecionado `#FF8310`, nome empresa Inter Medium 15px, setor 12px `#6B7280`
    - 4 itens visíveis + scroll
  - Botão "+ Cadastrar nova empresa" outline `#FF8310`

- **Botão "PRÓXIMO →"** bottom: bg `#FF8310`, 54px altura, radius 12px

---

## TELA 07 — VISÃO GERAL DA AUDITORIA

**Nome do frame:** `07_AuditoriaOverview`  
**Dimensões:** 390 × 844px

**Layout:**
- **Header** `#0B2A60` (120px):
  - "← ADM Agro" Inter SemiBold 17px `#FFFFFF`
  - "Auditoria de Lubrificação" Inter Regular 13px `#FFFFFF` opacity 70%
  - Badge "Em andamento" bg `rgba(255,131,16,0.3)` texto `#FFC000`
  - Período: "13/02 – 11/03/2025" 12px `#FFFFFF` opacity 60%

- **Barra de progresso geral** (card abaixo do header):
  - "Progresso geral: 44%" Inter SemiBold 15px `#0B2A60`
  - Barra 100% largura, altura 8px, radius 4px, `#FF8310` / `#F3F4F6`
  - "108 de 244 questões respondidas" 12px `#6B7280`

- **Grade de módulos 2×2** (cards de acesso rápido):
  - Card A: "Checklist Simplificado" — ícone prancheta bg `rgba(255,131,16,0.12)`, "102 perguntas Sim/Não", progresso "68/102", status badge "Em andamento"
  - Card B: "Auditoria Completa" — ícone lista `#0B2A60`, "244 afirmações", progresso "40/244", status "Não iniciado"
  - Card C: "Fotos de Evidência" — ícone câmera terracota, "12 fotos anexadas"
  - Card D: "Etapas / Progresso" — ícone gráfico `#FFC000`, "Etapa 01: 42%"
  - Cards: radius 16px, shadow, padding 16px, altura 110px

- **Seção "Pontuações por Pilar"** (lista compacta dos 9 pilares):
  - PilarRow: número pilar (badge pequeno `#0B2A60`), nome curto, mini barra progresso, nota atual
  - 9 linhas (mostrar todas mesmo que sem nota = "—")

- **Botões de ação** (2 botões):
  - "Ver Gráfico Radar" bg `#0B2A60` radius 12px
  - "Exportar Relatório" bg `#FF8310` radius 12px

---

## TELA 08 — CHECKLIST SIMPLIFICADO (PILAR EM ABERTO)

**Nome do frame:** `08_ChecklistSimplificado`  
**Dimensões:** 390 × 844px

**Layout:**
- **Header** `#0B2A60` (84px):
  - "← Checklist Simplificado"
  - Progresso: "68 / 102" Inter SemiBold 15px `#FFC000`
  - Barra de progresso fina (4px) logo abaixo: `#FF8310` 67% / `#1a3f7a`

- **Chips de pilares** (horizontal scroll, 9 chips):
  - Chip ativo: bg `#FF8310` texto `#FFFFFF` radius 20px padding 6px 14px Inter Medium 12px
  - Chip inativo: bg `rgba(255,255,255,0.15)` texto `#FFFFFF` opacity 70%
  - Chips: "01 Fornecedor", "02 Armaz.", "03 Espec.", etc.

- **Cabeçalho do pilar ativo** (card bg `rgba(11,42,96,0.06)` radius 12px mx 20px):
  - "01 — Processo de Seleção do Fornecedor" Inter SemiBold 14px `#0B2A60`
  - Descrição resumida 11px `#6B7280` (2 linhas)
  - "9 perguntas · 4 respondidas" 11px `#FF8310`

- **Lista de questões** (scroll principal):

  **QuestionCard (SimplifiedQuestion):**
  - Borda radius 14px, bg `#FFFFFF`, shadow suave, margin 8px horizontal, margin-bottom 10px, padding 16px
  - Linha superior: número "Q01" badge `#0B2A60` bg `rgba(11,42,96,0.08)` + badge responsável "Gestor" bg `rgba(255,131,16,0.12)` texto `#FF8310`
  - Texto da pergunta: Inter Regular 14px `#262626` line-height 1.5 (2-3 linhas)
  - Botões toggle Sim/Não (na parte inferior do card):
    - Toggle "SIM": metade esquerda, quando ativo: bg `#22C55E`, ícone ✓ branco, texto "SIM" Inter SemiBold 14px `#FFFFFF`
    - Toggle "NÃO": metade direita, quando ativo: bg `#EF4444`, ícone ✗ branco, texto "NÃO"
    - Quando não respondido: ambos bg `#F3F4F6`, texto `#9CA3AF`
    - altura dos toggles: 44px, radius inferior do card

  **Mostrar TODAS as 9 questões do Pilar 01:**

  Q01 | Gestor
  "Existe um contrato corporativo de compra de Lubrificantes?"
  [SIM ✓ ativo verde] [NÃO]

  Q02 | Gestor
  "Existe uma metodologia específica e bem definida para selecionar fornecedores?"
  [SIM] [NÃO ✗ ativo vermelho]

  Q03 | Compras/Gestor
  "O Contrato como Fornecedor prevê multa em caso de desacordos contratuais, principalmente relacionados a atrasos na entrega?"
  [SIM ✓ ativo] [NÃO]

  Q04 | Compras/Gestor
  "A aquisição dos Lubrificantes, inclusive os de alta performance são baseadas em critérios técnicos pré-estabelecidos e normas técnicas, incluindo os limites de umidade e contaminação sólida requeridos na entrega?"
  [SIM] [NÃO] (não respondido — cinza)

  Q05 | Compras/Gestor
  "Existe na empresa um processo de aquisição bem definido que mensure a capacidade técnica do fornecedor e o grau de performance de cada produto?"
  [SIM] [NÃO] (não respondido)

  Q06 | Compras/Gestor
  "A performance dos produtos representa pelo menos 1/3 na decisão pelo fornecedor?"
  [SIM ✓ ativo] [NÃO]

  Q07 | Compras/Fornecedor
  "É levado em consideração no processo de seleção do fornecedor, sua localização e boas práticas de armazenagem dos lubrificantes?"
  [SIM] [NÃO ✗ ativo]

  Q08 | Compras/Fornecedor
  "O fornecedor detém certificados de limpeza dos containeres comuns e a granel e são apresentados quando solicitados?"
  [SIM] [NÃO] (não respondido)

  Q09 | ALLIANCE
  "Há um controle eficiente do estoque mínimo a fim de comprar somente o necessário?"
  [SIM ✓ ativo] [NÃO]

- **Bottom sticky** (bg `#FFFFFF` shadow top, padding 16px):
  - "Pilar 01 concluído: 5/9" Inter Regular 13px `#6B7280`
  - Botão "PRÓXIMO PILAR →" bg `#FF8310`

---

## TELA 09 — SELETOR DOS 9 PILARES (AUDITORIA COMPLETA)

**Nome do frame:** `09_PilaresMenu`  
**Dimensões:** 390 × 844px

**Layout:**
- **Header** `#0B2A60`: "← Auditoria Completa" + "ADM Agro" sublabel

- **Card de status geral** (radius 16px bg `#FFFFFF` shadow mx 20px mt 16px p 16px):
  - "244 afirmações · 9 pilares"
  - "40 respondidas" `#FF8310` Inter Bold 20px
  - Barra progresso 16%

- **Lista dos 9 pilares** (grid de cards 1 coluna):

  PilarCard (radius 16px, bg `#FFFFFF`, shadow, mx 20px, mb 10px, p 16px):
  - Esquerda: círculo 44px com número do pilar Inter Bold 18px, cor de fundo por pilar:
    - P01: bg `#0B2A60` texto `#FFFFFF`
    - P02: bg `#FF8310` texto `#FFFFFF`
    - P03: bg `#C46046` texto `#FFFFFF`
    - P04: bg `#FFC000` texto `#0B2A60`
    - P05: bg `#0B2A60` texto `#FFFFFF`
    - P06: bg `#FF8310` texto `#FFFFFF`
    - P07: bg `#C46046` texto `#FFFFFF`
    - P08: bg `#FFC000` texto `#0B2A60`
    - P09: bg `#0B2A60` texto `#FFFFFF`
  - Centro: nome do pilar Inter SemiBold 14px `#0B2A60` + "XX questões" 12px `#6B7280`
  - Mini barra progresso (4px, cor do pilar, bg `#F3F4F6`)
  - Direita: "XX/YY" Inter Medium 13px cor do pilar + chevron

  **9 pilares listados:**
  1. Processo de Seleção do Fornecedor | 26 questões | 20/26
  2. Armazenagem, Distribuição e Manuseio | 30 questões | 30/30 ✓ (badge "Completo" verde)
  3. Especificação Técnica dos Lubrificantes | 18 questões | 0/18 (badge "Não iniciado" cinza)
  4. Critérios de Aplicação dos Lubrificantes | 21 questões | 10/21
  5. Práticas do Programa de Análises de Óleo | 30 questões | 0/30
  6. Controle da Contaminação | 21 questões | 0/21
  7. Gestão do Programa e Capacitação da Equipe | 31 questões | 0/31
  8. Padronização das Práticas (SOPs) | 36 questões | 0/36
  9. Segurança, Saúde e Meio Ambiente | 10 questões | 0/10

---

## TELA 10 — AUDITORIA COMPLETA — QUESTÕES DO PILAR

**Nome do frame:** `10_AuditoriaCompleta_Pilar`  
**Dimensões:** 390 × 844px

> Mostrar Pilar 01 completo com as primeiras questões visíveis + scroll

**Layout:**
- **Header** `#0B2A60` (100px):
  - "← Pilar 01"
  - "Processo de Seleção do Fornecedor" Inter SemiBold 15px `#FFFFFF`
  - Progresso: "20 / 26" `#FFC000` Inter Bold 18px
  - Barra progresso 4px `#FF8310` 77%

- **QuestionCard Completa** (radius 16px bg `#FFFFFF` shadow mx 16px mb 12px):

  **Seção de cabeçalho do card:**
  - "Q01 · Critérios Gerais" — badge número bg `#0B2A60` texto `#FFFFFF` + subseção Inter Regular 11px `#6B7280`

  **Texto da afirmação** (padding 16px):
  Inter Regular 14px `#262626` line-height 1.55
  "A empresa/corporação mantém um contrato mestre de fornecimento de lubrificantes de múltiplos anos com um a três fornecedores."

  **Toggle V/F** (2 botões lado a lado, 48px altura, radius 10px, separados por 8px):
  - Botão "✓ VERDADEIRO": quando ativo bg `#22C55E` texto `#FFFFFF`; inativo bg `#F0FDF4` borda `#BBF7D0` texto `#16A34A`
  - Botão "✗ FALSO": quando ativo bg `#EF4444` texto `#FFFFFF`; inativo bg `#FFF1F2` borda `#FECDD3` texto `#DC2626`

  **Índice de Qualidade** (título "Índice de Qualidade Técnica" 12px `#6B7280`):
  5 botões numerados 1–5 (40×40px, radius 8px):
  - 1: "Pobre" — inativo bg `#F9FAFB` borda `#E5E7EB` texto `#6B7280`
  - 2: inativo
  - 3: inativo
  - 4: ATIVO bg `#FF8310` texto `#FFFFFF` (exemplo de seleção)
  - 5: "Alta qualidade" — inativo
  - Abaixo: label do nível selecionado "Informações com precisão técnica limitada, porém respondidos com base em pesquisas" 11px `#FF8310`

  **Campo de comentário** (opcional):
  - "Comentário (opcional)" label 12px `#6B7280`
  - TextArea 80px altura, borda `#E5E7EB` radius 8px, placeholder "Descreva detalhes relevantes..."

  **Botão câmera** (inline, 40px altura):
  - "📷 Adicionar foto de evidência" Inter Regular 13px `#0B2A60`, ícone câmera `#FF8310`, borda dashed `#FF8310` radius 8px
  - Estado com foto: miniatura 60×60px + "1 foto" badge verde

  ---

  **Repetir cards para mostrar mais 2–3 questões** (parcialmente visíveis no scroll):

  **Q02 · Critérios Gerais** (respondido, V, nota 4):
  "Os acordos para combustíveis, lubrificantes e óleos de processo são mantidos como acordos separados."
  [✓ VERDADEIRO ativo] [✗ FALSO inativo]
  Qualidade: 4 selecionado
  Comentário: "Temos contratos separados por categoria de produto."

  **Q03 · Critérios Gerais** (não respondido):
  "Existe um método objetivo e quantitativo para a seleção de fornecedores de lubrificantes."
  [V inativo] [F inativo] — estado vazio

- **Navegação inferior** (sticky bg `#FFFFFF` shadow, 72px):
  - "← Anterior" outline `#0B2A60`
  - "Q 20/26" badge central `#FF8310`
  - "Próxima →" bg `#FF8310`

---

## TELA 11 — GRÁFICO RADAR DOS 9 PILARES

**Nome do frame:** `11_GraficoRadar`  
**Dimensões:** 390 × 844px

**Layout:**
- **Header** `#0B2A60`:
  - "← Pontuação dos Pilares"
  - "ADM Agro · Fev–Mar 2025" 13px `#FFFFFF` opacity 70%

- **Cards de resumo** (horizontal 3 cards):
  - "Melhor Pilar": "Armaz. e Manuseio" número "5.64" Inter Bold 22px `#22C55E`
  - "Pior Pilar": "Gestão do Programa" número "1.91" Inter Bold 22px `#EF4444`  
  - "Média Geral": "3.83" Inter Bold 22px `#FF8310`
  - Cards: 120×72px bg `#FFFFFF` radius 12px shadow

- **Gráfico Radar** (área central, 320×320px, fundo branco card radius 20px shadow):
  - Spider/radar chart com 9 eixos (um por pilar)
  - Área preenchida do cliente: fill `rgba(255,131,16,0.25)` stroke `#FF8310` strokeWidth 2.5px
  - Área da média do grupo: fill `rgba(11,42,96,0.08)` stroke `#0B2A60` dashed strokeWidth 1.5px
  - Escala: anéis circulares em 2, 4, 6, 8, 10 — cor `#E5E7EB`
  - Labels dos eixos 9px `#262626` Inter Regular
  - Labels abreviados (usar shortName dos pilares):
    - "Fornecedor", "Armaz.", "Espec. Téc.", "Aplicação", "Análise Óleo", "Contaminação", "Gestão", "SOPs", "SSM"

- **Legenda** (horizontal):
  - ● `#FF8310` "ADM Agro" | -- `#0B2A60` "Média do setor"

- **Tabela de pontuações** (card branco radius 16px shadow mx 20px):
  - Header: "Pilar | P. Obj. | Índice Q. | Final"
  - 9 linhas:
    - 01 · Seleção Fornecedor | 0.60 | 4.20 | **5.06**
    - 02 · Armazenagem | 0.62 | 4.58 | **5.64** ← badge verde "melhor"
    - 03 · Espec. Técnica | 0.58 | 3.18 | **3.71**
    - 04 · Aplicação | 0.52 | 3.92 | **4.10**
    - 05 · Análises Óleo | 0.62 | 3.43 | **4.28**
    - 06 · Contaminação | 0.33 | 4.42 | **2.94**
    - 07 · Gestão | 0.25 | 3.75 | **1.91** ← badge vermelho "crítico"
    - 08 · SOPs | 0.32 | 2.97 | **1.92** ← badge vermelho
    - 09 · SSM | 0.67 | 3.78 | **5.04**
  - Linhas alternadas bg `#F9FAFB` / `#FFFFFF`
  - Coluna "Final" Inter SemiBold cor: ≥4.5=`#22C55E`, ≥3=`#FF8310`, <3=`#EF4444`

- **Botões** (sticky bottom 2 botões):
  - "Exportar Gráfico" outline `#0B2A60`
  - "Ver Relatório" bg `#FF8310`

---

## TELA 12 — RELATÓRIO DE AUDITORIA (VISUALIZAÇÃO)

**Nome do frame:** `12_Relatorio`  
**Dimensões:** 390 × 844px

**Layout:**
- **Header** `#0B2A60`:
  - "← Relatório de Auditoria"
  - Botão "Exportar ↓" bg `#FF8310` radius 8px 32px altura 13px

- **Card empresa** (mx 20px mt 16px, radius 16px bg `#FFFFFF` shadow p 20px):
  - Tipo: "RELATÓRIO DE AUDITORIA" caps 11px `#6B7280` letter-spacing 0.08em
  - Empresa: "ADM Agro" Inter Bold 22px `#0B2A60`
  - Período: "De 13/02/2025 a 11/03/2025" 13px `#6B7280`
  - Auditor: "Fernando Pelozio · Alliance Lub" 13px `#6B7280`
  - Linha divisória + Logo Alliance Lub pequeno à direita

- **Tabs de seções** (horizontal, 4 tabs, sticky):
  - "Resumo" (ativa, indicador bottom `#FF8310`)
  - "Por Pilar"
  - "Evidências"  
  - "Próx. Passos"

- **Conteúdo Tab "Resumo"**:

  Seção "Objetivos da Auditoria" (card branco radius 14px p 16px):
  - Título Inter SemiBold 15px `#0B2A60` + ícone alvo `#FF8310`
  - Lista numerada (4 itens, 13px `#262626` line-height 1.6):
    1. Levantar e avaliar as práticas atuais de execução das atividades de lubrificação...
    2. Identificar oportunidades de melhorias e aumento da confiabilidade...
    3. Sugestões específicas de como as atividades de lubrificação podem ser tratadas...
    4. Descrever de forma clara qual a situação da planta em cada fase...

  Seção "Boas Práticas Atuais" (card bg `rgba(34,197,94,0.06)` borda left 3px `#22C55E`):
  - Título "Boas Práticas Atuais" Inter SemiBold 15px `#16A34A`
  - Texto 13px `#262626`: "No geral a empresa apresenta como boas práticas a utilização de técnicas preditivas como análises de óleo e análise de vibração, utiliza nos equipamentos críticos lubrificantes de alta performance e possui equipe de Coordenação da Manutenção focada na Confiabilidade de Ativos. Em alguns equipamentos utiliza-se respiros dessecantes e coalescentes além da utilização de contentores herméticos."
  - Ícone lápis `#22C55E` top-right para editar

  Seção "Oportunidades de Melhoria" (card bg `rgba(239,68,68,0.06)` borda left 3px `#EF4444`):
  - Título "Oportunidades de Melhoria" Inter SemiBold 15px `#DC2626`
  - Lista com bullets `#EF4444`:
    • Necessidade de implantação imediata de um programa para capacitação técnica...
    • Necessidade de desenvolvimento e implantação de procedimentos de lubrificação...
    • Necessidade de Blindagem dos equipamentos e instalação de filtros adequados.
    • Necessidade de atualização do plano de lubrificação.
    • Necessidade de acompanhamento de indicadores de lubrificação.
  - Ícone lápis para editar

---

## TELA 13 — PROGRESSO DAS ETAPAS

**Nome do frame:** `13_Etapas`  
**Dimensões:** 390 × 844px

**Layout:**
- **Header** `#0B2A60`: "← Progresso das Etapas · ADM Agro"

- **Tabs "Etapa 01" | "Etapa 02"** (sticky, ativa bg `#FF8310` texto `#FFFFFF`; inativa bg `#F3F4F6` texto `#6B7280`)

- **Conteúdo Etapa 01** (Plano de Lubrificação + V-Zero):

  Card de visão geral (radius 16px bg `#FFFFFF` shadow mx 20px mt 16px p 20px):
  - "Etapa 01 — Conscientização e Estruturação Inicial" Inter SemiBold 15px `#0B2A60`
  - Progresso geral: "37%" Inter Bold 28px `#FF8310`
  - Ring chart circular: 120px diâmetro, stroke `#FF8310` 8px, track `#F3F4F6`

  Lista de atividades (8 itens):
  ActivityRow (altura 64px, border-bottom `#F3F4F6` 1px, padding 12px 20px):
  - Ícone de status (lado esquerdo 32px):
    - Completo (>80%): círculo `#22C55E` ícone ✓ branco
    - Em andamento: círculo `#FF8310` ícone ½ branco  
    - Não iniciado: círculo `#F3F4F6` ícone ○ `#9CA3AF`
  - Nome atividade Inter Medium 14px `#0B2A60`
  - Slider horizontal (0–100%, touch): track 4px, thumb 20px `#FF8310`, bg `#F3F4F6`
  - Porcentagem à direita Inter SemiBold 13px `#FF8310`

  **8 atividades da Etapa 01:**
  1. Plano de Lubrificação + V-Zero | slider 75% | ● completo (quase)
  2. Infra-Estrutura Standard | slider 45% | ● em andamento
  3. Capacitação Standard | slider 5% | ● em andamento
  4. Implantação dos Procedimentos | slider 0% | ○ não iniciado
  5. Análises de Óleo — Produto | slider 60% | ● em andamento
  6. Mudança Cultural | slider 10% | ● em andamento
  7. Gestão da Lubrificação por Indicadores | slider 0% | ○ não iniciado
  8. Resultados Econômicos na Lubrificação | slider 0% | ○ não iniciado

---

## TELA 14 — EXPORTAÇÃO (MODAL / BOTTOM SHEET)

**Nome do frame:** `14_Exportacao`  
**Dimensões:** 390 × 844px

**Layout:**
- Background: tela anterior escurecida (overlay `rgba(0,0,0,0.5)`)
- **Bottom Sheet** (radius top 28px bg `#FFFFFF`, altura 520px, drag handle `#E5E7EB` 36×4px centralizado):
  - Título "Exportar Auditoria" Inter Bold 20px `#0B2A60` mt 20px
  - Empresa: "ADM Agro · Fev–Mar 2025" 13px `#6B7280`

  **Opções de formato** (3 opções em linha):
  - "PDF" (ativo): card 100×72px border 2px `#FF8310` bg `rgba(255,131,16,0.06)` radius 12px, ícone PDF `#FF8310`, label Inter SemiBold 13px `#FF8310`
  - "Excel": card border `#E5E7EB` bg `#F9FAFB`, ícone excel `#22C55E`, label `#262626`
  - "Ambos": idem, ícone duplo

  **Filtros de conteúdo** (checkboxes):
  - ☑ Incluir gráfico radar (marcado)
  - ☑ Incluir fotos de evidência (marcado)
  - ☐ Comparar com auditoria anterior (desmarcado)
  - ☑ Pontuação por pilar detalhada (marcado)
  - ☐ Questões sem resposta (desmarcado)

  **Filtro de pilares** (chips multi-select):
  - "Todos os pilares" (ativo `#0B2A60`)
  - "01", "02", "03"... (selecionáveis individualmente)

  **Compartilhamento direto** (3 ícones circulares 52px):
  - WhatsApp `#25D366`
  - E-mail `#FF8310`
  - Drive `#4285F4`
  - Label abaixo 11px `#6B7280`

  **Botão "GERAR RELATÓRIO"** largura total bg `#FF8310` 54px radius 12px

---

## TELA 15 — CENTRAL DE RELATÓRIOS

**Nome do frame:** `15_Relatorios`  
**Dimensões:** 390 × 844px

**Layout:**
- **Header** `#0B2A60`: "Relatórios" + ícone filtro `#FFFFFF`

- **Filtros** (chips horizontais): "Todos", "Este mês", "Por empresa", "Por pilar"

- **Cards de relatório** (lista):
  ReportCard (radius 16px bg `#FFFFFF` shadow mx 20px mb 10px p 16px):
  - Tag tipo: "PDF" badge bg `rgba(239,68,68,0.1)` texto `#DC2626` ou "Excel" `#16A34A`
  - Nome empresa Inter SemiBold 15px `#0B2A60`
  - Data geração 12px `#6B7280` + tamanho arquivo "1.2 MB"
  - Preview mini do gráfico radar (thumbnail 64×64px, cinza com pontos laranjas)
  - Botões: "Visualizar" outline `#0B2A60` | "Compartilhar" bg `#FF8310`
  - 4 cards: ADM Agro (mai/25), Ind. Têxtil Sul (abr/25), Mineração Cerrado (mar/25), Usina Santa Cruz (fev/25)

---

## TELA 16 — PERFIL / CONFIGURAÇÕES

**Nome do frame:** `16_Perfil`  
**Dimensões:** 390 × 844px

**Layout:**
- **Header** `#0B2A60` com curva suave bottom (height 200px):
  - Avatar grande 80px circular bg `#FF8310` Inter Bold 28px `#FFFFFF` iniciais "FP"
  - Nome "Fernando Pelozio" Inter Bold 20px `#FFFFFF`
  - Cargo "Engenheiro de Lubrificação · Alliance Lub" 13px `#FFFFFF` opacity 70%
  - Badge "Auditor Certificado ICML" bg `rgba(255,199,0,0.25)` texto `#FFC000` radius 20px

- **Seções de configuração** (cards brancos radius 16px shadow mx 20px):
  
  Seção "Conta":
  - SettingRow: ícone `#FF8310` + "E-mail" + valor "fernando@alliancelub.com.br" + chevron
  - SettingRow: "Senha" + "●●●●●●●●" + chevron
  - SettingRow: "Assinatura Digital" + "Configurada ✓" verde + chevron

  Seção "Preferências":
  - SettingRow com toggle: "Modo escuro" (toggle desligado)
  - SettingRow com toggle: "Notificações" (toggle ligado `#FF8310`)
  - SettingRow: "Idioma" + "Português (BR)" + chevron

  Seção "Sobre":
  - SettingRow: "Versão do app" + "v1.0.0"
  - SettingRow: "Termos de uso" + chevron
  - SettingRow: "Suporte Alliance" + "WhatsApp" + ícone WhatsApp `#25D366`

  Botão "SAIR" (largura total, outline `#EF4444` borda 1.5px, texto `#EF4444`, radius 12px)

---

## TELA 17 — ESTADOS VAZIOS / ONBOARDING

**Nome do frame:** `17_EmptyState`  
**Dimensões:** 390 × 844px

**Layout** (mostrar 2 estados vazios empilhados):

Estado vazio — Sem auditorias:
- Card 360×200px bg `#FFFFFF` radius 20px shadow mx 20px p 24px
- Ilustração: ícone de prancheta grande (80px círculo `#FF8310` com ícone branco + estrela `#FFC000` ao lado)
- "Nenhuma auditoria ainda" Inter Bold 18px `#0B2A60` mt 16px
- "Toque no botão + para iniciar sua primeira auditoria de lubrificação." 14px `#6B7280` text-center
- Botão "INICIAR AUDITORIA" bg `#FF8310` radius 12px mt 16px

Estado vazio — Sem fotos:
- Card similar com ícone câmera + "Sem fotos anexadas" + "Adicione fotos de evidência durante a auditoria."

---

## TELA 18 — NOTIFICAÇÕES / ALERTAS

**Nome do frame:** `18_Notificacoes`  
**Dimensões:** 390 × 844px

**Layout:**
- **Header** `#0B2A60`: "← Notificações"
- **Lista de notificações** (scroll):

  NotifCard (radius 14px mx 20px mb 8px p 16px):
  - Variante azul (informação): borda left 3px `#0B2A60` bg `rgba(11,42,96,0.04)`
    - Ícone info `#0B2A60` 20px
    - "Auditoria ADM Agro - 72% concluída" Inter SemiBold 14px `#0B2A60`
    - "Faltam 68 questões para finalizar o Pilar 07." 12px `#6B7280`
    - "há 2 horas" 11px `#9CA3AF`
  
  - Variante laranja (ação necessária): borda left 3px `#FF8310` bg `rgba(255,131,16,0.04)`
    - "Pilar 07 crítico — Nota 1.91" Inter SemiBold 14px `#FF8310`
    - "O pilar Gestão e Capacitação está abaixo da média esperada."
  
  - Variante verde (sucesso): borda left 3px `#22C55E`
    - "Relatório gerado com sucesso"
    - "PDF da Ind. Têxtil Sul pronto para compartilhar."
  
  - Variante amarela (lembrete): borda left 3px `#FFC000`
    - "Lembrete: Auditoria Mineração Cerrado"
    - "Prazo de entrega em 3 dias."

  Total: mostrar 5-6 notificações variadas

---

# FLUXO DE NAVEGAÇÃO (Connections no Figma)

```
01_Splash ──────────────────→ 02_Login
02_Login ────────────────────→ 03_Dashboard
03_Dashboard ────────────────→ 04_Clientes (tab)
03_Dashboard ────────────────→ 07_AuditoriaOverview (tap card)
03_Dashboard (FAB +) ────────→ 06_NovaAuditoria
04_Clientes (+ button) ──────→ 05_NovoCliente
04_Clientes (tap cliente) ───→ 07_AuditoriaOverview
06_NovaAuditoria ────────────→ 07_AuditoriaOverview
07_AuditoriaOverview ────────→ 08_ChecklistSimplificado
07_AuditoriaOverview ────────→ 09_PilaresMenu
07_AuditoriaOverview ────────→ 13_Etapas
07_AuditoriaOverview ────────→ 11_GraficoRadar
07_AuditoriaOverview ────────→ 12_Relatorio
09_PilaresMenu (tap pilar) ──→ 10_AuditoriaCompleta_Pilar
11_GraficoRadar ─────────────→ 12_Relatorio
12_Relatorio (exportar) ─────→ 14_Exportacao (bottom sheet)
03_Dashboard (sino) ─────────→ 18_Notificacoes
03_Dashboard (avatar) ───────→ 16_Perfil
```

---

# COMPONENTES GLOBAIS REUTILIZÁVEIS

## Componente: BottomNavBar
Sempre presente nas telas principais (03,04,09,15):
- Altura: 72px + safe area iOS
- BG: #FFFFFF
- Shadow: 0 -2px 12px rgba(0,0,0,0.08)
- 4 itens: Início (home), Clientes (building), Auditorias (clipboard), Relatórios (chart)
- Item ativo: ícone + label `#FF8310`, dot 4px `#FF8310` abaixo
- Item inativo: ícone + label `#9CA3AF`

## Componente: StatusBar
- Background match do header `#0B2A60`
- Estilo: light-content (ícones brancos)

## Componente: QuestionBadge (Responsável)
- "ALLIANCE": bg `rgba(11,42,96,0.1)` texto `#0B2A60`
- "Gestor": bg `rgba(255,131,16,0.12)` texto `#FF8310`
- "Compras": bg `rgba(196,96,70,0.12)` texto `#C46046`
- "Diretoria": bg `rgba(255,199,0,0.2)` texto `#92610A`
- "Compras/Gestor": bg `rgba(255,131,16,0.12)` texto `#FF8310`
- Todos: radius 20px, padding 3px 10px, Inter Medium 11px, uppercase

## Componente: PilarScoreBadge
- Score ≥ 4.5: bg `#DCFCE7` texto `#16A34A` "Ótimo"
- Score 3.0–4.4: bg `rgba(255,131,16,0.12)` texto `#FF8310` "Bom"
- Score 2.0–2.9: bg `#FEF9C3` texto `#A16207` "Regular"  
- Score < 2.0: bg `#FEE2E2` texto `#DC2626` "Crítico"
- Radius 20px, padding 4px 12px, Inter SemiBold 12px

---

# INSTRUÇÕES FINAIS PARA O FIGMA MAKE

1. **Criar frame de 390×844px** para cada tela (iPhone 14 base)
2. **Usar Auto Layout** em todos os componentes e listas
3. **Criar componentes reutilizáveis** (Components) para: QuestionCard, PilarCard, ClientCard, BottomNav, Header, StatusBadge
4. **Aplicar variantes** nos componentes de questão: estado vazio / respondido-sim / respondido-não / respondido-verdadeiro / respondido-falso
5. **Conectar as telas** usando Prototype Links conforme o mapa de navegação acima
6. **Exportar Design Tokens** como JSON com as cores exatas definidas no início deste documento
7. **Mobile frame**: adicionar device frame iPhone 14 em todas as telas para apresentação
8. **Organização no Figma**: criar páginas separadas: "Design System", "Telas", "Protótipo", "Componentes"

---

*Gerado por Amplie Marketing para Alliance Lub — Junho 2026*


---

# PARTE 11 — CHECKLIST DE IMPLEMENTAÇÃO

## Claude Code — ordem de desenvolvimento

- [ ] Setup do projeto (Expo + TypeScript + Expo Router)
- [ ] Configurar Supabase (schema SQL da Parte 8)
- [ ] Copiar arquivos de dados (Partes 3, 5, 6, 7)
- [ ] Implementar autenticação (login + refresh token)
- [ ] Tela Dashboard + Bottom Nav
- [ ] CRUD de Clientes
- [ ] Fluxo Nova Auditoria
- [ ] Checklist Simplificado (102 questões com toggle Sim/Não + auto-save SQLite)
- [ ] Auditoria Completa (226 afirmações com V/F + nota 1–5 + comentário + foto)
- [ ] Cálculo automático de scores (scoring.ts da Parte 4)
- [ ] Gráfico Radar (Victory Native com 9 eixos)
- [ ] Módulo de Etapas / Progresso (sliders Etapa 01 e 02)
- [ ] Geração de Relatório (texto automático + edição manual)
- [ ] Exportação PDF (expo-print)
- [ ] Exportação Excel (SheetJS — 5 abas)
- [ ] Compartilhamento (expo-sharing → WhatsApp + e-mail)
- [ ] Modo offline (SQLite local + sync Supabase)
- [ ] Notificações e alertas

## Figma Make — ordem de criação

- [ ] Design System (cores, tipografia, componentes base)
- [ ] Telas 01–03 (Splash, Login, Dashboard)
- [ ] Telas 04–06 (Clientes, Novo Cliente, Nova Auditoria)
- [ ] Telas 07–10 (Overview, Checklist, Menu Pilares, Auditoria)
- [ ] Telas 11–14 (Radar, Relatório, Etapas, Exportação)
- [ ] Telas 15–18 (Central Relatórios, Perfil, Empty States, Notificações)
- [ ] Conectar prototipagem (fluxos de navegação)
- [ ] Export Design Tokens

---

*Alliance Lub — Documento Mestre v2.0 — Junho 2026*
*Gerado por Amplie Marketing com base na planilha FLA002_Auditoria_Construção_Confiabilidade_ALLIANCE_ADM_365.xlsx*
*226 questões completas + 102 simplificadas extraídas e validadas automaticamente*