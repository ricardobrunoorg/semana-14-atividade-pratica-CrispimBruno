const API_BASE = 'http://localhost:3000';
const COLECAO = 'livros';

function getIdFromURL() {
  const params = new URLSearchParams(window.location.search);
  return params.get('id');
}

async function fetchItemById(id) {
  const response = await fetch(`${API_BASE}/${COLECAO}/${id}`);
  if (!response.ok) throw new Error(`Livro não encontrado (status ${response.status})`);
  return response.json();
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

function renderDetail(livro) {
  const container = document.getElementById('detail-container');

  const estrelas = gerarEstrelas(livro.avaliacao);
  const tagsHTML = (livro.tags || [])
    .map(tag => `<span class="tag">${tag}</span>`)
    .join('');

  const estoqueMsg = livro.estoque > 0
    ? `<span class="badge-estoque disponivel">✓ ${livro.estoque} em estoque</span>`
    : `<span class="badge-estoque esgotado">✗ Esgotado</span>`;

  container.innerHTML = `
    <article class="detail-layout">

      <!-- Coluna da capa -->
      <div class="detail-cover-col">
        <div class="detail-img-wrap">
          <img
            src="${livro.imagem}"
            alt="Capa de ${livro.titulo}"
            class="detail-img"
            onerror="this.src='https://via.placeholder.com/300x450?text=Sem+Capa'"
          />
          ${livro.destaque ? '<span class="badge-destaque">Destaque</span>' : ''}
        </div>
      </div>

      <!-- Coluna das informações -->
      <div class="detail-info-col">
        <span class="card-categoria">${livro.categoria}</span>
        <h1 class="detail-titulo">${livro.titulo}</h1>
        <p class="detail-autor">por <strong>${livro.autor}</strong></p>

        <div class="detail-avaliacao">
          ${estrelas}
          <span class="avaliacao-num">${livro.avaliacao} de 5</span>
        </div>

        <p class="detail-descricao">${livro.descricaoCompleta}</p>

        <div class="detail-tags">
          <h3 class="detail-section-label">Tags</h3>
          <div class="tags-list">${tagsHTML}</div>
        </div>

        <div class="detail-meta-grid">
          <div class="meta-item">
            <span class="meta-label">Editora</span>
            <span class="meta-value">${livro.editora}</span>
          </div>
          <div class="meta-item">
            <span class="meta-label">Publicação</span>
            <span class="meta-value">${livro.anoPublicacao}</span>
          </div>
          <div class="meta-item">
            <span class="meta-label">Páginas</span>
            <span class="meta-value">${livro.paginas}</span>
          </div>
          <div class="meta-item">
            <span class="meta-label">Estoque</span>
            <span class="meta-value">${estoqueMsg}</span>
          </div>
        </div>

        <div class="detail-purchase">
          <div class="detail-preco">R$ ${livro.preco.toFixed(2).replace('.', ',')}</div>
          <button class="btn-comprar" ${livro.estoque === 0 ? 'disabled' : ''}>
            ${livro.estoque > 0 ? '🛒 Adicionar ao carrinho' : '⛔ Esgotado'}
          </button>
        </div>

        <a href="index.html" class="btn-voltar">← Voltar ao acervo</a>
      </div>

    </article>
  `;

  // Atualiza o título da aba
  document.title = `${livro.titulo} — LibroShop`;
}

function showError(mensagem) {
  const errorEl = document.getElementById('error-message');
  errorEl.innerHTML = `
    <div class="error-card">
      <p class="error-icon">⚠️</p>
      <p>${mensagem}</p>
      <a href="index.html" class="btn-voltar">← Voltar ao acervo</a>
    </div>
  `;
  errorEl.classList.remove('hidden');
}

async function init() {
  const loading = document.getElementById('loading');
  const detailContainer = document.getElementById('detail-container');

  const id = getIdFromURL();

  if (!id) {
    loading.classList.add('hidden');
    showError('Nenhum livro foi especificado. Volte ao acervo e escolha um livro para ver seus detalhes.');
    return;
  }

  try {
    loading.classList.remove('hidden');

    const livro = await fetchItemById(id);

    renderDetail(livro);
    detailContainer.classList.remove('hidden');
  } catch (err) {
    console.error('Erro ao carregar detalhes:', err);
    showError(`Livro com id "${id}" não encontrado. Ele pode ter sido removido do acervo.`);
  } finally {
    loading.classList.add('hidden');
  }
}

document.addEventListener('DOMContentLoaded', init);
