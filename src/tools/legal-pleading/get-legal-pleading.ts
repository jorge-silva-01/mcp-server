import { z } from "zod";
import { server } from "../../mcp/server.js";
import { api } from "../../http/api.client.js";
import { AuthSchema } from "../../shared/auth.schema.js";
import { splitAuth } from "../../shared/split-auth.js";

server.registerTool(
  "legal_pleading_get",
  {
    description: "Retorna uma peça processual por ID.",
    inputSchema: z.object({
      legalPleadingId: z.string().min(1),
      __auth: AuthSchema,
    }),
  },
  async (input) => {
    const { __auth, args } = splitAuth(input);
    const { legalPleadingId } = args;

    const path = `/customer/analysis-tool/legal-pleading/${encodeURIComponent(
      legalPleadingId
    )}`;

    const data = await api.get(path, { auth: __auth });

    return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
  }
);
