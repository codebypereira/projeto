/**
 * GoalDash - Controlador de Detalhes (Versão Horizontal Fixa)
 */

let currentMatchData = null;

const DETAILS_CONFIG = {
    API_KEY: 'cc48942721f415ae287937399dd882c7'
};

document.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(window.location.search);
    const eventID = params.get('id');
    
    if (!eventID) return;
    fetchMatchDetails(eventID);
});

async function fetchMatchDetails(id) {
    try {
        const response = await fetch(`https://api.sportsgameodds.com/v2/events?apiKey=${DETAILS_CONFIG.API_KEY}&eventID=${id}`);
        const result = await response.json();
        
        if (result.data && result.data.length > 0) {
            currentMatchData = result.data[0];
            renderHeader();
            showTab('sumario');
        }
    } catch (error) {
        console.error("Erro ao carregar detalhes:", error);
    }
}

function renderHeader() {
    const m = currentMatchData;
    const container = document.getElementById('match-header');
    if (!m || !container) return;

    // Lógica do seu teams.js (getTeamLogo)
    const hLogo = window.getTeamLogo(m.teams?.home?.names?.short || "");
    const aLogo = window.getTeamLogo(m.teams?.away?.names?.short || "");

    const homeName = m.teams?.home?.names?.medium || "CASA";
    const awayName = m.teams?.away?.names?.medium || "FORA";

    // Estrutura Horizontal (flex-row sempre)
    container.innerHTML = `
        <div class="bg-slate-900/40 border border-white/5 rounded-[2.5rem] p-8 md:p-12 backdrop-blur-xl shadow-2xl">
            <div class="flex flex-row items-center justify-between w-full max-w-5xl mx-auto">
                
                <div class="flex flex-col items-center flex-1">
                    <div class="relative mb-4 group">
                        <div class="absolute inset-0 rounded-full blur-3xl opacity-20 bg-purple-600"></div>
                        <img src="${hLogo}" class="relative z-10 w-20 h-20 md:w-32 md:h-32 object-contain">
                    </div>
                    <h2 class="text-sm md:text-3xl font-black italic uppercase text-white tracking-tighter text-center">${homeName}</h2>
                </div>
                
                <div class="flex flex-col items-center px-4 md:px-10 min-w-fit">
                    <div class="text-4xl md:text-7xl font-black italic text-white mb-2 tracking-tighter">
                        ${m.status?.displayLong === "Upcoming" ? 'VS' : (m.status?.score?.home ?? 0) + ' - ' + (m.status?.score?.away ?? 0)}
                    </div>
                    <div class="bg-purple-500/10 border border-purple-500/20 px-4 py-1 md:px-6 md:py-2 rounded-full mb-2">
                        <span class="text-purple-400 font-black uppercase tracking-widest text-[8px] md:text-[10px]">
                            ${m.status?.live ? '● AO VIVO' : (m.status?.completed ? 'ENCERRADO' : 'AGENDADO')}
                        </span>
                    </div>
                    <div class="text-gray-500 font-bold text-[8px] md:text-[10px] uppercase tracking-[2px]">
                        ${formatarData(m.status?.startsAt || m.startsAt)}
                    </div>
                </div>

                <div class="flex flex-col items-center flex-1">
                    <div class="relative mb-4 group">
                        <div class="absolute inset-0 rounded-full blur-3xl opacity-20 bg-pink-600"></div>
                        <img src="${aLogo}" class="relative z-10 w-20 h-20 md:w-32 md:h-32 object-contain">
                    </div>
                    <h2 class="text-sm md:text-3xl font-black italic uppercase text-white tracking-tighter text-center">${awayName}</h2>
                </div>
            </div>

            <div class="mt-8 pt-6 border-t border-white/5 text-center">
                 <span class="text-[10px] font-black uppercase tracking-widest text-gray-400">
                    <span class="text-purple-500 italic mr-2">COMPETIÇÃO:</span> 
                    <span class="text-white">${m.info?.seasonWeek || "LIGUE 1 25/26"}</span>
                 </span>
            </div>
        </div>
    `;
}

function formatarData(dataString) {
    if (!dataString) return "";
    const d = new Date(dataString);
    return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }) + " • " + 
           d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

window.showTab = function(tabName) {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('text-purple-500', 'border-purple-500', 'text-white'));
    const btn = document.getElementById(`btn-${tabName}`);
    if (btn) btn.classList.add('text-purple-500', 'border-purple-500', 'text-white');

    const content = document.getElementById('tab-content');
    content.innerHTML = `<div class="py-20 text-center text-gray-500 font-black text-[10px] uppercase tracking-widest">A carregar ${tabName}...</div>`;
};
function renderEstatisticas() {

    const content = document.getElementById('tab-content');

    content.innerHTML = `<div class="py-20 text-center text-gray-500 font-black text-[10px] uppercase tracking-widest">Estatísticas em tempo real...</div>`;

}