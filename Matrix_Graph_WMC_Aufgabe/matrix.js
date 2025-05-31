const AppState = {
  apiCalls: 0,
  errors: 0,
  startTime: Date.now(),
  usageData: { matrix: 0, weather: 0, crypto: 0, quotes: 0 }
};

function updateApiStatus(status) {
  const statusEl = document.getElementById('apiStatus');
  const textEl = document.getElementById('apiStatusText');
  if (!statusEl || !textEl) return;
  
  statusEl.className = `api-status api-${status}`;
  if (status === 'online') textEl.textContent = 'All Systems Online';
  if (status === 'offline') textEl.textContent = 'Connection Issues';
  if (status === 'loading') textEl.textContent = 'Processing...';
}

function showLoading(id) {
  const el = document.getElementById(id);
  if (el) {
    el.innerHTML = `<div class="status-loading loading">⏳ Processing request...</div>`;
  }
}

function showError(id, msg) {
  const el = document.getElementById(id);
  if (el) {
    el.innerHTML = `<div class="status-error">❌ Error: ${msg}</div>`;
  }
}

function showSuccess(id, html) {
  const el = document.getElementById(id);
  if (el) {
    el.innerHTML = `<div class="status-success">${html}</div>`;
  }
}

// Eingabe validieren
function validateInput() {
  const nodes = document.getElementById('nodesInput')?.value.split(',').map(n => n.trim()).filter(n => n);
  const edges = document.getElementById('edgesInput')?.value.split(';').map(e => e.trim()).filter(e => e);
  
  if (!nodes || nodes.length === 0) {
    throw new Error('Bitte gib mindestens einen Knoten ein (z.B. A,B,C)');
  }
  
  if (!edges || edges.length === 0) {
    throw new Error('Bitte gib mindestens eine Kante ein (z.B. A-B;B-C)');
  }
  
  // Validiere Edge-Format
  for (const edge of edges) {
    if (!edge.includes('-') && !edge.includes(',')) {
      throw new Error(`Ungültiges Edge-Format: "${edge}". Verwende A-B oder A,B`);
    }
  }
  
  return { nodes, edges };
}

// Matrix als HTML-Tabelle darstellen
function formatMatrix(matrix, nodes, title, power = null) {
  const displayTitle = power ? `${title} A<sup>${power}</sup>` : title;
  
  let html = `<h6>${displayTitle}:</h6>`;
  html += `<div class="table-responsive">`;
  html += `<table class="table table-dark table-sm table-bordered">`;
  html += `<tr><th class="table-header"></th>`;
  html += nodes.map(n => `<th class="table-header text-center">${n}</th>`).join('');
  html += `</tr>`;
  
  matrix.forEach((row, i) => {
    html += `<tr><th class="table-header text-center">${nodes[i]}</th>`;
    html += row.map(val => `<td class="text-center matrix-cell">${val}</td>`).join('');
    html += `</tr>`;
  });
  
  html += `</table></div>`;
  
  // Zusätzliche Informationen
  html += `<small class="text-muted">`;
  html += `Matrix-Größe: ${nodes.length}×${nodes.length} | `;
  html += `Knoten: ${nodes.join(', ')}`;
  html += `</small>`;
  
  return html;
}

// API-Aufruf mit besserer Fehlerbehandlung
async function makeApiCall(url, data) {
  const response = await fetch(url, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify(data)
  });
  
  if (!response.ok) {
    let errorMsg = `HTTP ${response.status}`;
    try {
      const errorData = await response.json();
      errorMsg = errorData.error || errorMsg;
    } catch (e) {
      // Fallback wenn JSON parsing fehlschlägt
    }
    throw new Error(errorMsg);
  }
  
  return await response.json();
}

// Event Listener für Adjazenzmatrix
document.getElementById('adjBtn')?.addEventListener('click', async () => {
  console.log('🔄 Adjazenzmatrix wird berechnet...');
  showLoading('matrixResult');
  updateApiStatus('loading');
  AppState.apiCalls++;

  try {
    const { nodes, edges } = validateInput();
    console.log('📊 Input:', { nodes, edges });
    
    const data = await makeApiCall('http://localhost:3000/api/matrix/adjacency', { nodes, edges });
    console.log('✅ Response:', data);

    const html = formatMatrix(data.matrix, nodes, 'Adjazenzmatrix');
    showSuccess('matrixResult', html);
    updateApiStatus('online');
    AppState.usageData.matrix++;

  } catch (err) {
    console.error('❌ Adjazenzmatrix Fehler:', err);
    showError('matrixResult', err.message);
    updateApiStatus('offline');
    AppState.errors++;
  }
});

// Event Listener für Matrix-Potenz
document.getElementById('powerBtn')?.addEventListener('click', async () => {
  console.log('🔄 Matrix-Potenz wird berechnet...');
  showLoading('matrixResult');
  updateApiStatus('loading');
  AppState.apiCalls++;

  try {
    const { nodes, edges } = validateInput();
    const powerInput = document.getElementById('powerInput');
    const power = parseInt(powerInput?.value || '2');
    
    if (isNaN(power) || power < 0) {
      throw new Error('Power muss eine positive Zahl sein');
    }
    
    if (power > 10) {
      throw new Error('Power zu groß (max 10)');
    }
    
    console.log('📊 Input:', { nodes, edges, power });
    
    const data = await makeApiCall('http://localhost:3000/api/matrix/power', { nodes, edges, power });
    console.log('✅ Response:', data);

    const html = formatMatrix(data.matrix, nodes, 'Matrix', power);
    showSuccess('matrixResult', html);
    updateApiStatus('online');
    AppState.usageData.matrix++;

  } catch (err) {
    console.error('❌ Matrix-Potenz Fehler:', err);
    showError('matrixResult', err.message);
    updateApiStatus('offline');
    AppState.errors++;
  }
});

document.getElementById('quoteBtn')?.addEventListener('click', async () => {
  const category = document.getElementById('categorySelect')?.value || 'inspirational';
  showLoading('quoteResult');
  updateApiStatus('loading');

  try {
    const res = await fetch(`http://localhost:3000/api/quote/${category}`);
    const data = await res.json();

    const html = `💬 "${data.quote}"`;
    showSuccess('quoteResult', html);
    updateApiStatus('online');
    AppState.usageData.quotes++;
  } catch (err) {
    console.error('Quote API Error:', err);
    showError('quoteResult', err.message);
    updateApiStatus('offline');
    AppState.errors++;
  }
});

document.getElementById('cryptoBtn')?.addEventListener('click', async () => {
  showLoading('cryptoResult');
  updateApiStatus('loading');

  try {
    const res = await fetch(`http://localhost:3000/api/crypto`);
    const data = await res.json();

    let html = '<ul class="list-group">';
    data.forEach(coin => {
      html += `<li class="list-group-item bg-dark text-light">
        ${coin.name} (${coin.symbol}): €${coin.price.toFixed(2)} 
        <span class="${coin.change >= 0 ? 'text-success' : 'text-danger'}">
          (${coin.change.toFixed(2)}%)
        </span>
      </li>`;
    });
    html += '</ul>';

    showSuccess('cryptoResult', html);
    updateApiStatus('online');
    AppState.usageData.crypto++;
  } catch (err) {
    console.error('Crypto API Error:', err);
    showError('cryptoResult', err.message);
    updateApiStatus('offline');
    AppState.errors++;
  }
});


// Debug-Funktion (optional)
window.debugMatrix = async function() {
  try {
    const { nodes, edges } = validateInput();
    const data = await makeApiCall('http://localhost:3000/api/matrix/debug', { nodes, edges });
    console.log('🔍 Debug Info:', data);
    alert('Debug-Info in der Konsole (F12)');
  } catch (err) {
    console.error('Debug Fehler:', err);
  }
};

// Status beim Laden der Seite
document.addEventListener('DOMContentLoaded', () => {
  console.log('🚀 Matrix.js geladen');
  updateApiStatus('online');
  
  // Test ob Server erreichbar ist
  fetch('http://localhost:3000/api/crypto')
    .then(response => response.ok ? updateApiStatus('online') : updateApiStatus('offline'))
    .catch(() => updateApiStatus('offline'));
});

// Globale Fehlerbehandlung
window.addEventListener('error', (event) => {
  console.error('Global Error:', event.error);
  AppState.errors++;
});