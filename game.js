"use strict";

const roundSeconds = 45;
const rounds = [
  {
    label: "Residential architecture",
    prompt: "Name a style or type of home used in North America.",
    rule: "Architectural styles, house forms, and traditional dwellings all count.",
    answers: [
      "Craftsman|American Craftsman", "Colonial Revival", "Tudor Revival|Mock Tudor",
      "Midcentury Modern|Mid-century Modern", "Cape Cod|Cape Cod Revival",
      "Log cabin|Log cabins|Log house|Log home|Log homes",
      "Ranch house|Ranch|Rambler|Ranch style|Ranch-style house",
      "Bungalow|Bungalows|Bungalow house", "Tipi|Teepee|Tepee|Tipis|Teepees|Tepees",
      "A-frame|A-frame house|A-frame cabin", "Townhouse|Town house|Townhome",
      "Rowhouse|Row house|Terraced house", "Duplex|Duplex house",
      "Mobile home|Trailer home|House trailer|Manufactured home",
      "Farmhouse|Farm house|American farmhouse",
      "Queen Anne|Queen Anne Revival", "Georgian|Georgian Colonial",
      "Federal|Federal Style", "Greek Revival", "Gothic Revival",
      "Italianate", "Second Empire|French Second Empire", "Shingle Style",
      "Stick Style|Eastlake Stick Style", "Spanish Colonial Revival|Spanish Revival",
      "Mission Revival|Mission Style", "Prairie School|Prairie Style",
      "Pueblo Revival|Santa Fe Style", "Art Deco", "Streamline Moderne",
      "Mediterranean Revival", "Dutch Colonial Revival", "French Eclectic",
      "Beaux-Arts", "Chateauesque|Châteauesque", "Neoclassical|Neoclassical Revival",
      "Richardsonian Romanesque", "Monterey Revival|Monterey Colonial Revival",
      "Egyptian Revival", "Moorish Revival", "Googie", "Usonian",
      "Folk Victorian", "Carpenter Gothic", "International Style", "Regency Revival|Hollywood Regency",
      "Wigwam|Wigwams", "Wickiup|Wickiups|Wicki-up", "Longhouse|Long house|Longhouses",
      "Hogan|Hogans", "Earth lodge|Earth lodges", "Plank house|Plank houses|Cedar plank house",
      "Igloo|Iglu|Snow house|Igloos", "Pueblo dwelling|Pueblo house|Pueblo|Adobe pueblo",
      "Adobe house|Adobe home|Adobe", "Pit house|Pithouse|Pit dwelling",
      "Sod house|Sod home|Soddy|Soddie", "Dugout house|Dugout dwelling|Dugout",
      "Stilt house|Stilt home|Pile dwelling", "Houseboat|House boat|Houseboats",
      "Yurt|Yurts", "Tiny house|Tiny home|Tiny houses", "Geodesic dome|Dome house|Geodesic dome home",
      "Earthship|Earthship house", "Earth-sheltered house|Earth sheltered home|Earth berm house|Berm house",
      "Straw bale house|Strawbale house|Straw bale home", "Cob house|Cob home",
      "Rammed earth house|Rammed earth home", "Shipping container home|Container home|Container house",
      "Barndominium|Barndo", "Modular home|Modular house", "Triple-decker|Three-decker|Triple decker house",
      "Shotgun house|Shotgun shack|Shotgun", "Saltbox|Saltbox house",
      "I-house|I house", "Dogtrot house|Dogtrot|Dog-trot cabin",
      "Kit house|Kit home|Sears kit house|Sears kit home|Sears Modern Home",
      "Four-square|American Foursquare|Foursquare|Four-square house",
      "Split-level house|Split level|Split-level home", "Split-entry house|Bi-level|Raised ranch",
      "Brownstone|Brownstone house", "California bungalow",
      "Creole cottage|Louisiana Creole cottage", "Creole townhouse", "Chalet|Swiss chalet|Chalet style",
      "Garrison colonial|Garrison house", "Minimal Traditional", "Storybook style|Storybook house",
      "Gothic cottage|Gothic Revival cottage", "Octagon house|Octagonal house",
      "Quonset hut|Quonset house", "Dingbat apartment|Dingbat", "Tenement|Tenement house",
      "Courtyard apartment|Courtyard apartment building", "Garden apartment|Garden apartments",
      "Walk-up apartment|Walk-up|Walkup", "Loft apartment|Loft", "Condominium|Condo",
      "Triplex|Triplex house", "Fourplex|Quadplex|Four-unit house",
      "Carriage house|Carriage house apartment", "Accessory dwelling unit|ADU|Granny flat|Backyard cottage|Laneway house|Lane house",
      "Modern farmhouse", "French Provincial|French Provincial house",
      "Spanish Mission|Mission architecture", "Territorial Revival|Territorial style",
      "Tudor Gothic", "Colonial house|Colonial style|Colonial",
      "Victorian house|Victorian home|Victorian", "Cottage|Cottages",
      "Cotswold cottage|Tudor cottage", "Florida cracker house|Cracker house",
      "Key West conch house|Conch house", "Charleston single house|Charleston single",
      "Charleston double house|Charleston double", "French Colonial|French Colonial house",
      "Spanish Colonial|Spanish Colonial house", "Dutch Colonial|Dutch Colonial house",
      "New England Colonial|First Period house", "Postmodern house|Postmodernism",
      "Brutalist house|Brutalism"
    ],
    bands: [15, 33]
  },
  {
    label: "Road crossings",
    prompt: "Name a road tunnel that runs beneath a body of water.",
    rule: "Road crossings worldwide count. Give the tunnel or crossing name.",
    answers: [
      "Holland Tunnel|Holland", "Lincoln Tunnel|Lincoln",
      "Fort McHenry Tunnel|Fort McHenry", "Baltimore Harbor Tunnel|Harbor Tunnel",
      "Hampton Roads Bridge–Tunnel|HRBT|Hampton Roads Tunnel",
      "Chesapeake Bay Bridge–Tunnel|CBBT|Chesapeake Bay Bridge Tunnel",
      "Detroit–Windsor Tunnel|Detroit Windsor Tunnel|Windsor Detroit Tunnel",
      "Hugh L. Carey Tunnel|Hugh Carey Tunnel|Brooklyn Battery Tunnel|Battery Tunnel",
      "Queens–Midtown Tunnel|Queens Midtown|Midtown Tunnel NYC",
      "Ted Williams Tunnel|Ted Williams", "Sumner Tunnel|Sumner",
      "Callahan Tunnel|Callahan", "Monitor–Merrimac Memorial Bridge–Tunnel|MMMBT|Monitor Merrimac Tunnel",
      "Elizabeth River Downtown Tunnel|Downtown Tunnel|Norfolk Downtown Tunnel",
      "Elizabeth River Midtown Tunnel|Midtown Tunnel Norfolk|Norfolk Midtown Tunnel",
      "Posey Tube|Posey Tunnel", "Webster Street Tube|Webster Tube|Webster Street Tunnel",
      "George Wallace Tunnel|Wallace Tunnel", "Bankhead Tunnel|Bankhead",
      "Harvey Tunnel",
      "Rotherhithe Tunnel", "Blackwall Tunnel|Blackwall",
      "Silvertown Tunnel|Silvertown", "Dartford Tunnel|Dartford Crossing",
      "Limehouse Link Tunnel|Limehouse Link", "Tyne Tunnel|New Tyne Crossing",
      "Queensway Tunnel|Birkenhead Tunnel", "Kingsway Tunnel|Wallasey Tunnel",
      "Clyde Tunnel", "Elbe Tunnel|New Elbe Tunnel|Neuer Elbtunnel",
      "Old Elbe Tunnel|Alter Elbtunnel|St Pauli Elbe Tunnel",
      "IJtunnel|IJ Tunnel", "Coentunnel", "Velsertunnel|Velser Tunnel",
      "Wijkertunnel", "Beneluxtunnel|Benelux Tunnel", "Maastunnel|Maas Tunnel",
      "Kiltunnel|Kil Tunnel", "Drechttunnel", "Heinenoordtunnel", "Botlektunnel",
      "Westerscheldetunnel|Western Scheldt Tunnel",
      "Øresund Tunnel|Oresund Tunnel|Drogden Tunnel|Drogdentunnelen|Øresund Link",
      "Ryfylke Tunnel|Ryfylketunnelen|Ryfast", "Eiksund Tunnel|Eiksundtunnelen",
      "Atlanterhavstunnelen|Atlantic Ocean Tunnel", "Oslofjord Tunnel|Oslofjordtunnelen",
      "North Cape Tunnel|Nordkapptunnelen", "Bømlafjord Tunnel|Bomlafjord Tunnel|Bømlafjordtunnelen",
      "Vágatunnilin|Vagar Tunnel|Vágar Tunnel", "Eysturoy Tunnel|Eysturoyartunnilin",
      "Sandoy Tunnel|Sandoyartunnilin", "Norðoyatunnilin|Nordoy Tunnel",
      "Hvalfjörður Tunnel|Hvalfjordur Tunnel|Hvalfjarðargöng",
      "Eurasia Tunnel|Avrasya Tunnel|Avrasya Tüneli", "Clem Jones Tunnel|Clem7|Clem 7",
      "Cross-Harbour Tunnel|Cross Harbor Tunnel|Hong Kong Cross Harbour Tunnel",
      "Eastern Harbour Crossing|Eastern Harbour Tunnel", "Western Harbour Crossing|Western Harbour Tunnel",
      "Hong Kong–Zhuhai–Macao Bridge Tunnel|HZMB Tunnel|Hong Kong Zhuhai Macau Bridge|HZMB",
      "Shenzhen–Zhongshan Tunnel|Shenzhen Zhongshan Link|Shenzhong Link",
      "Shanghai Yangtze River Tunnel|Shanghai Yangtze Tunnel",
      "Dalian Bay Undersea Tunnel|Dalian Bay Tunnel", "Jiaozhou Bay Tunnel|Qingdao Jiaozhou Bay Tunnel",
      "Wuhan Yangtze River Tunnel|Wuhan Yangtze Tunnel", "Wuhan Yangtze River Highway–Railway Tunnel|Wuhan Sanyang Road Tunnel",
      "Tokyo Bay Aqua-Line|Tokyo Bay Aqua Line|Tokyo Wan Aqua Line|Aqua Tunnel",
      "Kanmon Road Tunnel|Kanmon Tunnel|Kanmon National Highway Tunnel",
      "Osaka Port Sakishima Tunnel|Sakishima Tunnel", "Kobe Port Island Tunnel|Port Island Tunnel",
      "Geoga Tunnel|Geoga Bridge Tunnel|Busan Geoje Fixed Link", "Incheon North Port Tunnel",
      "Sydney Harbour Tunnel|Sydney Harbor Tunnel", "Massey Tunnel|George Massey Tunnel|Deas Island Tunnel",
      "Louis-Hippolyte La Fontaine Tunnel|La Fontaine Tunnel|Lafontaine Tunnel"
    ],
    bands: [6, 14]
  },
  {
    label: "Water and drainage",
    prompt: "Name something cities build to manage stormwater runoff.",
    rule: "Name a feature that captures, slows, infiltrates, or carries runoff.",
    answers: [
      "Storm drain|Storm drains|Stormwater drain", "Storm sewer|Storm sewers",
      "Drainage ditch|Drainage ditches", "Culvert|Culverts", "Retention pond|Wet pond",
      "Detention basin|Detention pond|Dry pond|Stormwater detention basin",
      "Rain garden|Rain gardens|Bioretention cell|Bioretention basin|Bioretention",
      "Bioswale|Bioswales|Vegetated swale|Grassed swale|Swale",
      "Permeable pavement|Porous pavement|Pervious pavement|Permeable pavers|Porous asphalt|Pervious concrete",
      "Green roof|Green roofs|Living roof", "Rain barrel|Rain barrels",
      "Cistern|Cisterns|Rainwater cistern|Stormwater reuse tank|Rainwater harvesting tank|Rainwater storage tank", "Constructed wetland|Stormwater wetland",
      "Infiltration trench|Infiltration trenches", "Infiltration basin|Recharge basin",
      "Dry well|Drywell|Dry wells", "Catch basin|Catch basins|Stormwater inlet",
      "Underground detention vault|Stormwater vault|Detention tank|Underground detention tank",
      "Vegetated filter strip|Filter strip", "Sand filter|Stormwater sand filter",
      "Stormwater tree trench|Tree trench|Stormwater tree pit", "Level spreader",
      "Check dam|Check dams", "Stormwater planter|Flow through planter", "Stormwater tunnel|Stormwater storage tunnel",
      "Gutter|Street gutter|Road gutter|Curb gutter|Gutters",
      "French drain|French drains", "Underdrain|Under drain|Underdrains",
      "Trench drain|Channel drain|Slot drain|Linear drain",
      "Floodable park|Flood storage park|Stormwater park|Floodable plaza|Water square",
      "Detention chamber|Stormwater chamber", "Infiltration chamber",
      "Dry creek bed|Dry stream bed|Dry creek",
      "Forebay|Sediment forebay|Stormwater forebay", "Sediment basin|Sediment pond|Silt basin",
      "Sediment trap|Silt trap", "Hydrodynamic separator|Vortex separator",
      "Oil-grit separator|Oil grit separator|Oil and grit separator",
      "Inlet filter|Storm drain filter|Catch basin insert",
      "Trash rack|Debris screen|Stormwater trash screen",
      "Gross pollutant trap|GPT", "Stormwater pump station|Stormwater pumping station|Drainage pump station",
      "Riprap apron|Outlet protection|Riprap outlet apron",
      "Energy dissipator|Outlet energy dissipator", "Stilling basin",
      "Drop structure|Grade control structure", "Overflow weir|Stormwater weir|Weir",
      "Orifice plate|Flow control orifice", "Flap gate|Flap valve|Backflow flap gate",
      "Terrace|Contour terrace", "Vegetated buffer|Riparian buffer|Buffer strip",
      "Blue roof|Roof detention|Blue roofs", "Blue-green roof|Blue green roof",
      "Soakaway|Soakaway pit|Soak pit", "Infiltration gallery|Recharge gallery",
      "Perforated pipe|Perforated drain pipe", "Gravel drainage blanket|Drainage blanket",
      "Stormwater diversion channel|Diversion channel|Flood bypass channel",
      "Floodplain bench|Two-stage ditch|Two stage ditch",
      "Restored floodplain|Floodplain restoration", "Downspout disconnection|Disconnected downspout"
    ],
    bands: [5, 16]
  },
  {
    label: "Urban planning",
    prompt: "Name a planned town or major planned housing development built after World War II.",
    rule: "Purpose-built towns, districts, and housing developments count worldwide. Give the place name.",
    answers: [
      "Levittown|Levittown New York|Levittown NY|Levittown Long Island",
      "Brasília|Brasilia", "Co-op City|Coop City|Co op City",
      "Nowa Huta", "Reston|Reston Virginia|Reston VA",
      "Columbia, Maryland|Columbia Maryland|Columbia MD|Columbia",
      "Milton Keynes", "Chandigarh", "Celebration|Celebration Florida|Celebration FL",
      "Irvine|Irvine California|Irvine CA", "The Woodlands|Woodlands Texas",
      "Peter Cooper Village", "Stuyvesant Town|Stuy Town",
      "Roosevelt Island",
      "New Ash Green", "Cumbernauld", "Livingston|Livingston Scotland",
      "Harlow", "Stevenage", "Runcorn New Town|Runcorn",
      "Almere", "Lelystad", "Tama New Town", "Senri New Town",
      "Tapiola", "Vällingby|Vallingby", "Farsta", "Poundbury",
      "Vila Kennedy", "Cergy-Pontoise", "Marne-la-Vallée|Marne la Vallee",
      "Telford", "Navi Mumbai|New Bombay", "Putrajaya",
      "Nusajaya|Iskandar Puteri", "Cyberjaya", "Shah Alam", "Petaling Jaya",
      "Salt Lake City, Kolkata|Bidhannagar|Salt Lake Kolkata", "New Town, Kolkata|New Town Kolkata|Rajarhat New Town",
      "Gandhinagar", "Bhubaneswar", "Naya Raipur|Atal Nagar",
      "Noida", "Greater Noida", "GIFT City|Gujarat International Finance Tec-City",
      "Tsukuba|Tsukuba Science City", "Kohoku New Town|Kōhoku New Town",
      "Chiba New Town", "Kozoji New Town|Kōzōji New Town",
      "Semboku New Town|Senboku New Town", "Seishin New Town",
      "Bundang|Bundang New Town", "Ilsan|Ilsan New Town", "Songdo|Songdo International Business District",
      "Sejong City|Sejong|Sejong Special Self-Governing City",
      "Pangyo|Pangyo New Town", "Dongtan|Dongtan New Town", "Gwanggyo|Gwanggyo New Town",
      "Sha Tin|Shatin|Sha Tin New Town", "Tuen Mun|Tuen Mun New Town",
      "Tseung Kwan O|Tseung Kwan O New Town", "Tung Chung|Tung Chung New Town",
      "Tin Shui Wai|Tin Shui Wai New Town", "Tai Po|Tai Po New Town",
      "Ang Mo Kio", "Tampines", "Punggol", "Yishun|Nee Soon", "Woodlands, Singapore|Woodlands Singapore",
      "Toa Payoh", "Jurong East", "Jurong West", "Sengkang", "Queenstown, Singapore|Queenstown Singapore",
      "Clementi", "Pasir Ris", "Bedok", "Bishan", "Hougang",
      "Le Mirail|Toulouse Le Mirail", "Évry New Town|Evry New Town|Évry|Evry",
      "Saint-Quentin-en-Yvelines|Saint Quentin en Yvelines", "Val-de-Reuil|Val de Reuil",
      "Villeneuve-d’Ascq|Villeneuve d'Ascq", "La Grande-Motte|La Grande Motte",
      "Tychy|New Tychy", "Jastrzębie-Zdrój|Jastrzebie Zdroj",
      "Eisenhüttenstadt|Eisenhuttenstadt|Stalinstadt", "Halle-Neustadt|Halle Neustadt",
      "Berlin Marzahn|Marzahn", "Gropiusstadt", "Märkisches Viertel|Markisches Viertel",
      "Neue Vahr|Vahr", "La Mina|La Mina Barcelona", "Tres Cantos",
      "Park Hill|Park Hill Sheffield", "Thamesmead", "Byker Wall|Byker Estate",
      "Alexandra Road Estate|Alexandra and Ainsworth Estate", "Barbican Estate|The Barbican|Barbican",
      "Golden Lane Estate", "Robin Hood Gardens", "Hulme Crescents",
      "Skelmersdale", "Washington New Town|Washington Tyne and Wear",
      "Peterlee", "Newton Aycliffe", "Hatfield New Town",
      "Basildon", "Bracknell", "Crawley", "Hemel Hempstead", "Corby New Town|Corby",
      "East Kilbride", "Glenrothes", "Irvine New Town|Irvine Scotland",
      "Craigavon", "Shannon New Town|Shannon Ireland", "Adamstown|Adamstown Dublin",
      "Ballymun", "Tallaght", "Houten", "Nieuwegein", "Zoetermeer",
      "Bijlmermeer|Bijlmer", "Leidsche Rijn",
      "Auroville", "Abuja", "Dodoma", "Lilongwe", "Yamoussoukro",
      "New Cairo", "6th of October City|Sixth of October City|October 6 City",
      "10th of Ramadan City|Tenth of Ramadan City", "New Alamein",
      "Dunaújváros|Dunaujvaros|Sztálinváros", "Havířov|Havirov", "Most New Town|New Most",
      "Dimitrovgrad, Bulgaria|Dimitrovgrad Bulgaria|Dimitrovgrad",
      "Pripyat|Prypiat", "Slavutych|Slavutich", "Atomgrad Visaginas|Visaginas|Sniečkus",
      "Enerhodar|Energodar", "Tolyatti|Togliatti", "Akademgorodok|Akademgorodok Novosibirsk",
      "Ciudad Guayana|Ciudad Guayana Venezuela", "Ciudad Satélite|Ciudad Satelite",
      "Villa El Salvador", "Tlatelolco|Nonoalco Tlatelolco",
      "Pedregal de San Ángel|Jardines del Pedregal|El Pedregal",
      "Park Forest, Illinois|Park Forest Illinois|Park Forest",
      "Lakewood, California|Lakewood California|Lakewood CA",
      "Lakewood Ranch", "Laguna Woods Village|Leisure World Laguna Woods",
      "Rossmoor Leisure World|Leisure World Seal Beach",
      "Sun City, Arizona|Sun City Arizona|Sun City AZ|Sun City",
      "Sun City West", "The Villages", "Green Valley, Arizona|Green Valley Arizona",
      "Foster City", "Sea Ranch|The Sea Ranch", "Ladera Ranch",
      "Mission Viejo", "Rancho Santa Margarita", "Valencia, California|Valencia California|Valencia CA",
      "Cerritos", "Newport Coast", "Summerlin", "Green Valley, Henderson|Green Valley Henderson",
      "Stapleton Redevelopment|Central Park Denver|Stapleton Denver",
      "Highlands Ranch", "Ken Caryl Ranch|Ken-Caryl Ranch", "Broomfield",
      "Laguna West|Laguna West Lakeside", "Kentlands",
      "Seaside, Florida|Seaside Florida|Seaside FL|Seaside", "Rosemary Beach", "Alys Beach",
      "WaterColor, Florida|WaterColor Florida", "Avalon Park", "Babcock Ranch",
      "Nocatee", "Lake Nona", "Weston, Florida|Weston Florida|Weston FL",
      "Sugar Land First Colony|First Colony", "Cinco Ranch", "Sienna Plantation|Sienna Texas",
      "Kingwood, Houston|Kingwood Houston|Kingwood", "Clear Lake City",
      "South Riding", "Ashburn Village", "Montgomery Village", "New Town at St. Charles|New Town St Charles",
      "Jonathan, Minnesota|Jonathan Minnesota|Jonathan Chaska", "Radisson, New York|Radisson New York",
      "Twin Rivers, New Jersey|Twin Rivers NJ|Twin Rivers",
      "Levittown, Pennsylvania|Levittown PA|Levittown Pennsylvania",
      "Willingboro|Levittown New Jersey|Levittown NJ", "Levittown, Puerto Rico|Levittown PR",
      "Park La Brea", "Penn South|Mutual Redevelopment Houses", "Rochdale Village",
      "Starrett City|Spring Creek Towers", "LeFrak City|Lefrak City",
      "Trump Village",
      "Pruitt–Igoe|Pruitt Igoe", "Cabrini–Green|Cabrini Green", "Robert Taylor Homes",
      "Regent Park|Regent Park Toronto",
      "St. Lawrence Neighbourhood|St Lawrence Toronto",
      "Don Mills", "Thorncliffe Park", "Flemingdon Park", "Erin Mills", "Bramalea",
      "Kanata", "Nepean Centrepointe|Centrepointe", "Fermont", "Kitimat", "Tumbler Ridge",
      "Inuvik", "Wabush", "Labrador City",
      "Tuggeranong", "Belconnen", "Gungahlin", "Woden Valley|Woden",
      "Elizabeth, South Australia|Elizabeth South Australia",
      "Springfield, Queensland|Greater Springfield|Springfield Queensland",
      "Joondalup", "Kwinana",
      "Varsity Lakes", "Robina", "Forest Lake, Queensland|Forest Lake Queensland",
      "Auckland Flat Bush|Flat Bush", "Rolleston, New Zealand|Rolleston NZ"
    ],
    bands: [5, 18]
  },
  {
    label: "Bridge engineering",
    prompt: "Name a type of bridge based on how it carries loads or how it opens.",
    rule: "Structural families, named subtypes, and movable mechanisms count. For drawbridges, name the mechanism.",
    answers: [
      "Suspension bridge|Suspension", "Arch bridge|Arch",
      "Beam bridge|Beam|Girder bridge|Girder", "Truss bridge|Truss",
      "Bascule bridge|Bascule", "Cable-stayed bridge|Cable stayed bridge|Cable stayed",
      "Cantilever bridge|Cantilever", "Floating bridge|Pontoon bridge|Pontoon",
      "Swing bridge|Swing", "Vertical-lift bridge|Lift bridge|Vertical lift",
      "Tied-arch bridge|Tied arch|Bowstring arch", "Rigid-frame bridge|Rigid frame",
      "Extradosed bridge|Extradosed", "Retractable bridge|Retractable|Receding bridge",
      "Transporter bridge|Transporter", "Submersible bridge|Submersible",
      "Tilt bridge|Tilting bridge", "Rolling bridge|Curling bridge", "Stressed ribbon bridge|Stressed ribbon",
      "Trestle bridge|Trestle", "Tubular bridge|Tubular", "Lenticular truss bridge|Lenticular truss",
      "Slab bridge|Slab", "Box-girder bridge|Box girder|Box beam bridge",
      "Plate-girder bridge|Plate girder", "I-girder bridge|I girder|I-beam bridge",
      "T-beam bridge|T beam", "Continuous beam bridge|Continuous girder bridge",
      "Integral bridge|Integral abutment bridge", "Portal frame bridge|Portal frame",
      "Balanced cantilever bridge|Balanced cantilever", "Through-arch bridge|Through arch",
      "Deck arch bridge|Deck arch", "Open-spandrel arch bridge|Open spandrel arch",
      "Closed-spandrel arch bridge|Closed spandrel arch", "Corbel arch bridge|Corbel arch",
      "Segmental arch bridge|Segmental arch", "Skew arch bridge|Skew arch",
      "Network arch bridge|Network arch", "Through truss bridge|Through truss",
      "Deck truss bridge|Deck truss", "Pony truss bridge|Pony truss|Half-through truss",
      "Pratt truss bridge|Pratt truss|Pratt", "Howe truss bridge|Howe truss|Howe",
      "Warren truss bridge|Warren truss|Warren", "Parker truss bridge|Parker truss",
      "K truss bridge|K truss", "Baltimore truss bridge|Baltimore truss",
      "Pennsylvania truss bridge|Pennsylvania truss|Petit truss",
      "Camelback truss bridge|Camelback truss", "Bowstring truss bridge|Bowstring truss",
      "Bollman truss bridge|Bollman truss", "Fink truss bridge|Fink truss",
      "Town lattice truss bridge|Town lattice|Lattice truss", "Burr arch truss bridge|Burr arch truss|Burr truss",
      "Kingpost truss bridge|Kingpost truss|King post truss",
      "Queenpost truss bridge|Queenpost truss|Queen post truss",
      "Self-anchored suspension bridge|Self anchored suspension",
      "Fan cable-stayed bridge|Fan cable stayed", "Harp cable-stayed bridge|Harp cable stayed",
      "Rolling-lift bascule bridge|Scherzer rolling lift|Rolling lift bridge|Scherzer bridge",
      "Trunnion bascule bridge|Trunnion bascule", "Double-leaf bascule bridge|Double leaf bascule",
      "Single-leaf bascule bridge|Single leaf bascule", "Folding bridge|Folding drawbridge",
      "Scissors bridge|Scissor bridge",
      "Ribbon pontoon bridge|Ribbon bridge"
    ],
    bands: [5, 12]
  }
];

function normalize(value) {
  return value.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase().replace(/[^a-z0-9]/g, "");
}

for (const round of rounds) {
  round.lookup = new Map();
  round.entries = round.answers.map((answer, index) => {
    const aliases = answer.split("|");
    const points = index < round.bands[0] ? 10 : index < round.bands[1] ? 20 : 40;
    const entry = { name: aliases[0], points };
    for (const alias of aliases) round.lookup.set(normalize(alias), entry);
    return entry;
  });
}

// Optimal string alignment treats an adjacent letter swap as one typo.
function spellingDistance(input, alias) {
  let previous = Array.from({ length: alias.length + 1 }, (_, index) => index);
  let beforePrevious = previous;
  for (let row = 1; row <= input.length; row += 1) {
    const current = [row];
    for (let column = 1; column <= alias.length; column += 1) {
      const replacement = input[row - 1] === alias[column - 1] ? 0 : 1;
      current[column] = Math.min(previous[column] + 1, current[column - 1] + 1, previous[column - 1] + replacement);
      if (row > 1 && column > 1 && input[row - 1] === alias[column - 2] && input[row - 2] === alias[column - 1]) {
        current[column] = Math.min(current[column], beforePrevious[column - 2] + 1);
      }
    }
    beforePrevious = previous;
    previous = current;
  }
  return previous[alias.length];
}

function matchAnswer(round, key) {
  const exact = round.lookup.get(key) || (
    round === rounds[0] && round.lookup.get(key.replace(/(?:style|house|home|dwelling)s?$/, ""))
  );
  if (exact) return { entry: exact, corrected: false };
  if (key.length < 5) return {};

  let distanceLimit = key.length >= 10 ? 2 : 1;
  let best = new Set();
  for (const [alias, entry] of round.lookup) {
    if (alias.length < 5 || Math.abs(alias.length - key.length) > distanceLimit) continue;
    const distance = spellingDistance(key, alias);
    if (distance > distanceLimit || (distance === 2 && alias.length < 10)) continue;
    if (distance < distanceLimit) {
      best = new Set();
      distanceLimit = distance;
    }
    best.add(entry);
  }
  if (best.size === 1) return { entry: best.values().next().value, corrected: true };
  return { ambiguous: best.size > 1 };
}

const $ = id => document.getElementById(id);
let roundIndex = 0;
let deadline = 0;
let timerId;
let active = false;
let lastSecond = roundSeconds;
const artwork = ["houses", "tunnel", "stormwater", "housing", "bridge"];
let run = [];

function startRound() {
  clearInterval(timerId);
  active = true;
  const round = rounds[roundIndex];
  run[roundIndex] = { found: new Set(), points: 0 };
  $("round").textContent = `ROUND ${roundIndex + 1} / ${rounds.length} · ${round.label.toUpperCase()}`;
  $("prompt").textContent = round.prompt;
  $("rule").textContent = round.rule;
  $("feedback").textContent = "";
  $("feedback").dataset.tone = "neutral";
  $("round-art").style.backgroundImage = `linear-gradient(0deg, #111a10e8, #17201722 90%), url("art/${artwork[roundIndex]}.webp")`;
  lastSecond = roundSeconds;
  gameAudio.play("start");
  $("guess").value = "";
  $("count").textContent = "0";
  $("empty").hidden = false;
  $("found").replaceChildren();
  for (const id of ["form", "end"]) $(id).hidden = false;
  for (const id of ["reveal", "next"]) $(id).hidden = true;
  deadline = Date.now() + roundSeconds * 1000;
  tick();
  timerId = setInterval(tick, 100);
  $("guess").focus();
}

function tick() {
  const milliseconds = Math.max(0, deadline - Date.now());
  const seconds = Math.ceil(milliseconds / 1000);
  $("timer").textContent = `0:${String(seconds).padStart(2, "0")}`;
  $("bar").style.transform = `scaleX(${milliseconds / (roundSeconds * 1000)})`;
  $("round-art").classList.toggle("urgent", seconds <= 5);
  if (seconds > 0 && seconds <= 5 && seconds !== lastSecond) gameAudio.play("tick");
  lastSecond = seconds;
  if (!milliseconds) finishRound();
}

function finishRound() {
  if (!active) return;
  active = false;
  clearInterval(timerId);
  const result = run[roundIndex];
  gameAudio.play("end");
  $("feedback").dataset.tone = "neutral";
  $("feedback").textContent = result.found.size
    ? `Round cleared · ${result.found.size} found · ${result.points} points`
    : "Round complete · 0 answers found";
  $("form").hidden = true;
  $("end").hidden = true;
  $("next").textContent = roundIndex === rounds.length - 1 ? "See results →" : "Next round →";
  $("next").hidden = false;
  const examples = rounds[roundIndex].entries.filter(entry => !result.found.has(entry));
  const picks = [...new Set([examples[0], examples[Math.floor(examples.length / 2)], examples.at(-1)])].filter(Boolean);
  $("misses").replaceChildren(...picks.map(entry => {
    const item = document.createElement("li");
    item.textContent = entry.name;
    return item;
  }));
  $("reveal").hidden = !picks.length;
  $("next").focus();
}

$("form").addEventListener("submit", event => {
  event.preventDefault();
  if (!active) return;
  if (Date.now() >= deadline) {
    tick();
    return;
  }

  const input = $("guess");
  const key = normalize(input.value);
  if (!key) return;
  input.value = "";
  input.focus();
  const { entry, corrected, ambiguous } = matchAnswer(rounds[roundIndex], key);
  const result = run[roundIndex];
  $("feedback").dataset.tone = "neutral";
  if (!entry) {
    gameAudio.play("miss");
    $("feedback").textContent = ambiguous ? "That matches more than one answer. Try a fuller name." : "Outside this playtest’s answer bank. Try another.";
    return;
  }
  if (result.found.has(entry)) {
    gameAudio.play("miss");
    $("feedback").textContent = `${entry.name} is already on your list.`;
    return;
  }
  result.found.add(entry);
  result.points += entry.points;
  const rare = entry.points === 40;
  gameAudio.play(rare ? "rare" : "correct");
  $("feedback").dataset.tone = rare ? "rare" : "correct";
  $("feedback").textContent = `+${entry.points} · ${entry.name}${corrected ? " · Spelling corrected" : ""}${entry.points === 40 ? " · Obscure find" : ""}`;
  $("count").textContent = result.found.size;
  $("empty").hidden = true;
  const item = document.createElement("li");
  const name = document.createElement("span");
  const points = document.createElement("b");
  name.textContent = entry.name;
  points.textContent = `+${entry.points}`;
  if (rare) item.classList.add("rare");
  item.append(name, points);
  $("found").prepend(item);
});

function showResults() {
  gameAudio.play("finish");
  const cleared = run.filter(result => result.found.size).length;
  const answers = run.reduce((sum, result) => sum + result.found.size, 0);
  const points = run.reduce((sum, result) => sum + result.points, 0);
  $("stats").replaceChildren(...[[`${cleared}/${rounds.length}`, "ROUNDS CLEARED"], [answers, "ANSWERS FOUND"], [points, "POINTS"]].map(([value, label]) => {
    const stat = document.createElement("div");
    stat.className = "stat";
    const number = document.createElement("strong");
    const caption = document.createElement("small");
    number.textContent = value;
    caption.textContent = label;
    stat.append(number, caption);
    return stat;
  }));
  $("review").replaceChildren(...run.map((result, index) => {
    const row = document.createElement("div");
    row.className = "review-row";
    const category = document.createElement("span");
    const score = document.createElement("b");
    category.textContent = `${index + 1}. ${rounds[index].label}`;
    score.textContent = `${result.found.size} found · ${result.points} pts`;
    row.append(category, score);
    return row;
  }));
  const marks = run.map(result => result.found.size ? "■" : "□").join(" ");
  $("share").value = `Built World #001 · ${cleared}/${rounds.length} cleared · ${answers} found · ${points} points\n${marks}`;
  $("share").hidden = true;
  $("copyStatus").textContent = "";
  $("game").hidden = true;
  $("results").hidden = false;
  $("resultsTitle").focus();
}

function startGame() {
  run = [];
  roundIndex = 0;
  $("intro").hidden = true;
  $("results").hidden = true;
  $("game").hidden = false;
  startRound();
}

$("start").addEventListener("click", startGame);
$("replay").addEventListener("click", startGame);
$("end").addEventListener("click", finishRound);
$("next").addEventListener("click", () => {
  if (active) return;
  roundIndex += 1;
  if (roundIndex === rounds.length) showResults();
  else startRound();
});
$("copy").addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText($("share").value);
    $("copyStatus").textContent = "Result copied.";
  } catch {
    $("share").hidden = false;
    $("share").focus();
    $("share").select();
    $("copyStatus").textContent = "Select and copy your result.";
  }
});
