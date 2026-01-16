//Arquivo utilizado para buscar logo dos times de futebol
const TEAM_IDS = {
    // --- PREMIER LEAGUE ---
    "MCI": 50, "ARS": 42, "NEW": 34, "FUL": 36, "BRE": 55, "WHU": 48, "BUR": 44, 
    "CRY": 52, "LEE": 37, "SUN": 746, "MUN": 33, "CHE": 49, "TOT": 47, "LIV": 40, 
    "NFO": 65, "WOL": 39, "AVL": 66, "EVE": 45,

    // --- BUNDESLIGA ---
    "B04": 168, "BVB": 165, "RBL": 173, "SVW": 162, "SGE": 169, "KOE": 192, 
    "M05": 164, "WOB": 161, "SCH": 174, "TSG": 167, "STP": 186, "HSV": 175, 
    "BMG": 163, "FCB": 157, "VFB": 170, "FCU": 182, "FCA": 172, "SCF": 160,

    // --- LA LIGA ---
    "RMA": 541, "BAR": 529, "ATM": 530, "VIL": 533, "VAL": 532, "SEV": 536, 
    "RSO": 548, "BET": 543, "ATH": 531, "GIR": 547, "OSA": 542, "MLL": 539, 
    "RAY": 554, "CEL": 538, "ALA": 544, "GET": 546, "LEV": 545, "ESP": 540,

    // --- SERIE A (ITA) ---
    "ACM": 489, "ASR": 497, "LAZ": 487, "INT": 505, "JUV": 496, "NAP": 492, 
    "ATA": 499, "BOL": 500, "FIO": 502, "TOR": 503, "UDI": 494, "GEN": 495, 
    "LEC": 488, "VER": 504, "CAG": 490, "PAR": 501, "COM": 512,

    // --- LIGUE 1 ---
    "PSG": 85, "OM": 81, "OL": 80, "LIL": 79, "ASM": 91, "RCL": 116, "OGC": 84, 
    "SR": 94, "FCN": 83, "TFC": 96, "STR": 95, "AUX": 108,

    // --- CHAMPIONS (IDs DE ESCUDO CORRETOS) ---
    "BRU": 569,   // Club Brugge (Volta pro 569, o erro de undefined era falta no código)
    "ALM": 1244,  // Kairat Almaty
    "BOG": 5455,  // Bodø/Glimt
    "AJA": 194,   // Ajax
    "SCP": 211,   // Sporting CP
    "OLY": 1530,  // Olympiacos
    "GAL": 610,   // Galatasaray
    "FCK": 400, "PSV": 197, "SLB": 190, "POR": 212,

    // --- INTERNACIONAL ---
    "USA": 2384, // Estados Unidos
    "MEX": 16,   // México (Diferente do 'CLU' ou 'MON' da Liga MX)
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

    // --- OUTROS ---
    "MIA": 1605, "LAF": 1602, "LAG": 1132,

    // --- LIGA MX (MÉXICO) ---
    "MON": 2291, // Monterrey
    "NEC": 2296, // Necaxa
    "ATL": 2282, // Atlas
    "UAN": 2289, // Tigres UANL
    "TOL": 2293, // Toluca
    "CRU": 2283, // Cruz Azul
    "PUE": 2295, // Puebla
    "CLU": 2287, // Club América (A API mandou CLU para o América)
    "ASL": 2313, // Atlético San Luis
    "UNA": 2290, // Pumas UNAM
    "SAN": 2292, // Santos Laguna
    "PAC": 2288 // Pachuca   
};

// Função que você vai chamar em qualquer página do site
function getTeamLogo(name) {
    if (!name) return "https://ui-avatars.com/api/?name=??&background=ff2d85&color=fff";

    const cleanName = String(name).trim().toUpperCase();
    const manualLogos = {
        "BOG": "https://images.fotmob.com/image_resources/logo/teamlogo/8402.png",
        "ALM": "https://images.fotmob.com/image_resources/logo/teamlogo/8037.png",
        "SCP": "https://images.fotmob.com/image_resources/logo/teamlogo/9768.png",
        "OLY": "https://images.fotmob.com/image_resources/logo/teamlogo/8638.png",
        "GAL": "https://images.fotmob.com/image_resources/logo/teamlogo/8637.png"
    };

    if (manualLogos[cleanName]) {
        return manualLogos[cleanName]; // Retorna a logo perfeita sem erro da API
    }
    
    const id = TEAM_IDS[cleanName];

    console.log(`API mandou: "${cleanName}" | ID encontrado: ${id}`)

    if (id) {
        return `https://media.api-sports.io/football/teams/${id}.png`;
    }
    
    // Fallback Rosa Neon (Goal Dash Style) se não achar o time
    return `https://ui-avatars.com/api/?name=${cleanName}&background=ff2d85&color=fff&bold=true`;
}