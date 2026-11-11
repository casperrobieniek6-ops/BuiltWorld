CREATE TABLE runs (id TEXT PRIMARY KEY, player TEXT NOT NULL, mode TEXT NOT NULL, edition TEXT NOT NULL, started_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP);
--> statement-breakpoint
CREATE INDEX runs_player_mode ON runs(player, mode);
--> statement-breakpoint
CREATE TABLE answers (run_id TEXT NOT NULL REFERENCES runs(id), seq INTEGER NOT NULL, bank TEXT NOT NULL, guess TEXT NOT NULL, outcome TEXT NOT NULL, points INTEGER NOT NULL, PRIMARY KEY(run_id, seq));
--> statement-breakpoint
CREATE TABLE suggestions (run_id TEXT NOT NULL REFERENCES runs(id), bank TEXT NOT NULL, guess TEXT NOT NULL, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, PRIMARY KEY(run_id, bank, guess));
