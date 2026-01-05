import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

async function main() {
  const transport = new StdioClientTransport({
    command: "node",
    args: ["dist/index.js"],
    cwd: process.cwd(),
  });

  const client = new Client({
    name: "mcp-smoke-test",
    version: "1.0.0",
  });

  await client.connect(transport);

  const tools = await client.listTools();

  console.log("\n=== TOOLS REGISTRADAS ===");
  for (const tool of tools.tools) {
    console.log(`- ${tool.name}`);
  }

  console.log("\n=== CALL legal_pleading_list ===");

  const legalPleadingList = await client.callTool({
    name: "legal_pleading_list",
    arguments: {
      page: 1,
      limit: 5,
    },
  });

  console.dir(legalPleadingList, { depth: null });

  console.log("\n=== CALL cnis_fast_analysis_patch ===");

  const cnisPatchResult = await client.callTool({
    name: "cnis_fast_analysis_patch",
    arguments: {
      cnisFastAnalysisId: "a4e82f1d-0ee9-4d75-91c5-3df2701f3a59",
      json: {
        analysisToolClientId: "95bda726-e991-4584-8415-fe7bb0eafc3f",
        legalProceedingNumber: ["50190741820258240039", "10054052220254013310"],
        inssBenefitNumber: [],
      },
    },
  });

  console.dir(cnisPatchResult, { depth: null });

  console.log("\n=== CALL cnis_fast_analysis_result_create ===");

  const cnisResult = await client.callTool({
    name: "cnis_fast_analysis_result_create",
    arguments: {
      cnisFastAnalysisId: "a4e82f1d-0ee9-4d75-91c5-3df2701f3a59",
    },
  });

  console.dir(cnisResult, { depth: null });

  await client.close();
}

main().catch((err) => {
  console.error("❌ MCP SMOKE TEST ERROR:");
  console.error(err);
  process.exit(1);
});
