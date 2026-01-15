// js/live.js

let previousScores = {};

// 1. Mapa de logos garantido para NBA (você pode adicionar mais times aqui)
const TEAM_LOGOS = {
    "ATL": "https://cdn.nba.com/logos/nba/1610612737/global/L/logo.svg",
    "BOS": "https://cdn.nba.com/logos/nba/1610612738/global/L/logo.svg",
    "BKN": "https://cdn.nba.com/logos/nba/1610612751/global/L/logo.svg",
    "CHA": "https://cdn.nba.com/logos/nba/1610612766/global/L/logo.svg",
    "CHI": "https://cdn.nba.com/logos/nba/1610612741/global/L/logo.svg",
    "CLE": "https://cdn.nba.com/logos/nba/1610612739/global/L/logo.svg", // Cavaliers
    "DAL": "https://cdn.nba.com/logos/nba/1610612742/global/L/logo.svg",
    "DEN": "https://cdn.nba.com/logos/nba/1610612743/global/L/logo.svg",
    "DET": "https://cdn.nba.com/logos/nba/1610612765/global/L/logo.svg",
    "GSW": "https://cdn.nba.com/logos/nba/1610612744/global/L/logo.svg",
    "HOU": "https://cdn.nba.com/logos/nba/1610612745/global/L/logo.svg",
    "IND": "https://cdn.nba.com/logos/nba/1610612754/global/L/logo.svg", // Pacers
    "LAC": "https://cdn.nba.com/logos/nba/1610612746/global/L/logo.svg",
    "LAL": "https://cdn.nba.com/logos/nba/1610612747/global/L/logo.svg",
    "MEM": "https://cdn.nba.com/logos/nba/1610612763/global/L/logo.svg",
    "MIA": "https://cdn.nba.com/logos/nba/1610612748/global/L/logo.svg",
    "MIL": "https://cdn.nba.com/logos/nba/1610612749/global/L/logo.svg",
    "MIN": "https://cdn.nba.com/logos/nba/1610612750/global/L/logo.svg",
    "NOP": "https://cdn.nba.com/logos/nba/1610612740/global/L/logo.svg",
    "NYK": "https://cdn.nba.com/logos/nba/1610612752/global/L/logo.svg",
    "OKC": "https://cdn.nba.com/logos/nba/1610612760/global/L/logo.svg",
    "ORL": "https://cdn.nba.com/logos/nba/1610612753/global/L/logo.svg",
    "PHI": "https://cdn.nba.com/logos/nba/1610612755/global/L/logo.svg",
    "PHX": "https://cdn.nba.com/logos/nba/1610612756/global/L/logo.svg",
    "POR": "https://cdn.nba.com/logos/nba/1610612757/global/L/logo.svg",
    "SAC": "https://cdn.nba.com/logos/nba/1610612758/global/L/logo.svg",
    "SAS": "https://cdn.nba.com/logos/nba/1610612759/global/L/logo.svg",
    "TOR": "https://cdn.nba.com/logos/nba/1610612761/global/L/logo.svg",
    "UTA": "https://cdn.nba.com/logos/nba/1610612762/global/L/logo.svg",
    "WAS": "https://cdn.nba.com/logos/nba/1610612764/global/L/logo.svg",
    
    // FALLBACKS (Casos onde a API manda nomes diferentes)
    "PAC": "https://cdn.nba.com/logos/nba/1610612754/global/L/logo.svg",
    "CAV": "https://cdn.nba.com/logos/nba/1610612739/global/L/logo.svg",
    "GS": "https://cdn.nba.com/logos/nba/1610612744/global/L/logo.svg",
    "NY": "https://cdn.nba.com/logos/nba/1610612752/global/L/logo.svg",
    "SA": "https://cdn.nba.com/logos/nba/1610612759/global/L/logo.svg"
};

window.changeSport = function(leagueID) {
    fetchLiveMatches(leagueID);
};

async function fetchLiveMatches(leagueID = 'NBA') {
    const container = document.getElementById('live-matches-container');
    if (!container) return;
    try {
        const url = `https://api.sportsgameodds.com/v2/events?apiKey=${CONFIG.API_KEY}&leagueID=${leagueID}&live=true`;
        const response = await fetch(url);
        const result = await response.json();
        const liveMatches = (result.data || []).filter(m => m.status && m.status.live === true);

        if (liveMatches.length === 0) {
            container.innerHTML = `<p class="text-white col-span-full text-center py-20 font-black uppercase">Sem jogos ao vivo.</p>`;
            return;
        }
        renderLiveCards(liveMatches);
    } catch (error) {
        console.error("Erro na API:", error);
    }
}

function renderLiveCards(matches) {
    const container = document.getElementById('live-matches-container');
    container.innerHTML = '';

    matches.forEach(m => {
        const home = m.teams.home;
        const away = m.teams.away;

        // --- LÓGICA DE SOMA (NBA RESULTS) ---
        let hScore = 0; let aScore = 0;
        if (m.results) {
            Object.values(m.results).forEach(q => {
                if (q.home?.points) hScore += q.home.points;
                if (q.away?.points) aScore += q.away.points;
            });
        }

        // --- LÓGICA DE LOGOS (MAPA OU INICIAIS) ---
        // Se o nome curto (ex: "PACERS") estiver no mapa, usa a imagem. Se não, mostra iniciais.
        const hName = home.names.short.toUpperCase();
        const aName = away.names.short.toUpperCase();
        
        const homeLogoHtml = TEAM_LOGOS[hName] 
            ? `<img src="${TEAM_LOGOS[hName]}" class="relative z-10 w-full h-full object-contain p-2">`
            : `<span class="relative z-10 text-white font-black text-xl">${home.names.short}</span>`;

        const awayLogoHtml = TEAM_LOGOS[aName] 
            ? `<img src="${TEAM_LOGOS[aName]}" class="relative z-10 w-full h-full object-contain p-2">`
            : `<span class="relative z-10 text-white font-black text-xl">${away.names.short}</span>`;

        // Sistema de Flash
        const eventID = m.eventID;
        const last = previousScores[eventID];
        let flash = (last && (last.h !== hScore || last.a !== aScore)) ? "ring-4 ring-yellow-400 animate-pulse" : "";
        previousScores[eventID] = { h: hScore, a: aScore };

        const card = document.createElement('div');
        card.className = `bg-slate-900/90 border border-white/10 p-4 md:p-8 rounded-[2rem] md:rounded-[2.5rem] transition-all duration-700 ${flash} w-full`;
        
        card.innerHTML = `
            <div class="flex justify-center items-center mb-6 w-full">
                <span class="bg-red-600 px-4 py-1 rounded-full text-[10px] font-black text-white flex items-center justify-center gap-2 mx-auto">
                    <span class="relative flex h-2 w-2">
                        <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                        <span class="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                    </span>
                    ${m.status.clock || 'LIVE'}
                </span>
            </div>
            
            <div class="flex items-center justify-between gap-2 md:gap-4 mb-8 md:mb-10 text-center">
                <div class="flex-1 min-w-0">
                    <div class="relative w-14 h-14 md:w-20 md:h-20 mx-auto mb-3 flex items-center justify-center">
                        <div class="absolute inset-0 rounded-full" style="background-color: ${home.colors?.primary || '#334155'}; opacity: 0.4;"></div>
                        ${homeLogoHtml}
                    </div>
                    <span class="text-[9px] md:text-[11px] font-black text-gray-400 uppercase truncate block">${home.names.medium}</span>
                </div>
                
                <div class="flex flex-col items-center px-1 md:px-4">
                    <div class="flex items-center gap-1 md:gap-4">
                        <span class="text-3xl md:text-5xl font-black italic text-white font-mono tracking-tighter">${hScore}</span>
                        <span class="text-xl md:text-2xl font-bold text-white/10">:</span>
                        <span class="text-3xl md:text-5xl font-black italic text-white font-mono tracking-tighter">${aScore}</span>
                    </div>
                    <span class="text-[10px] text-purple-500 font-black uppercase mt-2 tracking-[2px]">${m.status.displayShort || ""}</span>
                </div>

                <div class="flex-1 min-w-0">
                    <div class="relative w-14 h-14 md:w-20 md:h-20 mx-auto mb-3 flex items-center justify-center">
                        <div class="absolute inset-0 rounded-full" style="background-color: ${away.colors?.primary || '#334155'}; opacity: 0.4;"></div>
                        ${awayLogoHtml}
                    </div>
                    <span class="text-[9px] md:text-[11px] font-black text-gray-400 uppercase truncate block">${away.names.medium}</span>
                </div>
            </div>

            <button class="w-full py-4 rounded-2xl text-[10px] md:text-[11px] font-black text-white uppercase tracking-[2px] bg-white/5 border border-white/10 hover:bg-purple-600 transition-all active:scale-95">
                Palpite Live
            </button>
        `;
        container.appendChild(card);
    });
}

document.addEventListener('DOMContentLoaded', () => {
    fetchLiveMatches('NBA');
    setInterval(() => fetchLiveMatches('NBA'), 15000);
});