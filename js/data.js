/**
 * GOALDASH - MÓDULO DE DADOS ESTÁTICOS
 * Mantendo o padrão de siglas de 3 letras do cria.
 */

const GD_DATA = {
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

    POPULAR_TEAMS: [
        { id: 8633, name: "Real Madrid" },
        { id: 8634, name: "Barcelona" },
        { id: 8456, name: "Man. City" },
        { id: 10260, name: "Man. United" },
        { id: 8650, name: "Liverpool" },
        { id: 9823, name: "Bayern" },
        { id: 9847, name: "PSG" },
        { id: 8636, name: "Inter" },
        { id: 9772, name: "Benfica" },
        { id: 9773, name: "FC Porto" },
        { id: 9768, name: "Sporting" },
        { id: 9765, name: "Flamengo" }
    ],

    TEAM_LOGOS_MAP: {
        // PREMIER LEAGUE
        "MCI": 8456, "ARS": 9825, "NEW": 10261, "FUL": 9879, "BRE": 9937, "WHU": 8654, 
        "MUN": 10260, "CHE": 8455, "TOT": 8586, "LIV": 8650, "AVL": 10252, "EVE": 8668,

        // BUNDESLIGA
        "B04": 8178, "BVB": 9789, "RBL": 178475, "SVW": 8697, "SGE": 9810, "KOE": 8722, 
        "M05": 9905, "WOB": 8721, "SCH": 94937, "TSG": 8226, "STP": 8152, "HSV": 9790, 
        "BMG": 9788, "FCB": 9823, "VFB": 10269, "FCU": 8149, "FCA": 8406, "SCF": 8358,

        // LA LIGA
        "RMA": 8633, "BAR": 8634, "ATM": 9906, "RSO": 8560, "VIL": 10205, "BET": 8603,

        // PORTUGAL
        "SLB": 9772, "SCP": 9768, "FCP": 9773, "SCB": 10230, "VSC": 7844,

        // SERIE A (ITA)
        "ACM": 8564, "ASR": 8686, "LAZ": 8543, "INT": 8636, "JUV": 9885, "NAP": 9875, 
        "ATA": 8524, "BOL": 9857, "FIO": 8535, "TOR": 9804, "UDI": 8600, "GEN": 10233, 
        "LEC": 9888, "VER": 9876, "CAG": 8529, "PAR": 10167, "COM": 10171, "PIS": 6479,
        "SAS": 7943, "CRE": 7801,

        // LIGUE 1 (FRA)
        "PSG": 9847, "OM": 8592, "OL": 9748, "LIL": 8639, "ASM": 9829, "RCL": 8588, "OGC": 9831, "BRE": 8521,
        "SR": 9851, "FCN": 9830, "TFC": 9941, "STR": 9848, "AJA": 8583, "FCL": 8689, "HAC": 9746, "PFC": 6379, "ANG": 8121, "FCM": 8550,

        // COMPETIÇÕES EUROPEIAS
        "ALM": 8037, "BRU": 8342, "BOG": 8402, "FCK": 8391, "OLY": 8638, "GAL": 8637,
        "PAO": 8619, "FEY": 10235, "STU": 10014, "YOU": 10192, "MAC": 7855, "STE": 9723, "UTR": 9908, "FER": 8222, 
        "PAN": 10200, "RAN": 8548, "LUD": 210173, "MID": 8113, "ZAG": 10156, "BRA": 8256,

        // INTERNACIONAL
        "EGY": 10255, "TUN": 6719, "OMA": 5824, "MEX": 6710, "RSA": 6316, "USA": 6713, "QAT": 5902, "SUI": 6717, "MOR": 6262, "HAI": 5934, "SCO": 8498, "GER": 8570,
        "NED": 6708, "JPN": 6715, "CIV": 6709, "ECU": 6707, "COR": 10201, "FLA": 9765, "PAL": 10214, "ALN": 2939
    },

    UI_CONFIG: {
        FALLBACK_LOGO: 'Images/favi.svg',
        AVATAR_BASE: 'https://ui-avatars.com/api/?background=3b2e7d&color=fff&bold=true'
    }
};

function getTeamLogo(shortName, fullName = "") {
    if (!shortName) return `${GD_DATA.UI_CONFIG.AVATAR_BASE}&name=??`;

    const cleanShort = String(shortName).trim().toUpperCase();
    const cleanFull = String(fullName).trim();

    // 1. Lógica de Desempates (Sua especialidade)
    const desempates = {
        "BRA": cleanFull.includes("Brasil") || cleanFull.includes("Brazil") ? 8256 : 8468,
        "AJA": cleanFull.includes("Ajax") ? 8593 : 8583,
        "PAR": cleanFull.includes("Paraguay") || cleanFull.includes("Paraguai") ? 6724 : 10167,
        "BRE": cleanFull.includes("Brentford") ? 9937 : 8521
    };

    if (desempates[cleanShort]) {
        return `https://images.fotmob.com/image_resources/logo/teamlogo/${desempates[cleanShort]}.png`;
    }

    // 2. Busca pela sigla no mapa principal
    const id = GD_DATA.TEAM_LOGOS_MAP[cleanShort];
    if (id) {
        return `https://images.fotmob.com/image_resources/logo/teamlogo/${id}.png`;
    }
    
    // 3. Fallback
    return `${GD_DATA.UI_CONFIG.AVATAR_BASE}&name=${cleanShort}`;
}

window.GD_DATA = GD_DATA;
window.getTeamLogo = getTeamLogo;