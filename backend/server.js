require("dotenv").config();
const express = require("express");
const cors = require("cors");
const fetch = require("node-fetch");
const EXCHANGE_API_KEY = process.env.EXCHANGE_API_KEY;
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const db = require("./database");


const app = express();
const PORT = 3000;

// Diz para o Express entender JSON no body//
app.use(express.json());
// Habilita CORS para permitir requests do frontend
app.use(cors());

const users = [
  {
    id: 1,
    email: "admin@teste.com",
    password: bcrypt.hashSync("123456", 10)
  }
];

//ROTA DE LOGIN//
app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body;

  const user = users.find(u => u.email === email);

  if (!user) {
    return res.status(401).json({ error: "Usuário não encontrado" });
  }

  const validPassword = await bcrypt.compare(password, user.password);

  if (!validPassword) {
    return res.status(401).json({ error: "Senha inválida" });
  }

  const token = jwt.sign(
    { userId: user.id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: "1h" }
  );

  res.json({ token });
});


//MIDDLEWARE DE AUTENTIFICAÇÃO//
function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Token não fornecido" });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: "Token inválido" });
    }

    req.user = user;
    next();
  });
}

// Endpoint de teste da API//
app.get("/api/health", (req, res) => {
  res.json({ ok: true });
});


app.get("/api/rates", async (req, res) => {
  try {
    const { symbols, to,amount } = req.query;

    // validação obrigatória//
    if (!symbols || !to) {
      return res.status(400).json({
        error: "symbols e to são obrigatórios",
      });
    }

    const symbolsArray = symbols.split(",");

    const results = [];

    const response = await fetch(
      `https://api.exchangerate.host/live?source=${to}&currencies=${symbols}&access_key=${process.env.EXCHANGE_API_KEY}`,
    );
    const data = await response.json();
    const conversions = [];

    for (const [pair, rate] of Object.entries(data.quotes)) {
      // extrai a moeda destino (últimos 3 caracteres)
      const currency = pair.slice(3);

      // como a base é BRL, precisamos inverte//r
      const convertedToBRL = amount / rate;

      conversions[currency] = convertedToBRL;
      conversions.push({
        symbol:currency, 
        to,
        rate: Number.parseFloat(convertedToBRL.toFixed(2))
      });
    }  

    console.log(conversions);

    return res.json(conversions);

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error: "Erro ao buscar taxas de câmbio",
    });
  }
});

// Endpoints para favoritos
app.get("/api/favorites", authenticateToken, (req, res) => {
  try {
    const stmt = db.prepare("SELECT symbol FROM favorites WHERE user_id = ?");
    const favorites = stmt.all(req.user.userId);
    res.json(favorites.map(f => f.symbol));
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao buscar favoritos" });
  }
});

app.post("/api/favorites", authenticateToken, (req, res) => {
  const { symbol } = req.body;
  if (!symbol) {
    return res.status(400).json({ error: "Symbol é obrigatório" });
  }
  try {
    const stmt = db.prepare("INSERT INTO favorites (user_id, symbol) VALUES (?, ?)");
    stmt.run(req.user.userId, symbol);
    res.status(201).json({ message: "Favorito adicionado" });
  } catch (error) {
    if (error.code === "SQLITE_CONSTRAINT_UNIQUE") {
      res.status(409).json({ error: "Favorito já existe" });
    } else {
      console.error(error);
      res.status(500).json({ error: "Erro ao adicionar favorito" });
    }
  }
});

app.delete("/api/favorites/:symbol", authenticateToken, (req, res) => {
  const { symbol } = req.params;
  try {
    const stmt = db.prepare("DELETE FROM favorites WHERE user_id = ? AND symbol = ?");
    const result = stmt.run(req.user.userId, symbol);
    if (result.changes === 0) {
      res.status(404).json({ error: "Favorito não encontrado" });
    } else {
      res.json({ message: "Favorito removido" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao remover favorito" });
  }
});

//rota raiz só pra não ficar "vazia"//

app.get("/", (req, res) => {
  res.send("API no ar. Use /api/health ✅");
});


app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
