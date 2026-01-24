/**
 * GoalDash - INTERFACE (ui.js)
 * VERSÃO DEFINITIVA: 2026 - FULL EDITION
 * Stats, Matches, Live, Header, Dashboard, History e Match Details.
 */

window.UI = {
    showLoading: (containerId) => {
        const container = document.getElementById(containerId);
        if (container) {
            container.innerHTML = `<div class="col-span-full text-center py-20 text-purple-500 animate-pulse font-black uppercase tracking-widest text-[10px]">Sincronizando...</div>`;
        }
    },

    renderMatchHeader: function(match) {

        console.log("⚽ OBJETO DO JOGO COMPLETO:", match);
        const container = document.getElementById('match-header');
        if (!container) return;

        // 1. DATA E HORA (Ajustado para maior legibilidade)
        const rawDate = match.status?.startsAt || match.startsAt;
        let dataDisplay = "";
        let horaDisplay = "";

        if (rawDate) {
            const d = new Date(rawDate);
            if (!isNaN(d.getTime())) {
                const dia = String(d.getDate()).padStart(2, '0');
                const mes = String(d.getMonth() + 1).padStart(2, '0');
                dataDisplay = `${dia}/${mes}`;
                horaDisplay = d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
            }
        }

        // 2. LOGOS (Sua função original do data.js)
        const homeLogo = window.getTeamLogo ? window.getTeamLogo(match.teams.home.names.short, match.teams.home.names.medium) : 'Images/favi.svg';
        const awayLogo = window.getTeamLogo ? window.getTeamLogo(match.teams.away.names.short, match.teams.away.names.medium) : 'Images/favi.svg';

        const hasStarted = match.status?.started === true;
        
        // Conteúdo Central (VS ou Placar)
        const scoreContent = hasStarted 
            ? `<div class="flex items-center justify-center font-[1000]">
                ${match.teams.home.score} <span class="text-purple-500 mx-3">-</span> ${match.teams.away.score}
            </div>`
            : `<div class="flex items-center justify-center h-full">
                <span class="text-white/10 text-5xl md:text-6xl tracking-[0.25em] font-[1000] italic uppercase">VS</span>
            </div>`;

        container.innerHTML = `
            <div class="flex flex-col items-center mb-12">
                <div class="bg-purple-500/10 border border-purple-500/20 px-8 py-2 rounded-full mb-6">
                    <span class="text-sm md:text-base font-black uppercase tracking-[0.3em] text-purple-400">
                        ${match.info?.seasonWeek || "UEFA CHAMPIONS LEAGUE"}
                    </span>
                </div>
                
                <div class="flex gap-6 text-gray-400 text-xs md:text-sm font-black uppercase tracking-[0.4em]">
                    <span class="text-white border-b-2 border-purple-500/30 pb-1">${dataDisplay}</span>
                    <span class="text-purple-500 opacity-50">|</span>
                    <span class="text-white border-b-2 border-purple-500/30 pb-1">${horaDisplay}</span>
                </div>
            </div>

            <div class="flex items-center justify-between gap-4 w-full max-w-6xl mx-auto px-4">
                <div class="flex-1 flex flex-col items-center gap-6">
                    <img src="${homeLogo}" class="w-28 h-28 md:w-44 md:h-44 object-contain drop-shadow-[0_0_30px_rgba(168,85,247,0.25)]">
                    <h2 class="text-2xl md:text-4xl font-[1000] uppercase tracking-tighter text-center leading-tight italic">
                        ${match.teams.home.names.long}
                    </h2>
                </div>

                <div class="flex flex-col items-center gap-8">
                    <div class="flex items-center justify-center text-7xl md:text-9xl font-[1000] italic tracking-tighter bg-white/5 border border-white/10 rounded-[3rem] w-[200px] h-[130px] md:w-[300px] md:h-[180px] shadow-[0_0_50px_rgba(0,0,0,0.5)] relative overflow-hidden">
                        <div class="absolute inset-0 bg-gradient-to-b from-purple-500/5 to-transparent"></div>
                        <div class="relative z-10">
                            ${scoreContent}
                        </div>
                    </div>
                    
                    <div class="flex items-center gap-3 bg-white/10 border border-white/10 px-6 py-2 rounded-full shadow-lg">
                        <span class="w-2.5 h-2.5 rounded-full ${hasStarted ? 'bg-red-500 animate-pulse' : 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]'}"></span>
                        <span class="text-[11px] font-black uppercase tracking-[0.2em] ${hasStarted ? 'text-red-500' : 'text-green-500'}">
                            ${match.status?.displayLong || 'Upcoming'}
                        </span>
                    </div>
                </div>

                <div class="flex-1 flex flex-col items-center gap-6">
                    <img src="${awayLogo}" class="w-28 h-28 md:w-44 md:h-44 object-contain drop-shadow-[0_0_30px_rgba(168,85,247,0.25)]">
                    <h2 class="text-2xl md:text-4xl font-[1000] uppercase tracking-tighter text-center leading-tight italic">
                        ${match.teams.away.names.long}
                    </h2>
                </div>
            </div>
        `;
    },

    renderLineups: function(match) {
        const content = document.getElementById('tab-content');
        if (!content) return;

        // Se o objeto players não existir
        if (!match.players) {
            content.innerHTML = `<div class="py-20 text-center text-gray-500 uppercase text-[10px] font-black italic">Informação das equipas ainda não disponível.</div>`;
            return;
        }

        // TRANSFORMAÇÃO: Converte o dicionário em Array para podermos filtrar
        const allPlayers = Object.values(match.players);
        
        // FILTRAGEM: Separa pelo ID do time (homeID vs awayID)
        const homePlayers = allPlayers.filter(p => p.teamID === match.homeID);
        const awayPlayers = allPlayers.filter(p => p.teamID === match.awayID);

        const playerRow = (p, color) => `
            <div class="flex items-center gap-4 bg-white/[0.03] p-4 rounded-2xl border border-white/5 hover:border-purple-500/20 transition-all group">
                <div class="w-10 h-10 rounded-full bg-black/40 border border-white/10 flex items-center justify-center text-[11px] font-black ${color}">
                    ${p.number || '—'}
                </div>
                <div class="flex flex-col">
                    <span class="text-sm font-black uppercase text-white/90 group-hover:text-purple-400 transition-colors">${p.name}</span>
                    <span class="text-[9px] font-bold text-gray-600 uppercase tracking-widest italic">Titular</span>
                </div>
            </div>
        `;

        content.innerHTML = `
            <div class="grid grid-cols-1 md:grid-cols-2 gap-10 py-10 max-w-6xl mx-auto px-4 animate-fadeIn">
                <div class="space-y-4">
                    <div class="flex items-center gap-3 px-2 mb-6">
                        <div class="w-1 h-6 bg-purple-500 rounded-full"></div>
                        <h3 class="text-lg font-black uppercase italic">${match.homeName}</h3>
                    </div>
                    <div class="grid gap-2">${homePlayers.map(p => playerRow(p, 'text-purple-500')).join('')}</div>
                </div>

                <div class="space-y-4">
                    <div class="flex items-center gap-3 px-2 mb-6">
                        <div class="w-1 h-6 bg-gray-500 rounded-full"></div>
                        <h3 class="text-lg font-black uppercase italic">${match.awayName}</h3>
                    </div>
                    <div class="grid gap-2">${awayPlayers.map(p => playerRow(p, 'text-gray-400')).join('')}</div>
                </div>
            </div>
        `;
    },

    renderH2H: function(match) {
        console.log("📊 Dados para H2H:", match.h2h);
        const content = document.getElementById('tab-content');
        
        // Se a sua API enviar o H2H dentro do objeto match
        const history = match.h2h || [];

        content.innerHTML = `
            <div class="max-w-4xl mx-auto py-10 animate-fadeIn">
                <div class="bg-white/5 border border-white/10 rounded-[3rem] p-10">
                    <h3 class="text-center text-purple-500 font-black uppercase tracking-[0.3em] text-[10px] mb-12">Histórico Recente</h3>
                    <div class="space-y-4">
                        ${history.length > 0 ? history.map(game => `
                            <div class="flex items-center justify-between bg-white/[0.02] p-6 rounded-[2rem] border border-white/5">
                                <span class="text-[10px] font-bold text-gray-500 uppercase">${new Date(game.date).toLocaleDateString('pt-BR')}</span>
                                <div class="flex items-center gap-6">
                                    <span class="font-black italic uppercase text-sm">${game.homeTeam}</span>
                                    <span class="bg-purple-500/20 text-purple-400 px-4 py-1 rounded-lg font-black italic">${game.score}</span>
                                    <span class="font-black italic uppercase text-sm">${game.awayTeam}</span>
                                </div>
                            </div>
                        `).join('') : '<p class="text-center text-gray-500 font-black uppercase text-[10px]">Sem confrontos diretos registados recentemente.</p>'}
                    </div>
                </div>
            </div>
        `;
    },
    renderStats: function(match) {
        const content = document.getElementById('tab-content');
        if (!content) return;

        // Acessando os dados conforme o seu log: match.results['1h'] ou match.results.reg
        const statsData = match.results?.['1h'] || match.results?.reg || match.results?.game;

        if (!statsData) {
            content.innerHTML = `
                <div class="py-20 text-center animate-fadeIn">
                    <p class="text-gray-500 uppercase text-[10px] font-black italic tracking-[0.2em]">Estatísticas em tempo real ainda não disponíveis.</p>
                </div>`;
            return;
        }

        const home = statsData.home || {};
        const away = statsData.away || {};

        // Mapeamento EXATO dos campos do seu console
        const scouts = [
            { label: 'Chutes no Gol', key: 'shots_onGoal' },
            { label: 'Chutes Totais', key: 'shots' },
            { label: 'Passes Certos', key: 'passes_accurate' },
            { label: 'Intercepções', key: 'interceptions' },
            { label: 'Cortes (Clearances)', key: 'clearances' },
            { label: 'Bolas Longas Certas', key: 'longBalls_accurate' },
            { label: 'Dribles Totais', key: 'dribbles_attempted' }
        ];

        content.innerHTML = `
            <div class="max-w-3xl mx-auto py-10 px-4 animate-fadeIn">
                <h3 class="text-center text-purple-500 font-black uppercase tracking-[0.3em] text-[10px] mb-12">Scout Detalhado (1º Tempo)</h3>
                
                ${scouts.map(s => {
                    const valH = home[s.key] || 0;
                    const valA = away[s.key] || 0;
                    const total = (valH + valA) || 1; // Evita divisão por zero
                    const pctH = (valH / total) * 100;

                    return `
                        <div class="mb-8 group">
                            <div class="flex justify-between items-end mb-2 font-black uppercase tracking-widest">
                                <div class="text-white text-2xl italic">${valH}</div>
                                <div class="text-gray-500 text-[9px] mb-1 font-bold">${s.label}</div>
                                <div class="text-white text-2xl italic">${valA}</div>
                            </div>
                            <div class="h-2 bg-white/5 rounded-full overflow-hidden flex border border-white/5 shadow-inner">
                                <div class="h-full bg-gradient-to-r from-purple-600 to-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.3)] transition-all duration-1000 ease-out" style="width: ${pctH}%"></div>
                                <div class="h-full bg-gradient-to-l from-red-600 to-red-400 shadow-[0_0_15px_rgba(239,68,68,0.3)] transition-all duration-1000 ease-out" style="width: ${100 - pctH}%"></div>
                            </div>
                        </div>
                    `;
                }).join('')}
                
                <div class="mt-12 p-6 bg-purple-500/5 border border-purple-500/10 rounded-3xl">
                    <p class="text-[9px] text-center text-purple-400/50 font-black uppercase tracking-[0.2em]">
                        Dados fornecidos via Goal Dash Real-Time Stats
                    </p>
                </div>
            </div>
        `;
    },
    // 4. CARDS AO VIVO (Página live.html)
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
            const home = m.teams?.home;
            const away = m.teams?.away;

            // 1. PLACAR: Prioridade total para o objeto teams que vimos no log
            const scoreH = home?.score ?? m.status?.score?.reg?.home?.points ?? 0;
            const scoreA = away?.score ?? m.status?.score?.reg?.away?.points ?? 0;
            
            const hLogo = window.getTeamLogo(home?.names?.short, home?.names?.medium);
            const aLogo = window.getTeamLogo(away?.names?.short, away?.names?.medium);
            
            // 2. TEMPO: Pega o clock (minutos) ou o estado (1H, HT, 2H)
            const time = m.status?.clock 
                ? `${m.status.clock}'` 
                : (m.status?.state || "LIVE").replace('_', ' ');

            // 3. LIGA: Se leagueName for genérico, tenta o seasonWeek (ex: Premier League 25/26)
            const leagueDisplayName = m.info?.seasonWeek || m.leagueName || 'AO VIVO';

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
                    <span class="text-gray-500 text-[9px] font-black uppercase tracking-widest">${leagueDisplayName}</span>
                </div>

                <div class="flex items-center justify-between gap-4">
                    <div class="flex-1 text-center">
                        <div class="w-16 h-16 mx-auto mb-3 bg-white/5 rounded-2xl p-3 flex items-center justify-center border border-white/5 group-hover:border-purple-500/30 transition-all">
                            <img src="${hLogo}" class="max-w-full max-h-full object-contain drop-shadow-lg" onerror="this.src='Images/favi.svg'">
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
                            <img src="${aLogo}" class="max-w-full max-h-full object-contain drop-shadow-lg" onerror="this.src='Images/favi.svg'">
                        </div>
                        <p class="text-[10px] font-black text-white uppercase truncate px-1">${away?.names?.medium || away?.names?.short}</p>
                    </div>
                </div>
            </div>`;
        }).join('');
    },

    // 5. RENDERIZAÇÃO DE JOGOS (Página Inicial/Index)
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
            const hLogo = window.getTeamLogo(m.teams?.home?.names?.short, hName);
            const aLogo = window.getTeamLogo(m.teams?.away?.names?.short, aName);

            const rawDate = m.status?.startsAt || m.startsAt || m.kickoff;
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
                <img src="${window.getTeamLogo(team.code, team.name)}" class="w-12 h-12 object-contain" onerror="this.src='Images/favi.svg'">
                <span class="text-[10px] font-black text-gray-500 uppercase tracking-widest group-hover:text-white">${team.name}</span>
            </div>`).join('');
    },

    renderTeamDashboard: (data, endedMatches = []) => {
        const resultsContainer = document.getElementById('search-results');
        const initialView = document.getElementById('initial-view');
        if (!resultsContainer || !initialView) return;

        // --- IDENTIFICAÇÃO ANTI-RIVAL (CITY vs UNITED) ---
        const currentID = String(data.id || "").toUpperCase();
        
        const isMyTeam = (targetID) => {
            const id = String(targetID || "").toUpperCase();
            if (currentID.includes("CITY")) {
                return id.includes("CITY") && !id.includes("UNITED");
            }
            const base = currentID.split('_')[0];
            return id.includes(base);
        };

        const statsReal = endedMatches.reduce((acc, m) => {
            const hScore = m.teams?.home?.score ?? 0;
            const aScore = m.teams?.away?.score ?? 0;
            const homeID = m.teams?.home?.teamID;
            const awayID = m.teams?.away?.teamID;
            
            const isHome = isMyTeam(homeID);
            const isAway = isMyTeam(awayID);

            if (hScore === aScore) {
                acc.form.push('E');
            } else if (isHome) {
                if (hScore > aScore) { acc.form.push('V'); acc.wins++; }
                else acc.form.push('D');
            } else if (isAway) {
                if (aScore > hScore) { acc.form.push('V'); acc.wins++; }
                else acc.form.push('D');
            }
            return acc;
        }, { wins: 0, form: [] });

        const winRate = endedMatches.length > 0 
            ? ((statsReal.wins / endedMatches.length) * 100).toFixed(0) 
            : "0";
        
        const formaExibida = statsReal.form.slice(0, 5);

        initialView.classList.add('hidden');
        resultsContainer.classList.remove('hidden');

        let dashLogo = data.logo || `https://api.dicebear.com/7.x/initials/svg?seed=${data.name || 'TM'}&backgroundColor=a855f7`;

        resultsContainer.innerHTML = `
            <button onclick="location.reload()" class="mb-8 text-purple-400 font-black flex items-center gap-2 text-[10px] tracking-widest cursor-pointer hover:text-white transition-colors">
                ← VOLTAR PARA LIGAS
            </button>
            
            <div class="flex flex-col md:flex-row items-center gap-8 bg-white/5 p-8 rounded-[2.5rem] border border-white/10 mb-8 animate-in fade-in duration-500">
                <img src="${dashLogo}" class="w-24 h-24 object-contain drop-shadow-[0_0_15px_rgba(147,51,234,0.3)]" onerror="this.src='Images/favi.svg'">
                <div>
                    <p class="text-[10px] font-black text-purple-500 uppercase tracking-[3px] mb-1">Estatísticas do Time</p>
                    <h2 class="text-4xl md:text-5xl uppercase italic font-black text-white tracking-tighter">${data.name || "Time Desconhecido"}</h2>
                </div>
            </div>
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                <div class="bg-black/30 p-8 rounded-[2rem] border border-white/5">
                    <h3 class="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] mb-8">Forma Recente</h3>
                    <div class="flex gap-3 justify-center md:justify-start">
                        ${formaExibida.length > 0 ? formaExibida.map(res => {
                            let color = res === 'V' ? 'bg-green-500 shadow-green-500/20' : res === 'D' ? 'bg-red-500 shadow-red-500/20' : 'bg-yellow-500 shadow-yellow-500/20';
                            return `<div class="${color} w-10 h-10 rounded-xl flex items-center justify-center text-white font-black italic shadow-lg animate-bounce-short">${res}</div>`;
                        }).join('') : '<p class="text-gray-600 text-[10px] uppercase font-black">Sem jogos recentes...</p>'}
                    </div>
                </div>
                <div class="bg-black/30 p-8 rounded-[2rem] border border-white/5 flex flex-col justify-center">
                    <p class="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] mb-2 text-center md:text-left">Aproveitamento Real</p>
                    <div class="text-4xl font-black italic text-white text-center md:text-left">
                        ${winRate}% <span class="text-sm text-purple-500 not-italic uppercase ml-2 tracking-widest">Win Rate</span>
                    </div>
                </div>
            </div>
            <div class="bg-white/5 border border-white/5 rounded-[2.5rem] p-8">
                <h3 class="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] mb-8">Últimos Confrontos</h3>
                <div class="space-y-4">
                    ${endedMatches.length > 0 ? endedMatches.map(match => {
                        const hScore = match.teams?.home?.score ?? 0;
                        const aScore = match.teams?.away?.score ?? 0;
                        
                        const isHome = isMyTeam(match.teams?.home?.teamID);
                        const myScore = isHome ? hScore : aScore;
                        const oppScore = isHome ? aScore : hScore;
                        
                        let statusClass = "card-draw border-yellow-500/20";
                        if (myScore > oppScore) statusClass = "card-win border-green-500/20";
                        else if (myScore < oppScore) statusClass = "card-loss border-red-500/20";

                        // --- MUDANÇA AQUI: USA O NOME TRADUZIDO QUE PASSAMOS ---
                        const leagueLabel = match.leagueDisplayName || (match.leagueID ? match.leagueID.replace(/_/g, ' ').replace('UEFA ', '') : "PARTIDA");

                        return `
                            <div class="flex items-center justify-between bg-white/[0.02] border p-5 rounded-2xl hover:bg-white/[0.08] transition-all group ${statusClass}">
                                <div class="flex flex-col gap-1 flex-1">
                                    <span class="text-[7px] font-black text-white/40 uppercase tracking-[2px]">${leagueLabel}</span>
                                    <div class="flex items-center gap-4">
                                        <div class="flex-1 text-right">
                                            <span class="text-[11px] font-black text-white uppercase tracking-tighter group-hover:text-purple-400 transition-colors">${match.teams?.home?.names?.medium}</span>
                                        </div>
                                        <div class="bg-black/40 px-4 py-2 rounded-xl border border-white/10 min-w-[85px] text-center shadow-inner">
                                            <span class="text-lg font-black italic text-white">${hScore} - ${aScore}</span>
                                        </div>
                                        <div class="flex-1 text-left">
                                            <span class="text-[11px] font-black text-white uppercase tracking-tighter group-hover:text-purple-400 transition-colors">${match.teams?.away?.names?.medium}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        `;
                    }).join('') : `<p class="text-center text-gray-500 text-[10px] font-black uppercase py-4">Nenhum dado encontrado.</p>`}
                </div>
            </div>`;
    }
    
};

window.GD_UI = window.UI;