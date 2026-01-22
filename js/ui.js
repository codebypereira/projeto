/**
 * GoalDash - UI (ui.js) 
 * SISTEMA COMPLETO: Modais, Jogos, Live e Histórico
 * Mapeamento exato para SportsGameOdds
 */

window.UI = {
    // --- LOADING ---
    showLoading: (id) => {
        const c = document.getElementById(id);
        if (c) c.innerHTML = `<div class="col-span-full text-center py-20 text-purple-500 animate-pulse font-black text-[10px] uppercase tracking-widest">Sincronizando Dados...</div>`;
    },

    // --- RENDERIZAÇÃO DE JOGOS (Nomes, Logos e Data) ---
    renderMatches: (containerId, matches) => {
        let targetId = containerId;
        let data = matches;
        if (Array.isArray(containerId)) {
            data = containerId;
            targetId = 'matches-container';
        }

        const container = document.getElementById(targetId);
        if (!container) return;
        
        if (!data || data.length === 0) {
            container.innerHTML = `<div class="col-span-full text-center py-20 text-white opacity-20 font-black">NENHUM JOGO ENCONTRADO</div>`;
            return;
        }

        container.innerHTML = data.map(m => window.UI.components.matchCard(m)).join('');
    },

    // --- RENDERIZAÇÃO DO HISTÓRICO ---
    renderHistory: (containerId) => {
        const container = document.getElementById(containerId);
        if (!container) return;
        const history = JSON.parse(localStorage.getItem('goalDash_history') || '[]');
        
        if (history.length === 0) {
            container.innerHTML = `<div class="col-span-full text-center py-32 opacity-20"><div class="text-6xl mb-4 italic font-black text-white">EMPTY</div><p class="text-white font-black uppercase text-xs">Nenhum palpite encontrado</p></div>`;
            return;
        }

        container.innerHTML = history.map(p => `
            <div class="group relative mb-4 overflow-hidden rounded-3xl border border-white/5 bg-slate-900/40 p-1 transition-all hover:border-purple-500/40 hover:bg-slate-900/60 shadow-2xl">
                <div class="relative flex items-center justify-between px-8 py-6">
                    <div>
                        <span class="text-[10px] font-black uppercase tracking-[0.2em] text-purple-400/80">${p.date}</span>
                        <h3 class="text-lg font-black italic text-white uppercase">${p.teams}</h3>
                    </div>
                    <div class="relative flex items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-8 py-4 backdrop-blur-md">
                        <span class="text-3xl font-black italic text-white">${p.placar}</span>
                    </div>
                </div>
            </div>
        `).join('');
    },

    components: {
        matchCard: (m) => {
            // Mapeamento profundo para a API
            const home = m.teams?.home;
            const away = m.teams?.away;
            
            const hName = home?.names?.medium || home?.names?.long || "CASA";
            const aName = away?.names?.medium || away?.names?.long || "FORA";

            const hShort = home?.names?.short || "EQ";
            const aShort = away?.names?.short || "EQ";

            const hLogo = window.getTeamLogo ? window.getTeamLogo(hShort, hName) : "Images/favi.svg";
            const aLogo = window.getTeamLogo ? window.getTeamLogo(aShort, aName) : "Images/favi.svg";
            
            const rawDate = m.status?.startsAt || m.startsAt;
            let dTime = "20:00", dDay = "28/01";
            if (rawDate) {
                const d = new Date(rawDate);
                dDay = d.toLocaleDateString('pt-PT', { day: '2-digit', month: '2-digit' });
                dTime = d.toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' });
            }
            
            return `
            <div class="match-card bg-slate-900/50 border border-white/5 rounded-3xl hover:border-purple-500/50 transition-all group relative overflow-hidden shadow-2xl">
                <a href="matchdetails.html?id=${m.eventID}" class="block p-6">
                    <div class="flex justify-center mb-6">
                        <div class="bg-white/10 border border-white/20 px-4 py-1.5 rounded-full flex items-center gap-3">
                            <span class="text-[10px] font-black text-purple-400 uppercase tracking-tight">${dDay}</span>
                            <div class="w-1 h-1 bg-white/30 rounded-full"></div>
                            <span class="text-[10px] font-black text-white tracking-tight">${dTime}</span>
                        </div>
                    </div>
                    
                    <div class="flex items-center justify-between w-full gap-4 mb-10 text-center">
                        <div class="flex flex-col items-center flex-1">
                            <div class="relative mb-4 group-hover:-translate-y-2 transition-transform duration-500">
                                <div class="absolute inset-0 rounded-full blur-xl opacity-30 bg-purple-600"></div>
                                <img src="${hLogo}" class="relative z-10 w-16 h-16 object-contain" onerror="this.src='Images/favi.svg'">
                            </div>
                            <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest group-hover:text-white transition-colors line-clamp-1">${hName}</span>
                        </div>
                        <div class="opacity-30"><span class="text-2xl font-black italic text-white">VS</span></div>
                        <div class="flex flex-col items-center flex-1">
                            <div class="relative mb-4 group-hover:-translate-y-2 transition-transform duration-500">
                                <div class="absolute inset-0 rounded-full blur-xl opacity-30 bg-pink-600"></div>
                                <img src="${aLogo}" class="relative z-10 w-16 h-16 object-contain" onerror="this.src='Images/favi.svg'">
                            </div>
                            <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest group-hover:text-white transition-colors line-clamp-1">${aName}</span>
                        </div>
                    </div>
                </a>
                <div class="px-6 pb-6">
                    <button onclick="window.openPredictionModal('${m.eventID}', '${hName.replace(/'/g, "\\'")}', '${aName.replace(/'/g, "\\")}')" 
                        class="w-full py-4 rounded-2xl text-[11px] font-black text-white uppercase tracking-[3px] bg-gradient-to-r from-white/5 to-white/10 border border-white/10 hover:from-purple-600 hover:to-pink-600 transition-all duration-500 shadow-xl cursor-pointer relative z-20">
                        Dar meu palpite
                    </button>
                </div>
            </div>`;
        }
    }
};

/** LÓGICA DE MODAIS **/
window.closeAllModals = function() {
    ['login-modal', 'auth-modal', 'prediction-modal'].forEach(id => {
        const el = document.getElementById(id);
        if (el) { el.classList.add('hidden'); el.style.display = 'none'; }
    });
    document.body.style.overflow = 'auto';
};

window.openModalSafe = function(id) {
    window.closeAllModals();
    const el = document.getElementById(id);
    if (el) {
        el.classList.remove('hidden');
        el.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }
};

window.openPredictionModal = (id, home, away) => {
    if (!localStorage.getItem('goalDash_username')) {
        window.openModalSafe('auth-modal');
        return;
    }
    window.activeGame = { id, home, away };
    const title = document.getElementById('modal-teams-title');
    if (title) title.innerText = `${home} vs ${away}`;
    window.openModalSafe('prediction-modal');
};

/** SUBMIT PALPITE **/
window.handlePredictionSubmit = async function() {
    const inputs = document.querySelectorAll('#prediction-modal input[type="number"]');
    const hScore = inputs[0]?.value;
    const aScore = inputs[1]?.value;

    if (hScore === "" || aScore === "") { alert("Preenche o placar aí, cria!"); return; }

    const newPrediction = {
        id: Date.now(),
        teams: `${window.activeGame?.home} vs ${window.activeGame?.away}`,
        placar: `${hScore} x ${aScore}`,
        date: new Date().toLocaleDateString()
    };

    let history = JSON.parse(localStorage.getItem('goalDash_history') || '[]');
    history.unshift(newPrediction);
    localStorage.setItem('goalDash_history', JSON.stringify(history));

    alert("Palpite confirmado!");
    window.closeAllModals();

    if (window.location.pathname.includes('history.html')) {
        window.UI.renderHistory('history-container');
    }
};