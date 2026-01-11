// Configurações da API
const API_KEY = "ff835c0432328c9c077e7ac1b8444cd9";

async function searchMatches(leagueID = 'NBA') {
    const lista = document.getElementById('matches-container');
    lista.innerHTML = `<div class="text-white text-center py-10">Buscando rodada de 11/01/2026...</div>`;

    // Data de hoje (Domingo) para pegar os jogos que começam às 20h00 em Portugal
    const date = '2026-01-12'; 

    try {
        const url = `https://api.sportsgameodds.com/v2/events?leagueID=${leagueID}&date=${date}`;
        
        const response = await fetch(url, {
            headers: { 'X-Api-Key': API_KEY }
        });

        const result = await response.json();
        // Acessa result.data conforme vimos no seu console de sucesso
        const eventos = result.data || [];

        if (eventos.length === 0) {
            lista.innerHTML = `<div class="text-white text-center py-10">Sem jogos novos para hoje (${date}).</div>`;
            return;
        }

        lista.innerHTML = ''; 
        eventos.forEach(match => {
            // Removemos o filtro que causou o erro e apenas renderizamos
            lista.innerHTML += createCardTemplate(match, leagueID);
        });

    } catch (error) {
        console.error("Erro na busca:", error);
        lista.innerHTML = `<div class="text-red-500 text-center py-10">Erro ao carregar dados.</div>`;
    }
}

function createCardTemplate(match, leagueID) {
    const isNBA = leagueID === 'NBA';
    const themeColor = isNBA ? 'text-orange-400' : 'text-purple-500';
    const btnColor = isNBA ? 'bg-orange-600 hover:bg-orange-700' : 'bg-purple-600 hover:bg-purple-700';
    const icon = isNBA ? '🏀' : '⚽';

    
    let homeName = match.teams?.home?.names?.long || match.teams?.home?.teamID || 'Equipa Casa';
    let awayName = match.teams?.away?.names?.long || match.teams?.away?.teamID || 'Equipa Fora';
    
    homeName = homeName.replace(/_/g, ' ').replace(' NBA', '');
    awayName = awayName.replace(/_/g, ' ').replace(' NBA', '');

    const homeScore = match.teams?.home?.score ?? 0;
    const awayScore = match.teams?.away?.score ?? 0;

    
    const isStarted = match.status?.started || false;
    const horario = match.status?.hardStart 
        ? new Date(match.status.hardStart).toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' }) 
        : 'AGENDADO';

    return `
    <div class="match-card bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 p-4 md:p-6 mb-4">
        <div class="flex justify-between items-center mb-4 border-b border-gray-50 pb-2">
            <p class="text-xs font-bold ${themeColor} uppercase tracking-widest flex items-center gap-1">
                ${icon} ${leagueID}
            </p>
            <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${isStarted ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-600'}">
                ${isStarted ? '🔴 AO VIVO' : '🕒 ' + horario}
            </span>
        </div>

        <div class="flex items-center justify-between gap-2 md:gap-4">
            
            <div class="w-1/3 text-right">
                <p class="text-sm md:text-base font-bold text-gray-900 leading-tight">${homeName}</p>
            </div>

            <div class="flex flex-col items-center justify-center min-w-[100px] md:min-w-[140px]">
                <div class="text-2xl md:text-3xl font-black text-gray-900 bg-gray-50 border border-gray-100 px-4 py-2 rounded-xl shadow-sm">
                    ${homeScore} - ${awayScore}
                </div>
            </div>

            <div class="w-1/3 text-left">
                <p class="text-sm md:text-base font-bold text-gray-900 leading-tight">${awayName}</p>
            </div>

        </div>

        <div class="mt-6">
            <button class="w-full ${btnColor} text-white font-bold py-3 rounded-xl transition-all shadow-md hover:shadow-lg active:scale-[0.98]">
                FAZER PREVISÃO
            </button>
        </div>
    </div>`;
}

function renderEmptyState(leagueID) {
  const lista = document.getElementById("matches-container");
  lista.innerHTML = `
    <div class="flex flex-col items-center justify-center py-20 bg-white/5 rounded-2xl border border-dashed border-white/20 text-center">
        <span class="text-5xl mb-4">📅</span>
        <h3 class="text-xl font-bold text-white">Nenhum jogo de ${leagueID} hoje</h3>
        <p class="text-gray-400 mt-2">Novas partidas serão listadas em breve.</p>
    </div>`;
}

searchMatches("NBA");
