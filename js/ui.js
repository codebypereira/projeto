/**
 * GoalDash - INTERFACE (ui.js)
 * FOCO: Renderização de Cards, Modais, Histórico e Estatísticas de Equipas.
 * LOGO: Sistema integrado com data.js (FotMob)
 */

window.UI = {
    // 1. Estados Globais de UI
    showLoading: (containerId) => {
        const container = document.getElementById(containerId);
        if (container) {
            container.innerHTML = `<div class="col-span-full text-center py-20 text-purple-500 animate-pulse font-black uppercase tracking-widest text-[10px]">Sincronizando Dados...</div>`;
        }
    },

    // 2. Renderização de Jogos (Página Inicial)
    renderMatches: (containerId, matches) => {
        const container = document.getElementById(containerId);
        if (!container) return;

        if (!matches || matches.length === 0) {
            container.innerHTML = `<div class="col-span-full text-center py-20 opacity-30 font-black uppercase text-xs">Sem eventos disponíveis</div>`;
            return;
        }

        container.innerHTML = matches.map(match => {
            try {
                return window.UI.components.matchCard(match);
            } catch (e) {
                console.warn("Erro ao renderizar card individual:", e);
                return ""; 
            }
        }).join('');
    },

    // 3. Cabeçalho de Detalhes do Jogo
    renderMatchHeader: (match) => {
        const container = document.getElementById('match-header');
        if (!container || !match) return;

        const hName = match.teams?.home?.names?.medium || "Casa";
        const aName = match.teams?.away?.names?.medium || "Fora";
        const hCode = match.teams?.home?.names?.short || "";
        const aCode = match.teams?.away?.names?.short || "";

        // USANDO TUA FUNÇÃO DO DATA.JS
        const hLogo = window.getTeamLogo(hCode, hName);
        const aLogo = window.getTeamLogo(aCode, aName);

        container.innerHTML = `
            <div class="bg-white/5 border border-white/10 rounded-[2.5rem] p-8 md:p-12 relative overflow-hidden animate-in fade-in duration-500">
                <div class="flex flex-col md:flex-row items-center justify-between gap-8 relative z-10">
                    <div class="flex-1 text-center">
                        <img src="${hLogo}" class="w-20 h-20 mx-auto mb-4 object-contain" onerror="this.src='Images/favi.svg'">
                        <h1 class="text-xl font-black uppercase italic tracking-tighter text-white">${hName}</h1>
                    </div>
                    <div class="text-center">
                        <div class="text-[10px] font-black text-purple-500 uppercase tracking-[3px] mb-2">${match.displayDay || '--/--'}</div>
                        <div class="text-6xl font-black italic tracking-tighter text-white">${match.status?.score?.home ?? 0} - ${match.status?.score?.away ?? 0}</div>
                        <div class="text-[10px] font-black text-gray-500 uppercase tracking-[2px] mt-2">${match.displayTime || 'Pendente'}</div>
                    </div>
                    <div class="flex-1 text-center">
                        <img src="${aLogo}" class="w-20 h-20 mx-auto mb-4 object-contain" onerror="this.src='Images/favi.svg'">
                        <h1 class="text-xl font-black uppercase italic tracking-tighter text-white">${aName}</h1>
                    </div>
                </div>
            </div>
        `;
    },

    // 4. LÓGICA DE ESTATÍSTICAS (Página Stats.html)
    renderPopularTeams: (teams) => {
        const grid = document.getElementById('popular-teams-grid');
        if (!grid) return;
        grid.innerHTML = teams.map(team => {
            // USANDO O 'CODE' QUE TU MANDOU (RMA, FLA, etc)
            const logoUrl = window.getTeamLogo(team.code, team.name);
            return `
                <div onclick="window.handleTeamClickByCode('${team.code}', '${team.name}')" 
                     class="group bg-white/5 border border-white/5 p-4 rounded-3xl flex flex-col items-center gap-4 hover:border-purple-500/50 hover:bg-purple-500/5 transition-all cursor-pointer">
                    <img src="${logoUrl}" class="w-12 h-12 object-contain" onerror="this.src='Images/favi.svg'">
                    <span class="text-[10px] font-black text-gray-500 uppercase tracking-widest group-hover:text-white text-center">
                        ${team.name}
                    </span>
                </div>
            `;
        }).join('');
    },

    renderTeamDashboard: (data) => {
        const resultsContainer = document.getElementById('search-results');
        const initialView = document.getElementById('initial-view');
        if (!resultsContainer || !initialView) return;

        initialView.classList.add('hidden');
        resultsContainer.classList.remove('hidden');

        // Pega a logo baseada no código que injetamos no main.js
        const dashLogo = window.getTeamLogo(data.code || "", data.name);

        resultsContainer.innerHTML = `
            <button onclick="location.reload()" class="mb-8 text-purple-400 font-black flex items-center gap-2 hover:text-white transition-colors cursor-pointer text-[10px] tracking-widest">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7"/></svg>
                VOLTAR
            </button>

            <div class="flex flex-col md:flex-row items-center gap-8 bg-white/5 p-8 rounded-[2.5rem] border border-white/10 mb-8 backdrop-blur-xl animate-in fade-in duration-500">
                <img src="${dashLogo}" class="w-24 h-24 md:w-32 md:h-32 object-contain" onerror="this.src='Images/favi.svg'">
                <div class="text-center md:text-left">
                    <h2 class="text-4xl md:text-7xl uppercase italic tracking-tighter leading-none mb-4 font-black text-white">${data.name}</h2>
                    <div class="flex flex-wrap justify-center md:justify-start gap-4 text-gray-400 text-[10px] font-black uppercase tracking-widest">
                        <span class="bg-white/5 px-4 py-2 rounded-full border border-white/5">🏆 ${data.league}</span>
                        <span class="bg-white/5 px-4 py-2 rounded-full border border-white/5">🆔 ${data.id}</span>
                    </div>
                </div>
            </div>

            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in slide-in-from-bottom-4 duration-700">
                <div class="bg-black/30 p-8 rounded-[2rem] border border-white/5">
                    <h3 class="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] mb-8">Forma Recente (Últimos 5 jogos)</h3>
                    <div class="flex gap-3 justify-center md:justify-start">
                        ${data.form.map(res => {
                            let color = res === 'V' ? 'bg-green-500' : res === 'D' ? 'bg-red-500' : 'bg-gray-500';
                            return `<div class="${color} w-12 h-12 rounded-full flex items-center justify-center font-black text-white shadow-lg shadow-${color.split('-')[1]}-500/20 text-lg">${res}</div>`;
                        }).join('')}
                    </div>
                </div>
                <div class="bg-black/30 p-8 rounded-[2rem] border border-white/5 flex items-center justify-between">
                    <div>
                        <h3 class="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] mb-2">Análise GoalDash</h3>
                        <p class="text-3xl font-black text-purple-400 italic">SISTEMA ATIVO</p>
                    </div>
                    <div class="text-right">
                        <p class="text-[10px] text-gray-500 font-black uppercase tracking-widest">Confiança</p>
                        <p class="text-4xl font-black italic text-white">98%</p>
                    </div>
                </div>
            </div>
        `;
    },

    // 5. Histórico de Palpites
    renderHistory: () => {
        const container = document.getElementById('history-container');
        if (!container) return;
        const historico = JSON.parse(localStorage.getItem('goalDash_history') || '[]');
        if (historico.length === 0) {
            container.innerHTML = `<div class="col-span-full text-center py-20"><p class="text-white/20 font-black uppercase italic tracking-widest text-xs">Sem palpites, cria!</p></div>`;
            return;
        }
        container.innerHTML = historico.map(p => `
            <div class="bg-white/5 border border-white/10 p-6 rounded-[2rem] flex flex-col md:flex-row items-center justify-between gap-6 hover:bg-white/[0.07] transition-all">
                <div class="flex-1 text-center md:text-right"><span class="text-white font-black uppercase italic text-xs tracking-tighter">${p.homeTeam}</span></div>
                <div class="bg-purple-600/20 border border-purple-500/30 px-6 py-3 rounded-2xl"><span class="text-white text-2xl font-black italic">${p.homeScore} - ${p.awayScore}</span></div>
                <div class="flex-1 text-center md:text-left"><span class="text-white font-black uppercase italic text-xs tracking-tighter">${p.awayTeam}</span></div>
                <div class="md:border-l md:border-white/10 md:pl-6 text-center text-[10px] text-white/40 font-bold">${p.date}</div>
            </div>
        `).join('');
    },

    // 6. Componentes Internos
    components: {
        matchCard: (match) => {
            const hName = match.teams?.home?.names?.medium || "Casa";
            const aName = match.teams?.away?.names?.medium || "Fora";
            const hCode = match.teams?.home?.names?.short || "";
            const aCode = match.teams?.away?.names?.short || "";

            // LOGOS VIA DATA.JS
            const hLogo = window.getTeamLogo(hCode, hName);
            const aLogo = window.getTeamLogo(aCode, aName);

            return `
                <div onclick="window.location.href='matchdetails.html?id=${match.eventID}'" 
                     class="bg-black/40 border border-white/5 p-8 rounded-[2.5rem] text-center group hover:border-purple-500/50 transition-all duration-500 cursor-pointer">
                    <div class="flex justify-center mb-6">
                        <div class="bg-white/10 border border-white/20 px-4 py-1.5 rounded-full flex items-center gap-3">
                            <span class="text-sm font-black text-purple-400 uppercase tracking-tight">${match.displayDay || '--/--'}</span>
                            <div class="w-1.5 h-1.5 bg-white/30 rounded-full"></div>
                            <span class="text-sm font-black text-white tracking-tight">${match.displayTime || '--:--'}</span>
                        </div>
                    </div>
                    <div class="flex items-center justify-between gap-4 mb-10">
                        <div class="flex-1">
                            <img src="${hLogo}" class="w-16 h-16 mx-auto object-contain mb-3 group-hover:-translate-y-1 transition-transform" onerror="this.src='Images/favi.svg'">
                            <span class="text-[10px] font-black text-white uppercase block opacity-60 group-hover:opacity-100">${hName}</span>
                        </div>
                        <span class="text-xl font-black italic text-white/10">VS</span>
                        <div class="flex-1">
                            <img src="${aLogo}" class="w-16 h-16 mx-auto object-contain mb-3 group-hover:-translate-y-1 transition-transform" onerror="this.src='Images/favi.svg'">
                            <span class="text-[10px] font-black text-white uppercase block opacity-60 group-hover:opacity-100">${aName}</span>
                        </div>
                    </div>
                    <button onclick="event.stopPropagation(); window.handlePalpiteClick('${match.eventID}', '${hName.replace(/'/g, "\\'")}', '${aName.replace(/'/g, "\\")}')" 
                        class="w-full py-4 rounded-2xl bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-[3px] hover:bg-gradient-to-r hover:from-purple-600 hover:to-pink-600 transition-all duration-500 cursor-pointer text-white">
                        Dar Meu Palpite
                    </button>
                </div>`;
        }
    }
};

window.GD_UI = window.UI;