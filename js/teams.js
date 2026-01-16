//Arquivo utilizado para buscar logo dos times de futebol

const TEAM_IDS = {
    // --- PREMIER LEAGUE (ING) ---
    "MCI": 50, "MNC": 50, "MCY": 50, // Man City
    "ARS": 42, "AFC": 42,           // Arsenal
    "NEW": 34, "NWC": 34,           // Newcastle
    "FUL": 36,                      // Fulham
    "BRE": 55, "BRF": 55,           // Brentford
    "WHU": 48,                      // West Ham
    "BUR": 44,                      // Burnley
    "CRY": 52, "PAL": 52,           // Crystal Palace
    "LEE": 37,                      // Leeds
    "SUN": 746,                     // Sunderland
    "MUN": 33,                      // Man Utd
    "CHE": 49,                      // Chelsea
    "TOT": 47,                      // Tottenham
    "LIV": 40,                      // Liverpool
    "NFO": 65,                      // Nottingham Forest
    "WOL": 39,                      // Wolves
    "AVL": 66,                      // Aston Villa
    "EVE": 45,                      // Everton


    //--- Champions League ---
    "RMA": 541, "BAR": 529, "BAY": 157, "BVB": 165, "INT": 505, "MIL": 489, "JUV": 496, 
    "PSG": 85, "SLB": 190, "POR": 212, "SCP": 197, "AJA": 194, "PSV": 197, "LEV": 168, "ATM": 530,

    // --- LA LIGA (ESP) ---
    "ESP": 540,  // Espanyol (Clube - Chega de bandeira da Espanha!)
    "GIR": 547,  // Girona
    "RMA": 541,  // Real Madrid
    "LEV": 545,  // Levante (Clube Espanhol - Chega de Leverkusen!)
    "MLL": 539,  // Mallorca
    "ATH": 531,  // Athletic Bilbao
    "OSA": 542,  // Osasuna
    "OVI": 551,  // Real Oviedo
    "BET": 543,  // Real Betis
    "VIL": 533,  // Villarreal
    "GET": 546,  // Getafe
    "VAL": 532,  // Valencia
    "ATM": 530,  // Atlético de Madrid
    "ALA": 544,  // Alavés
    "CEL": 538,  // Celta de Vigo
    "RAY": 554,  // Rayo Vallecano (ID 554, o 546 é o Getafe)
    "RSO": 548,  // Real Sociedad
    "BAR": 529,  // Barcelona
    "ELC": 534,  // Elche
    "SEV": 536,  // Sevilla

    // --- BUNDESLIGA (GER) ---
    "BAY": 157, "BVB": 165, "LEV": 168, "RBL": 173, "STU": 170, "FRA": 169, "HOF": 167,
    "FRI": 162, "WOL": 161, "BRE": 162, "AUG": 172, "GLA": 163, "MAI": 164, "BER": 182,

    //--- Serie A Tim ---
    "ACM": 489,  // Milan (Apareceu ACM no console)
    "ASR": 497,  // Roma (Apareceu ASR no console)
    "LAZ": 487,  // Lazio
    "INT": 505,  // Inter de Milão
    "JUV": 496,  // Juventus
    "NAP": 492,  // Napoli
    "ATA": 499,  // Atalanta
    "BOL": 500,  // Bologna
    "FIO": 502,  // Fiorentina
    "TOR": 503,  // Torino
    "UDI": 494,  // Udinese
    "GEN": 495,  // Genoa
    "LEC": 488,  // Lecce
    "VER": 504,  // Hellas Verona
    "CAG": 490,  // Cagliari
    "SAS": 491,  // Sassuolo
    "PAR": 501,  // Parma
    "COM": 512, // Como
    "CRE": 498,  // Cremonese
    "PIS": 514,  // Pisa

    // --- LIGUE 1 (FRA) ---
    "PSG": 85, "MON": 91, "LYO": 80, "MAR": 81, "LEN": 116, "LIL": 79, "REN": 94,
    "NIC": 84, "REI": 93, "STR": 95, "TOU": 96, "MON": 82, "NAN": 83,

    // --- MLS (USA) ---
    "MIA": 1605, "LAF": 1602, "LAG": 1132, "ORL": 1126, "NYC": 1127, "RBN": 1121, "SEA": 1114,
    "CLB": 1125, "CIN": 1133, "PHI": 1129, "DAL": 1115, "HOU": 1111, "ATL": 1128,

    // --- LIGA MX (MEX) ---
    "AME": 2287, "GLA": 2284, "TIG": 2289, "MON": 2285, "CRU": 2281, "TOL": 2290, "PAC": 2283,
    "LEO": 2282, "UNA": 2288, "SAN": 2286, "ATL": 2278, "TIJ": 2291, "QUE": 2279,

    // --- INTERNACIONAL (Seleções) ---
    "BRA": 6, "ARG": 26, "FRA": 2, "GER": 25, "ENG": 10, "POR": 27, "ESP": 9, "ITA": 30,
    "NED": 15, "BEL": 1, "URU": 7, "COL": 8, "CRO": 3, "MAR": 31, "USA": 11, "MEX": 16,
    "JPN": 12, "KOR": 17, "SEN": 13, "NGA": 19
};

// Função que você vai chamar em qualquer página do site
function getTeamLogo(name) {
    if (!name) return "https://ui-avatars.com/api/?name=??&background=ff2d85&color=fff";

    const cleanName = name.toUpperCase().trim();
    const id = TEAM_IDS[cleanName];

    console.log(`API mandou: "${cleanName}" | ID encontrado: ${id}`)

    if (id) {
        return `https://media.api-sports.io/football/teams/${id}.png`;
    }
    
    // Fallback Rosa Neon (Goal Dash Style) se não achar o time
    return `https://ui-avatars.com/api/?name=${cleanName}&background=ff2d85&color=fff&bold=true`;
}