/* =========================================================
   0. 共通便利関数（ページトップへ戻るボタンの表示判定）
   ========================================================= */
const pageTopBtn = document.getElementById('js-pagetop');

  // ボタンの表示/非表示を判定する関数
function checkPageTopBtn() {
  if (!pageTopBtn) return;
  // ★ 100px 以上スクロールで表示
  if (window.scrollY > 100) {
    pageTopBtn.classList.add('show');
  } else {
    pageTopBtn.classList.remove('show');
  }
}

/* =========================================================
   1. セクション切り替え & ハッシュ制御
   ========================================================= */
const navLinks = document.querySelectorAll('.nav-link');
const sections = document.querySelectorAll('.content-section');
const navMenu = document.getElementById('js-nav-menu');

function switchSection(targetId) {
  sections.forEach(sec => sec.classList.remove('active'));
  navLinks.forEach(link => link.classList.remove('active'));

  const targetSection = document.getElementById(targetId);
  if (targetSection) {
    targetSection.classList.add('active');
    const activeLink = document.querySelector(`.nav-link[data-target="${targetId}"]`);
    if (activeLink) activeLink.classList.add('active');
  }

  if (navMenu) navMenu.classList.remove('open');

  // セクション切替時にページ先頭へスクロールし、TOPボタンの状態を更新
  window.scrollTo(0, 0);
  checkPageTopBtn();
}

navLinks.forEach(link => {
  link.addEventListener('click', (e) => {
    // e.target ではなく e.currentTarget を使用して確実に要素を取得
    const target = e.currentTarget.getAttribute('data-target');
    if (target) {
      switchSection(target);
      location.hash = target;
    }
  });
});

window.addEventListener('load', () => {
  const hash = location.hash.replace('#', '');
  if (hash && document.getElementById(hash)) {
    switchSection(hash);
  }
});

/* =========================================================
   2. ハンバーガーメニュー
   ========================================================= */
const hamburger = document.getElementById('js-hamburger');
if (hamburger && navMenu) {
  hamburger.addEventListener('click', () => {
    navMenu.classList.toggle('open');
  });
}

/* =========================================================
   3. TOP ヒーロー自動スライダー
   ========================================================= */
const heroTrack = document.getElementById('js-hero-track');
const heroSlides = document.querySelectorAll('.hero-slide');
let currentHeroIndex = 0;

function autoSlideHero() {
  if (!heroTrack || heroSlides.length === 0) return;
  currentHeroIndex = (currentHeroIndex + 1) % heroSlides.length;
  heroTrack.style.transform = `translateX(-${currentHeroIndex * 100}%)`;
}

if (heroTrack && heroSlides.length > 0) {
  setInterval(autoSlideHero, 5000);
}

/* =========================================================
   4. ギャラリー & LOGS フィルター & モーダル拡大表示
   ========================================================= */
const modal = document.getElementById('js-modal');
const modalImg = document.getElementById('js-modal-img');
const modalTitle = document.getElementById('js-modal-title');

let activeModalItems = []; // 現在開いているセクション（GALLERYまたはLOGS）の画像リスト
let currentModalIndex = 0;

// 現在表示されているセクションの画像データを初期化・取得
function initActiveModalData() {
  // 現在アクティブなセクションを取得
  const activeSection = document.querySelector('.content-section.active');
  if (!activeSection) return;

  // GALLERYまたはLOGS内の「非表示(hide)になっていないアイテム」を取得
  const items = activeSection.querySelectorAll('.gallery-grid .gallery-item:not(.hide), .corkboard-grid .scrap-item:not(.hide)');
  
  activeModalItems = Array.from(items).map(item => {
    const img = item.querySelector('img');
    const onclickAttr = item.getAttribute('onclick') || '';
    const matches = onclickAttr.match(/openModal\('(.*?)'\s*,\s*'(.*?)'\)/);

    return {
      rawSrc: matches ? matches[1] : '',
      src: img ? img.src : (matches ? matches[1] : ''),
      title: matches ? matches[2] : (img ? img.alt : 'Untitled')
    };
  });
}

// GALLERY用 フィルター
const hiddenInAllCategories = ['mmss', 'snss'];

function filterGallery(category) {
  const items = document.querySelectorAll('#gallery .gallery-item');
  const filterBtns = document.querySelectorAll('#gallery .filter-btn');

  filterBtns.forEach(btn => {
    btn.classList.toggle('active', btn.getAttribute('data-category') === category);
  });

  items.forEach(item => {
    const itemCategories = (item.getAttribute('data-category') || '').split(' ').filter(Boolean);

    if (category === 'all') {
      const hasHiddenCategory = itemCategories.some(cat => hiddenInAllCategories.includes(cat));
      item.classList.toggle('hide', hasHiddenCategory);
    } else {
      item.classList.toggle('hide', !itemCategories.includes(category));
    }
  });

  initActiveModalData();
}

// LOGS用 フィルター
const hiddenInLogsAllCategories = ['mmss', 'snss'];

function filterLogs(category) {
  const items = document.querySelectorAll('#logs .scrap-item');
  const filterBtns = document.querySelectorAll('#logs .filter-btn');

  filterBtns.forEach(btn => {
    btn.classList.toggle('active', btn.getAttribute('data-category') === category);
  });

  items.forEach(item => {
    const itemCategories = (item.getAttribute('data-category') || '').split(' ').filter(Boolean);

    if (category === 'all') {
      // ALL選択時：隠す対象カテゴリが含まれているか判定
      const hasHiddenCategory = itemCategories.some(cat => hiddenInLogsAllCategories.includes(cat));
      item.classList.toggle('hide', hasHiddenCategory);
    } else {
      // 特定カテゴリ選択時：該当カテゴリがあれば表示
      item.classList.toggle('hide', !itemCategories.includes(category));
    }
  });

  initActiveModalData();
}

// モーダル表示処理
function openModalByIndex(index) {
  initActiveModalData();
  if (activeModalItems.length === 0) return;

  if (index < 0) {
    currentModalIndex = activeModalItems.length - 1;
  } else if (index >= activeModalItems.length) {
    currentModalIndex = 0;
  } else {
    currentModalIndex = index;
  }

  const currentItem = activeModalItems[currentModalIndex];
  if (currentItem && modal && modalImg && modalTitle) {
    modalImg.src = currentItem.src;
    modalTitle.textContent = currentItem.title;
    modal.style.display = 'flex';
  }
}

function openModal(imgSrc, titleText) {
  initActiveModalData();
  const index = activeModalItems.findIndex(item => {
    return item.rawSrc === imgSrc || item.src.endsWith(imgSrc) || item.src === imgSrc;
  });
  openModalByIndex(index !== -1 ? index : 0);
}

function changeModalImage(step) {
  openModalByIndex(currentModalIndex + step);
}

function closeModal() {
  if (modal) modal.style.display = 'none';
}

document.addEventListener('keydown', (e) => {
  if (modal && window.getComputedStyle(modal).display === 'flex') {
    if (e.key === 'ArrowLeft') changeModalImage(-1);
    if (e.key === 'ArrowRight') changeModalImage(1);
    if (e.key === 'Escape') closeModal();
  }
});

window.addEventListener('DOMContentLoaded', () => {
  filterGallery('all');
  filterLogs('all');
});
/* =========================================================
   5. 素材配布 手動スライダー (キャラクター別)
   ========================================================= */
const assetPositions = {
  char1: 0,
  char2: 0,
  char3: 0,
  char4: 0
};

function moveAssetSlide(charId, direction) {
  const track = document.getElementById(`track-${charId}`);
  if (!track) return;

  const items = track.querySelectorAll('.asset-item');
  if (items.length === 0) return;

  const itemWidth = items[0].getBoundingClientRect().width + 16;
  const maxIndex = items.length - 1;

  assetPositions[charId] = (assetPositions[charId] || 0) + direction;

  if (assetPositions[charId] < 0) assetPositions[charId] = 0;
  if (assetPositions[charId] > maxIndex) assetPositions[charId] = maxIndex;

  track.style.transform = `translateX(-${assetPositions[charId] * itemWidth}px)`;
}

/* =========================================================
   6. ページトップへ戻るボタンのイベント登録
   ========================================================= */
if (pageTopBtn) {
  // スクロール時に表示切り替え
  window.addEventListener('scroll', checkPageTopBtn);

  // クリック時にスムーズスクロールでページ先頭へ移動
  pageTopBtn.addEventListener('click', () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  });
}