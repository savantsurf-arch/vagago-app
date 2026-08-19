# 🚗 VagaGo

### Encontre, reserve e gerencie vagas de estacionamento de forma simples, rápida e segura.

O **VagaGo** é uma plataforma de gerenciamento e reserva de vagas de estacionamento que conecta **motoristas** a **proprietários de vagas e garagens**.

A proposta é transformar espaços de estacionamento disponíveis em uma fonte de renda para seus proprietários, enquanto oferece aos motoristas uma maneira prática de encontrar, comparar e reservar uma vaga.

---

## 📌 Sobre o projeto

O VagaGo foi desenvolvido com foco em uma experiência moderna, simples e intuitiva para:

* 🔎 Encontrar vagas próximas
* 📍 Visualizar vagas no mapa
* 🚗 Cadastrar veículos
* 📅 Reservar vagas
* 💳 Gerenciar pagamentos
* 🎫 Utilizar cupons de desconto
* 📱 Gerar QR Code para reservas
* 💰 Gerenciar ganhos dos proprietários
* 💸 Solicitar saques
* ⭐ Avaliar experiências
* 📊 Acompanhar informações e métricas

O projeto possui estrutura preparada para funcionar como uma plataforma **SaaS/Marketplace**, permitindo a expansão para diferentes cidades e regiões.

---

## ✨ Principais funcionalidades

### 👤 Usuários

* Cadastro e gerenciamento de usuários
* Diferentes tipos de perfil
* Informações de contato
* Avatar
* Sistema de créditos
* Código de indicação
* Status da conta

### 🚘 Veículos

Cada usuário pode cadastrar seus veículos, incluindo:

* Marca
* Modelo
* Placa
* Cor
* Tipo do veículo
* Veículo principal

### 🅿️ Vagas de estacionamento

Os proprietários podem cadastrar suas vagas com informações como:

* Nome da vaga
* Descrição
* Endereço
* Cidade
* Estado
* Bairro
* CEP
* Coordenadas geográficas
* Fotos
* Características
* Tipos de veículos permitidos
* Tamanho da vaga
* Se é coberta
* Limite de altura
* Regras de utilização
* Horários disponíveis
* Preço por hora
* Preço diário
* Preço mensal
* Avaliação
* Disponibilidade

### 📅 Reservas

O sistema possui estrutura para gerenciamento completo das reservas:

* Número da reserva
* Usuário
* Vaga
* Proprietário
* Data
* Horário inicial
* Horário final
* Quantidade de horas
* Subtotal
* Taxa da plataforma
* Valor destinado ao proprietário
* Desconto
* Valor total
* Método de pagamento
* Status do pagamento
* Status da reserva
* QR Code
* Check-in
* Check-out

### 🎟️ Cupons

Sistema de cupons com:

* Código promocional
* Percentual de desconto
* Desconto máximo
* Data de validade
* Quantidade de utilizações
* Status

### 💰 Saques

Os proprietários podem possuir uma estrutura de recebimento com:

* Valor disponível
* Chave PIX
* Solicitação de saque
* Status da solicitação
* Data da solicitação

---

## 🗺️ Mapa e localização

O VagaGo utiliza **Leaflet** e **React Leaflet** para trabalhar com mapas e localização das vagas.

A estrutura permite apresentar as vagas de maneira visual e facilitar a descoberta de estacionamentos próximos ao usuário.

---

## 🧱 Tecnologias utilizadas

### Front-end

* React 19
* Vite
* Tailwind CSS
* React Leaflet
* Leaflet
* Lucide React
* Recharts
* QRCode React
* Canvas Confetti

### Back-end / Banco de dados

* Supabase
* PostgreSQL
* Supabase JavaScript Client
* Row Level Security (RLS)

### Ferramentas

* Node.js
* npm
* Vite
* Oxlint
* Git
* GitHub

---

## 📂 Estrutura do projeto

```text
vagago-app/
├── public/
├── src/
├── .env
├── .env.example
├── .gitignore
├── index.html
├── package.json
├── package-lock.json
├── server.js
├── start-vagago.bat
├── start-vagago.ps1
├── supabase_schema.sql
├── test_supabase.js
├── vercel.json
├── vite.config.js
└── README.md
```

---

## ⚙️ Requisitos

Antes de iniciar o projeto, tenha instalado:

* Node.js
* npm
* Git
* Uma conta no Supabase

---

## 🚀 Instalação

Clone o repositório:

```bash
git clone https://github.com/savantsurf-arch/vagago-app.git
```

Entre na pasta:

```bash
cd vagago-app
```

Instale as dependências:

```bash
npm install
```

---

## 🔐 Configuração das variáveis de ambiente

Crie um arquivo `.env` na raiz do projeto.

Utilize o `.env.example` como referência.

Exemplo:

```env
VITE_SUPABASE_URL=sua_url_do_supabase
VITE_SUPABASE_ANON_KEY=sua_chave_anon
```

> ⚠️ Nunca publique chaves privadas, tokens ou credenciais sensíveis no GitHub.

---

## 🗄️ Configuração do Supabase

O projeto possui o arquivo:

```text
supabase_schema.sql
```

Esse arquivo contém a estrutura inicial do banco de dados do VagaGo.

Entre no **SQL Editor do Supabase**, execute o conteúdo do arquivo e configure o projeto.

A estrutura atual inclui tabelas para:

```text
users
vehicles
parking_spaces
bookings
withdrawals
coupons
```

O banco também possui configuração de **Row Level Security (RLS)** para controle de acesso aos dados.

---

## ▶️ Executando o projeto

Para iniciar o ambiente de desenvolvimento:

```bash
npm run dev
```

Depois, acesse o endereço exibido pelo Vite no terminal.

Normalmente:

```text
http://localhost:5173
```

---

## 🏗️ Build de produção

Para gerar a versão de produção:

```bash
npm run build
```

Para visualizar o build localmente:

```bash
npm run preview
```

---

## 🧹 Verificação de código

O projeto utiliza Oxlint.

Execute:

```bash
npm run lint
```

---

## 🖥️ Inicialização no Windows

O projeto também possui scripts auxiliares:

```text
start-vagago.bat
start-vagago.ps1
```

Eles podem facilitar a inicialização do projeto em ambientes Windows.

---

## 🔄 Fluxo básico da plataforma

```text
              ┌─────────────────┐
              │     USUÁRIO     │
              └────────┬────────┘
                       │
                       ▼
              🔎 Busca uma vaga
                       │
                       ▼
              📍 Visualiza no mapa
                       │
                       ▼
              🅿️ Escolhe a vaga
                       │
                       ▼
              📅 Faz a reserva
                       │
                       ▼
              💳 Realiza pagamento
                       │
                       ▼
              📱 Recebe QR Code
                       │
                       ▼
              🚗 Utiliza a vaga
                       │
                       ▼
              ⭐ Avalia experiência
```

---

## 💼 Modelo de negócio

O VagaGo foi pensado como um **marketplace de vagas de estacionamento**.

A plataforma pode gerar receita através de:

* Taxa sobre reservas
* Taxa de serviço
* Planos para proprietários
* Destaque de vagas
* Publicidade
* Sistema de indicação
* Serviços adicionais

A estrutura de reservas já contempla o conceito de **taxa da plataforma** e **repasse ao proprietário**.

---

## 🎯 Objetivo

O objetivo do VagaGo é facilitar o estacionamento em áreas urbanas e, ao mesmo tempo, permitir que proprietários monetizem espaços que permanecem ociosos.

### Para quem procura uma vaga

> Encontre uma vaga antes de chegar ao destino.

### Para quem possui uma vaga

> Transforme um espaço parado em renda.

---

## 🛣️ Roadmap

### 🚧 Em desenvolvimento

* [ ] Sistema completo de autenticação
* [ ] Recuperação de senha
* [ ] Busca avançada de vagas
* [ ] Filtros por preço e características
* [ ] Geolocalização do usuário
* [ ] Reserva em tempo real
* [ ] Integração de pagamentos
* [ ] Confirmação automática de pagamento
* [ ] Check-in via QR Code
* [ ] Check-out automático
* [ ] Sistema de avaliações
* [ ] Notificações
* [ ] Painel administrativo
* [ ] Dashboard financeiro
* [ ] Sistema de indicação
* [ ] Aplicativo mobile
* [ ] Expansão para múltiplas cidades

---

## 🔒 Segurança

O projeto utiliza recursos de segurança do Supabase, incluindo **Row Level Security (RLS)**.

Recomendações:

* Nunca commitar arquivos `.env`
* Nunca expor chaves privadas
* Validar permissões no banco
* Utilizar políticas RLS adequadas
* Validar dados recebidos pelo cliente
* Proteger operações financeiras no backend

---

## 🤝 Contribuindo

Contribuições são bem-vindas.

Para contribuir:

```bash
git clone https://github.com/savantsurf-arch/vagago-app.git
cd vagago-app
npm install
```

Crie uma nova branch:

```bash
git checkout -b minha-feature
```

Faça suas alterações e depois envie:

```bash
git add .
git commit -m "feat: adiciona nova funcionalidade"
git push origin minha-feature
```

Depois, abra um Pull Request no GitHub.

---

## 📄 Licença

Este projeto ainda não possui uma licença de código aberto definida.

Caso o VagaGo seja disponibilizado como projeto proprietário/comercial, recomenda-se adicionar uma licença específica e uma política de uso antes de permitir redistribuição ou uso comercial.

---

## 👨‍💻 Desenvolvedor

Desenvolvido por **Savantsurf / savantsurf-arch**.

GitHub:

https://github.com/savantsurf-arch

Repositório:

https://github.com/savantsurf-arch/vagago-app

---

## ⭐ VagaGo

**Seu espaço. Sua vaga. Seu caminho.**

🚗 **Encontre. Reserve. Estacione.**
