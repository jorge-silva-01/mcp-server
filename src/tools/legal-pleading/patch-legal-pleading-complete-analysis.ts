import { z } from "zod";
import { server } from "../../mcp/server.js";
import { api } from "../../http/api.client.js";

server.registerTool(
  "legal_pleading_patch_complete_analysis",
  {
    description: "Atualizar análise completa da peça processual (PATCH JSON).",
    inputSchema: z.object({
      legalPleadingId: z.string().min(1),
      legalPleadingCompleteAnalysis: z.string().min(1),
    }),
  },
  async ({ legalPleadingId, legalPleadingCompleteAnalysis }) => {
    const path = `/customer/analysis-tool/legal-pleading/${encodeURIComponent(
      legalPleadingId
    )}/complete-analysis`;

    const body = { legalPleadingCompleteAnalysis };

    const data = await api.patch(path, body);

    return {
      content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
    };
  }
);
