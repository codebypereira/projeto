/**
 * GoalDash - SISTEMA CENTRAL (api.js)
 * Versão Final: Com validações de duplicados e mensagens personalizadas.
 */

const CONFIG = {
    API_KEY: 'cc48942721f415ae287937399dd882c7',
    // URLs da tua MockAPI (Confirmados pelas imagens)
    MOCK_API_PREDICTIONS: 'https://696278a1d9d64c761907fe9a.mockapi.io/api/dash/predictions',
    MOCK_API_USERS: 'https://696278a1d9d64c761907fe9a.mockapi.io/api/dash/users'
};

// Estado Global da Aplicação
window.allLoadedMatches = [];
window.activeGame = null;     
window.currentLeague = 'UEFA_CHAMPIONS_LEAGUE';

const GD_API = {

    /**
     * 1. BUSCA DE JOGOS (API de Futebol)
     */
    async fetchMatches(leagueID = null) {
        if (leagueID) window.currentLeague = leagueID;

        // Mostra o loading se a UI permitir
        if (window.UI && window.UI.showLoading) {
            window.UI.showLoading('matches-container');
        }

        try {
            const url = `https://api.sportsgameodds.com/v2/events?apiKey=${CONFIG.API_KEY}&leagueID=${window.currentLeague}&oddsAvailable=true`;
            const response = await fetch(url);
            const result = await response.json();
            const data = result.data || [];

            // Formata as datas para PT-PT
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

            // Renderiza no ecrã
            if (window.UI && window.UI.renderMatches) {
                window.UI.renderMatches('matches-container', window.allLoadedMatches);
            }
        } catch (error) {
            console.error("Erro ao carregar jogos:", error);
        }
    },
// ... dentro do objeto GD_API ...
async loginUser(username, password) {
    try {
        const response = await fetch(CONFIG.MOCK_API_USERS);
        const users = await response.json();

        // Procura utilizador por nome ou email
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

    /**
     * 2. REGISTO BLINDADO (Valida antes de criar)
     */
    async registerUser(userData) {
        try {
            // --- VALIDAÇÃO 1: Senha Curta ---
            if (userData.password.length < 8) {
                return { success: false, error: "A palavra-passe deve ter pelo menos 8 caracteres." };
            }

            // --- VALIDAÇÃO 2: Verificar Duplicados na API ---
            // Primeiro, baixamos a lista de quem já existe
            const response = await fetch(CONFIG.MOCK_API_USERS);
            if (!response.ok) return { success: false, error: "Erro ao conectar com o servidor." };
            
            const users = await response.json();

           const nameExists = users.some(u => u.username.toLowerCase() === userData.username.toLowerCase());
const emailExists = users.some(u => u.email.toLowerCase() === userData.email.toLowerCase());

// NOVA LÓGICA DE MENSAGENS
if (nameExists && emailExists) {
    return { success: false, error: "Nome e email já utilizados!" };
}
if (nameExists) {
    return { success: false, error: "Nome de utilizador já está em uso!" };
}
if (emailExists) {
    return { success: false, error: "Este e-mail já está registado!" };
}
            // --- VALIDAÇÃO 3: CRIAÇÃO REAL ---
            // Se chegou aqui, é seguro criar.
            const createRes = await fetch(CONFIG.MOCK_API_USERS, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(userData)
            });

            if (createRes.ok) {
                return { success: true };
            } else {
                return { success: false, error: "Erro ao salvar o registo." };
            }

        } catch (error) {
            console.error("Erro técnico:", error);
            return { success: false, error: "Falha de conexão à internet." };
        }
    },

    /**
     * 3. ENVIO DE PALPITE (Apostas)
     */
    async submitPrediction(h, a) {
        if (!window.activeGame) {
            console.error("Nenhum jogo selecionado.");
            return false;
        }

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
            
            return res.ok; // Retorna true se deu certo
        } catch (e) {
            console.error("Erro ao enviar palpite:", e);
            return false;
        }
    }
};
const params = new URLSearchParams(window.location.search);
const gameId = params.get('id');

if (gameId && window.GD_API) {
    // Aqui chamarias a tua função da API para carregar esse jogo específico
    console.log("A carregar dados do jogo ID:", gameId);
}

// EXPOSIÇÃO GLOBAL (Para o main.js conseguir usar)
window.GD_API = GD_API;
window.fetchMatches = (id) => GD_API.fetchMatches(id);