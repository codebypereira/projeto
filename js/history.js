const CONFIG = {
    MOCK_API : 'https://691c83153aaeed735c91269a.mockapi.io/predictions'
}

//Função para carregar o histórico
async function loadPredictionHistory() {
    const container = document.getElementById('history-container');
    if (!container) return;

    try {
        const res = await fetch(CONFIG.MOCK_API);
        const predictions = await res.json();

        if (!predictions || predictions.length === 0) {
            container.innerHTML = `
                <div class="text-center py-20 bg-white/5 rounded-3xl border border-dashed border-white/10">
                    <p class="text-white/40 font-medium">
                        Nenhum palpite encontrado até o momento.
                    </p>
                </div>`;
            return;
        }

        //Renderização dos cards
        container.innerHTML = predictions.reverse().map(pred => `
            <div class="glass-card p-6 rounded-3xl flex items-center justify-between transition-all hover:scale-[1.01] hover:bg-white/[0.08]">
                <div class="space-y-2">
                    <div class="flex items-center gap-2">
                        <span class="text-[9px] bg-purple-500 text-white font-black px-2 py-0.5 rounded-md uppercase">
                            ${pred.date ? pred.date.split(',')[0] : 'Data'}
                        </span>
                        <span class="text-[9px] text-white/50 font-bold tracking-widest">
                            ${pred.date && pred.date.split(',')[1] ? pred.date.split(',') : ''}
                        </span>
                    </div>
                    <h3 class="text-xl font-black italic text-white tracking-tight">${pred.matchTeams}</h3>
                    <div class="flex items-center gap-2">
                        <div class="w-4 h-4 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 shadow-[0_0_10px_rgba(168,85,247,0.5)]"></div>
                        <p class="text-white/60 text-xs font-bold">${pred.userName}</p>
                    </div>
                </div>

                <div text-right>
                    <p class="text-[10px] text-white/30 font-black uppercase mb-1 tracking-tighter">Seu palpite</p>
                    <div class="bg-white/10 border border-white/10 px-6 py-3 rounded-2xl">
                        <span class="text-2xl font-black italic">${pred.prediction}</span>
                    </div>
                </div>
            </div>
            `).join('');
    } catch (e) {
        console.error(`Erro ao carregar histórico: ${e}`);
        container.innerHTML = `
            <div class="text-center py-10">
                <p class="text-red-400 font-bold">Erro ao carregar dados. Verifique a conexão.</p>
            </div>`;
    }
}

document.addEventListener('DOMContentLoaded', loadPredictionHistory);