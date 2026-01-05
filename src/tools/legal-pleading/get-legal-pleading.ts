import { z } from "zod";
import { server } from "../../mcp/server.js";
import { api } from "../../http/api.client.js";

server.registerTool(
  "legal_pleading_get",
  {
    description: "Retorna uma peça processual por ID.",
    inputSchema: { legalPleadingId: z.string().min(1) },
  },
  async ({ legalPleadingId }) => {
    const path = `/customer/analysis-tool/legal-pleading/${encodeURIComponent(
      legalPleadingId
    )}`;
    const data = await api.get(path);
    return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
  }
);
