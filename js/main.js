/**
 * GoalDash - ORQUESTRADOR (main.js)
 */

// 1. Esta função liga os botões do HTML à lógica da API
window.fetchMatches = async (leagueId, leagueName) => {
    // Atualiza o título visual
    const titleElement = document.getElementById('current-league-title');
    if (titleElement) {
        titleElement.innerText = leagueName ? leagueName.toUpperCase() : "LIGA SELECIONADA";
    }

    // Chama o objeto correto que está no teu api.js
    if (window.GD_API && window.GD_API.fetchMatches) {
        await window.GD_API.fetchMatches(leagueId, leagueName);
    } else {
        console.error("Erro: GD_API não foi encontrado. Verifica se o api.js carregou.");
    }
};

document.addEventListener('DOMContentLoaded', () => {
    // Dá um tempo de 500ms para garantir que todos os scripts carregaram
    setTimeout(() => {
        if (window.GD_API && window.GD_API.fetchMatches) {
            window.GD_API.fetchMatches('EPL', 'Premier League');
        }
    }, 500);
});

// Função global para os botões do menu
window.fetchMatches = (id, name) => {
    if (window.GD_API) window.GD_API.fetchMatches(id, name);
};
// Esta função é o que os botões do menu lateral chamam
window.fetchMatches = (id, name) => {
    if (window.GD_API && window.GD_API.fetchMatches) {
        window.GD_API.fetchMatches(id, name);
    }
};