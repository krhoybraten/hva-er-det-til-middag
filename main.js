import { dinnerData, familyMembers } from './data/dinnerData.js'

import { getTags } from './api/tags.js'
import { getRandomDinner } from './api/randomDinner.js'
import { getDinnersByTags } from './api/getDinnersByTags.js'

import { renderTagCheckboxes } from './ui/renderTags.js'
import { renderDinnerResult } from './ui/renderDinnerResult.js'
import { renderDinnerPlan } from "./ui/renderDinnerPlan.js";

let deferredInstallPrompt = null

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').catch(error => {
      console.warn('Service worker registration failed', error)
    })
  })
}

const middag = document.getElementById('middag')
const tagContainer = document.getElementById('facets')
const familyMemberContainer = document.getElementById('family-members')
const dinnerResultContainer = document.getElementById('middag')
const dinnerPlanContainer = document.getElementById('dinner-plan')

const search = document.getElementById('search')
const randomDinnerBtn = document.getElementById('random-dinner')
const installBanner = document.getElementById('install-banner')
const installAppBtn = document.getElementById('install-app')

const tags = await getTags()

let selectedTags = []
let selectedFamilyMembers = []
let dinners = []
let dinnerPlan = [];

const isStandalone =
  window.matchMedia('(display-mode: standalone)').matches ||
  window.navigator.standalone === true

installBanner.hidden = true

function showInstallButton() {
  if (!isStandalone && deferredInstallPrompt) {
    installBanner.hidden = false
    installAppBtn.hidden = false
  }
}

window.addEventListener('beforeinstallprompt', event => {
  event.preventDefault()
  deferredInstallPrompt = event
  showInstallButton()
})

window.addEventListener('appinstalled', () => {
  deferredInstallPrompt = null
  installBanner.hidden = true
})

installAppBtn.addEventListener('click', async () => {
  if (!deferredInstallPrompt) return

  deferredInstallPrompt.prompt()
  await deferredInstallPrompt.userChoice
  deferredInstallPrompt = null
  installBanner.hidden = true
})

renderTagCheckboxes({
  tagContainer,
  tags,
  onChange: () => {
    selectedTags = [...tagContainer.querySelectorAll("input:checked")]
      .map(cb => cb.value)
  }
})

renderTagCheckboxes({
  tagContainer: familyMemberContainer,
  tags: familyMembers,
  name: 'family-members',
  onChange: () => {
    selectedFamilyMembers = [...familyMemberContainer.querySelectorAll("input:checked")]
      .map(cb => cb.value)
  }
})

function replaceText(element, newText) {
  element.textContent = newText
}

function datePlusDays(startDate, days) {
  const date = new Date(`${startDate}T12:00:00`)
  date.setDate(date.getDate() + days)
  return date.toISOString().slice(0, 10)
}

function calendarDate(date) {
  return date.replaceAll('-', '')
}

function hasTag(dinner, tag) {
  return dinner.tags?.includes(tag)
}

function isWeekendDate(date) {
  const day = new Date(`${date}T12:00:00`).getDay()
  return day === 0 || day === 5 || day === 6
}

function matchesSelectedFamily(dinner) {
  return selectedFamilyMembers.every(member => dinner.likedBy?.includes(member))
}

function likedByCount(dinner) {
  return Array.isArray(dinner.likedBy) ? dinner.likedBy.length : 0
}

function sortDinnerCandidates(a, b) {
  return likedByCount(b) - likedByCount(a) || a.name.localeCompare(b.name, 'nb')
}

function shuffled(items) {
  const next = [...items]

  for (let index = next.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1))
    const current = next[index]
    next[index] = next[swapIndex]
    next[swapIndex] = current
  }

  return next
}

function weightedRandomDinner(candidates) {
  if (!candidates.length) return null

  const weighted = candidates.map(dinner => ({
    dinner,
    weight: Math.max(1, likedByCount(dinner) + 1)
  }))
  const totalWeight = weighted.reduce((sum, candidate) => sum + candidate.weight, 0)
  let ticket = Math.random() * totalWeight

  for (const candidate of weighted) {
    ticket -= candidate.weight
    if (ticket <= 0) return candidate.dinner
  }

  return weighted.at(-1).dinner
}

function findSuggestion(requiredTags, usedDinnerNames, { weekend = false } = {}) {
  const candidates = dinnerData
    .filter(dinner => matchesSelectedFamily(dinner))
    .filter(dinner => weekend || !hasTag(dinner, 'helg'))
    .filter(dinner => requiredTags.every(tag => hasTag(dinner, tag)))
    .filter(dinner => !usedDinnerNames.has(dinner.name))
    .sort(sortDinnerCandidates)

  return weightedRandomDinner(candidates)
}

function addAttempt(attempts, tags) {
  const key = tags.join('|')
  if (attempts.some(existing => existing.join('|') === key)) return
  attempts.push(tags)
}

function buildSuggestionAttempts({ needsFish, needsVegetarian, quick, weekend }) {
  const attempts = []
  const contextTags = [
    ...(quick ? ['rask'] : []),
    ...(weekend ? ['helg'] : [])
  ]
  const targetAttempts = []
  const relaxedTargetAttempts = []

  if (needsFish) {
    targetAttempts.push(['fisk', ...contextTags])
    relaxedTargetAttempts.push(['fisk', ...(quick ? ['rask'] : [])])
  }

  if (needsVegetarian) {
    targetAttempts.push(['vegetar', ...contextTags])
    relaxedTargetAttempts.push(['vegetar', ...(quick ? ['rask'] : [])])
  }

  for (const tags of shuffled(targetAttempts)) addAttempt(attempts, tags)
  if (quick || weekend) addAttempt(attempts, contextTags)
  for (const tags of shuffled(relaxedTargetAttempts)) addAttempt(attempts, tags)
  if (weekend) addAttempt(attempts, ['helg'])
  if (quick) {
    addAttempt(attempts, ['rask'])
  } else {
    addAttempt(attempts, [])
  }

  return attempts
}

function getWeekTargets(weekSlots) {
  return {
    fishTarget: weekSlots.length >= 7 ? 2 : Math.min(2, Math.ceil(weekSlots.length * 2 / 7)),
    vegetarianTarget: weekSlots.length >= 7 ? 1 : Math.min(1, Math.ceil(weekSlots.length / 7))
  }
}

function buildUsedDinnerNames(planSlots, ignoredDate) {
  return new Set(planSlots
    .filter(slot => slot.date !== ignoredDate)
    .map(slot => slot.dinner?.name)
    .filter(Boolean))
}

function escapeCalendarText(value) {
  return String(value)
    .replace(/\\/g, '\\\\')
    .replace(/\r?\n/g, '\\n')
    .replace(/,/g, '\\,')
    .replace(/;/g, '\\;')
}

function foldCalendarLine(line) {
  const chunks = []
  let remaining = line

  while (remaining.length > 75) {
    chunks.push(remaining.slice(0, 75))
    remaining = ` ${remaining.slice(75)}`
  }

  chunks.push(remaining)
  return chunks.join('\r\n')
}

function calendarDescription(slot) {
  const lines = []

  if (slot.quick) lines.push('Rask dag')
  if (Array.isArray(slot.dinner.recipeUrls) && slot.dinner.recipeUrls.length) {
    lines.push('Oppskrifter:')
    for (const recipe of slot.dinner.recipeUrls) {
      lines.push(`${recipe.name}: ${recipe.url}`)
    }
  }

  return lines.join('\n')
}

function downloadCalendarFile(filename, content) {
  const blob = new Blob([content], { type: 'text/calendar;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')

  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}

function exportDinnerPlanCalendar() {
  const filledSlots = dinnerPlan.filter(slot => slot.dinner)
  if (!filledSlots.length) return

  const now = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z')
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Hva er det til middag//Dinner Plan//NO',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'X-WR-CALNAME:Middagsplan'
  ]

  for (const slot of filledSlots) {
    lines.push('BEGIN:VEVENT')
    lines.push(`UID:middag-${slot.date}-${slot.dinner.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') || 'middag'}@hva-er-det-til-middag`)
    lines.push(`DTSTAMP:${now}`)
    lines.push(`DTSTART;VALUE=DATE:${calendarDate(slot.date)}`)
    lines.push(`DTEND;VALUE=DATE:${calendarDate(datePlusDays(slot.date, 1))}`)
    lines.push(`SUMMARY:${escapeCalendarText(`Middag: ${slot.dinner.name}`)}`)

    const description = calendarDescription(slot)
    if (description) lines.push(`DESCRIPTION:${escapeCalendarText(description)}`)

    lines.push('END:VEVENT')
  }

  lines.push('END:VCALENDAR')

  const filename = filledSlots[0]?.date
    ? `middagsplan-${filledSlots[0].date}.ics`
    : 'middagsplan.ics'

  downloadCalendarFile(filename, lines.map(foldCalendarLine).join('\r\n'))
}

function findSuggestionForSlot(slot, planSlots, usedDinnerNames) {
  const slotIndex = planSlots.findIndex(planSlot => planSlot.date === slot.date)
  const weekStart = Math.floor(slotIndex / 7) * 7
  const weekSlots = planSlots.slice(weekStart, weekStart + 7)
  const { fishTarget, vegetarianTarget } = getWeekTargets(weekSlots)
  const fishCount = weekSlots
    .filter(weekSlot => weekSlot.date !== slot.date && weekSlot.dinner && hasTag(weekSlot.dinner, 'fisk'))
    .length
  const vegetarianCount = weekSlots
    .filter(weekSlot => weekSlot.date !== slot.date && weekSlot.dinner && hasTag(weekSlot.dinner, 'vegetar'))
    .length
  const weekend = isWeekendDate(slot.date)

  const attempts = buildSuggestionAttempts({
    needsFish: fishCount < fishTarget,
    needsVegetarian: vegetarianCount < vegetarianTarget,
    quick: Boolean(slot.quick),
    weekend
  })

  return attempts
    .map(requiredTags => findSuggestion(requiredTags, usedDinnerNames, { weekend }))
    .find(Boolean)
}

function renderResults() {
  if (!dinners.length) return

  renderDinnerResult({
    dinnerResultContainer,
    dinners,
    planSlots: dinnerPlan,
    onAddToPlan: addToPlan
  })
}

search.addEventListener('click', () => {
  dinners = getDinnersByTags(selectedTags, selectedFamilyMembers)

  if (!dinners.length) {
    replaceText(middag, 'Fant ingen middager')
  } else {
    renderResults()
  }
})


randomDinnerBtn.addEventListener('click', () => {
  const one = getRandomDinner(selectedTags, selectedFamilyMembers)

  if (!one) {
    replaceText(middag, 'Fant ingen middager')
  } else {
    dinners = [one]
    renderResults()
  }
})

function createPlan(startDate, numberOfDays) {
  if (!startDate || !Number.isFinite(numberOfDays) || numberOfDays < 1) return

  const nextPlan = Array.from({ length: numberOfDays }, (_, index) => {
    const date = datePlusDays(startDate, index)
    const existing = dinnerPlan.find(slot => slot.date === date)
    return {
      date,
      dinner: existing?.dinner ?? null,
      quick: existing?.quick ?? false
    }
  })

  dinnerPlan = nextPlan
  renderPlan()
  renderResults()
}

function addToPlan(dinner, date) {
  if (!date) return
  const targetSlot = dinnerPlan.find(slot => slot.date === date)
  if (targetSlot?.quick && !hasTag(dinner, 'rask')) return

  dinnerPlan = dinnerPlan.map(slot =>
    slot.date === date ? { ...slot, dinner } : slot
  )
  renderPlan()
  renderResults()
}

function clearPlanSlot(date) {
  dinnerPlan = dinnerPlan.map(slot =>
    slot.date === date ? { ...slot, dinner: null } : slot
  )
  renderPlan()
  renderResults()
}

function toggleQuickDay(date, quick) {
  dinnerPlan = dinnerPlan.map(slot =>
    slot.date === date ? { ...slot, quick } : slot
  )
  renderPlan()
  renderResults()
}

function removeFromPlan(date) {
  dinnerPlan = dinnerPlan.filter(slot => slot.date !== date)
  renderPlan()
  renderResults()
}

function suggestPlanSlot(date) {
  const targetSlot = dinnerPlan.find(slot => slot.date === date)
  if (!targetSlot) return

  const usedDinnerNames = buildUsedDinnerNames(dinnerPlan, date)
  if (targetSlot.dinner?.name) usedDinnerNames.add(targetSlot.dinner.name)

  const suggestion = findSuggestionForSlot(targetSlot, dinnerPlan, usedDinnerNames)
  if (!suggestion) return

  dinnerPlan = dinnerPlan.map(slot =>
    slot.date === date ? { ...slot, dinner: suggestion } : slot
  )
  renderPlan()
  renderResults()
}

function suggestPlan() {
  const nextPlan = dinnerPlan.map(slot => ({ ...slot }))
  const usedDinnerNames = new Set(nextPlan.map(slot => slot.dinner?.name).filter(Boolean))

  for (let weekStart = 0; weekStart < nextPlan.length; weekStart += 7) {
    const weekSlots = nextPlan.slice(weekStart, weekStart + 7)
    const emptyWeekSlots = shuffled(weekSlots.filter(slot => !slot.dinner))
    const { fishTarget, vegetarianTarget } = getWeekTargets(weekSlots)

    let fishCount = weekSlots.filter(slot => slot.dinner && hasTag(slot.dinner, 'fisk')).length
    let vegetarianCount = weekSlots.filter(slot => slot.dinner && hasTag(slot.dinner, 'vegetar')).length

    for (const slot of emptyWeekSlots) {
      const weekend = isWeekendDate(slot.date)
      const attempts = buildSuggestionAttempts({
        needsFish: fishCount < fishTarget,
        needsVegetarian: vegetarianCount < vegetarianTarget,
        quick: Boolean(slot.quick),
        weekend
      })

      const suggestion = attempts
        .map(requiredTags => findSuggestion(requiredTags, usedDinnerNames, { weekend }))
        .find(Boolean)

      if (!suggestion) continue

      slot.dinner = suggestion
      usedDinnerNames.add(suggestion.name)
      if (hasTag(suggestion, 'fisk')) fishCount += 1
      if (hasTag(suggestion, 'vegetar')) vegetarianCount += 1
    }
  }

  dinnerPlan = nextPlan
  renderPlan()
  renderResults()
}

function renderPlan() {
  renderDinnerPlan({
    dinnerPlanContainer,
    planSlots: dinnerPlan,
    onCreatePlan: createPlan,
    onSuggest: suggestPlan,
    onSuggestSlot: suggestPlanSlot,
    onExportCalendar: exportDinnerPlanCalendar,
    onRemove: removeFromPlan,
    onClearSlot: clearPlanSlot,
    onToggleQuick: toggleQuickDay
  });
}

// initial render
renderPlan();
