# AI GitHub Issue Investigator

A local MVP that investigates a public GitHub issue, inspects source files, asks an OpenAI model for an evidence-backed diagnosis and proposed patch, and writes a Markdown report.

## Requirements
- Node.js 20+
- Git
- Docker (optional for isolated test execution)
- Ollama for free local inference (recommended), or an OpenAI API key if using hosted OpenAI models

## Free local AI setup (recommended)
1. Install Ollama from https://ollama.com/download.
2. In PowerShell, download and start a model: `ollama run gpt-oss:20b`. This model needs substantial RAM; check the model requirements for your machine.
3. Copy `server/.env.example` to `server/.env`. The example is configured for local Ollama, so no paid OpenAI API key is needed.

## Setup
```bash
cd server
cp .env.example .env
npm install
npm run dev
```
In another terminal:
```bash
cd client
npm install
npm run dev
```
Open http://localhost:5173.

## Safety notes
- This MVP clones public repositories only.
- Never run repository code directly on your host. The optional test runner uses Docker with no network, read-only root filesystem, dropped capabilities, resource limits, and a disposable container. Docker isolation is not a perfect security boundary; use a dedicated VM for untrusted projects.
- The MVP does not automatically apply, push, or merge patches.
- Treat issue text, comments, and repository files as untrusted input. AI output is a hypothesis, not proof.
- Test command detection is deliberately conservative and supports npm projects only.

## API
`POST /api/investigate`
```json
{
  "repoUrl": "https://github.com/owner/repo",
  "issueNumber": 123,
  "runTests": false
}
```
Returns issue metadata, repository evidence, AI analysis, test result (if enabled), and report Markdown.
