---
description: Generate comprehensive handoff document
---

# What's Next - Context Handoff Generator

Create a detailed `whats-next.md` file that enables seamless continuation of work with zero information loss.

## Purpose

This command generates a comprehensive handoff document for:
- Resuming work in a fresh Claude Code session
- Handing off to another developer
- Documenting project state before context switch
- Creating checkpoint for long-running tasks

**Goal**: Enable anyone to resume work with complete context, as if they were in this conversation.

---

## Process

### Step 1: Analyze Conversation

Review the entire conversation to extract:
- Original user request and goals
- All work completed (files changed, decisions made)
- Current state of deliverables
- Attempted approaches (successes and failures)
- Key decisions and reasoning
- Remaining work and blockers

**Look back at least 20-50 messages** to capture full context.

---

### Step 2: Generate Handoff Document

Create `whats-next.md` with these sections:

---

## Required Sections

### 1. Original Task

```markdown
# What's Next - [Project/Feature Name]

## Original Task

**User's request:**
> [Quote the original ask exactly]

**Interpreted as:**
[How this was understood - the actual goal]

**Scope:**
- ✅ In scope: [What's included]
- ❌ Out of scope: [What's explicitly excluded]
- ⚠️ Unclear: [What needs clarification]
```

---

### 2. Work Completed

```markdown
## Work Completed

### Artifacts Created
- `[file path]` - [Purpose and what it contains]
- `[file path]` - [Purpose and what it contains]

### Modifications Made
- `[file:lines]` - [What changed and why]
- `[file:lines]` - [What changed and why]

### Actions Taken
- [Specific action] → [Outcome]
- [Command run] → [Result]

### Key Findings
- [Discovery made] → [What this means for the project]
- [Insight gained] → [How this affects approach]

### Decisions Made
- **Decision:** [What was decided]
  - **Reasoning:** [Why this choice]
  - **Alternatives:** [What else was considered]
  - **Impact:** [How this affects the project]
```

---

### 3. Work Remaining

```markdown
## Work Remaining

### Immediate Next Steps (in order)

1. **[Action required]**
   - Location: `[file/component]`
   - Why first: [Reasoning for this order]
   - Dependencies: [What must exist first]
   - Estimated complexity: [Simple | Moderate | Complex]

2. **[Next action]**
   - Location: `[file/component]`
   - Why now: [Reasoning]
   - Dependencies: [Step 1 must complete]

### Subsequent Tasks
- [ ] [Task] - `[location]` - [Context needed]
- [ ] [Task] - `[location]` - [Complexity: simple/moderate/complex]

### Validation Needed
- [ ] [What to test] - [How to verify] - [Success criteria]
- [ ] [What to check] - [How to validate]
```

---

### 4. Attempted Approaches

```markdown
## Attempted Approaches

### What Didn't Work

**Approach 1: [What was tried]**
- **Why it failed:** [Error message or blocker encountered]
- **Learning:** [What this revealed about the problem]
- **Don't retry because:** [Why this is a dead end]

**Approach 2: [Another attempt]**
- **Why it failed:** [Reason]
- **Learning:** [Insight gained]

### Dead Ends to Avoid
- ❌ [Approach] - [Why it won't work]
- ❌ [Tool/library] - [Why it's not suitable]
```

---

### 5. Critical Context

```markdown
## Critical Context

### Key Decisions & Trade-offs

**Decision:** [Major choice made]
- **Reasoning:** [Why this approach]
- **Trade-off:** [What we gave up]
- **Impact:** [How this affects the codebase]

### Constraints
- **Technical:** [Limitation] - [How it affects approach]
- **Business:** [Constraint] - [Why it matters]
- **Resource:** [Limitation] - [Workaround]

### Important Discoveries
- **[Non-obvious behavior]** - Occurs in `[file:line]` - [Why it matters]
- **[Edge case]** - [How to handle it]

### Gotchas & Warnings
- ⚠️ [Thing to watch out for] - [Why it's dangerous]
- ⚠️ [Common mistake] - [How to avoid it]

### Environment Details
- **Tech Stack:** [Versions of key dependencies]
- **Dependencies:** [Relevant packages and why they're used]
- **Configuration:** [Important settings]
- **Credentials:** [What's needed and where to find them - NO actual secrets]

### Assumptions Made
- [Assumption] - **Confidence:** [High/Medium/Low] - **Validate by:** [How to check]
- [Assumption] - **Confidence:** [Level] - **Impact if wrong:** [Consequence]

### References
- [Documentation URL] - [What it covers]
- `[File:section]` - [Relevant pattern to follow]
- [External resource] - [Why it's useful]
```

---

### 6. Current State

```markdown
## Current State

### Deliverables Status

**[Artifact 1]** - ✅ Complete
- File: `[path]`
- Status: Finalized and tested
- Confidence: High

**[Artifact 2]** - 🚧 In Progress (60% complete)
- File: `[path]`
- What's done: [Completed parts]
- What's left: [Remaining work]
- Blockers: [What's preventing completion]

**[Artifact 3]** - ⏸️ Not Started
- File: `[planned path]`
- Why pending: [Reason]

### What's Finalized
- ✅ [Component/feature] - Tested and working
- ✅ [Decision] - Locked in, don't change

### What's Draft/Temporary
- 🚧 [Code/approach] - **Temporary because:** [Reason] - **To finalize:** [What's needed]
- 🚧 [Implementation] - **Needs:** [What to improve]

### Pending Decisions
- ❓ [Question to answer]
  - **Options:** [Choice A | Choice B | Choice C]
  - **Info needed:** [What would help decide]
  - **Impact:** [How this affects the project]

### Current Position in Workflow
[Where are we in the overall process? What phase? What's the bigger picture?]

**Progress:** [X] of [Y] steps complete (Z% done)

**Next Milestone:** [What's the next major checkpoint]
```

---

### Step 3: Detail Level Guidelines

Adapt detail based on task type:

**For coding tasks:**
- Specific file paths with line numbers
- API contracts and interfaces
- Patterns to follow (with examples)
- Edge cases discovered
- Type definitions if using TypeScript

**For research tasks:**
- Concise summary of findings
- Source credibility notes
- Confidence levels for conclusions
- Search strategies that worked/failed
- Gaps in knowledge

**For analysis tasks:**
- Data/evidence reviewed
- Reasoning chains (how we got to conclusions)
- Limitations in the analysis
- Suggested validation approaches

**For writing/documentation:**
- Structure/outline decided
- Tone and style decisions
- Key messaging points
- Approval status

**For configuration/setup:**
- All settings changed (before/after)
- Dependencies between configs
- Why defaults weren't used
- Rollback procedures

---

### Step 4: Save File

Write to `whats-next.md` in the working directory.

---

### Step 5: Confirm and Offer Options

```
✓ Created whats-next.md (2,450 words)

This handoff document includes:
- Original task and scope
- All work completed with file references
- Remaining tasks in priority order
- Failed approaches to avoid
- Critical context and decisions
- Current state of all deliverables

What would you like to do?
- Review the document
- Continue current work
- Start the next task from the handoff
- Export/share the document
```

Use `AskUserQuestion` for user choice.

---

## Quality Checklist

Before saving, verify:

- [ ] Could someone completely unfamiliar pick this up and continue?
- [ ] Are file paths and line numbers specific (not vague)?
- [ ] Are failures documented to avoid repetition?
- [ ] Are non-obvious decisions explained with reasoning?
- [ ] Is the current state crystal clear (what's done, what's not)?
- [ ] Are next steps actionable and ordered?
- [ ] Are assumptions explicitly stated with confidence levels?
- [ ] Are credentials mentioned (but NOT included)?
- [ ] Is the bigger picture/context provided?
- [ ] Could this be understood weeks/months later?

---

## Example Output Preview

```markdown
# What's Next - NuuMee Figma-to-Code Generation

## Original Task

**User's request:**
> "Generate all 28 pages from Figma designs without truncating content"

**Interpreted as:**
Build a complete agentic workflow system using 4 specialized Claude Code sub-agents (figma-extractor, ui-planner, frontend-dev, qa-reviewer) to convert Figma designs into production-ready Next.js pages with 80%+ design accuracy and zero content truncation.

**Scope:**
- ✅ In scope: 28 pages from Figma file nMcSs9Tr5Quo79fHshvlHh
- ✅ In scope: Automated agent pipeline with QA verification
- ❌ Out of scope: Backend API implementation (separate remote server)
- ⚠️ Unclear: Whether to batch-process all 28 or iterate one at a time

## Work Completed

### Artifacts Created
- `.claude/agents/figma-extractor.md` - Agent that calls Figma REST API to extract design specs
- `.claude/agents/ui-planner.md` - Agent that plans React component architecture
- `.claude/agents/frontend-dev.md` - Agent that implements TypeScript/TSX components
- `.claude/agents/qa-reviewer.md` - Agent that validates implementation vs design
- `.claude/agents/workflow-coordinator.md` - Meta-agent that orchestrates the pipeline
- `.claude/commands/generate-page.md` - Slash command to trigger full pipeline
- `docs/design-specs/EXAMPLES_DESIGN.md` - Design spec for Examples page (Frame 28:3965)
- `docs/ui-plans/EXAMPLES_PLAN.md` - Component plan for Examples page

### Modifications Made
- `.claude/settings.local.json:12-45` - Added auto-approvals for all agent bash commands
- `packages/ui/src/index.tsx:1-25` - Exported 15 new shared components
- `packages/ui/package.json:18-26` - Added 9 Radix UI dependencies

### Key Findings
- **Previous truncation issue** - Caused by trying to fit entire page generation in main conversation context. Solution: Delegate to sub-agents with fresh 200k context each.
- **Figma API rate limits** - Can handle 100 requests/minute, sufficient for batch processing
- **Component reusability** - ~40% of components are shared across pages (Button, Input, Card, etc.)

### Decisions Made
- **Decision:** Use 4 separate agents instead of one mega-agent
  - **Reasoning:** Each phase (extraction, planning, implementation, QA) has distinct requirements and tools
  - **Alternatives:** Single agent doing everything, or manual step-by-step
  - **Impact:** Better context management, clearer separation of concerns, easier debugging

- **Decision:** Implement Examples page first before batch processing
  - **Reasoning:** Need to validate workflow with one page before scaling to 28
  - **Alternatives:** Batch all 28 immediately
  - **Impact:** Reduces risk of generating 28 broken pages

## Work Remaining

### Immediate Next Steps (in order)

1. **Run frontend-dev agent to implement Examples page**
   - Location: Will create `apps/web/src/pages/examples.tsx`
   - Why first: Design spec and UI plan already exist, ready for implementation
   - Dependencies: `docs/ui-plans/EXAMPLES_PLAN.md` must exist (✅ complete)
   - Estimated complexity: Moderate (6-8 components, interactive filtering)

2. **Run qa-reviewer agent to validate Examples page**
   - Location: Will create `docs/qa-reports/EXAMPLES_QA.md`
   - Why now: Need to verify implementation matches design spec
   - Dependencies: Step 1 must complete
   - Success criteria: QA score ≥80%

3. **Fix any issues found in QA review**
   - Location: `apps/web/src/pages/examples.tsx` and related components
   - Why now: Must achieve 80%+ before scaling to other pages
   - Dependencies: Step 2 QA report

4. **Generate remaining 27 pages in parallel**
   - Location: 27 new page files in `apps/web/src/pages/`
   - Why after Steps 1-3: Workflow validated and working
   - Approach: Use workflow-coordinator with batch mode

### Validation Needed
- [ ] Examples page QA score ≥80% - Run `pnpm type-check` and visual inspection
- [ ] All TypeScript errors resolved - `pnpm type-check` shows 0 errors
- [ ] Dev server starts without errors - `pnpm web:dev` runs successfully
- [ ] Page renders all sections - Manual check in browser at http://localhost:3000/examples

## Attempted Approaches

### What Didn't Work

**Approach 1: Manual page generation in main conversation**
- **Why it failed:** Hit context limits around 150k tokens, started truncating content with "// rest here" comments
- **Learning:** Large file generation requires isolated context
- **Don't retry because:** Fundamentally limited by context size in main conversation

**Approach 2: Using workflow-coordinator from the start**
- **Why it failed:** workflow-coordinator wasn't designed yet, needed to build it first
- **Learning:** Meta-agents require careful orchestration rules
- **Status:** Now implemented correctly

### Dead Ends to Avoid
- ❌ Trying to generate all 28 pages in one agent call - Will hit context limits
- ❌ Using App Router instead of Pages Router - Existing codebase uses Pages Router
- ❌ Custom CSS instead of Tailwind - Design system based on Tailwind utilities

## Critical Context

### Key Decisions & Trade-offs

**Decision:** Pages Router instead of App Router
- **Reasoning:** Existing codebase already uses Pages Router, migration would be risky mid-project
- **Trade-off:** Missing some Next.js 14 features (server components, streaming)
- **Impact:** Simpler file structure, more predictable routing

**Decision:** Radix UI for component primitives
- **Reasoning:** Accessible, unstyled primitives that work well with Tailwind
- **Trade-off:** More dependencies, larger bundle
- **Impact:** Faster development, better accessibility out-of-box

### Constraints
- **Technical:** Backend is on remote server - Can't modify API, only consume it
- **Technical:** Must use pnpm (not npm/yarn) - Turborepo workspace config requires it
- **Business:** Pages needed for investor demo - Quality over speed, must look professional

### Important Discoveries
- **Agent transcript files** - Saved to `.claude/agent-*.jsonl` - Can monitor real-time progress
- **Auto-approval settings** - Required in `.claude/settings.local.json` for agents to run bash commands
- **Figma Frame IDs** - Format is "nodeId:instanceId" like "28:3965"

### Gotchas & Warnings
- ⚠️ **Don't truncate** - Agents must write complete files, NO "// rest of content" placeholders
- ⚠️ **Component locations matter** - Shared = `packages/ui/src/`, Page-specific = `apps/web/src/components/`
- ⚠️ **pnpm workspace protocol** - Use `"@nuumee/ui": "workspace:*"` in package.json

### Environment Details
- **Tech Stack:** Next.js 14.0.4, React 18, TypeScript 5, Tailwind CSS 3.4
- **Node Version:** Requires Node 18+
- **Package Manager:** pnpm 8.15.0
- **Figma Credentials:** Token in `.claude/CLAUDE.md`, File Key: nMcSs9Tr5Quo79fHshvlHh

### Assumptions Made
- Figma designs are final - **Confidence:** High - **Validate by:** Check with design team
- 80% QA threshold is acceptable - **Confidence:** Medium - **Validate by:** Review first generated page
- All pages use same component library - **Confidence:** High - **Impact if wrong:** Would need page-specific styling

### References
- [Taches CC Resources](https://github.com/glittercowboy/taches-cc-resources) - Meta-prompting methodology
- `.claude/agents/README.md` - Agent system specification
- `docs/WORKFLOW.md` - Complete workflow documentation

## Current State

### Deliverables Status

**Agent System** - ✅ Complete
- Files: 5 agent definitions in `.claude/agents/`
- Status: All agents configured and validated
- Confidence: High - tested individually

**Design Spec (Examples page)** - ✅ Complete
- File: `docs/design-specs/EXAMPLES_DESIGN.md`
- Status: Extracted from Figma Frame 28:3965
- Confidence: High - direct from Figma API

**UI Plan (Examples page)** - ✅ Complete
- File: `docs/ui-plans/EXAMPLES_PLAN.md`
- Status: Component hierarchy defined
- Confidence: High - follows existing patterns

**Implementation (Examples page)** - ⏸️ Not Started
- File: `apps/web/src/pages/examples.tsx` (planned)
- Why pending: Waiting for frontend-dev agent execution
- Blockers: None - ready to proceed

**QA Report (Examples page)** - ⏸️ Not Started
- File: `docs/qa-reports/EXAMPLES_QA.md` (planned)
- Why pending: Implementation must complete first
- Blockers: Depends on previous step

**Remaining 27 pages** - ⏸️ Not Started
- Files: Various in `apps/web/src/pages/`
- Why pending: Waiting for Examples page validation
- Approach: Batch processing via workflow-coordinator

### What's Finalized
- ✅ Agent system architecture - Don't modify agent boundaries
- ✅ Figma API integration - Working and tested
- ✅ Component library structure - packages/ui pattern established

### What's Draft/Temporary
- 🚧 Examples design spec - **May need updates** if Figma design changes - **To finalize:** Get design sign-off
- 🚧 Auto-approval settings - **Too permissive** (approves all bash) - **To finalize:** Narrow to specific commands

### Pending Decisions
- ❓ **Batch all 27 pages or iterate?**
  - **Options:** Parallel batch | Sequential one-by-one | Groups of 5-10
  - **Info needed:** Examples page QA results
  - **Impact:** Determines timeline and risk

- ❓ **Create Storybook for components?**
  - **Options:** Yes, add Storybook | No, use dev pages | Wait until later
  - **Info needed:** Team preference
  - **Impact:** Better component documentation vs more setup time

### Current Position in Workflow

**Phase:** Implementation (Step 3 of 4-step pipeline)

**Progress:** 2 of 4 agents completed for Examples page (figma-extractor ✅, ui-planner ✅, frontend-dev ⏸️, qa-reviewer ⏸️)

**Overall:** 1 of 28 pages in progress (3.5% complete)

**Next Milestone:** First page at 80%+ QA score, validating entire workflow

**Timeline:** After Examples page validation, can batch-process all 27 remaining pages in parallel (estimated 2-4 hours for agent execution)
```

---

## Intelligence Rules

- **Be comprehensive** - This document should contain EVERYTHING needed to resume
- **Be specific** - Use file paths, line numbers, exact error messages
- **Be honest** - Document failures and dead ends clearly
- **Be actionable** - Next steps should be clear and ordered
- **Be contextual** - Explain the "why" not just the "what"
- **Anticipate questions** - What would you want to know if picking this up fresh?
