// Header hide/show
let lastScrollTop = 0;
const header = document.getElementById('header');

window.addEventListener('scroll', () => {
  const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

  if (scrollTop > lastScrollTop) {
    // scroll ke bawah
    header.classList.add('hidden');
    header.classList.remove('show');
  } else {
    // scroll ke atas
    header.classList.remove('hidden');
    header.classList.add('show');
  }
  lastScrollTop = scrollTop <= 0 ? 0 : scrollTop;

  // Efek parallax banner
  const image = document.querySelector('.banner-image');
  if (image) {
    image.style.transform = `translateY(${scrollTop * 0.5}px)`;
  }
});

// Aktifkan menu sesuai halaman
document.querySelectorAll('.nav-link').forEach(link => {
  if (link.getAttribute('href') === window.location.pathname || 
      (window.location.pathname === '/' && link.getAttribute('href') === '#')) {
    link.classList.add('active');
  } else {
    link.classList.remove('active');
  }
});

// API dan rendering data
const grid = document.getElementById('postsGrid');
const paginationContainer = document.getElementById('pagination');
const sortSelect = document.getElementById('sortBy');
const perPageSelect = document.getElementById('perPage');

let currentPage = 1;
let currentSortOrder = 'desc';

// Fungsi utama untuk memuat data dari API
async function loadPosts(page = 1, sortOrder = 'desc') {
  const perPage = perPageSelect ? perPageSelect.value : 10;
  const apiUrl = `https://suitmedia-backend.suitdev.com/api/ideas?page[number]=${page}&page[size]=${perPage}&sort=${sortOrder === 'desc' ? '-published_at' : 'published_at'}`;

  try {
    const resp = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    });
    if (!resp.ok) {
      console.error('console error:', resp.status, resp.statusText);
      return;
    }

    const json = await resp.json();

    // Simpan state
    currentPage = page;
    currentSortOrder = sortOrder;

    renderPosts(json.data);
    renderPagination(json.meta.total);
  } catch (error) {
    console.error('gagal fetch data:', error);
  }
}

// Fungsi untuk menampilkan data ke grid
function renderPosts(posts) {
  grid.innerHTML = '';

  if (!posts || posts.length === 0) {
    grid.innerHTML = '<p>tidak ada data</p>';
    return;
  }

  posts.forEach(item => {
    const card = document.createElement('div');
    card.className = 'card';

    const img = document.createElement('img');
    img.loading = 'lazy';
    img.src = item.image_url || 'https://via.placeholder.com/320x180?text=No+Image';
    img.alt = item.title || 'Image';

    const body = document.createElement('div');
    body.className = 'card-content';

    const title = document.createElement('h3');
    title.textContent = item.title || 'Tanpa Judul';

    const timeTag = document.createElement('time');
    const dateObj = new Date(item.published_at);
    timeTag.textContent = isNaN(dateObj.getTime()) ? '' : dateObj.toLocaleDateString();

    body.appendChild(title);
    body.appendChild(timeTag);
    card.appendChild(img);
    card.appendChild(body);

    grid.appendChild(card);
  });
}

// Fungsi untuk menampilkan pagination
function renderPagination(totalItems) {
  if (!paginationContainer) return;
  paginationContainer.innerHTML = '';

  const perPage = parseInt(perPageSelect ? perPageSelect.value : 10);
  const totalPages = Math.ceil(totalItems / perPage);

  for (let i = 1; i <= totalPages; i++) {
    const btn = document.createElement('button');
    btn.textContent = i;
    if (i === currentPage) btn.disabled = true;
    btn.addEventListener('click', () => {
      loadPosts(i, currentSortOrder);
    });
    paginationContainer.appendChild(btn);
  }
}

// Event listeners
window.addEventListener('DOMContentLoaded', () => {
  // Load data awal
  loadPosts();

  // Event untuk sort
  if (sortSelect) {
    sortSelect.value = 'desc'; // default
    sortSelect.addEventListener('change', () => {
      loadPosts(1, sortSelect.value);
    });
  }

  // Event untuk show per page
  if (perPageSelect) {
    perPageSelect.value = '10'; // default
    perPageSelect.addEventListener('change', () => {
      loadPosts(1, currentSortOrder);
    });
  }
});