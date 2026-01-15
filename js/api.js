const CONFIG = {
    API_KEY: 'af7afc4eab9aa5ab16421caefd7aea25',
    MOCK_API: 'https://696278a1d9d64c761907fe9a.mockapi.io/api/dash/predictions'
};

let currentLeague = 'UEFA_CHAMPIONS_LEAGUE';
let activeGame = null;

// --- 1. GESTÃO DA INTERFACE E AUTH ---

function updateUserUI() {
    const authArea = document.getElementById('auth-area');
    const loggedUser = localStorage.getItem('goalDash_username');
    if (!authArea) return;

    if (loggedUser) {
        authArea.innerHTML = `
            <div class="relative shrink-0">
                <button id="user-menu-btn" onclick="toggleDropdown(event)" class="flex items-center gap-2 border border-gray-300 rounded-full py-1.5 px-4 text-gray-700 font-medium hover:bg-gray-50 transition-all cursor-pointer">
                    <div class="w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center text-white text-[10px] font-bold">
                        ${loggedUser.charAt(0).toUpperCase()}
                    </div>
                    <span class="text-sm font-bold text-slate-800">${loggedUser}</span>
                </button>
                <div id="user-dropdown" class="hidden absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 z-50 overflow-hidden">
                    <div class="px-4 py-3 border-b bg-gray-50"><p class="text-sm font-medium text-gray-900">${loggedUser}</p></div>
                    <div class="py-1"><a href="history.html" class="block px-4 py-2 text-sm text-gray-700 hover:bg-purple-50 transition-colors">Histórico</a></div>
                    <div class="border-t py-1"><button onclick="logout()" class="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors cursor-pointer">Sair</button></div>
                </div>
            </div>`;
    } else {
        authArea.innerHTML = `<button onclick="openAuthModal()" class="bg-purple-600 text-white px-6 py-2 rounded-lg font-bold text-sm shadow-md hover:bg-purple-700 transition-all cursor-pointer">Entrar</button>`;
    }
}

// --- 2. LÓGICA DE PARTIDAS (INDEX) ---

async function fetchMatches(leagueID = null) {
    if (leagueID) currentLeague = leagueID;
    const container = document.getElementById('matches-container');
    // Verifica se estamos no index.html (se o container existe)
    if (!container) return;

    container.innerHTML = '<div class="text-white text-center p-10 animate-pulse col-span-full font-bold uppercase tracking-widest">A carregar confrontos...</div>';

    try {
        const response = await fetch(`https://api.sportsgameodds.com/v2/events?apiKey=${CONFIG.API_KEY}&leagueID=${currentLeague}&oddsAvailable=true`);
        const result = await response.json();
        renderMatches(result.data || []);
    } catch (error) {
        console.error("Erro na requisição:", error);
        container.innerHTML = '<p class="text-red-500 text-center col-span-full">Erro ao conectar à API.</p>';
    }
}

async function fetchLiveMatches() {
    const container = document.getElementById('live-matches-container');
    if (!container) {
        console.error(`ERRO: O container 'live-matches-container' não existe no HTML.`);
        return;
    }


    console.log(`Buscando jogos ao vivo para NBA...`)
    container.innerHTML = `<div class="text-white text-center p-10 animate-pulse col-span-full font-bold uppercase tracking-widest">Buscando enterradas ao vivo...</div>`;

    try {
        const url = `https://api.sportsgameodds.com/v2/events?apiKey=${CONFIG.API_KEY}&live=true&leagueID=NBA`;
        const response = await fetch(url);
        const result = await response.json();

        console.log("Dados: ", result);

        if (!result.data || result.data.length === 0) {
            container.innerHTML = '<p>Não há jogos ao vivo no momento.</p>';
            return;
        }

        renderMatches(result.data, 'live-matches-container');
    } catch (error) {
        console.error(`Erro no Live: ${error}`);
        container.innerHTML = '<p>Erro ao carregar transmissões</p>'
    }
}

/**
 * Renderizar os cards de partidas de forma dinâmica
 * @param {Array} matches - Lista de jogos vinda da API
 * @param {String} containerID - O ID do elemento HTML onde os cards serão inseridos
 */

function renderMatches(matches, containerID) {
    const container = document.getElementById(containerID);
    if (!container) return;

    container.innerHTML = '';

    if (matches.length === 0) {
        container.innerHTML = '<p>Nenhuma partida encontrada</p>';
        return;
    }

    matches.forEach(m => {
        const home = m.teams?.home;
        const away = m.teams?.away;

        const isLive = m.live === true || ( m.status && m.status.live === true);

        const homeScore = isLive ? (m.scores?.home ?? 0) : null;
        const awayScore = isLive ? (m.scores?.away ?? 0) : null;

        const rawDate = m.status?.startsAt || m.startsAt; 
        let day = "--/--", time = "--:--";

        if (rawDate && !isLive) {
            const gameDate = new Date(rawDate);
            if (!isNaN(gameDate.getTime())) {
                day = gameDate.toLocaleDateString('pt-PT', { day: '2-digit', month: '2-digit' });
                time = gameDate.toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' });
            }
        }

        const homeColor = home?.colors?.primary || '#334155';
        const awayColor = away?.colors?.primary || '#334155';

        const card = document.createElement('div');
        card.className = "match-card bg-slate-900/50 border border-white/5 p-6 rounded-3xl hover:border-purple-500/50 transition-all group relative overflow-hidden shadow-2xl";
        card.innerHTML = `
            <div class="flex justify-center mb-6">
                <div class="${isLive ? 'bg-red-600 animate-pulse' : 'bg-white/10'} border border-white/20 px-4 py-1.5 rounded-full flex items-center gap-3">
                    ${isLive 
                        ? '<span class="text-[10px] font-black text-white uppercase tracking-[2px]">● AO VIVO</span>' 
                        : `<span class="text-xs font-black text-purple-400 uppercase">${day}</span>
                           <div class="w-1 h-1 bg-white/30 rounded-full"></div>
                           <span class="text-xs font-black text-white">${time}</span>`
                    }
                </div>
            </div>

            <div class="flex items-center justify-between w-full gap-2 mb-10 text-center">
                <div class="flex flex-col items-center flex-1">
                    <div class="relative mb-4 group-hover:-translate-y-2 transition-transform duration-500">
                        <div class="absolute inset-0 rounded-2xl blur-xl opacity-20" style="background-color: ${homeColor}"></div>
                        <div class="relative w-16 h-20 rounded-t-2xl rounded-b-[2rem] flex items-center justify-center border-b-4 border-black/30 shadow-inner" style="background-color: ${homeColor}; color: white">
                            <span class="text-xl font-black tracking-tighter">${home?.names?.short || 'H'}</span>
                        </div>
                    </div>
                    <span class="text-[10px] font-black text-slate-400 uppercase tracking-wider line-clamp-1">${home?.names?.medium || 'Casa'}</span>
                </div>

                <div class="flex flex-col items-center px-2">
                    ${isLive ? `
                        <div class="flex items-center gap-3">
                            <span class="text-3xl font-black text-white">${homeScore}</span>
                            <span class="text-lg font-bold text-white/20">-</span>
                            <span class="text-3xl font-black text-white">${awayScore}</span>
                        </div>
                    ` : `
                        <span class="text-2xl font-black italic text-white/20">VS</span>
                    `}
                </div>

                <div class="flex flex-col items-center flex-1">
                    <div class="relative mb-4 group-hover:-translate-y-2 transition-transform duration-500">
                        <div class="absolute inset-0 rounded-2xl blur-xl opacity-20" style="background-color: ${awayColor}"></div>
                        <div class="relative w-16 h-20 rounded-t-2xl rounded-b-[2rem] flex items-center justify-center border-b-4 border-black/30 shadow-inner" style="background-color: ${awayColor}; color: white">
                            <span class="text-xl font-black tracking-tighter">${away?.names?.short || 'A'}</span>
                        </div>
                    </div>
                    <span class="text-[10px] font-black text-slate-400 uppercase tracking-wider line-clamp-1">${away?.names?.medium || 'Fora'}</span>
                </div>
            </div>

            <button onclick="handlePalpiteClick('${m.eventID}', '${home?.names?.medium}', '${away?.names?.medium}')" 
                class="w-full py-4 rounded-2xl text-[11px] font-black text-white uppercase tracking-[3px] bg-gradient-to-r from-white/5 to-white/10 border border-white/10 hover:from-purple-600 hover:to-pink-600 transition-all duration-500 shadow-xl active:scale-95 cursor-pointer">
                Dar meu palpite
            </button>`;
        container.appendChild(card);
    });
}

// --- 3. GESTÃO DE PALPITES & MODAIS ---

window.handlePalpiteClick = (id, home, away) => {
    if (!localStorage.getItem('goalDash_username')) return openAuthModal();

    activeGame = { id, home, away };
    const modal = document.getElementById('prediction-modal');
    const title = document.getElementById('modal-teams-title');

    if (title) title.innerText = `${home} vs ${away}`;

    if (modal) {
        modal.classList.remove('hidden');
        modal.classList.add('flex');

        setTimeout(() => {
            modal.classList.add('active');
        }, 10)
        
        document.body.classList.add('modal-open');
    }
};

window.submitPrediction = async () => {
    const h = parseInt(document.getElementById('input-home').value);
    const a = parseInt(document.getElementById('input-away').value);
    if (isNaN(h) || isNaN(a)) return alert("Placar inválido!");

    const payload = {
        matchId: `${activeGame.home} vs ${activeGame.away}`, 
        username: localStorage.getItem('goalDash_username'),
        Winner: h > a ? activeGame.home : (a > h ? activeGame.away : "Empate"),
        homeScore: h,
        awayScore: a,
        createdAt: new Date().toISOString()
    };

    try {
        const res = await fetch(CONFIG.MOCK_API, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        if (res.ok) { 
            alert("🎯 Palpite Salvo!"); 
            window.closeModal(); 
        }
    } catch (e) { alert("Erro ao salvar."); }
};

window.closeModal = () => {
    const modal = document.getElementById('prediction-modal');
    if (modal) {
        modal.classList.remove('active');

        setTimeout(() => {
            modal.classList.add('hidden');
            modal.classList.remove('flex');
            document.body.classList.remove()
        }, 300);
    }
}

// --- 4. INICIALIZAÇÃO E EXPORTS ---

window.changeSport = (leagueID) => fetchMatches(leagueID);

document.addEventListener('DOMContentLoaded', () => {
    updateUserUI();

    if (window.location.pathname.includes('live.html') || document.getElementById('live-matches-container')) {
        fetchLiveMatches();
        setInterval(fetchLiveMatches, 30000);
    } else {
        fetchMatches();
    }
    
    document.getElementById('auth-form')?.addEventListener('submit', (e) => {
        e.preventDefault();
        const user = document.getElementById('auth-user').value.trim();
        if (user) { 
            localStorage.setItem('goalDash_username', user); 
            updateUserUI(); 
            window.closeAuthModal();
        }
    });

    // Fechar dropdown ao clicar fora
    window.addEventListener('click', () => document.getElementById('user-dropdown')?.classList.add('hidden'));
});