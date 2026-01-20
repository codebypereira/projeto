window.UI = {
    showLoading: (containerId) => {
        const container = document.getElementById(containerId);
        if (container) {
            container.innerHTML = `<div class="col-span-full text-center py-20 text-purple-500 animate-pulse font-black uppercase tracking-widest text-[10px]">Sincronizando Dados...</div>`;
        }
    },

    renderMatches: (containerId, matches) => {
        const container = document.getElementById(containerId);
        if (!container) return;

        if (!matches || matches.length === 0) {
            container.innerHTML = `<div class="col-span-full text-center py-20 opacity-30 font-black uppercase text-xs">Sem eventos disponíveis</div>`;
            return;
        }

        // Usamos um try/catch dentro do map para que, se um card der erro, os outros continuem a aparecer
        const html = matches.map(match => {
            try {
                return window.UI.components.matchCard(match);
            } catch (e) {
                console.warn("Erro ao renderizar card individual:", e);
                return ""; 
            }
        }).join('');
        
        container.innerHTML = html;
    },

    components: {
        matchCard: (match) => {
            // SEGURANÇA TOTAL: Se o nome não existir, não quebra o site
            const hName = match.teams?.home?.names?.medium || match.teams?.home?.name || "Equipa Casa";
            const aName = match.teams?.away?.names?.medium || match.teams?.away?.name || "Equipa Fora";
            const hID = match.teams?.home?.teamID || 0;
            const aID = match.teams?.away?.teamID || 0;

            return `
                <div class="bg-black/40 border border-white/5 p-8 rounded-[2.5rem] text-center">
                    <div class="flex justify-center mb-4">
                        <span class="bg-white/5 px-4 py-1 rounded-full text-[10px] font-bold text-white/50">PRÓXIMO JOGO</span>
                    </div>
                    <div class="flex items-center justify-between gap-4 mb-8">
                        <div class="flex-1">
                            <img src="https://media.api-sports.io/football/teams/${hID}.png" class="w-16 h-16 mx-auto mb-2 object-contain" onerror="this.src='https://via.placeholder.com/60?text=?'">
                            <span class="text-[10px] font-black text-white uppercase block">${hName}</span>
                        </div>
                        <span class="text-xl font-black italic text-white/10">VS</span>
                        <div class="flex-1">
                            <img src="https://media.api-sports.io/football/teams/${aID}.png" class="w-16 h-16 mx-auto mb-2 object-contain" onerror="this.src='https://via.placeholder.com/60?text=?'">
                            <span class="text-[10px] font-black text-white uppercase block">${aName}</span>
                        </div>
                    </div>
                    <button onclick="window.location.href='matchdetails.html?id=${match.eventID}'" class="w-full py-4 rounded-2xl bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest hover:bg-purple-600 transition-all">Dar Meu Palpite</button>
                </div>`;
        }
    }
};