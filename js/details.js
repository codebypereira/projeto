let currentMatchData = null;

document.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(window.location.search);
    const eventID = params.get('id');
    
    if (!eventID) {
        document.getElementById('tab-content').innerHTML = `<p class="text-center py-20 text-red-500 font-black uppercase">ID não encontrado</p>`;
        return;
    }
    fetchMatchDetails(eventID);
});

async function fetchMatchDetails(id) {
    try {
        const apiKey = typeof CONFIG !== 'undefined' ? CONFIG.API_KEY : '';
        const response = await fetch(`https://api.sportsgameodds.com/v2/events?apiKey=${apiKey}&eventID=${id}`);
        const result = await response.json();
        
        if (!result.data || result.data.length === 0) return;

        // Pegamos o primeiro evento do array
        currentMatchData = result.data[0];
        renderHeader();
        showTab('sumario'); 
        
    } catch (error) {
        console.error("Erro ao carregar detalhes:", error);
    }
}

function renderHeader() {
    const m = currentMatchData;
    if (!m) return;
    
    const header = document.getElementById('match-header');

    // --- NOMES DAS EQUIPAS (Já funcionando) ---
    const homeName = m.teams?.home?.names?.full || 
                     m.teams?.home?.names?.medium || 
                     m.teams?.home?.names?.short || 
                     "Equipa Casa";

    const awayName = m.teams?.away?.names?.full || 
                     m.teams?.away?.names?.medium || 
                     m.teams?.away?.names?.short || 
                     "Equipa Fora";

   // Pega a competição conforme as tuas ferramentas de inspeção mostraram
    const competition = m.info?.seasonWeek || "Competição Desconhecida";

    // --- DATA E HORA (Igual ao seu index) ---
    const rawDate = m.startsAt || m.status?.startsAt; 
    let day = "--/--", time = "--:--";

    if (rawDate) {
        const gameDate = new Date(rawDate);
        if (!isNaN(gameDate.getTime())) {
            day = gameDate.toLocaleDateString('pt-PT', { day: '2-digit', month: '2-digit' });
            time = gameDate.toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' });
        }
    }

    let statusTexto = `${day} • ${time}`;
    if (m.status?.live === true) statusTexto = "AO VIVO";
    else if (m.status?.completed === true) statusTexto = "ENCERRADO";

    header.innerHTML = `
        <div class="bg-slate-900/40 border border-white/5 rounded-[2.5rem] p-8 md:p-12 backdrop-blur-xl shadow-2xl">
            <div class="text-center mb-6">
                <span class="text-[10px] font-black text-gray-500 uppercase tracking-[4px]">Match Info</span>
            </div>

            <div class="flex flex-col md:flex-row items-center justify-between gap-8 max-w-5xl mx-auto">
                <div class="flex flex-col items-center flex-1 text-center">
                    <img src="${getTeamLogo(m.teams?.home?.names?.short)}" class="w-24 h-24 mb-4 object-contain">
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
                    <img src="${getTeamLogo(m.teams?.away?.names?.short)}" class="w-24 h-24 mb-4 object-contain">
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
function showTab(tabName) {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('text-purple-500', 'border-purple-500', 'text-white'));
    const activeBtn = document.getElementById(`btn-${tabName}`);
    if (activeBtn) activeBtn.classList.add('text-purple-500', 'border-purple-500', 'text-white');

    const content = document.getElementById('tab-content');
    
    if (tabName === 'sumario') {
        content.innerHTML = `<div class="py-20 text-center text-gray-500 font-black text-[10px] uppercase tracking-widest">Aguardando dados de sumário...</div>`;
    } else if (tabName === 'estatisticas') {
        renderEstatisticas();
    } else {
        content.innerHTML = `<div class="py-20 text-center text-gray-500 font-black text-[10px] uppercase tracking-widest">Brevemente disponível</div>`;
    }
}

function renderEstatisticas() {
    const content = document.getElementById('tab-content');
    if (currentMatchData.status?.displayLong === "Upcoming") {
        content.innerHTML = `
            <div class="py-20 text-center animate-in fade-in duration-700">
                <div class="inline-block p-12 bg-slate-900/20 rounded-[3rem] border border-white/5 backdrop-blur-sm">
                    <p class="text-gray-500 font-black text-[10px] uppercase tracking-[4px]">Estatísticas disponíveis no início do jogo</p>
                </div>
            </div>`;
    } else {
        // Aqui podes adicionar a lógica de barras de estatísticas para jogos live/encerrados
        content.innerHTML = `<div class="py-20 text-center text-gray-500 font-black text-[10px] uppercase tracking-widest">Estatísticas em tempo real...</div>`;
    }
}