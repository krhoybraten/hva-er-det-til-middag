import test from 'node:test'
import assert from 'node:assert/strict'
import { dinnerData } from '../data/dinnerData.js'
import { createPlanLink, readPlanLink, isCalendarDate } from '../utils/planLinks.js'
import { createPlanner, datePlusDays } from '../utils/planUtils.js'

const meal = dinnerData.find(dinner => dinner.recipeUrls?.length > 1)
const plan = [
  { date: '2026-10-26', dinner: meal, quick: true, selectedRecipeUrl: meal.recipeUrls[1].url },
  { date: '2026-10-27', dinner: null, quick: false, selectedRecipeUrl: null }
]

test('Unicode meals, alternate recipe, quick days, empty days and family filters survive a link', () => {
  const link = createPlanLink(plan, ['sloth'], 'http://localhost:8000/app/?preview=1#old')
  assert.ok(link.includes('#plan='))
  assert.deepEqual(readPlanLink(link), { plan, familyMembers: ['sloth'] })
  assert.equal(readPlanLink('https://example.com/#other'), null)
})

test('reject malformed, oversized, unknown, duplicate-date and untrusted-recipe links', () => {
  for (const hash of ['%broken', encodeURIComponent('{'), 'a'.repeat(40001)]) {
    assert.throws(() => readPlanLink(`https://example.com/#plan=${hash}`))
  }
  assert.throws(() => createPlanLink([...plan, plan[0]]))
  assert.throws(() => createPlanLink([{ ...plan[0], dinner: { name: 'Unknown' } }]))
  assert.throws(() => createPlanLink([{ ...plan[0], selectedRecipeUrl: 'javascript:alert(1)' }]))
  assert.throws(() => createPlanLink(plan, ['unknown']))
  assert.throws(() => createPlanLink(plan, [], 'javascript:alert(1)'))
  assert.throws(() => createPlanLink(Array.from({ length: 32 }, () => plan[0])))
})

test('dates remain calendar dates across DST, leap years and month boundaries', () => {
  assert.equal(datePlusDays('2026-10-24', 3), '2026-10-27')
  assert.equal(datePlusDays('2028-02-28', 2), '2028-03-01')
  assert.equal(isCalendarDate('2027-02-29'), false)
  assert.equal(isCalendarDate('2028-02-29'), true)
})

test('planning respects family and quick constraints without duplicates or mutating input', () => {
  const empty = Array.from({ length: 31 }, (_, index) => ({
    date: datePlusDays('2026-10-26', index), dinner: null, quick: index % 3 === 0
  }))
  for (let iteration = 0; iteration < 30; iteration++) {
    const result = createPlanner(['sloth', 'giraffe']).fillPlan(empty)
    const filled = result.filter(slot => slot.dinner)
    assert.equal(new Set(filled.map(slot => slot.dinner.name)).size, filled.length)
    for (const slot of filled) {
      assert.ok(slot.dinner.likedBy.includes('sloth') && slot.dinner.likedBy.includes('giraffe'))
      if (slot.quick) assert.ok(slot.dinner.tags.includes('rask'))
    }
  }
  assert.ok(empty.every(slot => slot.dinner === null))
})

test('filling a partially chosen plan preserves the existing meal and recipe', () => {
  const result = createPlanner().fillPlan(plan)
  assert.deepEqual(result[0], plan[0])
  assert.ok(result[1].dinner)
})
