import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

async function main() {
  const transport = new StdioClientTransport({
    command: "node",
    args: ["dist/index.js"], // ajuste se seu entrypoint for outro
    cwd: process.cwd(),
  });

  const client = new Client({ name: "mcp-smoke-test", version: "1.0.0" });

  await client.connect(transport);

  const tools = await client.listTools();
  console.log("\n=== TOOLS ===");
  console.log(tools.tools.map((t) => t.name));

  console.log("\n=== CALL legal_pleading_list ===");
  const result = await client.callTool({
    name: "legal_pleading_list",
    arguments: { page: 1, limit: 10 }, // ajuste conforme seu DTO
  });

  console.log(result);

  await client.close();
}

main().catch((err) => {
  console.error("SMOKE TEST ERROR:", err);
  process.exit(1);
});
