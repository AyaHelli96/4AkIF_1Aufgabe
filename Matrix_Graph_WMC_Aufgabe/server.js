const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Mock API Endpoints
app.get('/api/weather/:city', (req, res) => {
  const city = req.params.city;
  const data = {
    city,
    temperature: Math.floor(Math.random() * 30) + 5,
    condition: ['Sunny', 'Cloudy', 'Rainy', 'Snowy'][Math.floor(Math.random() * 4)],
    humidity: Math.floor(Math.random() * 40) + 40,
    windSpeed: Math.floor(Math.random() * 20) + 5
  };
  res.json(data);
});

app.get('/api/quote/:category', (req, res) => {
  const category = req.params.category;
  const quotes = {
    inspirational: [
      "The only way to do great work is to love what you do. - Steve Jobs",
      "Your limitation—it’s only your imagination."
    ],
    motivational: [
      "Don’t watch the clock; do what it does. Keep going.",
      "The future belongs to those who believe in their dreams."
    ],
    success: [
      "Success is not final, failure is not fatal.",
      "Start where you are. Use what you have. Do what you can."
    ],
    wisdom: [
      "Be yourself; everyone else is already taken.",
      "In the middle of difficulty lies opportunity."
    ]
  };
  const selected = quotes[category] || quotes.inspirational;
  const quote = selected[Math.floor(Math.random() * selected.length)];
  res.json({ quote });
});

app.get('/api/crypto', (req, res) => {
  const data = [
    { name: 'Bitcoin', symbol: 'BTC', price: 45000 + Math.random() * 10000, change: (Math.random() - 0.5) * 10 },
    { name: 'Ethereum', symbol: 'ETH', price: 3000 + Math.random() * 1000, change: (Math.random() - 0.5) * 8 },
    { name: 'Cardano', symbol: 'ADA', price: 0.5 + Math.random() * 0.5, change: (Math.random() - 0.5) * 15 },
    { name: 'Solana', symbol: 'SOL', price: 100 + Math.random() * 50, change: (Math.random() - 0.5) * 12 }
  ];
  res.json(data);
});
// Hilfsfunktion: Adjazenzmatrix erstellen
function createAdjacencyMatrix(nodes, edges) {
  const n = nodes.length;
  const matrix = Array.from({ length: n }, () => Array(n).fill(0));
  edges.forEach(([from, to]) => {
    const i = nodes.indexOf(from);
    const j = nodes.indexOf(to);
    if (i !== -1 && j !== -1) {
      matrix[i][j] = 1;
    }
  });
  return matrix;
}

// Matrix potenzieren
function matrixPower(matrix, power) {
  const n = matrix.length;
  let result = matrix.map(row => row.slice());
  for (let p = 1; p < power; p++) {
    const temp = Array.from({ length: n }, () => Array(n).fill(0));
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        for (let k = 0; k < n; k++) {
          temp[i][j] += result[i][k] * matrix[k][j];
        }
      }
    }
    result = temp;
  }
  return result;
}

// POST /api/matrix/power
app.post('/api/matrix/power', (req, res) => {
  const { nodes, edges, power } = req.body;
  const edgePairs = edges.map(e => e.split(','));
  const baseMatrix = createAdjacencyMatrix(nodes, edgePairs);
  const poweredMatrix = matrixPower(baseMatrix, power);
  res.json({ matrix: poweredMatrix });
});


app.listen(PORT, () => {
  console.log(`✅ GraphMatrix API Server is running at http://localhost:${PORT}`);
});
// Hilfsfunktion: Erzeuge Adjazenzmatrix
function createAdjacencyMatrix(nodes, edges) {
  const n = nodes.length;
  const matrix = Array.from({ length: n }, () => Array(n).fill(0));

  edges.forEach(([from, to]) => {
    const i = nodes.indexOf(from);
    const j = nodes.indexOf(to);
    if (i !== -1 && j !== -1) matrix[i][j] = 1;
  });

  return matrix;
}

// Matrix potenzieren
function matrixPower(matrix, power) {
  const n = matrix.length;
  let result = matrix.map(row => row.slice());

  for (let p = 1; p < power; p++) {
    const temp = Array.from({ length: n }, () => Array(n).fill(0));
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        for (let k = 0; k < n; k++) {
          temp[i][j] += result[i][k] * matrix[k][j];
        }
      }
    }
    result = temp;
  }

  return result;
}

// API: Adjazenzmatrix
app.post('/api/matrix/adjacency', (req, res) => {
  const { nodes, edges } = req.body;
  const edgePairs = edges.map(e => e.split(','));
  const n = nodes.length;
  const matrix = Array.from({ length: n }, () => Array(n).fill(0));

  edgePairs.forEach(([from, to]) => {
    const i = nodes.indexOf(from);
    const j = nodes.indexOf(to);
    if (i !== -1 && j !== -1) matrix[i][j] = 1;
  });

  res.json({ matrix });
});

// API: Matrixpower
function matrixPower(matrix, power) {
  const n = matrix.length;
  let result = matrix.map(row => row.slice());

  for (let p = 1; p < power; p++) {
    const temp = Array.from({ length: n }, () => Array(n).fill(0));
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        for (let k = 0; k < n; k++) {
          temp[i][j] += result[i][k] * matrix[k][j];
        }
      }
    }
    result = temp;
  }
  return result;
}

app.post('/api/matrix/power', (req, res) => {
  const { nodes, edges, power } = req.body;
  const edgePairs = edges.map(e => e.split(','));

  const n = nodes.length;
  const matrix = Array.from({ length: n }, () => Array(n).fill(0));
  edgePairs.forEach(([from, to]) => {
    const i = nodes.indexOf(from);
    const j = nodes.indexOf(to);
    if (i !== -1 && j !== -1) matrix[i][j] = 1;
  });

  const result = matrixPower(matrix, power);
  res.json({ matrix: result });
});

