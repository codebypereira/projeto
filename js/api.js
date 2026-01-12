// js/api.js

const API_KEY = "ff835c0432328c9c077e7ac1b8444cd9";

// Elementos do DOM
const container = document.getElementById('matches-container');
const loadingMessage = document.getElementById('loading-message'); // Adicionei de volta, caso precises

// Variável para guardar o ID da liga atual (para filtros futuros)
let currentLeague = 'NBA'; // Começa com o valor padrão

// =========================================================
// 1. LÓGICA DE BUSCA E RENDERIZAÇÃO DE JOGOS (API PÚBLICA)
// =========================================================

async function searchMatches(leagueID = currentLeague) {
    currentLeague = leagueID; // Atualiza o estado da liga atual
    
    // Mostrar loading
    if(container) {
        container.innerHTML = `<div id="loading-message" class="flex flex-col justify-center items-center py-20 bg-white/5 rounded-2xl border border-dashed border-white/20">
            <svg class="animate-spin h-10 w-10 text-purple-500 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span class="text-lg text-gray-300">Carregando dados de ${leagueID}...</span>
        </div>`;
    }

    // Data fixa (Mudar para dinâmica depois)
    const date = '2026-01-12'; 

    try {
        const url = `https://api.sportsgameodds.com/v2/events?leagueID=${leagueID}&date=${date}`;
        
        const response = await fetch(url, {
            headers: { 'X-Api-Key': API_KEY }
        });

        const result = await response.json();
        const eventos = result.data || [];

        if (container) container.innerHTML = ''; 

        if (eventos.length === 0) {
            renderEmptyState(leagueID);
            return;
        }

        eventos.forEach(match => {
            if (container) container.innerHTML += createCardTemplate(match, leagueID);
        });

    } catch (error) {
        console.error("Erro na busca:", error);
        if (container) container.innerHTML = `<div class="text-red-500 text-center py-10">Erro ao carregar dados.</div>`;
    }
}

function createCardTemplate(match, leagueID) {
    // ... [Função createCardTemplate original] ...
    const isNBA = leagueID === 'NBA';
    const themeColor = isNBA ? 'text-orange-400' : 'text-purple-500';
    const btnColor = isNBA ? 'bg-orange-600 hover:bg-orange-700' : 'bg-purple-600 hover:bg-purple-700';
    const icon = isNBA ? '🏀' : '⚽';

    const matchID = match.eventID || match.id; // Garante que apanha o ID
    
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
            <a href="match_details.html?id=${matchID}&league=${leagueID}" 
               class="block w-full text-center ${btnColor} text-white font-bold py-3 rounded-xl transition-all shadow-md hover:shadow-lg active:scale-[0.98]">
                FAZER PREVISÃO
            </a>
        </div>
    </div>`;
}

function renderEmptyState(leagueID) {
    // ... [Função renderEmptyState original] ...
    const lista = document.getElementById("matches-container");
    if (lista) {
        lista.innerHTML = `
        <div class="flex flex-col items-center justify-center py-20 bg-white/5 rounded-2xl border border-dashed border-white/20 text-center">
            <span class="text-5xl mb-4">📅</span>
            <h3 class="text-xl font-bold text-white">Nenhum jogo de ${leagueID} hoje</h3>
            <p class="text-gray-400 mt-2">Novas partidas serão listadas em breve.</p>
        </div>`;
    }
}


// Expor searchMatches globalmente para o onclick="" funcionar no HTML
window.searchMatches = searchMatches;

// =========================================================
// 2. LÓGICA DE INICIALIZAÇÃO DA PÁGINA E MENUS (Novo Código)
// =========================================================

document.addEventListener('DOMContentLoaded', () => {
    // 1. Renderiza as estatísticas
    const statsContainer = document.getElementById('statistics-container');
    if (statsContainer) {
        statsContainer.innerHTML = renderStatistics();
    }
    //  Carrega as Melhores Previsões
    fetchAndRenderTopPredictions(); 

    // Carrega a primeira liga (NBA, como está no teu código)
    searchMatches(currentLeague); 
    
    // Lógica simples para o Dropdown do User
    const userBtn = document.getElementById('user-menu-btn');
    const userDropdown = document.getElementById('user-dropdown');

    if (userBtn && userDropdown) {
        // Toggle ao clicar no botão
        userBtn.addEventListener('click', (e) => {
            e.stopPropagation(); // Evita que o clique feche imediatamente
            userDropdown.classList.toggle('hidden');
        });

        // Fechar ao clicar fora do menu
        document.addEventListener('click', (e) => {
            if (!userBtn.contains(e.target) && !userDropdown.contains(e.target)) {
                userDropdown.classList.add('hidden');
            }
        });
    }
});

function renderStatistics() {
    // Dados Mock (SUBSTITUIR PELOS DADOS REAIS DA API DEPOIS)
    const stats = [
        { title: "Previsões Hoje", value: "12,543", trend: "+23%", icon: "🚀", color: "text-emerald-500 bg-emerald-100" },
        { title: "Utilizadores Ativos", value: "45,892", trend: "+12%", icon: "👥", color: "text-blue-500 bg-blue-100" },
        { title: "Taxa de Acerto", value: "68.5%", trend: "+5%", icon: "🎯", color: "text-purple-500 bg-purple-100" },
        { title: "Partidas Hoje", value: "127", trend: "+8%", icon: "⚽", color: "text-orange-500 bg-orange-100" }
    ];

    const cardsHtml = stats.map(stat => `
        <div class="stat-card bg-white rounded-xl shadow-lg border border-gray-100 p-5 md:p-6 transition-all hover:shadow-xl transform hover:-translate-y-0.5">
            <div class="flex justify-between items-start mb-4">
                <div class="p-2 rounded-lg ${stat.color}">
                    <span class="text-xl">${stat.icon}</span>
                </div>
                <span class="text-xs font-bold ${stat.color} p-1 rounded-full">${stat.trend}</span>
            </div>
            <p class="text-3xl font-extrabold text-gray-900 leading-none">${stat.value}</p>
            <p class="mt-1 text-sm font-medium text-gray-500">${stat.title}</p>
        </div>
    `).join('');

    return `
        <div class="mb-10 pt-4">
            <h2 class="text-2xl md:text-3xl font-bold text-white mb-2 text-center">Estatísticas em Tempo Real</h2>
            <p class="text-gray-400 mb-6 text-center">Acompanhe os números da nossa comunidade</p>
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                ${cardsHtml}
            </div>
        </div>
    `;
}

// Constante para a Mock API (Mudar para o teu link real do mockapi.io!)
const MOCK_API_BASE_URL = "https://696278a1d9d64c761987fe9a.mockapi.io/api/predictions"; 

// Função para buscar e renderizar as Melhores Previsões
async function fetchAndRenderTopPredictions() {
    const topPredictionsContainer = document.getElementById('top-predictions-container');
    if (!topPredictionsContainer) return;

    // Loading State
    topPredictionsContainer.innerHTML = '<p class="text-gray-400 text-center py-4 text-sm">Carregando melhores previsões...</p>';

    try {
        // 1. Fetch das Previsões (Assumindo que temos o endpoint 'predictions')
        const url = `${MOCK_API_BASE_URL}/predictions?sortBy=createdAt&order=desc&limit=3`;
        const response = await fetch(url);
        
        if (!response.ok) throw new Error("Erro ao buscar previsões da Mock API.");
        
        const topPredictions = await response.json();

        if (topPredictions.length === 0) {
            topPredictionsContainer.innerHTML = '<p class="text-gray-400 text-center py-4 text-sm">Ainda sem previsões da comunidade.</p>';
            return;
        }

        // 2. Mapeamento e renderização (Simulamos o nome das equipas para simplificar)
        // Nota: Numa app real, terias de buscar o nome da equipa usando o matchID
        
        const predictionsHtml = topPredictions.map(prediction => {
            // Dados Mock para simular a ligação ao jogo (Substituir pela busca real do jogo se necessário)
            const teamNames = {
                "NBA_2026-01-12_1001": { home: "Boston Celtics", away: "L.A. Lakers" },
                "NBA_2026-01-12_1002": { home: "Golden State", away: "New York Knicks" },
                "EPL_2026-01-12_2005": { home: "Man. City", away: "Liverpool" },
            }[prediction.matchID] || { home: "Equipa Casa", away: "Equipa Fora" };

            const confidenceColor = prediction.confidence >= 80 ? 'bg-emerald-500' : (prediction.confidence >= 60 ? 'bg-orange-500' : 'bg-gray-500');
            const initials = prediction.username ? prediction.username.split(' ').map(n => n[0]).join('') : 'U';

            return `
                <div class="prediction-item p-4 bg-white rounded-lg border border-gray-100 shadow-sm mb-3">
                    <div class="flex items-center justify-between mb-3">
                        <div class="flex items-center gap-3">
                            <div class="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm bg-purple-500">
                                ${initials}
                            </div>
                            <p class="font-semibold text-gray-800">${prediction.username}</p>
                        </div>
                        <span class="px-3 py-1 text-xs font-bold text-white rounded-full ${confidenceColor}">
                            ${prediction.confidence}% confiança
                        </span>
                    </div>

                    <p class="text-xs text-gray-500 mb-1">${teamNames.home} vs ${teamNames.away}</p>
                    <div class="text-xl font-bold text-gray-900 flex justify-start items-center gap-3">
                        <span class="text-red-600">${teamNames.home}</span>
                        <span class="text-2xl">${prediction.homeScore} - ${prediction.awayScore}</span>
                        <span class="text-blue-600">${teamNames.away}</span>
                    </div>
                </div>
            `;
        }).join('');

        topPredictionsContainer.innerHTML = predictionsHtml;

    } catch (error) {
        console.error("Erro ao carregar previsões:", error);
        topPredictionsContainer.innerHTML = '<p class="text-red-500 text-center py-4 text-sm">Não foi possível carregar as previsões.</p>';
    }
}
