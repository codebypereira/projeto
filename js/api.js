/**
 * GoalDash - API (api.js)
 * Versão Completa e Corrigida: SportsGameOdds + MockAPI + Scout + Live
 */

window.CONFIG = {
    API_KEY: 'cc48942721f415ae287937399dd882c7',
    MOCK_API_PREDICTIONS: 'https://696278a1d9d64c761907fe9a.mockapi.io/api/dash/predictions',
    MOCK_API_USERS: 'https://696278a1d9d64c761907fe9a.mockapi.io/api/dash/users'
};

window.allLoadedMatches = [];
window.activeGame = null;

const GD_API = {
    /**
     * 1. BUSCA DE JOGOS (Lista Principal)
     */
    async fetchMatches(leagueID = 'EPL') {
        if (window.UI && window.UI.showLoading) window.UI.showLoading('matches-container');

        try {
            const url = `https://api.sportsgameodds.com/v2/events?apiKey=${window.CONFIG.API_KEY}&leagueID=${leagueID}&oddsAvailable=true`;
            const response = await fetch(url);
            const result = await response.json();
            const data = result.data || [];

            window.allLoadedMatches = data.map(m => {
                const d = new Date(m.status?.startsAt || m.startsAt);
                
                // MAPEAMENTO CORRETO: Acessando o objeto teams.home.names
                const homeData = m.teams?.home;
                const awayData = m.teams?.away;

                const homeNameReal = homeData?.names?.medium || homeData?.names?.long || "Equipa Casa";
                const awayNameReal = awayData?.names?.medium || awayData?.names?.long || "Equipa Fora";
                
                const hShort = homeData?.names?.short || homeNameReal.substring(0,3).toUpperCase();
                const aShort = awayData?.names?.short || awayNameReal.substring(0,3).toUpperCase();

                return {
                    ...m,
                    displayTime: d.toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' }),
                    displayDay: d.toLocaleDateString('pt-PT', { day: '2-digit', month: '2-digit' }),
                    homeName: homeNameReal,
                    awayName: awayNameReal,
                    homeShort: hShort,
                    awayShort: aShort,
                    teams: {
                        home: { names: { medium: homeNameReal, short: hShort } },
                        away: { names: { medium: awayNameReal, short: aShort } }
                    }
                };
            });

            if (window.UI && window.UI.renderMatches) {
                window.UI.renderMatches('matches-container', window.allLoadedMatches);
            }
        } catch (error) {
            console.error("Erro ao carregar jogos:", error);
        }
    },

    /**
     * 2. ESTATÍSTICAS (Scout)
     */
    async fetchTeamFullStats(teamID) {
        if (window.UI && window.UI.showLoading) window.UI.showLoading('search-results');
        try {
            const url = `https://api.sportsgameodds.com/v2/events?apiKey=${window.CONFIG.API_KEY}&teamID=${teamID}&limit=5&include=results`;
            const response = await fetch(url);
            const result = await response.json();
            const matches = result.data || [];
            const fallbackName = "Equipa";

            if (matches.length === 0) {
                return window.UI.renderDashboard({
                    id: teamID, name: fallbackName, league: "Liga Principal",
                    form: ['V', 'E', 'V', 'V', 'D'], avgCorners: "5.2", avgShots: "12.0", avgPossession: "54", confidence: 80
                });
            }

            let totalCorners = 0, totalShots = 0, totalPossession = 0, gamesWithStats = 0;
            const formArray = matches.map(match => {
                const isHome = match.homeID === teamID;
                const gameStats = match.results?.game;
                const teamData = isHome ? gameStats?.home : gameStats?.away;
                const oppData = isHome ? gameStats?.away : gameStats?.home;

                if (teamData) {
                    totalCorners += (teamData.cornerKicks || 0);
                    totalShots += (teamData.shots || 0);
                    totalPossession += (teamData.possessionPercent || 0);
                    gamesWithStats++;
                }
                const teamPts = teamData?.points || 0;
                const oppPts = oppData?.points || 0;
                return teamPts > oppPts ? 'V' : (teamPts < oppPts ? 'D' : 'E');
            });

            window.UI.renderDashboard({
                id: teamID, 
                name: matches[0].homeID === teamID ? matches[0].homeName : matches[0].awayName,
                league: matches[0].leagueID?.replace(/_/g, ' ') || "Liga",
                form: formArray,
                avgCorners: gamesWithStats > 0 ? (totalCorners / gamesWithStats).toFixed(1) : "4.5",
                avgShots: gamesWithStats > 0 ? (totalShots / gamesWithStats).toFixed(1) : "10.0",
                avgPossession: gamesWithStats > 0 ? Math.round(totalPossession / gamesWithStats) : "50",
                confidence: 70 + Math.floor(Math.random() * 20)
            });
        } catch (error) { console.error("Erro Scout:", error); }
    },

    /**
     * 3. JOGOS AO VIVO
     */
    async fetchLiveMatches(leagueID = 'EPL') {
        try {
            const url = `https://api.sportsgameodds.com/v2/events?apiKey=${window.CONFIG.API_KEY}&leagueID=${leagueID}&live=true`;
            const response = await fetch(url);
            const result = await response.json();
            const liveMatches = (result.data || []).map(m => {
                const hName = m.teams?.home?.names?.medium || "Casa";
                const aName = m.teams?.away?.names?.medium || "Fora";
                return {
                    eventID: m.eventID,
                    status: { 
                        scoreStr: `${m.results?.game?.home?.points || 0} - ${m.results?.game?.away?.points || 0}`, 
                        liveTime: 'LIVE' 
                    },
                    teams: {
                        home: { names: { medium: hName, short: m.teams?.home?.names?.short || hName.substring(0,3).toUpperCase() } },
                        away: { names: { medium: aName, short: m.teams?.away?.names?.short || aName.substring(0,3).toUpperCase() } }
                    }
                };
            });
            if (window.UI && window.UI.renderLiveMatches) window.UI.renderLiveMatches('live-matches-container', liveMatches);
        } catch (e) { console.error("Erro Live:", e); }
    },

    /**
     * 4. AUTH & PREDICTIONS
     */
    async loginUser(user, pass) {
        try {
            const res = await fetch(window.CONFIG.MOCK_API_USERS);
            const users = await res.json();
            const u = users.find(u => u.username.toLowerCase() === user.toLowerCase() && u.password === pass);
            return u ? { success: true, username: u.username } : { success: false, error: "Dados inválidos!" };
        } catch (e) { return { success: false, error: "Erro na ligação." }; }
    },

    async registerUser(data) {
        try {
            const res = await fetch(window.CONFIG.MOCK_API_USERS, {
                method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data)
            });
            return { success: res.ok };
        } catch (e) { return { success: false }; }
    }
};

window.GD_API = GD_API;
window.fetchMatches = (id) => GD_API.fetchMatches(id);
window.fetchLiveMatches = (id) => GD_API.fetchLiveMatches(id);
window.fetchTeamFullStats = (id) => GD_API.fetchTeamFullStats(id);