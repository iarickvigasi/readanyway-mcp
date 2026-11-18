import { Client, InMemoryTransport } from "@modelcontextprotocol/client";
import { createReadAnywayServer } from "@readanyway/mcp";

export async function connect(scopes, methods = {}) {
  const adapter = {
    async listBooks() {
      throw new Error("Unexpected listBooks call");
    },
    async listHighlights() {
      throw new Error("Unexpected listHighlights call");
    },
    ...methods,
  };
  const server = createReadAnywayServer({ scopes, adapter });
  const client = new Client(
    { name: "test-reader", version: "1" },
    { versionNegotiation: { mode: "auto" } },
  );
  const [clientTransport, serverTransport] =
    InMemoryTransport.createLinkedPair();
  await Promise.all([
    server.connect(serverTransport),
    client.connect(clientTransport),
  ]);
  return client;
}
