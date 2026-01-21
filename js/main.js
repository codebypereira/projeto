/**
 * GoalDash - ORQUESTRADOR (main.js)
 * Função: Gerenciar interações do usuário, autenticação e fluxo de dados.
 */

document.addEventListener('DOMContentLoaded', () => {
    // 1. Atualiza a área de login/usuário
    if (window.updateUserUI) window.updateUserUI();

    // 2. Fluxo Condicional: Live vs Home
    const liveContainer = document.getElementById('live-matches-container');
    const matchesContainer = document.getElementById('matches-container');

    if (liveContainer) {
        // --- LÓGICA PARA PÁGINA LIVE ---
        window.changeSport('LA_LIGA'); // Inicia com La Liga
        
        // Loop de atualização automática (30 segundos)
        setInterval(() => {
            if (window.fetchLiveMatches) {
                // Pega a liga que está ativa no momento ou usa a padrão
                window.fetchLiveMatches(window.currentLeague || 'LA_LIGA');
            }
        }, 30000);

    } else if (matchesContainer) {
        // --- LÓGICA PARA HOME ---
        if (window.GD_API && window.GD_API.fetchMatches) {
            window.GD_API.fetchMatches(window.currentLeague || 'EPL');
        }
    }

    // 3. Estatísticas Popular Teams
    if (document.getElementById('popular-teams-grid') && window.UI?.renderPopularTeams) {
        window.UI.renderPopularTeams();
    }

    // 4. Configura o formulário de login
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

/**
 * GESTÃO DE INTERFACE E MODAIS
 */
window.openAuthModal = () => {
    const modal = document.getElementById('auth-modal');
    if (modal) modal.classList.remove('hidden');
};

window.closeAuthModal = () => {
    const modal = document.getElementById('auth-modal');
    if (modal) modal.classList.add('hidden');
};

window.updateUserUI = () => {
    const authArea = document.getElementById('user-area'); // Ajustado para o ID do seu nav
    const loggedUser = localStorage.getItem('goalDash_username');
    if (!authArea) return;

    if (loggedUser) {
        authArea.innerHTML = `
            <div class="flex items-center gap-2 border border-white/10 rounded-full py-1.5 px-4 bg-white/5">
                <div class="w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center text-white text-[10px] font-bold">
                    ${loggedUser.charAt(0).toUpperCase()}
                </div>
                <span class="text-sm font-bold text-white">${loggedUser}</span>
                <button onclick="window.logout()" class="ml-2 text-red-400 hover:text-red-300 text-[10px] font-black cursor-pointer">SAIR</button>
            </div>`;
    }
};

window.logout = () => {
    localStorage.removeItem('goalDash_username');
    window.location.reload();
};

/**
 * LÓGICA DE CLIQUE E BUSCA
 */
window.changeSport = (id, name) => {
    window.currentLeague = id; // Atualiza a liga globalmente
    
    const titleElement = document.getElementById('current-league-title');
    if (titleElement && name) titleElement.innerText = name.toUpperCase();
    
    // Se estiver na página de Live, chama API de Live, senão chama API normal
    if (document.getElementById('live-matches-container')) {
        if (window.fetchLiveMatches) window.fetchLiveMatches(id);
    } else {
        if (window.GD_API) window.GD_API.fetchMatches(id);
    }
};

window.handlePalpiteClick = (id, home, away) => {
    if (!localStorage.getItem('goalDash_username')) {
        alert("Faz login para dar o teu palpite, cria!");
        return window.openAuthModal();
    }
    window.activeGame = { id, home, away };
    const modal = document.getElementById('prediction-modal');
    const title = document.getElementById('modal-teams-title');
    if (title) title.innerText = `${home} vs ${away}`;
    if (modal) modal.classList.remove('hidden');
};