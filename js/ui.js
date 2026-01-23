/**
 * GoalDash - INTERFACE (ui.js)
 * VERSÃO DEFINITIVA: 2026 - FULL EDITION
 * Stats, Matches, Live, Header, Dashboard e History.
 */

window.UI = {
    // 1. ESTADOS GLOBAIS
    showLoading: (containerId) => {
        const container = document.getElementById(containerId);
        if (container) {
            container.innerHTML = `<div class="col-span-full text-center py-20 text-purple-500 animate-pulse font-black uppercase tracking-widest text-[10px]">Sincronizando Dados...</div>`;
        }
    },

    // 2. CONTADOR DE GREENS (Status do Cria)
    renderUserStats: async () => {
        const username = localStorage.getItem('goalDash_username');
        const container = document.getElementById('user-stats-display');
        if (!username || !container) return;

        try {
            const res = await fetch('https://696278a1d9d64c761907fe9a.mockapi.io/api/dash/predictions');
            const data = await res.json();
            const meusGreens = data.filter(p => p.username === username && p.status === 'green').length;

            container.innerHTML = `
                <div class="bg-gradient-to-br from-purple-600/20 to-pink-600/20 border border-purple-500/30 p-6 rounded-[2.5rem] flex items-center justify-between animate-in fade-in zoom-in duration-500 mb-8">
                    <div>
                        <p class="text-[10px] font-black text-purple-400 uppercase tracking-[3px] mb-1">Status do Cria</p>
                        <h3 class="text-2xl font-black italic text-white uppercase tracking-tighter">${username}</h3>
                    </div>
                    <div class="text-right">
                        <p class="text-[10px] font-black text-gray-500 uppercase tracking-widest">Total de Greens</p>
                        <div class="flex items-center gap-2 justify-end">
                            <span class="text-4xl font-black text-green-400 italic">${meusGreens}</span>
                            <span class="text-2xl animate-bounce">🔥</span>
                        </div>
                    </div>
                </div>
            `;
        } catch (e) { console.error("Erro stats:", e); }
    },


renderLiveCards: (matches) => {
    const container = document.getElementById('live-matches-container');
    if (!container) return;

    if (!matches || matches.length === 0) {
        container.innerHTML = `
            <div class="col-span-full py-20 text-center opacity-30 uppercase text-[10px] font-black tracking-[0.2em]">
                Nenhum jogo ao vivo no momento
            </div>`;
        return;
    }

    container.innerHTML = matches.map(m => {
        // 1. DADOS DOS TIMES
        const home = m.teams?.home;
        const away = m.teams?.away;
        
        // 2. PLACAR (O que deu certo: reg.home.points)
        const scoreH = m.status?.score?.reg?.home?.points ?? m.status?.score?.home ?? 0;
        const scoreA = m.status?.score?.reg?.away?.points ?? m.status?.score?.away ?? 0;

        // 3. LOGOS (Usando a sua função getTeamLogo do data.js)
        // Passamos o short name (sigla) e o nome médio para a lógica de desempate
        const hLogo = window.getTeamLogo(home?.names?.short, home?.names?.medium);
        const aLogo = window.getTeamLogo(away?.names?.short, away?.names?.medium);

        // 4. TEMPO E ESTADO
        const time = m.status?.clock ? `${m.status.clock}'` : (m.status?.state || "LIVE").replace('_', ' ');

        return `
        <div onclick="window.location.href='matchdetails.html?id=${m.eventID}'" 
             class="group relative bg-black/40 backdrop-blur-xl border border-white/10 p-6 rounded-[2.5rem] hover:border-purple-500/50 transition-all cursor-pointer shadow-2xl">
            
            <div class="flex justify-between items-center mb-6">
                <div class="flex items-center gap-2 bg-red-500/10 px-3 py-1 rounded-full border border-red-500/20">
                    <span class="relative flex h-1.5 w-1.5">
                        <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span class="relative inline-flex rounded-full h-1.5 w-1.5 bg-red-500"></span>
                    </span>
                    <span class="text-red-500 text-[9px] font-black uppercase tracking-tighter">${time}</span>
                </div>
                <span class="text-gray-500 text-[9px] font-black uppercase tracking-widest">${m.leagueName || 'AO VIVO'}</span>
            </div>

            <div class="flex items-center justify-between gap-4">
                <div class="flex-1 text-center">
                    <div class="w-16 h-16 mx-auto mb-3 bg-white/5 rounded-2xl p-3 flex items-center justify-center border border-white/5 group-hover:border-purple-500/30 transition-all">
                        <img src="${hLogo}" class="max-w-full max-h-full object-contain drop-shadow-lg" 
                             onerror="this.src='Images/favi.svg'">
                    </div>
                    <p class="text-[10px] font-black text-white uppercase truncate px-1">${home?.names?.medium || home?.names?.short}</p>
                </div>
                
                <div class="flex flex-col items-center">
                    <div class="bg-white/5 px-6 py-3 rounded-2xl border border-white/10 shadow-inner flex items-center gap-4">
                        <span class="text-4xl font-black italic text-white tabular-nums">${scoreH}</span>
                        <span class="text-purple-500 font-black animate-pulse">:</span>
                        <span class="text-4xl font-black italic text-white tabular-nums">${scoreA}</span>
                    </div>
                </div>

                <div class="flex-1 text-center">
                    <div class="w-16 h-16 mx-auto mb-3 bg-white/5 rounded-2xl p-3 flex items-center justify-center border border-white/5 group-hover:border-purple-500/30 transition-all">
                        <img src="${aLogo}" class="max-w-full max-h-full object-contain drop-shadow-lg" 
                             onerror="this.src='Images/favi.svg'">
                    </div>
                    <p class="text-[10px] font-black text-white uppercase truncate px-1">${away?.names?.medium || away?.names?.short}</p>
                </div>
            </div>
        </div>`;
    }).join('');
},
    // 4. RENDERIZAÇÃO DE JOGOS (Página Inicial)
    renderMatches: (containerId, matches) => {
        const container = document.getElementById(containerId);
        if (!container) return;

        if (!matches || matches.length === 0) {
            container.innerHTML = `<div class="col-span-full text-center py-20 opacity-30 font-black uppercase text-xs">Sem eventos disponíveis</div>`;
            return;
        }

        container.innerHTML = "";
        matches.forEach(m => {
            const hName = m.teams?.home?.names?.medium || m.teams?.home?.names?.short || 'Casa';
            const aName = m.teams?.away?.names?.medium || m.teams?.away?.names?.short || 'Fora';
            const hLogo = window.getTeamLogo ? window.getTeamLogo(m.teams?.home?.names?.short, hName) : 'Images/favi.svg';
            const aLogo = window.getTeamLogo ? window.getTeamLogo(m.teams?.away?.names?.short, aName) : 'Images/favi.svg';

            const rawDate = m.status?.startsAt || m.startsAt;
            let day = "--/--", time = "--:--";
            if (rawDate) {
                const d = new Date(rawDate);
                day = d.toLocaleDateString('pt-PT', { day: '2-digit', month: '2-digit' });
                time = d.toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' });
            }

            const card = document.createElement('div');
            card.className = "match-card bg-slate-900/50 border border-white/5 rounded-3xl hover:border-purple-500/50 transition-all group relative overflow-hidden shadow-2xl";
            card.innerHTML = `
                <a href="matchdetails.html?id=${m.eventID}" class="block p-6">
                    <div class="flex justify-center mb-6">
                        <div class="bg-white/10 border border-white/20 px-4 py-1.5 rounded-full flex items-center gap-3">
                            <span class="text-sm font-black text-purple-400 uppercase tracking-tight">${day}</span>
                            <div class="w-1.5 h-1.5 bg-white/30 rounded-full"></div>
                            <span class="text-sm font-black text-white tracking-tight">${time}</span>
                        </div>
                    </div>
                    <div class="flex items-center justify-between w-full gap-4 mb-10 text-center">
                        <div class="flex flex-col items-center flex-1">
                            <img src="${hLogo}" class="w-16 h-16 object-contain mb-4 group-hover:-translate-y-2 transition-transform duration-500" onerror="this.src='Images/favi.svg'">
                            <span class="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] group-hover:text-white transition-colors line-clamp-1">${hName}</span>
                        </div>
                        <div class="opacity-30"><span class="text-2xl font-black italic text-white">VS</span></div>
                        <div class="flex flex-col items-center flex-1">
                            <img src="${aLogo}" class="w-16 h-16 object-contain mb-4 group-hover:-translate-y-2 transition-transform duration-500" onerror="this.src='Images/favi.svg'">
                            <span class="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] group-hover:text-white transition-colors line-clamp-1">${aName}</span>
                        </div>
                    </div>
                </a>
                <div class="px-6 pb-6">
                    <button onclick="event.preventDefault(); window.handlePalpiteClick('${m.eventID}', '${hName.replace(/'/g, "\\'")}', '${aName.replace(/'/g, "\\")}')" 
                        class="w-full py-4 rounded-2xl text-[11px] font-black text-white uppercase tracking-[3px] bg-gradient-to-r from-white/5 to-white/10 border border-white/10 hover:from-purple-600 hover:to-pink-600 transition-all duration-500 shadow-xl cursor-pointer relative z-20">
                        Dar meu palpite
                    </button>
                </div>`;
            container.appendChild(card);
        });
    },

    // 5. CABEÇALHO (Página MatchDetails)
    renderMatchHeader: (match) => {
        const container = document.getElementById('match-header');
        if (!container || !match) return;
        
        const hName = match.teams?.home?.names?.medium || "Casa";
        const aName = match.teams?.away?.names?.medium || "Fora";
        const hLogo = window.getTeamLogo ? window.getTeamLogo(match.teams?.home?.names?.short, hName) : 'Images/favi.svg';
        const aLogo = window.getTeamLogo ? window.getTeamLogo(match.teams?.away?.names?.short, aName) : 'Images/favi.svg';

        container.innerHTML = `
            <div class="bg-white/5 border border-white/10 rounded-[2.5rem] p-8 md:p-12 relative overflow-hidden animate-in fade-in duration-500">
                <div class="flex flex-col md:flex-row items-center justify-between gap-8 relative z-10">
                    <div class="flex-1 text-center">
                        <img src="${hLogo}" class="w-20 h-20 mx-auto mb-4 object-contain">
                        <h1 class="text-xl font-black uppercase italic tracking-tighter text-white">${hName}</h1>
                    </div>
                    <div class="text-center">
                        <div class="text-6xl font-black italic tracking-tighter text-white">${match.status?.score?.home ?? 0} - ${match.status?.score?.away ?? 0}</div>
                        <div class="text-[10px] font-black text-purple-500 uppercase mt-4 tracking-widest">${match.status?.type || 'AGUARDANDO'}</div>
                    </div>
                    <div class="flex-1 text-center">
                        <img src="${aLogo}" class="w-20 h-20 mx-auto mb-4 object-contain">
                        <h1 class="text-xl font-black uppercase italic tracking-tighter text-white">${aName}</h1>
                    </div>
                </div>
            </div>`;
    },

    // 6. HISTÓRICO (Página History)
    renderHistory: async () => {
        const container = document.getElementById('history-container');
        if (!container) return;
        const username = localStorage.getItem('goalDash_username');
        if (!username) return;

        try {
            const res = await fetch('https://696278a1d9d64c761907fe9a.mockapi.io/api/dash/predictions');
            const data = await res.json();
            const meusPalpites = data.filter(p => p.username === username);
            
            if (meusPalpites.length === 0) {
                container.innerHTML = `<p class="text-white/20 text-center py-20 font-black uppercase">Sem palpites ainda!</p>`;
                return;
            }

            container.innerHTML = meusPalpites.reverse().map(p => `
                <div class="bg-white/5 border border-white/10 p-6 rounded-[2rem] flex flex-col md:flex-row items-center justify-between gap-6 mb-4">
                    <span class="text-white font-black uppercase text-xs flex-1 text-right">${p.matchName?.split(' vs ')[0] || 'Casa'}</span>
                    <div class="flex flex-col items-center">
                        <div class="bg-purple-600/20 px-6 py-3 rounded-2xl text-white font-black italic">${p.homeScore} - ${p.awayScore}</div>
                        <span class="text-[8px] font-black ${p.status === 'green' ? 'text-green-400' : 'text-purple-400'} uppercase mt-2">${(p.status || 'PENDENTE').toUpperCase()}</span>
                    </div>
                    <span class="text-white font-black uppercase text-xs flex-1 text-left">${p.matchName?.split(' vs ')[1] || 'Fora'}</span>
                    <div class="text-[10px] text-white/40 font-bold">${p.createdAt ? new Date(p.createdAt).toLocaleDateString() : '--/--'}</div>
                </div>`).join('');
        } catch (e) { console.error("Erro histórico:", e); }
    },

    // 7. DASHBOARD (Página Stats)
    renderPopularTeams: (teams) => {
        const grid = document.getElementById('popular-teams-grid');
        if (!grid) return;
        grid.innerHTML = teams.map(team => `
            <div onclick="window.handleTeamClickByCode('${team.code}', '${team.name}')" class="group bg-white/5 border border-white/5 p-4 rounded-3xl flex flex-col items-center gap-4 hover:border-purple-500/50 cursor-pointer transition-all">
                <img src="${window.getTeamLogo ? window.getTeamLogo(team.code, team.name) : 'Images/favi.svg'}" class="w-12 h-12 object-contain" onerror="this.src='Images/favi.svg'">
                <span class="text-[10px] font-black text-gray-500 uppercase tracking-widest group-hover:text-white">${team.name}</span>
            </div>`).join('');
    },

    renderTeamDashboard: (data, endedMatches = []) => {
        const resultsContainer = document.getElementById('search-results');
        const initialView = document.getElementById('initial-view');
        if (!resultsContainer || !initialView) return;

        const currentTeamID = data.id || ""; 
        const statsReal = endedMatches.reduce((acc, m) => {
            const hScore = m.teams?.home?.score ?? 0;
            const aScore = m.teams?.away?.score ?? 0;
            const isHome = String(m.teams?.home?.teamID) === String(currentTeamID);
            
            if (hScore === aScore) acc.form.push('E');
            else if (isHome) {
                if (hScore > aScore) { acc.wins++; acc.form.push('V'); }
                else acc.form.push('D');
            } else {
                if (aScore > hScore) { acc.wins++; acc.form.push('V'); }
                else acc.form.push('D');
            }
            return acc;
        }, { wins: 0, form: [] });

        const winRate = endedMatches.length > 0 ? ((statsReal.wins / endedMatches.length) * 100).toFixed(0) : "0";
        const formaExibida = statsReal.form.slice(0, 5);

        initialView.classList.add('hidden');
        resultsContainer.classList.remove('hidden');

        resultsContainer.innerHTML = `
            <button onclick="location.reload()" class="mb-8 text-purple-400 font-black flex items-center gap-2 text-[10px] tracking-widest cursor-pointer">← VOLTAR</button>
            <div class="flex flex-col md:flex-row items-center gap-8 bg-white/5 p-8 rounded-[2.5rem] border border-white/10 mb-8">
                <img src="${window.getTeamLogo ? window.getTeamLogo(data.code, data.name) : 'Images/favi.svg'}" class="w-24 h-24 object-contain shadow-2xl">
                <div>
                    <p class="text-[10px] font-black text-purple-500 uppercase tracking-[3px] mb-1">Estatísticas do Time</p>
                    <h2 class="text-4xl md:text-5xl uppercase italic font-black text-white tracking-tighter">${data.name}</h2>
                </div>
            </div>
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                <div class="bg-black/30 p-8 rounded-[2rem] border border-white/5">
                    <h3 class="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] mb-8 text-center md:text-left">Forma Recente</h3>
                    <div class="flex gap-3 justify-center md:justify-start">
                        ${formaExibida.map(res => `<div class="${res === 'V' ? 'bg-green-500' : res === 'D' ? 'bg-red-500' : 'bg-gray-500'} w-10 h-10 rounded-xl flex items-center justify-center text-white font-black italic">${res}</div>`).join('')}
                    </div>
                </div>
                <div class="bg-black/30 p-8 rounded-[2rem] border border-white/5 flex flex-col justify-center">
                    <p class="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] mb-2 text-center md:text-left">Aproveitamento</p>
                    <div class="text-3xl font-black italic text-white text-center md:text-left">${winRate}% <span class="text-sm text-purple-500 not-italic uppercase ml-2 tracking-widest">Win Rate</span></div>
                </div>
            </div>
            <div class="bg-white/5 border border-white/5 rounded-[2.5rem] p-8">
                <h3 class="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] mb-8">Últimos Confrontos</h3>
                <div class="space-y-4">
                    ${endedMatches.map(match => `
                        <div class="flex items-center justify-between bg-white/[0.02] border border-white/5 p-5 rounded-2xl">
                            <div class="flex-1 text-right text-[11px] font-black uppercase text-white">${match.teams.home.names.medium}</div>
                            <div class="bg-black/40 px-4 py-2 rounded-xl border border-white/10 min-w-[80px] text-center mx-4 text-purple-400 font-black italic">${match.teams.home.score} - ${match.teams.away.score}</div>
                            <div class="flex-1 text-left text-[11px] font-black uppercase text-white">${match.teams.away.names.medium}</div>
                        </div>`).join('')}
                </div>
            </div>`;
    }
};

window.GD_UI = window.UI; // Backup de exportação