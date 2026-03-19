---
description: How to run testing and verification scripts
---

# Testing Scripts Workflow

When the user requests to run, test, or verify a script inside the `scripts/` directory (for example, `scripts/verify-pricing.ts`), you must adhere to the following rules:

1. **Always Use Environment Variables**: The project uses Node 20.6+ natively, and scripts typically require database or external API credentials from the `.env` file.
   
2. **Execute with File Loader**:
   When running via `npx tsx`, you MUST include the `--env-file=.env` flag.
   - **Correct**: `npx tsx --env-file=.env scripts/verify-pricing.ts`
   - **Incorrect**: `npx tsx scripts/verify-pricing.ts`

3. **Check package.json**: 
   Before running a script manually, check if an NPM script has been defined for it in `package.json` and prefer running `npm run <script-name>`.

4. **User Guidance**: 
   If you ever observe the user running a testing script without loading the `.env` file, kindly remind them to use the `--env-file=.env` flag or the equivalent `npm run` command.
