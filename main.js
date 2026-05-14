import { dinnerData } from './data/dinnerData.js'

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
const dinnerResultContainer = document.getElementById('middag')
const dinnerPlanContainer = document.getElementById('dinner-plan')

const search = document.getElementById('search')
const randomDinnerBtn = document.getElementById('random-dinner')
const installBanner = document.getElementById('install-banner')
const installAppBtn = document.getElementById('install-app')

const tags = await getTags()

let selectedTags = []
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

function replaceText(element, newText) {
  element.textContent = newText
}

search.addEventListener('click', () => {
  dinners = getDinnersByTags(selectedTags)

  if (!dinners.length) {
    replaceText(middag, 'Fant ingen middager')
  } else {
    renderDinnerResult({ dinnerResultContainer, dinners, onAddToPlan: addToPlan })
  }
})


randomDinnerBtn.addEventListener('click', () => {
  const one = getRandomDinner(selectedTags)

  if (!one) {
    replaceText(middag, 'Fant ingen middager')
  } else {
    dinners = [one]
    renderDinnerResult({ dinnerResultContainer, dinners, onAddToPlan: addToPlan })
  }
})

function addToPlan(dinner) {
  // prevent duplicates by name (optional)
  if (dinnerPlan.some(d => d.name === dinner.name)) return;

  dinnerPlan = [...dinnerPlan, dinner];
  renderPlan();
}

function removeFromPlan(index) {
  dinnerPlan = dinnerPlan.filter((_, i) => i !== index);
  renderPlan();
}

function renderPlan() {
  renderDinnerPlan({
    dinnerPlanContainer,
    dinners: dinnerPlan,
    onRemove: removeFromPlan
  });
}

// initial render
renderPlan();
