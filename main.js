import { dinnerData } from './data/dinnerData.js'
import { getTags } from './api/tags.js'
import { getRandomDinner } from './api/randomDinner.js'
import { renderTagCheckboxes } from './ui/renderTags.js'
import { renderDinnerResult } from './ui/renderDinnerResult.js'
import { getDinnersByTags } from './api/getDinnersByTags.js'

const middag = document.getElementById('middag')
const search = document.getElementById('search')
const randomDinnerBtn = document.getElementById('random-dinner')
const tagContainer = document.getElementById('facets')
const dinnerResultContainer = document.getElementById('middag')
const dinnerPlanContainer = document.getElementById('dinner-plan')
const dinnerPlan = []
const tags = await getTags()
let selectedTags = []
let dinners = []

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
    renderDinnerResult({ dinnerResultContainer, dinners })
  }
})

import { renderDinnerResult } from "./ui/renderDinnerResult.js";
import { renderDinnerPlan } from "./ui/renderDinnerPlan.js";

const dinnerResultContainer = document.getElementById("middag");
const dinnerPlanContainer = document.getElementById("dinner-plan");

let dinnerPlan = [];

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
