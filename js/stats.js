const API_KEY = 'af7afc4eab9aa5ab16421caefd7aea25';
const BASE_LOGO_URL = 'https://media.api-sports.io/football/';
const BASE_URL = 'https://api.sportsgameodds.com/v2'

const popularTeams = [
    { name: 'Real Madrid', id: 541 }, { name: 'Barcelona', id: 529 },
    { name: 'Man. City', id: 50 }, { name: 'Liverpool', id: 40 },
    { name: 'Bayern Munich', id: 157 }, { name: 'Paris SG', id: 85 },
    { name: 'Benfica', id: 211 }, { name: 'Sporting CP', id: 212 },
    { name: 'FC Porto', id: 217 }, { name: 'Flamengo', id: 127 },
    { name: 'Palmeiras', id: 121 }, { name: 'Al Nassr', id: 2939 }
];

document.addEventListener('DOMContentLoaded', () => {
    renderPopularTeams();
    setupSearch();
});

function renderPopularTeams() {
    const grid = document.getElementById('popular-teams-grid');
    if (!grid) return;

    grid.innerHTML = popularTeams.map(team => `
        <div onclick="fetchTeamFullStats(${team.id})" 
             class="group bg-white/5 border border-white/5 p-4 md:p-6 rounded-3xl flex flex-col items-center gap-4 hover:border-purple-500/50 hover:bg-purple-500/5 transition-all duration-500 cursor-pointer shadow-xl">
            <div class="relative">
                <div class="absolute inset-0 rounded-full blur-xl opacity-0 group-hover:opacity-40 bg-purple-600 transition-opacity"></div>
                <img src="${BASE_LOGO_URL}/teams/${team.id}.png" class="w-12 h-12 md:w-16 md:h-16 object-contain relative z-10" alt="${team.name}">
            </div>
            <span class="text-[10px] font-black text-gray-500 uppercase tracking-widest group-hover:text-white transition-colors text-center">
                ${team.name}
            </span>
        </div>
    `).join('');
}

function setupSearch() {
    const input = document.getElementById('teams-search');
    input.addEventListener('keypress', async (e) => {
        if (e-key === 'Enter' && e.target.value.length > 2) {
            searchTeamByName(e.target.value)
        }
    });
}

async function searchTeamByName(query) {
    toggleLoading(true);
    try {
        const response = await fetch(`https://api.sportsgameodds.com/v1/soccer/teams?search=${query}`, {
            headers : {'X-Api-Key' : API_KEY}
        });
        const data = await response.json();

        if (data && data.length > 0) {
            fetchTeamFullStats(data[0].teamID);
        } else {
            alert("Não encontramos esse time no banco de dados, cria!");
            toggleLoading(false);
        }
    } catch (err) {
        console.log("Erro na busca:", err);
        toggleLoading(false);
    }
}

// Pegar resultados e calcular perfomance recente (V, D, E)
async function fetchTeamFullStats(teamID) {
    toggleLoading(true);
    try {
        const url = `${BASE_URL}/events?apiKey=${API_KEY}&teamID=${teamID}&ended=true&limit=5`

        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`Erro ${response.status}: Verifique se o ID ${teamID} existe na v2.`)
        }

        const result = await response.json();

        const matches = result.data || [];

        if (matches.length === 0) {
            console.warn("Nenhum jogo finalizado encontrado para este time.");
            return;
        }

        // Mapeamento dos últimos 5 jogos
        const games = matches.slice(0, 5);

        const formArray = games.map(game => {
            const homeID = game.homeID || game.teams?.home?.id;
            const hScore = game.homeScore ?? game.scores?.home;
            const aScore = game.awayScore ?? game.scores?.away;

            const isHome = homeID == teamID;
            const teamScore = isHome ? hScore : aScore  ;
            const oppScore = isHome ? aSCORE : hScore;

            if (teamScore > oppScore) return 'V';
            if (teamScore < oppScore) return 'D';
            return 'E';
        });

        const firstMatch = games[0];
        const teamName = (firstMatch.teams?.home?.id == teamID)
            ? (firstMatch.teams?.home?.names?.medium || firstMatch.homeName)
            : (firstMatch.teams?.away?.names?.medium || firstMatch.awayName);

        renderDashboard({
            id: teamID,
            name: teamName || "Equipe",
            league: firstMatch.leagueName || "Liga",
            form: formArray
        });
        } catch (err) {
            console.error("Erro no status: ", err);
            alert("Erro ao carregar dados. Verifique o console.");
        } finally {
            toggleLoading(false);
        }
    }

// Renderização do Dashboard
function renderDashboard(data) {
    const resultsContainer = document.getElementById('search-results');
    document.getElementById('initial-view').classList.add('hidden');
    resultsContainer.classList.remove('hidden');

    resultsContainer.innerHTML = `
        <button onclick="location.reload()" class="mb-8 text-purple-400 font-bold flex items-center gap-2 hover:text-white transition-colors">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M15 19I-7-7 7-7"/></svg>
            VOLTAR
        </button>

        <div class="flex flex-col md:flex-row items-center gap-8 bg-white/5 p-8 md:p-12 rounded-[2rem] border border-white/10 mb-8 backdrop-blur-xl shadow-2xl">
            <img src="${BASE_LOGO_URL}${data.id}.png" class="w-24 h-25 md:w-32 md:h-32 object-contain" alt="Logo">
            <div class="text-center md:text-left">
                <h2 class="text-4xl md:text-7xl uppercase italic tracking-tighter leading-none mb-4">${data.name}</h2>
                <div clas="flex flex-wrap justify-center md:justify-start gap-4 text-gray-400 text-xs font-black uppercase tracking-widest">
                    <span class="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-full border border-white/5">🏆 ${data.league}</span>
                    <span class="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-full border border-white/5">🆔 ${data.id}</span>
                </div>
            </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div class="bg-black/30 p-8 rounded-[2rem] border border-white/5">
                <h3 class="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] mb-8">Forma Recente</h3>
                <div class="flex gap-3 justify-center md:justify-start">
                    ${data.form.map(res => {
                        let color = res === 'V' ? 'bg-green-500' : res === 'D' ? 'bg-red-500' : 'bg-gray-500';
                        return `<div class="${color} w-12 h-12 rounded-full flex items-center justify-center font-black text-white shadow-lg shadow-${color}/20 text-lg">${res}</div>`;
                    }).join('')}
                </div>
            </div>
        </div>

        <div class="bg-black/30 p-8 rounded-[2rem] border border-white/5 flex items-center justify-between">
            <div>
                <h3 class="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] mb-2">Status</h3>
                <p class="text-3xl font-bold text-purple-400 font-mono tracking-tighter uppercase italic">Análise Ativa</p>
            </div>
            <div class="text-right">
                <p class="text-sm text-gray-500 font-black uppercase mb-1">Confiança</p>
                <p class="text-4xl font-bold font-mono">98%</p>
            </div>
        </div>
    `;   
}

function toggleLoading(show) {
    const input = document.getElementById('teams-search');
    if (input) {
        input.style.opacity = show ? "0.5" : "1";
        input.placeholder = show ? "Carregando dados..." : "Pesquise seu time...";
    }
};
