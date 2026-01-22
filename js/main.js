/**
 * GoalDash - ORQUESTRADOR CENTRAL (main.js)
 * Versão Consolidada: Auth + Deep Search + Palpites
 */

document.addEventListener('DOMContentLoaded', async () => {
    // 1. INICIALIZAÇÃO DE INTERFACE
    if (window.updateUserUI) window.updateUserUI();

    // 2. CARREGAMENTO DE DADOS (Página Inicial ou Detalhes)
    const urlParams = new URLSearchParams(window.location.search);
    const matchId = urlParams.get('id');

    if (matchId && window.GD_API && window.GD_API.fetchMatches) {
        // Lógica para carregar um jogo específico (Detalhes)
        try {
            await window.GD_API.fetchMatches('UEFA_CHAMPIONS_LEAGUE');
            const match = (window.allLoadedMatches || []).find(m => String(m.eventID) === String(matchId));
            
            if (match && window.UI && window.UI.renderMatchHeader) {
                window.UI.renderMatchHeader(match);
            }
        } catch (err) { console.error("Erro ao carregar detalhe:", err); }
    } else if (window.GD_API && window.GD_API.fetchMatches) {
        // Carregamento normal da Home
        window.GD_API.fetchMatches('UEFA_CHAMPIONS_LEAGUE');
        if (window.GD_API.fetchLiveMatches) window.GD_API.fetchLiveMatches('UEFA_CHAMPIONS_LEAGUE');
    }

    // 3. FORMULÁRIO DE LOGIN
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.onsubmit = async (e) => {
            e.preventDefault();
            const user = document.getElementById('login-user').value.trim();
            const pass = document.getElementById('login-pass').value;
            const btn = loginForm.querySelector('button[type="submit"]');

            btn.innerText = "A ENTRAR...";
            const res = await window.GD_API.loginUser(user, pass);
            if (res.success) {
                localStorage.setItem('goalDash_username', res.username);
                window.location.reload();
            } else {
                alert(res.error);
                btn.innerText = "ENTRAR";
            }
        };
    }

    // 4. FORMULÁRIO DE REGISTRO
    const authForm = document.getElementById('auth-form');
    if (authForm) {
        authForm.onsubmit = async (e) => {
            e.preventDefault();
            const userData = {
                username: document.getElementById('auth-user').value.trim(),
                email: document.getElementById('auth-email').value.trim(),
                password: document.getElementById('auth-pass').value,
                createdAt: new Date().toISOString()
            };

            const result = await window.GD_API.registerUser(userData);
            if (result.success) {
                localStorage.setItem('goalDash_username', userData.username);
                window.location.reload();
            } else {
                alert(result.error || "Erro no registo");
            }
        };
    }

    // 5. BUSCA (ENTER NO INPUT)
    const searchInput = document.getElementById('teams-search');
    if (searchInput) {
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                const query = searchInput.value.trim();
                if (query.length > 2) window.handleDeepSearch(query);
            }
        });
    }
});

// --- FUNÇÕES GLOBAIS (FORA DO DOMCONTENTLOADED) ---

window.updateUserUI = () => {
    const user = localStorage.getItem('goalDash_username');
    const userMenuBtn = document.getElementById('user-menu-btn');
    const userDropdown = document.getElementById('user-dropdown');
    const authLinks = document.getElementById('auth-links-container');

    if (!userMenuBtn) return;

    if (user) {
        if (authLinks) authLinks.style.display = 'none';
        userMenuBtn.innerHTML = `
            <div class="flex items-center gap-3 bg-white/5 border border-white/10 py-2 px-4 rounded-xl cursor-pointer">
                <span class="text-[11px] font-black uppercase text-white">${user}</span>
                <div class="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
                    <span class="text-white font-black text-xs">${user[0].toUpperCase()}</span>
                </div>
            </div>`;
        userMenuBtn.onclick = (e) => {
            e.stopPropagation();
            if (userDropdown) userDropdown.classList.toggle('hidden');
        };
    }
};

window.handleDeepSearch = (query) => {
    const term = query.toLowerCase();
    const filtrados = (window.allLoadedMatches || []).filter(m => 
        m.teams.home.names.medium.toLowerCase().includes(term) || 
        m.teams.away.names.medium.toLowerCase().includes(term)
    );
    if (window.UI && window.UI.renderMatches) {
        window.UI.renderMatches('matches-container', filtrados);
    }
};

window.changeSport = (id, name) => {
    const title = document.getElementById('current-league-title');
    if (title) title.innerText = name.toUpperCase();
    if (window.GD_API && window.GD_API.fetchMatches) {
        window.GD_API.fetchMatches(id);
        window.GD_API.fetchLiveMatches(id);
    }
};

window.logout = () => { localStorage.removeItem('goalDash_username'); window.location.reload(); };
window.openAuthModal = () => document.getElementById('auth-modal')?.classList.remove('hidden');
window.closeAuthModal = () => document.getElementById('auth-modal')?.classList.add('hidden');