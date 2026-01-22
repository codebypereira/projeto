/**
 * GoalDash - ORQUESTRADOR CENTRAL (main.js)
 * Versão Final: Stats, Auth Global, Matches e History integrados com Limpeza de Dados.
 */

document.addEventListener('DOMContentLoaded', async () => {
    // 1. Inicializa UI comum (Navbar/User)
    if (window.updateUserUI) window.updateUserUI();

    const urlParams = new URLSearchParams(window.location.search);
    const matchId = urlParams.get('id');
    const action = urlParams.get('action');

    // --- REDIRECIONAMENTO DE AUTH ---
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

    // --- 4. LÓGICA DE JOGOS (HOME/DETAILS) ---
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
 * CONFIGURAÇÃO DOS LISTENERS DE AUTH (Com Feedbacks Visuais)
 */
function setupAuthListeners() {
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.onsubmit = async (e) => {
            e.preventDefault();
            const user = document.getElementById('login-user').value.trim();
            const pass = document.getElementById('login-pass').value;
            const btn = loginForm.querySelector('button[type="submit"]');
            const msg = document.getElementById('login-message');

            if (btn) { btn.innerText = "A ENTRAR..."; btn.disabled = true; }

            const res = await window.GD_API.loginUser(user, pass);
            if (res.success) {
                localStorage.setItem('goalDash_username', res.username);
                window.location.reload();
            } else {
                if (msg) {
                    msg.innerText = res.error;
                    msg.classList.remove('hidden');
                    msg.className = "p-4 rounded-2xl bg-red-50 text-red-500 text-[14px] font-bold text-center mt-2 border border-red-100";
                }
                if (btn) { btn.innerText = "Entrar"; btn.disabled = false; }
            }
        };
    }

    const authForm = document.getElementById('auth-form');
    if (authForm) {
        authForm.onsubmit = async (e) => {
            e.preventDefault();
            const submitBtn = authForm.querySelector('button[type="submit"]');
            const messageBox = document.getElementById('auth-message');

            if (submitBtn) { submitBtn.innerText = "A VALIDAR..."; submitBtn.disabled = true; }

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
                if (messageBox) {
                    messageBox.innerText = result.error;
                    messageBox.classList.remove('hidden');
                    messageBox.style.cssText = "display: block; background: rgba(239,68,68,0.15); color: #ff4444; border: 1px solid rgba(255,68,68,0.3); padding: 12px; font-size: 14px; font-weight: 800; border-radius: 8px; margin-top: 15px;";
                }
                if (submitBtn) { submitBtn.innerText = "Criar Conta"; submitBtn.disabled = false; }
            }
        };
    }
}

/**
 * LÓGICA DE PALPITES
 */
window.handlePalpiteClick = (id, home, away) => {
    const user = localStorage.getItem('goalDash_username');
    if (!user) { 
        window.openAuthModal(); 
        return; 
    }

    window.activeGame = { id, home, away };
    const homeNameEl = document.getElementById('modal-home-name');
    const awayNameEl = document.getElementById('modal-away-name');
    if (homeNameEl) homeNameEl.innerText = home;
    if (awayNameEl) awayNameEl.innerText = away;

    const modal = document.getElementById('prediction-modal');
    if (modal) { modal.classList.remove('hidden'); modal.classList.add('flex'); }
};

window.handlePredictionSubmit = async () => {
    const homeScore = document.getElementById('modal-home-score').value;
    const awayScore = document.getElementById('modal-away-score').value;
    const btn = event.currentTarget;

    if (homeScore === "" || awayScore === "") { alert("Preenche os placares, cria!"); return; }

    btn.innerText = "A ENVIAR...";
    btn.disabled = true;

    const success = await window.GD_API.submitPrediction(homeScore, awayScore);
    if (success) {
        const historico = JSON.parse(localStorage.getItem('goalDash_history') || '[]');
        historico.unshift({
            id: window.activeGame.id,
            homeTeam: window.activeGame.home,
            awayTeam: window.activeGame.away,
            homeScore, awayScore,
            date: new Date().toLocaleDateString('pt-PT', { day:'2-digit', month:'2-digit', year:'numeric', hour:'2-digit', minute:'2-digit'})
        });
        localStorage.setItem('goalDash_history', JSON.stringify(historico));
        alert("Palpite enviado!");
        document.getElementById('prediction-modal').classList.add('hidden');
    } else { 
        alert("Erro ao enviar."); 
    }
    btn.innerText = "Enviar Palpite"; btn.disabled = false;
};

/**
 * LÓGICA DE HISTÓRICO
 */
window.clearHistory = () => {
    if (confirm("Tens a certeza que queres apagar todos os teus palpites, cria?")) {
        localStorage.removeItem('goalDash_history');
        window.location.reload();
    }
};

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
        { name: 'Palmeiras', code: "PAL" }, { name: 'Al Nassr', code: "ALN" }
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
 * FUNÇÕES GLOBAIS DE UI
 */
window.updateUserUI = () => {
    const user = localStorage.getItem('goalDash_username');
    const userMenuBtn = document.getElementById('user-menu-btn');
    const userDropdown = document.getElementById('user-dropdown');
    const authLinksContainer = document.getElementById('auth-links-container');

    if (!userMenuBtn) return;

    if (user) {
        if (authLinksContainer) authLinksContainer.style.display = 'none';
        userMenuBtn.onclick = (e) => {
            e.stopPropagation();
            if (userDropdown) userDropdown.classList.toggle('hidden');
        };

        userMenuBtn.innerHTML = `
            <div class="flex items-center gap-3 bg-white/5 border border-white/10 py-2 px-4 rounded-xl hover:bg-white/10 transition-all cursor-pointer">
                <span class="text-[11px] font-black uppercase tracking-wider text-white">${user}</span>
                <div class="w-8 h-8 bg-[#9333ea] rounded-lg flex items-center justify-center shadow-lg shadow-purple-500/20">
                    <span class="text-white font-black text-xs">${user.charAt(0).toUpperCase()}</span>
                </div>
            </div>
        `;

        if (userDropdown) {
            userDropdown.innerHTML = `
                <div class="p-4 border-b border-white/5 bg-white/[0.02]">
                    <p class="text-[9px] text-white/40 uppercase font-black tracking-[2px]">A Minha Conta</p>
                </div>
                <a href="history.html" class="flex items-center gap-3 w-full text-left p-4 hover:bg-white/5 text-white text-[10px] font-black uppercase tracking-widest transition-all">
                    <span class="text-purple-500 text-sm">⌛</span> Meus Palpites
                </a>
                <button onclick="window.logout()" class="flex items-center gap-3 w-full text-left p-4 hover:bg-red-500/10 text-red-500 text-[10px] font-black uppercase tracking-widest transition-all border-t border-white/5">
                    <span class="text-sm">🚪</span> Sair da Conta
                </button>
            `;
        }
    } else {
        if (authLinksContainer) authLinksContainer.style.display = 'block';
        userMenuBtn.onclick = () => window.openAuthModal();
        userMenuBtn.innerHTML = `<span class="text-[11px] font-black uppercase tracking-[2px] text-white hover:text-purple-400 transition-colors cursor-pointer">Criar Conta</span>`;
    }
};

window.logout = () => {
    localStorage.removeItem('goalDash_username');
    window.location.href = 'index.html'; 
};

// --- MODAIS GLOBAIS ---
window.openLoginModal = () => { 
    const m = document.getElementById('login-modal'); 
    if(m) { m.classList.remove('hidden'); m.classList.add('flex'); } 
};
window.openAuthModal = () => { 
    const m = document.getElementById('auth-modal'); 
    if(m) { m.classList.remove('hidden'); m.classList.add('flex'); } 
};
window.closeLoginModal = () => document.getElementById('login-modal').classList.add('hidden');
window.closeAuthModal = () => document.getElementById('auth-modal').classList.add('hidden');
window.switchToLogin = () => { window.closeAuthModal(); window.openLoginModal(); };
window.switchToRegister = () => { window.closeLoginModal(); window.openAuthModal(); };

document.addEventListener('click', (e) => {
    const userDropdown = document.getElementById('user-dropdown');
    const userMenuBtn = document.getElementById('user-menu-btn');
    if (userDropdown && userMenuBtn && !userMenuBtn.contains(e.target)) userDropdown.classList.add('hidden');
});