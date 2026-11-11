const uuid = /^[0-9a-f-]{36}$/i;
const modes = ["daily", "unlimited", "archive"];
const limit = 5;
const bankId = /^[a-z0-9-]{1,50}$/;
const reply = (data, status = 200) => Response.json(data, { status, headers: { "Cache-Control": "no-store" } });

async function api(request, env, path) {
  if (!env.DB) return reply({ error: "Tracking database unavailable" }, 503);
  if (path === "/api/admin" && request.method === "GET") {
    if (!env.TRACKER_ADMIN_KEY || request.headers.get("Authorization") !== `Bearer ${env.TRACKER_ADMIN_KEY}`) return reply({ error: "Unauthorized" }, 401);
    const [answers, suggestions] = await env.DB.batch([
      env.DB.prepare("SELECT bank, guess, outcome, COUNT(*) AS submissions FROM answers GROUP BY bank, guess, outcome ORDER BY submissions DESC LIMIT 100"),
      env.DB.prepare("SELECT bank, guess, COUNT(*) AS suggestions FROM suggestions GROUP BY bank, guess ORDER BY suggestions DESC LIMIT 100")
    ]);
    return reply({ answers: answers.results, suggestions: suggestions.results });
  }
  const player = request.headers.get("X-Player");
  if (!uuid.test(player || "")) return reply({ error: "Invalid player identifier" }, 400);
  const counts = async () => {
    const { results } = await env.DB.prepare("SELECT mode, COUNT(*) AS used FROM runs WHERE player=? GROUP BY mode").bind(player).all();
    const remaining = { unlimited: limit, archive: limit };
    for (const {mode, used} of results) if (mode in remaining) remaining[mode] = Math.max(0, limit - used);
    return remaining;
  };
  if (request.method === "GET" && path === "/api/tracker") {
    const [runs, guesses, suggestions, remaining] = await Promise.all([
      env.DB.prepare("SELECT id, mode, edition, started_at FROM runs WHERE player=? ORDER BY started_at DESC,rowid DESC LIMIT 15").bind(player).all(),
      env.DB.prepare("SELECT a.bank, a.guess, a.outcome, a.points FROM answers a JOIN runs r ON r.id=a.run_id WHERE r.player=? ORDER BY r.started_at DESC,r.rowid DESC,a.seq DESC LIMIT 30").bind(player).all(),
      env.DB.prepare("SELECT s.bank, s.guess, s.created_at FROM suggestions s JOIN runs r ON r.id=s.run_id WHERE r.player=? ORDER BY s.created_at DESC LIMIT 25").bind(player).all(),
      counts()
    ]);
    return reply({ runs: runs.results, guesses: guesses.results, suggestions: suggestions.results, remaining });
  }
  if (request.method !== "POST") return reply({ error: "Unknown endpoint" }, 404);
  const raw = await request.text();
  if (raw.length > 45000) return reply({ error: "Request too large" }, 413);
  let data;
  try { data = JSON.parse(raw); } catch { return reply({ error: "Invalid JSON" }, 400); }
  if (!data || !uuid.test(data.id || "")) return reply({ error: "Invalid run identifier" }, 400);
  if (path === "/api/run") {
    if (!modes.includes(data.mode) || !/^\d{4}-\d\d-\d\d$/.test(data.edition || "")) return reply({ error: "Invalid edition or mode" }, 400);
    // A single write enforces the quota even when tabs start runs concurrently.
    await env.DB.prepare(`INSERT INTO runs(id,player,mode,edition)
      SELECT ?,?,?,? WHERE ?='daily' OR (SELECT COUNT(*) FROM runs WHERE player=? AND mode=?) < ?
      ON CONFLICT(id) DO NOTHING`).bind(data.id, player, data.mode, data.edition, data.mode, player, data.mode, limit).run();
    const run = await env.DB.prepare("SELECT mode, edition FROM runs WHERE id=? AND player=?").bind(data.id, player).first();
    const remaining = await counts();
    if (!run) return reply({ error: "Free turns used", remaining }, 402);
    if (run.mode !== data.mode || run.edition !== data.edition) return reply({ error: "Run already exists" }, 409);
    return reply({ id: data.id, remaining });
  }
  const run = await env.DB.prepare("SELECT id FROM runs WHERE id=? AND player=?").bind(data.id, player).first();
  if (!run) return reply({ error: "Run not found" }, 404);
  if (path === "/api/answers") {
    const rows = data.answers;
    if (!Array.isArray(rows) || rows.length > 50 || rows.some(row => !row || !bankId.test(row.bank || "") ||
      typeof row.guess !== "string" || !row.guess.trim() || row.guess.length > 100 ||
      !Number.isInteger(row.seq) || row.seq < 1 || row.seq > 400 ||
      !["accepted", "duplicate", "unmatched", "ambiguous"].includes(row.outcome) ||
      ![0, 10, 20, 40, 60, 100].includes(row.points) || (row.outcome !== "accepted" && row.points !== 0))) {
      return reply({ error: "Invalid answer batch" }, 400);
    }
    if (rows.length) await env.DB.batch(rows.map(row => env.DB.prepare("INSERT OR IGNORE INTO answers(run_id,seq,bank,guess,outcome,points) VALUES(?,?,?,?,?,?)")
      .bind(data.id, row.seq, row.bank, row.guess, row.outcome, row.points)));
    return reply({ saved: true });
  }
  if (path === "/api/suggestions") {
    if (!bankId.test(data.bank || "") || typeof data.guess !== "string" || !data.guess.trim() || data.guess.length > 100) return reply({ error: "Invalid suggestion" }, 400);
    await env.DB.prepare("INSERT OR IGNORE INTO suggestions(run_id,bank,guess) SELECT ?,?,? WHERE (SELECT COUNT(*) FROM suggestions WHERE run_id=?) < 50")
      .bind(data.id, data.bank, data.guess.trim(), data.id).run();
    const saved = await env.DB.prepare("SELECT 1 AS saved FROM suggestions WHERE run_id=? AND bank=? AND guess=?")
      .bind(data.id, data.bank, data.guess.trim()).first();
    return saved ? reply({ saved: true }) : reply({ error: "Suggestion limit reached for this run" }, 429);
  }
  return reply({ error: "Unknown endpoint" }, 404);
}

export default {
  async fetch(request, env) {
    const { pathname } = new URL(request.url);
    if (pathname.startsWith("/api/")) {
      try { return await api(request, env, pathname); }
      catch { return reply({ error: "Tracker temporarily unavailable" }, 503); }
    }
    const asset = ASSETS[pathname === "/" ? "/index.html" : pathname];
    if (!asset) return new Response("Not found", {status:404});
    return new Response(typeof asset[1] === "string" ? asset[1] : new Uint8Array(asset[1]), {headers:{"Content-Type":asset[0], "Cache-Control":"no-cache"}});
  }
};
