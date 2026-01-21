/**
 * GoalDash - ORQUESTRADOR (main.js)
 * Função: Ligar os eventos do HTML às funções da API e UI.
 */

// 1. Inicialização Geral quando o site carrega
document.addEventListener('DOMContentLoaded', () => {
    // Busca inicial para não deixar a tela vazia
    if (window.fetchMatches) {
        window.fetchMatches('EPL', 'Premier League');
    }

    // Se estivermos na página de estatísticas, carrega os times populares
    if (document.getElementById('popular-teams-grid')) {
        window.UI.renderPopularTeams();
    }

    // Configura a barra de pesquisa se ela existir
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => window.handleSearch(e.target.value));
    }
});

// 2. Função global para os botões do menu lateral e ligas
window.fetchMatches = async (leagueId, leagueName) => {
    // Atualiza o título visual no topo
    const titleElement = document.getElementById('current-league-title');
    if (titleElement) {
        titleElement.innerText = leagueName ? leagueName.toUpperCase() : "LIGA SELECIONADA";
    }

    // Chama o núcleo da API que agora está isolado no api.js
    if (window.GD_API && window.GD_API.fetchMatches) {
        await window.GD_API.fetchMatches(leagueId, leagueName);
    }
};

// 3. Lógica de Pesquisa (Filtra o que já foi carregado no window)
window.handleSearch = (query) => {
    // Pegamos a lista que o api.js salvou no objeto global window
    const matches = window.allLoadedMatches || [];
    
    if (!query.trim()) {
        window.UI.renderMatches('matches-container', matches);
        return;
    }

    const filtrados = matches.filter(m => {
        const home = (m.teams?.home?.names?.medium || "").toLowerCase();
        const away = (m.teams?.away?.names?.medium || "").toLowerCase();
        const q = query.toLowerCase();
        return home.includes(q) || away.includes(q);
    });

    window.UI.renderMatches('matches-container', filtrados);
};

// 4. Atalho para mudar esporte/liga (usado no menu)
window.changeSport = (id, name) => {
    window.fetchMatches(id, name);
};