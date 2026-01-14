const CONFIG = {
    API_KEY: 'af7afc4eab9aa5ab16421caefd7aea25',
    MOCK_API: 'https://691c83153aaeed735c91269a.mockapi.io/predictions'
};

let currentLeague = 'UEFA_CHAMPIONS_LEAGUE';
let activeGame = null;

// --- 1. GESTÃO DA INTERFACE E UTILIZADOR ---

function updateUserUI() {
    const authArea = document.getElementById('auth-area');
    const loggedUser = localStorage.getItem('goalDash_username');

    if (!authArea) return;

    if (loggedUser) {
        // Se estiver logado, desenha o Menu Dropdown com o nome do utilizador
        authArea.innerHTML = `
            <div class="relative shrink-0">
                <button id="user-menu-btn" onclick="toggleDropdown(event)" class="flex items-center gap-2 border border-gray-300 rounded-full sm:rounded-lg py-1.5 px-3 sm:px-4 text-gray-700 font-medium hover:bg-gray-50 transition-all cursor-pointer">
                    <div class="w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center text-white text-[10px] font-bold">
                        ${loggedUser.charAt(0).toUpperCase()}
                    </div>
                    <span class="hidden sm:block text-sm font-bold text-slate-800">${loggedUser}</span>
                    <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                    </svg>
                </button>
                
                <div id="user-dropdown" class="hidden absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 z-50 overflow-hidden">
                    <div class="px-4 py-3 border-b border-gray-50 bg-gray-50">
                        <p class="text-xs text-gray-500 uppercase font-bold tracking-wider">Conta</p>
                        <p class="text-sm font-medium text-gray-900 truncate">${loggedUser}</p>
                    </div>
                    <div class="py-1">
                        <a href="history.html" class="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-purple-50 hover:text-purple-700 transition-colors">Histórico de Previsões</a>
                    </div>
                    <div class="border-t border-gray-100 py-1">
                        <button onclick="logout()" class="w-full text-left flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors cursor-pointer">Sair</button>
                    </div>
                </div>
            </div>
        `;
    } else {
        // Se não estiver logado, mostra o botão de Entrar
        authArea.innerHTML = `
            <button onclick="openAuthModal()" class="bg-purple-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-purple-700 transition-all text-sm shadow-md cursor-pointer">
                Entrar
            </button>
        `;
    }
}

// Funções de controlo do Dropdown e Auth
window.toggleDropdown = (e) => {
    e.stopPropagation();
    const dropdown = document.getElementById('user-dropdown');
    if (dropdown) dropdown.classList.toggle('hidden');
};

window.logout = () => {
    localStorage.removeItem('goalDash_username');
    window.location.reload();
};

window.openAuthModal = () => {
    const modal = document.getElementById('auth-modal');
    if (modal) modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
};

window.closeAuthModal = () => {
    document.getElementById('auth-modal')?.classList.add('hidden');
    document.body.style.overflow = 'auto';
};

// --- 2. LOGICA DE PARTIDAS (SUA GRID ORIGINAL) ---

async function fetchMatches(leagueID = null) {
    if (leagueID) currentLeague = leagueID;
    const container = document.getElementById('matches-container');
    if (container) container.innerHTML = '<div class="text-white text-center p-10 font-bold animate-pulse col-span-full">A carregar confrontos...</div>';

    try {
        const response = await fetch(`https://api.sportsgameodds.com/v2/events?apiKey=${CONFIG.API_KEY}&leagueID=${currentLeague}&oddsAvailable=true`);
        const result = await response.json();
        renderMatches(result.data || []);
    } catch (error) {
        if (container) container.innerHTML = '<p class="text-red-500 text-center col-span-full">Erro ao carregar dados da API.</p>';
    }
}

function renderMatches(matches) {
    const container = document.getElementById('matches-container');
    if (!container) return;
    container.innerHTML = '';

    matches.forEach(m => {
        const home = m.teams?.home;
        const away = m.teams?.away;
        const homeName = home?.names?.medium || 'Casa';
        const awayName = away?.names?.medium || 'Fora';
        const homeColor = home?.colors?.primary || '#334155';
        const homeText = home?.colors?.primaryContrast || '#ffffff';
        const awayColor = away?.colors?.primary || '#334155';
        const awayText = away?.colors?.primaryContrast || '#ffffff';

        const card = document.createElement('div');
        card.className = "match-card bg-slate-900/50 border border-white/5 p-6 rounded-3xl hover:border-purple-500/50 transition-all group";
        card.innerHTML = `
            <div class="flex items-center justify-between w-full gap-4 mb-10 text-center">
                <div class="flex flex-col items-center flex-1">
                    <div class="relative mb-4 group-hover:-translate-y-2 transition-transform duration-500">
                        <div class="absolute inset-0 rounded-2xl blur-xl opacity-20 group-hover:opacity-50 transition-opacity" style="background-color: ${homeColor}"></div>
                        <div class="relative w-16 h-20 rounded-t-2xl rounded-b-[2rem] flex items-center justify-center shadow-2xl border-b-4 border-black/30" style="background-color: ${homeColor}; color: ${homeText}">
                            <span class="text-xl font-black tracking-tighter">${home?.names?.short || 'H'}</span>
                        </div>
                    </div>
                    <span class="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] group-hover:text-white transition-colors">${homeName}</span>
                </div>
                <div class="flex flex-col items-center justify-center opacity-30">
                    <span class="text-2xl font-black italic text-slate-500">VS</span>
                </div>
                <div class="flex flex-col items-center flex-1">
                    <div class="relative mb-4 group-hover:-translate-y-2 transition-transform duration-500">
                        <div class="absolute inset-0 rounded-2xl blur-xl opacity-20 group-hover:opacity-50 transition-opacity" style="background-color: ${awayColor}"></div>
                        <div class="relative w-16 h-20 rounded-t-2xl rounded-b-[2rem] flex items-center justify-center shadow-2xl border-b-4 border-black/30" style="background-color: ${awayColor}; color: ${awayText}">
                            <span class="text-xl font-black tracking-tighter">${away?.names?.short || 'A'}</span>
                        </div>
                    </div>
                    <span class="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] group-hover:text-white transition-colors">${awayName}</span>
                </div>
            </div>
            <button onclick="handlePalpiteClick('${m.eventID}', '${homeName}', '${awayName}')" 
                class="w-full py-4 rounded-2xl text-[11px] font-black text-white uppercase tracking-[3px] bg-gradient-to-r from-white/5 to-white/10 border border-white/10 hover:from-purple-600 hover:to-pink-600 transition-all duration-500 shadow-xl active:scale-95 cursor-pointer">
                Dar meu palpite
            </button>
        `;
        container.appendChild(card);
    });
}

// --- 3. GESTÃO DE PALPITES ---

window.handlePalpiteClick = (id, home, away) => {
    const user = localStorage.getItem('goalDash_username');
    if (!user) {
        openAuthModal();
    } else {
        openPredictionModal(id, home, away);
    }
};

window.openPredictionModal = (id, home, away) => {
    activeGame = { id, home, away };
    const modal = document.getElementById('prediction-modal');
    const title = document.getElementById('modal-teams-title');
    const userInp = document.getElementById('input-username');

    if (title) title.innerText = `${home} vs ${away}`;
    if (userInp) userInp.value = localStorage.getItem('goalDash_username');
    if (modal) modal.classList.remove('hidden');
};

window.closeModal = () => {
    document.getElementById('prediction-modal')?.classList.add('hidden');
};

window.submitPrediction = async () => {
    const homeScore = document.getElementById('input-home').value;
    const awayScore = document.getElementById('input-away').value;
    const username = localStorage.getItem('goalDash_username');

    if (!homeScore || !awayScore) return alert("Por favor, preencha o placar!");

    const payload = {
        userName: username,
        matchTeams: `${activeGame.home} vs ${activeGame.away}`,
        prediction: `${homeScore}-${awayScore}`,
        date: new Date().toLocaleString('pt-PT')
    };

    try {
        const response = await fetch(CONFIG.MOCK_API, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        if (response.ok) {
            alert("🎯 Palpite enviado com sucesso!");
            closeModal();
        }
    } catch (e) {
        alert("Erro ao ligar à Mock API.");
    }
};

// --- 4. INICIALIZAÇÃO ---

document.addEventListener('DOMContentLoaded', () => {
    // Listener para o Formulário de Login
    const authForm = document.getElementById('auth-form');
    if (authForm) {
        authForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const userVal = document.getElementById('auth-user').value.trim();
            if (userVal) {
                localStorage.setItem('goalDash_username', userVal);
                updateUserUI(); // Muda o header na hora!
                closeAuthModal();
            }
        });
    }

    // Fechar dropdown ao clicar fora
    window.addEventListener('click', () => {
        document.getElementById('user-dropdown')?.classList.add('hidden');
    });

    fetchMatches();
    updateUserUI();
});

window.changeSport = (id) => fetchMatches(id);