/**
 * GoalDash - SISTEMA CENTRAL (api.js)
 * Consolidado: Auth, Matches, Live, Stats e History
 */

// ============================================================================
// 1. CONFIGURAÇÃO UNIFICADA
// ============================================================================
const CONFIG = {
    API_KEY: 'cc48942721f415ae287937399dd882c7',
    MOCK_API: 'https://696278a1d9d64c761907fe9a.mockapi.io/api/dash/predictions',
    BASE_LOGO_URL: 'https://media.api-sports.io/football/',
    POPULAR_TEAMS: [
        { name: 'Real Madrid', id: 541 }, { name: 'Barcelona', id: 529 },
        { name: 'Man. City', id: 50 }, { name: 'Liverpool', id: 40 },
        { name: 'Bayern Munich', id: 157 }, { name: 'Paris SG', id: 85 },
        { name: 'Benfica', id: 211 }, { name: 'Sporting CP', id: 212 },
        { name: 'FC Porto', id: 217 }, { name: 'Flamengo', id: 127 },
        { name: 'Palmeiras', id: 121 }, { name: 'Al Nassr', id: 2939 }
    ]
};

// Variáveis de Estado Global
let allLoadedMatches = [];
let activeGame = null;     
let currentLeague = 'UEFA_CHAMPIONS_LEAGUE';
let currentMatchData = null; // Para matchdetails.html
let previousScores = {};     // Para flash de golos no Live

// ============================================================================
// 3. NÚCLEO DA API (GD_API)
// ============================================================================
const GD_API = {
   
// Dentro do objeto GD_API no api.js
async fetchMatches(leagueID = null, leagueName = null) {
    if (leagueID) currentLeague = leagueID;

    // Feedback visual imediato
    const container = document.getElementById('matches-container');
    if (container && window.UI) window.UI.showLoading('matches-container');

    try {
        const url = `https://api.sportsgameodds.com/v2/events?apiKey=${CONFIG.API_KEY}&leagueID=${currentLeague}`;
        const response = await fetch(url);
        const result = await response.json();
        
        allLoadedMatches = result.data || [];

        // Tenta usar o UI, se falhar, renderiza à força
        if (window.UI && window.UI.renderMatches) {
            window.UI.renderMatches('matches-container', allLoadedMatches);
        } else {
            // Plano B: Renderização forçada caso o objeto UI tenha dado erro
            container.innerHTML = allLoadedMatches.map(m => `<div>${m.teams.home.names.medium} VS ${m.teams.away.names.medium}</div>`).join('');
        }
    } catch (error) {
        console.error("Erro fatal:", error);
    }
},

    async submitPrediction(homeScore, awayScore) {
        if (!activeGame) return;
        const payload = {
            matchId: `${activeGame.home} vs ${activeGame.away}`,
            username: localStorage.getItem('goalDash_username'),
            homeScore: homeScore,
            awayScore: awayScore,
            createdAt: new Date().toISOString()
        };

        try {
            const res = await fetch(CONFIG.MOCK_API, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            return res.ok;
        } catch (e) { return false; }
    }
};

// ============================================================================
// 4. MÓDULO: LIVE & GOLOS
// ============================================================================
async function fetchLiveMatches(leagueID = 'LA_LIGA') {
    const container = document.getElementById('live-matches-container');
    if (!container) return;

    try {
        const url = `https://api.sportsgameodds.com/v2/events?apiKey=${CONFIG.API_KEY}&leagueID=${leagueID}&live=true`;
        const response = await fetch(url);
        const result = await response.json();

        const liveMatches = (result.data || []).filter(m => m.status && m.status.live === true);

        if (liveMatches.length === 0) {
            container.innerHTML = `<p class="text-white col-span-full text-center py-20 opacity-50">Sem jogos live no momento.</p>`;
            return;
        }

        renderLiveCards(liveMatches);
    } catch (error) { console.error(error); }
}

function renderLiveCards(matches) {
    const container = document.getElementById('live-matches-container');
    if (!container) return;
    container.innerHTML = '';

    matches.forEach(m => {
        let hScore = m.results?.reg?.home?.points ?? 0;
        let aScore = m.results?.reg?.away?.points ?? 0;

        // Animação de Golo
        const last = previousScores[m.eventID];
        let flashClass = (last && (last.h !== hScore || last.a !== aScore)) ? "ring-4 ring-purple-500 animate-pulse" : "";
        previousScores[m.eventID] = { h: hScore, a: aScore };

        const hLogo = window.getTeamLogo ? window.getTeamLogo(m.teams.home.names.short) : "";
        const aLogo = window.getTeamLogo ? window.getTeamLogo(m.teams.away.names.short) : "";

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
                    <img src="${hLogo}" class="w-20 h-20 mx-auto mb-3 object-contain">
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
                    <img src="${aLogo}" class="w-20 h-20 mx-auto mb-3 object-contain">
                    <span class="text-[11px] font-black text-gray-400 uppercase block">${m.teams.away.names.medium}</span>
                </div>
            </div>
            <button onclick="window.location.href='matchdetails.html?id=${m.eventID}'" class="w-full py-4 rounded-2xl text-[10px] font-black text-white uppercase tracking-widest bg-white/5 border border-white/10 hover:bg-purple-600 transition-all cursor-pointer">
                Estatísticas Completas
            </button>
        `;
        container.appendChild(card);
    });
}

// ============================================================================
// 5. MÓDULO: DETALHES DO JOGO
// ============================================================================
async function fetchMatchDetails(id) {
    try {
        const response = await fetch(`https://api.sportsgameodds.com/v2/events?apiKey=${CONFIG.API_KEY}&eventID=${id}`);
        const result = await response.json();
        
        if (result.data && result.data.length > 0) {
            currentMatchData = result.data[0];
            renderHeader();
            const status = currentMatchData.status?.status;
            const isNotStarted = (status === 'NS' || status === 'PST' || !currentMatchData.status?.clock);
            window.showTab(isNotStarted ? 'formacoes' : 'sumario');
        }
    } catch (error) { console.error(error); }
}

function renderHeader() {
    const m = currentMatchData;
    const container = document.getElementById('match-header');
    if (!m || !container) return;

    const hLogo = window.getTeamLogo ? window.getTeamLogo(m.teams.home.names.short) : "";
    const aLogo = window.getTeamLogo ? window.getTeamLogo(m.teams.away.names.short) : "";

    container.innerHTML = `
        <div class="bg-slate-900/40 border border-white/5 rounded-[2.5rem] p-10 backdrop-blur-xl text-center">
            <span class="text-[10px] font-black uppercase tracking-[0.4em] text-purple-500">${m.tournament?.name}</span>
            <div class="flex flex-row items-center justify-between mt-8">
                <div class="flex-1"><img src="${hLogo}" class="w-24 h-24 mx-auto mb-4 object-contain"><h2 class="font-black text-white">${m.teams.home.names.medium}</h2></div>
                <div class="px-10 min-w-[200px]">
                    <div class="text-6xl font-black text-white italic">
                        ${m.results?.reg?.home?.points ?? 0} - ${m.results?.reg?.away?.points ?? 0}
                    </div>
                </div>
                <div class="flex-1"><img src="${aLogo}" class="w-24 h-24 mx-auto mb-4 object-contain"><h2 class="font-black text-white">${m.teams.away.names.medium}</h2></div>
            </div>
        </div>`;
}

window.showTab = function(tabName) {
    const content = document.getElementById('tab-content');
    if (!currentMatchData || !content) return;

    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('text-purple-500', 'border-purple-500'));
    document.getElementById(`btn-${tabName}`)?.classList.add('text-purple-500', 'border-purple-500');

    if (tabName === 'formacoes') renderLineups(content);
    else if (tabName === 'sumario') renderSummary(content);
    else if (tabName === 'estatisticas') renderMatchStats(content);
    else content.innerHTML = `<div class="py-20 text-center opacity-50">Em breve</div>`;
};

// ============================================================================
// 6. MÓDULO: HISTÓRICO
// ============================================================================
async function loadPredictionHistory() {
    const container = document.getElementById('history-container');
    const user = localStorage.getItem('goalDash_username');
    if (!container || !user) return;

    try {
        const response = await fetch(CONFIG.MOCK_API);
        const all = await response.json();
        const myData = all.filter(p => p.username === user).reverse();
        
        container.innerHTML = myData.map(pred => `
            <div class="bg-white/5 p-6 rounded-3xl border border-white/5 mb-4 flex justify-between items-center">
                <div>
                    <span class="text-[9px] bg-purple-500 px-2 py-1 rounded text-white">${new Date(pred.createdAt).toLocaleDateString()}</span>
                    <h3 class="text-xl font-black text-white mt-2">${pred.matchId}</h3>
                </div>
                <div class="bg-white/10 px-6 py-3 rounded-2xl text-2xl font-black text-white">
                    ${pred.homeScore} X ${pred.awayScore}
                </div>
            </div>`).join('');
    } catch (e) { container.innerHTML = "Erro ao carregar."; }
}

// ============================================================================
// 7. MÓDULO: ANÁLISE DE EQUIPAS (STATS)
// ============================================================================
function setupStatsSearch() {
    const input = document.getElementById('teams-search');
    input?.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && e.target.value.length > 2) searchTeamByName(e.target.value);
    });
}

async function searchTeamByName(query) {
    toggleStatsLoading(true);
    try {
        const res = await fetch(`https://api.sportsgameodds.com/v1/soccer/teams?search=${encodeURIComponent(query)}`, {
            headers: { 'X-Api-Key': CONFIG.API_KEY }
        });
        const data = await res.json();
        const teams = data.data || data;
        if (teams?.length > 0) fetchTeamFullStats(teams[0].teamID || teams[0].id);
        else alert("Não encontrado");
    } catch (e) { console.error(e); } finally { toggleStatsLoading(false); }
}

function renderPopularTeams() {
    const grid = document.getElementById('popular-teams-grid');
    if (!grid) return;
    grid.innerHTML = CONFIG.POPULAR_TEAMS.map(team => `
        <div onclick="fetchTeamFullStats(${team.id})" class="bg-white/5 p-4 rounded-3xl flex flex-col items-center cursor-pointer hover:bg-purple-500/10">
            <img src="${CONFIG.BASE_LOGO_URL}/teams/${team.id}.png" class="w-12 h-12 object-contain" onerror="this.src='Images/favi.svg'">
            <span class="text-[10px] font-black text-gray-400 uppercase mt-2">${team.name}</span>
        </div>`).join('');
}

// ============================================================================
// EXPOSIÇÃO GLOBAL
// ============================================================================

window.fetchLiveMatches = fetchLiveMatches; 

window.changeSport = (leagueID, leagueName) => {
    previousScores = {};
    const container = document.getElementById('matches-container');
    if (container) container.innerHTML = ""; 

    if (window.location.pathname.includes('live')) {
        window.fetchLiveMatches(leagueID);
    } else {
        // Agora passamos ID e NOME para a função core
        GD_API.fetchMatches(leagueID, leagueName); 
    }
};

// Garante que o fetchMatches global também aceite o nome
window.fetchMatches = (id, name) => GD_API.fetchMatches(id, name);

window.setActiveGame = (game) => { activeGame = game; };
window.fetchTeamFullStats = fetchTeamFullStats; // Necessário para o onclick
window.handleSearch = GD_API.search;      // Esta é a que filtra por nome
window.loadPredictionHistory = loadPredictionHistory;
window.fetchMatchDetails = fetchMatchDetails;
window.renderPopularTeams = renderPopularTeams;
window.setupStatsSearch = setupStatsSearch;
window.updateUserUI = updateUserUI; // Garante que esta função existe no api.js ou global.js
// No final do seu api.js, garanta estas linhas:
window.GD_API = GD_API; 
