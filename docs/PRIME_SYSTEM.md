# PRIME System Architecture

**Why primes exist:** CLAUDE.md is a minimal kernel (~90 lines). Domain-specific context lives in prime commands to reduce token waste. Load only what you need.

**How to use:**
1. Session starts → kernel loads automatically (CLAUDE.md)
2. Task begins → run the relevant `/prime-*` command
3. Prime loads → domain context now in memory
4. Task changes domain → run a different prime

**Rules:**
- One prime per domain (don't stack frontend + backend)
- Primes are additive to kernel, not replacements
- If task spans domains, pick the primary one
- Re-run prime if context gets stale after long conversations

**Prime contents:**
- `/prime-frontend` → Next.js patterns, Tailwind, testing, FromFigmaMake refs
- `/prime-backend` → FastAPI patterns, Firestore, Firebase Admin, deploy
- `/prime-bug` → Debug workflow, known bugs, common pitfalls, time-boxing
- `/prime-feature` → TASK_TRACKER workflow, phases, code targets, agents
