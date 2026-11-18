import { test } from "node:test";
import assert from "node:assert/strict";
import { connect } from "./connect.mjs";

test("27-AC3 projected output and cursor preserve exact excerpts and saved-quote links", async (t) => {
  const highlight = {
    id: "h1",
    book_id: "b1",
    book_title: "Travel",
    excerpt: "line one\n  line two",
    color: null,
    created_at: "2026-11-18T00:00:00Z",
    chapter: null,
    location_status: "unavailable",
    url: "https://example.org/app/books/b1/reader?highlight=h1",
  };
  const input = { book_id: "b1", query: "line", cursor: "opaque" };
  const client = await connect(["highlights:read"], {
    async listHighlights(received) {
      assert.deepEqual(received, input);
      return {
        highlights: [{ ...highlight, privateAnnotation: "secret" }],
        next_cursor: "next",
        owner: "secret",
      };
    },
  });
  t.after(() => client.close());
  const answer = await client.callTool({
    name: "list_highlights",
    arguments: input,
  });
  assert.deepEqual(answer.structuredContent, {
    highlights: [highlight],
    next_cursor: "next",
  });
  assert.deepEqual(
    JSON.parse(answer.content[0].text),
    answer.structuredContent,
  );
});

test("27-AC2 invalid and unknown input never reaches library reads", async (t) => {
  let calls = 0;
  const client = await connect(["library:read"], {
    async listBooks() {
      calls++;
      return { books: [], next_cursor: null };
    },
  });
  t.after(() => client.close());
  for (const input of [
    { account_id: "another" },
    { query: " " },
    { query: "x".repeat(201) },
    { cursor: "x".repeat(2049) },
  ]) {
    assert.equal(
      (await client.callTool({ name: "list_books", arguments: input })).isError,
      true,
    );
  }
  assert.equal(calls, 0);
});
