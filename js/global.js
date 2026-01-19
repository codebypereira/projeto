function loadLayout() {
  const loggedUser = localStorage.getItem("goalDash_username");

  //Injetar HEADER
  const headerHTML = `<header class="border-b border-gray-200 bg-white/80 backdrop-blur-md fixed top-0 left-0 right-0 z-[90]">
        <div class="container mx-auto sm:px-4 px-2 py-3">
            <div class="flex items-center justify-between gap-2 h-10">
                <a href="index.html" class="flex items-center gap-2 shrink-0 group">
                    <div class="bg-gradient-to-r from-pink-500 to-purple-600 p-1.5 rounded-lg shadow-sm group-hover:opacity-90 transition-opacity">
                        <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 text-white transition-all duration-300 transform group-hover:-translate-y-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                          <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"></path>
                          <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"></path>
                          <path d="M4 22h16"></path>
                          <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"></path>
                          <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"></path>
                          <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"></path>
                        </svg>
                    </div>
                    <span class="text-lg md:text-[1.4em] sm:text-2xl bg-gradient-to-r from-pink-500 to-purple-600 text-transparent bg-clip-text font-bold tracking-tighter">
                        Goal Dash
                    </span>
                </a>

                <nav class="flex-1">
                    <ul class="hidden md:flex items-center justify-center gap-4 sm:gap-8 text-[14px] sm:text-base text-gray-600 font-bold md:flex">
                        <li><a href="index.html" class="hover:text-purple-600 transition-colors">Início</a></li>
                        <li><a href="live.html" class="hover:text-purple-600 transition-colors">Ao Vivo</a></li>
                        <li><a href="stats.html" class="hover:text-purple-600 transition-colors">Estatísticas</a></li>
                    </ul>
                </nav>

                <div id="auth-area" class="flex items-center gap-3">
                    ${loggedUser ? `
                        <div class="relative">
                            <button onclick="toggleDropdown(event)" id="user-menu-btn" class="flex items-center gap-2 bg-gray-100/50 hover:bg-gray-100 px-3 py-1.5 rounded-full transition-all cursor-pointer">
                                <div class="w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center text-white text-[10px] font-bold">
                                    ${loggedUser.charAt(0).toUpperCase()}
                                </div>
                                <span class="text-sm font-bold text-gray-700">${loggedUser}</span>
                            </button>
                            </div>
                    ` : `
                        <button onclick="openAuthModal()" class="bg-purple-600 text-white px-4 py-1.5 rounded-lg font-bold text-sm hover:bg-purple-700 transition-all cursor-pointer">
                            Entrar
                        </button>
                    `}
                </div>
            </div>
        </div>
    </header>`;

  //Injetar menu (mobile)
  const footerMenu = `
    <div class="md:hidden fixed bottom-4 left-4 right-4 bg-white/10 backdrop-blur-xl border border-white/20 px-6 py-3 z-[100] flex justify-between items-center rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.37)] sm:hidden">
      <a href="index.html" id="nav-home" class="nav-item flex flex-col items-center gap-1 text-gray-300 transition-all active:scale-95">
        <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
        <span class="text-[10px] font-bold uppercase tracking-tighter">Início</span>
      </a>

      <a href="live.html" id="nav-live" class="nav-item flex flex-col items-center gap-1 text-gray-300 hover:text-white transition-all active:scale-95">
        <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
        <span class="text-[10px] font-bold uppercase tracking-tighter">Ao Vivo</span>
      </a>
      <a href="stats.html" id="nav-stats" class="nav-item flex flex-col items-center gap-1 text-gray-300 hover:text-white transition-all active:scale-95">
        <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
        <span class="text-[10px] font-bold uppercase tracking-tighter">Estatísticas</span>
      </a>
    </div>`;
  document.body.insertAdjacentHTML("afterbegin", headerHTML);
  document.body.insertAdjacentHTML("beforeend", footerMenu);

  initNav();
}

//Animação de botão ativo para nav (mobile)
function initNav() {
  const items = document.querySelectorAll(".nav-item");

  if (items.length === 0) return;

  items.forEach((item) => {
    item.addEventListener("click", (e) => {
      if (item.getAttribute("href") === "#") e.preventDefault();

      items.forEach((i) => i.classList.remove("nav-active"));
      item.classList.add("nav-active");
      console.log(`Botão ativo: ${item.id}`);
    });
  });

  const homeBtn = document.getElementById('nav-home');
  if (homeBtn && (window.location.pathname.includes('index.html') || window.location.pathname === "/")) {
    homeBtn.classList.add("nav-active");
  }
}

//Funçao para abrir modal de autenticação
function openAuthModal() {
  const modal = document.getElementById('auth-modal');
  if (modal) {
    modal.classList.remove('hidden');
    modal.classList.add('flex');

    setTimeout(() => {
      modal.classList.add('active');
    }, 10); 

    document.body.classList.add('modal-open');
  }
}

//Função para fechar modal de autenticação
function closeAuthModal() {
  const modal = document.getElementById('auth-modal');
  if (modal) {
    modal.classList.remove('active');

    setTimeout(() => {
      modal.classList.add('hidden');
      modal.classList.remove('flex');
      document.body.classList.remove('modal-open')
    }, 300)

  }
}

document.addEventListener('click', (e) => {
  const modal = document.getElementById('auth-modal');
  if (e.target === modal) {
    closeAuthModal();
  }
});

window.onclick = function (event) {
  if (!event.target.matches("#user-menu-btn") && !event.target.closest("#user-menu-btn")) {
    const dropdown = document.getElementById("user-dropdown");
    if (dropdown && !dropdown.classList.contains("hidden")) {
      dropdown.classList.add("hidden");
    }
  }
};

window.openAuthModal = openAuthModal;
window.closeAuthModal = closeAuthModal;

window.toggleDropdown = (e) => {
  e.stopPropagation();
  document.getElementById("user-dropdown")?.classList.toggle("hidden");
};

window.logout = () => {
  localStorage.removeItem("goalDash_username");
  window.location.reload();
};

document.addEventListener("DOMContentLoaded", loadLayout);
