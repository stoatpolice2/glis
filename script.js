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
   4. ギャラリー フィルター & モーダル拡大表示
   ========================================================= */
const modal = document.getElementById('js-modal');
const modalImg = document.getElementById('js-modal-img');
const modalTitle = document.getElementById('js-modal-title');

let galleryItems = [];
let currentGalleryIndex = 0;
let activeCategory = 'all';

function initGalleryData() {
  const items = document.querySelectorAll('.gallery-grid .gallery-item:not(.hide)');
  galleryItems = Array.from(items).map(item => {
    const img = item.querySelector('img');
    const onclickAttr = item.getAttribute('onclick') || '';
    const matches = onclickAttr.match(/openModal\('(.*?)'\s*,\s*'(.*?)'\)/);

    return {
      // 比較用に相対パスのまま保持
      rawSrc: matches ? matches[1] : '',
      src: img ? img.src : (matches ? matches[1] : ''),
      title: matches ? matches[2] : (img ? img.alt : 'Untitled')
    };
  });
}

const hiddenInAllCategories = ['mmss', 'snss'];

function filterGallery(category) {
  activeCategory = category;
  const items = document.querySelectorAll('.gallery-grid .gallery-item');
  const filterBtns = document.querySelectorAll('.filter-btn');

  // ボタンアクティブ状態の確実な切り替え
  filterBtns.forEach(btn => {
    const btnCategory = btn.getAttribute('data-category');
    if (btnCategory === category) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });

  items.forEach(item => {
    const itemCategories = (item.getAttribute('data-category') || '').split(' ').filter(Boolean);

    if (category === 'all') {
      const hasHiddenCategory = itemCategories.some(cat => hiddenInAllCategories.includes(cat));
      if (hasHiddenCategory) {
        item.classList.add('hide');
      } else {
        item.classList.remove('hide');
      }
    } else {
      if (itemCategories.includes(category)) {
        item.classList.remove('hide');
      } else {
        item.classList.add('hide');
      }
    }
  });

  initGalleryData();
}

function openModalByIndex(index) {
  if (galleryItems.length === 0) initGalleryData();
  if (galleryItems.length === 0) return;

  if (index < 0) {
    currentGalleryIndex = galleryItems.length - 1;
  } else if (index >= galleryItems.length) {
    currentGalleryIndex = 0;
  } else {
    currentGalleryIndex = index;
  }

  const currentItem = galleryItems[currentGalleryIndex];
  if (currentItem && modal && modalImg && modalTitle) {
    modalImg.src = currentItem.src;
    modalTitle.textContent = currentItem.title;
    modal.style.display = 'flex';
  }
}

function openModal(imgSrc, titleText) {
  initGalleryData();
  // 絶対パス・相対パスの両方でマッチング処理
  const index = galleryItems.findIndex(item => {
    return item.rawSrc === imgSrc || item.src.endsWith(imgSrc) || item.src === imgSrc;
  });
  openModalByIndex(index !== -1 ? index : 0);
}

function changeModalImage(step) {
  openModalByIndex(currentGalleryIndex + step);
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

// スクリプト読込時に即時実行する
filterGallery('all');

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