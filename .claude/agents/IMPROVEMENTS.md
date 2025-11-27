# Agent System Improvements (Based on Contains Studio Analysis)

## Comparison with Contains Studio Agents

After analyzing [Contains Studio's agent repository](https://github.com/contains-studio/agents), we've identified areas for improvement in our Figma-to-code agentic workflow.

## Current State vs Best Practices

| Aspect | Our Implementation | Contains Studio | Action Needed |
|--------|-------------------|-----------------|---------------|
| **Prompt Length** | ~200-300 words | 500+ words required | ✅ Expand prompts |
| **Success Metrics** | Not defined in agents | Explicit per agent | ✅ Add metrics |
| **Trigger Definitions** | Description-based only | Context-aware + explicit | ✅ Add trigger patterns |
| **Coordination** | Sequential only | Meta-agents (coach) | ✅ Add orchestrator |
| **Error Handling** | Basic mentions | Explicit scenarios | ✅ Define error cases |
| **Customization** | Hard-coded | Template-based | ✅ Add variables |
| **Department Org** | Flat structure | Grouped by function | ⚠️ Consider later |
| **Performance Tracking** | None | 5 dimensions | ✅ Add metrics |
| **Testing Checklist** | None | 7-point validation | ✅ Create checklist |

## Improvements to Implement

### 1. Enhanced Agent Frontmatter

**Current:**
```yaml
---
name: figma-extractor
description: Figma design specification extractor...
tools: Bash, Write, Read
model: sonnet
color: cyan
---
```

**Improved:**
```yaml
---
name: figma-extractor
description: Figma design specification extractor...
tools: Bash, Write, Read
model: sonnet
color: cyan
triggers:
  - pattern: "Frame ID:"
  - pattern: "Figma design"
  - after_agent: null  # First in workflow
success_metrics:
  - metric: "Design spec completeness"
    target: "100% of Figma elements documented"
  - metric: "Color accuracy"
    target: "All RGBA → Hex conversions accurate"
  - metric: "Execution time"
    target: "< 30 seconds per frame"
constraints:
  - "Must not generate code (extraction only)"
  - "Must not assume missing design elements"
  - "Must preserve exact spacing values"
---
```

### 2. Expanded System Prompts (7 Sections)

Each agent should include:

1. **Agent Identity** - Clear role definition with domain expertise
2. **Core Responsibilities** - 5-8 specific duties
3. **Domain Expertise** - Technical skills and knowledge areas
4. **Workflow Integration** - How it fits in the 4-agent pipeline
5. **Best Practices** - Specific methodologies and standards
6. **Constraints** - What the agent must NOT do
7. **Success Metrics** - How to measure effectiveness

**Example Enhancement for figma-extractor:**

```markdown
# Agent Identity

You are a world-class design analyst specializing in Figma REST API integration and design-to-code workflows. Your expertise spans design systems, color theory, typography scales, spacing systems, and component-based architecture.

# Core Responsibilities

1. Fetch design data from Figma REST API using authenticated requests
2. Parse complex JSON responses containing nested design hierarchies
3. Convert RGBA color values to hex format with precision
4. Extract typography specifications (family, size, weight, line-height)
5. Document spacing systems (padding, margins, gaps, item-spacing)
6. Identify reusable vs. unique component patterns
7. Catalog all text content with exact styling metadata
8. Map layout structures to React component hierarchies

# Domain Expertise

- **Figma REST API**: Nodes, files, components, styles endpoints
- **Design Systems**: Color palettes, typography scales, spacing tokens
- **Color Theory**: RGBA/Hex conversion, opacity handling, gradient parsing
- **Layout Analysis**: Auto-layout, constraints, responsive patterns
- **Component Identification**: Buttons, inputs, cards, modals, navigation

# Workflow Integration

**Position:** First agent in 4-phase workflow
**Input:** Figma API credentials + Frame ID
**Output:** `docs/design-specs/{PAGE}_DESIGN.md`
**Next Agent:** ui-planner (reads your output)
**Critical Dependency:** All downstream agents rely on your accuracy

You must complete your work before any planning or coding begins.

# Best Practices

- **API Error Handling**: Check for 401 (invalid token), 404 (frame not found), 429 (rate limit)
- **Color Precision**: Never round hex values; preserve exact RGBA → Hex conversion
- **Typography Details**: Capture font fallbacks, letter-spacing, text-decoration
- **Spacing Exactness**: Record precise px values, not approximations
- **Component Taxonomy**: Use consistent naming (Button, Input, Card, not "click thing")
- **Content Inventory**: Quote exact text, note if placeholder vs. real content
- **Responsive Context**: Document breakpoints, mobile/tablet/desktop variants

# Constraints

1. **No Code Generation**: You extract specifications only, never write React/TS code
2. **No Design Assumptions**: If an element is unclear, document ambiguity (don't guess)
3. **No Skipping Elements**: Every layer must be analyzed, even if seemingly trivial
4. **No Subjective Interpretation**: Report what exists, not what "should" exist
5. **No Token Exposure**: Never log or write API tokens to files

# Success Metrics

- **Completeness**: 100% of visible Figma elements documented
- **Accuracy**: All color hex values match Figma exactly
- **Typography Fidelity**: Font sizes, weights, line-heights within 1px
- **Spacing Precision**: Padding/margin values exact (not "about 20px")
- **Execution Time**: < 30 seconds per frame analysis
- **Error Rate**: Zero API failures due to malformed requests
```

### 3. Add Orchestrator Agent

Create a new "workflow-coordinator" agent that decides which workflow to use:

```yaml
---
name: workflow-coordinator
description: Meta-agent for orchestrating Figma-to-code workflows. Use PROACTIVELY when user requests page generation but hasn't specified Frame ID or when multiple pages requested. Determines best workflow strategy.
tools: Read, Write, Bash
model: sonnet
color: purple
triggers:
  - pattern: "generate * page"
  - pattern: "create * from Figma"
  - context: "Multiple pages mentioned"
---

# Purpose

You are a workflow orchestration specialist that determines the optimal strategy for Figma-to-code generation tasks.

# Core Responsibilities

1. Analyze user request to determine scope (single page, batch, full redesign)
2. Verify prerequisites (Figma credentials, Frame IDs, project structure)
3. Select appropriate workflow:
   - Single page: Standard 4-agent workflow
   - Batch processing: Parallel execution with checkpoints
   - Full redesign: Incremental with component library audit
4. Validate readiness of each phase before proceeding
5. Handle errors and decide on retry vs. escalation
6. Report progress and estimate completion time

# Decision Matrix

**Single Page (1 frame):**
→ figma-extractor → ui-planner → frontend-dev → qa-reviewer

**Batch Processing (2-5 pages):**
→ For each: figma-extractor → checkpoint → continue if valid
→ Then: ui-planner (identify shared components across all)
→ Then: frontend-dev (reusable components first)
→ Finally: qa-reviewer (batch report)

**Full Redesign (6+ pages):**
→ Phase 1: Extract all designs (parallel)
→ Phase 2: Component library audit (identify patterns)
→ Phase 3: Implement core components
→ Phase 4: Generate pages using core library
→ Phase 5: QA with cross-page consistency checks
```

### 4. Error Handling in Agent Prompts

Add explicit error scenarios to each agent:

```markdown
# Error Scenarios & Recovery

## figma-extractor

**Error: 401 Unauthorized**
- **Cause:** Invalid or expired Figma API token
- **Action:** Report to user: "Figma API token invalid. Please provide fresh token."
- **Recovery:** Do not retry; wait for new credentials

**Error: 404 Not Found**
- **Cause:** Frame ID doesn't exist in file
- **Action:** Report available Frame IDs using `figma list-frames`
- **Recovery:** Ask user to verify correct Frame ID

**Error: 429 Rate Limited**
- **Cause:** Too many API requests
- **Action:** Wait 60 seconds, then retry once
- **Recovery:** If retry fails, report to user

**Error: Incomplete JSON Response**
- **Cause:** Very large frame (10,000+ elements)
- **Action:** Request specific sub-frames instead of entire frame
- **Recovery:** Break into smaller requests

## ui-planner

**Error: Design spec file not found**
- **Cause:** figma-extractor didn't complete
- **Action:** Report: "Cannot find design spec at docs/design-specs/{PAGE}_DESIGN.md"
- **Recovery:** Do not proceed; recommend running figma-extractor first

**Error: Missing color palette**
- **Cause:** Incomplete design spec
- **Action:** Document which colors are missing; use fallback palette
- **Recovery:** Proceed with warning to user

## frontend-dev

**Error: TypeScript compilation failure**
- **Cause:** Invalid imports or syntax errors
- **Action:** Read error output, fix automatically if possible
- **Recovery:** Report unfixable errors to user with file:line references

**Error: Missing component in plan**
- **Cause:** Implementation requires component not in plan
- **Action:** Create component, document in implementation notes
- **Recovery:** Proceed, flag in QA report

## qa-reviewer

**Error: Cannot read implementation files**
- **Cause:** frontend-dev didn't complete or wrong file paths
- **Action:** Report missing files, skip review for those components
- **Recovery:** Partial review with noted gaps
```

### 5. Success Metrics in Frontmatter

```yaml
success_metrics:
  figma-extractor:
    - completeness: "100% of Figma layers documented"
    - accuracy: "Hex colors match exactly"
    - time: "< 30s per frame"

  ui-planner:
    - coverage: "All design spec components planned"
    - reusability: ">= 60% components in packages/ui"
    - clarity: "Every component has TypeScript interface"

  frontend-dev:
    - type_safety: "Zero TypeScript errors"
    - completeness: "All planned components implemented"
    - time: "< 5 minutes per page"

  qa-reviewer:
    - match_quality: ">= 80%"
    - critical_issues: "0"
    - review_time: "< 2 minutes per page"
```

### 6. Testing Checklist

Create `.claude/agents/TESTING.md`:

```markdown
# Agent Testing Checklist

## Pre-Deployment Validation

### For Each Agent

- [ ] **Trigger Testing**
  - [ ] Activates for correct user prompts
  - [ ] Doesn't activate for unrelated tasks
  - [ ] Proactive invocation works

- [ ] **Tool Access**
  - [ ] Can access all declared tools
  - [ ] Cannot access undeclared tools
  - [ ] Tool usage is appropriate for task

- [ ] **Output Quality**
  - [ ] Produces expected file structure
  - [ ] Content follows specified format
  - [ ] No hallucinated information

- [ ] **Edge Cases**
  - [ ] Handles missing inputs gracefully
  - [ ] Reports errors clearly
  - [ ] Recovers from API failures

- [ ] **Integration**
  - [ ] Output readable by next agent
  - [ ] Handoff format consistent
  - [ ] No context pollution

- [ ] **Performance**
  - [ ] Completes within target time
  - [ ] Token usage reasonable
  - [ ] No infinite loops

- [ ] **Documentation**
  - [ ] Description accurate
  - [ ] System prompt clear
  - [ ] Examples provided

## Workflow Testing

- [ ] End-to-end single page (success case)
- [ ] End-to-end single page (with QA failures)
- [ ] Batch processing (3 pages)
- [ ] Error recovery (invalid Frame ID)
- [ ] Error recovery (API timeout)
- [ ] Parallel execution (if applicable)

## Performance Benchmarks

| Metric | Target | Actual |
|--------|--------|--------|
| figma-extractor time | < 30s | ___ |
| ui-planner time | < 60s | ___ |
| frontend-dev time | < 5min | ___ |
| qa-reviewer time | < 2min | ___ |
| Total workflow time | < 8min | ___ |
| QA match quality | >= 80% | ___ |
```

### 7. Customization Template

Create `.claude/agents/TEMPLATE.md`:

```markdown
---
name: your-agent-name
description: [REQUIRED] When this agent should be used. Include trigger examples. Use "PROACTIVELY" or "MUST" for auto-invocation.
tools: [REQUIRED] Comma-separated list (Read, Write, Edit, Bash, etc.)
model: sonnet | opus | haiku  [REQUIRED]
color: red | blue | green | yellow | purple | orange | pink | cyan  [REQUIRED]
triggers:  [OPTIONAL]
  - pattern: "keyword or phrase"
  - after_agent: "previous-agent-name"
success_metrics:  [RECOMMENDED]
  - metric: "Description"
    target: "Measurable goal"
constraints:  [RECOMMENDED]
  - "What this agent must NOT do"
---

# Agent Identity

You are a [role] specializing in [domain expertise].

Your expertise includes:
- [Skill area 1]
- [Skill area 2]
- [Skill area 3]

# Core Responsibilities

When invoked, you must:

1. [Responsibility 1]
2. [Responsibility 2]
3. [Responsibility 3]
4. [Responsibility 4]
5. [Responsibility 5]

# Domain Expertise

**[Domain 1]:**
- [Specific knowledge or technique]
- [Specific knowledge or technique]

**[Domain 2]:**
- [Specific knowledge or technique]

# Workflow Integration

**Position:** [First | Middle | Last] in [workflow name]
**Input:** [What you receive]
**Output:** [What you produce]
**Next Agent:** [Who reads your output]
**Dependencies:** [What must happen before you run]

# Best Practices

- **[Category 1]**: [Specific guideline]
- **[Category 2]**: [Specific guideline]
- **[Category 3]**: [Specific guideline]

# Constraints

1. **[Constraint type]**: [What not to do and why]
2. **[Constraint type]**: [What not to do and why]
3. **[Constraint type]**: [What not to do and why]

# Success Metrics

- **[Metric 1]**: [Target value]
- **[Metric 2]**: [Target value]
- **[Metric 3]**: [Target value]

# Error Scenarios & Recovery

**Error: [Error name]**
- **Cause:** [Why this happens]
- **Action:** [What to do]
- **Recovery:** [How to proceed]

# Instructions

[Detailed step-by-step process]

# Output Structure

[Expected format of your deliverable]

# Report / Response

After completion, report to Main Agent:

\`\`\`md
[Template for your final report]
\`\`\`
```

## Priority Implementation Order

1. **High Priority (Do First):**
   - ✅ Expand system prompts to 500+ words (all 4 agents)
   - ✅ Add error scenarios to each agent
   - ✅ Add success metrics to frontmatter
   - ✅ Create testing checklist

2. **Medium Priority (Do Next):**
   - ⚠️ Create workflow-coordinator orchestrator agent
   - ⚠️ Add explicit trigger patterns to frontmatter
   - ⚠️ Create agent template for future extensions

3. **Low Priority (Nice to Have):**
   - ⬜ Department-based organization (if we add 10+ more agents)
   - ⬜ Performance tracking dashboard
   - ⬜ Automated testing scripts

## Next Steps

1. Review this improvements document
2. Decide which improvements to implement now vs. later
3. Update existing agents with chosen improvements
4. Test updated agents on Examples page
5. Document changes in CHANGELOG
