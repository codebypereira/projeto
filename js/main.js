/**
 * GoalDash - ORQUESTRADOR CENTRAL (main.js)
 * Versão: 3.7.0 - Ultra Full Edition (Sem cortes)
 * Foco: Stats, Auth, Matches, History, Details e Modais.
 */

// ========================================================
// 1. FUNÇÕES GLOBAIS DE CLIQUE & LIGAS (ESSENCIAL)
// ========================================================

// --- FUNÇÃO PARA TROCAR LIGA (Atualizada para suportar Live) ---
// --- FUNÇÃO PARA TROCAR LIGA (MANTIDA ORIGINAL) ---
window.changeSport = async (leagueID, leagueName) => {
    console.log("🏆 Trocando para liga:", leagueID);
    window.currentLeague = leagueID;

    const titleEl = document.getElementById('current-league-title');
    if (titleEl) titleEl.innerText = leagueName ? leagueName.toUpperCase() : leagueID;

    if (window.location.pathname.includes('live.html')) {
        await window.loadLiveMatches(leagueID);
    } else {
        if (window.GD_API) await window.GD_API.fetchMatches(leagueID);
    }
};

window.loadLiveMatches = async (leagueID) => {
    if (!window.GD_API) return;
    
    const container = document.getElementById('live-matches-container');
    if (container) {
        container.innerHTML = `<div class="col-span-full text-center py-20 text-red-500 animate-pulse font-black uppercase text-[10px]">Verificando Jogos em Andamento...</div>`;
    }

    try {
        // Busca os jogos da liga selecionada ou La Liga (que você sabe que tem jogo agora)
        const targetLeague = leagueID || window.currentLeague || 'LALIGA';
        const allMatches = await window.GD_API.fetchMatches(targetLeague);
        
        console.log("📡 Dados brutos da API:", allMatches);

        // O SEGREDO ESTÁ AQUI:
        // 1. m.status.started === true (O jogo começou)
        // 2. m.status.state NÃO pode ser 'FINISHED' (O jogo não acabou)
        const liveMatches = allMatches.filter(m => {
            const isStarted = m.status?.started === true;
            const state = (m.status?.state || "").toUpperCase();
            const isNotFinished = state !== 'FINISHED' && state !== 'FINAL';
            
            return isStarted && isNotFinished;
        });

        console.log(`✅ Jogos filtrados (Iniciados e não finalizados):`, liveMatches);

        if (window.UI && window.UI.renderLiveCards) {
            window.UI.renderLiveCards(liveMatches);
        }
    } catch (e) {
        console.error("Erro no Live:", e);
    }
};
window.handleTeamClickByCode = async (code, name) => {
    console.log("%c 🚨 [SISTEMA] CLIQUE DETECTADO NO TIME: " + name, "background: #9333ea; color: white; padding: 8px; font-weight: bold; border-radius: 4px;");
    
    if (window.UI && typeof window.UI.showLoading === 'function') {
        window.UI.showLoading('search-results');
    }

    try {
        if (!window.GD_API) {
            console.error("❌ ERRO CRÍTICO: Objeto GD_API não encontrado no escopo global.");
            alert("Erro de sistema: API não carregada.");
            return;
        }
        
        console.log("📡 Iniciando busca de ID para: " + name);
        const teamID = await window.GD_API.searchTeamByName(name);
        
        if (teamID) {
            console.log("✅ ID Localizado com sucesso: " + teamID);
            await window.handleTeamClick(teamID);
        } else {
            console.warn("⚠️ A API não retornou um ID válido para: " + name);
            alert("Não foi possível localizar os dados deste time especificamente.");
            location.reload();
        }
    } catch (err) {
        console.error("🚨 ERRO NO FLUXO handleTeamClickByCode:", err);
    }
};

window.handleTeamClick = async (teamID) => {
    // 1. Extração Inteligente da Base
    // Se o ID for "LIVERPOOL_UEFA", base vira "LIVERPOOL"
    // Se o ID for "REAL_MADRID_UEFA", base vira "REAL_MADRID"
    const parts = String(teamID).toUpperCase().split('_');
    let baseID = parts[0];
    
    // Caso especial para nomes compostos tipo REAL MADRID, ATLETICO MADRID, etc.
    if (["REAL", "ATLETICO", "MAN", "BAYERN"].includes(baseID) && parts[1]) {
        baseID = `${parts[0]}_${parts[1]}`;
    }

    console.log("%c 🚀 [HÍBRIDO] TRADUZINDO IDS PARA: " + baseID, "color: #00f2ff; font-weight: bold;");
    
    if (window.UI && typeof window.UI.showLoading === 'function') {
        window.UI.showLoading('search-results');
    }

    // 2. Define os IDs específicos e as Ligas conforme a documentação da sua API
    const idChampions = `${baseID}_UEFA_CHAMPIONS_LEAGUE`;
    let idDomestic = "";
    let domesticLeague = "";

    // Mapeamento de Ligas e IDs Nacionais
    if (baseID.includes("REAL_MADRID") || baseID.includes("BARCELONA")) {
        domesticLeague = "LA_LIGA";
        idDomestic = `${baseID}_LA_LIGA`;
    } else if (baseID.includes("LIVERPOOL") || baseID.includes("CITY") || baseID.includes("ARSENAL")) {
        domesticLeague = "EPL";
        idDomestic = `${baseID}_EPL`;
    } else if (baseID.includes("BAYERN_MUNICH") || baseID.includes("DORTMUND")) {
        domesticLeague = "BUNDESLIGA";
        idDomestic = `${baseID}_BUNDESLIGA`;
    }

    try {
        const startsAfter = "2025-10-15";
        const startsBefore = "2026-01-23"; // Data de hoje

        // 3. Monta a lista de promessas (Sempre Champions + Nacional se houver)
        const promises = [
            window.GD_API.fetchEndedMatches("UEFA_CHAMPIONS_LEAGUE", startsAfter, startsBefore, idChampions)
        ];

        if (domesticLeague && idDomestic) {
            promises.push(window.GD_API.fetchEndedMatches(domesticLeague, startsAfter, startsBefore, idDomestic));
        }

        // Executa todas as buscas em paralelo
        const [stats, ...matchResults] = await Promise.all([
            window.GD_API.fetchTeamFullStats(teamID),
            ...promises
        ]);

        // Une os resultados de todas as ligas
        let allMatches = matchResults.flat();
        
        // 4. Ordenação Cronológica (Mais recente no topo)
        allMatches.sort((a, b) => {
            const timeA = new Date(a.status?.startsAt || a.startsAt || 0).getTime();
            const timeB = new Date(b.status?.startsAt || b.startsAt || 0).getTime();
            return timeB - timeA;
        });

        // 5. Remove possíveis duplicatas e pega os 5 últimos
        const uniqueMatches = Array.from(new Map(allMatches.map(m => [m.id, m])).values());
        const last5Matches = uniqueMatches.slice(0, 5);
        
        console.table(last5Matches.map(m => ({
            Data: m.status?.startsAt || m.startsAt,
            Liga: m.leagueID,
            Jogo: `${m.teams.home.names.short} ${m.teams.home.score} x ${m.teams.away.score} ${m.teams.away.names.short}`
        })));

        if (stats && window.UI) {
            window.UI.renderTeamDashboard({ ...stats, id: teamID }, last5Matches);
        }

    } catch (err) {
        console.error("🚨 ERRO NA TRADUÇÃO DE IDS:", err);
    }
};

// ========================================================
// 2. INICIALIZAÇÃO DO DOCUMENTO (DOMContentLoaded)
// ========================================================

document.addEventListener('DOMContentLoaded', async () => {
    console.log("%c 🚀 GoalDash Main: Engine Iniciada", "color: #10b981; font-weight: bold;");

    // 1. Inicialização da interface de usuário (Navbar/Login)
    if (window.updateUserUI) {
        window.updateUserUI();
    }

    // Parâmetros da URL
    const urlParams = new URLSearchParams(window.location.search);
    const matchId = urlParams.get('id');
    const action = urlParams.get('action');
    const path = window.location.pathname;

    // --- LÓGICA ESPECÍFICA PARA LIVE.HTML ---
    if (path.includes('live.html')) {
        console.log("📡 Modo Live Ativado");
        // Força o carregamento inicial (Champions por defeito ou a atual)
        await window.loadLiveMatches(window.currentLeague || 'UEFA_CHAMPIONS_LEAGUE');
    }

    // --- LOGICA DE REDIRECIONAMENTOS ---
    if (action === 'login') {
        console.log("Ação detectada: Abrindo Login");
        window.openLoginModal();
    }
    if (action === 'register') {
        console.log("Ação detectada: Abrindo Registro");
        window.openAuthModal();
    }

    // --- VERIFICAÇÃO DE PÁGINA: HISTORY ---
    if (path.includes('history.html')) {
        console.log("Página detectada: Histórico");
        if (window.GD_UI && window.GD_UI.renderHistory) {
            window.GD_UI.renderHistory();
        }
    }

    // --- VERIFICAÇÃO DE PÁGINA: MATCH DETAILS ---
    if (matchId) {
        let matches = window.allLoadedMatches || [];
        if (matches.length === 0 && window.GD_API) {
            matches = await window.GD_API.fetchMatches('UEFA_CHAMPIONS_LEAGUE');
        }
        const match = matches.find(m => String(m.eventID) === String(matchId));
        if (match && window.UI && window.UI.renderMatchHeader) {
            window.UI.renderMatchHeader(match);
        }
    }

    // --- VERIFICAÇÃO DE PÁGINA: STATS ---
    if (path.includes('stats.html')) {
        console.log("Página detectada: Estatísticas");
        
        const popularTeamsData = [
            { name: 'Real Madrid', code: "RMA" },
            { name: 'Barcelona', code: "BAR" },
            { name: 'Man. City', code: "MCI" },
            { name: 'Liverpool', code: "LIV" },
            { name: 'Bayern Munich', code: "FCB" },
            { name: 'Paris SG', code: "PSG" },
            { name: 'Benfica', code: "SLB" },
            { name: 'Sporting CP', code: "SCP" },
            { name: 'FC Porto', code: "FCP" },
            { name: 'Flamengo', code: "FLA" },
            { name: 'Palmeiras', code: "PAL" },
            { name: 'Al Nassr', code: "ALN" }
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
                    console.log("Pesquisa manual iniciada por: " + query);
                    const teamID = await window.GD_API.searchTeamByName(query);
                    if (teamID) window.handleTeamClick(teamID);
                }
            });
        }
    }

    // Se estiver na Home (index.html) e não houver ID na URL, carrega os jogos normais
    if (path.includes('index.html') || path === '/' || path.endsWith('/')) {
        if (!matchId && window.GD_API) {
            await window.GD_API.fetchMatches('UEFA_CHAMPIONS_LEAGUE');
        }
    }

    // --- VERIFICAÇÃO DE PÁGINA: DETAILS OU HOME ---
    if (matchId && window.location.pathname.includes('matchdetails.html')) {
        console.log("Página detectada: Detalhes do Jogo - ID: " + matchId);
        if (window.GD_API && window.GD_API.fetchMatches) {
            try {
                const currentLeague = window.currentLeague || 'UEFA_CHAMPIONS_LEAGUE';
                const data = await window.GD_API.fetchMatches(currentLeague);
                const matches = Array.isArray(data) ? data : (window.allLoadedMatches || []);
                const match = matches.find(m => String(m.eventID) === String(matchId));
                
                if (match && window.UI && window.UI.renderMatchHeader) {
                    window.UI.renderMatchHeader(match);
                }
            } catch (err) {
                console.error("Erro ao carregar detalhes do jogo:", err);
            }
        }
    } else if (document.getElementById('matches-container')) {
        console.log("Página detectada: Home (Lista de Jogos)");
        if (window.GD_API && window.GD_API.fetchMatches) {
            const leagueToLoad = window.currentLeague || 'UEFA_CHAMPIONS_LEAGUE';
            await window.GD_API.fetchMatches(leagueToLoad);
        }
    }

    setupAuthListeners();
});

// ========================================================
// 3. SISTEMA DE AUTENTICAÇÃO E FORMULÁRIOS
// ========================================================

function setupAuthListeners() {
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.onsubmit = async (e) => {
            e.preventDefault();
            const userField = document.getElementById('login-user');
            const passField = document.getElementById('login-pass');
            const submitBtn = loginForm.querySelector('button[type="submit"]');
            const messageBox = document.getElementById('login-message');

            if (submitBtn) { 
                submitBtn.innerText = "A VALIDAR CREDENCIAIS..."; 
                submitBtn.disabled = true; 
            }

            const response = await window.GD_API.loginUser(userField.value.trim(), passField.value);

            if (response.success) {
                localStorage.setItem('goalDash_username', response.username);
                window.location.reload();
            } else {
                if (messageBox) {
                    messageBox.innerText = response.error;
                    messageBox.classList.remove('hidden');
                    messageBox.className = "p-4 rounded-2xl bg-red-500/10 text-red-500 text-[11px] font-black text-center mt-4 border border-red-500/20";
                }
                if (submitBtn) { 
                    submitBtn.innerText = "ENTRAR"; 
                    submitBtn.disabled = false; 
                }
            }
        };
    }

    const authForm = document.getElementById('auth-form');
    if (authForm) {
        authForm.onsubmit = async (e) => {
            e.preventDefault();
            const user = document.getElementById('auth-user').value.trim();
            const email = document.getElementById('auth-email').value.trim();
            const pass = document.getElementById('auth-pass').value;
            const submitBtn = authForm.querySelector('button[type="submit"]');
            const messageBox = document.getElementById('auth-message');

            if (submitBtn) {
                submitBtn.innerText = "A CRIAR CONTA...";
                submitBtn.disabled = true;
            }

            const userData = {
                username: user,
                email: email,
                password: pass,
                createdAt: new Date().toISOString()
            };

            const result = await window.GD_API.registerUser(userData);

            if (result.success) {
                localStorage.setItem('goalDash_username', user);
                window.location.reload();
            } else {
                if (messageBox) {
                    messageBox.innerText = result.error;
                    messageBox.classList.remove('hidden');
                    messageBox.className = "p-4 rounded-2xl bg-red-500/10 text-red-500 text-[11px] font-black text-center mt-4 border border-red-500/20";
                }
                if (submitBtn) {
                    submitBtn.innerText = "CRIAR CONTA";
                    submitBtn.disabled = false;
                }
            }
        };
    }
}

// ========================================================
// 4. LÓGICA DE PALPITES & HISTÓRICO
// ========================================================

window.handlePalpiteClick = (id, home, away) => {
    const activeUser = localStorage.getItem('goalDash_username');
    if (!activeUser) {
        window.openAuthModal();
        return;
    }

    window.activeGame = { id, home, away };
    
    const homeEl = document.getElementById('modal-home-name');
    const awayEl = document.getElementById('modal-away-name');
    
    if (homeEl) homeEl.innerText = home;
    if (awayEl) awayEl.innerText = away;

    const modal = document.getElementById('prediction-modal');
    if (modal) {
        modal.classList.remove('hidden');
        modal.classList.add('flex');
    }
};

window.handlePredictionSubmit = async (e) => { // Recebe o evento
    const hScore = document.getElementById('modal-home-score').value;
    const aScore = document.getElementById('modal-away-score').value;
    
    // Pega o botão de forma segura
    const btn = e ? e.currentTarget : document.querySelector('#prediction-modal button[onclick*="handlePredictionSubmit"]');

    if (hScore === "" || aScore === "") {
        alert("Por favor, preenche ambos os campos do palpite, cria!");
        return;
    }

    if (btn) {
        btn.innerText = "A ENVIAR PALPITE...";
        btn.disabled = true;
    }

    const success = await window.GD_API.submitPrediction(hScore, aScore);
    
    if (success) {
        // ... resto da lógica de sucesso ...
        alert("Palpite registado com sucesso!");
        document.getElementById('prediction-modal').classList.add('hidden');
    } else {
        alert("Erro ao enviar o palpite para o servidor.");
    }
    
    if (btn) {
        btn.innerText = "ENVIAR PALPITE";
        btn.disabled = false;
    }
};

// LIMPAR HISTÓRICO COMPLETO NA MOCKAPI
window.clearHistory = async () => {
    const username = localStorage.getItem('goalDash_username');
    if (!username) return;

    if (confirm("Desejas mesmo apagar todo o teu histórico de palpites, cria?")) {
        try {
            // 1. Pega todos os palpites da API
            const res = await fetch('https://696278a1d9d64c761907fe9a.mockapi.io/api/dash/predictions');
            const data = await res.json();
            
            // 2. Filtra só os que são seus
            const meusPalpites = data.filter(p => p.username === username);

            if (meusPalpites.length === 0) {
                alert("Teu histórico já tá limpo, cria!");
                return;
            }

            console.log(`🗑️ Apagando ${meusPalpites.length} palpites...`);

            // 3. Deleta um por um na API (a MockAPI exige delete individual por ID)
            const deletePromises = meusPalpites.map(p => 
                fetch(`https://696278a1d9d64c761907fe9a.mockapi.io/api/dash/predictions/${p.id}`, {
                    method: 'DELETE'
                })
            );

            await Promise.all(deletePromises);

            // 4. Limpa o LocalStorage também pra não sobrar rastro
            localStorage.removeItem('goalDash_history');

            console.log("🧹 Tudo limpo!");

            // 5. Atualiza a interface sem dar reload na página toda
            if (window.GD_UI && window.GD_UI.renderHistory) {
                window.GD_UI.renderHistory();
            } else {
                window.location.reload();
            }

        } catch (e) {
            console.error("Erro ao limpar histórico:", e);
            alert("Deu erro ao falar com o servidor. Tenta de novo!");
        }
    }
};

// APAGAR PALPITE ÚNICO
window.deletePrediction = async (apiID) => {
    if (confirm("Apagar este palpite especificamente?")) {
        try {
            // Deleta direto pelo ID da API
            await fetch(`https://696278a1d9d64c761907fe9a.mockapi.io/api/dash/predictions/${apiID}`, {
                method: 'DELETE'
            });

            console.log("✅ Palpite removido da API.");
            if (window.GD_UI && window.GD_UI.renderHistory) window.GD_UI.renderHistory();
        } catch (e) {
            console.error("Erro ao deletar palpite:", e);
        }
    }
};

// ========================================================
// 5. GESTÃO DE UI GERAL E MODAIS (AQUI ESTÁ TUDO!)
// ========================================================

window.updateUserUI = () => {
    const user = localStorage.getItem('goalDash_username');
    const userMenuBtn = document.getElementById('user-menu-btn');
    const userDropdown = document.getElementById('user-dropdown');
    const authLinks = document.getElementById('auth-links-container');

    if (!userMenuBtn) return;

    if (user) {
        if (authLinks) authLinks.style.display = 'none';
        
        userMenuBtn.innerHTML = `
            <div class="flex items-center gap-3 bg-white/5 border border-white/10 py-2 px-4 rounded-xl hover:bg-white/10 transition-all cursor-pointer">
                <span class="text-[11px] font-black uppercase tracking-wider text-white">${user}</span>
                <div class="w-8 h-8 bg-[#9333ea] rounded-lg flex items-center justify-center shadow-lg shadow-purple-500/20">
                    <span class="text-white font-black text-xs">${user.charAt(0).toUpperCase()}</span>
                </div>
            </div>
        `;

        userMenuBtn.onclick = (e) => {
            e.stopPropagation();
            if (userDropdown) userDropdown.classList.toggle('hidden');
        };

        if (userDropdown) {
            userDropdown.innerHTML = `
                <div class="p-4 border-b border-white/5 bg-white/[0.02]">
                    <p class="text-[9px] text-white/40 uppercase font-black tracking-[2px]">Painel do Utilizador</p>
                </div>
                <a href="history.html" class="flex items-center gap-3 w-full text-left p-4 hover:bg-white/5 text-white text-[10px] font-black uppercase tracking-widest transition-all">
                    <span class="text-purple-500">⌛</span> Meus Palpites
                </a>
                <button onclick="window.logout()" class="flex items-center gap-3 w-full text-left p-4 hover:bg-red-500/10 text-red-500 text-[10px] font-black uppercase tracking-widest transition-all border-t border-white/5">
                    <span class="text-sm">🚪</span> Terminar Sessão
                </button>
            `;
        }
    } else {
        if (authLinks) authLinks.style.display = 'block';
        userMenuBtn.onclick = () => window.openAuthModal();
        userMenuBtn.innerHTML = `
            <div class="bg-[#9333ea] hover:bg-[#7e22ce] px-6 py-2.5 rounded-xl transition-all shadow-lg shadow-purple-500/20">
                <span class="text-[11px] font-black uppercase tracking-[2px] text-white">Criar Conta</span>
            </div>
        `;
    }
};

window.logout = () => {
    if (confirm("Desejas mesmo sair da tua conta, cria?")) {
        localStorage.removeItem('goalDash_username');
        window.location.href = 'index.html';
    }
};

// --- CONTROLO DE MODAIS DE LOGIN ---
window.openLoginModal = () => {
    console.log("🔓 Abrindo Modal de Login");
    const m = document.getElementById('login-modal');
    if (m) {
        m.classList.remove('hidden');
        m.classList.add('flex');
        // Reset de mensagens de erro ao abrir
        const msg = document.getElementById('login-message');
        if (msg) msg.classList.add('hidden');
    }
};

window.closeLoginModal = () => {
    const m = document.getElementById('login-modal');
    if (m) {
        m.classList.remove('flex');
        m.classList.add('hidden');
    }
};

// --- CONTROLO DE MODAIS DE REGISTRO ---
window.openAuthModal = () => {
    console.log("📝 Abrindo Modal de Registro");
    const m = document.getElementById('auth-modal');
    if (m) {
        m.classList.remove('hidden');
        m.classList.add('flex');
        const msg = document.getElementById('auth-message');
        if (msg) msg.classList.add('hidden');
    }
};

window.closeAuthModal = () => {
    const m = document.getElementById('auth-modal');
    if (m) {
        m.classList.remove('flex');
        m.classList.add('hidden');
    }
};

// --- CONTROLO DE MODAL DE PALPITE ---
window.closePredictionModal = () => {
    const m = document.getElementById('prediction-modal');
    if (m) {
        m.classList.remove('flex');
        m.classList.add('hidden');
    }
};

// --- SWITCH ENTRE LOGIN E REGISTRO ---
window.switchToLogin = () => {
    window.closeAuthModal();
    setTimeout(() => window.openLoginModal(), 100);
};

window.switchToRegister = () => {
    window.closeLoginModal();
    setTimeout(() => window.openAuthModal(), 100);
};

// --- LISTENER GLOBAL PARA FECHAR TUDO AO CLICAR FORA ---
document.addEventListener('click', (e) => {
    // Fechar Dropdown de Usuário
    const drop = document.getElementById('user-dropdown');
    const btn = document.getElementById('user-menu-btn');
    if (drop && btn && !btn.contains(e.target) && !drop.contains(e.target)) {
        drop.classList.add('hidden');
    }

    // Fechar Modais ao clicar no Backdrop (fundo escuro)
    const loginModal = document.getElementById('login-modal');
    if (e.target === loginModal) window.closeLoginModal();

    const authModal = document.getElementById('auth-modal');
    if (e.target === authModal) window.closeAuthModal();

    const predModal = document.getElementById('prediction-modal');
    if (e.target === predModal) window.closePredictionModal();
});

console.log("%c ✅ GoalDash: Script main.js totalmente carregado.", "color: #9333ea; font-weight: bold;");
