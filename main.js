//posisi navbar saat halaman di scroll
let lastScrollTop = 0;
const header = document.getElementById('header');

window.addEventListener('scroll', () => {
  const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

  if (scrollTop > lastScrollTop) {
    header.classList.add('hidden');
    header.classList.remove('show');
  } else {
    header.classList.remove('hidden');
    header.classList.add('show');
  }
  lastScrollTop = scrollTop <= 0 ? 0 : scrollTop;

  //parallax
  const image = document.querySelector('.banner-image');
  if (image) {
    image.style.transform = `translateY(${scrollTop * 0.5}px)`;
  }
});



document.querySelectorAll('.nav-link').forEach(link => {
  if (link.getAttribute('href') === window.location.pathname || 
      (window.location.pathname === '/' && link.getAttribute('href') === '#')) {
    link.classList.add('active');
  } else {
    link.classList.remove('active');
  }
});

// API
const grid = document.getElementById('postsGrid');
const paginationContainer = document.getElementById('pagination');
const sortSelect = document.getElementById('sortBy');
const perPageSelect = document.getElementById('perPage');

let currentPage = 1;
let currentSortOrder = 'desc';
let savedState = {
  page: 1,
  sortOrder: 'desc',
  perPage: 10
};

async function loadPosts(page = 1, sortOrder = 'desc') {
  const perPage = perPageSelect ? parseInt(perPageSelect.value) : 10;
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

    //simpan state
    savedState.page = page;
    savedState.sortOrder = sortOrder;
    savedState.perPage = perPage;
    localStorage.setItem('postsPageState', JSON.stringify(savedState));

    renderPosts(json.data);
    renderPagination(json.meta.total);
  } catch (error) {
    console.error('gagal fetch data:', error);
  }
}


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

function renderPagination(totalItems) {
  if (!paginationContainer) return;
  paginationContainer.innerHTML = '';

  const perPage = savedState.perPage;
  const totalPages = Math.ceil(totalItems / perPage);

  for (let i = 1; i <= totalPages; i++) {
    const btn = document.createElement('button');
    btn.textContent = i;
    if (i === savedState.page) btn.disabled = true;
    btn.addEventListener('click', () => {
      loadPosts(i, savedState.sortOrder);
    });
    paginationContainer.appendChild(btn);
  }
}


window.addEventListener('DOMContentLoaded', () => {
  const storedState = localStorage.getItem('postsPageState');
  if (storedState) {
    savedState = JSON.parse(storedState);
  }

  if (sortSelect) {
    sortSelect.value = savedState.sortOrder;
    sortSelect.addEventListener('change', () => {
      savedState.sortOrder = sortSelect.value;
      savedState.page = 1; //reset ke halaman 1 saat sortir
      localStorage.setItem('postsPageState', JSON.stringify(savedState));
      loadPosts(savedState.page, savedState.sortOrder);
    });
  }

  if (perPageSelect) {
    perPageSelect.value = savedState.perPage;
    perPageSelect.addEventListener('change', () => {
      savedState.perPage = parseInt(perPageSelect.value);
      savedState.page = 1; //reset ke halaman 1 saat ubah page
      localStorage.setItem('postsPageState', JSON.stringify(savedState));
      loadPosts(savedState.page, savedState.sortOrder);
    });
  }

  loadPosts(savedState.page, savedState.sortOrder);
});



const navLinks = document.querySelectorAll('.nav-link');

navLinks.forEach(link => {
  link.addEventListener('click', () => {
    navLinks.forEach(l => l.classList.remove('active'));
    link.classList.add('active');
    localStorage.setItem('activeMenu', link.getAttribute('href'));
  });
});

window.addEventListener('DOMContentLoaded', () => {
  const activeHref = localStorage.getItem('activeMenu');
  if (activeHref) {
    navLinks.forEach(link => {
      if (link.getAttribute('href') === activeHref) {
        link.classList.add('active');
      }
    });
  }
});
