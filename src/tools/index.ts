console.log("[MCP] Registrando tools...");

import "./legal-pleading/list-legal-pleading.js";
import "./legal-pleading/get-legal-pleading.js";
import "./legal-pleading/patch-legal-pleading-complete-analysis.js";

import "./analysis-tool-record/cnis-fast-analysis/get-cnis-fast-analysis.js";
import "./analysis-tool-record/cnis-fast-analysis/patch-cnis-fast-analysis.js";
import "./analysis-tool-record/cnis-fast-analysis/patch-cnis-fast-analysis-complete-analysis.js";
import "./analysis-tool-record/cnis-fast-analysis/cnis-fast-analysis-result.js";

import "./analysis-tool-record/list-analysis-tool-record.js";
import "./analysis-tool-client/list-analysis-tool-client.js";
import "./analysis-tool-client/get-analysis-tool-client.js";

import "./db/db-sql-execute.js";
import "./db/db-schema-describe.js";

console.log("[MCP] Tools registradas com sucesso");
