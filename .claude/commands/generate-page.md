---
description: Generate a page from Figma using the agentic workflow pipeline
---

Generate a complete page implementation from a Figma design using the 4-agent pipeline (figma-extractor → ui-planner → frontend-dev → qa-reviewer).

**Usage:**
- `/generate-page Examples` - Generate using default Frame ID for Examples page
- `/generate-page Examples 28:3965` - Generate with specific Frame ID
- `/generate-page PageName <frame-id>` - Generate any page with Frame ID

**Instructions:**

1. Parse the command arguments:
   - Arg 1: Page name (required)
   - Arg 2: Frame ID (optional, use 28:3965 for Examples if not provided)

2. Validate inputs:
   - Check if Frame ID is provided or use defaults
   - Verify Figma credentials exist (from CLAUDE.md)

3. Invoke workflow-coordinator with:
   - Page name: {provided}
   - Frame ID: {provided or default}
   - Strategy: Single Page Workflow
   - Figma token: figd_0D4L3TuMiT6rhRRtf-RCMjHlDlP6GKKHnYfEOPs0
   - File key: nMcSs9Tr5Quo79fHshvlHh

4. The workflow-coordinator will guide you through:
   - Step 1: Invoke figma-extractor (if design spec doesn't exist)
   - Step 2: Invoke ui-planner (if plan doesn't exist)
   - Step 3: Invoke frontend-dev
   - Step 4: Invoke qa-reviewer

5. After completion, report:
   - QA match percentage
   - Files created
   - Any issues found
   - Next steps

**Default Frame IDs:**
- Examples: 28:3965
- (Add more as you discover them)

**Output:**
```
Generating {PageName} from Figma Frame {frameId}...

Invoking workflow-coordinator...

[Workflow coordinator will guide the process]

✅ Page generation complete!
- Design Spec: docs/design-specs/{PAGE}_DESIGN.md
- Component Plan: docs/ui-plans/{PAGE}_PLAN.md
- Page File: apps/web/src/pages/{page}.tsx
- QA Report: docs/qa-reports/{PAGE}_QA.md
- QA Match: {percentage}%

Status: {Approved | Needs Review}
```

**Tips:**
- Monitor progress with `/watch-agents` or `.\watch-agent.ps1`
- Check QA report for implementation quality
- Re-run frontend-dev if QA score < 80%
