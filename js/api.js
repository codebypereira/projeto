/**
 * GoalDash - SISTEMA CENTRAL DE DADOS (api.js)
 * ========================================================
 * Este módulo orquestra toda a comunicação entre o front-end 
 * e os serviços externos (SportsGameOdds API e MockAPI).
 * * Responsabilidades:
 * - Consumo de dados desportivos em tempo real.
 * - Gestão de persistência de utilizadores e palpites.
 * - Lógica de validação de resultados (Greens/Reds).
 * * @version 2.5.0 - Master Edition
 * @author GoalDash Academic Project
 */

/**
 * Configurações globais de Endpoints e Credenciais
 * @constant {Object}
 */
window.CONFIG = {
    API_KEY: 'cc48942721f415ae287937399dd882c7',
    MOCK_API_PREDICTIONS: 'https://696278a1d9d64c761907fe9a.mockapi.io/api/dash/predictions',
    MOCK_API_USERS: 'https://696278a1d9d64c761907fe9a.mockapi.io/api/dash/users',
    BASE_URL_V2: 'https://api.sportsgameodds.com/v2'
};

/** @global {Array} allLoadedMatches - Cache em memória dos jogos carregados na sessão atual */
window.allLoadedMatches = [];
/** @global {Object|null} activeGame - Referência ao jogo selecionado para detalhe ou palpite */
window.activeGame = null;    
/** @global {string} currentLeague - Identificador da liga ativa no contexto global */
window.currentLeague = 'EPL';
/** @global {Object} previousScores - Histórico temporário para deteção de alterações de placar */
window.previousScores = {}; 

const GD_API = {

    /**
     * 1. BUSCA DE JOGOS ATIVOS/AGENDADOS
     * Obtém os próximos eventos de uma liga específica e normaliza os dados.
     * * @async
     * @param {string|null} leagueID - ID da liga (ex: 'EPL'). Se nulo, utiliza a liga atual.
     * @returns {Promise<Array>} Lista de objetos de jogo formatados.
     */
    async fetchMatches(leagueID = null) {
        if (leagueID) window.currentLeague = leagueID;

        // Ativa indicador visual de carregamento (Spinner)
        if (window.UI && window.UI.showLoading) {
            const loaderId = document.getElementById('live-matches-container') ? 'live-matches-container' : 'matches-container';
            window.UI.showLoading(loaderId);
        }

        try {
            const url = `${window.CONFIG.BASE_URL_V2}/events?apiKey=${window.CONFIG.API_KEY}&leagueID=${window.currentLeague}&oddsAvailable=true`;
            const response = await fetch(url);
            const result = await response.json();
            const data = result.data || [];

            // Normalização do objeto da API para a estrutura interna do GoalDash
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

            console.log(`✅ [API] ${window.allLoadedMatches.length} jogos carregados.`);
            
            if (window.UI && window.UI.renderMatches) {
                window.UI.renderMatches('matches-container', window.allLoadedMatches);
            }

            return window.allLoadedMatches;

        } catch (error) {
            console.error("🚨 [API] Erro ao carregar jogos:", error);
            return [];
        }
    },

    /**
     * 2. BUSCA DE PARTIDAS TERMINADAS (HISTÓRICO)
     * Recupera jogos finalizados com filtros avançados de data e equipa.
     * * @async
     * @param {string} leagueID - ID da liga para filtrar.
     * @param {string} startsAfter - Data inicial (ISO String).
     * @param {string} startsBefore - Data final (ISO String).
     * @param {number} teamID - ID específico da equipa (opcional).
     * @returns {Promise<Array>}
     */
    async fetchEndedMatches(leagueID = null, startsAfter = null, startsBefore = null, teamID = null) {
        try {
            const dateAfter = startsAfter ? startsAfter.substring(0, 10) : "";
            const dateBefore = startsBefore ? startsBefore.substring(0, 10) : "";

            let url = `${window.CONFIG.BASE_URL_V2}/events?apiKey=${window.CONFIG.API_KEY}&limit=100`;

            if (teamID) url += `&teamID=${teamID}`;

            if (leagueID && leagueID !== "ALL") {
                url += `&leagueID=${leagueID}`;
            } else if (!leagueID && window.currentLeague) {
                url += `&leagueID=${window.currentLeague}`;
            }

            if (dateAfter) url += `&startsAfter=${dateAfter}`;
            if (dateBefore) url += `&startsBefore=${dateBefore}`;

            console.log(`📡 [API] Chamada Híbrida: ${leagueID || 'Geral'} | Time: ${teamID}`);

            const response = await fetch(url);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            
            const result = await response.json();
            return result.data || result || [];
        } catch (error) {
            console.error("🚨 [API] Erro na busca do histórico:", error);
            return [];
        }
    },

    /**
     * 3. BUSCA DE EQUIPA POR NOME
     * Utilitário para localizar o teamID de uma equipa na memória local.
     * * @param {string} name - Nome da equipa.
     * @returns {string} O ID da equipa encontrado ou um ID gerado como fallback.
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
     * 4. ESTATÍSTICAS E FORMA RECENTE
     * Calcula o desempenho (V, E, D) dos últimos 5 jogos de uma equipa.
     * * @async
     * @param {string} teamID - Identificador único da equipa.
     * @param {string} leagueID - Liga para contexto da busca.
     * @returns {Promise<Object|null>} Objeto com forma, nome e histórico.
     */
    async fetchTeamFullStats(teamID, leagueID = null) {
        try {
            const league = leagueID || window.currentLeague;
            const url = `${window.CONFIG.BASE_URL_V2}/events?apiKey=${window.CONFIG.API_KEY}&teamID=${teamID}&leagueID=${league}&finalized=true&limit=8`;
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
            console.error("🚨 [API] Erro nas stats:", err);
            return null;
        }
    },

    /**
     * 5. AUTENTICAÇÃO - LOGIN
     * Verifica credenciais no MockAPI.
     * * @async
     * @param {string} username - Nome de utilizador ou Email.
     * @param {string} password - Palavra-passe.
     * @returns {Promise<Object>} Resposta de sucesso ou erro.
     */
    async loginUser(username, password) {
        try {
            const response = await fetch(window.CONFIG.MOCK_API_USERS);
            const users = await response.json();
            const user = users.find(u => u.username.toLowerCase() === username.toLowerCase() || u.email.toLowerCase() === username.toLowerCase());
            if (user && user.password === password) return { success: true, username: user.username };
            return { success: false, error: "Credenciais inválidas!" };
        } catch (e) { return { success: false, error: "Erro na ligação." }; }
    },

    /**
     * 5.1 AUTENTICAÇÃO - REGISTO
     * Cria um novo utilizador no MockAPI.
     * * @async
     * @param {Object} userData - Dados do novo utilizador.
     */
    async registerUser(userData) {
        try {
            const response = await fetch(window.CONFIG.MOCK_API_USERS);
            const users = await response.json();
            if (users.some(u => u.username.toLowerCase() === userData.username.toLowerCase())) return { success: false, error: "Nome já existe!" };
            const createRes = await fetch(window.CONFIG.MOCK_API_USERS, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(userData)
            });
            return createRes.ok ? { success: true } : { success: false, error: "Erro ao salvar." };
        } catch (error) { return { success: false, error: "Falha de conexão." }; }
    },

    /**
     * 6. SUBMISSÃO DE PALPITE
     * Regista a previsão do utilizador para um jogo específico.
     * * @async
     * @param {number|string} h - Gols equipa casa.
     * @param {number|string} a - Gols equipa fora.
     */
    async submitPrediction(h, a) {
        if (!window.activeGame) {
            console.error("❌ [API] Nenhum jogo ativo para palpitar!");
            return false;
        }

        const game = window.activeGame;
        const hName = game.teams?.home?.names?.long || game.home || "Time Casa";
        const aName = game.teams?.away?.names?.long || game.away || "Time Fora";
        const mId = game.eventID || game.id;

        const payload = {
            matchId: String(mId), 
            matchName: `${hName} vs ${aName}`,
            homeTeam: hName, 
            awayTeam: aName,
            username: localStorage.getItem('goalDash_username'),
            homeScore: parseInt(h),
            awayScore: parseInt(a),
            status: "pendente",
            createdAt: new Date().toISOString()
        };

        try {
            const res = await fetch(window.CONFIG.MOCK_API_PREDICTIONS, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                console.log("%c ✅ [API] PALPITE ENVIADO!", "color: #10b981; font-weight: bold;");
                return true;
            }
            return false;
        } catch (e) { 
            console.error("🚨 [API] Erro ao enviar palpite:", e);
            return false; 
        }
    },

    /**
     * 7. CONFERÊNCIA AUTOMÁTICA DE GREENS
     * Compara os palpites pendentes do utilizador com os resultados reais 
     * dos últimos 15 dias e atualiza o estado para 'green' ou 'red'.
     * * @async
     */
    async checkMyGreens() {
        console.log("🚀 [System] Verificando Green/Red...");
        try {
            const resPred = await fetch(window.CONFIG.MOCK_API_PREDICTIONS);
            const allPreds = await resPred.json();
            const username = localStorage.getItem('goalDash_username');
            if (!username) return;

            const myPending = allPreds.filter(p => p.username === username && p.status === "pendente");
            if (myPending.length === 0) return console.log("✅ [System] Nada pendente.");

            // Filtro temporal para otimização da chamada
            const dataLimite = new Date();
            dataLimite.setDate(dataLimite.getDate() - 15);
            const startsAfter = dataLimite.toISOString().split('T')[0];

            const urlReal = `${window.CONFIG.BASE_URL_V2}/events?apiKey=${window.CONFIG.API_KEY}&leagueID=${window.currentLeague}&finalized=true&startsAfter=${startsAfter}&limit=50`;
            
            const resReal = await fetch(urlReal);
            const realData = await resReal.json();
            const finishedMatches = realData.data || [];

            for (let palpite of myPending) {
                const jogoReal = finishedMatches.find(m => String(m.eventID) === String(palpite.matchId));

                if (jogoReal) {
                    const rH = jogoReal.status?.score?.home ?? 0;
                    const rA = jogoReal.status?.score?.away ?? 0;
                    
                    const isGreen = (palpite.homeScore === rH && palpite.awayScore === rA);
                    const newStatus = isGreen ? "green" : "red";
                    
                    console.log(`🎯 [System] Processado: ${palpite.matchName} -> ${newStatus.toUpperCase()}`);

                    await fetch(`${window.CONFIG.MOCK_API_PREDICTIONS}/${palpite.id}`, {
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
            
            console.log("🏁 [System] Greens atualizados!");
            
            if (window.UI && window.UI.renderUserStats) {
                window.UI.renderUserStats();
            }

        } catch (e) { 
            console.error("🚨 [System] Erro no checkGreens:", e); 
        }
    }
};

/**
 * Exposição Global dos Métodos
 */
window.GD_API = GD_API;
window.fetchMatches = (id) => GD_API.fetchMatches(id);