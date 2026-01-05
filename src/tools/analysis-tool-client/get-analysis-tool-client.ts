import { z } from "zod";
import { server } from "../../mcp/server.js";
import { api } from "../../http/api.client.js";

server.registerTool(
  "analysis_tool_client_get",
  {
    description: "Retorna cliente da analise pelo ID.",
    inputSchema: { analysisToolClientId: z.string().min(1) },
  },
  async ({ analysisToolClientId }) => {
    const path = `/customer/analysis-tool/analysis-tool-client/${encodeURIComponent(
      analysisToolClientId
    )}`;
    const data = await api.get(path);
    return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
  }
);
