import * as z from 'zod/v4'
import { McpServer } from '@modelcontextprotocol/server'
import { dinnerData, familyMembers } from '../data/dinnerData.js'
import { extractDistinctTags, findDinners } from '../utils/dinnerUtils.js'
import { createPlanner, datePlusDays } from '../utils/planUtils.js'
import { createPlanLink, isCalendarDate, DEFAULT_APP_URL } from '../utils/planLinks.js'

const date = z.string().refine(isCalendarDate, 'Use a real date in YYYY-MM-DD format')
const members = z.array(z.enum(familyMembers.map(member => member.id))).max(familyMembers.length).default([])
const tags = extractDistinctTags(dinnerData)
const slotSchema = z.object({
  date,
  meal: z.enum(dinnerData.map(dinner => dinner.name)).nullable(),
  quick: z.boolean().default(false),
  recipeUrl: z.string().max(2000).optional()
})
const annotations = { readOnlyHint: true, destructiveHint: false, openWorldHint: false }
const result = output => ({ content: [{ type: 'text', text: JSON.stringify(output) }], structuredContent: output })

function planResult(plan, selectedMembers, appUrl) {
  return {
    plan: plan.map(slot => ({ date: slot.date, meal: slot.dinner?.name ?? null,
      quick: slot.quick, recipeUrl: slot.selectedRecipeUrl ?? null })),
    familyMembers: selectedMembers,
    url: createPlanLink(plan, selectedMembers, appUrl),
    warnings: plan.filter(slot => !slot.dinner).map(slot => `No matching dinner for ${slot.date}.`)
  }
}

export function createServer({ appUrl = process.env.DINNER_APP_URL || DEFAULT_APP_URL } = {}) {
  const server = new McpServer({ name: 'hva-er-det-til-middag', version: '1.0.0' })
  const register = (name, description, schema, handler) => server.registerTool(name, {
    description, inputSchema: schema, annotations
  }, async args => {
    try { return result(handler(args)) }
    catch (error) { return { content: [{ type: 'text', text: error.message }], isError: true } }
  })

  register('get_dinner_options', 'List available dinner tags and family member IDs with their emoji labels. Family identity is not inferred from the emoji.',
    z.object({}), () => ({ tags, familyMembers }))

  register('find_dinners', 'Find saved dinners matching ALL requested tags and liked by ALL selected family members. Returns recipe links. Empty filters list all dinners.',
    z.object({ tags: z.array(z.enum(tags)).default([]), familyMembers: members }),
    args => ({ dinners: findDinners(dinnerData, args.tags, args.familyMembers) }))

  register('suggest_plan', 'Suggest 1–31 dated dinners and return a link that opens this plan in the webapp. Respects family preferences and quick days, avoids duplicates, and tries for two fish meals and one vegetarian meal per seven days. Variety targets are best effort. Does not save or alter an open browser plan.',
    z.object({ startDate: date, days: z.number().int().min(1).max(31).default(7),
      quickDates: z.array(date).max(31).default([]), familyMembers: members }),
    ({ startDate, days, quickDates, familyMembers: selectedMembers }) => {
      const plan = Array.from({ length: days }, (_, index) => ({
        date: datePlusDays(startDate, index), dinner: null, selectedRecipeUrl: null,
        quick: quickDates.includes(datePlusDays(startDate, index))
      }))
      if (quickDates.some(value => !plan.some(slot => slot.date === value))) {
        throw new Error('Every quick date must be within the requested plan.')
      }
      return planResult(createPlanner(selectedMembers).fillPlan(plan), selectedMembers, appUrl)
    })

  register('create_plan_link', 'Create a webapp link for an explicitly chosen plan, including recipe choices and empty days. Use exact meal names returned by find_dinners. The link contains the plan; it does not update an open browser tab or a database.',
    z.object({ slots: z.array(slotSchema).min(1).max(31), familyMembers: members }),
    ({ slots, familyMembers: selectedMembers }) => {
      const plan = slots.map(slot => {
        const dinner = dinnerData.find(item => item.name === slot.meal) ?? null
        if (dinner && selectedMembers.some(member => !dinner.likedBy?.includes(member))) {
          throw new Error(`${dinner.name} is not liked by all selected family members.`)
        }
        if (dinner && slot.quick && !dinner.tags.includes('rask')) {
          throw new Error(`${dinner.name} is not a quick dinner.`)
        }
        return { date: slot.date, quick: slot.quick, dinner,
          selectedRecipeUrl: slot.recipeUrl ?? dinner?.recipeUrls?.[0]?.url ?? null }
      })
      return planResult(plan, selectedMembers, appUrl)
    })
  return server
}
