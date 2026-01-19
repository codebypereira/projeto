const CONFIG = {
    API_KEY: 'cc48942721f415ae287937399dd882c7',
    MOCK_API: 'https://696278a1d9d64c761907fe9a.mockapi.io/api/dash/predictions'
};

const LEAGUE_NAMES = {
    'UEFA_EUROPA_LEAGUE' : 'Europa League',
    'UEFA_CHAMPIONS_LEAGUE' : 'Champions League',
    'EPL' : 'Premier League',
    'LA_LIGA' : 'La Liga',
    'BUNDESLIGA' : 'Bundesliga',
    'IT_SERIE_A' : 'Serie A Itália',
    'FR_LIGUE_1' : 'Ligue 1',
    'MLS' : 'MLS (EUA)',
    'LIGA_MX' : 'Liga MX',
    'INTERNATIONAL_SOCCER' : 'Copa do Mundo 2026'
}

let currentLeague = 'UEFA_EUROPA_LEAGUE';
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

    //Mostrar o nome da liga escolhida
    const nameDisplay = document.getElementById('current-league-name');
    if (nameDisplay) {
        nameDisplay.innerText = LEAGUE_NAMES[currentLeague] || currentLeague;
    }

    const container = document.getElementById('matches-container');
    if (!container || document.title.includes("Ao Vivo")) return;

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

function renderMatches(matches) {
    const container = document.getElementById('matches-container');
    if (!container) return;
    container.innerHTML = '';

    matches.forEach(m => {
        const home = m.teams?.home;
        const away = m.teams?.away;

        // MANTIDO: Sua lógica original de logos
        const homeLogo = getTeamLogo(home?.names?.short || home?.names?.medium || home?.names?.full || '');
        const awayLogo = getTeamLogo(away?.names?.short || away?.names?.medium || away?.names?.full  || '');

        const rawDate = m.status?.startsAt || m.startsAt; 
        let day = "--/--", time = "--:--";

        if (rawDate) {
            const gameDate = new Date(rawDate);
            if (!isNaN(gameDate.getTime())) {
                day = gameDate.toLocaleDateString('pt-PT', { day: '2-digit', month: '2-digit' });
                time = gameDate.toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' });
            }
        }

        const card = document.createElement('div');
        card.className = "match-card bg-slate-900/50 border border-white/5 rounded-3xl hover:border-purple-500/50 transition-all group relative overflow-hidden shadow-2xl";
        
        // INJETADO: Link para matchdetails.html envolvendo a parte visual
        card.innerHTML = `
            <a href="matchdetails.html?id=${m.eventID}" class="block p-6">
                <div class="flex justify-center mb-6">
                    <div class="bg-white/10 border border-white/20 px-4 py-1.5 rounded-full flex items-center gap-3">
                        <span class="text-sm font-black text-purple-400 uppercase tracking-tight">${day}</span>
                        <div class="w-1.5 h-1.5 bg-white/30 rounded-full"></div>
                        <span class="text-sm font-black text-white tracking-tight">${time}</span>
                    </div>
                </div>
                <div class="flex items-center justify-between w-full gap-4 mb-10 text-center">
                    <div class="flex flex-col items-center flex-1">
                        <div class="relative mb-4 group-hover:-translate-y-2 transition-transform duration-500">
                            <div class="absolute inset-0 rounded-full blur-xl opacity-30 bg-purple-600"></div>
                            <img src="${homeLogo}" class="relative z-10 w-16 h-16 object-contain drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]" alt="home">
                        </div>
                        <span class="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] group-hover:text-white transition-colors line-clamp-1">
                            ${home?.names?.medium || home?.names?.long || home?.names?.short || 'Casa'}
                        </span>
                    </div>

                    <div class="opacity-30"><span class="text-2xl font-black italic text-white">VS</span></div>

                    <div class="flex flex-col items-center flex-1">
                        <div class="relative mb-4 group-hover:-translate-y-2 transition-transform duration-500">
                            <div class="absolute inset-0 rounded-full blur-xl opacity-30 bg-pink-600"></div>
                            <img src="${awayLogo}" class="relative z-10 w-16 h-16 object-contain drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]" alt="away">
                        </div>
                        <span class="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] group-hover:text-white transition-colors line-clamp-1">
                            ${away?.names?.medium || away?.names?.long || away?.names?.short || 'Fora'}
                        </span>
                    </div>
                </div>
            </a>
            
            <div class="px-6 pb-6">
                <button onclick="handlePalpiteClick('${m.eventID}', '${home?.names?.medium || home?.names?.full || 'Casa'}', '${away?.names?.medium || away?.names?.full || 'Fora'}')" 
                    class="w-full py-4 rounded-2xl text-[11px] font-black text-white uppercase tracking-[3px] bg-gradient-to-r from-white/5 to-white/10 border border-white/10 hover:from-purple-600 hover:to-pink-600 transition-all duration-500 shadow-xl active:scale-95 cursor-pointer relative z-20">
                    Dar meu palpite
                </button>
            </div>`;
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
        setTimeout(() => { modal.classList.add('active'); }, 10);
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
            document.body.classList.remove('modal-open');
        }, 300);
    }
};

// --- 4. INICIALIZAÇÃO E EXPORTS ---

window.changeSport = (leagueID) => fetchMatches(leagueID);

document.addEventListener('DOMContentLoaded', () => {
    updateUserUI();
    fetchMatches();
    
    document.getElementById('auth-form')?.addEventListener('submit', (e) => {
        e.preventDefault();
        const user = document.getElementById('auth-user').value.trim();
        if (user) { 
            localStorage.setItem('goalDash_username', user); 
            updateUserUI(); 
            window.closeAuthModal();
        }
    });

    window.addEventListener('click', () => document.getElementById('user-dropdown')?.classList.add('hidden'));
});