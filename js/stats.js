const API_KEY = 'af7afc4eab9aa5ab16421caefd7aea25';
const BASE_URL = 'https://media.api-sports.io/football';

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
                <img src="${BASE_URL}/teams/${team.id}.png" class="w-12 h-12 md:w-16 md:h-16 object-contain relative z-10" alt="${team.name}">
            </div>
            <span class="text-[10px] font-black text-gray-500 uppercase tracking-widest group-hover:text-white transition-colors text-center">
                ${team.name}
            </span>
        </div>
    `).join('');
}

function setupSearch() {
    const input = document.getElementById('team-search');
    input.addEventListener('keypress', async (e) => {
        if (e-key === 'Enter') {
            const query = e.target.value;
            if (query.length > 2) searchTeamByName(query);
        }
    });
}

async function searchTeamByName(name) {
    toggleLoading(true);
}