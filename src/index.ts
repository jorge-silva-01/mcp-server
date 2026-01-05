import { startMcpServer } from "./mcp/start-mcp.js";
import dotenv from "dotenv";
dotenv.config({ path: "/home/epiousion/Documents/Udemy/mcp-server/.env" });

async function bootstrap() {
  await startMcpServer();
}

bootstrap().catch((err) => {
  console.error("[BOOT] Erro fatal", err);
  process.exit(1);
});
