/**
 * GoalDash - ORQUESTRADOR (main.js)
 * Versão Final: Registo Blindado + Envio de Palpites
 */

document.addEventListener('DOMContentLoaded', () => {
    // 1. Inicialização da UI e Dados
    if (window.updateUserUI) window.updateUserUI();

    if (window.GD_API && window.GD_API.fetchMatches) {
        window.GD_API.fetchMatches('UEFA_CHAMPIONS_LEAGUE');
       // --- LÓGICA DE LOGIN ---
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.onsubmit = async (e) => {
            e.preventDefault();
            const user = document.getElementById('login-user').value.trim();
            const pass = document.getElementById('login-pass').value;
            const msg = document.getElementById('login-message');
            const btn = loginForm.querySelector('button[type="submit"]');

            btn.innerText = "A ENTRAR...";
            btn.disabled = true;

            const res = await window.GD_API.loginUser(user, pass);

            if (res.success) {
                localStorage.setItem('goalDash_username', res.username);
                window.location.reload();
            } else {
                if (msg) {
                    msg.innerText = res.error;
                    msg.classList.remove('hidden');
                    msg.className = "p-4 rounded-2xl bg-red-50 text-red-500 text-[14px] font-bold text-center mt-2 border border-red-100";
                }
                btn.innerText = "Entrar";
                btn.disabled = false;
            }
        };
    }
    };


    // 2. Lógica do Formulário de Registo
    const authForm = document.getElementById('auth-form');
    if (authForm) {
        authForm.onsubmit = async (e) => {
            e.preventDefault();

            const usernameInput = document.getElementById('auth-user');
            const emailInput = document.getElementById('auth-email');
            const passwordInput = document.getElementById('auth-pass');
            const messageBox = document.getElementById('auth-message');
            const submitBtn = authForm.querySelector('button[type="submit"]');

            const originalBtnText = submitBtn.innerText;
            submitBtn.innerText = "A VALIDAR...";
            submitBtn.disabled = true;

            if (messageBox) messageBox.classList.add('hidden');

            const userData = {
                username: usernameInput.value.trim(),
                email: emailInput.value.trim(),
                password: passwordInput.value,
                createdAt: new Date().toISOString()
            };

            // Chama a API (Valida duplicados antes de criar)
            const result = await window.GD_API.registerUser(userData);

            if (result.success) {
                localStorage.setItem('goalDash_username', userData.username);
                window.location.reload(); 
            } else {
    if (messageBox) {
        messageBox.innerText = result.error;
        messageBox.classList.remove('hidden');
        
        // Estilos atualizados com fonte maior
        messageBox.style.display = "block"; 
        messageBox.style.backgroundColor = "rgba(239, 68, 68, 0.15)";
        messageBox.style.color = "#ff4444";
        messageBox.style.border = "1px solid rgba(255, 68, 68, 0.3)";
        messageBox.style.padding = "12px"; // Mais respiro
        messageBox.style.fontSize = "14px"; // FONTE AUMENTADA (era 10px ou 11px)
        messageBox.style.fontWeight = "800"; // Mais negrito para ler bem
        messageBox.style.borderRadius = "8px";
        messageBox.style.marginTop = "15px";
    }
    
    submitBtn.innerText = originalBtnText;
    submitBtn.disabled = false;
}
        };
    }

    // 3. Lógica do Formulário de Palpites (Prediction Modal)
    const confirmPredictionBtn = document.getElementById('confirm-prediction-btn');
    if (confirmPredictionBtn) {
        confirmPredictionBtn.onclick = async () => {
            const homeScore = document.getElementById('modal-home-score').value;
            const awayScore = document.getElementById('modal-away-score').value;

            if (homeScore === "" || awayScore === "") {
                alert("Por favor, preencha ambos os resultados.");
                return;
            }

            confirmPredictionBtn.innerText = "A ENVIAR...";
            confirmPredictionBtn.disabled = true;

            const success = await window.GD_API.submitPrediction(homeScore, awayScore);

            if (success) {
                alert("Palpite enviado com sucesso!");
                if (window.closePredictionModal) {
                    window.closePredictionModal();
                } else {
                    document.getElementById('prediction-modal').classList.add('hidden');
                }
            } else {
                alert("Erro ao enviar palpite. Tente novamente.");
            }

            confirmPredictionBtn.innerText = "CONFIRMAR PALPITE";
            confirmPredictionBtn.disabled = false;
        };
    }
});

// --- FUNÇÕES GLOBAIS (Acessíveis via HTML onclick) ---

window.updateUserUI = () => {
    const user = localStorage.getItem('goalDash_username');
    const userMenuBtn = document.getElementById('user-menu-btn');
    const userDropdown = document.getElementById('user-dropdown');
    const authLinksContainer = document.getElementById('auth-links-container');

    if (!userMenuBtn) return;

    // Reset total do botão para evitar comportamentos duplicados
    userMenuBtn.onclick = null;

    if (user) {
        // --- UTILIZADOR LOGADO ---
        
        // 1. Esconde o grupo "Já tem conta? Faça Login"
        if (authLinksContainer) authLinksContainer.style.display = 'none';

        // 2. Define o clique para abrir/fechar o Dropdown
        userMenuBtn.onclick = (e) => {
            e.stopPropagation();
            if (userDropdown) userDropdown.classList.toggle('hidden');
        };

        // 3. Renderiza o design do Perfil (ex: PLINIO [P])
        userMenuBtn.innerHTML = `
            <div class="flex items-center gap-3 bg-white/5 border border-white/10 py-2 px-4 rounded-xl hover:bg-white/10 transition-all">
                <span class="text-[11px] font-black uppercase tracking-wider text-white">${user}</span>
                <div class="w-8 h-8 bg-[#9333ea] rounded-lg flex items-center justify-center shadow-lg shadow-purple-500/20">
                    <span class="text-white font-black text-xs">${user.charAt(0).toUpperCase()}</span>
                </div>
            </div>
        `;

        // 4. Monta o conteúdo do Dropdown com o link para history.html
        if (userDropdown) {
            userDropdown.innerHTML = `
                <div class="p-4 border-b border-white/5 bg-white/[0.02]">
                    <p class="text-[9px] text-white/40 uppercase font-black tracking-[2px]">A Minha Conta</p>
                </div>
                <a href="history.html" class="flex items-center gap-3 w-full text-left p-4 hover:bg-white/5 text-white text-[10px] font-black uppercase tracking-widest transition-all">
                    <span class="text-purple-500 text-sm">⌛</span> Meus Palpites
                </a>
                <button onclick="window.logout()" class="flex items-center gap-3 w-full text-left p-4 hover:bg-red-500/10 text-red-500 text-[10px] font-black uppercase tracking-widest transition-all border-t border-white/5">
                    <span class="text-sm">🚪</span> Sair da Conta
                </button>
            `;
        }

    } else {
        // --- UTILIZADOR NÃO LOGADO ---

        // 1. Mostra o grupo "Já tem conta? Faça Login"
        if (authLinksContainer) authLinksContainer.style.display = 'block';

        // 2. Define o clique para abrir o modal de REGISTO (Criar Conta)
        userMenuBtn.onclick = () => window.openAuthModal();

        // 3. Renderiza o botão "Criar Conta" em branco puro
        userMenuBtn.innerHTML = `
            <span class="text-[11px] font-black uppercase tracking-[2px] text-white hover:text-purple-400 transition-colors">
                Criar Conta
            </span>
        `;

        // 4. Garante que o dropdown está escondido
        if (userDropdown) userDropdown.classList.add('hidden');
    }
};

// Fecha o dropdown se clicar em qualquer lugar fora dele
document.addEventListener('click', () => {
    const userDropdown = document.getElementById('user-dropdown');
    if (userDropdown) userDropdown.classList.add('hidden');
});

// Fechar dropdown ao clicar fora
document.addEventListener('click', () => {
    const userDropdown = document.getElementById('user-dropdown');
    if (userDropdown) userDropdown.classList.add('hidden');
});

// Função de Logout para garantir que tudo limpa
window.logout = () => {
    localStorage.removeItem('goalDash_username');
    // Força o reload para a navbar atualizar instantaneamente
    window.location.reload(); 
};
window.handlePalpiteClick = (id, home, away) => {
    const user = localStorage.getItem('goalDash_username');
    
    if (!user) {
        const authModal = document.getElementById('auth-modal');
        const messageBox = document.getElementById('auth-message');
        if (authModal) {
            authModal.classList.remove('hidden');
            authModal.classList.add('flex');
            if (messageBox) {
                messageBox.innerText = "Inicie sessão para registar o seu palpite.";
                messageBox.classList.remove('hidden');
                messageBox.className = "p-3 rounded bg-amber-500/10 text-amber-500 text-[10px] font-bold text-center mt-2 border border-amber-500/20";
            }
        }
        return;
    }

    window.activeGame = { id, home, away };
    const modal = document.getElementById('prediction-modal');
    const title = document.getElementById('modal-teams-title');

    if (title) title.innerText = `${home} vs ${away}`;
    if (modal) {
        modal.classList.remove('hidden');
        modal.classList.add('flex');
    }
};
// FUNÇÕES DE NAVEGAÇÃO ENTRE MODAIS
window.switchToLogin = () => { window.closeAuthModal(); window.openLoginModal(); };
window.switchToRegister = () => { window.closeLoginModal(); window.openAuthModal(); };

window.openLoginModal = () => {
    const m = document.getElementById('login-modal');
    if(m) { m.classList.remove('hidden'); m.classList.add('flex'); }
};
window.closeLoginModal = () => { document.getElementById('login-modal').classList.add('hidden'); };


window.openAuthModal = () => {
    const authModal = document.getElementById('auth-modal');
    if (authModal) {
        authModal.classList.remove('hidden');
        authModal.classList.add('flex');
    }
};

window.closeAuthModal = () => {
    const authModal = document.getElementById('auth-modal');
    if (authModal) {
        authModal.classList.add('hidden');
        authModal.classList.remove('flex');
    }
};

window.logout = () => {
    localStorage.removeItem('goalDash_username');
    window.location.reload();
};

window.handleSearch = (query) => {
    const matches = window.allLoadedMatches || [];
    const term = query.toLowerCase().trim();
    if (!term) {
        if (window.UI) window.UI.renderMatches('matches-container', matches);
        return;
    }
    const filtrados = matches.filter(m => {
        const h = (m.teams?.home?.names?.medium || "").toLowerCase();
        const a = (m.teams?.away?.names?.medium || "").toLowerCase();
        return h.includes(term) || a.includes(term);
    });
    if (window.UI) window.UI.renderMatches('matches-container', filtrados);
};

window.changeSport = (id, name) => {
    const titleElement = document.getElementById('current-league-title');
    if (titleElement) titleElement.innerText = name ? name.toUpperCase() : "LIGA SELECIONADA";
    if (window.GD_API) window.GD_API.fetchMatches(id);
};