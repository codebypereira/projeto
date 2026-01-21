/**
 * GoalDash - SISTEMA CENTRAL (api.js)
 * FOCO: Configurações, Chamadas de API e Estado Global.
 */

// ============================================================================
// 1. CONFIGURAÇÃO UNIFICADA (Mantendo seus CODES)
// ============================================================================
const CONFIG = {
    API_KEY: 'cc48942721f415ae287937399dd882c7',
    MOCK_API: 'https://696278a1d9d64c761907fe9a.mockapi.io/api/dash/predictions',
    POPULAR_TEAMS: [
        { name: 'Real Madrid', code: "RMA" }, { name: 'Barcelona', code: "BAR" },
        { name: 'Man. City', code: "MCI" }, { name: 'Liverpool', code: "LIV" },
        { name: 'Bayern Munich', code: "FCB" }, { name: 'Paris SG', code: "PSG" },
        { name: 'Benfica', code: "SLB" }, { name: 'Corinthians', code: "COR" },
        { name: 'FC Porto', code: "FCP" }, { name: 'Flamengo', code: "FLA" },
        { name: 'Palmeiras', code: "PAL" }, { name: 'Al Nassr', code: "ALN" }
    ]
};

// Variáveis de Estado Global
window.allLoadedMatches = [];
window.activeGame = null;     
window.currentLeague = 'UEFA_CHAMPIONS_LEAGUE';
window.currentMatchData = null; 
window.previousScores = {};     

// ============================================================================
// 2. NÚCLEO DA API (GD_API)
// ============================================================================
const GD_API = {
    async fetchMatches(leagueID = null, leagueName = null) {
        if (leagueID) window.currentLeague = leagueID;

        // Feedback visual via UI
        if (window.UI && window.UI.showLoading) window.UI.showLoading('matches-container');

        try {
            const url = `https://api.sportsgameodds.com/v2/events?apiKey=${CONFIG.API_KEY}&leagueID=${window.currentLeague}`;
            const response = await fetch(url);
            const result = await response.json();
            
            window.allLoadedMatches = result.data || [];

            // Delego a renderização para o ui.js
            if (window.UI && window.UI.renderMatches) {
                window.UI.renderMatches('matches-container', window.allLoadedMatches);
            }
        } catch (error) {
            console.error("Erro fatal na busca de jogos:", error);
        }
    },

    async submitPrediction(homeScore, awayScore) {
        if (!window.activeGame) return;
        const payload = {
            matchId: `${window.activeGame.home} vs ${window.activeGame.away}`,
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
// 3. MÓDULO: LIVE & DETALHES (LOGICA DE BUSCA)
// ============================================================================
async function fetchLiveMatches(leagueID = 'LA_LIGA') {
    try {
        const url = `https://api.sportsgameodds.com/v2/events?apiKey=${CONFIG.API_KEY}&leagueID=${leagueID}&live=true`;
        const response = await fetch(url);
        const result = await response.json();
        const liveMatches = (result.data || []).filter(m => m.status && m.status.live === true);

        // Chama a renderização do ui.js
        if (window.UI && window.UI.renderLiveCards) {
            window.UI.renderLiveCards(liveMatches);
        }
    } catch (error) { console.error("Erro live:", error); }
}

async function fetchMatchDetails(id) {
    try {
        const response = await fetch(`https://api.sportsgameodds.com/v2/events?apiKey=${CONFIG.API_KEY}&eventID=${id}`);
        const result = await response.json();
        
        if (result.data && result.data.length > 0) {
            window.currentMatchData = result.data[0];
            
            // Chama a renderização do cabeçalho no ui.js
            if (window.UI && window.UI.renderHeader) window.UI.renderHeader();
            
            const status = window.currentMatchData.status?.status;
            const isNotStarted = (status === 'NS' || status === 'PST' || !window.currentMatchData.status?.clock);
            
            if (window.showTab) window.showTab(isNotStarted ? 'formacoes' : 'sumario');
        }
    } catch (error) { console.error("Erro detalhes:", error); }
}

// ============================================================================
// EXPOSIÇÃO GLOBAL
// ============================================================================
window.CONFIG = CONFIG;
window.GD_API = GD_API;
window.fetchLiveMatches = fetchLiveMatches; 
window.fetchMatchDetails = fetchMatchDetails;

window.changeSport = (leagueID, leagueName) => {
    window.previousScores = {};
    if (window.location.pathname.includes('live')) {
        window.fetchLiveMatches(leagueID);
    } else {
        GD_API.fetchMatches(leagueID, leagueName); 
    }
};

window.fetchMatches = (id, name) => GD_API.fetchMatches(id, name);
window.setActiveGame = (game) => { window.activeGame = game; };

window.handleSearch = (query) => {
    if (!window.allLoadedMatches) return;
    const filtrados = window.allLoadedMatches.filter(m => 
        m.teams.home.names.medium.toLowerCase().includes(query.toLowerCase()) || 
        m.teams.away.names.medium.toLowerCase().includes(query.toLowerCase())
    );
    if (window.UI) window.UI.renderMatches('matches-container', filtrados);
};