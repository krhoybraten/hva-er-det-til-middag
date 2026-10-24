import { serveStdio } from '@modelcontextprotocol/server/stdio'
import { createServer } from './tools.js'

// stdout belongs exclusively to the MCP protocol.
await serveStdio(() => createServer())
