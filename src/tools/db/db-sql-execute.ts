// src/tools/db/db-sql-execute.ts
import { z } from "zod";
import { server } from "../../mcp/server.js";
import { pool } from "../../mcp/database.js";
import { validateSqlOrThrow } from "../../mcp/sql-firewall.js";

server.registerTool(
  "db_sql_execute",
  {
    description:
      "Executa SQL (gerado pela LLM) com validação rígida. Apenas SELECT/UPDATE, tabelas/colunas whitelistadas, LIMIT obrigatório, WHERE obrigatório em UPDATE.",
    inputSchema: z.object({
      sql: z.string().min(1),
      params: z.array(z.any()).optional(),
    }),
  },
  async ({ sql, params }) => {
    const meta = validateSqlOrThrow(sql);

    const conn = await pool.getConnection();
    try {
      await conn.query("SET SESSION MAX_EXECUTION_TIME = 2000");

      const [rows] = await conn.query(sql, params ?? []);

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({ meta, rows }, null, 2),
          },
        ],
      };
    } finally {
      conn.release();
    }
  }
);
