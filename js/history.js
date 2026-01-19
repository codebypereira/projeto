/**
 * MÓDULO: Gestor de Histórico de Palpites
 * PROJETO: GoalDash - Programação Web
 * * DESCRIÇÃO:
 * Este script é responsável pela recuperação e exibição dos palpites personalizados
 * de cada utilizador. Implementa lógica de filtragem no lado do cliente (Client-side filtering)
 * e manipulação de objetos Date para formatação temporal.
 */

// ============================================================================
// 1. CONFIGURAÇÃO E ENDPOINTS
// ============================================================================

const CONFIG = {
    /** * Endpoint da MockAPI: Armazena a persistência de dados dos palpites.
     * O Schema esperado contém: matchId, username, homeScore, awayScore e createdAt.
     */
    MOCK_API: 'https://696278a1d9d64c761907fe9a.mockapi.io/api/dash/predictions'
};

// ============================================================================
// 2. LÓGICA DE RECUPERAÇÃO DE DADOS (Data Retrieval)
// ============================================================================

/**
 * Função Assíncrona: loadPredictionHistory
 * Orquestra o ciclo de vida da página de histórico:
 * 1. Valida a sessão do utilizador via LocalStorage.
 * 2. Consome o payload total da MockAPI.
 * 3. Filtra os registos correspondentes ao utilizador autenticado.
 * 4. Inverte a ordem cronológica para exibir o palpite mais recente primeiro.
 */
async function loadPredictionHistory() {
    const container = document.getElementById('history-container');
    const loggedUser = localStorage.getItem('goalDash_username');

    // Early Return: Previne erros se o contentor de destino não existir no DOM
    if (!container) return;

    // Sincronização da UI: Atualiza o nome do utilizador no Header
    const headerUserSpan = document.querySelector('#user-menu-btn span');
    if (headerUserSpan && loggedUser) {
        headerUserSpan.textContent = loggedUser;
    }

    // Controlo de Acesso: Bloqueia a visualização se não houver sessão ativa
    if (!loggedUser) {
        container.innerHTML = `
            <div class="text-center py-20 bg-red-500/10 border border-red-500/20 rounded-3xl">
                <p class="text-red-400 font-black uppercase tracking-widest text-xs">
                    Precisas de estar logado para ver o teu histórico.
                </p>
                <a href="index.html" class="inline-block mt-4 text-white underline text-xs font-bold">VOLTAR AO INÍCIO</a>
            </div>
        `;
        return;
    }

    try {
        // Operação de I/O Assíncrona
        const response = await fetch(CONFIG.MOCK_API);
        const allData = await response.json();

        /** * Lógica de Filtragem: Compara o campo 'username' do Schema com a sessão ativa.
         * Esta abordagem garante que o utilizador apenas visualize os seus próprios dados.
         */
        const userPredictions = allData.filter(p => p.username === loggedUser);

        // Feedback de Estado Vazio (Zero State)
        if (userPredictions.length === 0) {
            container.innerHTML = `
                <div class="text-center py-20 bg-white/5 rounded-3xl border border-dashed border-white/10">
                    <p class="text-white/30 font-black uppercase tracking-widest text-xs">
                        Ainda não fizeste nenhum palpite, ${loggedUser}.
                    </p>
                </div>
            `;
            return;
        }

        /** * Renderização: Inverte o Array (.reverse()) para seguir o padrão de UX
         * de "Last In, First Out" (LIFO) na listagem cronológica.
         */
        renderCards(userPredictions.reverse());

    } catch (error) {
        console.error("Erro crítico ao consumir MockAPI:", error);
        container.innerHTML = `<p class="text-center text-red-400 font-bold uppercase text-[10px]">Erro na comunicação com o servidor de dados.</p>`;
    }
}

// ============================================================================
// 3. CAMADA DE RENDERIZAÇÃO (View Engine)
// ============================================================================

/**
 * Função: renderCards
 * Transforma o Array de objetos em elementos HTML (Cards).
 * Utiliza o método .map() para gerar uma coleção de strings HTML de forma declarativa.
 * @param {Array} predictions - Lista filtrada de palpites.
 */
function renderCards(predictions) {
    const container = document.getElementById('history-container');
    
    container.innerHTML = predictions.map(pred => {
        /**
         * Normalização Temporal:
         * Converte o timestamp ISO do servidor para formatos legíveis pt-PT.
         */
        const dateDisplay = pred.createdAt ? new Date(pred.createdAt).toLocaleDateString('pt-PT') : 'Data n/a';
        const timeDisplay = pred.createdAt ? new Date(pred.createdAt).toLocaleTimeString('pt-PT', {hour: '2-digit', minute:'2-digit'}) : '';

        // Template Literal: Representação visual do Palpite
        return `
        <div class="glass-card p-6 rounded-3xl flex items-center justify-between transition-all hover:scale-[1.01] hover:bg-white/[0.08] border border-white/5 mb-4">
            <div class="space-y-2">
                <div class="flex items-center gap-2">
                    <span class="text-[9px] bg-purple-500 text-white font-black px-2 py-0.5 rounded-md uppercase">
                        ${dateDisplay}
                    </span>
                    <span class="text-[9px] text-white/50 font-bold tracking-widest">
                        ${timeDisplay}
                    </span>
                </div>
                <h3 class="text-xl font-black italic text-white tracking-tight uppercase">${pred.matchId || 'Partida Desconhecida'}</h3>
                <div class="flex items-center gap-2">
                    <div class="w-4 h-4 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 shadow-[0_0_10px_rgba(168,85,247,0.5)]"></div>
                    <p class="text-white/60 text-xs font-bold">${pred.username}</p>
                </div>
            </div>

            <div class="text-right">
                <p class="text-[10px] text-white/30 font-black uppercase mb-1 tracking-tighter">Teu palpite</p>
                <div class="bg-white/10 border border-white/10 px-6 py-3 rounded-2xl flex items-center gap-3">
                    <span class="text-2xl font-black italic text-white">${pred.homeScore}</span>
                    <span class="text-xs font-bold text-white/20">X</span>
                    <span class="text-2xl font-black italic text-white">${pred.awayScore}</span>
                </div>
            </div>
        </div>
        `;
    }).join(''); // Concatena o array de strings para injeção no innerHTML
}

// ============================================================================
// 4. EVENT LISTENERS E UTILITÁRIOS
// ============================================================================

/**
 * Gestão de Eventos: Menu Dropdown
 * Implementa a abertura/fecho do menu de perfil no contexto do histórico.
 */
document.addEventListener('click', (e) => {
    const dropdown = document.getElementById('user-dropdown');
    const menuBtn = document.getElementById('user-menu-btn');
    
    if (menuBtn && menuBtn.contains(e.target)) {
        dropdown.classList.toggle('hidden');
    } else {
        dropdown?.classList.add('hidden');
    }
});

/**
 * Função: logout
 * Invalida a sessão local e redireciona para a página principal.
 */
window.logout = () => {
    localStorage.removeItem('goalDash_username');
    window.location.href = 'index.html';
};

// Inicialização: Dispara a carga de dados assim que o DOM estiver pronto.
document.addEventListener('DOMContentLoaded', loadPredictionHistory);