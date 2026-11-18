import { serveStdio } from "@modelcontextprotocol/server/stdio";
import { createReadAnywayServer, ReadAnywayToolError } from "@readanyway/mcp";

const book = {
  id: "orchard",
  title: "The Orchard Notebook",
  authors: ["A. Reed"],
};
const highlight = {
  id: "h1",
  book_id: book.id,
  book_title: book.title,
  excerpt: "I learned the pear tree by the shape of its shadow.",
  color: null,
  created_at: "2026-10-01T10:00:00Z",
  chapter: "Afternoon",
  location_status: "unavailable",
  url: "https://example.org/app/highlights/orchard/h1",
};

function matches(text, query = "") {
  return text.toLowerCase().includes(query.toLowerCase());
}

serveStdio(() =>
  createReadAnywayServer({
    scopes: ["library:read", "highlights:read"],
    adapter: {
      async listBooks({ query, cursor }) {
        if (cursor) throw new ReadAnywayToolError("INVALID_CURSOR");
        const found = [book.title, ...book.authors].some((text) =>
          matches(text, query),
        );
        return { books: found ? [book] : [], next_cursor: null };
      },
      async listHighlights({ query, book_id, cursor }) {
        if (cursor) throw new ReadAnywayToolError("INVALID_CURSOR");
        const found =
          (!book_id || book_id === book.id) &&
          matches(highlight.excerpt, query);
        return { highlights: found ? [highlight] : [], next_cursor: null };
      },
    },
  }),
);
