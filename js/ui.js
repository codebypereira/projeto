window.UI = {
    showLoading: (containerId) => {
        const container = document.getElementById(containerId);
        if (container) {
            container.innerHTML = `<div class="col-span-full text-center py-20 text-purple-500 animate-pulse font-black uppercase tracking-widest text-[10px]">Sincronizando Dados...</div>`;
        }
    },

    renderMatches: (containerId, matches) => {
        const container = document.getElementById(containerId);
        if (!container) return;

        if (!matches || matches.length === 0) {
            container.innerHTML = `<div class="col-span-full text-center py-20 opacity-30 font-black uppercase text-xs">Sem eventos disponíveis</div>`;
            return;
        }

        // Usamos um try/catch dentro do map para que, se um card der erro, os outros continuem a aparecer
        const html = matches.map(match => {
            try {
                return window.UI.components.matchCard(match);
            } catch (e) {
                console.warn("Erro ao renderizar card individual:", e);
                return ""; 
            }
        }).join('');
        
        container.innerHTML = html;
    },

    // --- NOVAS FUNÇÕES MIGRADAS DO API.JS ---

    renderLiveCards: (matches) => {
        const container = document.getElementById('live-matches-container');
        if (!container) return;
        container.innerHTML = '';

        matches.forEach(m => {
            let hScore = m.results?.reg?.home?.points ?? 0;
            let aScore = m.results?.reg?.away?.points ?? 0;

            // Animação de Golo (Usa o estado global previousScores do api.js)
            const last = window.previousScores ? window.previousScores[m.eventID] : null;
            let flashClass = (last && (last.h !== hScore || last.a !== aScore)) ? "ring-4 ring-purple-500 animate-pulse" : "";
            if (window.previousScores) window.previousScores[m.eventID] = { h: hScore, a: aScore };

            // Puxando do Fotmob via data.js
            const hLogo = window.getTeamLogo ? window.getTeamLogo(m.teams.home.names.short, m.teams.home.names.medium) : "";
            const aLogo = window.getTeamLogo ? window.getTeamLogo(m.teams.away.names.short, m.teams.away.names.medium) : "";

            const card = document.createElement('div');
            card.className = `bg-slate-900/90 border border-white/10 p-8 rounded-[2.5rem] transition-all duration-700 ${flashClass}`;
            card.innerHTML = `
                <div class="flex justify-center mb-6">
                    <span class="bg-red-600 px-4 py-1 rounded-full text-[10px] font-black text-white flex items-center gap-2">
                        <span class="animate-ping h-2 w-2 rounded-full bg-white"></span>
                        ${m.status.clock ? m.status.clock + "'" : 'LIVE'}
                    </span>
                </div>
                <div class="flex items-center justify-between gap-4 mb-8 text-center">
                    <div class="flex-1">
                        <img src="${hLogo}" class="w-20 h-20 mx-auto mb-3 object-contain" onerror="this.src='Images/favi.svg'">
                        <span class="text-[11px] font-black text-gray-400 uppercase block">${m.teams.home.names.medium}</span>
                    </div>
                    <div class="flex flex-col items-center px-4">
                        <div class="flex items-center gap-4">
                            <span class="text-5xl font-black italic text-white">${hScore}</span>
                            <span class="text-2xl font-bold text-white/10">:</span>
                            <span class="text-5xl font-black italic text-white">${aScore}</span>
                        </div>
                    </div>
                    <div class="flex-1">
                        <img src="${aLogo}" class="w-20 h-20 mx-auto mb-3 object-contain" onerror="this.src='Images/favi.svg'">
                        <span class="text-[11px] font-black text-gray-400 uppercase block">${m.teams.away.names.medium}</span>
                    </div>
                </div>
                <button onclick="window.location.href='matchdetails.html?id=${m.eventID}'" class="w-full py-4 rounded-2xl text-[10px] font-black text-white uppercase tracking-widest bg-white/5 border border-white/10 hover:bg-purple-600 transition-all cursor-pointer">
                    Estatísticas Completas
                </button>
            `;
            container.appendChild(card);
        });
    },

    renderHeader: () => {
        const m = window.currentMatchData; // Vem do api.js
        const container = document.getElementById('match-header');
        if (!m || !container) return;

        const hLogo = window.getTeamLogo ? window.getTeamLogo(m.teams.home.names.short, m.teams.home.names.medium) : "";
        const aLogo = window.getTeamLogo ? window.getTeamLogo(m.teams.away.names.short, m.teams.away.names.medium) : "";

        container.innerHTML = `
            <div class="bg-slate-900/40 border border-white/5 rounded-[2.5rem] p-10 backdrop-blur-xl text-center">
                <span class="text-[10px] font-black uppercase tracking-[0.4em] text-purple-500">${m.tournament?.name}</span>
                <div class="flex flex-row items-center justify-between mt-8">
                    <div class="flex-1"><img src="${hLogo}" class="w-24 h-24 mx-auto mb-4 object-contain" onerror="this.src='Images/favi.svg'"><h2 class="font-black text-white">${m.teams.home.names.medium}</h2></div>
                    <div class="px-10 min-w-[200px]">
                        <div class="text-6xl font-black text-white italic">
                            ${m.results?.reg?.home?.points ?? 0} - ${m.results?.reg?.away?.points ?? 0}
                        </div>
                    </div>
                    <div class="flex-1"><img src="${aLogo}" class="w-24 h-24 mx-auto mb-4 object-contain" onerror="this.src='Images/favi.svg'"><h2 class="font-black text-white">${m.teams.away.names.medium}</h2></div>
                </div>
            </div>`;
    },

    renderPopularTeams: () => {
        const grid = document.getElementById('popular-teams-grid');
        if (!grid || !window.CONFIG) return; // Garante que CONFIG existe
        grid.innerHTML = window.CONFIG.POPULAR_TEAMS.map(team => `
            <div onclick="window.fetchTeamFullStats ? window.fetchTeamFullStats(${team.id}) : alert('Em breve')" class="bg-white/5 p-4 rounded-3xl flex flex-col items-center cursor-pointer hover:bg-purple-500/10">
                <img src="https://images.fotmob.com/image_resources/logo/teamlogo/${team.id}.png" class="w-12 h-12 object-contain" onerror="this.src='Images/favi.svg'">
                <span class="text-[10px] font-black text-gray-400 uppercase mt-2">${team.name}</span>
            </div>`).join('');
    },

    components: {
        matchCard: (match) => {
            // SEGURANÇA TOTAL: Se o nome não existir, não quebra o site
            const hName = match.teams?.home?.names?.medium || match.teams?.home?.name || "Equipa Casa";
            const aName = match.teams?.away?.names?.medium || match.teams?.away?.name || "Equipa Fora";

            // Integração Fotmob via data.js
            const hLogo = window.getTeamLogo ? window.getTeamLogo(match.teams?.home?.names?.short, hName) : "";
            const aLogo = window.getTeamLogo ? window.getTeamLogo(match.teams?.away?.names?.short, aName) : "";

            return `
                <div class="bg-black/40 border border-white/5 p-8 rounded-[2.5rem] text-center">
                    <div class="flex justify-center mb-4">
                        <span class="bg-white/5 px-4 py-1 rounded-full text-[10px] font-bold text-white/50">PRÓXIMO JOGO</span>
                    </div>
                    <div class="flex items-center justify-between gap-4 mb-8">
                        <div class="flex-1">
                            <img src="${hLogo}" class="w-16 h-16 mx-auto mb-2 object-contain" onerror="this.src='https://via.placeholder.com/60?text=?'">
                            <span class="text-[10px] font-black text-white uppercase block">${hName}</span>
                        </div>
                        <span class="text-xl font-black italic text-white/10">VS</span>
                        <div class="flex-1">
                            <img src="${aLogo}" class="w-16 h-16 mx-auto mb-2 object-contain" onerror="this.src='https://via.placeholder.com/60?text=?'">
                            <span class="text-[10px] font-black text-white uppercase block">${aName}</span>
                        </div>
                    </div>
                    <button onclick="window.location.href='matchdetails.html?id=${match.eventID}'" class="w-full py-4 rounded-2xl bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest hover:bg-purple-600 transition-all">Dar Meu Palpite</button>
                </div>`;
        }
    }
};

// Vincula funções globais necessárias para UI
window.renderPopularTeams = window.UI.renderPopularTeams;