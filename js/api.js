const CONFIG = {
    API_KEY : 'af7afc4eab9aa5ab16421caefd7aea25',
    MOCK_API : 'https://691c83153aaeed735c91269a.mockapi.io/predictions'
};

let currentLeague = 'UEFA_CHAMPIONS_LEAGUE';
let activeGame = null;

//Função para buscar as partidas

async function fetchMatches(leagueID = null) {
    if (leagueID) currentLeague = leagueID;
    const container = document.getElementById('matches-container');
    const dateInput = document.getElementById('date-picker');
    let selectedDate = dateInput ? dateInput.value: '';

    if (container) container.innerHTML = '<div class="text-white text-center p-10 font-bold animate-pulse">Analisando o VAR e as cores das chuteiras... Quase lá!</div>';

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
        const awayText = away?.colors?.primaryContrast || '#ffffff';

        const homeShort = home?.names?.short;
        const awayShort = away?.names?.short;

        const card = document.createElement('div');
        card.className = "bg-slate-900/50 border border-white/5 p-6 rounded-3xl hover:border-purple-500/50 transition-all group";
        card.innerHTML = `
        <div class="flex items-center justify-between w-full gap-4 mb-10 text-center">
            <div class="flex flex-col items-center flex-1">
                <div class="relative mb-4 group-hover:-translate-y-2 transition-transform duration-500">
                    <div class="absolute inset-0 rounded-2xl blur-xl opacity-20 group-hover:opacity-50 transition-opacity" 
                         style="background-color: ${homeColor}"></div>
                    
                    <div class="relative w-16 h-20 rounded-t-2xl rounded-b-[2rem] flex items-center justify-center shadow-2xl border-b-4 border-black/30 transition-all" 
                         style="background-color: ${homeColor}; color: ${homeText}">
                        <span class="text-xl font-black tracking-tighter">${homeShort}</span>
                    </div>
                </div>
                <span class="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] group-hover:text-white transition-colors">
                    ${homeName}
                </span>
            </div>

            <div class="flex flex-col items-center justify-center opacity-30">
                <span class="text-2xl font-black italic text-slate-500">VS</span>
            </div>

            <div class="flex flex-col items-center flex-1">
                <div class="relative mb-4 group-hover:-translate-y-2 transition-transform duration-500">
                    <div class="absolute inset-0 rounded-2xl blur-xl opacity-20 group-hover:opacity-50 transition-opacity" 
                         style="background-color: ${awayColor}"></div>
                    
                    <div class="relative w-16 h-20 rounded-t-2xl rounded-b-[2rem] flex items-center justify-center shadow-2xl border-b-4 border-black/30 transition-all" 
                         style="background-color: ${awayColor}; color: ${awayText}">
                        <span class="text-xl font-black tracking-tighter">${awayShort}</span>
                    </div>
                </div>
                <span class="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] group-hover:text-white transition-colors">
                    ${awayName}
                </span>
            </div>
        </div>
        
        <button onclick="openModal('${m.eventID}', '${homeName}', '${awayName}')" 
            class="w-full py-4 rounded-2xl text-[11px] font-black text-white uppercase tracking-[3px] 
            bg-gradient-to-r from-white/5 to-white/10 border border-white/10 hover:from-purple-600 hover:to-pink-600
            transition-all duration-500 shadow-xl active:scale-95 cursor-pointer">
            Dar meu palpite
        </button>
        `;
        container.appendChild(card);
    }) 
}

//Card de envio de palpite

window.openModal = (id, home, away) => {
    activeGame = {id, home, away};
    const titleEl = document.getElementById('modal-teams-title');
    if (titleEl) {
        titleEl.innerHTML = `${home} vs ${away}`;
    }
    document.getElementById('prediction-modal').classList.remove('hidden');
};

window.closeModal = () => {
    document.getElementById('prediction-modal').classList.add('hidden');
};

window.submitPrediction = async() => {
    const userInput = document.getElementById('input-username');
    const homeInput = document.getElementById('input-home');
    const awayInput = document.getElementById('away-input');

    const username = userInput?.value.trim();
    const homeScore = homeInput?.value;
    const awayScore = awayInput?.value;

    if (!username) {
        return alert(`Por favor preencha o seu Nome/Nickname!`);
    }

    if (homeScore === '' || awayScore === '') {
        return alert(`Por favor, preencha o placar dos dois times!`);
    }

    if (parseInt(homeScore) < 0 || parseInt(awayScore) < 0) {
        return alert(`Não dá pra marcar gols negativos, né?`)
    }

    const data = {
        userInput,
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
            alert(`🎯 Palpite enviado com sucesso!`);

            if (userInput) userInput.value = "";
            if (homeInput) homeInput.value = "0";
            if (awayInput) awayInput.value = "0";

            closeModal();
        } else {
            throw new Error();
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