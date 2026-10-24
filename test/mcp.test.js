import test from 'node:test'
import assert from 'node:assert/strict'
import { fileURLToPath } from 'node:url'
import { Client } from '@modelcontextprotocol/client'
import { StdioClientTransport } from '@modelcontextprotocol/client/stdio'
import { readPlanLink } from '../utils/planLinks.js'

test('real MCP client discovers and calls tools over stdio', { timeout: 20000 }, async () => {
  const client = new Client({ name: 'dinner-test', version: '1.0.0' })
  const transport = new StdioClientTransport({ command: process.execPath,
    args: [fileURLToPath(new URL('../mcp/server.js', import.meta.url))] })
  try {
    await client.connect(transport)
    const { tools } = await client.listTools()
    assert.deepEqual(tools.map(tool => tool.name).sort(),
      ['get_dinner_options', 'find_dinners', 'suggest_plan', 'create_plan_link'].sort())
    const options = await client.callTool({ name: 'get_dinner_options', arguments: {} })
    assert.ok(options.structuredContent.tags.includes('rask'))
    const found = await client.callTool({ name: 'find_dinners', arguments: { tags: ['rask'], familyMembers: ['sloth'] } })
    assert.ok(found.structuredContent.dinners.length > 0)
    for (const dinner of found.structuredContent.dinners) {
      assert.ok(dinner.tags.includes('rask') && dinner.likedBy.includes('sloth'))
    }
    const suggested = await client.callTool({ name: 'suggest_plan', arguments: {
      startDate: '2026-10-26', quickDates: ['2026-10-27'], familyMembers: ['sloth']
    } })
    assert.equal(suggested.isError, undefined)
    const shared = readPlanLink(suggested.structuredContent.url)
    assert.equal(shared.plan.length, 7)
    assert.equal(shared.plan[1].quick, true)
    assert.deepEqual(shared.familyMembers, ['sloth'])
    const chosen = await client.callTool({ name: 'create_plan_link', arguments: {
      slots: [{ date: '2026-10-26', meal: 'Hamburger', quick: true }]
    } })
    assert.equal(readPlanLink(chosen.structuredContent.url).plan[0].dinner.name, 'Hamburger')
    for (const args of [{ startDate: '2027-02-29' }, { startDate: '2026-10-26', days: 32 },
      { startDate: '2026-10-26', quickDates: ['2026-12-01'] }]) {
      const bad = await client.callTool({ name: 'suggest_plan', arguments: args })
      assert.equal(bad.isError, true)
    }
  } finally { await client.close() }
})
