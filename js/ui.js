/**
 * GoalDash - INTERFACE (ui.js)
 * COMPLETO: Stats, Matches, Live, Header, Dashboard e History.
 */

window.UI = {
    // 1. Estados Globais
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

    // 3. PARTIDAS AO VIVO (LIVE) - NOMES CORRIGIDOS
    renderLiveMatches: (containerId, matches) => {
        const container = document.getElementById(containerId);
        if (!container) return;
        container.innerHTML = "";

        if (!matches || matches.length === 0) {
            container.innerHTML = `<div class="col-span-full text-center py-10 opacity-30 font-black uppercase text-[10px] tracking-widest">Nenhuma partida em destaque no momento</div>`;
            return;
        }

        matches.forEach(m => {
            const home = m.teams?.home;
            const away = m.teams?.away;

            // Lógica de nomes igual à que você mandou
            const hName = home?.names?.medium || home?.names?.long || home?.names?.short || 'Casa';
            const aName = away?.names?.medium || away?.names?.long || away?.names?.short || 'Fora';

            const homeLogo = window.getTeamLogo(home?.names?.short, home?.names?.medium);
            const awayLogo = window.getTeamLogo(away?.names?.short, away?.names?.medium);
            
            const homeScore = m.status?.score?.home ?? 0;
            const awayScore = m.status?.score?.away ?? 0;
            const timeLive = m.status?.liveTime || 'LIVE';

            const card = document.createElement('div');
            card.className = "match-card bg-purple-600/5 border border-purple-500/20 rounded-3xl hover:border-purple-500/50 transition-all group relative overflow-hidden shadow-2xl";
            
            card.innerHTML = `
                <a href="matchdetails.html?id=${m.eventID}" class="block p-6">
                    <div class="flex justify-between items-center mb-6">
                        <div class="flex items-center gap-2">
                            <span class="relative flex h-2 w-2">
                                <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                <span class="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                            </span>
                            <span class="text-[10px] font-black text-red-500 uppercase tracking-widest">${timeLive}</span>
                        </div>
                        <div class="bg-white/5 px-3 py-1 rounded-full text-[10px] font-black text-white/50 uppercase italic">Ao Vivo</div>
                    </div>
                    
                    <div class="flex items-center justify-between w-full gap-4 mb-6 text-center">
                        <div class="flex flex-col items-center flex-1">
                            <img src="${homeLogo}" class="w-12 h-12 object-contain mb-2" onerror="this.src='Images/favi.svg'">
                            <span class="text-[9px] font-black text-slate-400 uppercase line-clamp-1">${hName}</span>
                        </div>
                        <div class="flex flex-col items-center">
                            <span class="text-3xl font-black italic text-white tracking-tighter">${homeScore} - ${awayScore}</span>
                        </div>
                        <div class="flex flex-col items-center flex-1">
                            <img src="${awayLogo}" class="w-12 h-12 object-contain mb-2" onerror="this.src='Images/favi.svg'">
                            <span class="text-[9px] font-black text-slate-400 uppercase line-clamp-1">${aName}</span>
                        </div>
                    </div>
                </a>`;
            container.appendChild(card);
        });
    },

    // 4. RENDERIZAÇÃO DE JOGOS (Design Próximos Jogos) - NOMES CORRIGIDOS
    renderMatches: (containerId, matches) => {
        const container = document.getElementById(containerId);
        if (!container) return;
        container.innerHTML = "";

        if (!matches || matches.length === 0) {
            container.innerHTML = `<div class="col-span-full text-center py-20 opacity-30 font-black uppercase text-xs">Sem eventos disponíveis</div>`;
            return;
        }

        matches.forEach(m => {
            const home = m.teams?.home;
            const away = m.teams?.away;

            // Prioridade de nomes EXATAMENTE como no seu código de referência
            const hName = home?.names?.medium || home?.names?.long || home?.names?.short || 'Casa';
            const aName = away?.names?.medium || away?.names?.long || away?.names?.short || 'Fora';

            const homeLogo = window.getTeamLogo(home?.names?.short, home?.names?.medium);
            const awayLogo = window.getTeamLogo(away?.names?.short, away?.names?.medium);

            const rawDate = m.status?.startsAt || m.startsAt;
            let day = "--/--", time = "--:--";
            if (rawDate) {
                const gameDate = new Date(rawDate);
                if (!isNaN(gameDate.getTime())) {
                    day = gameDate.toLocaleDateString('pt-PT', { day: '2-digit', month: '2-digit' });
                    time = gameDate.toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' });
                }
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
                            <div class="relative mb-4 group-hover:-translate-y-2 transition-transform duration-500">
                                <div class="absolute inset-0 rounded-full blur-xl opacity-30 bg-purple-600"></div>
                                <img src="${homeLogo}" class="relative z-10 w-16 h-16 object-contain drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]" onerror="this.src='Images/favi.svg'">
                            </div>
                            <span class="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] group-hover:text-white transition-colors line-clamp-1">${hName}</span>
                        </div>
                        <div class="opacity-30"><span class="text-2xl font-black italic text-white">VS</span></div>
                        <div class="flex flex-col items-center flex-1">
                            <div class="relative mb-4 group-hover:-translate-y-2 transition-transform duration-500">
                                <div class="absolute inset-0 rounded-full blur-xl opacity-30 bg-pink-600"></div>
                                <img src="${awayLogo}" class="relative z-10 w-16 h-16 object-contain drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]" onerror="this.src='Images/favi.svg'">
                            </div>
                            <span class="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] group-hover:text-white transition-colors line-clamp-1">${aName}</span>
                        </div>
                    </div>
                </a>
                <div class="px-6 pb-6">
                    <button onclick="handlePalpiteClick('${m.eventID}', '${hName.replace(/'/g, "\\'")}', '${aName.replace(/'/g, "\\")}')" 
                        class="w-full py-4 rounded-2xl text-[11px] font-black text-white uppercase tracking-[3px] bg-gradient-to-r from-white/5 to-white/10 border border-white/10 hover:from-purple-600 hover:to-pink-600 transition-all duration-500 shadow-xl cursor-pointer relative z-20">
                        Dar meu palpite
                    </button>
                </div>`;
            container.appendChild(card);
        });
    },

    // 5. Cabeçalho MatchDetails - NOMES CORRIGIDOS
    renderMatchHeader: (match) => {
        const container = document.getElementById('match-header');
        if (!container || !match) return;
        
        const hName = match.teams?.home?.names?.medium || match.teams?.home?.names?.long || "Casa";
        const aName = match.teams?.away?.names?.medium || match.teams?.away?.names?.long || "Fora";
        
        const hLogo = window.getTeamLogo(match.teams?.home?.names?.short, hName);
        const aLogo = window.getTeamLogo(match.teams?.away?.names?.short, aName);

        container.innerHTML = `
            <div class="bg-white/5 border border-white/10 rounded-[2.5rem] p-8 md:p-12 relative overflow-hidden animate-in fade-in duration-500">
                <div class="flex flex-col md:flex-row items-center justify-between gap-8 relative z-10">
                    <div class="flex-1 text-center">
                        <img src="${hLogo}" class="w-20 h-20 mx-auto mb-4 object-contain">
                        <h1 class="text-xl font-black uppercase italic tracking-tighter text-white">${hName}</h1>
                    </div>
                    <div class="text-center">
                        <div class="text-[10px] font-black text-purple-500 uppercase tracking-[3px] mb-2">${match.displayDay || '--/--'}</div>
                        <div class="text-6xl font-black italic tracking-tighter text-white">${match.status?.score?.home ?? 0} - ${match.status?.score?.away ?? 0}</div>
                        <div class="text-[10px] font-black text-gray-500 uppercase mt-2">${match.status?.liveTime || 'Início: ' + match.displayTime}</div>
                    </div>
                    <div class="flex-1 text-center">
                        <img src="${aLogo}" class="w-20 h-20 mx-auto mb-4 object-contain">
                        <h1 class="text-xl font-black uppercase italic tracking-tighter text-white">${aName}</h1>
                    </div>
                </div>
            </div>`;
    },

    // 6. Dashboard e Estatísticas
    renderPopularTeams: (teams) => {
        const grid = document.getElementById('popular-teams-grid');
        if (!grid) return;
        grid.innerHTML = teams.map(team => `
            <div onclick="window.handleTeamClickByCode('${team.code}', '${team.name}')" class="group bg-white/5 border border-white/5 p-4 rounded-3xl flex flex-col items-center gap-4 hover:border-purple-500/50 cursor-pointer transition-all">
                <img src="${window.getTeamLogo(team.code, team.name)}" class="w-12 h-12 object-contain" onerror="this.src='Images/favi.svg'">
                <span class="text-[10px] font-black text-gray-500 uppercase tracking-widest group-hover:text-white">${team.name}</span>
            </div>`).join('');
    },

    renderTeamDashboard: (data, endedMatches = []) => {
        const resultsContainer = document.getElementById('search-results');
        const initialView = document.getElementById('initial-view');
        if (!resultsContainer || !initialView) return;

        // --- CÁLCULO DINÂMICO DE STATS (JAN/2026) ---
        // Identifica o ID do time atual para saber se ele é Home ou Away nos jogos
        const currentTeamID = data.id || ""; 
        
        const statsReal = endedMatches.reduce((acc, m) => {
            const hScore = m.teams?.home?.score ?? 0;
            const aScore = m.teams?.away?.score ?? 0;
            const isHome = String(m.teams?.home?.teamID) === String(currentTeamID);
            
            if (hScore === aScore) acc.form.push('E');
            else if (isHome) {
                if (hScore > aScore) { acc.form.push('V'); acc.wins++; }
                else acc.form.push('D');
            } else {
                if (aScore > hScore) { acc.form.push('V'); acc.wins++; }
                else acc.form.push('D');
            }
            return acc;
        }, { wins: 0, form: [] });

        const winRate = endedMatches.length > 0 
            ? ((statsReal.wins / endedMatches.length) * 100).toFixed(0) 
            : "0";
        
        // Pega as últimas 5 partidas para a forma
        const formaExibida = statsReal.form.slice(0, 5);
        // --------------------------------------------

        initialView.classList.add('hidden');
        resultsContainer.classList.remove('hidden');

        // Tenta pegar a logo de várias formas para não vir o "?"
        let dashLogo = 'Images/favi.svg'; // padrão

        if (data.name) {
            // 1. Limpa o nome (ex: "Real Madrid" vira "real-madrid")
            const cleanName = data.name.toLowerCase().replace(/\s+/g, '-');
            
            // 2. Tenta usar um serviço de logos gratuito baseado no nome
            // Esse serviço (clearbit) é ótimo para logos de empresas/marcas, 
            // mas para times, o melhor é o do FotMob se tivermos o ID.
            // Como não temos o ID numérico de todos, vamos usar uma busca por nome:
            dashLogo = `https://api.dicebear.com/7.x/initials/svg?seed=${data.name}&backgroundColor=a855f7`; 
            
            // Se você quiser tentar logos reais, esse site aqui costuma funcionar bem:
            // dashLogo = `https://www.thesportsdb.com/images/media/team/badge/small/${cleanName}.png`;
        }

        // Se o time for muito famoso, a gente pode ter um mini-mapa automático
        const shortcuts = {
            "Real Madrid": "8633",
            "Bayern": "9823",
            "Man City": "8456",
            "Barcelona": "8634",
            "PSG": "9847",
            "Liverpool": "8650"
        };

        for (let key in shortcuts) {
            if (data.name.includes(key)) {
                dashLogo = `https://images.fotmob.com/image_resources/logo/teamlogo/${shortcuts[key]}.png`;
            }
        }

        resultsContainer.innerHTML = `
            <button onclick="location.reload()" class="mb-8 text-purple-400 font-black flex items-center gap-2 text-[10px] tracking-widest cursor-pointer">
                ← VOLTAR
            </button>
            
            <div class="flex flex-col md:flex-row items-center gap-8 bg-white/5 p-8 rounded-[2.5rem] border border-white/10 mb-8 animate-in fade-in duration-500">
                <img src="${dashLogo}" class="w-24 h-24 object-contain shadow-2xl" onerror="this.src='Images/favi.svg'">
                <div>
                    <p class="text-[10px] font-black text-purple-500 uppercase tracking-[3px] mb-1">Estatísticas do Time</p>
                    <h2 class="text-4xl md:text-5xl uppercase italic font-black text-white tracking-tighter">${data.name}</h2>
                </div>
            </div>

            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8 animate-in slide-in-from-bottom-4 duration-700">
                <div class="bg-black/30 p-8 rounded-[2rem] border border-white/5">
                    <h3 class="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] mb-8">Forma Recente (Jan/2026)</h3>
                    <div class="flex gap-3 justify-center md:justify-start">
                        ${formaExibida.length > 0 ? formaExibida.map(res => {
                            let color = res === 'V' ? 'bg-green-500' : res === 'D' ? 'bg-red-500' : 'bg-gray-500';
                            return `<div class="${color} w-10 h-10 rounded-xl flex items-center justify-center text-white font-black italic shadow-lg animate-bounce-short">${res}</div>`;
                        }).join('') : '<p class="text-gray-600 text-[10px] uppercase font-black">Calculando forma...</p>'}
                    </div>
                </div>
                
                <div class="bg-black/30 p-8 rounded-[2rem] border border-white/5 flex flex-col justify-center">
                    <p class="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] mb-2 text-center md:text-left">Aproveitamento Real</p>
                    <div class="text-3xl font-black italic text-white text-center md:text-left">
                        ${winRate}% <span class="text-sm text-purple-500 not-italic uppercase ml-2 tracking-widest">Win Rate</span>
                    </div>
                </div>
            </div>

            <div class="bg-white/5 border border-white/5 rounded-[2.5rem] p-8 animate-in slide-in-from-bottom-8 duration-1000">
                <h3 class="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] mb-8 text-center md:text-left">Resultados Oficiais</h3>
                <div class="space-y-4">
                    ${endedMatches.length > 0 ? endedMatches.map(match => {
                        const hScore = match.teams?.home?.score ?? 0;
                        const aScore = match.teams?.away?.score ?? 0;
                        const homeName = match.teams?.home?.names?.medium || "Casa";
                        const awayName = match.teams?.away?.names?.medium || "Fora";
                        
                        return `
                            <div class="flex items-center justify-between bg-white/[0.02] border border-white/5 p-5 rounded-2xl hover:bg-white/[0.05] transition-all group">
                                <div class="flex-1 text-right pr-4">
                                    <span class="text-[11px] font-black text-white uppercase tracking-tighter group-hover:text-purple-400 transition-colors">${homeName}</span>
                                </div>
                                <div class="bg-black/40 px-4 py-2 rounded-xl border border-white/10 min-w-[80px] text-center shadow-inner">
                                    <span class="text-lg font-black italic text-purple-400">${hScore} - ${aScore}</span>
                                </div>
                                <div class="flex-1 text-left pl-4">
                                    <span class="text-[11px] font-black text-white uppercase tracking-tighter group-hover:text-purple-400 transition-colors">${awayName}</span>
                                </div>
                            </div>
                        `;
                    }).join('') : `<p class="text-center text-gray-500 text-[10px] font-black uppercase py-4">Buscando confrontos de 2026...</p>`}
                </div>
            </div>
        `;
    },

    // 7. Histórico (MockAPI)
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
        } catch (e) { console.error(e); }
    }
};

window.GD_UI = window.UI;