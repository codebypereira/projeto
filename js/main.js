/**
 * GoalDash - ORQUESTRADOR (main.js)
 * Versão: Sincronização Global com api.js + Interface Inteligente
 */

document.addEventListener('DOMContentLoaded', async () => {
    // 1. Inicializa UI comum (Navbar/User)
    if (window.updateUserUI) window.updateUserUI();

    const urlParams = new URLSearchParams(window.location.search);
    const matchId = urlParams.get('id');

    // --- LÓGICA DE NAVEGAÇÃO / CARREGAMENTO ---
    if (matchId) {
        // --- PÁGINA DE DETALHES ---
        if (window.GD_API && window.GD_API.fetchMatches) {
            try {
                // Usa a liga atual definida no api.js ou Champions como fallback
                const leagueToLoad = window.currentLeague || 'UEFA_CHAMPIONS_LEAGUE';
                const data = await window.GD_API.fetchMatches(leagueToLoad);
                
                const matches = Array.isArray(data) ? data : (window.allLoadedMatches || []);
                const match = matches.find(m => String(m.eventID) === String(matchId));
                
                if (match && window.UI && window.UI.renderMatchHeader) {
                    window.UI.renderMatchHeader(match);
                } else {
                    const header = document.getElementById('match-header');
                    if (header) header.innerHTML = "<div class='text-center py-10 opacity-50 uppercase text-[10px] font-black tracking-widest'>Jogo não encontrado</div>";
                }
            } catch (err) {
                console.error("Erro ao carregar detalhes:", err);
            }
        }
    } else {
        // --- PÁGINA INICIAL ---
        if (window.GD_API && window.GD_API.fetchMatches) {
            // 1. Puxamos a liga que o teu api.js definiu como inicial
            const leagueToLoad = window.currentLeague || 'UEFA_CHAMPIONS_LEAGUE';

            // 2. Sincroniza o título do HTML com o nome da liga no GD_DATA.LEAGUES
            const titleElement = document.getElementById('current-league-title');
            if (titleElement && window.GD_DATA && window.GD_DATA.LEAGUES) {
                const leagueName = window.GD_DATA.LEAGUES[leagueToLoad] || "LIGA SELECIONADA";
                titleElement.innerText = leagueName.toUpperCase();
            }

            // 3. Faz a busca dos jogos
            await window.GD_API.fetchMatches(leagueToLoad);
        }
    }

    // --- LÓGICA DE LOGIN ---
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.onsubmit = async (e) => {
            e.preventDefault();
            const user = document.getElementById('login-user').value.trim();
            const pass = document.getElementById('login-pass').value;
            const msg = document.getElementById('login-message');
            const btn = loginForm.querySelector('button[type="submit"]');

            btn.innerText = "A ENTRAR...";
            btn.disabled = true;

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
                btn.innerText = "Entrar";
                btn.disabled = false;
            }
        };
    }

    // --- LÓGICA DE REGISTO ---
    const authForm = document.getElementById('auth-form');
    if (authForm) {
        authForm.onsubmit = async (e) => {
            e.preventDefault();
            const usernameInput = document.getElementById('auth-user');
            const emailInput = document.getElementById('auth-email');
            const passwordInput = document.getElementById('auth-pass');
            const messageBox = document.getElementById('auth-message');
            const submitBtn = authForm.querySelector('button[type="submit"]');

            const originalBtnText = submitBtn.innerText;
            submitBtn.innerText = "A VALIDAR...";
            submitBtn.disabled = true;

            const userData = {
                username: usernameInput.value.trim(),
                email: emailInput.value.trim(),
                password: passwordInput.value,
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
                submitBtn.innerText = originalBtnText;
                submitBtn.disabled = false;
            }
        };
    }

    // --- LÓGICA DE PALPITES ---
    const confirmPredictionBtn = document.getElementById('confirm-prediction-btn');
    if (confirmPredictionBtn) {
        confirmPredictionBtn.onclick = async () => {
            const homeScore = document.getElementById('modal-home-score').value;
            const awayScore = document.getElementById('modal-away-score').value;

            if (homeScore === "" || awayScore === "") {
                alert("Por favor, preencha ambos os resultados.");
                return;
            }

            confirmPredictionBtn.innerText = "A ENVIAR...";
            confirmPredictionBtn.disabled = true;

            const success = await window.GD_API.submitPrediction(homeScore, awayScore);
            if (success) {
                alert("Palpite enviado com sucesso!");
                if (window.closePredictionModal) window.closePredictionModal();
                else document.getElementById('prediction-modal').classList.add('hidden');
            } else {
                alert("Erro ao enviar palpite.");
            }
            confirmPredictionBtn.innerText = "CONFIRMAR PALPITE";
            confirmPredictionBtn.disabled = false;
        };
    }
});

// --- FUNÇÕES GLOBAIS ---

window.updateUserUI = () => {
    const user = localStorage.getItem('goalDash_username');
    const userMenuBtn = document.getElementById('user-menu-btn');
    const userDropdown = document.getElementById('user-dropdown');
    const authLinksContainer = document.getElementById('auth-links-container');

    if (!userMenuBtn) return;
    userMenuBtn.onclick = null;

    if (user) {
        if (authLinksContainer) authLinksContainer.style.display = 'none';
        userMenuBtn.onclick = (e) => {
            e.stopPropagation();
            if (userDropdown) userDropdown.classList.toggle('hidden');
        };

        userMenuBtn.innerHTML = `
            <div class="flex items-center gap-3 bg-white/5 border border-white/10 py-2 px-4 rounded-xl hover:bg-white/10 transition-all">
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
        userMenuBtn.innerHTML = `<span class="text-[11px] font-black uppercase tracking-[2px] text-white hover:text-purple-400 transition-colors">Criar Conta</span>`;
        if (userDropdown) userDropdown.classList.add('hidden');
    }
};

window.logout = () => {
    localStorage.removeItem('goalDash_username');
    window.location.reload(); 
};

window.handlePalpiteClick = (id, home, away) => {
    const user = localStorage.getItem('goalDash_username');
    if (!user) {
        window.openAuthModal();
        const messageBox = document.getElementById('auth-message');
        if (messageBox) {
            messageBox.innerText = "Inicie sessão para registar o seu palpite.";
            messageBox.classList.remove('hidden');
            messageBox.className = "p-3 rounded bg-amber-500/10 text-amber-500 text-[10px] font-bold text-center mt-2 border border-amber-500/20";
        }
        return;
    }
    window.activeGame = { id, home, away };
    const modal = document.getElementById('prediction-modal');
    const title = document.getElementById('modal-teams-title');
    if (title) title.innerText = `${home} vs ${away}`;
    if (modal) { modal.classList.remove('hidden'); modal.classList.add('flex'); }
};

window.handleSearch = (query) => {
    const matches = window.allLoadedMatches || [];
    const term = query.toLowerCase().trim();
    if (!term) {
        if (window.UI) window.UI.renderMatches('matches-container', matches);
        return;
    }
    const filtrados = matches.filter(m => {
        const h = (m.teams?.home?.names?.medium || "").toLowerCase();
        const a = (m.teams?.away?.names?.medium || "").toLowerCase();
        return h.includes(term) || a.includes(term);
    });
    if (window.UI) window.UI.renderMatches('matches-container', filtrados);
};

window.changeSport = (id, name) => {
    const titleElement = document.getElementById('current-league-title');
    
    // Atualiza a liga global no api.js para que o sistema saiba o que está selecionado
    window.currentLeague = id;

    // Busca o nome amigável no dicionário ou usa o nome passado/id
    const displayName = name || (window.GD_DATA && window.GD_DATA.LEAGUES[id]) || id;
    
    if (titleElement) titleElement.innerText = displayName.toUpperCase();
    if (window.GD_API) window.GD_API.fetchMatches(id);
};

// Modais
window.openLoginModal = () => { const m = document.getElementById('login-modal'); if(m) { m.classList.remove('hidden'); m.classList.add('flex'); } };
window.closeLoginModal = () => { document.getElementById('login-modal').classList.add('hidden'); };
window.openAuthModal = () => { const m = document.getElementById('auth-modal'); if(m) { m.classList.remove('hidden'); m.classList.add('flex'); } };
window.closeAuthModal = () => { document.getElementById('auth-modal').classList.add('hidden'); };
window.switchToLogin = () => { window.closeAuthModal(); window.openLoginModal(); };
window.switchToRegister = () => { window.closeLoginModal(); window.openAuthModal(); };

document.addEventListener('click', () => {
    const userDropdown = document.getElementById('user-dropdown');
    if (userDropdown) userDropdown.classList.add('hidden');
});