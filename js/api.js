/**
 * GoalDash - SISTEMA CENTRAL (api.js)
 * Versão Master: Conectividade UI + Greens + Auth
 */

const CONFIG = {
    API_KEY: 'cc48942721f415ae287937399dd882c7',
    MOCK_API_PREDICTIONS: 'https://696278a1d9d64c761907fe9a.mockapi.io/api/dash/predictions',
    MOCK_API_USERS: 'https://696278a1d9d64c761907fe9a.mockapi.io/api/dash/users',
    BASE_URL_V2: 'https://api.sportsgameodds.com/v2'
};

// Estado Global da Aplicação
window.allLoadedMatches = [];
window.activeGame = null;     
window.currentLeague = 'UEFA_CHAMPIONS_LEAGUE';

const GD_API = {

    /**
     * 1. BUSCA DE JOGOS ATIVOS
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
                const hID = m.teams?.home?.teamID || m.homeTeamID || "SEM_ID";
                const aID = m.teams?.away?.teamID || m.awayTeamID || "SEM_ID";
                const leagueName = m.league?.names?.medium || "Liga";
                const hName = m.teams?.home?.names?.medium || "Equipa Casa";
                const aName = m.teams?.away?.names?.medium || "Equipa Fora";

                const rawDate = m.status?.startsAt || m.startsAt;
                let day = "--/--", time = "--:--";

                if (rawDate) {
                    const d = new Date(rawDate);
                    if (!isNaN(d.getTime())) {
                        day = d.toLocaleDateString('pt-PT', { day: '2-digit', month: '2-digit' });
                        time = d.toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' });
                    }
                }

                return { 
                    ...m, 
                    eventID: m.eventID || m.id,
                    homeName: hName,
                    awayName: aName,
                    homeID: hID, 
                    awayID: aID,
                    leagueName: leagueName,
                    displayDay: day, 
                    displayTime: time 
                };
            });

            console.log(`✅ ${window.allLoadedMatches.length} jogos carregados.`);
            
            if (window.UI && window.UI.renderMatches) {
                window.UI.renderMatches('matches-container', window.allLoadedMatches);
            }

            return window.allLoadedMatches;

        } catch (error) {
            console.error("Erro ao carregar jogos:", error);
            return [];
        }
    },

    /**
     * 2. BUSCA DE PARTIDAS TERMINADAS (COM FILTRO DE DATA)
     */
    async fetchEndedMatches(leagueID = null, startsAfter = null, startsBefore = null) {
        try {
            // 1. Limpa as datas para o formato YYYY-MM-DD (mais seguro para evitar erro 400)
            // Se a data vier completa, pegamos só os primeiros 10 caracteres
            const dateAfter = startsAfter ? startsAfter.substring(0, 10) : "";
            const dateBefore = startsBefore ? startsBefore.substring(0, 10) : "";

            let url = `${CONFIG.BASE_URL_V2}/events?apiKey=${CONFIG.API_KEY}&finalized=true`;

            if (leagueID || window.currentLeague) {
                url += `&leagueID=${leagueID || window.currentLeague}`;
            }

            // Adiciona apenas se houver data, usando o formato simples
            if (dateAfter) url += `&startsAfter=${dateAfter}`;
            if (dateBefore) url += `&startsBefore=${dateBefore}`;

            console.log("📡 [API] Tentando URL Simplificada:", url);

            const response = await fetch(url);
            
            if (!response.ok) {
                console.error("❌ Erro na API (Status):", response.status);
                return [];
            }

            const result = await response.json();
            // Garante que retorne a lista de jogos
            return result.data || result || [];
        } catch (error) {
            console.error("🚨 Erro ao buscar jogos:", error);
            return [];
        }
    },

    /**
     * 3. BUSCA DE EQUIPA POR NOME
     */
    searchTeamByName: async (name) => {
        const searchTerm = name.toLowerCase().trim();
        const matches = window.allLoadedMatches || [];

        for (const m of matches) {
            const home = m.teams?.home;
            const away = m.teams?.away;
            if (home?.names?.medium?.toLowerCase().includes(searchTerm)) return home.teamID;
            if (away?.names?.medium?.toLowerCase().includes(searchTerm)) return away.teamID;
        }
        return searchTerm.toUpperCase().replace(/\s+/g, '_') + "_UEFA_CHAMPIONS_LEAGUE";
    },

    /**
     * 4. ESTATÍSTICAS E FORMA
     */
    async fetchTeamFullStats(teamID, leagueID = null) {
        try {
            const league = leagueID || window.currentLeague;
            const url = `${CONFIG.BASE_URL_V2}/events?apiKey=${CONFIG.API_KEY}&teamID=${teamID}&leagueID=${league}&finalized=true&limit=8`;
            const response = await fetch(url);
            const result = await response.json();
            const matches = result.data || [];

            if (matches.length === 0) return { name: "Equipa", league: "Liga", form: [], history: [] };

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
                    const win = (m.teams.home.id == teamID ? hS > aS : aS > hS);
                    return win ? 'V' : 'D';
                }),
                history: matches.map(m => ({
                    eventID: m.eventID,
                    homeTeam: m.teams.home.names.medium,
                    awayTeam: m.teams.away.names.medium,
                    homeScore: m.status?.score?.home ?? 0,
                    awayScore: m.status?.score?.away ?? 0,
                    date: m.status?.startsAt || m.startsAt
                }))
            };
        } catch (err) {
            console.error("Erro nas stats:", err);
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
            const user = users.find(u => u.username.toLowerCase() === username.toLowerCase() || u.email.toLowerCase() === username.toLowerCase());
            if (user && user.password === password) return { success: true, username: user.username };
            return { success: false, error: "Credenciais inválidas!" };
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
        const payload = {
            matchId: window.activeGame.id,
            matchName: `${window.activeGame.home} vs ${window.activeGame.away}`,
            username: localStorage.getItem('goalDash_username'),
            homeScore: parseInt(h),
            awayScore: parseInt(a),
            status: "pendente",
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
    },

    /**
     * 7. CONFERÊNCIA AUTOMÁTICA DE GREENS
     */
    async checkMyGreens() {
        console.log("🚀 Verificando Green/Red (Filtro Recentes)...");
        try {
            const resPred = await fetch(CONFIG.MOCK_API_PREDICTIONS);
            const allPreds = await resPred.json();
            const username = localStorage.getItem('goalDash_username');
            if (!username) return;

            const myPending = allPreds.filter(p => p.username === username && p.status === "pendente");
            if (myPending.length === 0) return console.log("✅ Nada pendente para conferir.");

            // FILTRAGEM DE DATA: Pegar jogos de no máximo 15 dias atrás
            const dataLimite = new Date();
            dataLimite.setDate(dataLimite.getDate() - 15);
            const startsAfter = dataLimite.toISOString().split('T')[0]; // Formato YYYY-MM-DD

            // Fetch com startsAfter para ignorar 2024/2025
            const urlReal = `${CONFIG.BASE_URL_V2}/events?apiKey=${CONFIG.API_KEY}&leagueID=${window.currentLeague}&finalized=true&startsAfter=${startsAfter}&limit=50`;
            
            const resReal = await fetch(urlReal);
            const realData = await resReal.json();
            const finishedMatches = realData.data || [];

            for (let palpite of myPending) {
                const jogoReal = finishedMatches.find(m => m.eventID === palpite.matchId);

                if (jogoReal) {
                    const rH = jogoReal.status?.score?.home ?? 0;
                    const rA = jogoReal.status?.score?.away ?? 0;
                    
                    // Lógica de Green (Placar exato)
                    const isGreen = (palpite.homeScore === rH && palpite.awayScore === rA);
                    const newStatus = isGreen ? "green" : "red";
                    
                    console.log(`🎯 Resultado Processado: ${palpite.matchName} -> ${newStatus.toUpperCase()}`);

                    await fetch(`${CONFIG.MOCK_API_PREDICTIONS}/${palpite.id}`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ 
                            ...palpite, 
                            status: newStatus, 
                            realScore: `${rH}x${rA}` 
                        })
                    });
                }
            }
            
            console.log("🏁 Greens atualizados!");
            
            // Se a UI de stats existir, atualiza ela logo após o check
            if (window.UI && window.UI.renderUserStats) {
                window.UI.renderUserStats();
            }

        } catch (e) { 
            console.error("🚨 Erro no checkGreens:", e); 
        }
    }
};

// Exportação Global
window.GD_API = GD_API;
window.fetchMatches = (id) => GD_API.fetchMatches(id);

// Inicialização Automática ao carregar a página
window.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        GD_API.fetchMatches();
        GD_API.checkMyGreens();
    }, 200);
});