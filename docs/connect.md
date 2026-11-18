# Connect this assistant to ReadAnyway

Use this guide when a reader asks to connect their ReadAnyway library. Set up only the client they are using. If the tools are already available, check the configured URL against the instructions for this client. When it matches, go straight to **Verify book sharing**.

| Setting            | Value                                |
| ------------------ | ------------------------------------ |
| Server name        | `readanyway`                         |
| Transport          | Streamable HTTP                      |
| Default server URL | `https://readanyway.com/api/mcp`     |
| Authorization      | OAuth authorization code with PKCE   |
| Reader permissions | `library:read` and `highlights:read` |

The reader signs in through the browser flow opened by their MCP client. Their password, authorization code and tokens stay there. The public client IDs below identify the app to ReadAnyway.

## Codex

Use Codex CLI 0.170.0 or a version that supports per-server OAuth callbacks and issuer verification. For a local Codex installation, add the two tables below to the reader’s Codex configuration, normally `~/.codex/config.toml`. For an existing ReadAnyway entry that uses the original URL, update its URL to the Codex endpoint below and start a fresh login. Keep unrelated settings and any differently configured server the reader already uses.

```toml
[mcp_servers.readanyway]
url = "https://readanyway.com/api/mcp/codex"
scopes = ["library:read", "highlights:read"]

[mcp_servers.readanyway.oauth]
client_id = "uV0bVdEptEKdSPTn"
callback_port = 43817
callback_url = "http://127.0.0.1:43817/callback"
```

Start the client’s browser login. Choose books once for this connection. Codex keeps the selection as it renews access.

```sh
codex mcp login readanyway --scopes library:read,highlights:read
```

If the current chat has no access to the reader’s installation, give them the configuration and command above. Start a fresh chat if Codex needs to reload the connection. [Codex MCP guide](https://developers.openai.com/codex/mcp/)

## Claude Code

Add ReadAnyway to the reader’s local configuration for the current project. Run the browser login, or have the reader select **readanyway → Authenticate** from `/mcp`. Reuse an existing entry for the same endpoint.

```sh
claude mcp add-json --scope local readanyway '{"type":"http","url":"https://readanyway.com/api/mcp","oauth":{"clientId":"2zTNGgBU7164OwPG","callbackPort":43818,"scopes":"library:read highlights:read"}}'
claude mcp login readanyway
```

Use the public client without a client secret. [Claude Code MCP guide](https://code.claude.com/docs/en/mcp#use-pre-configured-oauth-credentials)

## Claude on the web or desktop

If you cannot add a connector inside the chat, walk the reader through **Customize → Connectors → Add custom connector**. Use **ReadAnyway** for the name and `https://readanyway.com/api/mcp` for the remote server URL. Choose OAuth sign-in and **Use your own OAuth client**. Enter the public client ID `4Il4E3ncaPJANuOZ` and leave the secret empty. Add the connector and choose **Connect**. Some workspaces require the owner to add a connector first. [Claude custom connector guide](https://support.claude.com/en/articles/11175166-get-started-with-custom-connectors-using-remote-mcp)

## Another MCP client

For a remote HTTP client that has a registered ReadAnyway OAuth client, enter the server URL above and use that client’s registration. If the assistant only runs in the cloud and needs a new client registration, ask for its name and redirect URI and point the reader to [ReadAnyway MCP support](https://github.com/iarickvigasi/readanyway-mcp/issues).

For a desktop or terminal client that can launch local stdio tools, use the ReadAnyway local connector with Node.js 22 or later. Add this entry to its MCP settings. Start the connector, then let the reader complete sign-in in their browser. [About the HTTP bridge](https://github.com/punkpeye/mcp-remote)

```json
{
  "mcpServers": {
    "readanyway": {
      "command": "npx",
      "args": [
        "-y",
        "mcp-remote@0.16.6",
        "https://readanyway.com/api/mcp",
        "43819",
        "--static-oauth-client-info",
        "{\"client_id\":\"AgYQKTbO4ABo8kcm\"}",
        "--static-oauth-client-metadata",
        "{\"scope\":\"library:read highlights:read\",\"token_endpoint_auth_method\":\"none\"}"
      ]
    }
  }
}
```

If the assistant has neither a remote connector nor a local tool launcher, offer a client above that can connect.

## Verify book sharing

1. Once the reader has approved the permissions in the browser, call `list_books`. If it returns a sharing link, show that exact link to the reader. They choose the books, enable saved highlights if desired, and select **Approve sharing**. Signing in alone leaves the library private.
2. Call `list_books` again. A successful response can contain zero books. If the reader shares highlights, call `list_highlights` using a returned book’s `id` as `book_id`. Show the exact excerpt and citation. If the excerpt still has a location in this edition, **Continue reading here** opens the marked passage.
3. For requests covering _all_ books or highlights, follow each tool’s `next_cursor` as `cursor` with the same filters until it returns `null`. Reading, exporting to a file and sending email are separate actions. If the reader asks to send email, prepare the draft in their mail tool and get their confirmation of the recipients and message before sending.

The reader can change book selection or disconnect any time in [Connected apps](https://readanyway.com/app/connected-apps). A fresh Codex login asks the reader to approve its own book selection. Other clients may request approval again after a token renewal.
