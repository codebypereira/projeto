/**
 * GoalDash - SISTEMA CENTRAL (api.js)
 * Versão Final: Com busca de equipas, histórico e autenticação.
 */

const CONFIG = {
    API_KEY: 'cc48942721f415ae287937399dd882c7',
    MOCK_API_PREDICTIONS: 'https://696278a1d9d64c761907fe9a.mockapi.io/api/dash/predictions',
    MOCK_API_USERS: 'https://696278a1d9d64c761907fe9a.mockapi.io/api/dash/users',
    BASE_URL_V2: 'https://api.sportsgameodds.com/v2',
    BASE_URL_V1: 'https://api.sportsgameodds.com/v1'
};

// Estado Global da Aplicação
window.allLoadedMatches = [];
window.activeGame = null;     
window.currentLeague = 'UEFA_CHAMPIONS_LEAGUE';

const GD_API = {

    /**
     * 1. BUSCA DE JOGOS (API de Futebol - Home/Live)
     */
    async fetchMatches(leagueID = null) {
        if (leagueID) window.currentLeague = leagueID;

        if (window.UI && window.UI.showLoading) {
            window.UI.showLoading('matches-container');
        }

        try {
            const url = `${CONFIG.BASE_URL_V2}/events?apiKey=${CONFIG.API_KEY}&leagueID=${window.currentLeague}&oddsAvailable=true`;
            const response = await fetch(url);
            const result = await response.json();
            const data = result.data || [];

            window.allLoadedMatches = data.map(m => {
                const rawDate = m.status?.startsAt || m.startsAt;
                let day = "--/--", time = "--:--";

                if (rawDate) {
                    const d = new Date(rawDate);
                    if (!isNaN(d.getTime())) {
                        day = d.toLocaleDateString('pt-PT', { day: '2-digit', month: '2-digit' });
                        time = d.toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' });
                    }
                }
                return { ...m, displayDay: day, displayTime: time };
            });

            if (window.UI && window.UI.renderMatches) {
                window.UI.renderMatches('matches-container', window.allLoadedMatches);
            }
        } catch (error) {
            console.error("Erro ao carregar jogos:", error);
        }
    },

    /**
     * 2. BUSCA DE EQUIPA POR NOME (Página Stats)
     */
    async searchTeamByName(query) {
        try {
            const response = await fetch(`${CONFIG.BASE_URL_V1}/soccer/teams?search=${encodeURIComponent(query)}`, {
                headers: { 'X-Api-Key': CONFIG.API_KEY }
            });
            const data = await response.json();
            const teams = data.data || data;

            // Retorna o primeiro ID encontrado (v1 usa teamID, v2 usa id)
            return (teams && teams.length > 0) ? (teams[0].teamID || teams[0].id) : null;
        } catch (err) {
            console.error("Erro na busca da equipa:", err);
            return null;
        }
    },

    /**
     * 3. ESTATÍSTICAS COMPLETAS E FORMA (Página Stats)
     */
    async fetchTeamFullStats(teamID) {
        try {
            const url = `${CONFIG.BASE_URL_V2}/events?apiKey=${CONFIG.API_KEY}&teamID=${teamID}&ended=true&limit=5`;
            const response = await fetch(url);
            const result = await response.json();
            const matches = result.data || [];

            if (matches.length === 0) return null;

            // Calcula V/D/E para os últimos 5 jogos
            const formArray = matches.map(game => {
                const homeID = game.homeID || game.teams?.home?.id;
                const hScore = game.homeScore ?? game.results?.reg?.home?.points ?? 0;
                const aScore = game.awayScore ?? game.results?.reg?.away?.points ?? 0;

                const isHome = homeID == teamID;
                const teamScore = isHome ? hScore : aScore;
                const oppScore = isHome ? aScore : hScore;

                if (teamScore > oppScore) return 'V';
                if (teamScore < oppScore) return 'D';
                return 'E';
            });

            const firstMatch = matches[0];
            return {
                id: teamID,
                name: (firstMatch.teams?.home?.id == teamID) 
                    ? (firstMatch.teams?.home?.names?.medium || firstMatch.homeName) 
                    : (firstMatch.teams?.away?.names?.medium || firstMatch.awayName),
                league: firstMatch.tournament?.name || firstMatch.leagueName || "Liga",
                form: formArray
            };
        } catch (err) {
            console.error("Erro ao puxar estatísticas completas:", err);
            return null;
        }
    },

    /**
     * 4. AUTENTICAÇÃO (Login e Registo)
     */
    async loginUser(username, password) {
        try {
            const response = await fetch(CONFIG.MOCK_API_USERS);
            const users = await response.json();

            const user = users.find(u => 
                (u.username.toLowerCase() === username.toLowerCase() || u.email.toLowerCase() === username.toLowerCase())
            );

            if (!user) return { success: false, error: "Utilizador não encontrado!" };
            if (user.password !== password) return { success: false, error: "Palavra-passe incorreta!" };

            return { success: true, username: user.username };
        } catch (e) {
            return { success: false, error: "Erro na ligação ao servidor." };
        }
    },

    async registerUser(userData) {
        try {
            if (userData.password.length < 8) {
                return { success: false, error: "A palavra-passe deve ter pelo menos 8 caracteres." };
            }

            const response = await fetch(CONFIG.MOCK_API_USERS);
            const users = await response.json();

            const nameExists = users.some(u => u.username.toLowerCase() === userData.username.toLowerCase());
            const emailExists = users.some(u => u.email.toLowerCase() === userData.email.toLowerCase());

            if (nameExists && emailExists) return { success: false, error: "Nome e email já utilizados!" };
            if (nameExists) return { success: false, error: "Nome de utilizador já está em uso!" };
            if (emailExists) return { success: false, error: "Este e-mail já está registado!" };

            const createRes = await fetch(CONFIG.MOCK_API_USERS, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(userData)
            });

            return createRes.ok ? { success: true } : { success: false, error: "Erro ao salvar o registo." };

        } catch (error) {
            return { success: false, error: "Falha de conexão à internet." };
        }
    },

    /**
     * 5. ENVIO DE PALPITE
     */
    async submitPrediction(h, a) {
        if (!window.activeGame) return false;

        const username = localStorage.getItem('goalDash_username');
        if (!username) return false;

        const payload = {
            matchId: `${window.activeGame.home} vs ${window.activeGame.away}`,
            username: username,
            Winner: h > a ? window.activeGame.home : (a > h ? window.activeGame.away : "Empate"),
            homeScore: parseInt(h),
            awayScore: parseInt(a),
            createdAt: new Date().toISOString()
        };

        try {
            const res = await fetch(CONFIG.MOCK_API_PREDICTIONS, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            return res.ok;
        } catch (e) {
            console.error("Erro ao enviar palpite:", e);
            return false;
        }
    }
};

// EXPOSIÇÃO GLOBAL
window.GD_API = GD_API;
window.fetchMatches = (id) => GD_API.fetchMatches(id);