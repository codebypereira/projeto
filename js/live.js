/**
 * MÓDULO: Gestor de Eventos em Tempo Real (Futebol Fix - SportsGameOdds API)
 */

let previousScores = {};

window.changeSport = function(leagueID) {
    previousScores = {}; // Limpa histórico ao trocar de liga
    fetchLiveMatches(leagueID);
};

async function fetchLiveMatches(leagueID = 'LA_LIGA') {
    const container = document.getElementById('live-matches-container');
    if (!container) return;

    try {
        const url = `https://api.sportsgameodds.com/v2/events?apiKey=${CONFIG.API_KEY}&leagueID=${leagueID}&live=true`;
        const response = await fetch(url);
        const result = await response.json();
        
        console.log("🔍 Diagnóstico Futebol:", result);

        const liveMatches = (result.data || []).filter(m => m.status && m.status.live === true);

        if (liveMatches.length === 0) {
            container.innerHTML = `<p class="text-white col-span-full text-center py-20 font-black uppercase opacity-50">Sem jogos live no momento.</p>`;
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

        /**
         * LÓGICA DE PLACAR REAL (Baseada no seu Console Log)
         * No futebol desta API, os golos reais estão em results -> reg -> points
         */
        let hScore = 0;
        let aScore = 0;

        if (m.results && m.results.reg) {
            hScore = m.results.reg.home?.points ?? 0;
            aScore = m.results.reg.away?.points ?? 0;
        } else if (m.status?.score) {
            // Backup caso a API mude o formato
            hScore = m.status.score.home ?? 0;
            aScore = m.status.score.away ?? 0;
        }

        // LOGOS (Sincronizado com teams.js)
        const hShort = (home.names.short || "").toUpperCase();
        const aShort = (away.names.short || "").toUpperCase();
        const hLogoUrl = window.getTeamLogo(hShort);
        const aLogoUrl = window.getTeamLogo(aShort);

        // Flash de Golo
        const eventID = m.eventID;
        const last = previousScores[eventID];
        let flash = (last && (last.h !== hScore || last.a !== aScore)) ? "ring-4 ring-purple-500 animate-pulse" : "";
        previousScores[eventID] = { h: hScore, a: aScore };

        const card = document.createElement('div');
        card.className = `bg-slate-900/90 border border-white/10 p-8 rounded-[2.5rem] transition-all duration-700 ${flash}`;
        
        card.innerHTML = `
            <div class="flex justify-center mb-6">
                <span class="bg-red-600 px-4 py-1 rounded-full text-[10px] font-black text-white flex items-center gap-2">
                    <span class="relative flex h-2 w-2">
                        <span class="animate-ping absolute h-full w-full rounded-full bg-white opacity-75"></span>
                        <span class="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                    </span>
                    ${m.status.clock ? m.status.clock + "'" : 'LIVE'}
                </span>
            </div>
            
            <div class="flex items-center justify-between gap-4 mb-8 text-center">
                <div class="flex-1">
                    <img src="${hLogoUrl}" class="w-20 h-20 mx-auto mb-3 object-contain">
                    <span class="text-[11px] font-black text-gray-400 uppercase block truncate">${home.names.medium}</span>
                </div>
                
                <div class="flex flex-col items-center px-4">
                    <div class="flex items-center gap-4">
                        <span class="text-5xl font-black italic text-white font-mono">${hScore}</span>
                        <span class="text-2xl font-bold text-white/10">:</span>
                        <span class="text-5xl font-black italic text-white font-mono">${aScore}</span>
                    </div>
                    <span class="text-[9px] text-purple-500 font-black uppercase mt-3 tracking-[3px]">${m.status.currentPeriodID || ""}</span>
                </div>

                <div class="flex-1">
                    <img src="${aLogoUrl}" class="w-20 h-20 mx-auto mb-3 object-contain">
                    <span class="text-[11px] font-black text-gray-400 uppercase block truncate">${away.names.medium}</span>
                </div>
            </div>

            <button onclick="window.location.href='matchdetails.html?id=${m.eventID}'" class="w-full py-4 rounded-2xl text-[10px] font-black text-white uppercase tracking-widest bg-white/5 border border-white/10 hover:bg-purple-600 transition-all">
                Estatísticas Completas
            </button>
        `;
        container.appendChild(card);
    });
}

document.addEventListener('DOMContentLoaded', () => {
    fetchLiveMatches('LA_LIGA'); 
    setInterval(() => fetchLiveMatches('LA_LIGA'), 30000);
});