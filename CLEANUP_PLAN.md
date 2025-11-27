# NuuMee Cleanup Plan for Fresh Start

**Generated:** 2025-11-27
**Purpose:** Prepare files for migration to new minimal repository (NuuMee02)
**New Repo:** https://github.com/mjochinsen/NuuMee02

---

## Overview

The current codebase has 35,000+ lines across 39+ API endpoints. The new approach is:
- Under 2,000 lines total
- 5-7 API endpoints
- Build one feature, test it, then next
- No enterprise patterns or abstraction layers

---

## 1. FILES TO DELETE (Everything Not Needed)

### Root Directory Files - DELETE ALL (Verified)
| File | Reason |
|------|--------|
| `convert-all-pages.js` | Old Figma conversion script |
| `deploy-api.sh` | Over-engineered deployment script |
| `deploy-firestore.sh` | Will recreate simpler |
| `deploy-frontend.sh` | Will recreate simpler |
| `deploy-worker.sh` | Worker architecture being simplified |
| `figma-file-structure.json` | 11MB file, regenerate if needed |
| `find-missing-components.js` | Old debugging script |
| `firebase.json` | Will recreate minimal version |
| `GOOGLE_WORKSTATION_SETUP.md` | Outdated - has old GitHub token, info in CREDENTIALS_INVENTORY |
| `list-figma-frames.js` | Old Figma script |
| `NuuMee IMPORTANT.md` | Outdated notes - contains old SSH keys and tokens, info in CREDENTIALS_INVENTORY |
| `package.json` | Monorepo config, starting fresh |
| `pnpm-lock.yaml` | 196KB lock file |
| `pnpm-workspace.yaml` | Monorepo config |
| `search-figma.js` | Old Figma script |
| `test-deployment.sh` | 20KB over-engineered test |
| `turbo.json` | Turborepo config |
| `update_seo.ps1` | Windows PowerShell script |

**⚠️ Security Note:** `NuuMee IMPORTANT.md` and `GOOGLE_WORKSTATION_SETUP.md` contain tokens/keys that are already captured in `CREDENTIALS_INVENTORY.md`. Delete these files to avoid credential duplication.

### /apps/ - DELETE ENTIRE FOLDER
**Reason:** Over-engineered, 35,000+ lines, broken integrations

```
DELETE: /apps/api/           # 20,000+ lines backend - too complex
DELETE: /apps/web/           # 15,000+ lines frontend - broken auth
DELETE: /apps/worker/        # Separate worker service - simplify
```

### /blueprints/ - DELETE ENTIRE FOLDER
**Reason:** 8 milestone blueprints (400KB) for waterfall approach we're abandoning

```
DELETE: /blueprints/M1-core-infrastructure.md    (54KB)
DELETE: /blueprints/M2-auth-user.md              (31KB)
DELETE: /blueprints/M3-upload-storage.md         (46KB)
DELETE: /blueprints/M4-credit-system.md          (56KB)
DELETE: /blueprints/M5-job-management.md         (63KB)
DELETE: /blueprints/M6-payment-subscriptions.md  (53KB)
DELETE: /blueprints/M7-referrals-affiliates.md   (44KB)
DELETE: /blueprints/M8-cloud-run-worker.md       (57KB)
```

### /infra/ - DELETE ENTIRE FOLDER
**Reason:** Over-engineered infrastructure scripts

```
DELETE: /infra/cloudrun/     # Cloud Run placeholder
DELETE: /infra/firestore/    # Will recreate simpler rules
DELETE: /infra/scripts/      # Complex setup/teardown scripts
DELETE: /infra/README.md     # Documentation
```

### /.claude/ - DELETE MOST
**Reason:** 40+ agent definitions for complex workflow we're abandoning

```
DELETE: /.claude/agents/     # 40+ agent definitions (232KB)
DELETE: /.claude/commands/   # 13 slash commands
DELETE: /.claude/specs/      # Old specifications
DELETE: /.claude/CLAUDE.md   # Project instructions for old architecture
DELETE: /.claude/settings.local.json  # Local settings
```

### /.vscode/ - DELETE
**Reason:** IDE settings, will recreate as needed

```
DELETE: /.vscode/
```

### /.firebase/ - DELETE
**Reason:** Firebase cache files

```
DELETE: /.firebase/
```

### /.git/ - DELETE (Required for new repo)
**Reason:** Disconnecting from old repository

```
DELETE: /.git/
```

### /docs/ - DELETE MOST
Keep firestore-schema.md AND PRICING_STRATEGY.md (see Section 2)

```
DELETE: /docs/API_REFERENCE.md        # Old API docs
DELETE: /docs/WORKFLOW.md             # Old workflow
DELETE: /docs/api-examples.md         # 35KB examples
DELETE: /docs/design-specs/           # Figma design specs
DELETE: /docs/marketing/              # Marketing content
DELETE: /docs/openapi.yaml            # 51KB OpenAPI spec
DELETE: /docs/ui-plans/               # Component plans
KEEP:   /docs/PRICING_STRATEGY.md     # CRITICAL - Business pricing logic
KEEP:   /docs/firestore-schema.md     # Database schema documentation
```

---

## 2. FILES TO KEEP (Reusable Assets Only)

### CONFIRMED KEEP - DO NOT DELETE

| File | Reason |
|------|--------|
| `/CREDENTIALS_INVENTORY.md` | All API keys, project IDs, configurations |
| `/docs/firestore-schema.md` | 35KB Firestore schema documentation |
| `/docs/PRICING_STRATEGY.md` | CRITICAL - Business pricing logic and tier definitions |
| `/FromFigmaMake/` | 1.4MB Figma design assets (components, pages, styles) |
| `/.firebaserc` | 5 lines, has project ID mapping |
| `/.gitignore` | Will need for new repo |
| `/.mcp.json` | MCP server configuration |

### FromFigmaMake/ - KEEP SELECTIVELY
**Core folders (1.4MB) - KEEP ALL:**
- `/components/` - React component examples from Figma
- `/pages/` - Page layouts from Figma
- `/styles/` - CSS/styling from Figma
- `/guidelines/` - Design guidelines

**Individual files in FromFigmaMake/ - Detailed Assessment:**

| File | Decision | Reason |
|------|----------|--------|
| `App.tsx` | KEEP | Main app structure reference |
| `Attributions.md` | KEEP | License info for shadcn/ui and Unsplash |
| `Payment Icons.md` | **KEEP** | Documents payment icon locations and usage |
| `HEADER_NEXTJS_EXAMPLE.tsx` | KEEP | Working Next.js header reference |
| `Git GitHub Configuration.md` | DELETE | Outdated git notes, info already in CREDENTIALS_INVENTORY |
| `CLAUDE_CONVERSION_INSTRUCTIONS.md` | DELETE | Old React-to-Next.js conversion instructions |
| `CONVERSION_COMPLETE_SUMMARY.md` | DELETE | Old conversion status notes |
| `PROMPT_FOR_CLAUDE.txt` | DELETE | Old prompt template |
| `BUY_CREDITS_MODAL_NEXTJS_GUIDE.md` | DELETE | Old migration guide |
| `DROPDOWN_COMPONENT_MAP.md` | DELETE | Old dropdown conversion docs |
| `DROPDOWN_CONVERSION_CHEATSHEET.md` | DELETE | Old dropdown conversion docs |
| `DROPDOWN_CONVERSION_INDEX.md` | DELETE | Old dropdown conversion docs |
| `DROPDOWN_CONVERSION_SUMMARY.md` | DELETE | Old dropdown conversion docs |
| `DROPDOWN_VISUAL_CHANGES.md` | DELETE | Old dropdown conversion docs |
| `NEXT_JS_DROPDOWN_CONVERSION_GUIDE.md` | DELETE | Old migration guide |
| `PAYMENT_METHODS_UPDATE_SUMMARY.md` | DELETE | Old payment methods doc |

**Why Keep Core:** Reference for UI implementation in new codebase.

### docs/firestore-schema.md - KEEP
**Why:** 35KB comprehensive Firestore schema documentation. Essential reference for database design.

---

## 3. FILES IN /prompts - EVALUATE EACH

| File | Purpose | Decision | Reason |
|------|---------|----------|--------|
| `001-regenerate-home-page-complete.md` | Figma-to-code prompt for home page | DELETE | Tied to old complex workflow |
| `002-fix-dev-page-missing-components.md` | Fix missing component imports | DELETE | Old debugging task |
| `003-use-polish-agents.md` | Run QA polish agents | DELETE | Tied to old agent system |
| `004-high-roi-polish.md` | SEO/performance polish tasks | DELETE | Premature optimization |
| `DEPLOY_TO_FIREBASE.md` | Firebase deployment guide | DELETE | Will create simpler process |
| `EXECUTE_FIREBASE_DEPLOYMENT.md` | Deployment execution steps | DELETE | Too complex |
| `EXISTING_AGENTS_FOR_DEPLOYMENT.md` | Lists available agents | DELETE | Agents being removed |
| `FIREBASE_DEPLOYMENT_AGENTS_AVAILABLE.md` | Agent availability | DELETE | Agents being removed |

**Decision: DELETE ENTIRE /prompts/ FOLDER**

None of the prompts are relevant to the new minimal approach. They all reference:
- Complex agent workflows
- 27+ page generation
- Polish/optimization before core works
- Old directory structure

---

## 4. GIT CLEANUP REQUIRED

### Commands to Execute (in order)

```bash
# 1. Remove git history (disconnect from old repo)
rm -rf /home/user/NuuMee/.git

# 2. Remove GitHub-specific files
rm -rf /home/user/NuuMee/.github

# 3. Remove IDE and tool caches
rm -rf /home/user/NuuMee/.vscode
rm -rf /home/user/NuuMee/.firebase
rm -rf /home/user/NuuMee/node_modules
rm -rf /home/user/NuuMee/.next
rm -rf /home/user/NuuMee/.turbo

# 4. Remove Python caches (if any remain)
find /home/user/NuuMee -type d -name "__pycache__" -exec rm -rf {} + 2>/dev/null
find /home/user/NuuMee -type d -name ".pytest_cache" -exec rm -rf {} + 2>/dev/null

# 5. Remove build artifacts
rm -rf /home/user/NuuMee/apps/web/out
rm -rf /home/user/NuuMee/apps/web/.next
rm -rf /home/user/NuuMee/apps/api/__pycache__
```

### Files to Keep for Git
- `.gitignore` - Useful as starting point
- `.firebaserc` - Has project mapping

---

## 5. FILES TO MODIFY (If Any Worth Salvaging)

### .gitignore - KEEP AND MODIFY

**Current state:** Probably comprehensive
**What to change:** Simplify for new minimal structure
**Worth modifying:** YES - saves time vs creating from scratch

### .firebaserc - KEEP AS-IS

**Current content:**
```json
{
  "projects": {
    "default": "wanapi-prod"
  }
}
```

**Worth modifying:** NO - already minimal and correct

### CREDENTIALS_INVENTORY.md - KEEP AS-IS

**Worth modifying:** NO - comprehensive and accurate

---

## 6. FINAL DIRECTORY STRUCTURE

After cleanup, the folder should look like:

```
/home/user/NuuMee/
├── .firebaserc                    # Firebase project mapping (keep)
├── .gitignore                     # Git ignore rules (keep)
├── .mcp.json                      # MCP configuration (keep)
├── CLEANUP_PLAN.md                # This file (keep until migration complete)
├── CREDENTIALS_INVENTORY.md       # All credentials/configs (CRITICAL KEEP)
├── docs/
│   ├── firestore-schema.md        # Database schema (CRITICAL KEEP)
│   └── PRICING_STRATEGY.md        # Business pricing logic (CRITICAL KEEP)
└── FromFigmaMake/                 # Figma design assets (1.4MB)
    ├── components/
    ├── guidelines/
    ├── pages/
    ├── styles/
    └── [various .md and .tsx files]
```

**Total size after cleanup:** ~1.5MB (down from 50MB+)

---

## 7. EXECUTION CHECKLIST

### Before Cleanup
- [x] Backup branch created: `backup-2025-11-27-before-restart`
- [x] Backup pushed to GitHub
- [x] CREDENTIALS_INVENTORY.md created
- [x] This CLEANUP_PLAN.md created

### Cleanup Steps
- [ ] Copy KEEP files to safe location
- [ ] Delete all DELETE files/folders
- [ ] Verify KEEP files still present
- [ ] Initialize new git repo (or clone NuuMee02)
- [ ] Copy KEEP files to new repo

### After Cleanup
- [ ] Verify new repo has all needed credentials
- [ ] Verify FromFigmaMake folder copied
- [ ] Verify firestore-schema.md copied
- [ ] Start minimal implementation

---

## 8. CLEANUP IN PLACE

**Note:** NuuMee02 repo was deleted. A new repo will be created fresh. Clean up this directory in place.

### Cleanup Commands
```bash
cd /home/user/NuuMee

# After cleanup, initialize new git repo when ready
# git init
# git remote add origin <new-repo-url>
```

---

## Summary

| Category | Action | Size Removed |
|----------|--------|--------------|
| /apps/ | DELETE | ~30MB |
| /blueprints/ | DELETE | 400KB |
| /infra/ | DELETE | 100KB |
| /.claude/ | DELETE | 300KB |
| /docs/ (most) | DELETE | 300KB |
| /prompts/ | DELETE | 52KB |
| Build artifacts | DELETE | ~10MB |
| **Total Removed** | | **~40MB** |
| **Kept** | | **~1.5MB** |

---

*This plan prioritizes a clean start over salvaging broken code.*

---

## 9. AGENT AND COMMAND REUSABILITY ASSESSMENT

### Overview

After reviewing all 39 agents and 11 commands, here's the assessment for reusability in the new minimal architecture.

---

### AGENTS - POTENTIALLY REUSABLE (8 agents)

These agents are **generic enough** to work with any architecture:

| Agent | Purpose | Why Reusable |
|-------|---------|--------------|
| `github-pr-manager.md` | Creates PRs, manages issues | Generic GitHub automation, not tied to NuuMee |
| `documentation-generator.md` | Generates component docs | Generic, writes JSDoc and prop tables |
| `accessibility-auditor.md` | WCAG 2.1 AA compliance | Generic React accessibility audit |
| `performance-optimizer.md` | Bundle analysis, React.memo suggestions | Generic Next.js/React optimization |
| `responsive-design-validator.md` | Tests responsive breakpoints | Generic CSS/Tailwind validation |
| `design-system-consistency.md` | Finds hardcoded colors/spacing | Generic, finds violations in any Tailwind project |
| `seo-meta-tags.md` | Adds SEO, Open Graph, structured data | Generic, not tied to specific pages |
| `subagent-auditor.md` | Reviews agent .md files for best practices | Meta-agent for auditing other agents |

**Recommendation:** Copy these 8 agents to NuuMee02 but **simplify them**. Remove references to old file paths.

---

### AGENTS - FIGMA WORKFLOW (5 agents)

These form the **Figma-to-code pipeline** - useful if keeping Figma integration:

| Agent | Purpose | Notes |
|-------|---------|-------|
| `figma-extractor.md` | Fetches Figma API, generates design specs | Has hardcoded Figma token - update credentials |
| `ui-planner.md` | Plans component architecture from design spec | Generic planning, could be reused |
| `frontend-dev.md` | Implements components from plan | Tied to old folder structure |
| `qa-reviewer.md` | Compares code to design spec | Generic QA process |
| `workflow-coordinator.md` | Orchestrates 4-agent pipeline | Too complex for minimal architecture |

**Recommendation:** If keeping Figma workflow, copy `figma-extractor.md` and `ui-planner.md`. Skip the rest - the 4-agent pipeline is over-engineered.

---

### AGENTS - DEPLOYMENT (4 agents)

| Agent | Purpose | Reusable? |
|-------|---------|-----------|
| `nextjs-static-export-configurer.md` | Configures Next.js for static export | YES - generic, still useful |
| `firebase-hosting-preparer.md` | Creates firebase.json | YES - generic, update paths |
| `deployment-validator.md` | Tests deployment, DNS, SSL | YES - generic validation |
| `deployment-orchestrator.md` | Orchestrates deployment pipeline | YES - rewrite to be generic |

**Recommendation:** Copy the 3 individual deployment agents AND rewrite `deployment-orchestrator.md` to be generic.

---

### AGENTS - DELETE (22 agents)

These are **too tied to old architecture** or **over-engineered**:

| Agent | Reason to Delete |
|-------|------------------|
| `api-builder.md` | Tied to 39-endpoint FastAPI architecture |
| `worker-builder.md` | Cloud Run worker service - simplifying |
| `test-builder.md` | Pytest for old backend |
| `backend-orchestrator.md` | Orchestrates 3 backend agents |
| `architect-opus.md` | Milestone-based planning - abandoning |
| `implementer-sonnet.md` | Follows architect blueprints |
| `validator-opus.md` | Validates against blueprints |
| `milestone-orchestrator.md` | Runs architect→implementer→validator loop |
| `frontend-architect-opus.md` | Creates blueprints for frontend |
| `frontend-implementer-sonnet.md` | Implements from blueprints |
| `integration-validator-opus.md` | Validates against blueprints |
| `phase7-orchestrator.md` | Phase 7 specific orchestrator |
| `api-contract-planner.md` | OpenAPI 3.1 spec generator |
| `firestore-schema-designer.md` | Converts domain model to Firestore |
| `error-boundary-loading-states.md` | Adds error boundaries - premature |
| `animation-micro-interactions.md` | Fixes animations - premature |
| `polish-orchestrator.md` | Runs all polish agents - over-engineered |
| `documentation-orchestrator.md` | Orchestrates doc generation |
| `README.md` | Agent system documentation |
| `IMPROVEMENTS.md` | Improvement notes |
| `VALIDATION_CHECKLIST.md` | Validation checklist |
| `MONITORING_GUIDE.md` | Monitoring guide |

---

### COMMANDS - POTENTIALLY REUSABLE (4 commands)

| Command | Purpose | Why Reusable |
|---------|---------|--------------|
| `create-prompt.md` | Expert prompt engineering | Generic, creates structured prompts |
| `check-todos.md` | Reviews TODO list | Generic task management |
| `add-to-todos.md` | Adds to TODO list | Generic task management |
| `github-pr-manager.md` | (Referenced in agents) | Already covered above |

**Recommendation:** Copy these 3 commands. They're useful for any project.

---

### COMMANDS - DELETE (7 commands)

| Command | Reason to Delete |
|---------|------------------|
| `deploy-firebase.md` | Tied to old deployment workflow |
| `whats-next.md` | Generates handoff for complex milestones |
| `generate-page.md` | 4-agent Figma-to-code pipeline |
| `list-frames.md` | Lists Figma frames - hardcoded token |
| `clean-transcripts.md` | Cleans agent transcripts |
| `watch-agents.md` | Monitors agent execution |
| `run-prompt.md` | Runs prompts from /prompts/ folder |
| `README.md` | Command system documentation |

---

### SUMMARY - WHAT TO COPY TO NUUMEE02

**Agents (12 total):**
```
✅ COPY: github-pr-manager.md
✅ COPY: documentation-generator.md
✅ COPY: accessibility-auditor.md
✅ COPY: performance-optimizer.md
✅ COPY: responsive-design-validator.md
✅ COPY: design-system-consistency.md
✅ COPY: seo-meta-tags.md
✅ COPY: subagent-auditor.md
✅ COPY: nextjs-static-export-configurer.md
✅ COPY: firebase-hosting-preparer.md
✅ COPY: deployment-validator.md
✅ REWRITE: deployment-orchestrator.md (make generic)
```

**Commands (3 total):**
```
✅ COPY: create-prompt.md
✅ COPY: check-todos.md
✅ COPY: add-to-todos.md
```

**Before copying, edit each file to:**
1. Remove hardcoded paths (`apps/web/`, `packages/ui/`)
2. Update any NuuMee-specific references
3. Simplify tool lists if needed

---

### SAVE REUSABLE FILES (before deletion)

```bash
# Create temp save location
mkdir -p /home/user/NuuMee-save/.claude/agents
mkdir -p /home/user/NuuMee-save/.claude/commands

# Copy reusable agents (12 total)
for agent in github-pr-manager documentation-generator accessibility-auditor \
  performance-optimizer responsive-design-validator design-system-consistency \
  seo-meta-tags subagent-auditor nextjs-static-export-configurer \
  firebase-hosting-preparer deployment-validator deployment-orchestrator; do
  cp /home/user/NuuMee/.claude/agents/${agent}.md /home/user/NuuMee-save/.claude/agents/
done

# Copy reusable commands (3 total)
for cmd in create-prompt check-todos add-to-todos; do
  cp /home/user/NuuMee/.claude/commands/${cmd}.md /home/user/NuuMee-save/.claude/commands/
done

echo "Saved 12 agents and 3 commands to /home/user/NuuMee-save/"
```
