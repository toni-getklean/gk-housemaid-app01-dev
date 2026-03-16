---
name: fly-deployment
description: Guidelines for deploying the application to Fly.io.
---

# Deployment (Fly.io) Skill

This application is deployed on **Fly.io** using a custom Dockerized container environment.

## Deployment Guidelines for AI Agents

When tasked with deploying the application or answering questions about the deployment architecture:

1. **The Scripts are Supreme**: There are predefined deployment files in the repository structure.
   - Read `FLY_IO_SUMMARY.md` first. It serves as the primary technical overview of the environment.
   - To trigger a deployment, strictly rely upon the `./deploy.sh` script.

2. **Wait, Don't Improvise**:
   - Do not instruct the user to run arbitrary `flyctl launch` commands unless explicitly migrating or setting up a completely new environment.
   - Do not modify the `fly.toml` configuration or `Dockerfile` unless directly tasked with altering scaling, environment variables, or base images.

3. **Secrets Management**:
   - Fly.io relies on built-in secrets management (not committed `.env` files).
   - Remember that any new environment variable added to `.env` during development MUST ALSO be deployed using `flyctl secrets set KEY=VALUE` before the application can function properly in production.

4. **Database Migrations on Release**:
   - Database migrations might be executed automatically during the release command phase (configured within `fly.toml`), ensuring production databases stay in sync before new instances start routing traffic. Check the `release_command` property if analyzing deployment failures.
