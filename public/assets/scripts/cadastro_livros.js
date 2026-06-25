const API_BASE = 'http://localhost:3000';
const COLECAO = 'livros';

function showFeedback(mensagem, tipo = 'success') {
  const el = document.getElementById('form-feedback');
  el.className = `form-feedback ${tipo}`;
  el.textContent = mensagem;
  el.classList.remove('hidden');
  el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function validarFormulario(dados) {
  if (!dados.titulo.trim()) return 'O campo Título é obrigatório.';
  if (!dados.autor.trim()) return 'O campo Autor é obrigatório.';
  if (!dados.categoria) return 'Selecione uma Categoria.';
  if (!dados.preco || isNaN(dados.preco) || dados.preco <= 0) return 'Informe um Preço válido.';
  if (!dados.descricaoCurta.trim()) return 'A Descrição curta é obrigatória.';
  if (!dados.descricaoCompleta.trim()) return 'A Descrição completa é obrigatória.';
  return null;
}

async function salvarLivro(dados) {
  const response = await fetch(`${API_BASE}/${COLECAO}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(dados),
  });
  if (!response.ok) throw new Error(`Erro ao salvar: ${response.status}`);
  return response.json();
}

async function handleSubmit(event) {
  event.preventDefault();

  const form = event.target;
  const btnSalvar = form.querySelector('.btn-salvar');

  const tagsRaw = document.getElementById('tags').value;
  const tags = tagsRaw
    ? tagsRaw.split(',').map(t => t.trim()).filter(Boolean)
    : [];

  const dados = {
    titulo:             document.getElementById('titulo').value,
    autor:              document.getElementById('autor').value,
    categoria:          document.getElementById('categoria').value,
    preco:              parseFloat(document.getElementById('preco').value),
    descricaoCurta:     document.getElementById('descricaoCurta').value,
    descricaoCompleta:  document.getElementById('descricaoCompleta').value,
    imagem:             document.getElementById('imagem').value ||
                        'https://via.placeholder.com/200x300?text=Sem+Capa',
    editora:            document.getElementById('editora').value,
    anoPublicacao:      parseInt(document.getElementById('anoPublicacao').value) || null,
    paginas:            parseInt(document.getElementById('paginas').value) || null,
    estoque:            parseInt(document.getElementById('estoque').value) || 0,
    avaliacao:          0,
    tags,
    destaque:           document.getElementById('destaque').checked,
  };

  const erro = validarFormulario(dados);
  if (erro) {
    showFeedback(erro, 'error');
    return;
  }

  try {
    btnSalvar.disabled = true;
    btnSalvar.textContent = 'Salvando...';

    const livroSalvo = await salvarLivro(dados);

    showFeedback(`✓ Livro "${livroSalvo.titulo}" cadastrado com sucesso! Redirecionando...`, 'success');
    form.reset();

    setTimeout(() => {
      window.location.href = `details.html?id=${livroSalvo.id}`;
    }, 1500);
  } catch (err) {
    console.error(err);
    showFeedback('Erro ao salvar o livro. Verifique se o JSON Server está rodando.', 'error');
    btnSalvar.disabled = false;
    btnSalvar.textContent = 'Salvar livro';
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('form-livro');
  form.addEventListener('submit', handleSubmit);
});
