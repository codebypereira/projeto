/**
 * GoalDash - SISTEMA CENTRAL (api.js)
 * FOCO: Chamadas de API e Tratamento de Dados para a UI.
 */

const CONFIG = {
    API_KEY: 'cc48942721f415ae287937399dd882c7',
    MOCK_API: 'https://696278a1d9d64c761907fe9a.mockapi.io/api/dash/predictions'
};

// Estado Global
window.allLoadedMatches = [];
window.activeGame = null;     
window.currentLeague = 'UEFA_CHAMPIONS_LEAGUE';

const GD_API = {
    /**
     * Busca os jogos e formata a data/hora para o visual do print.
     */
    async fetchMatches(leagueID = null) {
        if (leagueID) window.currentLeague = leagueID;

        if (window.UI && window.UI.showLoading) {
            window.UI.showLoading('matches-container');
        }

        try {
            // Usa o parâmetro oddsAvailable=true que você confirmou que funciona
            const url = `https://api.sportsgameodds.com/v2/events?apiKey=${CONFIG.API_KEY}&leagueID=${window.currentLeague}&oddsAvailable=true`;
            
            const response = await fetch(url);
            const result = await response.json();
            const data = result.data || [];

            // Tratamento de dados para garantir o visual do seu print
            window.allLoadedMatches = data.map(m => {
                const rawDate = m.status?.startsAt || m.startsAt;
                let day = "--/--";
                let time = "--:--";

                if (rawDate) {
                    const gameDate = new Date(rawDate);
                    if (!isNaN(gameDate.getTime())) {
                        day = gameDate.toLocaleDateString('pt-PT', { day: '2-digit', month: '2-digit' });
                        time = gameDate.toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' });
                    }
                }

                return {
                    ...m,
                    displayDay: day,    // Criado para o ui.js usar
                    displayTime: time   // Criado para o ui.js usar
                };
            });

            // Envia para renderizar no ui.js
            if (window.UI && window.UI.renderMatches) {
                window.UI.renderMatches('matches-container', window.allLoadedMatches);
            }
        } catch (error) {
            console.error("Erro ao carregar jogos:", error);
        }
    },

    /**
     * Lógica de envio de palpite
     */
    async submitPrediction(h, a) {
        if (!window.activeGame) return;
        const payload = {
            matchId: `${window.activeGame.home} vs ${window.activeGame.away}`,
            username: localStorage.getItem('goalDash_username'),
            Winner: h > a ? window.activeGame.home : (a > h ? window.activeGame.away : "Empate"),
            homeScore: parseInt(h),
            awayScore: parseInt(a),
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

// Resolve o erro "ReferenceError: fetchTeamFullStats is not defined" do seu console
window.fetchTeamFullStats = () => console.log("Função de stats chamada, mas não implementada.");

// Exposição Global
window.GD_API = GD_API;
window.fetchMatches = (id) => GD_API.fetchMatches(id);