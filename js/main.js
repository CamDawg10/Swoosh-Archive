// ---------------------------------------------------------------
// Timeline reveal-on-scroll
// ---------------------------------------------------------------
const items = document.querySelectorAll('.t-item');
if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });
  items.forEach(item => observer.observe(item));
} else {
  items.forEach(item => item.classList.add('in-view'));
}

// ---------------------------------------------------------------
// Shoe lookup — searches data/shoes.json by name/nickname/tag.
// Always shows a live Nike.com search link too, since that's the
// only reliable source for style codes, price, and availability.
// ---------------------------------------------------------------
let shoeData = [];

async function loadShoeData() {
  try {
    const res = await fetch('data/shoes.json', { cache: 'no-store' });
    if (!res.ok) throw new Error('shoes.json not found (' + res.status + ')');
    const data = await res.json();
    shoeData = data.shoes || [];
  } catch (err) {
    console.error('Could not load shoe database:', err);
    const el = document.getElementById('lookup-results');
    if (el) el.innerHTML = `<div class="feed-error">Couldn't load the shoe database (${err.message}).</div>`;
  }
}

function scoreMatch(shoe, query) {
  const q = query.toLowerCase().trim();
  if (!q) return 0;
  const haystacks = [shoe.name, ...(shoe.aka || []), ...(shoe.tags || []), shoe.category]
    .filter(Boolean)
    .map(s => s.toLowerCase());
  let best = 0;
  for (const h of haystacks) {
    if (h === q) best = Math.max(best, 100);
    else if (h.startsWith(q)) best = Math.max(best, 80);
    else if (h.includes(q)) best = Math.max(best, 50);
  }
  return best;
}

function renderShoeCard(shoe) {
  return `
    <div class="shoe-card">
      <div class="shoe-card-head">
        <h3>${shoe.name}</h3>
        <span class="shoe-year">${shoe.year || ''}</span>
      </div>
      <div class="shoe-tags">
        <span class="shoe-cat">${shoe.category || ''}</span>
        ${(shoe.aka || []).map(a => `<span class="shoe-aka">"${a}"</span>`).join('')}
      </div>
      ${shoe.designer ? `<p class="shoe-designer">Design credit: ${shoe.designer}</p>` : ''}
      <p class="shoe-summary">${shoe.summary}</p>
      <p class="shoe-significance"><strong>Why it matters:</strong> ${shoe.significance}</p>
    </div>
  `;
}

function updateOfficialLink(query) {
  const link = document.getElementById('link-nike-search');
  if (!link) return;
  const trimmed = query.trim();
  link.href = 'https://www.nike.com/w?q=' + encodeURIComponent(trimmed || 'nike sneakers');
}

function runSearch(query) {
  const resultsEl = document.getElementById('lookup-results');
  if (!resultsEl) return;
  updateOfficialLink(query);

  if (!query.trim()) {
    resultsEl.innerHTML = '<div class="feed-empty">Start typing a model name above.</div>';
    return;
  }

  const scored = shoeData
    .map(shoe => ({ shoe, score: scoreMatch(shoe, query) }))
    .filter(x => x.score > 0)
    .sort((a, b) => b.score - a.score);

  if (!scored.length) {
    resultsEl.innerHTML = `
      <div class="feed-empty">
        No write-up for "${query}" in this archive yet — that's expected, this only covers around 50 landmark models by design.
        Use the Nike.com search link below, which will find real current listings, colorways, and style codes.
      </div>`;
    return;
  }

  resultsEl.innerHTML = scored.slice(0, 8).map(x => renderShoeCard(x.shoe)).join('');
}

const inputEl = document.getElementById('lookup-input');
if (inputEl) {
  loadShoeData().then(() => {
    inputEl.addEventListener('input', (e) => runSearch(e.target.value));
  });
}
