# BarberPro - Projeto completo de barbearia

Este projeto entrega:

- agendamento online de corte, barba, sobrancelha e outros procedimentos
- geração de mensagem para o WhatsApp do barbeiro
- painel do barbeiro para ver horários e pedidos
- loja de produtos
- checkout com Mercado Pago
- webhook para atualizar pedido pago

## 1) Tecnologias usadas

- Next.js 14
- TypeScript
- Prisma
- SQLite no desenvolvimento
- Mercado Pago Checkout Pro
- Tailwind CSS

## 2) Estrutura principal

- `app/agendar` -> página de agendamento
- `app/produtos` -> loja
- `app/admin` -> painel do barbeiro
- `app/api/appointments` -> cria agendamento
- `app/api/checkout` -> cria preferência do Mercado Pago
- `app/api/mercadopago/webhook` -> recebe retorno do pagamento
- `prisma/schema.prisma` -> banco de dados

## 3) Como rodar localmente

### Instalar dependências

```bash
npm install
```

### Criar o arquivo de ambiente

Copie o `.env.example` para `.env`:

```bash
cp .env.example .env
```

No Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

### Rodar o banco e gerar o Prisma Client

```bash
npx prisma migrate dev --name init
npx prisma generate
npm run seed
```

### Subir o projeto

```bash
npm run dev
```

Abra:

```text
http://localhost:3000
```

## 4) Credenciais iniciais do painel

As credenciais ficam no `.env`:

```env
ADMIN_EMAIL="admin@barbearia.com"
ADMIN_PASSWORD="123456"
```

Acesse:

```text
http://localhost:3000/admin/login
```

## 5) Configurar o WhatsApp do barbeiro

No `.env`, preencha:

```env
BARBER_WHATSAPP_NUMBER="5511999999999"
```

Quando um cliente agenda, o sistema cria um link `wa.me` com a mensagem pronta para o barbeiro.

### Observação importante

Essa versão usa **link para WhatsApp com mensagem pronta**, que é o jeito mais simples de colocar no ar rápido.

Se quiser envio automático sem abrir o WhatsApp, depois você pode trocar para:

- WhatsApp Cloud API
- Twilio WhatsApp
- Z-API / UltraMsg / outro gateway

## 6) Configurar o Mercado Pago

No `.env`, preencha:

```env
MERCADO_PAGO_ACCESS_TOKEN="SEU_TOKEN"
NEXT_PUBLIC_APP_URL="https://seu-dominio.com"
```

No painel do Mercado Pago, configure a URL de webhook para:

```text
https://seu-dominio.com/api/mercadopago/webhook
```

## 7) Como colocar no ar

## Opção recomendada para começo

- Front-end + back-end: Vercel
- Banco em produção: Neon PostgreSQL ou Supabase PostgreSQL

### Passo a passo

#### 1. Suba o projeto para o GitHub

```bash
git init
git add .
git commit -m "Projeto inicial barbearia"
```

Crie um repositório no GitHub e rode:

```bash
git remote add origin https://github.com/SEU-USUARIO/barbearia-app.git
git branch -M main
git push -u origin main
```

#### 2. Criar conta na Vercel

Entre na Vercel e importe o repositório.

#### 3. Configurar variáveis de ambiente

Na Vercel, adicione:

- `DATABASE_URL`
- `ADMIN_EMAIL`
- `ADMIN_PASSWORD`
- `AUTH_SECRET`
- `NEXT_PUBLIC_APP_URL`
- `BARBER_WHATSAPP_NUMBER`
- `MERCADO_PAGO_ACCESS_TOKEN`
- `MERCADO_PAGO_WEBHOOK_SECRET` (opcional nessa versão)

#### 4. Banco em produção

### Se usar Neon/Postgres

Troque o provider do Prisma para PostgreSQL:

No arquivo `prisma/schema.prisma`, altere:

```prisma
datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}
```

para:

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

Depois rode localmente:

```bash
npx prisma migrate dev --name postgres
```

Depois faça commit dessa mudança e envie para o GitHub.

#### 5. Deploy

A própria Vercel vai buildar o projeto.

Configure o comando de build como padrão:

```text
npm run build
```

#### 6. Rodar migrations em produção

Você pode usar:

```bash
npx prisma migrate deploy
```

ou configurar no pipeline da hospedagem.

## 8) Melhorias que você pode fazer depois

- selecionar barbeiros dinâmicos pelo banco
- agenda com bloqueio de horários
- envio automático por WhatsApp API
- cadastro de múltiplos administradores
- imagens de produtos por upload
- cupom de desconto
- cálculo de frete
- Pix e cartão com checkout transparente
- painel de relatórios

## 9) Limitações desse MVP

- login do painel é simples, com usuário e senha no `.env`
- WhatsApp é via link com mensagem pronta
- sem frete e sem cálculo de entrega
- sem upload de imagens no painel

## 10) Próximo passo ideal

Primeiro coloque essa versão no ar.
Depois evolua para:

- PostgreSQL
- autenticação robusta
- WhatsApp API real
- painel CRUD completo de serviços e produtos
