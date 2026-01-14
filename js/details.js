// js/details.js

const API_KEY = "af7afc4eab9aa5ab16421caefd7aea25";
const MOCK_API_BASE_URL = "https://696278a1d9d64c761987fe9a.mockapi.io/api"; 

let currentMatch = null; 

// =========================================================
// 1. UTILIDADES E MODAL
// =========================================================

function getUrlParams() {
    const params = new URLSearchParams(window.location.search);
    return {
        id: params.get('id'),
        league: params.get('league') || 'NBA' 
    };
}

function formatTeamName(name, leagueID) {
    let formattedName = name || 'Equipa Desconhecida';
    formattedName = formattedName.replace(/_/g, ' ').replace(` ${leagueID}`, '');
    return formattedName;
}

// Funções do Modal (Certifica-te que o HTML do modal está no match_details.html)
function openAuthModal() {
    const modal = document.getElementById('auth-modal');
    if (modal) {
        modal.classList.remove('hidden');
        modal.classList.add('flex');
    }
}

function closeAuthModal() {
    const modal = document.getElementById('auth-modal');
    if (modal) {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
    }
}

// =========================================================
// 2. FETCH E RENDER DETALHES DO JOGO (API PÚBLICA)
// =========================================================

async function fetchMatchDetails(matchID, leagueID) {
    const container = document.getElementById('game-info-card');
    const datePart = matchID.split('_')[1]; 

    try {
        const url = `https://api.sportsgameodds.com/v2/events?leagueID=${leagueID}&date=${datePart}`; 
        const response = await fetch(url, { headers: { 'X-Api-Key': API_KEY } });
        const result = await response.json();
        
        currentMatch = result.data.find(match => match.eventID === matchID || match.id === matchID);
        
        if (!currentMatch) {
            container.innerHTML = `<div class="text-red-500 text-center py-10">Partida não encontrada.</div>`;
            return;
        }

        renderMatchCard(container, currentMatch, leagueID);
        populateFormOptions(currentMatch, leagueID);

    } catch (error) {
        console.error("Erro:", error);
        container.innerHTML = `<div class="text-red-500 text-center py-10">Erro ao carregar detalhes.</div>`;
    }
}

function renderMatchCard(container, match, leagueID) {
    const isNBA = leagueID === 'NBA';
    const homeName = formatTeamName(match.teams?.home?.names?.long, leagueID);
    const awayName = formatTeamName(match.teams?.away?.names?.long, leagueID);
    
    container.innerHTML = `
        <div class="match-card p-6 text-center">
            <h2 class="text-xl font-bold mb-4">${leagueID} - Detalhes</h2>
            <div class="flex justify-around items-center">
                <div><p class="font-bold">${homeName}</p></div>
                <div class="text-3xl font-black">${match.teams?.home?.score ?? 0} - ${match.teams?.away?.score ?? 0}</div>
                <div><p class="font-bold">${awayName}</p></div>
            </div>
        </div>
    `;
}

function populateFormOptions(match, leagueID) {
    const winnerSelect = document.getElementById('winner-select');
    const homeName = formatTeamName(match.teams?.home?.names?.long, leagueID);
    const awayName = formatTeamName(match.teams?.away?.names?.long, leagueID);

    winnerSelect.innerHTML = `
        <option value="" disabled selected>Escolha a equipa...</option>
        <option value="${homeName}">${homeName}</option>
        <option value="${awayName}">${awayName}</option>
        <option value="DRAW">Empate</option>
    `;
}

// =========================================================
// 3. SUBMISSÃO (O CORAÇÃO DO BLOQUEIO)
// =========================================================

async function submitPrediction(event) {
    event.preventDefault();

    // A VISION: Verificar login primeiro
    const isLogged = localStorage.getItem('isLoggedIn');
    const storedUser = localStorage.getItem('username');

    if (!isLogged) {
        alert("Calma aí, parceiro! Precisas de estar logado para dar palpites.");
        openAuthModal();
        return; 
    }

    if (!currentMatch) return;

    const winner = document.getElementById('winner-select').value;
    const scoreValue = document.getElementById('score-input').value;
    const scoreParts = scoreValue.split('-').map(s => s.trim());

    if (!winner || scoreParts.length !== 2) {
        alert("Preenche tudo corretamente, meu cria!");
        return;
    }

    const newPrediction = {
        matchID: currentMatch.eventID || currentMatch.id,
        username: storedUser || "Anónimo", // Usa o nome de quem fez login!
        winner: winner,
        homeScore: parseInt(scoreParts[0]),
        awayScore: parseInt(scoreParts[1]),
        confidence: Math.floor(Math.random() * 40) + 60,
        createdAt: new Date().toISOString()
    };

    const submitBtn = event.target.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Enviando...';

    try {
        const response = await fetch(`${MOCK_API_BASE_URL}/predictions`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newPrediction)
        });

        if (response.ok) {
            alert("Palpite registado!");
            event.target.reset();
            fetchCommunityPredictions(newPrediction.matchID);
        }
    } catch (error) {
        alert("Erro ao enviar palpite.");
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Registar Previsão';
    }
}

// =========================================================
// 4. PREVISÕES DA COMUNIDADE
// =========================================================

async function fetchCommunityPredictions(matchID) {
    const container = document.getElementById('community-predictions');
    try {
        const response = await fetch(`${MOCK_API_BASE_URL}/predictions?matchID=${matchID}`);
        const predictions = await response.json();
        
        if (predictions.length === 0) {
            container.innerHTML = '<p class="text-center text-gray-500">Sem palpites ainda.</p>';
            return;
        }

        container.innerHTML = predictions.map(p => `
            <div class="p-3 border-b border-gray-100">
                <p class="text-sm font-bold">${p.username}: <span class="text-purple-600">${p.winner}</span> (${p.homeScore}-${p.awayScore})</p>
            </div>
        `).join('');
    } catch (e) {
        container.innerHTML = 'Erro ao carregar lista.';
    }
}

// =========================================================
// 5. INICIALIZAÇÃO
// =========================================================

function init() {
    const { id, league } = getUrlParams();
    if (!id) return;

    fetchMatchDetails(id, league);
    fetchCommunityPredictions(id);

    const form = document.getElementById('prediction-form');
    if (form) {
        form.addEventListener('submit', submitPrediction);
    }
}

document.addEventListener('DOMContentLoaded', init);