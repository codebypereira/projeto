/**
 * GoalDash - UI (ui.js) 
 * TUDO INTEGRADO: Logos, Modais, Envio de Palpite e Render de Histórico
 */

window.UI = {
    showLoading: (id) => {
        const c = document.getElementById(id);
        if (c) c.innerHTML = `<div class="col-span-full text-center py-20 text-purple-500 animate-pulse font-black text-[10px] tracking-widest uppercase">Sincronizando Dados...</div>`;
    },

    renderMatches: (containerId, matches) => {
        const container = document.getElementById(containerId);
        if (!container) return;
        if (!matches || matches.length === 0) {
            container.innerHTML = `<div class="col-span-full text-center py-20 text-white opacity-20 font-black">NENHUM JOGO ENCONTRADO</div>`;
            return;
        }
        container.innerHTML = matches.map(m => window.UI.components.matchCard(m)).join('');
    },

    // --- NOVA FUNÇÃO: RENDERIZAR HISTÓRICO ---
    renderHistory: (containerId) => {
        const container = document.getElementById(containerId);
        if (!container) return;

        const history = JSON.parse(localStorage.getItem('goalDash_history') || '[]');
        
        if (history.length === 0) {
            container.innerHTML = `
                <div class="col-span-full text-center py-32 opacity-20">
                    <div class="text-6xl mb-4 text-white">VAZIO</div>
                    <p class="font-black text-white uppercase tracking-[0.3em] text-xs">Nenhum palpite encontrado</p>
                </div>`;
            return;
        }

        container.innerHTML = history.map(p => `
            <div class="group relative mb-4 overflow-hidden rounded-3xl border border-white/5 bg-slate-900/40 p-1 transition-all hover:border-purple-500/40 hover:bg-slate-900/60 shadow-2xl">
                <div class="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-purple-600/10 blur-3xl transition-opacity group-hover:opacity-50"></div>
                
                <div class="relative flex items-center justify-between px-8 py-6">
                    <div class="flex flex-col gap-1">
                        <div class="flex items-center gap-3">
                            <span class="text-[10px] font-black uppercase tracking-[0.2em] text-purple-400/80">${p.date}</span>
                            <div class="h-1 w-1 rounded-full bg-white/20"></div>
                            <span class="text-[9px] font-bold uppercase tracking-widest text-white/30">ID: #${p.id.toString().slice(-4)}</span>
                        </div>
                        <h3 class="text-lg font-black italic tracking-tight text-white uppercase group-hover:text-purple-100 transition-colors">
                            ${p.teams}
                        </h3>
                    </div>

                    <div class="relative">
                        <div class="absolute inset-0 rounded-2xl bg-purple-600/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        <div class="relative flex items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-8 py-4 backdrop-blur-md transition-all group-hover:scale-105 group-hover:border-purple-500/50">
                            <span class="text-3xl font-black italic tracking-tighter text-white drop-shadow-[0_0_15px_rgba(168,85,247,0.4)]">
                                ${p.placar.replace('x', '<span class="mx-2 text-purple-500/50 text-xl">X</span>')}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        `).join('');
    },

    // --- FUNÇÃO PARA LIMPAR O HISTÓRICO ---
    clearHistory: () => {
        // Confirmação para o utilizador não apagar sem querer
        if (confirm("Tens a certeza que queres apagar todos os teus palpites, cria?")) {
            localStorage.removeItem('goalDash_history');
            
            // Dá um feedback visual antes de atualizar
            const container = document.getElementById('history-container');
            if (container) {
                container.style.opacity = '0';
                container.style.transform = 'translateY(20px)';
                container.style.transition = 'all 0.5s ease';
            }

            setTimeout(() => {
                window.UI.renderHistory('history-container');
                alert("Histórico limpo com sucesso!");
            }, 500);
        }
    },

    components: {
        matchCard: (m) => {
            const home = m.teams?.home;
            const away = m.teams?.away;
            const hShort = home?.names?.short || ""; 
            const hMedium = home?.names?.medium || "Casa";
            const aShort = away?.names?.short || "";
            const aMedium = away?.names?.medium || "Fora";
            
            const homeLogo = window.getTeamLogo ? window.getTeamLogo(hShort, hMedium) : "Images/favi.svg";
            const awayLogo = window.getTeamLogo ? window.getTeamLogo(aShort, aMedium) : "Images/favi.svg";
            
            return `
            <div class="match-card bg-slate-900/50 border border-white/5 rounded-3xl hover:border-purple-500/50 transition-all group relative overflow-hidden shadow-2xl">
                <a href="matchdetails.html?id=${m.eventID}" class="block p-6">
                    <div class="flex justify-center mb-6">
                        <div class="bg-white/10 border border-white/20 px-4 py-1.5 rounded-full flex items-center gap-3">
                            <span class="text-sm font-black text-purple-400 uppercase tracking-tight">${m.displayDay}</span>
                            <div class="w-1.5 h-1.5 bg-white/30 rounded-full"></div>
                            <span class="text-sm font-black text-white tracking-tight">${m.displayTime}</span>
                        </div>
                    </div>
                    <div class="flex items-center justify-between w-full gap-4 mb-10 text-center">
                        <div class="flex flex-col items-center flex-1">
                            <div class="relative mb-4 group-hover:-translate-y-2 transition-transform duration-500">
                                <div class="absolute inset-0 rounded-full blur-xl opacity-30 bg-purple-600"></div>
                                <img src="${homeLogo}" class="relative z-10 w-16 h-16 object-contain" onerror="this.src='Images/favi.svg'">
                            </div>
                            <span class="text-[10px] font-black text-slate-400 uppercase line-clamp-1">${hMedium}</span>
                        </div>
                        <div class="opacity-30"><span class="text-2xl font-black italic text-white">VS</span></div>
                        <div class="flex flex-col items-center flex-1">
                            <div class="relative mb-4 group-hover:-translate-y-2 transition-transform duration-500">
                                <div class="absolute inset-0 rounded-full blur-xl opacity-30 bg-pink-600"></div>
                                <img src="${awayLogo}" class="relative z-10 w-16 h-16 object-contain" onerror="this.src='Images/favi.svg'">
                            </div>
                            <span class="text-[10px] font-black text-slate-400 uppercase line-clamp-1">${aMedium}</span>
                        </div>
                    </div>
                </a>
                <div class="px-6 pb-6">
                    <button onclick="window.openPredictionModal('${m.eventID}', '${hMedium.replace(/'/g, "\\'")}', '${aMedium.replace(/'/g, "\\")}')" 
                        class="w-full py-4 rounded-2xl text-[11px] font-black text-white uppercase tracking-[3px] bg-gradient-to-r from-white/5 to-white/10 border border-white/10 hover:from-purple-600 hover:to-pink-600 transition-all duration-500 shadow-xl cursor-pointer relative z-20">
                        Dar meu palpite
                    </button>
                </div>
            </div>`;
        }
    }
};

/** MODAIS **/
window.closeAllModals = function() {
    ['login-modal', 'auth-modal', 'prediction-modal'].forEach(id => {
        const el = document.getElementById(id);
        if (el) { el.classList.add('hidden'); el.style.setProperty('display', 'none', 'important'); }
    });
    document.body.style.overflow = 'auto';
};

window.openModalSafe = function(id) {
    window.closeAllModals();
    setTimeout(() => {
        const el = document.getElementById(id);
        if (el) { el.classList.remove('hidden'); el.style.setProperty('display', 'flex', 'important'); document.body.style.overflow = 'hidden'; }
    }, 60);
};

window.openPredictionModal = (id, home, away) => {
    if (!localStorage.getItem('goalDash_username')) { window.openModalSafe('login-modal'); return; }
    window.activeGame = { id, home, away };
    const title = document.getElementById('modal-home-name');
    if (title) title.innerText = `${home} vs ${away}`;
    window.openModalSafe('prediction-modal');
};

/** SUBMIT PALPITE **/
window.handlePredictionSubmit = async function() {
    const inputs = document.querySelectorAll('#prediction-modal input[type="number"]');
    const hScore = inputs[0]?.value;
    const aScore = inputs[1]?.value;

    if (!hScore || !aScore) { alert("Preenche o placar aí, cria!"); return; }

    const newPrediction = {
        id: Date.now(),
        teams: `${window.activeGame?.home} vs ${window.activeGame?.away}`,
        placar: `${hScore} x ${aScore}`,
        date: new Date().toLocaleDateString(),
        user: localStorage.getItem('goalDash_username')
    };

    let history = JSON.parse(localStorage.getItem('goalDash_history') || '[]');
    history.unshift(newPrediction);
    localStorage.setItem('goalDash_history', JSON.stringify(history));

    alert(`Palpite confirmado: ${newPrediction.teams} (${newPrediction.placar})`);
    window.closeAllModals();

    // Se estiver na history.html, chama o render de novo na hora
    if (window.location.pathname.includes('history.html')) {
        window.UI.renderHistory('history-container');
    }
};