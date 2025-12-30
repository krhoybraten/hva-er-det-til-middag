import {dinnerData} from './data/dinnerData.js'
import {getTags} from './api/tags.js';
import {getRandomDinner} from './api/randomDinner.js';
import {renderTagCheckboxes} from './ui/renderTags.js';
import {renderDinnerResult} from './ui/renderDinnerResult.js';

const middag = document.getElementById('middag');
const search = document.getElementbyId('search');
const randomDinner = document.getElementById('random-dinner');
const tagContainer = document.getElementById('facets');
const dinnerResultContainer = document.getElementById('middag');
const tags = await getTags();
let selectedTags = [];
let dinners = [];

renderTagCheckboxes({
  tagContainer,
  tags,
  onChange: () => {
    selectedTags = [...tagContainer.querySelectorAll("input:checked")]
      .map(cb => cb.value);

    console.log("Selected tags:", selectedTags);
  }
});

function replaceText(element, newText) {
  element.textContent = newText;
}

search.addEventListener('click', () => {
  const dinners = getdinnersByTags(selectedTags);
  if(!dinnerResult.length) {
    replaceText(middag, 'Fant ingen middager')
  } else {
    renderDinnerResult({dinnerResultContainer, dinners})
  }

randomDinner.addEventListener('click', () => {
  const randomDinner = getRandomDinner(selectedTags);
  if(!randomDinner) {
    replaceText(middag, 'Fant ingen middager')
  } else {
    dinners = [randomDinner]
    renderDinnerResult({dinnerResultContainer, dinners});
  }
});
