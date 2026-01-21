/**
 * GoalDash - ORQUESTRADOR (main.js)
 * Versão Final: Scout Integrado + Auth Blindada
 */

document.addEventListener('DOMContentLoaded', () => {
    // 1. Inicialização da UI e Dados
    if (window.updateUserUI) window.updateUserUI();

    // Carrega a Champions por padrão
    if (window.GD_API && window.GD_API.fetchMatches) {
        window.GD_API.fetchMatches('UEFA_CHAMPIONS_LEAGUE');
        
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
    };

    // --- NOVA LÓGICA: PESQUISA AVANÇADA (ENTER NO INPUT) ---
    const searchInput = document.getElementById('teams-search');
    if (searchInput) {
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                const query = searchInput.value.trim();
                if (query.length > 2) {
                    window.handleDeepSearch(query);
                }
            }
        });
    }

    // 2. Lógica do Formulário de Registo (Mantido seu código blindado)
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
                    messageBox.style.display = "block"; 
                    messageBox.style.backgroundColor = "rgba(239, 68, 68, 0.15)";
                    messageBox.style.color = "#ff4444";
                    messageBox.style.fontSize = "14px";
                    messageBox.style.fontWeight = "800";
                    messageBox.style.borderRadius = "8px";
                    messageBox.style.padding = "12px";
                }
                submitBtn.innerText = originalBtnText;
                submitBtn.disabled = false;
            }
        };
    }

    // 3. Lógica de Palpites (Modal)
    const confirmPredictionBtn = document.getElementById('confirm-prediction-btn');
    if (confirmPredictionBtn) {
        confirmPredictionBtn.onclick = async () => {
            const homeScore = document.getElementById('modal-home-score').value;
            const awayScore = document.getElementById('modal-away-score').value;

            if (homeScore === "" || awayScore === "") {
                alert("Preencha os resultados!");
                return;
            }

            confirmPredictionBtn.innerText = "A ENVIAR...";
            confirmPredictionBtn.disabled = true;

            const success = await window.GD_API.submitPrediction(homeScore, awayScore);

            if (success) {
                alert("Palpite enviado!");
                document.getElementById('prediction-modal').classList.add('hidden');
            } else {
                alert("Erro ao enviar.");
            }
            confirmPredictionBtn.innerText = "CONFIRMAR PALPITE";
            confirmPredictionBtn.disabled = false;
        };
    }
});

// --- FUNÇÕES GLOBAIS ---

// Nova Busca Profunda: Se não achar no filtro, busca na API pelo ID
window.handleDeepSearch = async (query) => {
    const term = query.toLowerCase().trim();
    const matches = window.allLoadedMatches || [];

    // Primeiro tenta o filtro simples que você já tinha
    const filtrados = matches.filter(m => {
        const h = (m.teams?.home?.names?.medium || "").toLowerCase();
        const a = (m.teams?.away?.names?.medium || "").toLowerCase();
        return h.includes(term) || a.includes(term);
    });

    if (filtrados.length > 0) {
        window.UI.renderMatches('matches-container', filtrados);
    } else {
        // Se não achou nos jogos de hoje, tenta buscar o ID do time para abrir o Scout
        // Nota: Aqui precisaríamos de um endpoint de busca de time, ou usamos os IDs fixos dos populares
        console.log("Iniciando busca profunda por:", term);
        // Por agora, avisamos que a busca detalhada é via cards populares ou ID
    }
};

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
            <div class="flex items-center gap-3 bg-white/5 border border-white/10 py-2 px-4 rounded-xl hover:bg-white/10 transition-all cursor-pointer">
                <span class="text-[11px] font-black uppercase tracking-wider text-white">${user}</span>
                <div class="w-8 h-8 bg-[#9333ea] rounded-lg flex items-center justify-center shadow-lg shadow-purple-500/20">
                    <span class="text-white font-black text-xs">${user.charAt(0).toUpperCase()}</span>
                </div>
            </div>`;
        
        if (userDropdown) {
            userDropdown.innerHTML = `
                <a href="history.html" class="flex items-center gap-3 w-full text-left p-4 hover:bg-white/5 text-white text-[10px] font-black uppercase tracking-widest transition-all">
                    <span class="text-purple-500">⌛</span> Meus Palpites
                </a>
                <button onclick="window.logout()" class="flex items-center gap-3 w-full text-left p-4 hover:bg-red-500/10 text-red-500 text-[10px] font-black uppercase tracking-widest transition-all border-t border-white/5">
                    <span class="text-sm">🚪</span> Sair
                </button>`;
        }
    } else {
        if (authLinksContainer) authLinksContainer.style.display = 'block';
        userMenuBtn.onclick = () => window.openAuthModal();
        userMenuBtn.innerHTML = `<span class="text-[11px] font-black uppercase tracking-[2px] text-white hover:text-purple-400 transition-colors cursor-pointer">Criar Conta</span>`;
    }
};

window.handlePalpiteClick = (id, home, away) => {
    const user = localStorage.getItem('goalDash_username');
    if (!user) {
        window.openAuthModal();
        return;
    }
    window.activeGame = { id, home, away };
    const modal = document.getElementById('prediction-modal');
    if (document.getElementById('modal-teams-title')) {
        document.getElementById('modal-teams-title').innerText = `${home} vs ${away}`;
    }
    if (modal) { modal.classList.remove('hidden'); modal.classList.add('flex'); }
};

window.logout = () => { localStorage.removeItem('goalDash_username'); window.location.reload(); };
window.openLoginModal = () => { const m = document.getElementById('login-modal'); if(m) { m.classList.remove('hidden'); m.classList.add('flex'); } };
window.closeLoginModal = () => { document.getElementById('login-modal').classList.add('hidden'); };
window.openAuthModal = () => { const m = document.getElementById('auth-modal'); if(m) { m.classList.remove('hidden'); m.classList.add('flex'); } };
window.closeAuthModal = () => { document.getElementById('auth-modal').classList.add('hidden'); };

window.changeSport = (id, name) => {
    const title = document.getElementById('current-league-title');
    if (title) title.innerText = name.toUpperCase();
    if (window.GD_API) window.GD_API.fetchMatches(id);
};

// Vincula a busca ao input
window.handleSearch = (query) => window.handleDeepSearch(query);