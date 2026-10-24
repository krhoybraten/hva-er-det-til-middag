import { dinnerData, familyMembers } from '../data/dinnerData.js'

export const DEFAULT_APP_URL = 'https://krhoybraten.github.io/hva-er-det-til-middag/'
const MAX_LENGTH = 40000
const knownMembers = new Set(familyMembers.map(member => member.id))

export function isCalendarDate(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false
  const date = new Date(`${value}T12:00:00Z`)
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value
}

function validate(payload) {
  if (!payload || payload.v !== 1 || !Array.isArray(payload.days) ||
      payload.days.length < 1 || payload.days.length > 31 ||
      !Array.isArray(payload.family) || payload.family.length > knownMembers.size ||
      payload.family.some(member => !knownMembers.has(member))) {
    throw new Error('Invalid shared plan')
  }
  const dates = new Set()
  const plan = payload.days.map(day => {
    if (!day || !isCalendarDate(day.date) || dates.has(day.date) || typeof day.quick !== 'boolean') {
      throw new Error('Invalid plan date or quick day')
    }
    dates.add(day.date)
    const dinner = day.meal === null ? null : dinnerData.find(item => item.name === day.meal)
    if (day.meal !== null && !dinner) throw new Error('Unknown dinner')
    if (day.recipe !== null && !dinner?.recipeUrls?.some(recipe => recipe.url === day.recipe)) {
      throw new Error('Unknown recipe for dinner')
    }
    return { date: day.date, quick: day.quick, dinner,
      selectedRecipeUrl: day.recipe ?? dinner?.recipeUrls?.[0]?.url ?? null }
  })
  return { plan, familyMembers: [...new Set(payload.family)] }
}

export function createPlanLink(plan, selectedFamilyMembers = [], appUrl = DEFAULT_APP_URL) {
  const payload = { v: 1, family: selectedFamilyMembers, days: plan.map(slot => ({
    date: slot.date, meal: slot.dinner?.name ?? null, quick: Boolean(slot.quick),
    recipe: slot.selectedRecipeUrl ?? null
  })) }
  validate(payload)
  const encoded = encodeURIComponent(JSON.stringify(payload))
  if (encoded.length > MAX_LENGTH) throw new Error('Plan link is too long')
  const url = new URL(appUrl)
  if (!['http:', 'https:'].includes(url.protocol)) throw new Error('Invalid app URL')
  url.hash = `plan=${encoded}`
  return url.href
}

export function readPlanLink(appUrl) {
  const hash = new URL(appUrl).hash
  if (!hash.startsWith('#plan=')) return null
  if (hash.length > MAX_LENGTH + 6) throw new Error('Plan link is too long')
  return validate(JSON.parse(decodeURIComponent(hash.slice(6))))
}
