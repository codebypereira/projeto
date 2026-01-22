/**
 * GoalDash - ORQUESTRADOR CENTRAL (main.js)
 * Focado em Stats, History e Controle de Fluxo.
 */

document.addEventListener('DOMContentLoaded', async () => {
    // 1. Inicializa UI comum (Navbar/User)
    if (window.updateUserUI) window.updateUserUI();

    const urlParams = new URLSearchParams(window.location.search);
    const matchId = urlParams.get('id');
    const action = urlParams.get('action');

    // --- REDIRECIONAMENTO DE AUTH (Modais já presentes no HTML) ---
    if (action === 'login') window.openLoginModal();
    if (action === 'register') window.openAuthModal();

    // --- 2. VERIFICAÇÃO DE PÁGINA: HISTORY ---
    if (window.location.pathname.includes('history.html')) {
        if (window.GD_UI && window.GD_UI.renderHistory) {
            window.GD_UI.renderHistory();
        }
    }

    // --- 3. VERIFICAÇÃO DE PÁGINA: STATS ---
    if (window.location.pathname.includes('stats.html')) {
        initStatsPage();
    }

    // --- 4. LOGICA DE JOGOS (HOME/DETAILS) ---
    if (matchId && window.location.pathname.includes('matchdetails.html')) {
        if (window.GD_API && window.GD_API.fetchMatches) {
            try {
                const leagueToLoad = window.currentLeague || 'UEFA_CHAMPIONS_LEAGUE';
                const data = await window.GD_API.fetchMatches(leagueToLoad);
                const matches = Array.isArray(data) ? data : (window.allLoadedMatches || []);
                const match = matches.find(m => String(m.eventID) === String(matchId));
                
                if (match && window.UI && window.UI.renderMatchHeader) {
                    window.UI.renderMatchHeader(match);
                }
            } catch (err) { console.error("Erro detalhes:", err); }
        }
    } else if (document.getElementById('matches-container')) {
        if (window.GD_API && window.GD_API.fetchMatches) {
            const leagueToLoad = window.currentLeague || 'UEFA_CHAMPIONS_LEAGUE';
            await window.GD_API.fetchMatches(leagueToLoad);
        }
    }

    // --- 5. BIND DOS FORMULÁRIOS (LOGIN/REGISTO) ---
    setupAuthListeners();
});

/**
 * CONFIGURAÇÃO DOS LISTENERS DE AUTH
 */
function setupAuthListeners() {
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.onsubmit = async (e) => {
            e.preventDefault();
            const user = document.getElementById('login-user').value.trim();
            const pass = document.getElementById('login-pass').value;
            const res = await window.GD_API.loginUser(user, pass);
            if (res.success) {
                localStorage.setItem('goalDash_username', res.username);
                window.location.reload();
            } else {
                alert(res.error);
            }
        };
    }

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
                alert(result.error);
            }
        };
    }
}

/**
 * LÓGICA DE ESTATÍSTICAS
 */
async function initStatsPage() {
    const popularTeamsData = [
        { name: 'Real Madrid', code: "RMA" }, { name: 'Barcelona', code: "BAR" },
        { name: 'Man. City', code: "MCI" }, { name: 'Liverpool', code: "LIV" },
        { name: 'Bayern Munich', code: "FCB" }, { name: 'Paris SG', code: "PSG" },
        { name: 'Benfica', code: "SLB" }, { name: 'Sporting CP', code: "SCP" },
        { name: 'FC Porto', code: "FCP" }, { name: 'Flamengo', code: "FLA" },
        { name: 'Corinthians', code: "COR" }, { name: 'Al Nassr', code: "ALN" }
    ];

    if (window.UI && window.UI.renderPopularTeams) {
        window.UI.renderPopularTeams(popularTeamsData);
    }

    const searchInput = document.getElementById('teams-search');
    if (searchInput) {
        searchInput.addEventListener('keypress', async (e) => {
            if (e.key === 'Enter') {
                const query = e.target.value.trim();
                if (query.length < 3) return;
                const teamID = await window.GD_API.searchTeamByName(query);
                if (teamID) window.handleTeamClick(teamID);
            }
        });
    }
}

window.handleTeamClick = async (teamID) => {
    if (window.UI.showLoading) window.UI.showLoading('search-results');
    const stats = await window.GD_API.fetchTeamFullStats(teamID);
    if (stats && window.UI.renderTeamDashboard) window.UI.renderTeamDashboard(stats);
};

window.handleTeamClickByCode = async (code, name) => {
    const initialView = document.getElementById('initial-view');
    const resultsContainer = document.getElementById('search-results');
    if (initialView) initialView.classList.add('hidden');
    if (resultsContainer) {
        resultsContainer.classList.remove('hidden');
        if (window.UI.showLoading) window.UI.showLoading('search-results');
    }

    const teamID = await window.GD_API.searchTeamByName(name);
    if (teamID) {
        const stats = await window.GD_API.fetchTeamFullStats(teamID);
        if (stats && window.UI.renderTeamDashboard) {
            stats.code = code;
            window.UI.renderTeamDashboard(stats);
        }
    }
};

/**
 * UTILITÁRIOS GLOBAIS
 */
window.updateUserUI = () => {
    const user = localStorage.getItem('goalDash_username');
    const btn = document.getElementById('user-menu-btn');
    if (!btn) return;

    if (user) {
        btn.innerHTML = `<span class="text-white font-black text-[11px] uppercase">${user}</span>`;
        btn.onclick = () => document.getElementById('user-dropdown')?.classList.toggle('hidden');
    }
};

window.logout = () => {
    localStorage.removeItem('goalDash_username');
    window.location.href = 'index.html';
};

// Funções de Modal (Apenas toggle de classe, já que o HTML já existe)
window.openLoginModal = () => document.getElementById('login-modal')?.classList.replace('hidden', 'flex');
window.openAuthModal = () => document.getElementById('auth-modal')?.classList.replace('hidden', 'flex');
window.closeLoginModal = () => document.getElementById('login-modal')?.classList.replace('flex', 'hidden');
window.closeAuthModal = () => document.getElementById('auth-modal')?.classList.replace('flex', 'hidden');