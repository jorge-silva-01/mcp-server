import { z } from "zod";
import { server } from "../../../mcp/server.js";
import { api } from "../../../http/api.client.js";

server.registerTool(
  "cnis_fast_analysis_post",
  {
    description: "Criar resultado da analise rapida.",
    inputSchema: { cnisFastAnalysisId: z.string().min(1) },
  },
  async ({ cnisFastAnalysisId }) => {
    const path = `/customer/analysis-tool/cnis-fast-analysis/${encodeURIComponent(
      cnisFastAnalysisId
    )}/result`;
    const data = await api.post(path);
    return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
  }
);
