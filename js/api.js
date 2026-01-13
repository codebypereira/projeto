const CONFIG = {
    API_KEY : 'af7afc4eab9aa5ab16421caefd7aea25',
    MOCK_API : 'https://691c83153aaeed735c91269a.mockapi.io/predictions'
};

let currentLeague = 'NBA';
let activeGame = null;

//Função para buscar as partidas

async function fetchMatches(leagueID = null) {
    if (leagueID) currentLeague = leagueID;
    const container = document.getElementById('matches-container');
    const dateInput = document.getElementById('date-picker');
    let selectedDate = dateInput ? dateInput.value: '';

    if (container) container.innerHTML = '<div class="text-white text-center p-10 font-bold animate-pulse">Carregando ODDS e Escudos...</div>';

    try {
        let url = `https://api.sportsgameodds.com/v2/events?apiKey=${CONFIG.API_KEY}&leagueID=${currentLeague}&oddsAvailable=true`;
        if (selectedDate) url+= `&date=${selectedDate}`;

        const response = await fetch(url);
        if (!response.ok) throw new Error(`Erro: ${response.status}`);

        const result = await response.json();
        const events = result.data || [];
        renderMatches(events);
    } catch (error) {
        console.error(`Erro na requisição: ${error}`);
        if (container) container.innerHTML = '<p class="text-red-500 text-center font-bold">Erro ao carregar dados.</p>'
    }
}

//Função para renderizar os cards
function renderMatches(matches) {
    const container = document.getElementById('matches-container');
    if (!container) return;
    container.innerHTML = '';

    if (!matches || matches.length === 0) {
        container.innerHTML = '<p class="text-gray-500 text-center font-bold col-span-full p-10 font-black uppercase text-[10px]">Nenhuma partida encontrada para a liga.</p>'
        return;
    }

    matches.forEach(m => {
        const home = m.teams?.home;
        const away = m.teams?.away;

        const homeName = home?.names?.medium || 'Casa';
        const awayName = away?.names?.medium || 'Fora';

        const homeColor = home?.colors?.primary || '#334155';
        const homeText = home?.colors?.primaryContrast || '#ffffff';

        const awayColor = away?.colors?.primary || '#334155';
        const awayText = away?.color?.primaryContrast || '#ffffff';

        const card = document.createElement('div');
        card.className = "bg-slate-900/50 border border-white/5 p-6 rounded-3xl hover:border-purple-500/50 transition-all group";
        card.innerHTML =`
            <div class="flex items-center justify-between gap-4 mb-8 text-center">
                <div class="flex flex-col items-center flex-1">
                    <div class="w-16 h-16 rounded-2xl mb-3 flex items-center justify-center text-2xl font-black shadow-2xl transition-transform group hover:scale-110 select-none"
                         style="background-color: ${homeColor}; color: ${homeText}; border: 4px solid rgba(255, 255, 255, 0.4)">
                         ${homeName.substring(0, 2).toUpperCase()}
                    </div>
                    <span class="text-[11px] font-black text-white uppercase tracking-tighter">${homeName}</span>
                </div>

                <div class="flex flex-col items-center">
                    <span class="text-slate-500 italic font-black text-xs">VS</span>
                </div>

                <div class="flex flex-col items-center flex-1">
                    <div class="w-16 h-16 rounded-2xl mb-3 flex items-center justify-center text-2xl font-black shadow-2xl transition-transform group hover:scale-110 select-none"
                         style="background-color: ${awayColor}; color: ${awayText}; border: 4px solid rgba(255, 255, 255,0.4)">
                         ${awayName.substring(0, 2).toUpperCase()}
                    </div>
                    <span class="text-[11px] font-black text-white uppercase tracking-tighter">${awayName}</span>
                </div>
            </div>

            <div class="w-full flex justify-center">
                <button onclick="openModal('${m.eventID}', '${homeName}', '${awayName}')"
                    class="px-8 py-3 rounded-3xl text-[10px] font-black text-white uppercase tracking-[3px] bg-white/5 border-white/10 hover:bg-white hover:text-black hover:border-white transition-all duration-300 shadow-xl active:scale-95">
                    Faça seu palpite
                </button>
            </div>
        `;
        container.appendChild(card);
    }) 
}

//Card de envio de palpite

window.openModal = (id, home, away) => {
    activeGame = {id, home, away};
    document.getElementById('modal-teams-title');
    document.getElementById('prediction-modal').classList.remove('hidden');
};

window.closeModal = () => {
    document.getElementById('prediction-modal').classList.add('hidden');
};

window.submitPrediction = async() => {
    const userName = document.querySelector('input[placeholder="pereira"]')?.value || "Anônimo";
    const inputs = document.querySelectorAll('#prediction-modal input[type="number"]');
    const homeScore = inputs[0]?.value;
    const awayScore = inputs[1]?.value;

    if (!homeScore || !awayScore) return alert(`Insira o placar!`);

    const data = {
        userName,
        matchTeams : `${activeGame.home} vs ${activeGame.away}`,
        prediction : `${homeScore}-${awayScore}`,
        date : new Date().toLocaleString()
    };

    try {
        const res = await fetch(CONFIG.MOCK_API, {
            method : 'POST',
            headers : {'Content-Type' : 'application/json'},
            body : JSON.stringify(data)
        });

        if (res.ok) {
            alert(`🎯 Palpite Enviado!`);
            closeModal();
        }
    } catch (e) { alert(`Erro ao enviar palpite`); }
};

document.addEventListener('DOMContentLoaded', () => fetchMatches());
window.changeSport = (id) => fetchMatches(id);

//Menu Dropdown
document.addEventListener('DOMContentLoaded', () => {
    const userBtn = document.getElementById('user-menu-btn');
    const userDropdown = document.getElementById('user-dropdown');

    if (userBtn && userDropdown) {
        userBtn.addEventListener('click', (e) =>{
            e.stopPropagation();

            userDropdown.classList.toggle('hidden');
        });

        window.addEventListener('click', () => {
            if (!userDropdown.classList.contains('hidden')) {
                userDropdown.classList.add('hidden');
            }
        });
    }
});