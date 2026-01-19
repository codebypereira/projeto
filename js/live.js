/**
 * MÓDULO: Gestor de Eventos em Tempo Real (Live Scores)
 * DESCRIÇÃO: Este script gere a atualização dinâmica dos jogos em curso.
 * Implementa um sistema de "Polling" para manter a interface sincronizada com a API,
 * além de um sistema de tracking de estado para efeitos visuais (Flash Updates).
 */

// Estado Global: Armazena pontuações da ronda anterior para deteção de alterações
let previousScores = {};


/**
 * Função: changeSport
 * Altera o contexto da liga e força uma atualização imediata dos dados.
 */
window.changeSport = function(leagueID) {
    fetchLiveMatches(leagueID);
};

/**
 * Função: fetchLiveMatches
 * Realiza o consumo da API de eventos em direto. 
 * Implementa filtragem de segurança para garantir que apenas jogos 'live' são processados.
 */
async function fetchLiveMatches(leagueID = 'NBA') {
    const container = document.getElementById('live-matches-container');
    if (!container) return;

    try {
        const url = `https://api.sportsgameodds.com/v2/events?apiKey=${CONFIG.API_KEY}&leagueID=${leagueID}&live=true`;
        const response = await fetch(url);
        const result = await response.json();
        
        // Filtra eventos que possuem o status explícito de 'live'
        const liveMatches = (result.data || []).filter(m => m.status && m.status.live === true);

        if (liveMatches.length === 0) {
            container.innerHTML = `<p class="text-white col-span-full text-center py-20 font-black uppercase">Sem jogos ao vivo.</p>`;
            return;
        }

        renderLiveCards(liveMatches);
    } catch (error) {
        console.error("Erro na comunicação com a Sports API:", error);
    }
}

/**
 * Função: renderLiveCards
 * Camada de visualização que processa dados brutos e gera a interface.
 * Inclui lógica de cálculo acumulativo de pontos para ligas americanas (NBA).
 */
function renderLiveCards(matches) {
    const container = document.getElementById('live-matches-container');
    container.innerHTML = '';

    matches.forEach(m => {
        const home = m.teams.home;
        const away = m.teams.away;

        // --- LÓGICA DE AGREGAÇÃO DE SCORE ---
        // Itera sobre os períodos (quartos) para calcular o total acumulado
        let hScore = 0; 
        let aScore = 0;
        if (m.results) {
            Object.values(m.results).forEach(q => {
                if (q.home?.points) hScore += q.home.points;
                if (q.away?.points) aScore += q.away.points;
            });
        }

        // --- GESTÃO DE ASSETS (LOGOS) ---
        const hName = home.names.short.toUpperCase();
        const aName = away.names.short.toUpperCase();
        
        const homeLogoHtml = TEAM_LOGOS[hName] 
            ? `<img src="${TEAM_LOGOS[hName]}" class="relative z-10 w-full h-full object-contain p-2">`
            : `<span class="relative z-10 text-white font-black text-xl">${home.names.short}</span>`;

        const awayLogoHtml = TEAM_LOGOS[aName] 
            ? `<img src="${TEAM_LOGOS[aName]}" class="relative z-10 w-full h-full object-contain p-2">`
            : `<span class="relative z-10 text-white font-black text-xl">${away.names.short}</span>`;

        // --- SISTEMA DE FLASH (DETEÇÃO DE GOLO/PONTO) ---
        // Compara a pontuação atual com o estado anterior para disparar animação CSS
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

/**
 * Inicialização e Ciclo de Polling:
 * Configura um intervalo de 15 segundos para atualizar os dados sem necessidade
 * de recarregar a página, otimizando a experiência de visualização live.
 */
document.addEventListener('DOMContentLoaded', () => {
    fetchLiveMatches('NBA');
    
    // Configura o Polling (15000ms = 15s)
    setInterval(() => fetchLiveMatches('NBA'), 15000);
});