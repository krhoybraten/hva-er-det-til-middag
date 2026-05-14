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
const installAppBtn = document.getElementById('install-app')

const tags = await getTags()

let selectedTags = []
let dinners = []
let dinnerPlan = [];

const isStandalone =
  window.matchMedia('(display-mode: standalone)').matches ||
  window.navigator.standalone === true
const isIos = /iphone|ipad|ipod/i.test(window.navigator.userAgent)
const isAndroid = /android/i.test(window.navigator.userAgent)

function showInstallButton() {
  if (!isStandalone) {
    installAppBtn.hidden = false
  }
}

window.addEventListener('beforeinstallprompt', event => {
  event.preventDefault()
  deferredInstallPrompt = event
  showInstallButton()
})

if (!isStandalone) {
  showInstallButton()
}

installAppBtn.addEventListener('click', async () => {
  if (deferredInstallPrompt) {
    deferredInstallPrompt.prompt()
    await deferredInstallPrompt.userChoice
    deferredInstallPrompt = null
    installAppBtn.hidden = true
    return
  }

  if (isIos) {
    window.alert('På iPhone/iPad: Trykk Del-knappen i Safari, og velg "Legg til på Hjem-skjerm".')
    return
  }

  if (isAndroid) {
    window.alert('På Android: Åpne menyen i nettleseren, og velg "Installer app" eller "Legg til på startsiden".')
    return
  }

  window.alert('Åpne nettlesermenyen og velg "Installer app" eller "Legg til på startsiden".')
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
