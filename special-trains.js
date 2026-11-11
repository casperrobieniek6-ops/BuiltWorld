"use strict";

window.builtWorldSpecials = {
  liveries: {
    skyline: { name: "Skyline Observation", body: "#eee2c4", stripe: "#b55a3c", roof: "#5c6c65", dome: true },
    river: { name: "Riverlight Express", body: "#b7d1c9", stripe: "#1d6e78", roof: "#536e73", dome: true },
    brass: { name: "Brassworks Special", body: "#e3ba7c", stripe: "#863d30", roof: "#4c463a", observationDeck: true },
    garden: { name: "Garden City Limited", body: "#c5d09e", stripe: "#416448", roof: "#62745b", observationDeck: true },
    airport: { name: "Runway Limited", body: "#e0e5df", stripe: "#5a4195", roof: "#68658e", dome: true },
    night: { name: "Midnight Mail", body: "#526287", stripe: "#deb868", roof: "#343b55", observationDeck: true }
  },
  answers: {
    homes: { "Earthship": "garden", "Shotgun house": "brass" },
    "housing-types": { "Shophouse": "brass", "Perimeter block": "garden" },
    planning: { "Nowa Huta": "brass", "Co-op City": "skyline" },
    "street-design": { "Woonerf": "garden", "Pedestrian scramble": "skyline" },
    stormwater: { "Bioswale": "garden", "Rain garden": "river" },
    canals: { "Elbląg Canal": "river", "Panama Canal": "river" },
    bridges: { "Transporter bridge": "brass", "Bascule bridge": "river" },
    "bridges-world": { "Forth Bridge": "brass", "Golden Gate Bridge": "skyline" },
    tunnels: { "Tokyo Bay Aqua-Line": "river", "Holland Tunnel": "night" },
    "tunnel-methods": { "Immersed tube": "river", "Tunnel boring machine": "brass" },
    airports: { "JFK": "airport", "HND": "skyline", "LHR": "night" },
    rail: { "STP": "brass", "WAT": "night" },
    "amtrak-stations": { "PHL": "brass", "CHI": "night" },
    "metro-cities": { "Tokyo": "skyline", "Stockholm": "night" },
    "metro-systems": { "Tokyo Metro": "skyline", "London Underground": "night" },
    "rail-stations": { "Grand Central Terminal": "brass", "Flinders Street Station": "skyline" },
    "high-speed": { "Acela": "acela", "TGV": "tgv", "Shinkansen": "shinkansen", "ICE": "ice" },
    shinkansen: { "0 Series": "shinkansen", "N700S": "n700s" },
    tgv: { "TGV Sud-Est": "tgv", "TGV M": "river" },
    acela: { "PHL": "acela", "NYP": "skyline" }
  },
  fleet: {
    shinkansen: { name: "0 Series Shinkansen", tier: 2 },
    tgv: { name: "TGV Sud-Est", tier: 3 },
    acela: { name: "Acela", tier: 4 },
    ice: { name: "ICE 3", tier: 5 },
    n700s: { name: "N700S Shinkansen", tier: 6 }
  }
};
