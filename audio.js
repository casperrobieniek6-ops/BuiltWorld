"use strict";

const gameAudio = (() => {
  const toggle = document.getElementById("sound");
  const label = document.getElementById("sound-label");
  const icon = document.getElementById("sound-icon");
  const AudioEngine = window.AudioContext || window.webkitAudioContext;
  let enabled = Boolean(AudioEngine);
  let context;
  let output;

  try { enabled = enabled && localStorage.getItem("built-world-muted") !== "yes"; } catch {}

  const cues = {
    start: [[196, 0, .18], [294, .08, .21], [392, .16, .28]],
    correct: [[440, 0, .12], [659, .06, .18]],
    rare: [[392, 0, .13], [587, .07, .14], [784, .14, .16], [1047, .21, .22]],
    miss: [[165, 0, .09], [131, .05, .11]],
    tick: [[580, 0, .065]],
    end: [[330, 0, .16], [220, .12, .28]],
    finish: [[262, 0, .19], [392, .1, .19], [523, .2, .28], [659, .3, .35]]
  };

  function syncControl() {
    toggle.setAttribute("aria-pressed", String(enabled));
    label.textContent = enabled ? "Sound on" : "Sound off";
    icon.textContent = enabled ? "◖))" : "◖×";
    toggle.disabled = !AudioEngine;
  }

  function play(cue) {
    if (!enabled) return;
    try {
      if (!context) {
        context = new AudioEngine();
        output = context.createGain();
        output.gain.value = .28;
        output.connect(context.destination);
      }
      if (context.state !== "running") context.resume().catch(() => {});
      for (const [frequency, delay, duration] of cues[cue]) {
        const start = context.currentTime + delay;
        const oscillator = context.createOscillator();
        const envelope = context.createGain();
        oscillator.type = "triangle";
        oscillator.frequency.value = frequency;
        envelope.gain.setValueAtTime(.001, start);
        envelope.gain.exponentialRampToValueAtTime(cue === "tick" ? .16 : .38, start + .012);
        envelope.gain.exponentialRampToValueAtTime(.001, start + duration);
        oscillator.connect(envelope).connect(output);
        oscillator.start(start);
        oscillator.stop(start + duration);
      }
    } catch {}
  }

  toggle.addEventListener("click", () => {
    enabled = !enabled;
    try { localStorage.setItem("built-world-muted", enabled ? "no" : "yes"); } catch {}
    if (output) output.gain.value = enabled ? .28 : 0;
    syncControl();
    if (enabled) play("correct");
  });
  syncControl();
  return { play };
})();
