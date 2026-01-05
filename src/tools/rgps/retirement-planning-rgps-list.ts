import { z } from "zod";
import { server } from "../../mcp/server.js";
import { pool } from "../../mcp/database.js";

server.registerTool(
  "retirement_planning_rgps_list",
  {
    description:
      "Lista análises de planejamento RGPS (retirement_planning_rgps) junto do RESULT (retirement_planning_rgps_result). Retorna todos os campos whitelistados, com paginação (LIMIT/OFFSET).",
    inputSchema: z.object({
      limit: z.number().int().min(1).max(200).default(50),
      offset: z.number().int().min(0).default(0),
    }),
  },
  async ({ limit, offset }) => {
    const conn = await pool.getConnection();
    try {
      await conn.query("SET SESSION MAX_EXECUTION_TIME = 2000");

      const sql = `
        SELECT
          r.id,
          r.created_at,
          r.updated_at,
          r.deleted_at,
          r.cnis_document,
          r.retirement_planning_rgps_result_id,

          rr.id AS result_id,
          rr.created_at AS result_created_at,
          rr.updated_at AS result_updated_at,
          rr.deleted_at AS result_deleted_at,
          rr.response,
          rr.analysis,
          rr.complete_analysis

        FROM retirement_planning_rgps r
        LEFT JOIN retirement_planning_rgps_result rr
          ON rr.id = r.retirement_planning_rgps_result_id

        ORDER BY r.created_at DESC
        LIMIT ? OFFSET ?
      `;

      const [rows] = await conn.query(sql, [limit, offset]);

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(rows, null, 2),
          },
        ],
      };
    } finally {
      conn.release();
    }
  }
);
