import { z } from "zod";
import { server } from "../../mcp/server.js";
import { api } from "../../http/api.client.js";

server.registerTool(
  "analysis_tool_client_list",
  {
    description:
      "Lista de registros de análises retornada com sucesso (analysis-tool-record).",
    inputSchema: {
      page: z.number().int().min(1).optional(),
      limit: z.number().int().min(1).max(100).optional(),
      search: z.string().min(1).optional(),
      sortField: z.string().min(1).optional(),
      field: z.string().min(1).optional(),
      status: z.string().optional(),
    },
  },
  async ({ page, limit, search, sortField, field, status }) => {
    const params = new URLSearchParams();

    if (typeof page === "number") params.set("page", String(page));
    if (typeof limit === "number") params.set("limit", String(limit));
    if (typeof search === "string") params.set("search", search);
    if (typeof sortField === "string") params.set("sortField", sortField);
    if (typeof field === "string") params.set("field", field);
    if (typeof status === "string") params.set("status", status);

    const path = `/customer/analysis-tool/analysis-tool-client${
      params.toString() ? `?${params.toString()}` : ""
    }`;

    const data = await api.get(path);

    return {
      content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
    };
  }
);
