/**
 * GoalDash - ORQUESTRADOR (main.js)
 * Função: Gerenciar interações do usuário, autenticação e fluxo de dados.
 */

// 1. INICIALIZAÇÃO (Ao carregar a página)
document.addEventListener('DOMContentLoaded', () => {
    // Atualiza a área de login/usuário
    if (window.updateUserUI) window.updateUserUI();

    // Busca inicial (Champions League como padrão, igual ao seu antigo)
    if (window.GD_API && window.GD_API.fetchMatches) {
        window.GD_API.fetchMatches('UEFA_CHAMPIONS_LEAGUE');
    }

    // Se estiver na página de estatísticas, desenha os times populares (RMA, BAR, MCI...)
    if (document.getElementById('popular-teams-grid') && window.UI?.renderPopularTeams) {
        window.UI.renderPopularTeams();
    }

    // Configura o formulário de login (se existir no seu HTML)
    const authForm = document.getElementById('auth-form');
    if (authForm) {
        authForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const user = document.getElementById('auth-user').value.trim();
            if (user) {
                localStorage.setItem('goalDash_username', user);
                window.updateUserUI();
                if (window.closeAuthModal) window.closeAuthModal();
            }
        });
    }
});

// 2. GESTÃO DE INTERFACE DO USUÁRIO (Auth)
window.updateUserUI = () => {
    const authArea = document.getElementById('auth-area');
    const loggedUser = localStorage.getItem('goalDash_username');
    if (!authArea) return;

    if (loggedUser) {
        // Mostra o avatar e nome do usuário
        authArea.innerHTML = `
            <div class="flex items-center gap-2 border border-white/10 rounded-full py-1.5 px-4 bg-white/5">
                <div class="w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center text-white text-[10px] font-bold">
                    ${loggedUser.charAt(0).toUpperCase()}
                </div>
                <span class="text-sm font-bold text-white">${loggedUser}</span>
                <button onclick="window.logout()" class="ml-2 text-red-400 hover:text-red-300 text-xs uppercase font-black">Sair</button>
            </div>`;
    } else {
        // Mostra botão de entrar
        authArea.innerHTML = `
            <button onclick="window.openAuthModal()" 
                class="bg-purple-600 text-white px-6 py-2 rounded-lg font-bold text-sm hover:bg-purple-700 transition-all">
                Entrar
            </button>`;
    }
};

window.logout = () => {
    localStorage.removeItem('goalDash_username');
    window.location.reload();
};

// 3. LOGICA DE PALPITES (Abertura do Modal)
window.handlePalpiteClick = (id, home, away) => {
    // Verifica se está logado (igual ao seu código antigo)
    if (!localStorage.getItem('goalDash_username')) {
        alert("Faz login para dar o teu palpite, cria!");
        return window.openAuthModal();
    }

    // Define o jogo ativo no estado global [api.js]
    window.activeGame = { id, home, away };
    
    const modal = document.getElementById('prediction-modal');
    const title = document.getElementById('modal-teams-title');

    if (title) title.innerText = `${home} vs ${away}`;

    if (modal) {
        modal.classList.remove('hidden');
        modal.classList.add('flex');
        setTimeout(() => { modal.classList.add('active'); }, 10);
        document.body.classList.add('modal-open');
    }
};

// 4. PESQUISA E FILTROS
window.handleSearch = (query) => {
    const matches = window.allLoadedMatches || [];
    const term = query.toLowerCase().trim();
    
    if (!term) {
        window.UI.renderMatches('matches-container', matches);
        return;
    }

    const filtrados = matches.filter(m => {
        const h = (m.teams?.home?.names?.medium || "").toLowerCase();
        const a = (m.teams?.away?.names?.medium || "").toLowerCase();
        return h.includes(term) || a.includes(term);
    });

    window.UI.renderMatches('matches-container', filtrados);
};

window.changeSport = (id, name) => {
    const titleElement = document.getElementById('current-league-title');
    if (titleElement) titleElement.innerText = name ? name.toUpperCase() : "LIGA SELECIONADA";
    
    if (window.GD_API) window.GD_API.fetchMatches(id);
};