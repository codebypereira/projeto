/**
 * MÓDULO: Controlador de Detalhes do Evento (Frontend)
 * DESCRIÇÃO: Este script atua como controlador da camada de apresentação, responsável 
 * pela orquestração entre a interface do utilizador (UI) e a API de dados desportivos.
 * ARQUITETURA: Event-Driven (Orientado a Eventos) e Manipulação Assíncrona.
 */

// Estado Global: Armazena a estrutura de dados do evento para acesso partilhado entre funções.
// Inicializado como nulo para validação de integridade antes da renderização.
let currentMatchData = null;

/**
 * Event Listener: Inicialização do Ciclo de Vida
 * Disparado quando a árvore DOM foi completamente carregada e analisada.
 * Responsável pela extração de parâmetros da URL e início da cadeia de execução.
 */
document.addEventListener('DOMContentLoaded', () => {
    // Instanciação de URLSearchParams para extração segura de Query Parameters (GET).
    const params = new URLSearchParams(window.location.search);
    const eventID = params.get('id');
    
    // Validação de Entrada: Interrompe a execução caso o ID seja inexistente.
    if (!eventID) {
        document.getElementById('tab-content').innerHTML = `<p class="text-center py-20 text-red-500 font-black uppercase">ID não encontrado</p>`;
        return;
    }
    
    // Início da comunicação assíncrona com o serviço de dados.
    fetchMatchDetails(eventID);
});

/**
 * Função Assíncrona: fetchMatchDetails
 * Realiza a requisição HTTP (GET) ao endpoint da API para obter o payload do evento.
 * * @param {string} id - O identificador único do evento (UUID).
 * @returns {Promise<void>} - Não retorna valor, mas altera o estado global `currentMatchData`.
 */
async function fetchMatchDetails(id) {
    try {
        // Recuperação segura da chave de API a partir do objeto de configuração global.
        const apiKey = typeof CONFIG !== 'undefined' ? CONFIG.API_KEY : '';
        
        // Execução da Promise fetch com interpolação de strings para construção da URI.
        const response = await fetch(`https://api.sportsgameodds.com/v2/events?apiKey=${apiKey}&eventID=${id}`);
        
        // Deserialização do JSON de resposta.
        const result = await response.json();
        
        // Verificação de integridade do payload recebido.
        if (!result.data || result.data.length === 0) return;

        // Atualização do Estado Global: Armazena o primeiro objeto do array de dados.
        currentMatchData = result.data[0];
        
        // Disparo das funções de renderização da UI (Header e Aba Inicial).
        renderHeader();
        showTab('sumario'); 
        
    } catch (error) {
        // Tratamento de Exceções: Log de erro para depuração.
        console.error("Erro crítico na aquisição de dados:", error);
    }
}

/**
 * Função Auxiliar: getTeamLogo
 * Normaliza o nome da equipa para mapear o caminho do ativo (imagem) local.
 * Implementa uma estratégia de fallback para garantir a integridade visual.
 * * @param {string} name - Nome abreviado da equipa.
 * @returns {string} - Caminho relativo do ficheiro de imagem.
 */
function getTeamLogo(name) {
    // Guarda Lógica: Retorna imagem padrão se o nome for indefinido.
    if (!name) return 'logos/default.png';
    
    // Sanitização: Remove espaços em branco via Regex para corresponder ao sistema de ficheiros.
    const fileName = name.replace(/\s+/g, ''); 
    return `logos/${fileName}.png`;
}

/**
 * Função de Renderização: renderHeader
 * Responsável pela injeção dinâmica de dados no DOM (Document Object Model).
 * Utiliza 'Optional Chaining' (?.) e 'Nullish Coalescing' (||) para robustez contra dados nulos.
 */
function renderHeader() {
    const m = currentMatchData;
    // Prevenção de Runtime Error: Aborta se o objeto de dados não estiver instanciado.
    if (!m) return;
    
    const header = document.getElementById('match-header');

    // Lógica de Prioridade de Nomes (Fallback Chain): Full > Medium > Short > Placeholder.
    const homeName = m.teams?.home?.names?.full || 
                     m.teams?.home?.names?.medium || 
                     m.teams?.home?.names?.short || 
                     "Equipa Casa";

    const awayName = m.teams?.away?.names?.full || 
                     m.teams?.away?.names?.medium || 
                     m.teams?.away?.names?.short || 
                     "Equipa Fora";

    // Extração de Metadados: Competição/Liga.
    const competition = m.info?.seasonWeek || "Competição Desconhecida";

    // Normalização Temporal: Conversão de timestamp ISO 8601 para formato local (pt-PT).
    const rawDate = m.startsAt || m.status?.startsAt; 
    let day = "--/--", time = "--:--";

    if (rawDate) {
        const gameDate = new Date(rawDate);
        // Validação Temporal: Garante que a data é válida antes da formatação.
        if (!isNaN(gameDate.getTime())) {
            day = gameDate.toLocaleDateString('pt-PT', { day: '2-digit', month: '2-digit' });
            time = gameDate.toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' });
        }
    }

    // Determinação do Estado do Jogo (Live, Encerrado ou Agendado).
    let statusTexto = `${day} • ${time}`;
    if (m.status?.live === true) statusTexto = "AO VIVO";
    else if (m.status?.completed === true) statusTexto = "ENCERRADO";

    // Manipulação do DOM via Template Literals para construção eficiente da interface.
    // Inclui tratamento de erro inline nas tags <img> (onerror) para robustez.
    header.innerHTML = `
        <div class="bg-slate-900/40 border border-white/5 rounded-[2.5rem] p-8 md:p-12 backdrop-blur-xl shadow-2xl">
            <div class="text-center mb-6">
                <span class="text-[10px] font-black text-gray-500 uppercase tracking-[4px]">Match Info</span>
            </div>

            <div class="flex flex-col md:flex-row items-center justify-between gap-8 max-w-5xl mx-auto">
                <div class="flex flex-col items-center flex-1 text-center">
                    <img src="${getTeamLogo(m.teams?.home?.names?.short)}" 
                         onerror="this.src='logos/default.png'" 
                         class="w-24 h-24 mb-4 object-contain">
                    <h2 class="text-xl md:text-3xl font-black italic uppercase text-white tracking-tighter">${homeName}</h2>
                </div>
                
                <div class="text-center px-10">
                    <div class="text-6xl font-black italic tracking-tighter text-white mb-4">
                        ${m.status?.displayLong === "Upcoming" ? 'VS' : (m.status?.score?.home ?? 0) + ' - ' + (m.status?.score?.away ?? 0)}
                    </div>
                    <div class="bg-purple-500/10 border border-purple-500/20 px-6 py-2 rounded-full inline-block">
                        <span class="text-purple-400 font-black tracking-[2px] uppercase ${m.status?.live ? 'animate-pulse' : ''}">
                            ${statusTexto}
                        </span>
                    </div>
                </div>

                <div class="flex flex-col items-center flex-1 text-center">
                    <img src="${getTeamLogo(m.teams?.away?.names?.short)}" 
                         onerror="this.src='logos/default.png'" 
                         class="w-24 h-24 mb-4 object-contain">
                    <h2 class="text-xl md:text-3xl font-black italic uppercase text-white tracking-tighter">${awayName}</h2>
                </div>
            </div>

            <div class="mt-10 pt-8 border-t border-white/5 flex justify-center items-center text-[10px] font-black uppercase tracking-widest text-gray-400">
                <div class="flex items-center gap-2">
                    <span class="text-purple-500/50 italic font-black">Competição:</span> 
                    <span class="text-white font-bold">${competition}</span>
                </div>
            </div>
        </div>
    `;
}

/**
 * Função de Navegação: showTab
 * Gere a alternância de visibilidade entre as secções de conteúdo (Tabs).
 * Aplica manipulação de classes CSS para indicar o estado ativo.
 * * @param {string} tabName - O identificador da aba a ser exibida.
 */
function showTab(tabName) {
    // Reset de Estado: Remove formatação ativa de todos os botões (Iteração em NodeList).
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('text-purple-500', 'border-purple-500', 'text-white'));
    
    // Definição de Estado Ativo: Aplica classes ao botão selecionado.
    const activeBtn = document.getElementById(`btn-${tabName}`);
    if (activeBtn) activeBtn.classList.add('text-purple-500', 'border-purple-500', 'text-white');

    const content = document.getElementById('tab-content');
    
    // Roteamento de Conteúdo: Renderiza com base na seleção.
    if (tabName === 'sumario') {
        content.innerHTML = `<div class="py-20 text-center text-gray-500 font-black text-[10px] uppercase tracking-widest">Aguardando dados de sumário...</div>`;
    } else if (tabName === 'estatisticas') {
        renderEstatisticas();
    } else {
        content.innerHTML = `<div class="py-20 text-center text-gray-500 font-black text-[10px] uppercase tracking-widest">Brevemente disponível</div>`;
    }
}

/**
 * Função de Renderização: renderEstatisticas
 * Renderização condicional baseada no status do evento.
 * Evita a exibição de componentes vazios se o jogo ainda não tiver iniciado (Upcoming).
 */
function renderEstatisticas() {
    const content = document.getElementById('tab-content');
    
    // Verificação de Estado: Se o jogo é futuro (Upcoming), exibe mensagem informativa.
    if (currentMatchData.status?.displayLong === "Upcoming") {
        content.innerHTML = `
            <div class="py-20 text-center animate-in fade-in duration-700">
                <div class="inline-block p-12 bg-slate-900/20 rounded-[3rem] border border-white/5 backdrop-blur-sm">
                    <p class="text-gray-500 font-black text-[10px] uppercase tracking-[4px]">Estatísticas disponíveis no início do jogo</p>
                </div>
            </div>`;
    } else {
        // Placeholder para injeção futura de gráficos ou dados em tempo real.
        content.innerHTML = `<div class="py-20 text-center text-gray-500 font-black text-[10px] uppercase tracking-widest">Estatísticas em tempo real...</div>`;
    }
}