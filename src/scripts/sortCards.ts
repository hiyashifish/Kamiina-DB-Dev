

type Order = 'asc' | 'desc';

function sortEpisodes(mainEl: HTMLElement, order: Order, btnAsc?: HTMLButtonElement | null, btnDesc?: HTMLButtonElement | null) {
  // main.content 直下の section.episode を対象
  const sections = Array.from(mainEl.querySelectorAll<HTMLElement>(':scope > section.episode'));
  sections.sort((a, b) => {
    const ea = parseInt(a.dataset.ep ?? '0', 10);
    const eb = parseInt(b.dataset.ep ?? '0', 10);
    return order === 'asc' ? ea - eb : eb - ea;
  });
  for (const s of sections) mainEl.appendChild(s);

  const asc = order === 'asc';
  btnAsc?.classList.toggle('active', asc);
  btnDesc?.classList.toggle('active', !asc);
  btnAsc?.setAttribute('aria-pressed', String(asc));
  btnDesc?.setAttribute('aria-pressed', String(!asc));
}

function init() {
  const mainEl = document.querySelector<HTMLElement>('main.content');
  if (!mainEl) {
    console.warn('[sortCards] <main class="content"> not found');
    return; // ここで return するので以降は non-null 扱いで安全
  }

  const btnAsc = document.getElementById('btn-asc') as HTMLButtonElement | null;
  const btnDesc = document.getElementById('btn-desc') as HTMLButtonElement | null;

  const toAsc = () => sortEpisodes(mainEl, 'asc', btnAsc, btnDesc);
  const toDesc = () => sortEpisodes(mainEl, 'desc', btnAsc, btnDesc);

  btnAsc?.addEventListener('click', toAsc);
  btnDesc?.addEventListener('click', toDesc);

  // 初期は昇順
  toAsc();
}

// DOM 準備後に初期化（SSR/早期読み込みでも安全）
if (document.readyState === 'loading') {
  window.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
