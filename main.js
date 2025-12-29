import {dinnerData} from './data/dinnerData.js'
import {getTags} from "./api/tags.js";
import {getRandomDinner} from "./api/randomDinner.js";
import {renderTagCheckboxes} from "./ui/renderTags.js";

const middag = document.getElementById("middag");
const generate = document.getElementById("generate");
const tagContainer = document.getElementById("facets");
const tags = await getTags();
let selectedTags = []

renderTagCheckboxes({
  tagContainer,
  tags,
  onChange: () => {
    selectedTags = [...tagContainer.querySelectorAll("input:checked")]
      .map(cb => cb.value);

    console.log("Selected tags:", selected);
  }
});

function replaceText(element, newText) {
  element.textContent = newText;
}

generate.addEventListener('click', () => {
  replaceText(middag, getRandomDinner(selected).name);
});
