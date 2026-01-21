/**
 * GoalDash - SISTEMA CENTRAL (api.js)
 * FOCO: Chamadas de API e Tratamento de Dados para a UI.
 */

// CONFIG agora é global para ser acessado por todas as funções
window.CONFIG = {
    API_KEY: 'cc48942721f415ae287937399dd882c7',
    MOCK_API: 'https://696278a1d9d64c761907fe9a.mockapi.io/api/dash/predictions'
};

// Estado Global
window.allLoadedMatches = [];
window.activeGame = null;     
window.currentLeague = 'EPL';
window.previousScores = {}; // Armazena placares para o efeito de flash

const GD_API = {
    /**
     * Busca os jogos e formata a data/hora para o visual do sistema.
     */
    async fetchMatches(leagueID = null) {
        if (leagueID) window.currentLeague = leagueID;

        if (window.UI && window.UI.showLoading) {
            window.UI.showLoading('matches-container');
        }

        try {
            const url = `https://api.sportsgameodds.com/v2/events?apiKey=${window.CONFIG.API_KEY}&leagueID=${window.currentLeague}&oddsAvailable=true`;
            
            const response = await fetch(url);
            const result = await response.json();
            const data = result.data || [];

            window.allLoadedMatches = data.map(m => {
                const rawDate = m.status?.startsAt || m.startsAt;
                let day = "--/--", time = "--:--";

                if (rawDate) {
                    const gameDate = new Date(rawDate);
                    if (!isNaN(gameDate.getTime())) {
                        day = gameDate.toLocaleDateString('pt-PT', { day: '2-digit', month: '2-digit' });
                        time = gameDate.toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' });
                    }
                }

                return {
                    ...m,
                    displayDay: day,
                    displayTime: time
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
     * Lógica de envio de palpite para a MockAPI
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
            const res = await fetch(window.CONFIG.MOCK_API, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            return res.ok;
        } catch (e) { return false; }
    }
};

/**
 * GESTÃO DE JOGOS AO VIVO (LIVE)
 */

window.fetchLiveMatches = async function(leagueID = 'LA_LIGA') {
    const container = document.getElementById('live-matches-container');
    if (!container) return;

    try {
        const url = `https://api.sportsgameodds.com/v2/events?apiKey=${window.CONFIG.API_KEY}&leagueID=${leagueID}&live=true`;
        const response = await fetch(url);
        const result = await response.json();
        
        console.log("🔍 Diagnóstico Live:", result);

        // Filtra apenas eventos com status live ativo
        const liveMatches = (result.data || []).filter(m => m.status && m.status.live === true);

        if (liveMatches.length === 0) {
            container.innerHTML = `<p class="text-white/40 col-span-full text-center py-20 font-black uppercase italic tracking-widest">Sem jogos live no momento para esta liga.</p>`;
            return;
        }

        // Envia para o renderizador no ui.js
        if (window.UI && window.UI.renderLiveCards) {
            window.UI.renderLiveCards(liveMatches);
        }
    } catch (error) {
        console.error("Erro na API Live:", error);
    }
};

/**
 * Troca de liga e reinicializa o rastreio de placares
 */
window.changeSport = function(leagueID) {
    console.log("🏆 Trocando para a liga:", leagueID);
    window.previousScores = {}; 
    window.fetchLiveMatches(leagueID);
};

// Exposição Global de utilitários
window.fetchTeamFullStats = () => console.log("Módulo de estatísticas detalhadas em desenvolvimento.");
window.GD_API = GD_API;
window.fetchMatches = (id) => GD_API.fetchMatches(id);