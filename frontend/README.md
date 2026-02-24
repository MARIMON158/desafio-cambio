# Desafio Câmbio

## Descrição do Projeto

O **Desafio Câmbio** é um conversor de moedas que permite aos usuários consultar taxas de câmbio em tempo real, fazer conversões e gerenciar uma lista de moedas favoritas. O projeto é dividido em duas partes: um backend em Node.js com Express para a API e um frontend em React com Vite para a interface.

## Tecnologias

- **Backend**: Node.js, Express, SQLite (via better-sqlite3), JWT para autenticação, bcrypt para hash de senhas, node-fetch para requisições HTTP.
- **Frontend**: React, Vite, Tailwind CSS (via CDN).
- **Outros**: dotenv para variáveis de ambiente, CORS para permitir requisições cross-origin.

## Requisitos

- Node.js (versão 14 ou superior)
- npm (geralmente vem com Node.js)
- Uma chave de API do ExchangeRate-API (gratuita em exchangerate.host)

## Como Rodar Localmente

### Passo 1: Clonar ou Baixar o Projeto

Baixe ou clone o repositório para sua máquina.

### Passo 2: Configurar o Backend

1. Abra um terminal (PowerShell no Windows ou bash no Linux/Mac) na pasta `backend`.
2. Instale as dependências:
   ```
   npm install
   ```
3. Crie um arquivo `.env` na pasta `backend` com as variáveis necessárias (veja a seção "Variáveis de Ambiente").
4. Inicie o servidor:
   ```
   npm start
   ```
   O backend ficará rodando em `http://localhost:3000`.

### Passo 3: Configurar o Frontend

1. Abra outro terminal na pasta `frontend`.
2. Instale as dependências:
   ```
   npm install
   ```
3. Inicie o servidor de desenvolvimento:
   ```
   npm run dev
   ```
   O frontend ficará rodando em `http://localhost:5173` (porta padrão do Vite).

### Passo 4: Acessar a Aplicação

Abra seu navegador e vá para `http://localhost:5173`. O frontend se conectará automaticamente ao backend em `http://localhost:3000`.

## Variáveis de Ambiente (.env)

Crie um arquivo `.env` na pasta `backend` com o seguinte conteúdo (substitua pelos valores reais):

```
EXCHANGE_API_KEY=sua_chave_api_aqui
JWT_SECRET=uma_chave_secreta_segura_para_jwt
```

- `EXCHANGE_API_KEY`: Chave de API gratuita do [ExchangeRate-API](https://exchangerate.host/). Registre-se para obter uma.
- `JWT_SECRET`: Uma string secreta para assinar tokens JWT (use algo aleatório e seguro).

## Rotas da API

O backend expõe as seguintes rotas em `http://localhost:3000`:

- **POST /api/auth/login**: Faz login. Corpo: `{ "email": "string", "password": "string" }`. Retorna um token JWT.
- **GET /api/health**: Verifica se a API está funcionando. Retorna `{ "ok": true }`.
- **GET /api/rates**: Busca taxas de câmbio. Parâmetros de query: `symbols` (lista separada por vírgula, ex: "USD,EUR"), `to` (moeda base, ex: "BRL"), `amount` (opcional, valor a converter). Requer autenticação (token no header Authorization).
- **GET /api/favorites**: Lista moedas favoritas do usuário. Requer autenticação.
- **POST /api/favorites**: Adiciona uma moeda aos favoritos. Corpo: `{ "symbol": "string" }`. Requer autenticação.
- **DELETE /api/favorites/:symbol**: Remove uma moeda dos favoritos. Requer autenticação.

Todas as rotas protegidas precisam do header `Authorization: Bearer <token>`.

## Como Testar no Postman

1. Instale o Postman.
2. Faça login via POST para `/api/auth/login` com email e senha.
3. Copie o token retornado.
4. Para rotas protegidas, adicione o header `Authorization` com valor `Bearer <token>`.
5. Teste as rotas como descrito acima.

## Credenciais Padrão

- Email: `admin@teste.com`
- Senha: `123456`

Use essas credenciais para testar o login.

## Dicas de Solução para Erros Comuns

- **Erro de CORS**: Certifique-se de que o backend tem `app.use(cors())` e que o frontend está acessando `http://localhost:3000`. Se o erro persistir, verifique se o navegador permite CORS.
- **Failed to fetch**: Verifique se o backend está rodando na porta 3000 e se a URL no frontend está correta. Use `http://localhost:3000` no frontend.
- **Porta ocupada (3000 ou 5173)**: Mude a porta no código (ex: `const PORT = 3001` no backend) ou mate processos usando essas portas com `netstat -ano | findstr :3000` (Windows) ou `lsof -i :3000` (Linux/Mac), depois `taskkill /PID <PID>` (Windows) ou `kill <PID>` (Linux/Mac).
- **Erro de API key**: Verifique se a chave no `.env` é válida e se a API do ExchangeRate está acessível.
- **Erro de banco de dados**: Certifique-se de que o arquivo `database.js` está configurado corretamente e que o SQLite está instalado.

Para dúvidas ou problemas, consulte a documentação das tecnologias usadas.