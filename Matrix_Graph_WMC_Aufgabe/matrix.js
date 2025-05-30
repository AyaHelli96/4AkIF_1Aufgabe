const AppState = {
  apiCalls: 0,
  errors: 0,
  startTime: Date.now(),
  usageData: { matrix: 0, weather: 0, crypto: 0, quotes: 0 }
};

function updateApiStatus(status) {
  const statusEl = document.getElementById('apiStatus');
  const textEl = document.getElementById('apiStatusText');
  statusEl.className = `api-status api-${status}`;
  if (status === 'online') textEl.textContent = 'All Systems Online';
  if (status === 'offline') textEl.textContent = 'Connection Issues';
  if (status === 'loading') textEl.textContent = 'Processing...';
}

function showLoading(id) {
  document.getElementById(id).innerHTML = `<div class="status-loading loading">⏳ Processing request...</div>`;
}

function showError(id, msg) {
  document.getElementById(id).innerHTML = `<div class="status-error">❌ Error: ${msg}</div>`;
}

function showSuccess(id, html) {
  document.getElementById(id).innerHTML = `<div class="status-success">${html}</div>`;
}

// Adjazenzmatrix
document.getElementById('adjBtn').addEventListener('click', async () => {
  showLoading('matrixResult');
  updateApiStatus('loading');

  const nodes = document.getElementById('nodesInput').value.split(',').map(n => n.trim());
  const edges = document.getElementById('edgesInput').value.split(';').map(e => e.trim());

  try {
    const res = await fetch('http://localhost:3000/api/matrix/adjacency', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nodes, edges })
    });

    const data = await res.json();

    let html = '<h6>Adjacency Matrix:</h6><table class="table table-dark table-sm"><tr><th></th>';
    html += nodes.map(n => `<th>${n}</th>`).join('') + '</tr>';
    data.matrix.forEach((row, i) => {
      html += `<tr><th>${nodes[i]}</th>` + row.map(val => `<td>${val}</td>`).join('') + '</tr>';
    });
    html += '</table>';

    showSuccess('matrixResult', html);
    updateApiStatus('online');
    AppState.usageData.matrix++;

  } catch (err) {
    showError('matrixResult', 'Fehler beim Abrufen der Adjazenzmatrix');
    updateApiStatus('offline');
  }
});

// Potenzmatrix
document.getElementById('powerBtn').addEventListener('click', async () => {
  showLoading('matrixResult');
  updateApiStatus('loading');

  const nodes = document.getElementById('nodesInput').value.split(',').map(n => n.trim());
  const edges = document.getElementById('edgesInput').value.split(';').map(e => e.trim());
  const power = parseInt(document.getElementById('powerInput').value);

  try {
    const res = await fetch('http://localhost:3000/api/matrix/power', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nodes, edges, power })
    });

    const data = await res.json();

    let html = `<h6>Matrix A<sup>${power}</sup>:</h6><table class="table table-dark table-sm"><tr><th></th>`;
    html += nodes.map(n => `<th>${n}</th>`).join('') + '</tr>';
    data.matrix.forEach((row, i) => {
      html += `<tr><th>${nodes[i]}</th>` + row.map(val => `<td>${val}</td>`).join('') + '</tr>';
    });
    html += '</table>';

    showSuccess('matrixResult', html);
    updateApiStatus('online');
    AppState.usageData.matrix++;

  } catch (err) {
    showError('matrixResult', 'Fehler beim Berechnen der Potenzmatrix');
    updateApiStatus('offline');
  }
});
