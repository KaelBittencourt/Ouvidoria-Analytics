# 📊 Ouvidoria Analytics

O **Ouvidoria Analytics** é um painel analítico moderno e de alta performance desenvolvido para otimizar a gestão, acompanhamento e análise das manifestações recebidas pela ouvidoria. A plataforma centraliza dados de reclamações, elogios, sugestões e solicitações, oferecendo visualizações gráficas ricas, categorização e análise de sentimento em tempo real.

![React](https://img.shields.io/badge/React-19-blue?style=for-the-badge&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?style=for-the-badge&logo=typescript)
![Vite](https://img.shields.io/badge/Vite-7.x-purple?style=for-the-badge&logo=vite)
![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-v4-38B2AC?style=for-the-badge&logo=tailwindcss)
![TanStack Start](https://img.shields.io/badge/TanStack%20Start-v1-FF4154?style=for-the-badge&logo=react)

---

## 🌟 Principais Recursos

- 📊 **Painel Operacional (KPIs)**: Acompanhamento de métricas cruciais, como o total de chamados ativos, volume de atendimentos do mês corrente, manifestações dos últimos 30 dias com média diária, além de contagem de usuários únicos.
- 🔄 **Sincronização Contínua**: Integração direta com planilhas públicas do Google Sheets, consumindo dados instantaneamente por meio de polling automático a cada 60 segundos ou recarga forçada no painel.
- 📈 **Gráficos Dinâmicos (Recharts)**:
  - **Tendência de Volume**: Gráficos de linha e área para análise diária, mensal e anual de chamados.
  - **Identificação de Gargalos**: Distribuição de volume por dia da semana e faixa horária do dia.
  - **Divisão Qualitativa**: Quebras visuais em gráficos de pizza para categorização de demandas e análise de sentimento (Positivo, Neutro, Negativo).
- 🔍 **Filtros e Busca Avançada**: Busca textual por nome, telefone, e-mail ou mensagem, combinada com seletores de período (Hoje, 7 dias, 30 dias, Mês Atual, Ano Atual, Meses Específicos e Períodos Personalizados).
- 📋 **Gestão de Demandas**: Tabela dinâmica de manifestações integrada com modal de visualização detalhada da mensagem do paciente/usuário, com suporte à exportação e formatação elegante de dados.
- 👤 **Tratamento de Dados**: Lógica automatizada para tratamento de nomes em português, conversão de e-mails para minúsculas, padronização de telefones e tratamento automático de anonimato.

---

## 🛠️ Stack Tecnológica

O projeto foi construído utilizando as ferramentas mais modernas do ecossistema React:

- **Core**: [React 19](https://react.dev/) & [TypeScript](https://www.typescriptlang.org/)
- **Framework & Roteamento**: [TanStack Start v1](https://tanstack.com/router/v1/docs/start/overview) (Roteamento baseado em arquivos com SSR robusto)
- **Estilização**: [Tailwind CSS v4](https://tailwindcss.com/) & [Radix UI primitives](https://www.radix-ui.com/)
- **Visualização de Dados**: [Recharts](https://recharts.org/)
- **Manipulação de Planilhas**: [PapaParse](https://www.papaparse.com/) (Parser rápido para conversão de CSV)
- **Componentes & Notificações**: [Lucide React](https://lucide.dev/) (Ícones) & [Sonner](https://sonner.dev/) (Toasts premium)

---

## 📁 Estrutura do Projeto

Abaixo está o layout simplificado das principais pastas do projeto:

```text
├── src/
│   ├── components/       # Componentes reutilizáveis (Tabelas, Modais, Gráficos)
│   │   ├── dashboard/    # Componentes específicos do painel analítico
│   │   └── ui/           # Componentes base e primitivos de design (Shadcn/Radix)
│   ├── hooks/            # Hooks customizados para controle de estado, tema e autenticação
│   ├── lib/              # Lógica de integração (CSV do Sheets, classificação de sentimentos)
│   ├── routes/           # Rotas baseadas em arquivos controladas pelo TanStack Router
│   │   ├── index.tsx     # Página principal (Dashboard)
│   │   ├── login.tsx     # Página de Login
│   │   └── __root.tsx    # Layout global do app (Shell)
│   ├── server.ts         # Entrada do servidor para renderização SSR
│   ├── start.ts          # Inicialização do cliente TanStack Start
│   └── styles.css        # Configurações do Tailwind CSS e CSS global
├── vite.config.ts        # Configuração do Vite e plugins do ecossistema
└── package.json          # Manifesto do projeto e dependências instaladas
```

---

## 🚀 Como Executar o Projeto Localmente

### Pré-requisitos
Certifique-se de ter o [Node.js](https://nodejs.org/) instalado na versão 18 ou superior.

### 1. Clonar o Repositório e Instalar Dependências
```bash
# Clonar o repositório
git clone https://github.com/KaelBittencourt/Ouvidoria-Analytics.git

# Acessar a pasta
cd Ouvidoria-Analytics

# Instalar dependências
npm install
# ou caso utilize o bun
bun install
```

### 2. Configurar a Fonte de Dados (Google Sheets)
Os dados são lidos a partir de uma planilha do Google Sheets publicada na Web em formato CSV.
Para vincular a sua própria planilha:
1. Crie uma planilha no Google Sheets com as seguintes colunas (a primeira linha deve ser o cabeçalho):
   - **Coluna A**: Carimbo de data/hora (Timestamp no formato `dd/mm/aaaa hh:mm:ss`)
   - **Coluna B**: Nome do Manifestante
   - **Coluna C**: Telefone
   - **Coluna D**: E-mail
   - **Coluna E**: Descrição/Mensagem da Manifestação
2. Vá em `Arquivo` > `Compartilhar` > `Publicar na Web`.
3. Escolha publicar o documento inteiro ou apenas a página atual no formato **Valores separados por vírgula (.csv)**.
4. Abra o arquivo [src/lib/sheet.ts](file:///src/lib/sheet.ts) e altere a constante `SHEET_ID` para o ID da sua planilha publicada:
   ```typescript
   const SHEET_ID = "SEU_SHEET_ID_AQUI";
   ```

### 3. Executar o Servidor de Desenvolvimento
```bash
npm run dev
# ou
bun dev
```
O servidor será inicializado localmente. Abra [http://localhost:5173](http://localhost:5173) no seu navegador para ver o painel em execução.

### 4. Compilar para Produção (Build)
Para gerar os arquivos estáticos e otimizados para produção:
```bash
npm run build
```
Para testar a versão de produção localmente após o build:
```bash
npm run preview
```

---

## 📄 Licença

Este projeto está sob a licença MIT. Sinta-se livre para clonar, modificar e utilizar o painel de acordo com as necessidades da sua instituição.
