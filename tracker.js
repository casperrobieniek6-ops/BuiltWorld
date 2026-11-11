"use strict";

window.builtWorldTracker = (() => {
  const key = "built-world-player-v1";
  const newId = () => crypto.randomUUID();
  let player;
  try {
    player = localStorage.getItem(key) || newId();
    localStorage.setItem(key, player);
  } catch { player = newId(); }
  const queue = [];
  let flushing;
  let pendingStart;

  async function api(path, data) {
    const headers = { "X-Player": player };
    if (data) headers["Content-Type"] = "application/json";
    const response = await fetch("/api/" + path, { headers, method: data ? "POST" : "GET",
      ...(data ? {body: JSON.stringify(data), keepalive: true} : {}) });
    const result = await response.json();
    if (!response.ok) throw Object.assign(new Error(result.error || "Tracker unavailable"), {status: response.status, remaining: result.remaining});
    return result;
  }

  async function start(mode, edition) {
    if (pendingStart?.mode !== mode || pendingStart?.edition !== edition) pendingStart = {id: newId(), mode, edition};
    const ticket = pendingStart;
    try {
      const result = await api("run", ticket);
      if (pendingStart === ticket) pendingStart = null;
      return result;
    } catch (error) {
      if (error.status && error.status < 500 && pendingStart === ticket) pendingStart = null;
      throw error;
    }
  }

  function flush() {
    if (flushing) return flushing;
    if (!queue.length) return Promise.resolve();
    flushing = (async () => {
      while (queue.length) {
        const id = queue[0].id;
        const batch = queue.slice(0, 25);
        const count = batch.findIndex(item => item.id !== id);
        const group = count < 0 ? batch : batch.slice(0, count);
        await api("answers", { id, answers: group.map(item => item.answer) });
        queue.splice(0, group.length);
      }
    })().catch(() => {
      // Keep the batch available for the next answer, round, or reconnect.
    }).finally(() => { flushing = undefined; });
    return flushing;
  }

  addEventListener("online", flush);
  addEventListener("pagehide", flush);
  return {
    start,
    flush,
    answer(id, answer) {
      if (!id || answer.seq > 400) return;
      queue.push({id, answer});
      void flush();
    },
    suggest: (id, bank, guess) => api("suggestions", {id, bank, guess}),
    history: () => api("tracker")
  };
})();
