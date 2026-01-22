/**
 * GoalDash - INTERFACE (ui.js)
 * FOCO: Renderização de Cards, Modais e Componentes Visuais.
 * CORREÇÃO: Mapeamento de nomes e logos sincronizado com a API.
 */

window.UI = {
    // Exibe o estado de carregamento
    showLoading: (containerId) => {
        const container = document.getElementById(containerId);
        if (container) {
            container.innerHTML = `<div class="col-span-full text-center py-20 text-purple-500 animate-pulse font-black uppercase tracking-widest text-[10px]">Sincronizando Dados...</div>`;
        }
    },

    // Renderiza a lista de jogos (Página Inicial)
    renderMatches: (containerId, matches) => {
        const container = document.getElementById(containerId);
        if (!container) return;

        if (!matches || matches.length === 0) {
            container.innerHTML = `<div class="col-span-full text-center py-20 opacity-30 font-black uppercase text-xs">Sem eventos disponíveis</div>`;
            return;
        }

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

    renderMatchHeader: (match) => {
        const container = document.getElementById('match-header');
        if (!container || !match) return;

        // CORREÇÃO: Busca profunda nos nomes
        const hName = match.teams?.home?.names?.medium || match.teams?.home?.names?.long || "Casa";
        const aName = match.teams?.away?.names?.medium || match.teams?.away?.names?.long || "Fora";
        const hLogo = window.getTeamLogo ? window.getTeamLogo(match.teams?.home?.names?.short, hName) : "";
        const aLogo = window.getTeamLogo ? window.getTeamLogo(match.teams?.away?.names?.short, aName) : "";

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

    // Renderiza cards de jogos ao vivo (Página Live)
    renderLiveCards: (matches) => {
        const container = document.getElementById('live-matches-container');
        if (!container) return;
        container.innerHTML = '';

        matches.forEach(m => {
            let hScore = m.results?.reg?.home?.points ?? 0;
            let aScore = m.results?.reg?.away?.points ?? 0;

            // CORREÇÃO: Busca profunda nos nomes para o Live
            const hName = m.teams?.home?.names?.medium || "Casa";
            const aName = m.teams?.away?.names?.medium || "Fora";
            const hLogo = window.getTeamLogo ? window.getTeamLogo(m.teams?.home?.names?.short, hName) : "";
            const aLogo = window.getTeamLogo ? window.getTeamLogo(m.teams?.away?.names?.short, aName) : "";

            const card = document.createElement('div');
            card.className = `bg-slate-900/90 border border-white/10 p-8 rounded-[2.5rem] transition-all duration-700`;
            card.innerHTML = `
                <div class="flex justify-center mb-6">
                    <span class="bg-red-600 px-4 py-1 rounded-full text-[10px] font-black text-white flex items-center gap-2">
                        <span class="animate-ping h-2 w-2 rounded-full bg-white"></span>
                        ${m.status?.clock ? m.status.clock + "'" : 'LIVE'}
                    </span>
                </div>
                <div class="flex items-center justify-between gap-4 mb-8 text-center">
                    <div class="flex-1">
                        <img src="${hLogo}" class="w-20 h-20 mx-auto mb-3 object-contain" onerror="this.src='Images/favi.svg'">
                        <span class="text-[11px] font-black text-gray-400 uppercase block">${hName}</span>
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
                        <span class="text-[11px] font-black text-gray-400 uppercase block">${aName}</span>
                    </div>
                </div>
                <button onclick="window.location.href='matchdetails.html?id=${m.eventID}'" class="w-full py-4 rounded-2xl text-[10px] font-black text-white uppercase tracking-widest bg-white/5 border border-white/10 hover:bg-purple-600 transition-all cursor-pointer">
                    Estatísticas Completas
                </button>
            `;
            container.appendChild(card);
        });
    },

    components: {
        matchCard: (match) => {
            // CORREÇÃO: Recuperando nomes usando a lógica que você confirmou que funciona
            const home = match.teams?.home;
            const away = match.teams?.away;

            const hName = home?.names?.medium || home?.names?.long || home?.names?.short || "Equipa Casa";
            const aName = away?.names?.medium || away?.names?.long || away?.names?.short || "Equipa Fora";

            const hLogo = window.getTeamLogo ? window.getTeamLogo(home?.names?.short, hName) : "";
            const aLogo = window.getTeamLogo ? window.getTeamLogo(away?.names?.short, aName) : "";

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
                            <div class="relative mb-3 group-hover:-translate-y-1 transition-transform">
                                <img src="${hLogo}" class="w-16 h-16 mx-auto object-contain relative z-10" onerror="this.src='Images/favi.svg'">
                            </div>
                            <span class="text-[10px] font-black text-white uppercase block opacity-60 group-hover:opacity-100">${hName}</span>
                        </div>
                        <span class="text-xl font-black italic text-white/10">VS</span>
                        <div class="flex-1">
                            <div class="relative mb-3 group-hover:-translate-y-1 transition-transform">
                                <img src="${aLogo}" class="w-16 h-16 mx-auto object-contain relative z-10" onerror="this.src='Images/favi.svg'">
                            </div>
                            <span class="text-[10px] font-black text-white uppercase block opacity-60 group-hover:opacity-100">${aName}</span>
                        </div>
                    </div>

                    <button onclick="event.stopPropagation(); window.handlePalpiteClick('${match.eventID}', '${hName.replace(/'/g, "\\'")}', '${aName.replace(/'/g, "\\")}')" 
                        class="w-full py-4 rounded-2xl bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-[3px] hover:from-purple-600 hover:to-pink-600 hover:bg-gradient-to-r transition-all duration-500 cursor-pointer">
                        Dar Meu Palpite
                    </button>
                </div>`;
        }
    }
};