import { z } from "zod";
import { server } from "../../../mcp/server.js";
import { api } from "../../../http/api.client.js";

server.registerTool(
  "cnis_fast_analysis_patch_complete_analysis",
  {
    description:
      "Atualizar texto completo da análise rápida de CNIS (cnisCompleteAnalysis). Envia PATCH JSON para /complete-analysis.",
    inputSchema: z.object({
      cnisFastAnalysisId: z.string().min(1),
      cnisCompleteAnalysis: z.string().min(1),
    }),
  },
  async ({ cnisFastAnalysisId, cnisCompleteAnalysis }) => {
    const path = `/customer/analysis-tool/cnis-fast-analysis/${encodeURIComponent(
      cnisFastAnalysisId
    )}/complete-analysis`;

    const payload = {
      cnisCompleteAnalysis,
    };

    const data = await api.patch(path, payload, {
      headers: { "Content-Type": "application/json" },
    });

    return {
      content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
    };
  }
);
