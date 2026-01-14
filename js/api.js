const CONFIG = {
    API_KEY: 'af7afc4eab9aa5ab16421caefd7aea25',
    MOCK_API: 'https://691c83153aaeed735c91269a.mockapi.io/predictions'
};

let currentLeague = 'UEFA_CHAMPIONS_LEAGUE';
let activeGame = null;

// --- FUNÇÕES DE BUSCA E RENDERIZAÇÃO ---

async function fetchMatches(leagueID = null) {
    if (leagueID) currentLeague = leagueID;
    const container = document.getElementById('matches-container');
    const dateInput = document.getElementById('date-picker');
    let selectedDate = dateInput ? dateInput.value : '';

    if (container) {
        container.innerHTML = '<div class="text-white text-center p-10 font-bold animate-pulse">Analisando o VAR e as cores das chuteiras... Quase lá!</div>';
    }

    try {
        let url = `https://api.sportsgameodds.com/v2/events?apiKey=${CONFIG.API_KEY}&leagueID=${currentLeague}&oddsAvailable=true`;
        if (selectedDate) url += `&date=${selectedDate}`;

        const response = await fetch(url);
        if (!response.ok) throw new Error(`Erro: ${response.status}`);

        const result = await response.json();
        const events = result.data || [];
        renderMatches(events);
    } catch (error) {
        console.error(`Erro na requisição: ${error}`);
        if (container) container.innerHTML = '<p class="text-red-500 text-center font-bold">Erro ao carregar dados.</p>';
    }
}

function renderMatches(matches) {
    const container = document.getElementById('matches-container');
    if (!container) return;
    container.innerHTML = '';

    if (!matches || matches.length === 0) {
        container.innerHTML = '<p class="text-gray-500 text-center font-bold col-span-full p-10 font-black uppercase text-[10px]">Nenhuma partida encontrada para a liga.</p>';
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
        const homeShort = home?.names?.short || 'C';
        const awayShort = away?.names?.short || 'F';

        const card = document.createElement('div');
        card.className = "match-card bg-slate-900/50 border border-white/5 p-6 rounded-3xl hover:border-purple-500/50 transition-all group";
        card.innerHTML = `
        <div class="flex items-center justify-between w-full gap-4 mb-10 text-center">
            <div class="flex flex-col items-center flex-1">
                <div class="relative mb-4 group-hover:-translate-y-2 transition-transform duration-500">
                    <div class="absolute inset-0 rounded-2xl blur-xl opacity-20 group-hover:opacity-50 transition-opacity" style="background-color: ${homeColor}"></div>
                    <div class="relative w-16 h-20 rounded-t-2xl rounded-b-[2rem] flex items-center justify-center shadow-2xl border-b-4 border-black/30 transition-all" style="background-color: ${homeColor}; color: ${homeText}">
                        <span class="text-xl font-black tracking-tighter">${homeShort}</span>
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
                    <div class="relative w-16 h-20 rounded-t-2xl rounded-b-[2rem] flex items-center justify-center shadow-2xl border-b-4 border-black/30 transition-all" style="background-color: ${awayColor}; color: ${awayText}">
                        <span class="text-xl font-black tracking-tighter">${awayShort}</span>
                    </div>
                </div>
                <span class="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] group-hover:text-white transition-colors">${awayName}</span>
            </div>
        </div>
        <button onclick="openModal('${m.eventID}', '${homeName}', '${awayName}')" 
            class="w-full py-4 rounded-2xl text-[11px] font-black text-white uppercase tracking-[3px] bg-gradient-to-r from-white/5 to-white/10 border border-white/10 hover:from-purple-600 hover:to-pink-600 transition-all duration-500 shadow-xl active:scale-95 cursor-pointer">
            Dar meu palpite
        </button>
        `;
        container.appendChild(card);
    });
}

// --- CONTROLE DOS MODAIS (PALPITE E AUTH) ---

window.openModal = (id, home, away) => {
    activeGame = { id, home, away };
    const titleEl = document.getElementById('modal-teams-title');
    const userInput = document.getElementById('input-username');
    const modal = document.getElementById('prediction-modal');

    if (titleEl) titleEl.innerHTML = `${home} vs ${away}`;
    
    const savedName = localStorage.getItem('goalDash_username');
    if (savedName && userInput) userInput.value = savedName;

    if (modal) modal.classList.remove('hidden');
};

window.closeModal = () => {
    const modal = document.getElementById('prediction-modal');
    if (modal) modal.classList.add('hidden');
    
    // Limpar campos
    const hInput = document.getElementById('input-home');
    const aInput = document.getElementById('input-away');
    if (hInput) hInput.value = "";
    if (aInput) aInput.value = "";
};

window.submitPrediction = async () => {
    const userInput = document.getElementById('input-username');
    const homeInput = document.getElementById('input-home');
    const awayInput = document.getElementById('input-away');

    const username = userInput?.value.trim();
    const homeScore = homeInput?.value;
    const awayScore = awayInput?.value;

    if (!username) return alert(`Por favor preencha o seu Nome/Nickname!`);
    if (homeScore === '' || awayScore === '') return alert(`Por favor, preencha o placar!`);

    const data = {
        userName: username,
        matchTeams: `${activeGame.home} vs ${activeGame.away}`,
        prediction: `${homeScore}-${awayScore}`,
        date: new Date().toLocaleString()
    };

    try {
        const res = await fetch(CONFIG.MOCK_API, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        if (res.ok) {
            localStorage.setItem('goalDash_username', username);
            alert(`🎯 Palpite enviado com sucesso!`);
            closeModal();
        } else {
            throw new Error();
        }
    } catch (e) {
        alert(`Erro ao enviar palpite`);
    }
};

// Funções do Modal de Login (O que não estava aparecendo)
window.openAuthModal = () => {
    const modal = document.getElementById('auth-modal');
    if (modal) {
        modal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
    } else {
        console.error("Erro: HTML do 'auth-modal' não encontrado no index!");
    }
};

window.closeAuthModal = () => {
    const modal = document.getElementById('auth-modal');
    if (modal) {
        modal.classList.add('hidden');
        document.body.style.overflow = 'auto';
    }
};

// --- INICIALIZAÇÃO E EVENTOS ---

document.addEventListener('DOMContentLoaded', () => {
    // Carregar partidas
    fetchMatches();

    // Renderizar estatísticas se o container existir
    const statsContainer = document.getElementById('statistics-container');
    if (statsContainer) statsContainer.innerHTML = renderStatistics();

    // Pesquisa em tempo real
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const term = e.target.value.toLowerCase();
            const cards = document.querySelectorAll('.match-card');
            cards.forEach(card => {
                const content = card.textContent.toLowerCase();
                card.style.display = content.includes(term) ? 'block' : 'none';
            });
        });
    }

    // Dropdown do usuário
    const userBtn = document.getElementById('user-menu-btn');
    const userDropdown = document.getElementById('user-dropdown');
    if (userBtn && userDropdown) {
        userBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            userDropdown.classList.toggle('hidden');

            if (mainNav) mainNav.classList.add('hidden');
        });
    }
    
    //Menu hambúrguer (mobile)
    const menuBtn = document.getElementById('menu-toggle');
    const mainNav = document.getElementById('main-nav');

    if (menuBtn && mainNav) {
        menuBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            mainNav.classList.toggle('hidden');
            mainNav.classList.toggle('flex');

            //Fechar menu caso clique para abrir o de links
            if (userDropdown) userDropdown.classList.add('hidden');
        });
    }

    //Fechar tudo caso clique fora
    window.addEventListener('click', () => {
        if(userDropdown) userDropdown.classList.add('hidden');
        if(mainNav) {
            mainNav.classList.add('hidden');
            mainNav.classList.remove('flex');
        }
    });

    // Fechar modais ao clicar fora
    window.addEventListener('click', (e) => {
        const predModal = document.getElementById('prediction-modal');
        const authModal = document.getElementById('auth-modal');
        if (e.target === predModal) closeModal();
        if (e.target === authModal) closeAuthModal();
        if (userDropdown) userDropdown.classList.add('hidden');
    });

    // Verificar se está logado
    const userSection = document.getElementById('user-section');
    const loggedUser = localStorage.getItem('goalDash_username');
    if (loggedUser && userSection) {
        userSection.innerHTML = `
            <div class="flex items-center gap-3">
                <span class="text-white font-bold text-sm">Olá, ${loggedUser}</span>
                <button onclick="logout()" class="text-xs text-red-500 underline">Sair</button>
            </div>
        `;
    }
});

// Outras funções auxiliares
window.changeSport = (id) => fetchMatches(id);

window.logout = () => {
    localStorage.removeItem('goalDash_username');
    window.location.reload();
};

function renderStatistics() {
    const stats = [
        { title: "Previsões Hoje", value: "12,543", trend: "+23%", icon: "🚀", color: "text-emerald-500 bg-emerald-100" },
        { title: "Utilizadores Ativos", value: "45,892", trend: "+12%", icon: "👥", color: "text-blue-500 bg-blue-100" },
        { title: "Taxa de Acerto", value: "68.5%", trend: "+5%", icon: "🎯", color: "text-purple-500 bg-purple-100" },
        { title: "Partidas Hoje", value: "127", trend: "+8%", icon: "⚽", color: "text-orange-500 bg-orange-100" }
    ];

    const cardsHtml = stats.map(stat => `
        <div class="stat-card bg-white rounded-xl shadow-lg border border-gray-100 p-5 transition-all hover:shadow-xl transform hover:-translate-y-0.5">
            <div class="flex justify-between items-start mb-4">
                <div class="p-2 rounded-lg ${stat.color}"><span class="text-xl">${stat.icon}</span></div>
                <span class="text-xs font-bold ${stat.color} p-1 rounded-full">${stat.trend}</span>
            </div>
            <p class="text-3xl font-extrabold text-gray-900 leading-none">${stat.value}</p>
            <p class="mt-1 text-sm font-medium text-gray-500">${stat.title}</p>
        </div>
    `).join('');

    return `
        <div class="mb-10 pt-4">
            <h2 class="text-2xl font-bold text-white mb-2 text-center">Estatísticas em Tempo Real</h2>
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4">${cardsHtml}</div>
        </div>
    `;
}