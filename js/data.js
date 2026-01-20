/**
 * GOALDASH - MÓDULO DE DADOS ESTÁTICOS
 * Centraliza mapeamentos, dicionários de IDs e configurações de interface.
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
        'MLS': 'MLS (EUA)',
        'LIGA_MX': 'Liga MX',
        'INTERNATIONAL_SOCCER': 'World Cup 2026'
    },

    // Equipas Populares para a página de Estatísticas
    POPULAR_TEAMS: [
        { name: 'Real Madrid', id: 541 }, { name: 'Barcelona', id: 529 },
        { name: 'Man. City', id: 50 }, { name: 'Liverpool', id: 40 },
        { name: 'Bayern Munich', id: 157 }, { name: 'Paris SG', id: 85 },
        { name: 'Benfica', id: 211 }, { name: 'Sporting CP', id: 212 },
        { name: 'FC Porto', id: 217 }, { name: 'Flamengo', id: 127 },
        { name: 'Palmeiras', id: 121 }, { name: 'Al Nassr', id: 2939 }
    ],

    /**
     * Dicionário de IDs para Logos (Extraído do teu teams.js)
     * Mapeia as siglas da Sports API para os IDs da Fotmob/Media API.
     */
    TEAM_LOGOS_MAP: {
        // PREMIER LEAGUE
        "MCI": 8456, "ARS": 9825, "NEW": 10261, "FUL": 9879, "BRE": 9937, "WHU": 8654, 
        "MUN": 10260, "CHE": 8455, "TOT": 8586, "LIV": 8650, "AVL": 10252, "EVE": 8668,
         // --- BUNDESLIGA (GER) ---
        "B04": 8178, "BVB": 9789, "RBL": 178475, "SVW": 8697, "SGE": 9810, "KOE": 8722, 
        "M05": 9905, "WOB": 8721, "SCH": 94937, "TSG": 8226, "STP": 8152, "HSV": 9790, 
        "BMG": 9788, "FCB": 9823, "VFB": 10269, "FCU": 8149, "FCA": 8406, "SCF": 8358,
        // LA LIGA
        "RMA": 8633, "FCB": 8634, "ATM": 9906, "RSO": 8560, "vIL": 10205, "BET": 8603,
        // PORTUGAL
        "SLB": 9772, "SCP": 9768, "FCP": 9773, "SCB": 10230, "VSC": 7844,
        // --- SERIE A (ITA) ---
    "ACM": 8564, "ASR": 8686, "LAZ": 8543, "INT": 8636, "JUV": 9885, "NAP": 9875, 
    "ATA": 8524, "BOL": 9857, "FIO": 8535, "TOR": 9804, "UDI": 8600, "GEN": 10233, 
    "LEC": 9888, "VER": 9876, "CAG": 8529, "PAR": 10167, "COM": 10171, "PIS": 6479,
    "SAS": 7943, "CRE": 7801,

    // --- LIGUE 1 (FRA) ---
    "PSG": 9847, "OM": 8592, "OL": 9748, "LIL": 8639, "ASM": 9829, "RCL": 8588, "OGC": 9831, "BRE": 8521,
    "SR": 9851, "FCN": 9830, "TFC": 9941, "STR": 9848, "AJA": 8583, "FCL": 8689, "HAC": 9746, "PFC": 6379, "ANG": 8121, "FCM": 8550,

    // --- CHAMPIONS LEAGUE ---
    "ALM": 8037, "BRU": 8342, "BOG": 8402, "SCP": 9768, "FCK": 8391, "OLY": 8638, "GAL": 8637,

    // --- EUROPA LEAGUE ---
    "PAO": 8619, "FEY": 10235, "STU": 10014, "YOU": 10192, "LYO": 9748, "FRE": 8358, "MAC": 7855, "STE": 9723, "UTR": 9908, "FER": 8222, 
    "PAN": 10200, "RAN": 8548, "LUD": 210173, "MID": 8113,"ZAG": 10156, "BRA": 8468,    

    // --- INTERNACIONAL ---
    "EGY": 10255, "TUN": 6719, "OMA": 5824, "SDN": 408231, "MEX": 6710, "RSA": 6316, "USA": 6713, "QAT": 5902, "SUI": 6717, "BRA": 8256, "MOR": 6262, "HAI": 5934, "SCO": 8498, "GER": 8570, "CUR": 287981, 
    "NED": 6708, "JPN": 6715, "CIV": 6709, "ECU": 6707
    },

    // Configurações visuais globais
    UI_CONFIG: {
        BASE_LOGO_URL: 'https://media.api-sports.io/football/',
        FALLBACK_LOGO: 'Images/favi.svg',
        COLORS: {
            win: 'bg-green-500',
            loss: 'bg-red-500',
            draw: 'bg-gray-500',
            primary: 'purple-600'
        }
    }
};
/**
 * Função: getTeamLogo (Versão Corrigida para GD_DATA)
 */
function getTeamLogo(name, fullName = "") {
    if (!name) return "https://ui-avatars.com/api/?name=??&background=3b2e7d&color=fff";

    const cleanName = String(name).trim().toUpperCase();
    const cleanFullName = String(fullName).trim();

    // 1. Verificação de Desempates (Lógica Fotmob)
    const desempates = {
        "BRA": cleanFullName.includes("Brasil") ? 8256 : 8468,
        "AJA": cleanFullName.includes("Ajax") ? 8593 : 8583,
        "PAR": cleanFullName.includes("Paraguay") ? 6724 : 10167,
        "BRE": cleanFullName.includes("Brentford") ? 9937 : 8521
    };

    if (desempates[cleanName]) {
        return `https://images.fotmob.com/image_resources/logo/teamlogo/${desempates[cleanName]}.png`;
    }

    // 2. Procura no novo mapeamento do data.js
    const id = GD_DATA.TEAM_LOGOS_MAP[cleanName];

    if (id) {
        return `https://images.fotmob.com/image_resources/logo/teamlogo/${id}.png`;
    }
    
    // 3. Fallback: Avatar com as cores do seu tema (Roxo Escuro)
    return `https://ui-avatars.com/api/?name=${cleanName}&background=3b2e7d&color=fff&bold=true`;
}

// Garante que a função está no window
window.getTeamLogo = getTeamLogo;

// Tornar os dados acessíveis globalmente
window.GD_DATA = GD_DATA;