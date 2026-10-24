# Hva er det til middag
En liten app for å lette middagsplanleggingen i familien.

## Del en plan

Velg **Del plan** og kopier lenken. Lenken åpner planen med middager,
oppskriftsvalg, raske dager og valgte familiemedlemmer på en annen enhet.
Planen ligger i lenkens fragment (`#plan=…`), uten en database. Alle som har
lenken kan lese planen. Lenken er et øyeblikksbilde; senere endringer deles ved
å lage en ny lenke. Last inn lenken igjen for å hente det opprinnelige bildet.
Vanlige planer lagres fortsatt bare i den åpne siden.

## MCP server (local stdio)

Requires Node.js 20+. From the repository directory:

```sh
npm ci
npm test
```

Register with Codex using the **absolute path** to this checkout:

```sh
codex mcp add dinner -- node /absolute/path/to/hva-er-det-til-middag/mcp/server.js
```

On Windows, quote the full path, for example:

```powershell
codex mcp add dinner -- node "C:\Projects\hva-er-det-til-middag\mcp\server.js"
```

For another MCP host, use `node` as the command and the absolute `mcp/server.js`
path as the only argument. No API key, database, or hosting account is needed.
Restart/reconnect the MCP host after registration. `npm run mcp` starts the same
server manually; it waits for MCP messages on stdin and uses stdout only for
protocol traffic.

Tools:

| Tool | Purpose |
| --- | --- |
| `get_dinner_options` | Discover tags and family member IDs/emoji labels. |
| `find_dinners` | Find meals matching all selected tags and family members. |
| `suggest_plan` | Generate 1–31 days with optional quick dates and a plan link. |
| `create_plan_link` | Link to explicitly selected meals, recipes, and empty days. |

Example: “Plan next week for sloth and giraffe, with quick dinners on Tuesday
and Thursday, and give me a link to open the plan.” Use the discovery tool to
learn member IDs; emoji labels do not identify actual people to the server.
Fish/vegetarian variety is best effort, as in the webapp. If no matching meal
is available a day remains empty and the tool reports a warning.

The server imports the same meal catalogue and planner as the browser. Update
this checkout when the catalogue changes. It does not control an existing tab,
store plans, or modify GitHub. Generated links point to the published app;
the share-link feature must be deployed there before those links work. For
local previews set `DINNER_APP_URL` in the MCP host's environment, for example
`http://localhost:8000/`. Links preserve meal names; renaming/removing a meal
can invalidate older links.

GitHub Pages continues to host the webapp. This stdio server runs on your own
computer. Connecting from a remote-only host requires a separately hosted MCP
HTTP endpoint; that is not included in this version.

## Development

`npm test` runs planner, link-validation and real stdio MCP integration tests.
`npm run build:pages` stages only browser assets in `_site/`. The Pages workflow
tests the code and publishes that folder, excluding MCP dependencies.
