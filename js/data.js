/**
 * GOALDASH - MÓDULO DE DADOS ESTÁTICOS
 * Centraliza mapeamentos, dicionários de IDs e logos do Fotmob.
 */

const GD_DATA = {
    // Mapeamento de IDs de ligas para nomes exibíveis
    LEAGUES: {
        'UEFA_EUROPA_LEAGUE': 'Europa League',
        'UEFA_CHAMPIONS_LEAGUE': 'Champions League',
        'EPL': 'Premier League',
        'LA_LIGA': 'La Liga',
        'BUNDESLIGA': 'Bundesliga',
        'IT_SERIE_A': 'Serie A Itália',
        'FR_LIGUE_1': 'Ligue 1',
        'INTERNATIONAL_SOCCER': 'World Cup 2026'
    },

    /**
     * Dicionário de IDs para Logos do Fotmob
     * Mapeia as siglas da API de Odds para os IDs reais das imagens.
     */
    TEAM_LOGOS_MAP: {
        // PREMIER LEAGUE
        "MCI": 8456, "ARS": 9825, "NEW": 10261, "FUL": 9879, "BRE": 9937, "WHU": 8654, "SUN": 8472, "BHA": 10204, "BUR": 8191, 
        "MUN": 10260, "CHE": 8455, "TOT": 8586, "LIV": 8650, "AVL": 10252, "EVE": 8668, "WOL": 8602, "BOU": 8678, "NFO": 10203, 
        "CRY": 9826, "LEE": 8463,

        // BUNDESLIGA
        "B04": 8178, "BVB": 9789, "RBL": 178475, "SVW": 8697, "SGE": 9810, "KOE": 8722, "M05": 9905, "WOB": 8721, "SCH": 94937, 
        "TSG": 8226, "STP": 8152, "HSV": 9790, "BMG": 9788, "FCB": 9823, "VFB": 10269, "FCU": 8149, "FCA": 8406, "SCF": 8358,


        // LA LIGA
        "RMA": 8633, "BAR": 8634, "ATM": 9906, "RSO": 8560, "VIL": 10205, "BET": 8603, "LEV": 8581, "ELC": 10268, "RAY": 8370, 
        "OSA": 8371, "VAL": 10267, "ESP": 8558, "SEV": 8302, "ATH": 8315, "MLL": 8661, "OVI": 8670, "CEL": 9910, "ALA": 9866, 
        "GIR": 7732, "GET": 8305,

        // TIMES POPULARES
        "SLB": 9772, "FCP": 9773, "COR": 9808, "FLA": 9770, "ALN": 101918, "PAL": 10283, "SCP": 9768,

        // SERIE A (ITA)
        "ACM": 8564, "ASR": 8686, "LAZ": 8543, "INT": 8636, "JUV": 9885, "NAP": 9875, "ATA": 8524, "BOL": 9857, "FIO": 8535, 
        "TOR": 9804, "UDI": 8600, "GEN": 10233, "LEC": 9888, "VER": 9876, "CAG": 8529, "PAR": 10167, "COM": 10171, "PIS": 6479,
        "SAS": 7943, "CRE": 7801,

        // LIGUE 1 (FRA)
        "PSG": 9847, "OM": 8592, "OL": 9748, "LIL": 8639, "ASM": 9829, "RCL": 8588, "OGC": 9831, "BRE": 8521,
        "SR": 9851, "FCN": 9830, "TFC": 9941, "STR": 9848, "AJA": 8583, "FCL": 8689, "HAC": 9746, "PFC": 6379, 
        "ANG": 8121, "FCM": 8550,

        // COMPETIÇÕES EUROPEIAS
        "ALM": 8037, "BRU": 8342, "BOG": 8402, "FCK": 8391, "OLY": 8638, "GAL": 8637, "PAF": 2137, "SLA": 7787, "USG": 7978,
        "PAO": 8619, "FEY": 10235, "STU": 10014, "YOU": 10192, "MAC": 7855, "STE": 9723, "UTR": 9908, "FER": 8222, "LYO": 9748,
        "PAN": 10200, "RAN": 8548, "LUD": 210173, "MID": 8113, "ZAG": 10156, "BRA": 8256, "FRE": 8358,

        // INTERNACIONAL
        "EGY": 10255, "TUN": 6719, "OMA": 5824, "MEX": 6710, "RSA": 6316, "USA": 6713, "QAT": 5902, "SUI": 6717, "MOR": 6262, "HAI": 5934, 
        "SCO": 8498, "GER": 8570, "NED": 6708, "JPN": 6715, "CIV": 6709, "ECU": 6707, "SUD": 5805, "CUR": 287981
    },

    UI_CONFIG: {
        FALLBACK_LOGO: 'Images/favi.svg',
        AVATAR_BASE: 'https://ui-avatars.com/api/?background=3b2e7d&color=fff&bold=true'
    }
};

/**
 * Função: getTeamLogo 
 * Puxa a imagem do Fotmob ou gera um avatar se não encontrar.
 */
function getTeamLogo(shortName, fullName = "") {
    if (!shortName) return `${GD_DATA.UI_CONFIG.AVATAR_BASE}&name=??`;

    const cleanShort = String(shortName).trim().toUpperCase();
    const cleanFull = String(fullName).trim();

    // 1. Lógica de Desempates (Casos onde a sigla é igual)
    const desempates = {
        "BRA": cleanFull.includes("Brasil") || cleanFull.includes("Brazil") ? 8256 : 8468,
        "AJA": cleanFull.includes("Ajax") ? 8593 : 8583,
        "PAR": cleanFull.includes("Paraguay") || cleanFull.includes("Paraguai") ? 6724 : 10167,
        "BRE": cleanFull.includes("Brentford") ? 9937 : 8521,
        "PAN": cleanFull.includes("Panathinaikos") ? 10200 : 5922
    };

    if (desempates[cleanShort]) {
        return `https://images.fotmob.com/image_resources/logo/teamlogo/${desempates[cleanShort]}.png`;
    }

    // 2. Procura no mapeamento principal
    const id = GD_DATA.TEAM_LOGOS_MAP[cleanShort];

    if (id) {
        return `https://images.fotmob.com/image_resources/logo/teamlogo/${id}.png`;
    }
    
    // 3. Fallback: Avatar roxo estilizado
    return `${GD_DATA.UI_CONFIG.AVATAR_BASE}&name=${cleanShort}`;
}

// Exposições Globais
window.GD_DATA = GD_DATA;
window.getTeamLogo = getTeamLogo;

/**
 * DEBUG SCANNER: 
 * Monitora em tempo real quais times estão sem logo no seu mapeamento.
 */
const originalGetTeamLogo = window.getTeamLogo;
window.getTeamLogo = function(shortName, fullName = "") {
    const logoUrl = originalGetTeamLogo(shortName, fullName);
    
    // Se a URL contém "ui-avatars", significa que o ID não foi encontrado no seu MAP
    if (logoUrl.includes('ui-avatars.com')) {
        console.groupCollapsed(`%c 🚨 LOGO NÃO ENCONTRADA: ${shortName}`, "color: #ff0055; font-weight: bold;");
        console.log("Nome Completo:", fullName);
        console.log("Sigla recebida:", shortName);
        console.log("Ação: Procure o ID no Fotmob e adicione ao TEAM_LOGOS_MAP no data.js");
        console.groupEnd();
    }
    
    return logoUrl;
};