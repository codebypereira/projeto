/**
 * MÓDULO: Gestor de Assets e Identidades Visuais (Teams & Logos)
 * DESCRIÇÃO: Resolve a correspondência entre siglas de equipas (Trigramas) e 
 * os seus respetivos identificadores de imagem nas CDNs de desporto.
 * Implementa um sistema de "Mapping & Fallback" para garantir que nenhum 
 * elemento da interface fique sem representação visual.
 */

/**
 * Dicionário Global de IDs: TEAM_IDS
 * Mapeia as siglas enviadas pela Sports API para os IDs da Media API.
 * Organizado por Ligas e Federações para facilitar a manutenção.
 */
const TEAM_IDS = {
    // --- PREMIER LEAGUE (ING) ---
    "MCI": 50, "ARS": 42, "NEW": 34, "FUL": 36, "BRE": 55, "WHU": 48, "BUR": 44, 
    "CRY": 52, "LEE": 37, "SUN": 746, "MUN": 33, "CHE": 49, "TOT": 47, "LIV": 40, 
    "NFO": 65, "WOL": 39, "AVL": 66, "EVE": 45,

    // --- BUNDESLIGA (GER) ---
    "B04": 168, "BVB": 165, "RBL": 173, "SVW": 162, "SGE": 169, "KOE": 192, 
    "M05": 164, "WOB": 161, "SCH": 174, "TSG": 167, "STP": 186, "HSV": 175, 
    "BMG": 163, "FCB": 157, "VFB": 170, "FCU": 182, "FCA": 172, "SCF": 160,

    // --- LA LIGA (ESP) ---
    "RMA": 541, "BAR": 529, "ATM": 530, "VIL": 533, "VAL": 532, "SEV": 536, 
    "RSO": 548, "BET": 543, "ATH": 531, "GIR": 547, "OSA": 542, "MLL": 539, 
    "RAY": 554, "CEL": 538, "ALA": 544, "GET": 546, "LEV": 545, "ESP": 540,

    // --- SERIE A (ITA) ---
    "ACM": 489, "ASR": 497, "LAZ": 487, "INT": 505, "JUV": 496, "NAP": 492, 
    "ATA": 499, "BOL": 500, "FIO": 502, "TOR": 503, "UDI": 494, "GEN": 495, 
    "LEC": 488, "VER": 504, "CAG": 490, "PAR": 501, "COM": 512,

    // --- LIGUE 1 (FRA) ---
    "PSG": 85, "OM": 81, "OL": 80, "LIL": 79, "ASM": 91, "RCL": 116, "OGC": 84, 
    "SR": 94, "FCN": 83, "TFC": 96, "STR": 95, "AUX": 108,

    // --- COMPETIÇÕES EUROPEIAS E OUTROS ---
    "BRU": 569, "ALM": 1244, "BOG": 5455, "AJA": 194, "SCP": 211, 
    "OLY": 1530, "GAL": 610, "FCK": 400, "PSV": 197, "SLB": 190, "POR": 212,

    // --- EUROPA LEAGUE ---
    "PAO": 554,   // PAOK
    "FEY": 209,   // Feyenoord
    "STU": 197,   // Sturm Graz
    "YOU": 202,   // Young Boys
    "LYO": 80,    // Lyon
    "FRE": 160,   // Freiburg
    "ZAG": 231,   // Dinamo Zagreb
    "STE": 571,   // Slavia Praha
    "UTR": 196,   // Utrecht
    "FER": 558,   // Ferencvaros
    "PAN": 555,   // Pannathinaikos
    "RAN": 257,   // Rangers
    "LUD": 566,   // Ludogorets
    "MID": 397,   // Midtjylland
    "MAC": 564,   // Maccabi Tel-Aviv

    // --- INTERNACIONAL ---
    "USA": 2384, // Estados Unidos
    "MEX": 16,   // México
    "CAN": 5529, // Canadá

    // --- AMÉRICA DO SUL (CONMEBOL) ---
    "BRA": 6,    // Brasil
    "ARG": 26,   // Argentina
    "URU": 7,    // Uruguai
    "COL": 8,    // Colômbia
    "ECU": 2382, // Equador
    "PAR-S" : 1552,

    // --- EUROPA (UEFA) ---
    "FRA": 2,    // França
    "ENG": 10,   // Inglaterra
    "GER": 25,   // Alemanha
    "ESP": 9,    // Espanha
    "POR": 27,   // Portugal
    "ITA": 768,  // Itália
    "NED": 1118, // Holanda
    "BEL": 1,    // Bélgica

    // --- ÁFRICA E ÁSIA ---
    "MAR": 31,   // Marrocos
    "SEN": 1504, // Senegal
    "JPN": 12,   // Japão
    "KOR": 17,   // Coreia do Sul
    "EGY": 32,   // Egito
    "TUN": 28,   // Tunísia
    "OMA": 1572, // Omã
    "SDN": 1506, // Sudão
    "RSA": 1568, // África do Sul
    "QAT": 1570, // Catar
    "SUI": 15,   // Suíça
    "MOR": 31,   // Marrocos
    "HAI": 5519, // Haiti
    "SCO": 1111, // Escócia
    "CUR": 5537, // Curaçao
    "CIV": 29,   // Costa do Marfim 
};

/**
 * Função: getTeamLogo
 * Atua como um resolver de URLs de imagem.
 * * @param {string} name - Sigla ou nome curto da equipa enviado pela API.
 * @returns {string} URL absoluta da imagem ou fallback gerado dinamicamente.
 */
function getTeamLogo(name) {
    // Tratamento de segurança: se o nome for nulo ou vazio, retorna avatar genérico Goal Dash
    if (!name) return "https://ui-avatars.com/api/?name=??&background=ff2d85&color=fff";

    // Normalização da string para comparação precisa
    const cleanName = String(name).trim().toUpperCase();

    /**
     * Cache de Logos Manuais:
     * Utilizado para equipas que requerem assets de CDNs alternativas (ex: Fotmob)
     * devido a falhas ou ausência na CDN principal da Sports-IO.
     */
    const manualLogos = {
        "BOG": "https://images.fotmob.com/image_resources/logo/teamlogo/8402.png",
        "ALM": "https://images.fotmob.com/image_resources/logo/teamlogo/8037.png",
        "SCP": "https://images.fotmob.com/image_resources/logo/teamlogo/9768.png",
        "OLY": "https://images.fotmob.com/image_resources/logo/teamlogo/8638.png",
        "GAL": "https://images.fotmob.com/image_resources/logo/teamlogo/8637.png",
        "PAN": "https://images.fotmob.com/image_resources/logo/teamlogo/10200.png",
        "PAO": "https://images.fotmob.com/image_resources/logo/teamlogo/8619.png"
    };

    // 1. Verificação em Cache Manual
    if (manualLogos[cleanName]) {
        return manualLogos[cleanName];
    }
    
    // 2. Procura no Dicionário de IDs Global
    const id = TEAM_IDS[cleanName];

    /** * Log de Diagnóstico: Útil para identificar equipas novas enviadas pela API 
     * que ainda não foram mapeadas no sistema de IDs.
     */
    console.log(`[Resolver] API: "${cleanName}" | ID Local: ${id || 'NÃO MAPEADO'}`);

    if (id) {
        // Retorno da CDN oficial com o ID mapeado
        return `https://images.fotmob.com/image_resources/logo/teamlogo/${id}.png`;
    }
    
    /**
     * 3. Mecanismo de Fallback (Design Robust):
     * Se a equipa não existir no mapeamento, gera um avatar tipográfico 
     * com a paleta de cores do Goal Dash (Rosa Neon/Branco).
     */
    return `https://ui-avatars.com/api/?name=${cleanName}&background=ff2d85&color=fff&bold=true`;
}

// Exposição do serviço para o âmbito global da aplicação
window.getTeamLogo = getTeamLogo;