import { z } from "zod";
import { server } from "../../../mcp/server.js";
import { api } from "../../../http/api.client.js";

import FormData from "form-data";
import fs from "node:fs";
import { AuthSchema } from "../../../shared/auth.schema.js";
import { splitAuth } from "../../../shared/split-auth.js";

server.registerTool(
  "cnis_fast_analysis_patch",
  {
    description:
      "Atualizar análise rápida de CNIS (PATCH multipart/form-data).",
    inputSchema: z.object({
      cnisFastAnalysisId: z.string().min(1),
      json: z.record(z.string(), z.unknown()).optional(),
      cnisDocumentPath: z.string().min(1).optional(),
      __auth: AuthSchema,
    }),
  },
  async (input) => {
    const { __auth, args } = splitAuth(input);
    const { cnisFastAnalysisId, json, cnisDocumentPath } = args;

    const path = `/customer/analysis-tool/cnis-fast-analysis/${encodeURIComponent(
      cnisFastAnalysisId
    )}`;

    const form = new FormData();

    if (typeof json !== "undefined") {
      form.append("json", JSON.stringify(json), {
        contentType: "application/json",
      });
    }

    if (typeof cnisDocumentPath === "string" && cnisDocumentPath.length > 0) {
      form.append("cnisDocument", fs.createReadStream(cnisDocumentPath), {
        filename: "cnis.pdf",
        contentType: "application/pdf",
      });
    }

    if (
      typeof json === "undefined" &&
      typeof cnisDocumentPath === "undefined"
    ) {
      return {
        content: [{ type: "text", text: "Nada para atualizar." }],
        isError: true,
      };
    }

    const data = await api.patch(path, form, { auth: __auth });

    return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
  }
);
