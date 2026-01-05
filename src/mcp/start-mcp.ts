import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { server } from "./server.js";
import "../tools/index.js";

export async function startMcpServer() {
  console.log("[MCP] Inicializando servidor MCP");
  console.log("[MCP] PID:", process.pid);
  console.log("[MCP] CWD:", process.cwd());

  const transport = new StdioServerTransport();
  await server.connect(transport);

  console.log("[MCP] Servidor MCP conectado via STDIO");
}
