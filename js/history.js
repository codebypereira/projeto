const CONFIG = {
    // URL exato do teu projeto que aparece na imagem
    MOCK_API: 'https://696278a1d9d64c761907fe9a.mockapi.io/api/dash/predictions'
};

// 1. FUNÇÃO PRINCIPAL: CARREGAR HISTÓRICO
async function loadPredictionHistory() {
    const container = document.getElementById('history-container');
    const loggedUser = localStorage.getItem('goalDash_username');

    if (!container) return;

    // Atualiza o nome do utilizador no Header (se o elemento existir)
    const headerUserSpan = document.querySelector('#user-menu-btn span');
    if (headerUserSpan && loggedUser) {
        headerUserSpan.textContent = loggedUser;
    }

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
        // Faz a chamada para a MockAPI
        const response = await fetch(CONFIG.MOCK_API);
        const allData = await response.json();

        // Filtra os dados: usa "username" (minúsculo) conforme o teu Schema
        const userPredictions = allData.filter(p => p.username === loggedUser);

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

        // Renderiza os cards (Invertendo para mostrar o mais recente primeiro)
        renderCards(userPredictions.reverse());

    } catch (error) {
        console.error("Erro ao carregar MockAPI:", error);
        container.innerHTML = `<p class="text-center text-red-400">Erro ao carregar dados do servidor.</p>`;
    }
}

// 2. FUNÇÃO PARA GERAR O HTML DOS CARDS
function renderCards(predictions) {
    const container = document.getElementById('history-container');
    
    container.innerHTML = predictions.map(pred => {
        // Tratamento da data (campo createdAt do teu Schema)
        const dateDisplay = pred.createdAt ? new Date(pred.createdAt).toLocaleDateString('pt-PT') : 'Data n/a';
        const timeDisplay = pred.createdAt ? new Date(pred.createdAt).toLocaleTimeString('pt-PT', {hour: '2-digit', minute:'2-digit'}) : '';

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
    }).join('');
}

// 3. LÓGICA DO MENU DROPDOWN NO HISTÓRICO
document.addEventListener('click', (e) => {
    const dropdown = document.getElementById('user-dropdown');
    const menuBtn = document.getElementById('user-menu-btn');
    
    if (menuBtn && menuBtn.contains(e.target)) {
        dropdown.classList.toggle('hidden');
    } else {
        dropdown?.classList.add('hidden');
    }
});

// 4. FUNÇÃO DE LOGOUT
window.logout = () => {
    localStorage.removeItem('goalDash_username');
    window.location.href = 'index.html';
};

// INICIALIZAR
document.addEventListener('DOMContentLoaded', loadPredictionHistory);