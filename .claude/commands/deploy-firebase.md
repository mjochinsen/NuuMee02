---
description: "[DEPRECATED] Use /deploy frontend instead"
---

# Deploy to Firebase Hosting (DEPRECATED)

> **DEPRECATED:** This command is replaced by `/deploy frontend`
> Use `/deploy`, `/deploy backend`, or `/deploy frontend` instead.

---

## OLD CONTENT BELOW (kept for reference)

You are being asked to deploy the NuuMee Next.js application to Firebase Hosting.

## Context

- **Application:** Next.js 14 app in `apps/web/`
- **Target:** Firebase Hosting (Project ID: `wanapi-prod`)
- **Custom Domain:** `nuumee.ai` (on GoDaddy)
- **Deployment Type:** Static export

## Your Task

Invoke the `deployment-orchestrator` meta-agent to handle the complete deployment workflow.

```
Use the Task tool to launch deployment-orchestrator agent.

Prompt: "Deploy the Next.js application at apps/web/ to Firebase Hosting. Project ID is 'wanapi-prod'. Custom domain is 'nuumee.ai'. Execute all phases: configure Next.js for static export, setup Firebase Hosting, deploy, validate deployment, and check custom domain DNS/SSL status. Ask user for confirmation before deploying to production."
```

## Expected Workflow

The deployment-orchestrator will:
1. Configure Next.js for static export
2. Setup Firebase Hosting configuration
3. Ask user: test with emulator or deploy to production
4. Deploy to Firebase
5. Validate deployment and all pages
6. Check custom domain and SSL status
7. Provide DNS setup guide if needed
8. Optionally generate deployment documentation

## User Interaction

The orchestrator will ask the user for decisions at key points:
- **Emulator test vs direct deploy:** Let user choose
- **Custom domain setup:** Provide clear GoDaddy DNS instructions
- **Documentation generation:** Ask if user wants deployment docs

## Success Criteria

At completion, you should report:
- ✅ Site deployed to Firebase URL
- ✅ All pages accessible and tested
- ✅ Custom domain status (configured or pending with setup guide)
- ✅ SSL certificate status
- ✅ Performance metrics
- ✅ Ready for investor demos

## Important

- The orchestrator handles all agent coordination
- You just need to invoke it and relay its reports to the user
- Provide clear, user-friendly summaries of technical details
- Make sure to show deployment URLs prominently
