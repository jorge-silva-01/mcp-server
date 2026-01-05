import { z } from "zod";
import { server } from "../../../mcp/server.js";
import { api } from "../../../http/api.client.js";
import { AuthSchema } from "../../../shared/auth.schema.js";
import { splitAuth } from "../../../shared/split-auth.js";

server.registerTool(
  "cnis_fast_analysis_post",
  {
    description: "Criar resultado da análise rápida.",
    inputSchema: z.object({
      cnisFastAnalysisId: z.string().min(1),
      __auth: AuthSchema,
    }),
  },
  async (input) => {
    const { __auth, args } = splitAuth(input);
    const { cnisFastAnalysisId } = args;

    const path = `/customer/analysis-tool/cnis-fast-analysis/${encodeURIComponent(
      cnisFastAnalysisId
    )}/result`;

    const data = await api.post(path, undefined, { auth: __auth });

    return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
  }
);
