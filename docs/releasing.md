# Prepare an npm release

Use Node.js 22 or later and the package lockfile in a checkout of the standalone [ReadAnyway MCP repository](https://github.com/iarickvigasi/readanyway-mcp). From its root, run:

```sh
npm ci
npm test
npm pack
npm publish --dry-run --access public ./readanyway-mcp-0.1.0.tgz
```

Use the filename printed by `npm pack` when preparing a different version. Inspect the archive with `tar -tzf ./readanyway-mcp-0.1.0.tgz`. Install that file into a separate project and import `@readanyway/mcp` to verify the artifact independently of the checkout.

An authorized maintainer of the `@readanyway` npm scope can publish the reviewed archive by running `npm publish --access public ./readanyway-mcp-0.1.0.tgz`. npm publication and GitHub pushes are separate actions. [npm package publishing guide](https://docs.npmjs.com/cli/v11/commands/npm-publish/)
