import { datePlusDays, hasTag, getDefaultRecipeUrl, buildUsedDinnerNames, createPlanner } from './utils/planUtils.js'
import { createPlanLink, readPlanLink } from './utils/planLinks.js'

import { familyMembers } from './data/dinnerData.js'

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

function calendarDate(date) {
  return date.replaceAll('-', '')
}

function getSelectedRecipe(slot) {
  const recipes = slot.dinner?.recipeUrls
  if (!Array.isArray(recipes) || recipes.length === 0) return null

  return recipes.find(recipe => recipe.url === slot.selectedRecipeUrl) ?? recipes[0]
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
  const selectedRecipe = getSelectedRecipe(slot)

  if (slot.quick) lines.push('Rask dag')
  if (selectedRecipe) {
    lines.push('Oppskrift:')
    lines.push(`${selectedRecipe.name}: ${selectedRecipe.url}`)
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
      selectedRecipeUrl: existing?.selectedRecipeUrl ?? getDefaultRecipeUrl(existing?.dinner),
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
    slot.date === date ? { ...slot, dinner, selectedRecipeUrl: getDefaultRecipeUrl(dinner) } : slot
  )
  renderPlan()
  renderResults()
}

function clearPlanSlot(date) {
  dinnerPlan = dinnerPlan.map(slot =>
    slot.date === date ? { ...slot, dinner: null, selectedRecipeUrl: null } : slot
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

function selectPlanRecipe(date, selectedRecipeUrl) {
  dinnerPlan = dinnerPlan.map(slot =>
    slot.date === date ? { ...slot, selectedRecipeUrl } : slot
  )
  renderPlan()
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

  const suggestion = createPlanner(selectedFamilyMembers).findSuggestionForSlot(targetSlot, dinnerPlan, usedDinnerNames)
  if (!suggestion) return

  dinnerPlan = dinnerPlan.map(slot =>
    slot.date === date ? { ...slot, dinner: suggestion, selectedRecipeUrl: getDefaultRecipeUrl(suggestion) } : slot
  )
  renderPlan()
  renderResults()
}

function suggestPlan() {
  dinnerPlan = createPlanner(selectedFamilyMembers).fillPlan(dinnerPlan)
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
    getShareLink: () => createPlanLink(dinnerPlan, selectedFamilyMembers, window.location.href),
    onRemove: removeFromPlan,
    onClearSlot: clearPlanSlot,
    onToggleQuick: toggleQuickDay,
    onSelectRecipe: selectPlanRecipe
  });
}

function loadSharedPlan() {
  try {
    const shared = readPlanLink(window.location.href)
    if (!shared) return
    dinnerPlan = shared.plan
    selectedFamilyMembers = shared.familyMembers
    for (const checkbox of familyMemberContainer.querySelectorAll('input')) {
      checkbox.checked = selectedFamilyMembers.includes(checkbox.value)
    }
    renderPlan()
    renderResults()
  } catch {
    replaceText(middag, 'Kunne ikke åpne planlenken. Lenken er ugyldig eller viser til middager som ikke finnes lenger.')
  }
}

// initial render
renderPlan();
loadSharedPlan()
window.addEventListener('hashchange', loadSharedPlan)
