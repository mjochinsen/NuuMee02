# NuuMee02 - Fresh Start Repository

**Created:** 2025-11-27
**Purpose:** Clean slate for NuuMee.AI with preserved configurations and reusable assets

---

## Quick Start for Next Claude

1. **Read CREDENTIALS_INVENTORY.md FIRST** - Contains all API keys, tokens, project IDs
2. **Read docs/PRICING_STRATEGY.md** - Business logic for credits, subscriptions, tiers
3. **Read docs/firestore-schema.md** - Database schema documentation
4. **Start minimal** - The previous codebase had 35,000+ lines. Build one feature at a time.

---

## Directory Structure

```
NuuMee02/
├── README.md                    # This file (for next Claude)
├── CREDENTIALS_INVENTORY.md     # ALL API keys, tokens, project IDs (CRITICAL)
├── CLEANUP_PLAN.md              # Analysis of what was deleted and why
├── .firebaserc                  # Firebase project mapping (wanapi-prod)
├── .gitignore                   # Git ignore rules
├── .mcp.json                    # MCP server configuration (GitHub)
├── .vscode/
│   └── settings.json            # VS Code workspace settings
├── .claude/
│   ├── agents/                  # 40 Claude agents (including FIBY)
│   ├── commands/                # 12 slash commands (including /ask-fiby)
│   ├── hooks/                   # 9 automation hooks (auto-approve, logging, safety)
│   ├── logs/                    # Session and tool usage logs
│   ├── requests/                # KODY → FIBY requests
│   ├── responses/               # FIBY → KODY responses
│   ├── specs/                   # Agent specifications
│   ├── CLAUDE.md                # Project instructions for Claude
│   ├── HOW_TO_USE_HOOKS.md      # Hooks documentation
│   ├── settings.json            # Claude Code settings
│   └── settings.local.json      # Local Claude settings
├── docs/
│   ├── PRICING_STRATEGY.md      # Business pricing logic (IMPORTANT)
│   └── firestore-schema.md      # Database schema (35KB)
└── FromFigmaMake/               # Figma design assets
    ├── App.tsx                  # Main app structure reference
    ├── Attributions.md          # License info (shadcn/ui, Unsplash)
    ├── Payment Icons.md         # Payment icon locations
    ├── HEADER_NEXTJS_EXAMPLE.tsx # Working Next.js header example
    ├── components/              # React component examples
    ├── pages/                   # Page layouts
    ├── styles/                  # Tailwind CSS configurations
    └── guidelines/              # Design system guidelines
```

---

## Critical Files

### CREDENTIALS_INVENTORY.md
**MOST IMPORTANT FILE** - Contains ALL credentials:
- Firebase config (API keys, project IDs for wanapi-prod)
- GCP settings (Cloud Run URLs, service accounts)
- Stripe keys (live and test)
- WaveSpeed.ai API key
- Figma API token
- Analytics IDs (Google Analytics, GTM, Microsoft Clarity)
- All environment variables for .env files

### docs/PRICING_STRATEGY.md
Business pricing logic version 3.0:
- Credit system (1 credit = $0.10)
- Subscription tiers (Starter, Creator, Pro)
- Generation costs (Animate Image, Lip Sync, etc.)
- Stripe integration details

### docs/firestore-schema.md
Complete Firestore database schema (35KB):
- Users collection structure
- Jobs collection structure
- Payments, subscriptions, affiliates
- Security rules reference

---

## Claude Agents (40 total)

Located in `.claude/agents/`:

### FIBY - Agent Master (Meta-Agent)

**FIBY** is the meta-agent that manages all other agents. KODY (the primary code architect) uses FIBY when needing to:

| Action | Command |
|--------|---------|
| Create new agent | `/ask-fiby create agent for {purpose}` |
| Audit agent | `/ask-fiby audit {agent-name}` |
| Get guidance | `/ask-fiby which agent for {task}` |
| Improve agent | `/ask-fiby improve {agent-name}` |

**Documentation:** [docs/FIBY_AGENT_MASTER.md](docs/FIBY_AGENT_MASTER.md)

**Communication Protocol:**
```
KODY → .claude/requests/ → FIBY → .claude/responses/ → KODY
```

### Deployment & Infrastructure
| Agent | Purpose |
|-------|---------|
| `deployment-orchestrator.md` | Orchestrates full Firebase deployment (GENERIC) |
| `deployment-validator.md` | Tests deployment, DNS, SSL status |
| `firebase-hosting-preparer.md` | Creates firebase.json and .firebaserc |
| `nextjs-static-export-configurer.md` | Configures Next.js for static export |

### Code Quality & Review
| Agent | Purpose |
|-------|---------|
| `accessibility-auditor.md` | WCAG 2.1 AA compliance audits |
| `performance-optimizer.md` | Bundle analysis, React.memo suggestions |
| `responsive-design-validator.md` | Tests responsive breakpoints |
| `design-system-consistency.md` | Finds hardcoded colors/spacing violations |
| `seo-meta-tags.md` | Adds SEO, Open Graph, structured data |
| `documentation-generator.md` | Generates component docs, JSDoc, prop tables |

### Architecture & Planning (from old system)
| Agent | Purpose |
|-------|---------|
| `architect-opus.md` | Plans architecture, creates blueprints |
| `frontend-architect-opus.md` | Plans frontend features |
| `api-contract-planner.md` | Generates OpenAPI specs |
| `firestore-schema-designer.md` | Designs Firestore collections |

### Implementation (from old system)
| Agent | Purpose |
|-------|---------|
| `frontend-dev.md` | React/Next.js implementation |
| `api-builder.md` | FastAPI backend implementation |
| `worker-builder.md` | Cloud Run worker services |
| `test-builder.md` | Test suite generation |
| `implementer-sonnet.md` | Code implementation from blueprints |
| `frontend-implementer-sonnet.md` | Frontend implementation |

### Orchestrators (from old system)
| Agent | Purpose |
|-------|---------|
| `milestone-orchestrator.md` | Orchestrates milestone completion |
| `backend-orchestrator.md` | Coordinates backend implementation |
| `polish-orchestrator.md` | Orchestrates polish agents |
| `documentation-orchestrator.md` | Coordinates documentation generation |
| `workflow-coordinator.md` | Manages Figma-to-code workflows |
| `phase7-orchestrator.md` | Phase 7 specific orchestrator |

### Other Agents
| Agent | Purpose |
|-------|---------|
| `figma-extractor.md` | Extracts Figma design specs |
| `ui-planner.md` | Plans React component architecture |
| `qa-reviewer.md` | Quality assurance for design-to-code |
| `github-pr-manager.md` | Creates PRs, manages issues |
| `subagent-auditor.md` | Reviews agent .md files |
| `validator-opus.md` | Validates implementation against blueprints |
| `integration-validator-opus.md` | QA validation |
| `animation-micro-interactions.md` | Fixes animations, adds micro-interactions |
| `error-boundary-loading-states.md` | Adds error boundaries, skeleton loaders |

---

## Slash Commands (12 total)

Located in `.claude/commands/`:

| Command | Purpose |
|---------|---------|
| `/ask-fiby` | **Ask FIBY for agent help, creation, or audits** |
| `/create-prompt` | Expert prompt engineering system |
| `/check-todos` | Reviews and manages TODO list |
| `/add-to-todos` | Adds items to TODO list with context |
| `/deploy-firebase` | Deploys to Firebase Hosting |
| `/generate-page` | Generates page from Figma |
| `/list-frames` | Lists available Figma frames |
| `/run-prompt` | Delegates prompts to sub-task contexts |
| `/watch-agents` | Monitors agent execution transcripts |
| `/whats-next` | Generates comprehensive handoff document |
| `/clean-transcripts` | Cleans up old agent transcript files |

---

## FromFigmaMake Assets

Design assets exported from Figma:

### Folders
| Folder | Contents |
|--------|----------|
| `/components/` | React component examples (buttons, cards, forms) |
| `/pages/` | Full page layouts (home, pricing, dashboard) |
| `/styles/` | Tailwind CSS configurations and custom styles |
| `/guidelines/` | Design system guidelines (colors, typography, spacing) |

### Key Files
| File | Description |
|------|-------------|
| `App.tsx` | Main app structure reference |
| `Attributions.md` | License info for shadcn/ui, Unsplash images |
| `Payment Icons.md` | Payment icon locations and usage |
| `HEADER_NEXTJS_EXAMPLE.tsx` | Working Next.js header with auth |

---

## What Was Deleted (History)

The previous NuuMee codebase had these issues:
- **35,000+ lines** of over-engineered code
- Complex multi-phase architecture (8 milestones)
- Auth interceptor bug (signing out on 403 errors, causing login loops)
- Backend-frontend endpoint mismatches

Intentionally NOT preserved:
- `/apps/` - All application code
- `/blueprints/` - 8 milestone blueprints (400KB)
- `/infra/` - Complex infrastructure scripts
- `/prompts/` - Old workflow prompts

---

## Known Issues from Previous Codebase

1. **Auth Login Loop** - The API interceptor was signing out users on 403 errors. Don't repeat this mistake.

2. **Endpoint Mismatches** - Phase 7 frontend was built assuming endpoint paths that didn't match Phase 5 backend. Always verify against OpenAPI spec.

3. **Over-engineering** - Too many abstraction layers. Keep it simple.

---

## Infrastructure (Already Deployed)

The following are already set up and working:
- **GCP Project ID:** wanapi-prod
- **GCP Project Number:** 450296399943
- **Firebase Hosting:** Default site (wanapi-prod)
- **Backend API:** Cloud Run (see CREDENTIALS_INVENTORY.md for URL)
- **Custom Domain:** nuumee.ai (GoDaddy)
- **Stripe:** Test and Live keys configured
- **Firestore:** Schema deployed with security rules (project: wanapi-prod)

---

## Recommended Approach

1. **Start with a minimal Next.js app**
2. **Copy .env values from CREDENTIALS_INVENTORY.md**
3. **Use docs/firestore-schema.md for database structure**
4. **Use docs/PRICING_STRATEGY.md for business logic**
5. **Reference FromFigmaMake/ for design patterns**
6. **Build ONE feature at a time**
7. **Test thoroughly before adding complexity**

---

## File Preservation Note

This folder was created from `/home/user/NuuMee-save/` which backed up:
- All 39 agents (not just 12 generic ones)
- All 11 commands (not just 3)
- VS Code settings
- Firebase configuration
- Figma design assets

The full backup ensures nothing is lost if git is deleted.

---

*This folder contains everything needed to rebuild NuuMee.AI from scratch without losing critical configurations, credentials, or design assets.*
