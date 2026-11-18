import { test } from "node:test";
import assert from "node:assert/strict";
import { requiredReadScope } from "@readanyway/mcp";
import { connect } from "./connect.mjs";

test("27-AC2 independent scopes control discovery and explicit calls", async (t) => {
  const calls = [];
  const methods = {
    async listBooks() {
      calls.push("list_books");
      return { books: [], next_cursor: null };
    },
    async listHighlights() {
      calls.push("list_highlights");
      return { highlights: [], next_cursor: null };
    },
  };
  for (const scopes of [
    [],
    ["library:read"],
    ["highlights:read"],
    ["library:read", "highlights:read"],
  ]) {
    const client = await connect(scopes, methods);
    t.after(() => client.close());
    assert.equal(client.getServerCapabilities().tools.listChanged, false);
    const listed = (await client.listTools()).tools;
    const names = ["list_books", "list_highlights"];
    assert.deepEqual(
      listed.map((tool) => tool.name).sort(),
      names.filter((name) => scopes.includes(requiredReadScope(name))),
    );
    assert.ok(listed.every((tool) => tool.annotations.readOnlyHint));
    for (const name of names) {
      calls.length = 0;
      const call = client.callTool({ name, arguments: {} });
      if (scopes.includes(requiredReadScope(name))) {
        assert.ok(!(await call).isError);
        assert.deepEqual(calls, [name]);
      } else {
        await assert.rejects(call);
        assert.deepEqual(calls, []);
      }
    }
  }
  assert.equal(requiredReadScope("constructor"), undefined);
});
