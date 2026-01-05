import { z } from "zod";
import { server } from "../../mcp/server.js";
import { api } from "../../http/api.client.js";
import { AuthSchema } from "../../shared/auth.schema.js";
import { splitAuth } from "../../shared/split-auth.js";

server.registerTool(
  "analysis_tool_client_get",
  {
    description: "Retorna cliente da análise pelo ID.",
    inputSchema: z.object({
      analysisToolClientId: z.string().min(1),
      __auth: AuthSchema,
    }),
  },
  async (input) => {
    const { __auth, args } = splitAuth(input);
    const { analysisToolClientId } = args;

    const path = `/customer/analysis-tool/analysis-tool-client/${encodeURIComponent(
      analysisToolClientId
    )}`;

    const data = await api.get(path, { auth: __auth });

    return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
  }
);
