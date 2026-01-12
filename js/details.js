// js/details.js

const API_KEY = "ff835c0432328c9c077e7ac1b8444cd9";
// ⚠️ ATENÇÃO: SUBSTITUI PELO TEU LINK REAL DO MOCKAPI.IO!
const MOCK_API_BASE_URL = "https://696278a1d9d64c761987fe9a.mockapi.io/api/predictions"; 

let currentMatch = null; // Guarda os detalhes do jogo atual

// =========================================================
// 1. UTILIDADES
// =========================================================

/**
 * Lê os parâmetros 'id' e 'league' da URL.
 */
function getUrlParams() {
    const params = new URLSearchParams(window.location.search);
    return {
        id: params.get('id'),
        league: params.get('league') || 'NBA' 
    };
}

/**
 * Normaliza os nomes das equipas para uma melhor apresentação.
 */
function formatTeamName(name, leagueID) {
    let formattedName = name || 'Equipa Desconhecida';
    formattedName = formattedName.replace(/_/g, ' ').replace(` ${leagueID}`, '');
    return formattedName;
}

// =========================================================
// 2. FETCH E RENDER DETALHES DO JOGO (API PÚBLICA)
// =========================================================

async function fetchMatchDetails(matchID, leagueID) {
    const container = document.getElementById('game-info-card');
    
    // O endpoint de eventos funciona como busca, usamos a data para filtrar.
    const datePart = matchID.split('_')[1]; 

    try {
        const url = `https://api.sportsgameodds.com/v2/events?leagueID=${leagueID}&date=${datePart}`; 
        const response = await fetch(url, { headers: { 'X-Api-Key': API_KEY } });
        const result = await response.json();
        
        // Encontra o jogo específico pelo ID
        currentMatch = result.data.find(match => match.eventID === matchID || match.id === matchID);
        
        if (!currentMatch) {
            container.innerHTML = `<div class="text-red-500 text-center py-10">Partida não encontrada (ID: ${matchID}).</div>`;
            return;
        }

        // Renderiza o cartão de detalhes e popula o formulário
        renderMatchCard(container, currentMatch, leagueID);
        populateFormOptions(currentMatch, leagueID);

    } catch (error) {
        console.error("Erro na busca de detalhes:", error);
        container.innerHTML = `<div class="text-red-500 text-center py-10">Erro ao carregar detalhes do jogo.</div>`;
    }
}

/**
 * Renderiza o cartão de detalhes do jogo na página.
 */
function renderMatchCard(container, match, leagueID) {
    const isNBA = leagueID === 'NBA';
    const themeColor = isNBA ? 'text-orange-400' : 'text-purple-500';
    const icon = isNBA ? '🏀' : '⚽';
    
    const homeName = formatTeamName(match.teams?.home?.names?.long || match.teams?.home?.teamID, leagueID);
    const awayName = formatTeamName(match.teams?.away?.names?.long || match.teams?.away?.teamID, leagueID);

    const homeScore = match.teams?.home?.score ?? 0;
    const awayScore = match.teams?.away?.score ?? 0;

    const isStarted = match.status?.started || false;
    const horario = match.status?.hardStart 
        ? new Date(match.status.hardStart).toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' }) 
        : 'AGENDADO';
    
    container.innerHTML = `
        <div class="match-card p-0">
            <div class="flex flex-col items-center justify-center min-h-[300px] space-y-4">
                
                <p class="text-sm font-bold ${themeColor} uppercase tracking-widest flex items-center gap-1">
                    ${icon} ${leagueID}
                </p>

                <div class="flex items-center justify-between w-full max-w-sm">
                    
                    <div class="w-1/2 text-right">
                        <p class="text-2xl font-bold text-gray-900">${homeName}</p>
                        <p class="text-sm text-gray-500">Casa</p>
                    </div>

                    <div class="mx-4">
                        <div class="text-4xl font-black text-gray-900 bg-gray-100 px-6 py-3 rounded-xl shadow-md border border-gray-200">
                            ${homeScore} - ${awayScore}
                        </div>
                    </div>

                    <div class="w-1/2 text-left">
                        <p class="text-2xl font-bold text-gray-900">${awayName}</p>
                        <p class="text-sm text-gray-500">Fora</p>
                    </div>
                </div>

                <span class="inline-flex items-center px-4 py-1 rounded-full text-sm font-medium ${isStarted ? 'bg-red-100 text-red-800 border border-red-200' : 'bg-gray-100 text-gray-600 border border-gray-200'} mt-4">
                    ${isStarted ? '🔴 AO VIVO' : '🕒 ' + horario}
                </span>

            </div>
        </div>
    `;
}

/**
 * Preenche o dropdown do formulário com os nomes das equipas.
 */
function populateFormOptions(match, leagueID) {
    const winnerSelect = document.getElementById('winner-select');
    
    const homeName = formatTeamName(match.teams?.home?.names?.long || match.teams?.home?.teamID, leagueID);
    const awayName = formatTeamName(match.teams?.away?.names?.long || match.teams?.away?.teamID, leagueID);
    
    // Usamos o ID da equipa como valor para submissão
    const homeValue = match.teams?.home?.teamID || homeName;
    const awayValue = match.teams?.away?.teamID || awayName;

    winnerSelect.innerHTML = `
        <option value="" disabled selected>Escolha a equipa...</option>
        <option value="${homeValue}">${homeName}</option>
        <option value="${awayValue}">${awayName}</option>
        <option value="DRAW">Empate</option>
    `;
}

// =========================================================
// 3. FETCH E RENDER PREVISÕES (MOCK API)
// =========================================================

async function fetchCommunityPredictions(matchID) {
    const container = document.getElementById('community-predictions');

    if (!matchID || !container) return;
    container.innerHTML = '<p class="text-gray-400 text-center py-4 text-sm">Carregando previsões...</p>';

    try {
        // Busca previsões filtradas pelo matchID (assumindo que o mockapi suporta filtragem)
        const url = `${MOCK_API_BASE_URL}/predictions?matchID=${matchID}&sortBy=createdAt&order=desc`;
        const response = await fetch(url);
        
        if (!response.ok) throw new Error("Erro ao buscar previsões da Mock API.");

        const predictions = await response.json();

        if (predictions.length === 0) {
            container.innerHTML = '<p class="text-gray-400 text-center py-4 text-sm">Sê o primeiro a prever!</p>';
            return;
        }

        const predictionsHtml = predictions.map(p => {
            const confidenceColor = p.confidence >= 80 ? 'bg-emerald-500' : (p.confidence >= 60 ? 'bg-orange-500' : 'bg-gray-500');
            const initials = p.username ? p.username.split(' ').map(n => n[0]).join('') : 'U';
            const predictionTime = new Date(p.createdAt).toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' });

            return `
                <div class="flex flex-col p-3 border-b border-gray-100 last:border-b-0">
                    <div class="flex justify-between items-start mb-2">
                        <div class="flex items-center gap-2">
                            <div class="w-7 h-7 rounded-full flex items-center justify-center text-white font-bold text-xs bg-purple-500">
                                ${initials}
                            </div>
                            <div>
                                <p class="text-sm font-semibold text-gray-800">${p.username}</p>
                                <p class="text-xs text-gray-400">Às ${predictionTime}</p>
                            </div>
                        </div>
                        <span class="px-2 py-0.5 text-xs font-bold text-white rounded-full ${confidenceColor}">
                            ${p.confidence}%
                        </span>
                    </div>
                    
                    <p class="text-lg font-bold text-gray-900">
                        Previsão: <span class="text-purple-600">${p.winner}</span> ${p.homeScore} - ${p.awayScore}
                    </p>
                </div>
            `;
        }).join('');

        container.innerHTML = predictionsHtml;

    } catch (error) {
        console.error("Erro ao carregar previsões:", error);
        container.innerHTML = '<p class="text-red-500 text-center py-4 text-sm">Erro ao carregar previsões da comunidade.</p>';
    }
}

// =========================================================
// 4. SUBMISSÃO DO FORMULÁRIO (POST PARA A MOCK API)
// =========================================================

async function submitPrediction(event) {
    event.preventDefault();
    const form = event.target;
    
    // Garantir que temos os dados do jogo
    if (!currentMatch) {
        alert("Erro: Dados da partida não carregados.");
        return;
    }
    const matchID = currentMatch.eventID || currentMatch.id;

    // Obter dados do formulário
    const winnerSelect = document.getElementById('winner-select');
    const scoreInput = document.getElementById('score-input');
    
    const winner = winnerSelect.value;
    const scoreValue = scoreInput.value.trim();
    const scoreParts = scoreValue.split('-').map(s => s.trim());
    
    // Validação
    if (!winner) {
        alert("Por favor, selecione quem vai ganhar ou Empate.");
        return;
    }
    if (scoreParts.length !== 2 || isNaN(parseInt(scoreParts[0])) || isNaN(parseInt(scoreParts[1]))) {
        alert("Por favor, insira o resultado exato no formato 'Casa-Fora' (ex: 110-105).");
        return;
    }

    const homeScore = parseInt(scoreParts[0]);
    const awayScore = parseInt(scoreParts[1]);

    // Dados a enviar (usamos dados mock para user/confidence)
    const newPrediction = {
        matchID: matchID,
        username: "Utilizador Alpha", // Hardcoded para simplificar.
        winner: winner,
        homeScore: homeScore,
        awayScore: awayScore,
        confidence: Math.floor(Math.random() * 50) + 50, // Confiança aleatória entre 50 e 99
        createdAt: new Date().toISOString()
    };
    
    const submitBtn = form.querySelector('button[type="submit"]');
    submitBtn.textContent = 'A enviar...';
    submitBtn.disabled = true;

    try {
        const response = await fetch(`${MOCK_API_BASE_URL}/predictions`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newPrediction)
        });

        if (!response.ok) throw new Error("Falha ao registar previsão na Mock API. Verifique o URL e a estrutura do recurso 'predictions'.");

        alert("Previsão registada com sucesso!");
        form.reset(); 

        // Atualiza a lista para mostrar a nova previsão
        fetchCommunityPredictions(matchID);

    } catch (error) {
        console.error("Erro ao submeter previsão:", error);
        alert(`Erro: Não foi possível registar a previsão. ${error.message}`);
    } finally {
        submitBtn.textContent = 'Registar Previsão';
        submitBtn.disabled = false;
    }
}


// =========================================================
// 5. INICIALIZAÇÃO
// =========================================================

function init() {
    const { id, league } = getUrlParams();
    
    if (!id || !league) {
        document.getElementById('game-info-card').innerHTML = `<div class="text-red-500 text-center py-10">Falta o ID da partida na URL.</div>`;
        return;
    }

    // 1. Carregar Detalhes do Jogo (API Pública)
    fetchMatchDetails(id, league);

    // 2. Carregar Previsões (Mock API)
    fetchCommunityPredictions(id);

    // 3. Configurar Event Listener para a submissão do formulário
    const form = document.getElementById('prediction-form');
    if (form) {
        form.addEventListener('submit', submitPrediction);
    }
}

// Inicializar a aplicação quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', init);