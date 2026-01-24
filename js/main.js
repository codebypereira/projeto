/**
 * GoalDash - ORQUESTRADOR CENTRAL (main.js)
 * Versão: 3.7.0 - Ultra Full Edition (Sem cortes)
 * Foco: Stats, Auth, Matches, History, Details e Modais.
 */

// ========================================================
// 1. FUNÇÕES GLOBAIS DE CLIQUE & LIGAS (ESSENCIAL)
// ========================================================

// --- FUNÇÃO PARA TROCAR LIGA (Atualizada para suportar Live) ---
// --- FUNÇÃO PARA TROCAR LIGA (MANTIDA ORIGINAL) ---

window.allLoadedMatches = [];
window.activeGame = null; 

window.changeSport = async (leagueID, leagueName) => {
    console.log("🏆 Trocando para liga:", leagueID);
    window.currentLeague = leagueID;

    const titleEl = document.getElementById('current-league-title');
    if (titleEl) titleEl.innerText = leagueName ? leagueName.toUpperCase() : leagueID;

    if (window.location.pathname.includes('live.html')) {
        await window.loadLiveMatches(leagueID);
    } else {
        if (window.GD_API) await window.GD_API.fetchMatches(leagueID);
    }
};

window.loadLiveMatches = async (leagueID) => {
    // 1. Pega o container e mostra o loading primeiro
    const container = document.getElementById('live-matches-container');
    if (container) {
        container.innerHTML = `<div class="col-span-full text-center py-20 text-red-500 animate-pulse font-black uppercase text-[10px]">Verificando Jogos em Andamento...</div>`;
    }

    if (!window.GD_API) {
        console.error("🚨 API Não carregada");
        return;
    }

    try {
        // 2. Define qual liga buscar
        const targetLeague = leagueID || window.currentLeague || 'LALIGA';
        
        // 3. BUSCA OS DADOS (Aqui é onde a allMatches nasce)
        const allMatches = await window.GD_API.fetchMatches(targetLeague);
        
        console.log("📡 Dados brutos da API:", allMatches);

        if (!allMatches || !Array.isArray(allMatches)) {
            if (container) container.innerHTML = `<div class="col-span-full text-center py-20 text-white/20 font-black uppercase text-[10px]">Nenhum dado recebido da API.</div>`;
            return;
        }

        // 4. FILTRAGEM (Agora sim allMatches existe!)
        const liveMatches = allMatches.filter(m => {
            const isStarted = m.status?.started === true;
            const state = String(m.status?.state || "").toUpperCase();
            // Verifica se começou e se NÃO terminou/cancelou
            return isStarted && !['FINISHED', 'FINAL', 'CANCELLED', 'POSTPONED'].includes(state);
        });

        console.log(`✅ Jogos filtrados:`, liveMatches);

        // 5. RENDERIZAÇÃO
        if (liveMatches.length === 0) {
            if (container) container.innerHTML = `<div class="col-span-full text-center py-20 text-white/40 font-black uppercase text-[10px]">Nenhum jogo ao vivo nesta liga agora.</div>`;
        } else if (window.UI && window.UI.renderLiveCards) {
            window.UI.renderLiveCards(liveMatches);
        }
        
    } catch (e) {
        console.error("🚨 Erro fatal no Live:", e);
        if (container) container.innerHTML = `<div class="col-span-full text-center py-20 text-red-500 font-black uppercase text-[10px]">Erro ao conectar com o servidor.</div>`;
    }
};
window.handleTeamClickByCode = async (code, name) => {
    console.log("%c 🚨 [SISTEMA] CLIQUE DETECTADO NO TIME: " + name, "background: #9333ea; color: white; padding: 8px; font-weight: bold; border-radius: 4px;");
    
    if (window.UI && typeof window.UI.showLoading === 'function') {
        window.UI.showLoading('search-results');
    }

    try {
        if (!window.GD_API) {
            console.error("❌ ERRO CRÍTICO: Objeto GD_API não encontrado no escopo global.");
            alert("Erro de sistema: API não carregada.");
            return;
        }
        
        console.log("📡 Iniciando busca de ID para: " + name);
        const teamID = await window.GD_API.searchTeamByName(name);
        
        if (teamID) {
            console.log("✅ ID Localizado com sucesso: " + teamID);
            await window.handleTeamClick(teamID);
        } else {
            console.warn("⚠️ A API não retornou um ID válido para: " + name);
            alert("Não foi possível localizar os dados deste time especificamente.");
            location.reload();
        }
    } catch (err) {
        console.error("🚨 ERRO NO FLUXO handleTeamClickByCode:", err);
    }
};

const SEARCH_DATABASE = {
    //La Liga
    "REAL MADRID": { id: "REAL_MADRID", league: "LA_LIGA", code: "RMA"}, "BARCELONA": { id: "BARCELONA", league: "LA_LIGA", code: "BAR"}, "VILLARREAL": { id: "VILLARREAL", league: "LA_LIGA", code: "VIL"}, "ATLETICO DE MADRI": { id: "ATLETICO_MADRID", league: "LA_LIGA", code: "ATM"}, "ESPANYOL": { id: "ESPANYOL", league: "LA_LIGA", code: "ESP"},
    "REAL BETIS": { id: "REAL_BETIS", league: "LA_LIGA", code: "BET"}, "CELTA DE VIGO": { id: "CELTA_DE_VIGO", league: "LA_LIGA", code: "CEL"}, "ELCHE": { id: "ELCHE", league: "LA_LIGA", code: "ELC"}, "REAL SOCIEDAD": { id: "REAL_SOCIEDAD", league: "LA_LIGA", code: "RSO"}, "ATHELTIC CLUB": { id: "ATHLETIC_CLUB", league: "LA_LIGA", code: "ATH"},
    "GIRONA": { id: "GIRONA", league: "LA_LIGA", code: "GIR"}, "OSASUNA": { id: "OSASUNA", league: "LA_LIGA", code: "OSA"}, "RAYO VALLECANO": { id: "RAYO_VALLECANO", league: "LA_LIGA", code: "RAY"}, "SEVILLA": { id: "SEVILLA", league: "LA_LIGA", code: "SEV"}, "MALLORCA":{ id: "MALLORCA", league: "LA_LIGA", code: "MLL"},
    "GETAFE": { id: "GETAFE", league: "LA_LIGA", code: "GET"}, "VALENCIA":{ id: "VALENCIA", league: "LA_LIGA", code: "VAL"}, "DEPORTIVO ALAVES": { id: "ALAVES", league: "LA_LIGA", code: "ALA"}, "LEVANTE": { id: "LEVANTE", league: "LA_LIGA", code: "LEV"}, "REAL OVIEDO": { id: "REAL_OVIEDO", league: "LA_LIGA", code: "OVI"},

    //Premier League
    "ARSENAL": { id: "ARSENAL", league: "EPL", code: "ARS"}, "MANCHESTER CITY": { id: "MANCHESTER_CITY", league: "EPL", code: "MCI"}, "ASTON VILLA": { id: "ASTON_VILLA", league: "EPL", code: "AVL"}, "LIVERPOOL": { id: "LIVERPOOL", league: "EPL", code: "LIV"}, "MANCHESTER UNITED": { id: "MANCHESTER_UNITED", league: "EPL", code: "MUN"},
    "CHELSEA": { id: "CHELSEA", league: "EPL", code: "CHE"}, "BRENTFORD": { id: "BRENTFORD", league: "EPL", code: "BRE"}, "NEWCASTLE UNITED": { id: "NEWCASTLE_UNITED", league: "EPL", code: "NEW"}, "SUNDERLAND": { id: "SUNDERLAND", league: "EPL", code: "SUN"}, "EVERTON": { id: "EVERTON", league: "EPL", code: "EVE"},
    "FULHAM": { id: "FULHAM", league: "EPL", code: "FUL"}, "BRIGHTON": { id: "BRIGHTON", league: "EPL", code: "BRI"}, "CRYSTAL PALACE": { id: "CRYSTAL_PALACE", league: "EPL", code: "CRY"}, "TOTTENHAM": { id: "TOTTENHAM", league: "EPL", code: "TOT"}, "BOURNEMOUTH": { id: "BOURNEMOUTH", league: "EPL", code: "BOU"},
    "LEEDS": { id: "LEEDS_UNITED", league: "EPL", code: "LEE"}, "NOTTINGHAM": { id: "NOTTINGHAM_FOREST", league: "EPL", code: "NFO"}, "WEST HAM": { id: "WEST_HAM", league: "EPL", code: "WHU"}, "BURNLEY": { id: "BURNLEY", league: "EPL", code: "BUR"}, "WOLVES": { id: "WOLVES", league: "EPL", code: "WOL"},

    //Bundesliga
    "BAYERN MUNICH": { id: "BAYERN_MUNICH", league: "BUNDESLIGA", code: "FCB"}, "BORUSSIA DORTMUND": { id: "BORUSSIA_DORTMUND", league: "BUNDESLIGA", code: "BVB"}, "HOFFENHEIM": { id: "1899_HOFFENHEIM", league: "BUNDESLIGA", code: "TSG"}, "STUTTGART": { id: "VFB_STUTTGART", league: "BUNDESLIGA", code: "VFB"}, "LEIPZIG": { id: "RB_LEIPZIG", league: "BUNDESLIGA", code: "RBL"},
    "BAYER LEVERKUSEN": { id: "BAYER_LEVERKUSEN", league: "BUNDESLIGA", code: "B04"}, "EINTRACHT FRANKFURT": { id: "EINTRACHT_FRANKFURT", league: "BUNDESLIGA", code: "SGE"}, "FREIBURG": { id: "SC_FREIBURG", league: "BUNDESLIGA", code: "SCF"}, "UNION BERLIN": { id: "UNION_BERLIN", league: "BUNDESLIGA", code: "FCU"}, "KOLN": { id: "1FC_KOLN", league: "BUNDESLIGA", code: "KOE"},
    "BORUSSIA MONCHENGLADBACH": { id: "BORUSSIA_MONCHENGLADBACH", league: "BUNDESLIGA", code: "BMG"}, "WOLFSBURG": { id: "VFL_WOLFSBURG", league: "BUNDESLIGA", code: "WOB"}, "HAMBURGER": { id: "HAMBURGER_SV", league: "BUNDESLIGA", code: "HSV"}, "WERDER BREMEN": { id: "WERDER_BREMEN", league: "BUNDESLIGA", code: "SVW"}, "AUGSBURG": { id: "FC_AUGSBURG", league: "BUNDESLIGA", code: "FCA"},
    "ST. PAULI": { id: "FC_ST_PAULI", league: "BUNDESLIGA", code: "STP"}, "HEIDENHEIM": { id: "FC_HEIDENHEIM", league: "BUNDESLIGA", code: "HDH"}, "MAINZ 05": { id: "FSV_MAINZ_05", league: "BUNDESLIGA", code: "M05"}, 

    //Serie A
    "INTER": { id: "INTER", league: "IT_SERIE_A", code: "INT"}, "MILAN": { id: "AC_MILAN", league: "IT_SERIE_A", code: "ACM"}, "NAPOLI": { id: "NAPOLI", league: "IT_SERIE_A", code: "NAP"}, "ROMA": { id: "AS_ROMA", league: "IT_SERIE_A", code: "ASR"}, "JUVENTUS": { id: "JUVENTUS", league: "IT_SERIE_A", code: "JUV"},
    "COMO": { id: "COMO", league: "IT_SERIE_A", code: "COM"}, "ATALANTA": { id: "ATALANTA", league: "IT_SERIE_A", code: "ATA"}, "BOLOGNA": { id: "BOLOGNA", league: "IT_SERIE_A", code: "BOL"}, "LAZIO": { id: "LAZIO", league: "IT_SERIE_A", code: "LAZ"}, "UDINESE": { id: "UDINESE", league: "IT_SERIE_A", code: "UDI"},
    "SASSUOLO": { id: "SASSUOLO", league: "IT_SERIE_A", code: "SAS"}, "CREMONESE": { id: "CREMONESE", league: "IT_SERIE_A", code: "CRE"}, "PARMA": { id: "PARMA", league: "IT_SERIE_A", code: "PAR"}, "TORINO": { id: "TORINO", league: "IT_SERIE_A", code: "TOR"}, "CAGLIARI": { id: "CAGLIARI", league: "IT_SERIE_A", code: "CAG"},
    "GENOA": { id: "GENOA", league: "IT_SERIE_A", code: "GEN"}, "FIORENTINA": { id: "FIORENTINA", league: "IT_SERIE_A", code: "FIO"}, "LECCE": { id: "LECCE", league: "IT_SERIE_A", code: "LEC"}, "HELLAS VERONA": { id: "HELLAS_VERONA", league: "IT_SERIE_A", code: "VER"}, "PISA": { id: "PISA", league: "IT_SERIE_A", code: "PIS"},

    //Ligue 1
    "PSG": { id: "PARIS_SAINT_GERMAIN", league: "FR_LIGUE_1", code: "PSG"}, "LENS": { id: "LENS", league: "FR_LIGUE_1", code: "RCL"}, "MARSEILLE": { id: "MARSEILLE", league: "FR_LIGUE_1", code: "OM"}, "LYON": { id: "LYON", league: "FR_LIGUE_1", code: "OL"}, "LILLE": { id: "LILLE", league: "FR_LIGUE_1", code: "LIL"},
    "RENNES": { id: "RENNES", league: "FR_LIGUE_1", code: "REN"}, "STRASBOURG": { id: "STRASBOURG", league: "FR_LIGUE_1", code: "STR"}, "TOULOUSE": { id: "TOULOUSE", league: "FR_LIGUE_1", code: "TFC"}, "MONACO": { id: "MONACO", league: "FR_LIGUE_1", code: "ASM"}, "BREST": { id: "BREST", league: "FR_LIGUE_1", code: "BRE"},
    "ANGERS": { id: "ANGERS", league: "FR_LIGUE_1", code: "ANG"}, "LORIENT": { id: "LORIENT", league: "FR_LIGUE_1", code: "FCL"}, "PARIS FC": { id: "PARIS_FC", league: "FR_LIGUE_1", code: "PFC"}, "LE HAVRE": { id: "LE_HAVRE", league: "FR_LIGUE_1", code: "HAC"}, "NICE": { id: "NICE", league: "FR_LIGUE_1", code: "OGC"},
    "NANTES": { id: "NANTES", league: "FR_LIGUE_1", code: "FCN"}, "AUXERRE": { id: "AUXERRE", league: "FR_LIGUE_1", code: "AJA"}, "METZ": { id: "METZ", league: "FR_LIGUE_1", code: "FCM"}
};

window.handleTeamClick = async (teamKey) => {
    // 1. LIMPEZA TOTAL DA CHAVE (Underline para Espaço + Remover Ligas)
    // Isso garante que "BORUSSIA_MONCHENGLADBACH" vire "BORUSSIA MONCHENGLADBACH"
    const cleanKey = teamKey.toUpperCase()
        .replace(/_/g, " ") 
        .replace(" UEFA CHAMPIONS LEAGUE", "")
        .replace(" UEFA EUROPA LEAGUE", "")
        .replace(" BUNDESLIGA", "")
        .replace(" LA LIGA", "")
        .replace(" EPL", "")
        .replace(" IT SERIE A", "")
        .replace(" FR LIGUE_1", "")
        .trim();

    // 2. BUSCA NO SEU SEARCH_DATABASE
    const teamEntry = SEARCH_DATABASE[cleanKey];
    
    if (!teamEntry) {
        console.error("🚨 Time não mapeado no SEARCH_DATABASE:", cleanKey);
        // Fallback rápido: Se não mapeou, pelo menos tenta mostrar algo com o que veio
        if (window.UI?.showLoading) window.UI.showLoading('search-results');
        const teamID = await window.GD_API.searchTeamByName(teamKey);
        if (teamID && teamID !== teamKey) return window.handleTeamClick(teamID);
        return;
    }

    const baseID = teamEntry.id; 
    const domesticLeague = teamEntry.league;
    const manualCode = teamEntry.code;

    if (window.UI && typeof window.UI.showLoading === 'function') {
        window.UI.showLoading('search-results');
    }

    // IDs para as frentes de busca
    const idDomestic = `${baseID}_${domesticLeague}`;
    const idChampions = `${baseID}_UEFA_CHAMPIONS_LEAGUE`;
    const idEuropaLeague = `${baseID}_UEFA_EUROPA_LEAGUE`;

    try {
        const startsAfter = "2025-10-15";
        const startsBefore = "2026-01-23";

        // 3. BUSCA DE STATS (Tenta a liga do banco, depois as europeias)
        let stats = await window.GD_API.fetchTeamFullStats(idDomestic);
        let activeID = idDomestic;

        if (!stats || !stats.stats) {
            console.warn(`⚠️ Sem stats em ${idDomestic}, tentando alternativas...`);
            stats = await window.GD_API.fetchTeamFullStats(idChampions);
            activeID = idChampions;
            
            if (!stats || !stats.stats) {
                stats = await window.GD_API.fetchTeamFullStats(idEuropaLeague);
                activeID = idEuropaLeague;
            }
        }

        // 4. BUSCA DE JOGOS
        const [mDom, mChamp, mEuro] = await Promise.all([
            window.GD_API.fetchEndedMatches(domesticLeague, startsAfter, startsBefore, idDomestic),
            window.GD_API.fetchEndedMatches("UEFA_CHAMPIONS_LEAGUE", startsAfter, startsBefore, idChampions),
            window.GD_API.fetchEndedMatches("UEFA_EUROPA_LEAGUE", startsAfter, startsBefore, idEuropaLeague)
        ]);

        let allMatches = [...(mDom || []), ...(mChamp || []), ...(mEuro || [])].filter(m => m && m.teams);
        
        allMatches.sort((a, b) => {
            const timeA = new Date(a.status?.startsAt || a.startsAt || 0).getTime();
            const timeB = new Date(b.status?.startsAt || b.startsAt || 0).getTime();
            return timeB - timeA;
        });

        const leagueNameMap = {
            "EPL": "Premier League", "LA_LIGA": "La Liga", "BUNDESLIGA": "Bundesliga",
            "IT_SERIE_A": "Serie A Itália", "FR_LIGUE_1": "Ligue 1",
            "UEFA_CHAMPIONS_LEAGUE": "Champions League", "UEFA_EUROPA_LEAGUE": "Europa League"
        };

        const formattedMatches = allMatches.slice(0, 5).map(match => {
            let displayName = match.leagueID || "";
            for (const key in leagueNameMap) {
                if (displayName.toUpperCase().includes(key)) {
                    displayName = leagueNameMap[key];
                    break;
                }
            }
            return { ...match, leagueDisplayName: displayName };
        });
        
        const finalName = (stats && stats.name && stats.name.toUpperCase() !== "EQUIPA") 
                          ? stats.name : cleanKey;

        if (window.UI) {
            window.UI.renderTeamDashboard({ 
                ...stats, 
                id: activeID, 
                name: finalName,
                logo: window.getTeamLogo ? window.getTeamLogo(manualCode || baseID, baseID) : ""
            }, formattedMatches);
        }

    } catch (err) {
        console.error("🚨 ERRO NO DASHBOARD:", err);
    }
};
// ========================================================
// 2. INICIALIZAÇÃO DO DOCUMENTO (DOMContentLoaded)
// ========================================================

document.addEventListener('DOMContentLoaded', async () => {
    console.log("%c 🚀 GoalDash Main: Engine Iniciada", "color: #10b981; font-weight: bold;");

    // 1. Inicialização da interface de usuário (Navbar/Login)
    if (window.updateUserUI) {
        window.updateUserUI();
    }

    // Parâmetros da URL
    const urlParams = new URLSearchParams(window.location.search);
    const matchId = urlParams.get('id');
    const action = urlParams.get('action');
    const path = window.location.pathname;

    // --- LÓGICA ESPECÍFICA PARA LIVE.HTML ---
    if (path.includes('live.html')) {
        console.log("📡 Modo Live Ativado");
        // Força o carregamento inicial (Champions por defeito ou a atual)
        await window.loadLiveMatches(window.currentLeague || 'UEFA_CHAMPIONS_LEAGUE');
    }

    // --- LOGICA DE REDIRECIONAMENTOS ---
    if (action === 'login') {
        window.openLoginModal();
    }
    if (action === 'register') {
        window.openAuthModal();
    }

    // --- VERIFICAÇÃO DE PÁGINA: HISTORY ---
    if (window.location.pathname.includes('history.html')) {
        if (window.GD_UI && window.GD_UI.renderHistory) {
            window.GD_UI.renderHistory();
        }
    }

    // --- VERIFICAÇÃO DE PÁGINA: STATS ---
    if (path.includes('stats.html')) {
        console.log("Página detectada: Estatísticas");

        const popularTeamsData = [
            { name: 'Real Madrid', code: "RMA" },
            { name: 'Barcelona', code: "BAR" },
            { name: 'Manchester City', code: "MCI" },
            { name: 'Liverpool', code: "LIV" },
            { name: 'Bayern Munich', code: "FCB" },
            { name: 'Paris SG', code: "PSG" },
            { name: 'Juventus', code: "JUV" },
            { name: 'Chelsea', code: "CHE" },
            { name: 'Inter', code: "INT" },
            { name: 'Arsenal', code: "ARS" },
            { name: 'Bayer Leverkusen', code: "B04" },
            { name: 'Atletico de Madrid', code: "ATM" }
        ];

        if (window.UI && window.UI.renderPopularTeams) {
            window.UI.renderPopularTeams(popularTeamsData);
        }

        const searchInput = document.getElementById('teams-search');
        if (searchInput) {
            searchInput.addEventListener('keypress', async (e) => {
                if (e.key === 'Enter') {
                    let query = e.target.value.trim().toUpperCase();
                    if (query.length < 3) return;

                    console.log("🔍 Pesquisando por: " + query);
                    
                    // 1. TENTA BUSCA DIRETA PELA CHAVE (Ex: "BORUSSIA MONCHENGLADBACH")
                    if (SEARCH_DATABASE[query]) {
                        console.log("✅ Achou pela chave exata!");
                        window.handleTeamClick(query);
                    } 
                    else {
                        // 2. TENTA BUSCAR POR ID OU CODE DENTRO DO BANCO
                        // Isso resolve se você digitar "BMG" ou "BORUSSIA_MONCHENGLADBACH"
                        const internalTeam = Object.values(SEARCH_DATABASE).find(t => 
                            t.id === query || 
                            t.code === query ||
                            t.id === query.replace(/ /g, "_") // Tenta com underline tbm
                        );

                        if (internalTeam) {
                            console.log("✅ Achou pelo ID ou Code no banco!");
                            window.handleTeamClick(internalTeam.id);
                        } 
                        else {
                            // 3. SÓ VAI NA API SE REALMENTE NÃO TIVER NO SEU BANCO
                            console.log("🌐 Buscando na API externa...");
                            const teamID = await window.GD_API.searchTeamByName(query);
                            if (teamID) window.handleTeamClick(teamID);
                        }
                    }
                }
            });
        }
    }

    // --- VERIFICAÇÃO DE PÁGINA: DETAILS OU HOME ---
    if (matchId && window.location.pathname.includes('matchdetails.html')) {
        if (window.GD_API && window.GD_API.fetchMatches) {
            try {
                const currentLeague = window.currentLeague || 'UEFA_CHAMPIONS_LEAGUE';
                const data = await window.GD_API.fetchMatches(currentLeague);
                const matches = Array.isArray(data) ? data : (window.allLoadedMatches || []);
                const match = matches.find(m => String(m.eventID) === String(matchId));
                
                if (match && window.UI && window.UI.renderMatchHeader) {
                    window.UI.renderMatchHeader(match);
                }
            } catch (err) {
                console.error("Erro ao carregar detalhes do jogo:", err);
            }
        }
    } else if (document.getElementById('matches-container')) {
        if (window.GD_API && window.GD_API.fetchMatches) {
            const leagueToLoad = window.currentLeague || 'UEFA_CHAMPIONS_LEAGUE';
            await window.GD_API.fetchMatches(leagueToLoad);
        }
    }
// --- LÓGICA PARA PÁGINA DE DETALHES ---
if (window.location.pathname.includes('matchdetails.html')) {
    const urlParams = new URLSearchParams(window.location.search);
    const matchId = urlParams.get('id');

    if (matchId && window.GD_API) {
        console.log("🔎 Procurando jogo ID:", matchId);
        
        const leaguesToTry = ['UEFA_CHAMPIONS_LEAGUE', 'EPL', 'LA_LIGA', 'BUNDESLIGA', 'IT_SERIE_A', 'FR_LIGUE_1', 'INTERNATIONAL_SOCCER'];
        
        const tryFetch = async (index) => {
            if (index >= leaguesToTry.length) {
                console.error("❌ Jogo não encontrado em nenhuma liga.");
                return;
            }

            const league = leaguesToTry[index];
            const matches = await window.GD_API.fetchMatches(league);
            const selectedMatch = matches.find(m => String(m.eventID) === String(matchId));

          if (selectedMatch) {
    console.log("✅ Jogo encontrado!");
    
    // GUARDA O OBJETO PARA SEMPRE
    window.activeGame = selectedMatch; 
    
    if (window.UI.renderMatchHeader) window.UI.renderMatchHeader(selectedMatch);
    
    // Chama a aba inicial
    showTab('formacao'); 
                selectedMatch.leagueName = league.replace(/_/g, ' ');
                
                if (window.UI.renderMatchHeader) window.UI.renderMatchHeader(selectedMatch);
                
                // Carrega a aba padrão (ex: Odds ou Formação) após um pequeno delay
                setTimeout(() => {
                    if (typeof window.showTab === 'function') window.showTab('formacao');
                }, 300);

            } else {
                tryFetch(index + 1);
            }
        };

        tryFetch(0);
    }
}
    setupAuthListeners();
});

// ========================================================
// 3. SISTEMA DE AUTENTICAÇÃO E FORMULÁRIOS
// ========================================================

function setupAuthListeners() {
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.onsubmit = async (e) => {
            e.preventDefault();
            const userField = document.getElementById('login-user');
            const passField = document.getElementById('login-pass');
            const submitBtn = loginForm.querySelector('button[type="submit"]');
            const messageBox = document.getElementById('login-message');

            if (submitBtn) { 
                submitBtn.innerText = "A VALIDAR CREDENCIAIS..."; 
                submitBtn.disabled = true; 
            }

            const response = await window.GD_API.loginUser(userField.value.trim(), passField.value);

            if (response.success) {
                localStorage.setItem('goalDash_username', response.username);
                window.location.reload();
            } else {
                if (messageBox) {
                    messageBox.innerText = response.error;
                    messageBox.classList.remove('hidden');
                    messageBox.className = "p-4 rounded-2xl bg-red-500/10 text-red-500 text-[11px] font-black text-center mt-4 border border-red-500/20";
                }
                if (submitBtn) { 
                    submitBtn.innerText = "ENTRAR"; 
                    submitBtn.disabled = false; 
                }
            }
        };
    }

    const authForm = document.getElementById('auth-form');
    if (authForm) {
        authForm.onsubmit = async (e) => {
            e.preventDefault();
            const user = document.getElementById('auth-user').value.trim();
            const email = document.getElementById('auth-email').value.trim();
            const pass = document.getElementById('auth-pass').value;
            const submitBtn = authForm.querySelector('button[type="submit"]');
            const messageBox = document.getElementById('auth-message');

            if (submitBtn) {
                submitBtn.innerText = "A CRIAR CONTA...";
                submitBtn.disabled = true;
            }

            const userData = {
                username: user,
                email: email,
                password: pass,
                createdAt: new Date().toISOString()
            };

            const result = await window.GD_API.registerUser(userData);

            if (result.success) {
                localStorage.setItem('goalDash_username', user);
                window.location.reload();
            } else {
                if (messageBox) {
                    messageBox.innerText = result.error;
                    messageBox.classList.remove('hidden');
                    messageBox.className = "p-4 rounded-2xl bg-red-500/10 text-red-500 text-[11px] font-black text-center mt-4 border border-red-500/20";
                }
                if (submitBtn) {
                    submitBtn.innerText = "CRIAR CONTA";
                    submitBtn.disabled = false;
                }
            }
        };
    }
}

// ========================================================
// 4. LÓGICA DE PALPITES & HISTÓRICO
// ========================================================

window.handlePalpiteClick = (id, home, away) => {
    const activeUser = localStorage.getItem('goalDash_username');
    if (!activeUser) {
        window.openAuthModal();
        return;
    }

    window.activeGame = { id, home, away };
    
    const homeEl = document.getElementById('modal-home-name');
    const awayEl = document.getElementById('modal-away-name');
    
    if (homeEl) homeEl.innerText = home;
    if (awayEl) awayEl.innerText = away;

    const modal = document.getElementById('prediction-modal');
    if (modal) {
        modal.classList.remove('hidden');
        modal.classList.add('flex');
    }
};

window.handlePredictionSubmit = async (e) => {
    const hScore = document.getElementById('modal-home-score').value;
    const aScore = document.getElementById('modal-away-score').value;
    
    // IMPORTANTE: Pegar os dados do jogo ativo
    const match = window.activeGame;

    if (!match) {
        alert("Erro: Nenhum jogo selecionado, cria!");
        return;
    }

    const btn = e ? e.currentTarget : document.querySelector('#prediction-modal button[onclick*="handlePredictionSubmit"]');

    if (hScore === "" || aScore === "") {
        alert("Por favor, preenche ambos os campos do palpite, cria!");
        return;
    }

    if (btn) {
        btn.innerText = "A ENVIAR PALPITE...";
        btn.disabled = true;
    }

    // Agora passamos TUDO para a API: scores, id do jogo e nomes dos times
    const success = await window.GD_API.submitPrediction(
        hScore, 
        aScore, 
        match.eventID || match.id, 
        `${match.teams?.home?.names?.long} vs ${match.teams?.away?.names?.long}`
    );
    
    if (success) {
        alert("Palpite registrado com sucesso!");
        document.getElementById('prediction-modal').classList.add('hidden');
        // Limpa os campos para o próximo palpite
        document.getElementById('modal-home-score').value = '';
        document.getElementById('modal-away-score').value = '';
    } else {
        alert("Erro ao enviar o palpite para o servidor.");
    }
    
    if (btn) {
        btn.innerText = "ENVIAR PALPITE";
        btn.disabled = false;
    }
};

// LIMPAR HISTÓRICO COMPLETO NA MOCKAPI
window.clearHistory = async () => {
    const username = localStorage.getItem('goalDash_username');
    if (!username) return;

    if (confirm("Desejas mesmo apagar todo o teu histórico de palpites, cria?")) {
        try {
            // 1. Pega todos os palpites da API
            const res = await fetch('https://696278a1d9d64c761907fe9a.mockapi.io/api/dash/predictions');
            const data = await res.json();
            
            // 2. Filtra só os que são seus
            const meusPalpites = data.filter(p => p.username === username);

            if (meusPalpites.length === 0) {
                alert("Teu histórico já tá limpo, cria!");
                return;
            }

            console.log(`🗑️ Apagando ${meusPalpites.length} palpites...`);

            // 3. Deleta um por um na API (a MockAPI exige delete individual por ID)
            const deletePromises = meusPalpites.map(p => 
                fetch(`https://696278a1d9d64c761907fe9a.mockapi.io/api/dash/predictions/${p.id}`, {
                    method: 'DELETE'
                })
            );

            await Promise.all(deletePromises);

            // 4. Limpa o LocalStorage também pra não sobrar rastro
            localStorage.removeItem('goalDash_history');

            console.log("🧹 Tudo limpo!");

            // 5. Atualiza a interface sem dar reload na página toda
            if (window.GD_UI && window.GD_UI.renderHistory) {
                window.GD_UI.renderHistory();
            } else {
                window.location.reload();
            }

        } catch (e) {
            console.error("Erro ao limpar histórico:", e);
            alert("Deu erro ao falar com o servidor. Tenta de novo!");
        }
    }
};

// APAGAR PALPITE ÚNICO
window.deletePrediction = async (apiID) => {
    if (confirm("Apagar este palpite especificamente?")) {
        try {
            // Deleta direto pelo ID da API
            await fetch(`https://696278a1d9d64c761907fe9a.mockapi.io/api/dash/predictions/${apiID}`, {
                method: 'DELETE'
            });

            console.log("✅ Palpite removido da API.");
            if (window.GD_UI && window.GD_UI.renderHistory) window.GD_UI.renderHistory();
        } catch (e) {
            console.error("Erro ao deletar palpite:", e);
        }
    }
};

// ========================================================
// 5. GESTÃO DE UI GERAL E MODAIS (AQUI ESTÁ TUDO!)
// ========================================================

window.updateUserUI = () => {
    const user = localStorage.getItem('goalDash_username');
    const userMenuBtn = document.getElementById('user-menu-btn');
    const userDropdown = document.getElementById('user-dropdown');
    const authLinks = document.getElementById('auth-links-container');

    if (!userMenuBtn) return;

    if (user) {
        if (authLinks) authLinks.style.display = 'none';
        
        userMenuBtn.innerHTML = `
            <div class="flex items-center gap-3 bg-white/5 border border-white/10 py-2 px-4 rounded-xl hover:bg-white/10 transition-all cursor-pointer">
                <span class="text-[11px] font-black uppercase tracking-wider text-white">${user}</span>
                <div class="w-8 h-8 bg-[#9333ea] rounded-lg flex items-center justify-center shadow-lg shadow-purple-500/20">
                    <span class="text-white font-black text-xs">${user.charAt(0).toUpperCase()}</span>
                </div>
            </div>
        `;

        userMenuBtn.onclick = (e) => {
            e.stopPropagation();
            if (userDropdown) userDropdown.classList.toggle('hidden');
        };

        if (userDropdown) {
            userDropdown.innerHTML = `
                <div class="p-4 border-b border-white/5 bg-white/[0.02]">
                    <p class="text-[9px] text-white/40 uppercase font-black tracking-[2px]">Painel do Utilizador</p>
                </div>
                <a href="history.html" class="flex items-center gap-3 w-full text-left p-4 hover:bg-white/5 text-white text-[10px] font-black uppercase tracking-widest transition-all">
                    <span class="text-purple-500">⌛</span> Meus Palpites
                </a>
                <button onclick="window.logout()" class="flex items-center gap-3 w-full text-left p-4 hover:bg-red-500/10 text-red-500 text-[10px] font-black uppercase tracking-widest transition-all border-t border-white/5">
                    <span class="text-sm">🚪</span> Terminar Sessão
                </button>
            `;
        }
    } else {
        if (authLinks) authLinks.style.display = 'block';
        userMenuBtn.onclick = () => window.openAuthModal();
        userMenuBtn.innerHTML = `
            <div class="bg-[#9333ea] hover:bg-[#7e22ce] px-6 py-2.5 rounded-xl transition-all shadow-lg shadow-purple-500/20">
                <span class="text-[11px] font-black uppercase tracking-[2px] text-white">Criar Conta</span>
            </div>
        `;
    }
};

window.logout = () => {
    if (confirm("Desejas mesmo sair da tua conta, cria?")) {
        localStorage.removeItem('goalDash_username');
        window.location.href = 'index.html';
    }
};

// --- CONTROLO DE MODAIS DE LOGIN ---
window.openLoginModal = () => {
    console.log("🔓 Abrindo Modal de Login");
    const m = document.getElementById('login-modal');
    if (m) {
        m.classList.remove('hidden');
        m.classList.add('flex');
        // Reset de mensagens de erro ao abrir
        const msg = document.getElementById('login-message');
        if (msg) msg.classList.add('hidden');
    }
};

window.closeLoginModal = () => {
    const m = document.getElementById('login-modal');
    if (m) {
        m.classList.remove('flex');
        m.classList.add('hidden');
    }
};

// --- CONTROLO DE MODAIS DE REGISTRO ---
window.openAuthModal = () => {
    console.log("📝 Abrindo Modal de Registro");
    const m = document.getElementById('auth-modal');
    if (m) {
        m.classList.remove('hidden');
        m.classList.add('flex');
        const msg = document.getElementById('auth-message');
        if (msg) msg.classList.add('hidden');
    }
};

window.closeAuthModal = () => {
    const m = document.getElementById('auth-modal');
    if (m) {
        m.classList.remove('flex');
        m.classList.add('hidden');
    }
};

// --- CONTROLO DE MODAL DE PALPITE ---
window.closePredictionModal = () => {
    const m = document.getElementById('prediction-modal');
    if (m) {
        m.classList.remove('flex');
        m.classList.add('hidden');
    }
};

// --- SWITCH ENTRE LOGIN E REGISTRO ---
window.switchToLogin = () => {
    window.closeAuthModal();
    setTimeout(() => window.openLoginModal(), 100);
};

window.switchToRegister = () => {
    window.closeLoginModal();
    setTimeout(() => window.openAuthModal(), 100);
};

// --- LISTENER GLOBAL PARA FECHAR TUDO AO CLICAR FORA ---
document.addEventListener('click', (e) => {
    // Fechar Dropdown de Usuário
    const drop = document.getElementById('user-dropdown');
    const btn = document.getElementById('user-menu-btn');
    if (drop && btn && !btn.contains(e.target) && !drop.contains(e.target)) {
        drop.classList.add('hidden');
    }

    // Fechar Modais ao clicar no Backdrop (fundo escuro)
    const loginModal = document.getElementById('login-modal');
    if (e.target === loginModal) window.closeLoginModal();

    const authModal = document.getElementById('auth-modal');
    if (e.target === authModal) window.closeAuthModal();

    const predModal = document.getElementById('prediction-modal');
    if (e.target === predModal) window.closePredictionModal();
});

console.log("%c ✅ GoalDash: Script main.js totalmente carregado.", "color: #9333ea; font-weight: bold;");
