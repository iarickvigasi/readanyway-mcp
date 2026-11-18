# ReadAnyway MCP

Ask your assistant about the passages you saved in [ReadAnyway](https://readanyway.com/). You choose which books it can see and whether it can read their highlights. Each result links back to your saved quote.

> “Which of my highlights mention attention? Quote the passages exactly, group them by book, and give me a link to each one.”

[Connect Codex](#connect-codex-to-readanyway) · [Try a local example](#try-a-local-example) · [Build your own server](docs/hosting.md) · [MIT license](LICENSE)

## Connect Codex to ReadAnyway

Start with the HTTPS MCP URL supplied for your ReadAnyway account. Replace the example address below with that URL. Codex connects directly to the remote service. If your operator supplied an OAuth client ID and fixed callback address, use the [pre-registered client setup](docs/hosting.md#connect-a-pre-registered-codex-client).

```sh
READANYWAY_MCP_URL='https://reader.example.org/api/mcp'
codex mcp add readanyway --url "$READANYWAY_MCP_URL" --oauth-resource "$READANYWAY_MCP_URL"
```

1. Follow the sign-in link and approve the requested permissions in Clerk. If your client needs a separate login, run `codex mcp login readanyway --scopes library:read,highlights:read`.
2. In a Codex chat, ask **“List my shared books in ReadAnyway.”** On the first request, open the approval link from the tool. In **Connected apps**, pick the books to share or choose your whole library. Enable saved highlights if you want Codex to quote them.
3. Ask again. Try **“Show me one saved highlight from the first book that has one.”** Open the returned link while signed in to ReadAnyway. When the current edition matches the saved location, **Continue reading here** takes you to the passage.

Change the selection or disconnect the assistant from your ReadAnyway account menu under **Connected apps**. Disconnecting stops future reads. An assistant can retain excerpts it has already received. The pilot requires fresh approval when the connector gets a replacement access token. [Codex MCP guide](https://developers.openai.com/codex/mcp/)

<details>
<summary>Connect Claude Code or another MCP client</summary>

Use the same hosted URL with a client that supports Streamable HTTP and OAuth. For Claude Code, run the following command, then open `/mcp` to authenticate. [Claude Code MCP guide](https://code.claude.com/docs/en/mcp)

```sh
claude mcp add --transport http readanyway https://reader.example.org/api/mcp
```

For a client that launches local stdio processes, replace the example URL in this configuration. The bridge connects to the hosted service and handles browser sign-in.

```json
{
  "mcpServers": {
    "readanyway": {
      "command": "npx",
      "args": ["-y", "mcp-remote@0.16.6", "https://reader.example.org/api/mcp"]
    }
  }
}
```

</details>

## What your assistant can read

| Tool              | Permission        | What it returns                                                                                                                         |
| ----------------- | ----------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| `list_books`      | `library:read`    | IDs, titles, and authors of shared books, including books without highlights. Optional `query` matches a title or author.               |
| `list_highlights` | `highlights:read` | Exact saved excerpts, book titles, dates, and citation links. Use `book_id` to choose a shared book and `query` to search its excerpts. |

Both tools read synced data. To continue a search, pass its `next_cursor` back as `cursor` with the same filters. A final page returns `null`. A citation still opens the saved quote when its original location in the book is unavailable.

## Try a local example

You can explore both tools with a fictional book before connecting a ReadAnyway account. Install Node.js 22 or later and the Codex CLI, then run:

```sh
git clone https://github.com/iarickvigasi/readanyway-mcp.git
cd readanyway-mcp
npm ci
npm run build
codex mcp add readanyway-demo -- node "$PWD/examples/local-library.mjs"
```

Open a Codex chat and ask **“Use readanyway-demo to find my highlight about a pear tree.”** The result includes _“I learned the pear tree by the shape of its shadow.”_ The demo uses a placeholder citation on `example.org`. Use a hosted account to open a real saved highlight. [Local example source](examples/local-library.mjs)

## Use the TypeScript package

`@readanyway/mcp` supplies the tool schemas and the MCP server factory. An adapter supplies the books and highlights. To install the package before its first npm release, build the archive in this checkout:

```sh
npm ci
npm test
npm pack
```

In your own project, install the resulting file with `npm install /path/to/readanyway-mcp-0.1.0.tgz`. The package includes TypeScript declarations and supports ES modules and CommonJS. [Hosting guide](docs/hosting.md) · [Release guide](docs/releasing.md) · [Report an issue](https://github.com/iarickvigasi/readanyway-mcp/issues)
