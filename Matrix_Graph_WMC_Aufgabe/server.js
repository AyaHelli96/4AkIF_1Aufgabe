const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Mock API Endpoints (Weather, Quotes, Crypto)
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
      "Your limitation—it's only your imagination."
    ],
    motivational: [
      "Don't watch the clock; do what it does. Keep going.",
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

// =============================================================================
// MATRIX OPERATIONS - SAUBERE VERSION
// =============================================================================

// Hilfsfunktion: Edges parsen (unterstützt sowohl A-B als auch A,B Format)
function parseEdges(edges) {
  return edges.map(edge => {
    // Unterstütze sowohl '-' als auch ',' als Separator
    const separator = edge.includes('-') ? '-' : ',';
    const parts = edge.split(separator).map(p => p.trim());
    return [parts[0], parts[1]];
  }).filter(([from, to]) => from && to); // Filtere leere Einträge
}

// Adjazenzmatrix erstellen
function createAdjacencyMatrix(nodes, edges) {
  const n = nodes.length;
  const matrix = Array.from({ length: n }, () => Array(n).fill(0));
  const nodeIndex = {};
  
  // Node-Index Mapping für bessere Performance
  nodes.forEach((node, i) => nodeIndex[node] = i);
  
  // Edges verarbeiten
  const edgePairs = parseEdges(edges);
  edgePairs.forEach(([from, to]) => {
    const i = nodeIndex[from];
    const j = nodeIndex[to];
    if (i !== undefined && j !== undefined) {
      matrix[i][j] = 1;
      // Für ungerichtete Graphen (optional):
      // matrix[j][i] = 1;
    }
  });
  
  return matrix;
}

// Matrixmultiplikation
function multiplyMatrix(a, b) {
  const n = a.length;
  const result = Array.from({ length: n }, () => Array(n).fill(0));
  
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      for (let k = 0; k < n; k++) {
        result[i][j] += a[i][k] * b[k][j];
      }
    }
  }
  return result;
}

// Matrix potenzieren (A^power)
function matrixPower(matrix, power) {
  if (power === 1) return matrix;
  if (power === 0) {
    // Einheitsmatrix für A^0
    const n = matrix.length;
    const identity = Array.from({ length: n }, (_, i) => 
      Array.from({ length: n }, (_, j) => i === j ? 1 : 0)
    );
    return identity;
  }
  
  let result = matrix.map(row => [...row]); // Deep copy
  
  for (let p = 1; p < power; p++) {
    result = multiplyMatrix(result, matrix);
  }
  
  return result;
}

// =============================================================================
// API ENDPOINTS FÜR MATRIX OPERATIONEN
// =============================================================================

app.get("/", (req, res) => {
  res.send("Test erfolgreich")
})

// POST /api/matrix/adjacency
app.post('/api/matrix/adjacency', (req, res) => {
  try {
    const { nodes, edges } = req.body;
    
    // Validierung
    if (!nodes || !Array.isArray(nodes) || nodes.length === 0) {
      return res.status(400).json({ error: 'Nodes array is required and cannot be empty' });
    }
    
    if (!edges || !Array.isArray(edges) || edges.length === 0) {
      return res.status(400).json({ error: 'Edges array is required and cannot be empty' });
    }
    
    const matrix = createAdjacencyMatrix(nodes, edges);
    
    res.json({ 
      matrix,
      nodes,
      info: {
        nodeCount: nodes.length,
        edgeCount: edges.length,
        matrixSize: `${nodes.length}x${nodes.length}`
      }
    });
    
  } catch (error) {
    console.error('Error in /api/matrix/adjacency:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/matrix/power
app.post('/api/matrix/power', (req, res) => {
  try {
    const { nodes, edges, power } = req.body;
    
    // Validierung
    if (!nodes || !Array.isArray(nodes) || nodes.length === 0) {
      return res.status(400).json({ error: 'Nodes array is required and cannot be empty' });
    }
    
    if (!edges || !Array.isArray(edges) || edges.length === 0) {
      return res.status(400).json({ error: 'Edges array is required and cannot be empty' });
    }
    
    if (power === undefined || power === null || power < 0) {
      return res.status(400).json({ error: 'Power must be a non-negative integer' });
    }
    
    if (power > 10) {
      return res.status(400).json({ error: 'Power too large (max 10 for performance)' });
    }
    
    const baseMatrix = createAdjacencyMatrix(nodes, edges);
    const poweredMatrix = matrixPower(baseMatrix, power);
    
    res.json({ 
      matrix: poweredMatrix,
      nodes,
      power,
      info: {
        nodeCount: nodes.length,
        edgeCount: edges.length,
        operation: `A^${power}`
      }
    });
    
  } catch (error) {
    console.error('Error in /api/matrix/power:', error);
    res.status(500).json({ error: error.message });
  }
});

// Debugging-Endpoint (optional)
app.post('/api/matrix/debug', (req, res) => {
  const { nodes, edges } = req.body;
  res.json({
    receivedNodes: nodes,
    receivedEdges: edges,
    parsedEdges: parseEdges(edges),
    nodeCount: nodes?.length,
    edgeCount: edges?.length
  });
});

// Server starten
app.listen(PORT, () => {
  console.log(`✅ GraphMatrix API Server is running at http://localhost:${PORT}`);
  console.log(`📊 Matrix endpoints: /api/matrix/adjacency, /api/matrix/power`);
  console.log(`🔍 Debug endpoint: /api/matrix/debug`);
});