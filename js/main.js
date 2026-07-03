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
// Live release feed — reads data/releases.json
// (this file is what scripts/update-releases.js rewrites daily)
// ---------------------------------------------------------------
function formatDate(iso) {
  const d = new Date(iso + 'T00:00:00');
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function relativeUpdated(iso) {
  const then = new Date(iso);
  if (isNaN(then.getTime())) return 'Last updated: unknown';
  const diffHours = Math.round((Date.now() - then.getTime()) / 36e5);
  if (diffHours < 1) return 'Updated moments ago';
  if (diffHours < 24) return `Updated ${diffHours}h ago`;
  const days = Math.round(diffHours / 24);
  return `Updated ${days}d ago`;
}

async function loadFeed() {
  const listEl = document.getElementById('feed-list');
  const metaEl = document.getElementById('feed-updated');
  try {
    const res = await fetch('data/releases.json', { cache: 'no-store' });
    if (!res.ok) throw new Error('Feed file not found (' + res.status + ')');
    const data = await res.json();

    metaEl.textContent = relativeUpdated(data.lastUpdated) + ' · ' + (data.source || '');

    if (!data.releases || !data.releases.length) {
      listEl.innerHTML = '<div class="feed-empty">No upcoming releases in the feed right now.</div>';
      return;
    }

    const sorted = [...data.releases].sort((a, b) => new Date(a.date) - new Date(b.date));

    listEl.innerHTML = sorted.map(r => `
      <div class="feed-row">
        <span class="date">${formatDate(r.date)}</span>
        <span class="name">${r.name}${r.note ? `<small>${r.note}</small>` : ''}</span>
        <span class="price">${r.price || '—'}</span>
        <span class="code">${r.styleCode || ''}</span>
      </div>
    `).join('');
  } catch (err) {
    metaEl.textContent = 'Feed unavailable';
    listEl.innerHTML = `<div class="feed-error">Couldn't load the release feed (${err.message}). If you're viewing this file directly from disk rather than a local/deployed server, browsers block JSON fetches from file:// URLs — run it through a local server or your deployed site instead.</div>`;
  }
}

loadFeed();
