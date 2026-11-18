import { test } from "node:test";
import assert from "node:assert/strict";
import { MAX_PAGE_SIZE, ReadAnywayToolError } from "@readanyway/mcp";
import { connect } from "./connect.mjs";

test("27-AC1 pending sharing gives the credential-specific approval URL", async (t) => {
  const url =
    "https://reader.example.org/app/connected-apps?connection=example";
  const client = await connect(["highlights:read"], {
    async listHighlights() {
      throw new ReadAnywayToolError("SHARING_REQUIRED", url);
    },
  });
  t.after(() => client.close());
  const answer = await client.callTool({
    name: "list_highlights",
    arguments: {},
  });
  assert.equal(answer.isError, true);
  assert.ok(answer.content[0].text.includes(url));
});

test("27-AC4 invalid cursors and disconnections give actionable errors", async (t) => {
  for (const [code, expected] of [
    ["INVALID_CURSOR", /without a cursor/],
    ["CONNECTION_REVOKED", /Reconnect/],
  ]) {
    const client = await connect(["library:read"], {
      async listBooks() {
        throw new ReadAnywayToolError(code);
      },
    });
    t.after(() => client.close());
    const answer = await client.callTool({ name: "list_books", arguments: {} });
    assert.equal(answer.isError, true);
    assert.match(answer.content[0].text, expected);
  }
});

test("27-AC2 private adapter errors, oversized pages, and unsafe setup URLs stay private", async (t) => {
  const listMethods = [
    async () => {
      throw new Error("secret database details");
    },
    async () => ({
      books: Array.from({ length: MAX_PAGE_SIZE + 1 }, () => ({
        id: "1",
        title: "secret",
        authors: [],
      })),
      next_cursor: null,
    }),
    async () => {
      throw new ReadAnywayToolError(
        "SHARING_REQUIRED",
        "https://secret@reader.example.org/app/connected-apps",
      );
    },
  ];
  for (const listBooks of listMethods) {
    const client = await connect(["library:read"], { listBooks });
    t.after(() => client.close());
    const answer = await client.callTool({ name: "list_books", arguments: {} });
    assert.equal(answer.isError, true);
    assert.doesNotMatch(JSON.stringify(answer), /secret/);
  }
});
