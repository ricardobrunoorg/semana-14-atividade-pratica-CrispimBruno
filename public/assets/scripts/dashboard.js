const API_BASE = 'http://localhost:3000';

const CORES = {
  vinho:       '#7B2D42',
  vinhoClaro:  '#A34D63',
  ocre:        '#C8973A',
  ocreClaro:   '#DDB96A',
  tinta:       '#1A1612',
  tintaSuave:  '#4A4440',
  borda:       '#E0D9CE',
};

const PALETA = [
  '#7B2D42',
  '#C8973A',
  '#4A4440',
  '#A34D63',
  '#DDB96A',
  '#1A1612',
];

Chart.defaults.font.family = "'Inter', system-ui, sans-serif";
Chart.defaults.color = '#4A4440';

async function fetchLivros() {
  const res = await fetch(`${API_BASE}/livros`);
  if (!res.ok) throw new Error('Erro ao buscar livros');
  return res.json();
}

function preencherKPIs(livros) {
  const total     = livros.length;
  const destaque  = livros.filter(l => l.destaque).length;
  const precoMed  = livros.reduce((s, l) => s + l.preco, 0) / total;
  const avalMed   = livros.reduce((s, l) => s + l.avaliacao, 0) / total;
  const estoque   = livros.reduce((s, l) => s + l.estoque, 0);

  document.getElementById('kpi-total').textContent     = total;
  document.getElementById('kpi-destaque').textContent  = destaque;
  document.getElementById('kpi-preco').textContent     = `R$\u00A0${precoMed.toFixed(0)}`;
  document.getElementById('kpi-avaliacao').textContent = avalMed.toFixed(1) + ' ★';
  document.getElementById('kpi-estoque').textContent   = estoque;
}

function graficoCategorias(livros) {
  const contagem = {};
  livros.forEach(l => {
    contagem[l.categoria] = (contagem[l.categoria] || 0) + 1;
  });

  const labels = Object.keys(contagem);
  const dados  = Object.values(contagem);

  new Chart(document.getElementById('chart-categorias'), {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        label: 'Livros',
        data: dados,
        backgroundColor: PALETA.slice(0, labels.length),
        borderRadius: 6,
        borderSkipped: false,
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: false },
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: { stepSize: 1 },
          grid: { color: '#E0D9CE' },
        },
        x: {
          grid: { display: false },
          ticks: {
            maxRotation: 30,
            font: { size: 11 },
          }
        }
      }
    }
  });
}

function graficoEstoque(livros) {
  const estoque = {};
  livros.forEach(l => {
    estoque[l.categoria] = (estoque[l.categoria] || 0) + l.estoque;
  });

  const labels = Object.keys(estoque);
  const dados  = Object.values(estoque);

  new Chart(document.getElementById('chart-estoque'), {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        label: 'Unidades',
        data: dados,
        backgroundColor: CORES.ocre,
        borderRadius: 6,
        borderSkipped: false,
      }]
    },
    options: {
      indexAxis: 'y',
      responsive: true,
      plugins: {
        legend: { display: false },
      },
      scales: {
        x: {
          beginAtZero: true,
          grid: { color: '#E0D9CE' },
        },
        y: {
          grid: { display: false },
          ticks: { font: { size: 11 } }
        }
      }
    }
  });
}

function graficoAvaliacoes(livros) {
  // Ordena por avaliação decrescente
  const sorted = [...livros].sort((a, b) => b.avaliacao - a.avaliacao);
  const labels = sorted.map(l => l.titulo);
  const dados  = sorted.map(l => l.avaliacao);

  // Cores: destaque = vinho, normal = ocre
  const cores = sorted.map(l => l.destaque ? CORES.vinho : CORES.ocre);

  new Chart(document.getElementById('chart-avaliacoes'), {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        label: 'Avaliação',
        data: dados,
        backgroundColor: cores,
        borderRadius: 6,
        borderSkipped: false,
      }]
    },
    options: {
      indexAxis: 'y',
      responsive: true,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: ctx => ` ${ctx.parsed.x} de 5 ★`
          }
        }
      },
      scales: {
        x: {
          min: 4,
          max: 5,
          grid: { color: '#E0D9CE' },
          ticks: { callback: v => v + '★' }
        },
        y: {
          grid: { display: false },
          ticks: { font: { size: 11 } }
        }
      }
    }
  });
}

function graficoPrecos(livros) {
  const faixas = { 'Até R$50': 0, 'R$51–70': 0, 'R$71–90': 0, 'Acima de R$90': 0 };

  livros.forEach(l => {
    if      (l.preco <= 50) faixas['Até R$50']++;
    else if (l.preco <= 70) faixas['R$51–70']++;
    else if (l.preco <= 90) faixas['R$71–90']++;
    else                    faixas['Acima de R$90']++;
  });

  new Chart(document.getElementById('chart-precos'), {
    type: 'doughnut',
    data: {
      labels: Object.keys(faixas),
      datasets: [{
        data: Object.values(faixas),
        backgroundColor: [CORES.ocreClaro, CORES.ocre, CORES.vinhoClaro, CORES.vinho],
        borderWidth: 2,
        borderColor: '#FFFFFF',
        hoverOffset: 8,
      }]
    },
    options: {
      responsive: true,
      cutout: '65%',
      plugins: {
        legend: {
          position: 'bottom',
          labels: { padding: 16, font: { size: 12 } }
        }
      }
    }
  });
}

function graficoDestaques(livros) {
  const destaques = livros.filter(l => l.destaque).length;
  const normais   = livros.length - destaques;

  new Chart(document.getElementById('chart-destaques'), {
    type: 'doughnut',
    data: {
      labels: ['Em destaque', 'Acervo geral'],
      datasets: [{
        data: [destaques, normais],
        backgroundColor: [CORES.vinho, CORES.borda],
        borderWidth: 2,
        borderColor: '#FFFFFF',
        hoverOffset: 8,
      }]
    },
    options: {
      responsive: true,
      cutout: '65%',
      plugins: {
        legend: {
          position: 'bottom',
          labels: { padding: 16, font: { size: 12 } }
        },
        tooltip: {
          callbacks: {
            label: ctx => {
              const pct = ((ctx.parsed / livros.length) * 100).toFixed(0);
              return ` ${ctx.parsed} livros (${pct}%)`;
            }
          }
        }
      }
    }
  });
}

async function init() {
  const loading    = document.getElementById('dash-loading');
  const chartsGrid = document.getElementById('charts-grid');

  try {
    const livros = await fetchLivros();

    preencherKPIs(livros);
    graficoCategorias(livros);
    graficoEstoque(livros);
    graficoAvaliacoes(livros);
    graficoPrecos(livros);
    graficoDestaques(livros);

    chartsGrid.classList.remove('hidden');
  } catch (err) {
    console.error(err);
    loading.innerHTML = `
      <p style="color:#C0392B">
        ⚠️ Não foi possível carregar os dados.<br/>
        Verifique se o JSON Server está rodando em <code>http://localhost:3000</code>.
      </p>`;
    return;
  } finally {
    loading.classList.add('hidden');
  }
}

document.addEventListener('DOMContentLoaded', init);
