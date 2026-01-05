// src/tools/db/db-schema-describe.ts
import { server } from "../../mcp/server.js";
import {
  ALLOWED_TABLES,
  ALLOWED_SELECT_COLUMNS,
  ALLOWED_UPDATE_COLUMNS,
} from "../../mcp/sql-firewall.js";

server.registerTool(
  "db_schema_describe",
  {
    description:
      "Retorna o schema permitido do banco (tabelas, colunas e regras). Uso exclusivo para planejamento de queries.",
    inputSchema: {},
  },
  async () => {
    const schema = Array.from(ALLOWED_TABLES).map((table) => ({
      table,
      selectColumns: Array.from(ALLOWED_SELECT_COLUMNS[table] ?? []),
      updateColumns: Array.from(ALLOWED_UPDATE_COLUMNS[table] ?? []),
      mode:
        (ALLOWED_UPDATE_COLUMNS[table]?.size ?? 0) > 0
          ? "EDITABLE"
          : "READ_ONLY",
    }));

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(schema, null, 2),
        },
      ],
    };
  }
);
