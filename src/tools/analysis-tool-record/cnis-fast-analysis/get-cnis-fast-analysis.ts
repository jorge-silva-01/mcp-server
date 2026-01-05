import { z } from "zod";
import { server } from "../../../mcp/server.js";
import { api } from "../../../http/api.client.js";

server.registerTool(
  "cnis_fast_analysis_get",
  {
    description: "Dados da análise rápida de CNIS retornados com sucesso.",
    inputSchema: { cnisFastAnalysisId: z.string().min(1) },
  },
  async ({ cnisFastAnalysisId }) => {
    const path = `/customer/analysis-tool/cnis-fast-analysis/${encodeURIComponent(
      cnisFastAnalysisId
    )}`;
    const data = await api.get(path);
    return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
  }
);
