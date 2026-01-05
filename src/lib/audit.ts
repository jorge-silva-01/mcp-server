export function audit(tool: string, payload: unknown) {
  console.log(
    JSON.stringify({
      source: "mcp-server",
      tool,
      payload,
      executedAt: new Date().toISOString(),
      pid: process.pid,
    })
  );
}
