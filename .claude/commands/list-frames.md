---
description: List all available Figma frames that can be generated
---

Fetch and display all frames from the configured Figma file that can be used for page generation.

**Instructions:**

1. Use the configured Figma credentials:
   - API Token: figd_0D4L3TuMiT6rhRRtf-RCMjHlDlP6GKKHnYfEOPs0
   - File Key: nMcSs9Tr5Quo79fHshvlHh

2. Fetch the Figma file structure:
   ```bash
   curl -H "X-Figma-Token: figd_0D4L3TuMiT6rhRRtf-RCMjHlDlP6GKKHnYfEOPs0" \
        "https://api.figma.com/v1/files/nMcSs9Tr5Quo79fHshvlHh"
   ```

3. Parse the response and extract:
   - Frame names
   - Frame IDs
   - Page context (which Figma page they're on)
   - Frame types (if identifiable)

4. Display in a table format:
   ```
   Available Figma Frames:

   Page Name    | Frame Name        | Frame ID  | Status
   -------------|-------------------|-----------|--------
   Main Pages   | Examples          | 28:3965   | ✅ Ready
   Main Pages   | Home              | 28:1234   | Not generated
   Auth Pages   | Login             | 28:5678   | Not generated
   ```

5. Check which frames already have design specs in `docs/design-specs/`:
   - Mark frames with existing specs as "✅ Ready" or "📝 Partial"
   - Mark frames without specs as "Not generated"

6. Provide usage examples:
   ```
   To generate a page:
   /generate-page Examples 28:3965
   /generate-page Home 28:1234
   ```

**Error Handling:**
- If API returns 401: Token invalid, report to user
- If API returns 404: File key incorrect
- If API returns 429: Rate limited, wait and retry once

**Output:**
Show organized list of all frames with their IDs, making it easy for user to generate any page.

**Note:**
Frame IDs are in format `{node-id}:{node-hash}` (e.g., "28:3965")
