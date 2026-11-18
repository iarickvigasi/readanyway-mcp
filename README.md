<a name="readanyway-mcp"></a>

# ![ReadAnyway MCP](docs/assets/readanyway-mcp.webp)

Give your assistant read-only access to the books and highlights you choose to share from [ReadAnyway](https://readanyway.com/). Ask it to gather all the passages you’ve highlighted in [your library](https://readanyway.com/app/library). It can trace an idea across authors, turn your favorite passages into Markdown for your reading notes, or suggest what to read next based on what you underlined.

<a name="connect-codex-to-readanyway"></a>

## Add ReadAnyway to your assistant

Copy this link and paste it into Codex, Claude, or another assistant that supports MCP.

```text
https://raw.githubusercontent.com/iarickvigasi/readanyway-mcp/main/docs/connect.md
```

If your assistant asks what to do with the link, say “Connect my ReadAnyway library.” It can add the connection or show you where to click. You sign in and choose which books and highlights to share.

## What to ask

- “Look through my library and highlights. What book should I read next? Show me what I underlined that made you pick it.”
- “Email all my highlights to all my enemies. Maybe they’ll learn something.”

For the second one, your assistant also needs an email connection.

<a name="what-your-assistant-can-read"></a>

## Available tools

| Tool | What your assistant gets |
| --- | --- |
| `list_books` | Titles and authors of the books you share. |
| `list_highlights` | Exact saved passages from those books, each with a link back to the highlight. |

Change what you share or disconnect an assistant in [Connected apps](https://readanyway.com/app/connected-apps).

<a name="try-a-local-example"></a>
<a name="try-the-local-demo"></a>
<a name="use-the-typescript-package"></a>

## Build with the package

Use the TypeScript server with your own book data, or try it with a fictional library on your computer. [Run the local demo](docs/hosting.md#try-the-local-demo) · [Host the tools](docs/hosting.md) · [Prepare a release](docs/releasing.md) · [MIT license](LICENSE)
