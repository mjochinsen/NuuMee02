# FIBY - Agent Master Documentation

**Version:** 1.0.0
**Created:** 2025-11-27
**Author:** FIBY (Agent Creation & Management Specialist)

---

## What is FIBY?

**FIBY** is the **Agent Master** for the NuuMee project - a specialized meta-agent responsible for:
- Creating new agents
- Auditing existing agents
- Documenting agent systems
- Advising KODY on agent usage
- Managing the 39-agent ecosystem

**KODY** is the **Primary Code Architect** - responsible for building NuuMee's features across 10 phases.

---

## KODY-FIBY Communication Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     KODY Session                                 │
│                  (Code Architect)                                │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   1. KODY identifies need for agent help                        │
│      ↓                                                          │
│   2. KODY writes request to .claude/requests/{ID}.md            │
│      ↓                                                          │
│   3. KODY invokes: /ask-fiby or Task tool → fiby-coordinator    │
│      ↓                                                          │
│   ┌──────────────────────────────────────────────────────────┐  │
│   │              FIBY Sub-Agent (Fresh 200k Context)         │  │
│   │                                                          │  │
│   │   • Reads request from .claude/requests/                 │  │
│   │   • Routes to appropriate handler:                       │  │
│   │     - audit → subagent-auditor                           │  │
│   │     - create → agent-generator                           │  │
│   │     - recommend → improvement-analyzer                   │  │
│   │   • Writes results to .claude/responses/                 │  │
│   │   • Reports back to Main Agent                           │  │
│   └──────────────────────────────────────────────────────────┘  │
│      ↓                                                          │
│   4. KODY reviews .claude/responses/                            │
│      ↓                                                          │
│   5. KODY implements recommendations / uses new agent           │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## How KODY Talks to FIBY

### Method 1: Slash Command (Recommended)

```
> /ask-fiby create agent for stripe webhook handling
> /ask-fiby audit the api-builder agent
> /ask-fiby which agent should I use for authentication?
```

### Method 2: Direct Task Invocation

```
> Use the fiby-coordinator agent to create a new test-runner agent
> Invoke fiby-coordinator to audit all frontend agents
```

### Method 3: File-Based Request (Async)

Create a request file manually, then invoke FIBY:

```markdown
# .claude/requests/2025-11-27-stripe-agent.md

---
type: create
target: stripe-webhook-handler
priority: high
---

## Requirements
- Handle Stripe webhook events
- Validate webhook signatures
- Process checkout.session.completed
- Update Firestore user credits
```

Then: `> Process my FIBY request in .claude/requests/`

---

## Request Types

### 1. Create Agent

**Request Format:**
```markdown
---
type: create
target: {agent-name}
priority: high | normal
---

## Agent Specification
- **Name:** {agent-name}
- **Purpose:** {what it does}
- **When to Use:** {trigger conditions}
- **Tools Needed:** [Read, Write, Edit, Bash, Task]
- **Model:** sonnet | opus | haiku
- **Color:** blue | green | yellow | cyan | purple

## Example Tasks
1. {Example task 1}
2. {Example task 2}

## Constraints
- {What it should NEVER do}
- {What it MUST always do}
```

**FIBY Response:**
- Creates `.claude/agents/{agent-name}.md`
- Validates against best practices
- Writes report to `.claude/responses/`

### 2. Audit Agent

**Request Format:**
```markdown
---
type: audit
target: {agent-name}.md | all | frontend-* | backend-*
priority: normal
---

## Focus Areas
- [ ] YAML frontmatter correctness
- [ ] Description triggers (PROACTIVELY, MUST, AFTER)
- [ ] Tool minimization
- [ ] Constraint clarity
- [ ] Error handling
```

**FIBY Response:**
- Analyzes specified agents
- Creates audit report with:
  - Critical issues (must fix)
  - Recommendations (should fix)
  - Strengths (well done)
  - Quick fixes (copy-paste solutions)

### 3. Recommend Improvements

**Request Format:**
```markdown
---
type: recommend
target: {feature-area}
priority: normal
---

## Context
- Current phase: {0-9}
- Current task: {task ID}
- Problem: {what's not working}

## Question
{Specific question for FIBY}
```

**FIBY Response:**
- Analyzes existing agents
- Recommends which agent to use
- Suggests new agents if needed
- Provides implementation guidance

### 4. Question About Usage

**Request Format:**
```markdown
---
type: question
priority: normal
---

## Question
{Your question about agents}

## Context
{Relevant background}
```

---

## Agent Inventory (39 Total)

### Orchestrators (7)
| Agent | Purpose | Use When |
|-------|---------|----------|
| `workflow-coordinator` | Figma-to-code pipelines | Generating pages from Figma |
| `milestone-orchestrator` | Multi-task milestones | Complex phase work |
| `deployment-orchestrator` | Firebase deployments | Deploying frontend |
| `backend-orchestrator` | Backend implementation | Building API + Worker |
| `documentation-orchestrator` | Batch documentation | Generating docs |
| `polish-orchestrator` | QA/polish tasks | Pre-launch quality |
| `phase7-orchestrator` | Phase 7 features | Subscriptions work |

### Architects (3)
| Agent | Purpose | Use When |
|-------|---------|----------|
| `architect-opus` | Architecture blueprints | Before any implementation |
| `frontend-architect-opus` | Frontend planning | Before React work |
| `api-contract-planner` | OpenAPI specs | Designing API contracts |

### Implementers (7)
| Agent | Purpose | Use When |
|-------|---------|----------|
| `frontend-dev` | React/Next.js code | Building UI components |
| `frontend-implementer-sonnet` | Frontend from blueprints | After architect-opus |
| `implementer-sonnet` | Code from blueprints | After architect-opus |
| `api-builder` | FastAPI endpoints | Building backend routes |
| `worker-builder` | Cloud Run workers | Video processing |
| `test-builder` | Test suites | After implementation |
| `animation-micro-interactions` | Animations/hover states | Polish phase |

### Validators (5)
| Agent | Purpose | Use When |
|-------|---------|----------|
| `validator-opus` | Blueprint validation | After implementation |
| `integration-validator-opus` | QA validation | Final review |
| `qa-reviewer` | Design-to-code accuracy | After frontend-dev |
| `deployment-validator` | Deployment verification | After deploy |
| `subagent-auditor` | Agent quality review | Improving agents |

### Design/UI (4)
| Agent | Purpose | Use When |
|-------|---------|----------|
| `figma-extractor` | Design spec extraction | First step from Figma |
| `ui-planner` | Component architecture | After figma-extractor |
| `design-system-consistency` | Token consistency | Finding hardcoded values |
| `responsive-design-validator` | Breakpoint testing | Mobile/tablet QA |

### Quality (5)
| Agent | Purpose | Use When |
|-------|---------|----------|
| `accessibility-auditor` | WCAG compliance | Accessibility checks |
| `performance-optimizer` | Bundle/performance | Speed optimization |
| `seo-meta-tags` | SEO/Open Graph | Pre-launch SEO |
| `error-boundary-loading-states` | Error handling UI | UX resilience |
| `documentation-generator` | Component docs | Documenting code |

### Infrastructure (4)
| Agent | Purpose | Use When |
|-------|---------|----------|
| `firebase-hosting-preparer` | Firebase config | Deployment setup |
| `nextjs-static-export-configurer` | Static export | Build configuration |
| `firestore-schema-designer` | Database design | Schema planning |
| `github-pr-manager` | PRs and issues | Git workflow |

---

## Agent Selection Guide

### By Phase

| Phase | Primary Agents |
|-------|---------------|
| 0 - Foundation | `api-builder` (stubs), `firebase-hosting-preparer` |
| 1 - Auth | `api-builder`, `frontend-dev`, `deployment-validator` |
| 2 - Payments | `api-builder`, `frontend-dev` |
| 3 - Uploads | `api-builder`, `frontend-dev` |
| 4 - Jobs | `api-builder`, `frontend-dev` |
| 5 - Worker | `worker-builder`, `test-builder` |
| 6 - Downloads | `api-builder`, `frontend-dev` |
| 7 - Subscriptions | `phase7-orchestrator` |
| 8 - Referral | `api-builder`, `frontend-dev` |
| 9 - Polish | `polish-orchestrator` (runs all QA agents) |

### By Task Type

| Task | Agent |
|------|-------|
| "Build endpoint for X" | `api-builder` |
| "Create React component" | `frontend-dev` |
| "Generate from Figma" | `workflow-coordinator` |
| "Plan architecture" | `architect-opus` |
| "Deploy to Firebase" | `deployment-orchestrator` |
| "Run all QA checks" | `polish-orchestrator` |
| "Write tests" | `test-builder` |
| "Audit agent quality" | `subagent-auditor` |

---

## Agent Best Practices

### Description Field (Critical for Auto-Discovery)

Good descriptions use trigger keywords:

```yaml
# GOOD - Clear triggers
description: Use PROACTIVELY when user mentions Figma or Frame IDs.
MUST BE USED FIRST before UI planning. Specialist for design extraction.

# BAD - Vague
description: Extracts designs from Figma.
```

**Keywords that work:**
- `PROACTIVELY` - Agent auto-invokes
- `MUST` - Required in workflow
- `Use AFTER {agent}` - Sequence indication
- `Specialist for` - Domain expertise
- `Use when` - Trigger conditions

### System Prompt Structure (7 Sections)

1. **Agent Identity** - Role and expertise
2. **Core Responsibilities** - 5-8 specific duties
3. **Domain Expertise** - Technical knowledge
4. **Workflow Integration** - Position in pipeline
5. **Best Practices** - Standards to follow
6. **Constraints** - What NOT to do
7. **Success Metrics** - How to measure

### Tool Minimization

Only include tools the agent actually needs:

| Agent Type | Typical Tools |
|------------|---------------|
| Architect | Read, Write |
| Implementer | Read, Write, Edit, Bash |
| Validator | Read, Write |
| Orchestrator | Task, Read, Write |

---

## Creating New Agents

### Step 1: Define Requirements

```markdown
- What problem does this agent solve?
- What's its unique specialization?
- Where does it fit in the workflow?
- What tools does it need?
- What should it NEVER do?
```

### Step 2: Use Template

Copy from `.claude/agents/TEMPLATE.md` or ask FIBY:
```
> /ask-fiby create agent template for {purpose}
```

### Step 3: Validate

```
> /ask-fiby audit {new-agent}.md
```

### Step 4: Test

```
> Use the {new-agent} agent to {test task}
```

---

## Debugging Agents

### Agent Not Auto-Invoked

1. Check description field has trigger keywords
2. Use explicit invocation: `Use the {agent} agent to...`
3. Verify agent file is in `.claude/agents/`

### Agent Produces Wrong Output

1. Read transcript: `.claude/agents/agent-{id}.jsonl`
2. Check if agent had access to required files
3. Verify tools list includes necessary tools

### Agent Times Out

1. Check API credentials (Figma, etc.)
2. Verify file paths exist
3. Review system prompt for infinite loops

---

## File Locations

```
.claude/
├── agents/                    # 39 agent definitions
│   ├── fiby-coordinator.md    # FIBY meta-agent
│   ├── subagent-auditor.md    # Agent auditor
│   └── ...
├── commands/                  # Slash commands
│   ├── ask-fiby.md            # /ask-fiby command
│   └── ...
├── requests/                  # KODY → FIBY requests
│   └── {date}-{topic}.md
├── responses/                 # FIBY → KODY responses
│   └── {request-id}-response.md
└── CLAUDE.md                  # Project instructions
```

---

## Quick Reference

### KODY Needs Agent Help

```
/ask-fiby {question or request}
```

### KODY Needs New Agent

```
/ask-fiby create agent for {purpose}
```

### KODY Wants Agent Audit

```
/ask-fiby audit {agent-name} agent
```

### KODY Unsure Which Agent

```
/ask-fiby which agent for {task description}
```

---

## Integration with TASK_TRACKER.md

Each task in TASK_TRACKER.md specifies which agent to use:

```markdown
| 1.3 | Implement POST /auth/register | ⬜ | `api-builder` | router.py | Creates Firestore user doc |
```

**KODY workflow:**
1. Read TASK_TRACKER.md
2. Find current task
3. Check "Agent/Tool" column
4. Invoke specified agent
5. Update status after completion

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2025-11-27 | Initial documentation |

---

*This documentation is maintained by FIBY. For updates or corrections, use `/ask-fiby update documentation`.*
