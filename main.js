import {dinnerData} from './data/dinnerData.js'
import {getTags} from './api/tags.js';
import {getRandomDinner} from './api/randomDinner.js';
import {renderTagCheckboxes} from './ui/renderTags.js';
import {renderDinnerResults} from './ui/renderdinnerResults.js';

const middag = document.getElementById('middag');
const generate = document.getElementById('generate');
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

generate.addEventListener('click', () => {
  const randomDinner = getRandomDinner(selectedTags);
  if(!randomDinner) {
    replaceText(middag, 'Fant ingen middager')
  } else {
    dinners = [randomDinner.name]
    renderDinnerResult({dinnerResultContainer, dinners});
  }
});
