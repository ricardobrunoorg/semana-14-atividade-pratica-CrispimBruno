const API_BASE = 'http://localhost:3000';
const COLECAO = 'livros';

let todosOsLivros = [];

async function fetchItems() {
  const response = await fetch(`${API_BASE}/${COLECAO}`);
  if (!response.ok) throw new Error(`Erro HTTP: ${response.status}`);
  return response.json();
}

function createCard(item) {
  const li = document.createElement('li');
  li.className = 'card';

  const estrelas = gerarEstrelas(item.avaliacao);
  const tagsBadges = (item.tags || [])
    .slice(0, 3)
    .map(tag => `<span class="tag">${tag}</span>`)
    .join('');

  li.innerHTML = `
    <div class="card-img-wrap">
      <img
        src="${item.imagem}"
        alt="Capa de ${item.titulo}"
        class="card-img"
        onerror="this.src='https://via.placeholder.com/200x300?text=Sem+Capa'"
      />
      ${item.destaque ? '<span class="badge-destaque">Destaque</span>' : ''}
    </div>
    <div class="card-body">
      <span class="card-categoria">${item.categoria}</span>
      <h2 class="card-titulo">${item.titulo}</h2>
      <p class="card-autor">por ${item.autor}</p>
      <p class="card-descricao">${item.descricaoCurta}</p>
      <div class="card-meta">
        <div class="card-avaliacao" title="${item.avaliacao} de 5">
          ${estrelas}
          <span class="avaliacao-num">${item.avaliacao}</span>
        </div>
        <span class="card-preco">R$ ${item.preco.toFixed(2).replace('.', ',')}</span>
      </div>
      <div class="card-tags">${tagsBadges}</div>
      <a href="details.html?id=${item.id}" class="btn-detalhes">
        Ver detalhes →
      </a>
    </div>
  `;

  return li;
}

function gerarEstrelas(avaliacao) {
  const inteiras = Math.floor(avaliacao);
  const meia = avaliacao % 1 >= 0.5;
  let html = '';
  for (let i = 1; i <= 5; i++) {
    if (i <= inteiras) html += '<span class="estrela cheia">★</span>';
    else if (i === inteiras + 1 && meia) html += '<span class="estrela meia">★</span>';
    else html += '<span class="estrela vazia">☆</span>';
  }
  return html;
}

function renderCards(items) {
  const container = document.getElementById('cards-container');
  container.innerHTML = '';

  if (items.length === 0) {
    container.innerHTML = `
      <li class="empty-state">
        <p>Nenhum livro encontrado nesta categoria.</p>
      </li>`;
    return;
  }

  items.forEach(item => {
    const card = createCard(item);
    container.appendChild(card);
  });
}

function setupFilters() {
  const botoes = document.querySelectorAll('.filter-btn');

  botoes.forEach(btn => {
    btn.addEventListener('click', () => {
      botoes.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filtro = btn.dataset.filter;
      if (filtro === 'todos') {
        renderCards(todosOsLivros);
      } else {
        const filtrados = todosOsLivros.filter(l => l.categoria === filtro);
        renderCards(filtrados);
      }
    });
  });
}

async function init() {
  const loading = document.getElementById('loading');
  const errorMsg = document.getElementById('error-message');

  try {
    loading.classList.remove('hidden');
    errorMsg.classList.add('hidden');

    todosOsLivros = await fetchItems();
    renderCards(todosOsLivros);
    setupFilters();
  } catch (err) {
    console.error('Erro ao carregar livros:', err);
    errorMsg.classList.remove('hidden');
  } finally {
    loading.classList.add('hidden');
  }
}

document.addEventListener('DOMContentLoaded', init);
