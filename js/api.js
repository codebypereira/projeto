/**
 * GoalDash - Sistema de Previsões Desportivas
 * Projeto de Programação Web - 2026
 * 
 * Este ficheiro contém a lógica principal da aplicação:
 * - Gestão de autenticação via localStorage
 * - Integração com API SportsGameOdds para obter jogos
 * - Sistema de palpites com persistência em MockAPI
 */

// ============================================================================
// CONFIGURAÇÕES
// ============================================================================

const CONFIG = {
    API_KEY: 'cc48942721f415ae287937399dd882c7',
    MOCK_API: 'https://696278a1d9d64c761907fe9a.mockapi.io/api/dash/predictions'
};

// Mapeamento de IDs de ligas para nomes exibíveis
const LEAGUE_NAMES = {
    'UEFA_EUROPA_LEAGUE': 'Europa League',
    'UEFA_CHAMPIONS_LEAGUE': 'Champions League',
    'EPL': 'Premier League',
    'LA_LIGA': 'La Liga',
    'BUNDESLIGA': 'Bundesliga',
    'IT_SERIE_A': 'Serie A Itália',
    'FR_LIGUE_1': 'Ligue 1',
    'MLS': 'MLS (EUA)',
    'LIGA_MX': 'Liga MX',
    'INTERNATIONAL_SOCCER': 'Copa do Mundo 2026'
};

// ============================================================================
// VARIÁVEIS GLOBAIS
// ============================================================================

let currentLeague = 'UEFA_CHAMPIONS_LEAGUE';  // Liga atualmente selecionada
let activeGame = null;  // Jogo para o qual o utilizador está a fazer palpite
let allLoadedMatches = []; // Guarda todos os jogos para pesquisa instantânea

// ============================================================================
// AUTENTICAÇÃO
// ============================================================================

/**
 * Atualiza a área de autenticação conforme o estado do utilizador
 * Se autenticado: mostra menu com nome e opções
 * Se não autenticado: mostra botão de login
 */
function updateUserUI() {
    const authArea = document.getElementById('auth-area');
    const loggedUser = localStorage.getItem('goalDash_username');
    if (!authArea) return;

    if (loggedUser) {
        // Renderizar menu do utilizador
        authArea.innerHTML = `
            <div class="relative shrink-0">
                <button id="user-menu-btn" onclick="toggleDropdown(event)" 
                    class="flex items-center gap-2 border border-gray-300 rounded-full py-1.5 px-4 text-gray-700 font-medium hover:bg-gray-50 transition-all cursor-pointer">
                    <div class="w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center text-white text-[10px] font-bold">
                        ${loggedUser.charAt(0).toUpperCase()}
                    </div>
                    <span class="text-sm font-bold text-slate-800">${loggedUser}</span>
                </button>
                <div id="user-dropdown" 
                    class="hidden absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 z-50 overflow-hidden">
                    <div class="px-4 py-3 border-b bg-gray-50">
                        <p class="text-sm font-medium text-gray-900">${loggedUser}</p>
                    </div>
                    <div class="py-1">
                        <a href="history.html" 
                            class="block px-4 py-2 text-sm text-gray-700 hover:bg-purple-50 transition-colors">
                            Histórico
                        </a>
                    </div>
                    <div class="border-t py-1">
                        <button onclick="logout()" 
                            class="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors cursor-pointer">
                            Sair
                        </button>
                    </div>
                </div>
            </div>`;
    } else {
        // Renderizar botão de login
        authArea.innerHTML = `
            <button onclick="openAuthModal()" 
                class="bg-purple-600 text-white px-6 py-2 rounded-lg font-bold text-sm shadow-md hover:bg-purple-700 transition-all cursor-pointer">
                Entrar
            </button>`;
    }
}

// ============================================================================
// OBTENÇÃO DE JOGOS DA API
// ============================================================================

/**
 * Carrega os jogos de uma determinada liga
 * @param {string|null} leagueID - ID da liga (se null, usa a liga atual)
 */
async function fetchMatches(leagueID = null) {
    if (leagueID) currentLeague = leagueID;

    // Atualizar nome da liga na interface
    const nameDisplay = document.getElementById('current-league-name');
    if (nameDisplay) {
        nameDisplay.innerText = LEAGUE_NAMES[currentLeague] || currentLeague;
    }

    const container = document.getElementById('matches-container');
    if (!container || document.title.includes("Ao Vivo")) return;

    // Mostrar loading
    container.innerHTML = `
        <div class="text-white text-center p-10 animate-pulse col-span-full font-bold uppercase tracking-widest">
            A carregar confrontos...
        </div>`;

    try {
        const response = await fetch(
            `https://api.sportsgameodds.com/v2/events?apiKey=${CONFIG.API_KEY}&leagueID=${currentLeague}&oddsAvailable=true`
        );
        const result = await response.json();
        renderMatches(result.data || []);
    } catch (error) {
        console.error("Erro ao carregar jogos:", error);
        container.innerHTML = '<p class="text-red-500 text-center col-span-full">Erro ao conectar à API.</p>';
    }
    try {
        const response = await fetch(`https://api.sportsgameodds.com/v2/events?apiKey=${CONFIG.API_KEY}&leagueID=${currentLeague}&oddsAvailable=true`);
        const result = await response.json();
        
        allLoadedMatches = result.data || []; // Guarda os dados aqui
        renderMatches(allLoadedMatches); // Renderiza normalmente
    } catch (error) {
        console.error("Erro ao carregar jogos:", error);
    }
}

// ============================================================================
// RENDERIZAÇÃO DE JOGOS
// ============================================================================

/**
 * Renderiza os cards de jogos no ecrã
 * @param {Array} matches - Array de objetos com dados dos jogos
 */
function renderMatches(matches) {
    const container = document.getElementById('matches-container');
    if (!container) return;
    container.innerHTML = '';

    matches.forEach(m => {
        const home = m.teams?.home;
        const away = m.teams?.away;

        // Obter logos das equipas
        const homeLogo = getTeamLogo(
            home?.names?.short || home?.names?.medium || home?.names?.full || ''
        );
        const awayLogo = getTeamLogo(
            away?.names?.short || away?.names?.medium || away?.names?.full || ''
        );

        // Formatar data e hora
        const rawDate = m.status?.startsAt || m.startsAt;
        let day = "--/--", time = "--:--";

        if (rawDate) {
            const gameDate = new Date(rawDate);
            if (!isNaN(gameDate.getTime())) {
                day = gameDate.toLocaleDateString('pt-PT', { day: '2-digit', month: '2-digit' });
                time = gameDate.toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' });
            }
        }

        // Criar card do jogo
        const card = document.createElement('div');
        card.className = "match-card bg-slate-900/50 border border-white/5 rounded-3xl hover:border-purple-500/50 transition-all group relative overflow-hidden shadow-2xl";
        
        card.innerHTML = `
            <a href="matchdetails.html?id=${m.eventID}" class="block p-6">
                <!-- Data e hora -->
                <div class="flex justify-center mb-6">
                    <div class="bg-white/10 border border-white/20 px-4 py-1.5 rounded-full flex items-center gap-3">
                        <span class="text-sm font-black text-purple-400 uppercase tracking-tight">${day}</span>
                        <div class="w-1.5 h-1.5 bg-white/30 rounded-full"></div>
                        <span class="text-sm font-black text-white tracking-tight">${time}</span>
                    </div>
                </div>
                
                <!-- Equipas -->
                <div class="flex items-center justify-between w-full gap-4 mb-10 text-center">
                    <!-- Equipa Casa -->
                    <div class="flex flex-col items-center flex-1">
                        <div class="relative mb-4 group-hover:-translate-y-2 transition-transform duration-500">
                            <div class="absolute inset-0 rounded-full blur-xl opacity-30 bg-purple-600"></div>
                            <img src="${homeLogo}" 
                                class="relative z-10 w-16 h-16 object-contain drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]" 
                                alt="home">
                        </div>
                        <span class="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] group-hover:text-white transition-colors line-clamp-1">
                            ${home?.names?.medium || home?.names?.long || home?.names?.short || 'Casa'}
                        </span>
                    </div>

                    <div class="opacity-30">
                        <span class="text-2xl font-black italic text-white">VS</span>
                    </div>

                    <!-- Equipa Fora -->
                    <div class="flex flex-col items-center flex-1">
                        <div class="relative mb-4 group-hover:-translate-y-2 transition-transform duration-500">
                            <div class="absolute inset-0 rounded-full blur-xl opacity-30 bg-pink-600"></div>
                            <img src="${awayLogo}" 
                                class="relative z-10 w-16 h-16 object-contain drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]" 
                                alt="away">
                        </div>
                        <span class="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] group-hover:text-white transition-colors line-clamp-1">
                            ${away?.names?.medium || away?.names?.long || away?.names?.short || 'Fora'}
                        </span>
                    </div>
                </div>
            </a>
            
            <!-- Botão de Palpite -->
            <div class="px-6 pb-6">
                <button onclick="handlePalpiteClick('${m.eventID}', '${home?.names?.medium || home?.names?.full || 'Casa'}', '${away?.names?.medium || away?.names?.full || 'Fora'}')" 
                    class="w-full py-4 rounded-2xl text-[11px] font-black text-white uppercase tracking-[3px] bg-gradient-to-r from-white/5 to-white/10 border border-white/10 hover:from-purple-600 hover:to-pink-600 transition-all duration-500 shadow-xl active:scale-95 cursor-pointer relative z-20">
                    Dar meu palpite
                </button>
            </div>`;
        
        container.appendChild(card);
    });
}

// ============================================================================
// SISTEMA DE PALPITES
// ============================================================================

/**
 * Abre o modal de palpite para um jogo específico
 * Verifica se o utilizador está autenticado antes
 */
window.handlePalpiteClick = (id, home, away) => {
    // Verificar se está autenticado
    if (!localStorage.getItem('goalDash_username')) {
        return openAuthModal();
    }

    // Guardar dados do jogo
    activeGame = { id, home, away };
    
    const modal = document.getElementById('prediction-modal');
    const title = document.getElementById('modal-teams-title');

    if (title) {
        title.innerText = `${home} vs ${away}`;
    }

    // Abrir modal com animação
    if (modal) {
        modal.classList.remove('hidden');
        modal.classList.add('flex');
        setTimeout(() => { modal.classList.add('active'); }, 10);
        document.body.classList.add('modal-open');
    }
};

/**
 * Envia o palpite do utilizador para a API
 * Valida os inputs e determina o vencedor
 */
window.submitPrediction = async () => {
    const h = parseInt(document.getElementById('input-home').value);
    const a = parseInt(document.getElementById('input-away').value);
    
    if (isNaN(h) || isNaN(a)) {
        return alert("Placar inválido!");
    }

    // Montar dados do palpite
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
    } catch (e) {
        console.error("Erro ao salvar:", e);
        alert("Erro ao salvar.");
    }
};

/**
 * Fecha o modal de palpite com animação
 */
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

// ============================================================================
// FUNÇÕES PÚBLICAS
// ============================================================================

// Permite mudar de liga através de botões HTML
window.changeSport = (leagueID) => fetchMatches(leagueID);

window.handleSearch = (query) => {
    const searchTerm = query.toLowerCase().trim();
    
    // Filtra se o termo de pesquisa aparece no nome da equipa da casa ou de fora
    const filtered = allLoadedMatches.filter(m => {
        const homeName = m.teams?.home?.names?.medium?.toLowerCase() || "";
        const awayName = m.teams?.away?.names?.medium?.toLowerCase() || "";
        return homeName.includes(searchTerm) || awayName.includes(searchTerm);
    });

    renderMatches(filtered); // Re-renderiza apenas os jogos que coincidem
};

// ============================================================================
// INICIALIZAÇÃO
// ============================================================================

document.addEventListener('DOMContentLoaded', () => {
    // Carregar interface inicial
    updateUserUI();
    fetchMatches();
    
    // Configurar formulário de login
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
    window.addEventListener('click', () => {
        document.getElementById('user-dropdown')?.classList.add('hidden');
    });
});