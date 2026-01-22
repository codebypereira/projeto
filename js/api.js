/**
 * GoalDash - SISTEMA CENTRAL (api.js)
 * Versão Final: Com busca de equipas, histórico, autenticação e partidas terminadas.
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
     * 2. BUSCA DE PARTIDAS TERMINADAS
     */
    async fetchEndedMatches(leagueID = null) {
        const league = leagueID || window.currentLeague;
        try {
            const url = `${CONFIG.BASE_URL_V2}/events?apiKey=${CONFIG.API_KEY}&leagueID=${league}&finalized=true`;
            const response = await fetch(url);
            const result = await response.json();
            return result.data || [];
        } catch (error) {
            console.error("Erro ao buscar partidas terminadas:", error);
            return [];
        }
    },

    /**
     * 3. BUSCA DE EQUIPA POR NOME
     */
    searchTeamByName: async (name) => {
    // 1. Garante que temos jogos carregados para pesquisar
    const matches = window.allLoadedMatches || [];
    const searchTerm = name.toLowerCase().trim();
    
    console.log(`🔍 Busca Universal iniciada para: "${searchTerm}"`);

    // 2. Procura nos jogos carregados (Varre todos os times da liga atual)
    for (const m of matches) {
        const home = m.teams?.home;
        const away = m.teams?.away;

        // Testa o time da casa
        if (home && (
            home.names?.medium?.toLowerCase().includes(searchTerm) || 
            home.names?.full?.toLowerCase().includes(searchTerm) ||
            home.teamID?.toLowerCase().includes(searchTerm.replace(" ", "_"))
        )) {
            console.log("✅ Time encontrado na Casa:", home.teamID);
            return home.teamID;
        }

        // Testa o time de fora
        if (away && (
            away.names?.medium?.toLowerCase().includes(searchTerm) || 
            away.names?.full?.toLowerCase().includes(searchTerm) ||
            away.teamID?.toLowerCase().includes(searchTerm.replace(" ", "_"))
        )) {
            console.log("✅ Time encontrado Fora:", away.teamID);
            return away.teamID;
        }
    }

    // 3. SE NÃO ACHOU NOS JOGOS: Tenta montar a String ID padrão da API
    // Muitas APIs usam NOME_LIGA. Vamos tentar prever isso:
    const predictedID = searchTerm.toUpperCase().replace(/\s+/g, '_') + "_UEFA_CHAMPIONS_LEAGUE";
    console.warn("⚠️ Time não está na lista de jogos atual. Tentando ID previsto:", predictedID);
    
    return predictedID; 
    },

    /**
     * 4. ESTATÍSTICAS COMPLETAS E FORMA (AJUSTADA PARA FUNCIONAR NA UI)
     */
    async fetchTeamFullStats(teamID) {
        try {
            console.log(`%c 🔍 DEBUG: Buscando ID ${teamID}...`, "color: #9333ea; font-weight: bold;");

            const url = `${CONFIG.BASE_URL_V2}/events?apiKey=${CONFIG.API_KEY}&teamID=${teamID}&finalized=true&limit=5`;
            const response = await fetch(url);
            const result = await response.json();

            console.log("%c 📦 DADOS BRUTOS:", "color: #00ff00; font-weight: bold;", result);
            
            const matches = result.data || result.events || (Array.isArray(result) ? result : []);

            if (matches.length === 0) {
                console.warn("⚠️ Sem jogos finalizados.");
                return { name: "Equipa", league: "Liga", form: [], history: [] };
            }

            // TRATAMENTO PARA A UI NÃO CRASHAR
            const sample = matches[0];
            const isHome = sample.teams.home.id == teamID;
            
            return {
                id: teamID,
                name: isHome ? sample.teams.home.names.medium : sample.teams.away.names.medium,
                league: sample.league?.names?.medium || "Competição",
                form: matches.map(m => {
                    const hS = m.status?.score?.home ?? 0;
                    const aS = m.status?.score?.away ?? 0;
                    if (hS === aS) return 'E';
                    return (m.teams.home.id == teamID ? hS > aS : aS > hS) ? 'V' : 'D';
                }),
                history: matches
            };

        } catch (err) {
            console.error("🚨 ERRO NO FETCH:", err);
            return null;
        }
    },

    /**
     * 5. AUTENTICAÇÃO
     */
    async loginUser(username, password) {
        try {
            const response = await fetch(CONFIG.MOCK_API_USERS);
            const users = await response.json();
            const user = users.find(u => (u.username.toLowerCase() === username.toLowerCase() || u.email.toLowerCase() === username.toLowerCase()));
            if (!user) return { success: false, error: "Utilizador não encontrado!" };
            if (user.password !== password) return { success: false, error: "Palavra-passe incorreta!" };
            return { success: true, username: user.username };
        } catch (e) { return { success: false, error: "Erro na ligação." }; }
    },

    async registerUser(userData) {
        try {
            const response = await fetch(CONFIG.MOCK_API_USERS);
            const users = await response.json();
            if (users.some(u => u.username.toLowerCase() === userData.username.toLowerCase())) return { success: false, error: "Nome já existe!" };
            const createRes = await fetch(CONFIG.MOCK_API_USERS, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(userData)
            });
            return createRes.ok ? { success: true } : { success: false, error: "Erro ao salvar." };
        } catch (error) { return { success: false, error: "Falha de conexão." }; }
    },

    /**
     * 6. ENVIO DE PALPITE
     */
    async submitPrediction(h, a) {
        if (!window.activeGame) return false;
        const username = localStorage.getItem('goalDash_username');
        const payload = {
            matchId: window.activeGame.id,
            matchName: `${window.activeGame.home} vs ${window.activeGame.away}`,
            username: username,
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
        } catch (e) { return false; }
    }
};

window.GD_API = GD_API;
window.fetchMatches = (id) => GD_API.fetchMatches(id);