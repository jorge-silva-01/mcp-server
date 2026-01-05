// src/mcp/sql-firewall.ts
import pkg from "node-sql-parser";
const { Parser } = pkg;

const parser = new Parser();

export const ALLOWED_TABLES = new Set([
  "analysis_tool_record",
  "analysis_tool_client",
  "cnis_fast_analysis",
  "cnis_fast_analysis_result",
  "legal_pleading",
  "legal_pleading_result",
  "retirement_planning_rgps",
  "retirement_planning_rgps_result",
  "retirement_planning_rgps_analysis_result",
  "conversation_tool_policy",
  "conversation",
  "customer",
  "conversation_message",
  "conversation_event",
]);

export const ALLOWED_SELECT_COLUMNS: Record<string, Set<string>> = {
  analysis_tool_record: new Set([
    "id",
    "created_at",
    "updated_at",
    "deleted_at",
    "code",
    "type",
    "cnis_fast_analysis_id",
    "status",
    "analysis_tool_client_id",
    "created_by_id",
    "updated_by_id",
  ]),

  analysis_tool_client: new Set([
    "id",
    "created_at",
    "updated_at",
    "deleted_at",
    "client_name",
    "client_type",
    "created_by_id",
    "updated_by_id",
  ]),

  cnis_fast_analysis: new Set([
    "id",
    "created_at",
    "updated_at",
    "deleted_at",
    "cnis_document",
    "cnis_fast_analysis_result_id",
  ]),

  cnis_fast_analysis_result: new Set([
    "id",
    "created_at",
    "updated_at",
    "deleted_at",
    "client_name",
    "client_federal_document",
    "client_birth_date",
    "client_last_affiliation_date",
    "cnis_simplified_analysis",
    "cnis_complete_analysis",
  ]),

  legal_pleading: new Set([
    "id",
    "created_at",
    "updated_at",
    "deleted_at",
    "code",
    "status",
    "legal_pleading_result_id",
  ]),

  legal_pleading_result: new Set([
    "id",
    "created_at",
    "updated_at",
    "deleted_at",
    "legal_pleading_simplified_analysis",
    "legal_pleading_complete_analysis",
  ]),

  retirement_planning_rgps: new Set([
    "id",
    "created_at",
    "updated_at",
    "deleted_at",
    "cnis_document",
    "retirement_planning_rgps_result_id",
  ]),

  retirement_planning_rgps_result: new Set([
    "id",
    "created_at",
    "updated_at",
    "deleted_at",
    "response",
    "analysis",
    "complete_analysis",
  ]),

  retirement_planning_rgps_analysis_result: new Set([
    "id",
    "created_at",
    "updated_at",
    "deleted_at",
    "analysis_type",
    "response",
    "retirement_planning_rgps_id",
  ]),

  conversation_tool_policy: new Set([
    "id",
    "created_at",
    "updated_at",
    "deleted_at",
    "tools_enable",
    "tool_permission",
    "default_execution_mode",
    "conversation_id",
    "persona",
    "persona_prompt",
  ]),

  conversation: new Set([
    "id",
    "created_at",
    "updated_at",
    "deleted_at",
    "assistant_type",
    "status",
    "customer_id",
  ]),

  customer: new Set(["id", "created_at", "updated_at", "deleted_at", "name"]),

  conversation_message: new Set([
    "id",
    "created_at",
    "updated_at",
    "role",
    "content",
    "conversation_id",
  ]),

  conversation_event: new Set([
    "id",
    "created_at",
    "updated_at",
    "type",
    "name",
    "payload",
    "conversation_id",
  ]),
};

export const ALLOWED_UPDATE_COLUMNS: Record<string, Set<string>> = {
  analysis_tool_record: new Set(["status", "updated_by_id"]),
  cnis_fast_analysis_result: new Set([
    "cnis_simplified_analysis",
    "cnis_complete_analysis",
  ]),
  legal_pleading_result: new Set([
    "legal_pleading_simplified_analysis",
    "legal_pleading_complete_analysis",
  ]),
  retirement_planning_rgps_result: new Set([
    "response",
    "analysis",
    "complete_analysis",
  ]),
  retirement_planning_rgps_analysis_result: new Set(["response"]),
};

function normalizeIdent(name: string) {
  return String(name ?? "")
    .replace(/`/g, "")
    .toLowerCase();
}

function fail(msg: string): never {
  throw new Error(`[SQL_FIREWALL] ${msg}`);
}

function extractTables(stmt: any): string[] {
  if (stmt.type === "select") {
    return (stmt.from ?? [])
      .map((x: any) => normalizeIdent(x?.table))
      .filter(Boolean);
  }

  if (stmt.type === "update") {
    const t = stmt.table?.[0]?.table ?? stmt.table?.table;
    return t ? [normalizeIdent(t)] : [];
  }

  return [];
}

function extractSelectColumns(stmt: any) {
  let hasStar = false;

  const cols =
    stmt.columns?.map((c: any) => {
      if (c.expr?.type === "star") {
        hasStar = true;
        return "*";
      }
      return normalizeIdent(c.expr?.column);
    }) ?? [];

  return { hasStar, cols: cols.filter(Boolean) };
}

/**
 * ============================
 * VALIDAÇÃO PRINCIPAL
 * ============================
 */
export function validateSqlOrThrow(sql: string) {
  const raw = sql.trim();

  if (
    !raw.toLowerCase().startsWith("select") &&
    !raw.toLowerCase().startsWith("update")
  ) {
    fail("Somente SELECT e UPDATE são permitidos.");
  }

  if (raw.includes(";")) fail("Sem ponto-e-vírgula.");
  if (/--|\/\*|\*\//.test(raw)) fail("Comentários SQL não permitidos.");
  if (!/\blimit\b/i.test(raw)) fail("SELECT exige LIMIT.");

  let ast;
  try {
    ast = parser.astify(raw, { database: "MySQL" });
  } catch {
    fail("SQL inválido.");
  }

  const stmt = Array.isArray(ast) ? ast[0] : ast;
  const type = normalizeIdent(stmt.type);
  const tables = extractTables(stmt);

  if (!tables.length) fail("Tabela não identificada.");

  for (const t of tables) {
    if (!ALLOWED_TABLES.has(t)) fail(`Tabela não permitida: ${t}`);
  }

  // 🔥 REGRA-CHAVE: SELECT *
  if (type === "select") {
    const { hasStar, cols } = extractSelectColumns(stmt);

    // SELECT * → entidade completa → PERMITIDO
    if (hasStar) {
      return { ok: true, type, tables, mode: "ENTITY_SELECT" };
    }

    // SELECT explícito → valida colunas
    for (const c of cols) {
      if (!ALLOWED_SELECT_COLUMNS[tables[0]]?.has(c)) {
        fail(`Coluna não permitida em SELECT: ${tables[0]}.${c}`);
      }
    }
  }

  if (type === "update") {
    const updateStmt = stmt as any;

    if (!updateStmt.where) {
      fail("UPDATE exige WHERE.");
    }

    const allowed = ALLOWED_UPDATE_COLUMNS[tables[0]];
    if (!allowed) {
      fail(`UPDATE não permitido em ${tables[0]}`);
    }

    const sets = Array.isArray(updateStmt.set) ? updateStmt.set : [];

    if (!sets.length) {
      fail("UPDATE sem colunas SET.");
    }

    for (const s of sets) {
      const col = normalizeIdent(s?.column);
      if (!allowed.has(col)) {
        fail(`Coluna não permitida em UPDATE: ${tables[0]}.${col}`);
      }
    }
  }

  return { ok: true, type, tables };
}
