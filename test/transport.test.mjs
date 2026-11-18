import { test } from "node:test";
import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import { Client } from "@modelcontextprotocol/client";
import { StdioClientTransport } from "@modelcontextprotocol/client/stdio";
import { McpServer } from "@modelcontextprotocol/server";
import { createReadAnywayServer } from "@readanyway/mcp";

test("27-AC6 CommonJS and ES modules share the SDK constructor of each consumer", () => {
  const require = createRequire(import.meta.url);
  const options = { scopes: [], adapter: {} };
  assert.ok(createReadAnywayServer(options) instanceof McpServer);
  assert.ok(
    require("@readanyway/mcp").createReadAnywayServer(options) instanceof
      require("@modelcontextprotocol/server").McpServer,
  );
});

test("27-AC6 stdio clients discover and call both tools", async (t) => {
  for (const mode of ["auto", "legacy"]) {
    const client = new Client(
      { name: "reader", version: "1" },
      { versionNegotiation: { mode } },
    );
    t.after(() => client.close());
    await client.connect(
      new StdioClientTransport({
        command: process.execPath,
        args: [
          fileURLToPath(
            new URL("../examples/local-library.mjs", import.meta.url),
          ),
        ],
      }),
    );
    assert.deepEqual(
      (await client.listTools()).tools.map((tool) => tool.name).sort(),
      ["list_books", "list_highlights"],
    );
    const books = await client.callTool({ name: "list_books", arguments: {} });
    assert.deepEqual(books.structuredContent.books[0], {
      id: "orchard",
      title: "The Orchard Notebook",
      authors: ["A. Reed"],
    });
    const highlights = await client.callTool({
      name: "list_highlights",
      arguments: { book_id: "orchard", query: "pear tree" },
    });
    assert.deepEqual(
      highlights.structuredContent.highlights.map((row) => row.excerpt),
      ["I learned the pear tree by the shape of its shadow."],
    );
    assert.equal(highlights.structuredContent.next_cursor, null);
  }
});
