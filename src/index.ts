import { McpServer } from "@modelcontextprotocol/server";
import {
  bookPage,
  highlightPage,
  listBooksInput,
  listHighlightsInput,
  READ_TOOL_SCOPES,
  type ReadAnywayAdapter,
} from "./contract.js";
import { readPage } from "./tool-result.js";

export {
  MAX_PAGE_SIZE,
  READ_TOOL_SCOPES,
  requiredReadScope,
} from "./contract.js";
export type {
  BookPage,
  HighlightPage,
  ListBooksInput,
  ListHighlightsInput,
  ReadAnywayAdapter,
} from "./contract.js";
export { ReadAnywayToolError } from "./tool-result.js";

export function createReadAnywayServer(options: {
  scopes: readonly string[];
  adapter: ReadAnywayAdapter;
}): McpServer {
  const { scopes, adapter } = options;
  const server = new McpServer(
    { name: "readanyway", version: "0.1.0" },
    { capabilities: { tools: { listChanged: false } } },
  );
  const annotations = { readOnlyHint: true, openWorldHint: false };
  const books = server.registerTool(
    "list_books",
    {
      description:
        "List the reader's shared books. Filter by title or author. Pass the returned cursor to continue the same search.",
      annotations,
      inputSchema: listBooksInput,
      outputSchema: bookPage,
    },
    (input) => readPage(bookPage, () => adapter.listBooks(input)),
  );
  if (!scopes.includes(READ_TOOL_SCOPES.list_books)) books.disable();
  const highlights = server.registerTool(
    "list_highlights",
    {
      description:
        "Find saved highlights in shared books by excerpt text or book ID. Return exact saved text and reader links. An unavailable location still provides a link to the saved quote.",
      annotations,
      inputSchema: listHighlightsInput,
      outputSchema: highlightPage,
    },
    (input) => readPage(highlightPage, () => adapter.listHighlights(input)),
  );
  if (!scopes.includes(READ_TOOL_SCOPES.list_highlights)) highlights.disable();
  return server;
}
