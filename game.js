"use strict";

const roundSeconds = 45;
const rounds = [
  {
    label: "Residential architecture",
    prompt: "Name an architectural style used for American houses.",
    rule: "Named styles and revivals count. Broad eras and house forms are excluded.",
    answers: [
      "Craftsman|American Craftsman", "Colonial Revival", "Tudor Revival|Mock Tudor",
      "Midcentury Modern|Mid-century Modern", "Cape Cod|Cape Cod Revival",
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
      "Folk Victorian", "Carpenter Gothic", "International Style", "Regency Revival|Hollywood Regency"
    ],
    bands: [5, 23]
  },
  {
    label: "Road crossings",
    prompt: "Name a U.S. road tunnel that runs beneath a body of water.",
    rule: "A river, harbor, bay, or lake counts. Give the tunnel or crossing name.",
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
      "Harvey Tunnel"
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
      "Cistern|Cisterns|Rainwater cistern", "Constructed wetland|Stormwater wetland",
      "Infiltration trench|Infiltration trenches", "Infiltration basin|Recharge basin",
      "Dry well|Drywell|Dry wells", "Catch basin|Catch basins|Stormwater inlet",
      "Underground detention vault|Stormwater vault|Detention tank|Underground detention tank",
      "Vegetated filter strip|Filter strip", "Sand filter|Stormwater sand filter",
      "Stormwater tree trench|Tree trench|Stormwater tree pit", "Level spreader",
      "Check dam|Check dams", "Stormwater planter|Flow through planter", "Stormwater tunnel|Stormwater storage tunnel"
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
      "Telford", "Navi Mumbai|New Bombay", "Putrajaya"
    ],
    bands: [5, 18]
  },
  {
    label: "Bridge engineering",
    prompt: "Name a type of bridge based on how it carries loads or how it opens.",
    rule: "Structural families and distinct movable mechanisms count. For drawbridges, name the mechanism.",
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
      "Trestle bridge|Trestle", "Tubular bridge|Tubular", "Lenticular truss bridge|Lenticular truss"
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
  const entry = rounds[roundIndex].lookup.get(key);
  const result = run[roundIndex];
  $("feedback").dataset.tone = "neutral";
  if (!entry) {
    gameAudio.play("miss");
    $("feedback").textContent = "Outside this playtest’s answer bank. Try another.";
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
  $("feedback").textContent = `+${entry.points} · ${entry.name}${entry.points === 40 ? " · Obscure find" : ""}`;
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
