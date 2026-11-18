import { z } from "zod";

export const READ_TOOL_SCOPES = Object.freeze({
  list_books: "library:read",
  list_highlights: "highlights:read",
} as const);

const scopesByName = new Map<string, ReadScope>(
  Object.entries(READ_TOOL_SCOPES),
);
type ReadScope = (typeof READ_TOOL_SCOPES)[keyof typeof READ_TOOL_SCOPES];

export function requiredReadScope(toolName: string): ReadScope | undefined {
  return scopesByName.get(toolName);
}

export const MAX_PAGE_SIZE = 50;
const cursor = z.string().min(1).max(2048);
const id = z.string().min(1).max(256);
export const listBooksInput = z.strictObject({
  query: z.string().trim().min(1).max(200).optional(),
  cursor: cursor.optional(),
});
export const listHighlightsInput = listBooksInput.extend({
  book_id: id.optional(),
});

const book = z.object({
  id,
  title: z.string(),
  authors: z.array(z.string()),
});
const highlight = z.object({
  id,
  book_id: id,
  book_title: z.string(),
  excerpt: z.string().min(1).max(2048),
  color: z.string().nullable(),
  created_at: z.iso.datetime({ offset: true }),
  chapter: z.string().nullable(),
  location_status: z.enum(["available", "unavailable"]),
  url: z.url({ protocol: /^https?$/ }),
});
export const bookPage = z.object({
  books: z.array(book).max(MAX_PAGE_SIZE),
  next_cursor: cursor.nullable(),
});
export const highlightPage = z.object({
  highlights: z.array(highlight).max(MAX_PAGE_SIZE),
  next_cursor: cursor.nullable(),
});
export type ListBooksInput = z.infer<typeof listBooksInput>;
export type ListHighlightsInput = z.infer<typeof listHighlightsInput>;
export type BookPage = z.infer<typeof bookPage>;
export type HighlightPage = z.infer<typeof highlightPage>;
export type ReadAnywayAdapter = {
  listBooks(input: ListBooksInput): Promise<BookPage>;
  listHighlights(input: ListHighlightsInput): Promise<HighlightPage>;
};
