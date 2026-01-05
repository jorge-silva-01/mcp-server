// src/scripts/test-db.ts
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

function toRecordString(env: NodeJS.ProcessEnv): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(env)) {
    if (typeof v === "string") out[k] = v;
  }
  return out;
}

async function main() {
  const transport = new StdioClientTransport({
    command: "node",
    args: ["./dist/index.js"],
    cwd: process.cwd(),
    env: toRecordString(process.env),
  });

  const client = new Client(
    { name: "terminal-test-client", version: "1.0.0" },
    { capabilities: {} }
  );

  await client.connect(transport);

  const sql =
    "SELECT id, created_at, updated_at, deleted_at, cnis_document, cnis_fast_analysis_result_id " +
    "FROM cnis_fast_analysis " +
    "LIMIT 50";

  const result = await client.callTool({
    name: "db_sql_execute",
    arguments: { sql, params: [] },
  });

  console.log(JSON.stringify(result, null, 2));
  await client.close();
}

main().catch((e) => {
  console.error("Erro no teste MCP:", e);
  process.exit(1);
});
