import { z } from "zod";
import { server } from "../../mcp/server.js";
import { pool } from "../../mcp/database.js";

server.registerTool(
  "retirement_planning_rgps_get",
  {
    description:
      "Busca uma análise RGPS por retirement_planning_rgps.id, retornando todos os campos whitelistados do RGPS e do RESULT.",
    inputSchema: z.object({
      retirementPlanningRgpsId: z.string().min(1),
    }),
  },
  async ({ retirementPlanningRgpsId }) => {
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

        WHERE r.id = ?
        LIMIT 1
      `;

      const [rows] = await conn.query(sql, [retirementPlanningRgpsId]);
      const row = Array.isArray(rows) ? rows[0] ?? null : null;

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(row, null, 2),
          },
        ],
      };
    } finally {
      conn.release();
    }
  }
);
