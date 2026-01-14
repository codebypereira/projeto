// js/live.js

// 1. Tornar a função global para o "onclick" do HTML encontrar
window.changeSport = function(leagueID) {
    console.log("Buscando jogos AO VIVO para:", leagueID);
    fetchLiveMatches(leagueID);
};

async function fetchLiveMatches(leagueID = 'UEFA_CHAMPIONS_LEAGUE') {
    const container = document.getElementById('matches-container');
    if (!container) return;

    // Feedback visual de carregamento
    container.innerHTML = '<p class="text-white/50 col-span-full text-center py-10">Atualizando placares...</p>';

    try {
        // A URL usa o filtro de oddsAvailable ou status para identificar live
        // Nota: A API key deve estar definida no seu api.js
        const response = await fetch(`https://api.sportsgameodds.com/v2/events?apiKey=${CONFIG.API_KEY}&leagueID=${leagueID}`);
        const result = await response.json();

        // Filtra apenas jogos que possuem status "live"
        const liveMatches = (result.data || []).filter(m => m.status && m.status.live === true);

        if (liveMatches.length === 0) {
            container.innerHTML = `
                <div class="col-span-full text-center py-20 bg-white/5 rounded-3xl border border-white/10">
                    <p class="text-gray-400 italic text-lg">Não há jogos ao vivo nesta liga no momento.</p>
                </div>`;
            return;
        }

        renderLiveCards(liveMatches);
    } catch (error) {
        console.error("Erro ao buscar live:", error);
        container.innerHTML = '<p class="text-red-500 col-span-full text-center">Erro ao carregar dados em tempo real.</p>';
    }
}

function renderLiveCards(matches) {
    const container = document.getElementById('matches-container');
    container.innerHTML = '';

    matches.forEach(m => {
        const home = m.teams.home;
        const away = m.teams.away;
        
        const card = document.createElement('div');
        // Estilo idêntico ao seu design de cards escuros
        card.className = "bg-[#1e0b2e]/80 border border-white/5 p-8 rounded-[2.5rem] shadow-2xl transition-all";
        
        card.innerHTML = `
            <div class="flex justify-center mb-6">
                <span class="bg-red-600 px-3 py-1 rounded-full text-[10px] font-black text-white animate-pulse">
                    ${m.status.clock || 'AO VIVO'}
                </span>
            </div>
            <div class="flex items-center justify-between gap-4 mb-8 text-center">
                <div class="flex-1">
                    <div class="w-16 h-16 mx-auto rounded-2xl flex items-center justify-center mb-2 text-xl font-black" 
                         style="background-color: ${home.colors?.primary || '#334155'}; color: white;">
                        ${home.names.short}
                    </div>
                    <span class="text-[10px] font-bold text-gray-400 uppercase">${home.names.medium}</span>
                </div>
                
                <div class="flex flex-col">
                    <span class="text-3xl font-black italic text-white">${m.scores.home} : ${m.scores.away}</span>
                </div>

                <div class="flex-1">
                    <div class="w-16 h-16 mx-auto rounded-2xl flex items-center justify-center mb-2 text-xl font-black" 
                         style="background-color: ${away.colors?.primary || '#334155'}; color: white;">
                        ${away.names.short}
                    </div>
                    <span class="text-[10px] font-bold text-gray-400 uppercase">${away.names.medium}</span>
                </div>
            </div>
            <button onclick="handlePalpiteClick('${m.eventID}', '${home.names.medium}', '${away.names.medium}')" 
                class="w-full py-4 rounded-2xl text-[11px] font-black text-white uppercase tracking-[2px] bg-[#3d1b54] hover:bg-pink-600 transition-all cursor-pointer">
                Palpite Live
            </button>
        `;
        container.appendChild(card);
    });
}

// Inicializa a página carregando a Champions por padrão
document.addEventListener('DOMContentLoaded', () => {
    fetchLiveMatches('UEFA_CHAMPIONS_LEAGUE');
});