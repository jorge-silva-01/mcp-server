import { z } from "zod";
import { server } from "../../../mcp/server.js";
import { api } from "../../../http/api.client.js";

import FormData from "form-data";
import fs from "node:fs";

server.registerTool(
  "cnis_fast_analysis_patch",
  {
    description:
      "Atualizar análise rápida de CNIS (PATCH multipart/form-data).",
    inputSchema: z.object({
      cnisFastAnalysisId: z.string().min(1),
      json: z.record(z.string(), z.unknown()).optional(),
      cnisDocumentPath: z.string().min(1).optional(),
    }),
  },
  async ({ cnisFastAnalysisId, json, cnisDocumentPath }) => {
    const path = `/customer/analysis-tool/cnis-fast-analysis/${encodeURIComponent(
      cnisFastAnalysisId
    )}`;

    const form = new FormData();

    if (json) {
      // Swagger normalmente espera "json" como string no multipart
      form.append("json", JSON.stringify(json), {
        contentType: "application/json",
      });
    }

    if (cnisDocumentPath) {
      form.append("cnisDocument", fs.createReadStream(cnisDocumentPath), {
        filename: "cnis.pdf",
        contentType: "application/pdf",
      });
    }

    if (!json && !cnisDocumentPath) {
      return {
        content: [{ type: "text", text: "Nada para atualizar." }],
        isError: true,
      };
    }

    const data = await api.patch(path, form);

    return {
      content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
    };
  }
);
