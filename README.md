# ReadAnyway MCP

Ask your assistant about the passages you saved in [ReadAnyway](https://readanyway.com/). You choose which books it can see and whether it can read their highlights. Each result links back to your saved quote.

> “Which of my highlights mention attention? Quote the passages exactly, group them by book, and give me a link to each one.”

[Connect Codex](#connect-codex-to-readanyway) · [Try a local example](#try-a-local-example) · [Build your own server](docs/hosting.md) · [MIT license](LICENSE)

## Connect Codex to ReadAnyway

Use your [ReadAnyway staging account](https://staging.readanyway.com/) for the hosted pilot. Staging has its own accounts and books. We tested **Codex CLI 0.170.0** from Clerk sign-in to opening a saved passage in the reader. Codex could read the selected book, could not retrieve the withheld book, and lost access after disconnect.

Add these two tables to `~/.codex/config.toml`. If you already configured `readanyway-staging`, update its existing entries. The callback settings apply only to this connection.

```toml
[mcp_servers.readanyway-staging]
url = "https://staging.readanyway.com/api/mcp"
scopes = ["library:read", "highlights:read"]

[mcp_servers.readanyway-staging.oauth]
client_id = "TYCX8NjUXB9jz6sL"
callback_port = 43817
callback_url = "http://127.0.0.1:43817/callback"
```

The client ID is public and identifies Codex on staging. Codex discovers the OAuth resource from the server. Start the browser login from the terminal.

```sh
codex mcp login readanyway-staging --scopes library:read,highlights:read
```

1. Sign in to Clerk and approve the requested permissions for **Codex — ReadAnyway Staging**. Return to Codex when the browser finishes.
2. In a new Codex chat, ask **“Use readanyway-staging to list my shared books.”** On the first data request, open the approval link from the tool. In **Connected apps**, pick the books to share or choose your whole library. Enable saved highlights if you want Codex to quote them.
3. Ask again. Try **“Show me one saved highlight from the first book that has one.”** Open the returned link while signed in to staging. When the current edition matches the saved location, **Continue reading here** takes you to the passage.

If Codex reports a missing issuer after browser consent, check `codex --version`. Version 0.144.5 lost the issuer from the callback in our test. Version 0.170.0 completed the same flow. [Upstream Codex issue](https://github.com/openai/codex/issues/33354) · [Configure your own host](docs/hosting.md#connect-a-pre-registered-codex-client)

Change the selection or disconnect the assistant from your ReadAnyway account menu under **Connected apps**. Disconnecting stops future reads. An assistant can retain excerpts it has already received. The pilot requires fresh approval when the connector gets a replacement access token. [Codex MCP guide](https://developers.openai.com/codex/mcp/)

<details>
<summary>Connect Claude Code or another MCP client</summary>

The staging pilot has a registered client for Codex. For another client, use a host that supports its OAuth registration and replace the example URL below. For Claude Code, run the following command, then open `/mcp` to authenticate. [Claude Code MCP guide](https://code.claude.com/docs/en/mcp)

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
