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
    "MCI": 8456, "ARS": 9825, "NEW": 10261, "FUL": 9879, "BRE": 9937, "WHU": 8654, "BUR": 8191, 
    "CRY": 9826, "LEE": 8463, "SUN": 8472, "MUN": 10260, "CHE": 8455, "TOT": 8586, "LIV": 8650, 
    "NFO": 10203, "WOL": 8602, "AVL": 10252, "EVE": 8668,

    // --- BUNDESLIGA (GER) ---
    "B04": 8178, "BVB": 9789, "RBL": 178475, "SVW": 8697, "SGE": 9810, "KOE": 8722, 
    "M05": 9905, "WOB": 8721, "SCH": 94937, "TSG": 8226, "STP": 8152, "HSV": 9790, 
    "BMG": 9788, "FCB": 9823, "VFB": 10269, "FCU": 8149, "FCA": 8406, "SCF": 8358,

    // --- LA LIGA (ESP) ---
    "RMA": 8633, "BAR": 8634, "ATM": 9906, "VIL": 10205, "VAL": 10267, "SEV": 8302, 
    "RSO": 8560, "BET": 8603, "ATH": 8315, "GIR": 7732, "OSA": 8371, "MLL": 8661, 
    "RAY": 8370, "CEL": 9910, "ALA": 9866, "GET": 8305, "LEV": 8581, "ESP": 8558,

    // --- SERIE A (ITA) ---
    "ACM": 8564, "ASR": 8686, "LAZ": 8543, "INT": 8636, "JUV": 9885, "NAP": 9875, 
    "ATA": 8524, "BOL": 9857, "FIO": 8535, "TOR": 9804, "UDI": 8600, "GEN": 10233, 
    "LEC": 9888, "VER": 9876, "CAG": 8529, "PAR": 10167, "COM": 10171, "PIS": 6479,
    "SAS": 7943, "CRE": 7801,

    // --- LIGUE 1 (FRA) ---
    "PSG": 9847, "OM": 8592, "OL": 9748, "LIL": 8639, "ASM": 9829, "RCL": 8588, "OGC": 9831, 
    "SR": 9851, "FCN": 9830, "TFC": 9941, "STR": 9848, "AJA": 8583, "FCL": 8689, "HAC": 9746, "PFC": 6379, "ANG": 8121, "FCM": 8550,

    // --- CHAMPIONS LEAGUE ---
    "ALM": 8037, "BRU": 8342, "BOG": 8402, "SCP": 9768, "FCK": 8391, "OLY": 8638, "GAL": 8637,

    // --- EUROPA LEAGUE ---
    "PAO": 8619, "FEY": 10235, "STU": 10014, "YOU": 10192, "LYO": 9748, "FRE": 8358, "MAC": 7855, "STE": 9723, "UTR": 9908, "FER": 8222, 
    "PAN": 10200, "RAN": 8548, "LUD": 210173, "MID": 8113,"ZAG": 10156,     

    // --- INTERNACIONAL ---
    "EGY": , "TUN": , "OMA": , "SDN": , "MEX": , "RSA": , "USA": , "QAT": , "SUI": , "BRA": , "MOR": , "HAI": , "SCO": , "GER": , "CUR": , 
    "NED": , "JPN": , "CIV": , "ECU":
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