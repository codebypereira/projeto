/**
 * GoalDash - Controlador de Detalhes Final e Completo
 */

let currentMatchData = null;

const DETAILS_CONFIG = {
    API_KEY: 'cc48942721f415ae287937399dd882c7'
};

document.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(window.location.search);
    const eventID = params.get('id');
    if (eventID) fetchMatchDetails(eventID);
});

async function fetchMatchDetails(id) {
    try {
        const response = await fetch(`https://api.sportsgameodds.com/v2/events?apiKey=${DETAILS_CONFIG.API_KEY}&eventID=${id}`);
        const result = await response.json();
        
        if (result.data && result.data.length > 0) {
            currentMatchData = result.data[0];
            renderHeader();
            
            const status = currentMatchData.status?.status;
            const isNotStarted = (status === 'NS' || status === 'PST' || !currentMatchData.status?.clock);

            // Abre Formações se não começou, ou Sumário se já estiver live
            window.showTab(isNotStarted ? 'formacoes' : 'sumario');
        }
    } catch (error) {
        console.error("Erro ao carregar detalhes:", error);
    }
}

function renderHeader() {
    const m = currentMatchData;
    const container = document.getElementById('match-header');
    if (!m || !container) return;

    const getLogo = (code) => typeof window.getTeamLogo === 'function' ? window.getTeamLogo(code) : "";
    const hLogo = getLogo(m.teams?.home?.names?.short?.toUpperCase());
    const aLogo = getLogo(m.teams?.away?.names?.short?.toUpperCase());

    const status = m.status?.status;
    const isNotStarted = (status === 'NS' || status === 'PST' || !m.status?.clock);

    // TRATAMENTO DE DATA E HORA
    let timeStr = "--:--", dateStr = "--/--";
    const rawDate = m.status?.utcTime || m.status?.startsAt;
    if (rawDate) {
        const d = new Date(rawDate);
        if (!isNaN(d.getTime())) {
            timeStr = d.toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' });
            dateStr = d.toLocaleDateString('pt-PT', { day: '2-digit', month: '2-digit', year: 'numeric' });
        }
    }

    container.innerHTML = `
        <div class="bg-slate-900/40 border border-white/5 rounded-[2.5rem] p-10 backdrop-blur-xl relative overflow-hidden shadow-2xl animate-in fade-in duration-700">
            <div class="absolute top-6 left-1/2 -translate-x-1/2">
                <span class="text-[10px] font-black uppercase tracking-[0.4em] text-purple-500 bg-purple-500/10 px-6 py-2 rounded-full border border-purple-500/20">
                    ${m.tournament?.name || 'Competição'}
                </span>
            </div>

            <div class="flex flex-row items-center justify-between w-full max-w-5xl mx-auto mt-8">
                <div class="flex flex-col items-center flex-1">
                    <img src="${hLogo}" class="w-24 h-24 md:w-36 md:h-36 object-contain mb-4 drop-shadow-2xl">
                    <h2 class="text-sm md:text-2xl font-black uppercase text-white text-center tracking-tighter">${m.teams.home.names.medium}</h2>
                </div>

                <div class="flex flex-col items-center px-10 min-w-[220px]">
                    ${isNotStarted ? `
                        <div class="text-center">
                            <div class="text-6xl md:text-8xl font-black text-white tracking-tighter">${timeStr}</div>
                            <div class="mt-4 px-6 py-1 bg-white/5 border border-white/10 rounded-xl">
                                <span class="text-[11px] font-bold text-gray-400 uppercase tracking-[0.3em]">${dateStr}</span>
                            </div>
                        </div>
                    ` : `
                        <div class="text-6xl md:text-8xl font-black italic text-white leading-none tracking-tighter">
                            ${m.results?.reg?.home?.points ?? 0} - ${m.results?.reg?.away?.points ?? 0}
                        </div>
                        <div class="bg-purple-500/20 border border-purple-500/40 px-5 py-2 rounded-full mt-6 animate-pulse">
                            <span class="text-purple-400 font-black text-xs tracking-widest uppercase italic">● ${m.status.clock || 'LIVE'}'</span>
                        </div>
                    `}
                </div>

                <div class="flex flex-col items-center flex-1">
                    <img src="${aLogo}" class="w-24 h-24 md:w-36 md:h-36 object-contain mb-4 drop-shadow-2xl">
                    <h2 class="text-sm md:text-2xl font-black uppercase text-white text-center tracking-tighter">${m.teams.away.names.medium}</h2>
                </div>
            </div>
        </div>`;
}

window.showTab = function(tabName) {
    const content = document.getElementById('tab-content');
    if (!currentMatchData || !content) return;

    // Estilo dos botões das abas
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('text-purple-500', 'border-purple-500', 'bg-white/5');
        btn.classList.add('text-gray-500');
    });
    const activeBtn = document.getElementById(`btn-${tabName}`);
    if (activeBtn) {
        activeBtn.classList.add('text-purple-500', 'border-purple-500', 'bg-white/5');
        activeBtn.classList.remove('text-gray-500');
    }

    if (tabName === 'formacoes') renderLineups(content);
    else if (tabName === 'sumario') renderSummary(content);
    else if (tabName === 'estatisticas') renderStats(content);
    else if (tabName === 'h2h') content.innerHTML = `<div class="py-20 text-center text-gray-500 uppercase text-[10px] font-black">Histórico disponível em breve</div>`;
};

function renderLineups(container) {
    const players = currentMatchData.players ? Object.values(currentMatchData.players) : [];
    if (players.length === 0) {
        container.innerHTML = `<div class="py-24 text-center text-gray-600 font-black uppercase text-xs tracking-[0.2em]">Escalações ainda não confirmadas</div>`;
        return;
    }

    const hTeam = players.filter(p => p.team === 'home' || p.teamID === currentMatchData.teams.home.teamID);
    const aTeam = players.filter(p => p.team === 'away' || p.teamID === currentMatchData.teams.away.teamID);

    container.innerHTML = `
        <div class="max-w-6xl mx-auto mt-10 grid grid-cols-1 md:grid-cols-2 gap-10 px-4 pb-20">
            <div>
                <h3 class="text-purple-500 font-black uppercase text-xs mb-6 border-l-4 border-purple-500 pl-4">${currentMatchData.teams.home.names.medium}</h3>
                <div class="space-y-2">${hTeam.map(p => playerRow(p, 'purple')).join('')}</div>
            </div>
            <div>
                <h3 class="text-pink-500 font-black uppercase text-xs mb-6 border-l-4 border-pink-500 pl-4">${currentMatchData.teams.away.names.medium}</h3>
                <div class="space-y-2">${aTeam.map(p => playerRow(p, 'pink')).join('')}</div>
            </div>
        </div>`;
}

function playerRow(p, color) {
    return `
        <div class="flex items-center justify-between bg-white/5 p-4 rounded-2xl border border-white/5">
            <div class="flex items-center gap-4">
                <span class="text-${color}-400 font-black text-xs w-6">${p.number || '-'}</span>
                <div class="text-xs font-black uppercase text-white">${p.name || 'Jogador'}</div>
            </div>
            <span class="text-[9px] font-bold text-gray-500 uppercase">${p.position || ''}</span>
        </div>`;
}

function renderSummary(container) {
    const incidents = currentMatchData.incidents || [];
    if (incidents.length === 0) {
        container.innerHTML = `<div class="py-24 text-center text-gray-600 font-black uppercase text-xs tracking-[0.2em]">Sem eventos registados</div>`;
        return;
    }
    container.innerHTML = `<div class="max-w-xl mx-auto mt-10 space-y-4 px-4 pb-20">
        ${incidents.map(inc => {
            const isHome = inc.team === 'home';
            const icon = inc.type.includes('goal') ? '⚽' : inc.type.includes('yellow') ? '🟨' : inc.type.includes('red') ? '🟥' : '🔄';
            return `
                <div class="flex items-center gap-4 ${isHome ? '' : 'flex-row-reverse text-right'}">
                    <div class="text-purple-500 font-black italic text-sm w-10">${inc.clock}'</div>
                    <div class="flex-1 bg-white/5 border border-white/5 p-4 rounded-2xl flex items-center gap-3 ${isHome ? '' : 'flex-row-reverse'}">
                        <span class="text-xl">${icon}</span>
                        <div class="text-[11px] font-black uppercase text-white">${inc.player || 'Evento'}</div>
                    </div>
                </div>`;
        }).join('')}
    </div>`;
}

function renderStats(container) {
    const s = currentMatchData.results?.game || currentMatchData.results?.reg || {};
    if (!s.home && !s.away) {
        container.innerHTML = `<div class="py-24 text-center text-gray-600 font-black uppercase text-xs tracking-[0.2em]">Estatísticas disponíveis ao vivo</div>`;
        return;
    }
    const h = s.home || {}, a = s.away || {};
    const statsList = [
        { label: "Posse de Bola (%)", h: h.possession || 0, a: a.possession || 0 },
        { label: "Remates", h: h.shots || 0, a: a.shots || 0 },
        { label: "Cantos", h: h.corners || 0, a: a.corners || 0 }
    ];

    container.innerHTML = `<div class="max-w-2xl mx-auto mt-10 space-y-8 px-4 pb-20">
        ${statsList.map(item => {
            const total = (parseFloat(item.h) + parseFloat(item.a)) || 1;
            const percH = (parseFloat(item.h) / total) * 100;
            return `
            <div>
                <div class="flex justify-between text-[11px] font-black uppercase mb-3 text-white">
                    <span class="text-lg">${item.h}</span>
                    <span class="text-gray-500 self-center tracking-widest">${item.label}</span>
                    <span class="text-lg">${item.a}</span>
                </div>
                <div class="h-1.5 bg-white/5 rounded-full flex overflow-hidden border border-white/5">
                    <div class="bg-purple-600 h-full" style="width: ${percH}%"></div>
                    <div class="bg-pink-600 h-full ml-auto" style="width: ${100 - percH}%"></div>
                </div>
            </div>`;
        }).join('')}
    </div>`;
}