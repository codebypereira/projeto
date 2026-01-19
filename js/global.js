/**
 * MÓDULO: Gestor de Layout e Navegação
 * DESCRIÇÃO: Centraliza a renderização de componentes globais (Header e Footer Mobile)
 * e gere estados de interface comuns a todas as páginas do sistema.
 */

/**
 * Função: loadLayout
 * Atua como o motor de renderização de componentes transversais.
 * Utiliza Template Literals para injetar fragmentos de HTML no DOM, garantindo
 * consistência visual entre diferentes rotas sem redundância de código.
 */
function loadLayout() {
    // Recuperação do estado de autenticação para renderização condicional
    const loggedUser = localStorage.getItem("goalDash_username");

    // Componente: HEADER (Global)
    // Implementa efeitos de glassmorfismo e lógica de autenticação integrada.
    const headerHTML = `
    <header class="border-b border-gray-200 bg-white/80 backdrop-blur-md fixed top-0 left-0 right-0 z-[90]">
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

    // Componente: FOOTER MENU (Mobile-First)
    // Otimizado para UX em dispositivos táteis, utilizando blur de fundo e ícones SVG.
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

    // Injeção de componentes no início e fim do Body
    document.body.insertAdjacentHTML("afterbegin", headerHTML);
    document.body.insertAdjacentHTML("beforeend", footerMenu);

    // Inicialização de comportamentos de navegação
    initNav();
}

/**
 * Função: initNav
 * Gere o estado ativo dos itens de navegação mobile e previne comportamentos padrão
 * em ligações nulas. Implementa lógica de deteção de rota para destaque visual.
 */
function initNav() {
    const items = document.querySelectorAll(".nav-item");
    if (items.length === 0) return;

    items.forEach((item) => {
        item.addEventListener("click", (e) => {
            if (item.getAttribute("href") === "#") e.preventDefault();

            // Atualização de estado visual (Clean-up de classes)
            items.forEach((i) => i.classList.remove("nav-active"));
            item.classList.add("nav-active");
        });
    });

    // Deteção Automática: Marca o botão 'Início' se o utilizador estiver na Home.
    const homeBtn = document.getElementById('nav-home');
    if (homeBtn && (window.location.pathname.includes('index.html') || window.location.pathname === "/")) {
        homeBtn.classList.add("nav-active");
    }
}

// ============================================================================
// SISTEMA DE MODAIS (Autenticação)
// ============================================================================

/**
 * Funções: openAuthModal / closeAuthModal
 * Gere o ciclo de vida dos modais de autenticação, controlando classes de 
 * animação (transições CSS) e o estado de scroll do body.
 */
function openAuthModal() {
    const modal = document.getElementById('auth-modal');
    if (modal) {
        modal.classList.remove('hidden');
        modal.classList.add('flex');
        
        // Timeout para garantir o trigger da animação de opacidade após a mudança de display
        setTimeout(() => { modal.classList.add('active'); }, 10); 
        document.body.classList.add('modal-open');
    }
}

function closeAuthModal() {
    const modal = document.getElementById('auth-modal');
    if (modal) {
        modal.classList.remove('active');
        // Delay para permitir a conclusão da transição visual de saída
        setTimeout(() => {
            modal.classList.add('hidden');
            modal.classList.remove('flex');
            document.body.classList.remove('modal-open');
        }, 300);
    }
}

// ============================================================================
// EVENT LISTENERS E GESTÃO DE EVENTOS (Global)
// ============================================================================

/**
 * Event Delegation: Fecha o modal se o utilizador clicar fora da área de conteúdo.
 */
document.addEventListener('click', (e) => {
    const modal = document.getElementById('auth-modal');
    if (e.target === modal) closeAuthModal();
});

/**
 * Window Event: Gere o fecho de dropdowns de utilizador ao clicar fora do componente.
 */
window.onclick = function (event) {
    if (!event.target.matches("#user-menu-btn") && !event.target.closest("#user-menu-btn")) {
        const dropdown = document.getElementById("user-dropdown");
        if (dropdown && !dropdown.classList.contains("hidden")) {
            dropdown.classList.add("hidden");
        }
    }
};

// Exposição de funções para o âmbito global (necessário para onclick em HTML dinâmico)
window.openAuthModal = openAuthModal;
window.closeAuthModal = closeAuthModal;

/**
 * Função: toggleDropdown
 * Controla a visibilidade do menu de utilizador (Desktop).
 */
window.toggleDropdown = (e) => {
    e.stopPropagation();
    document.getElementById("user-dropdown")?.classList.toggle("hidden");
};

/**
 * Função: logout
 * Termina a sessão do utilizador limpando o LocalStorage e reiniciando o estado.
 */
window.logout = () => {
    localStorage.removeItem("goalDash_username");
    window.location.reload();
};

/**
 * Bootstrap: Inicializa a construção do layout após o carregamento completo do DOM.
 */
document.addEventListener("DOMContentLoaded", loadLayout);