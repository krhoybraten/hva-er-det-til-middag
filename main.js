import {dinnerData} from './data/dinnerData.js'
import {getTags} from "./api/tags.js";
import {renderTagCheckboxes} from "./ui/renderTags.js";

const middag = document.getElementById("middag");
const generate = document.getElementById("generate");
const tagContainer = document.getElementById("facets");
const tags = await getTags();

renderTagCheckboxes({
  tagContainer,
  tags,
  onChange: () => {
    const selected = [...tagContainer.querySelectorAll("input:checked")]
      .map(cb => cb.value);

    console.log("Selected tags:", selected);
  }
});

const dinners = [
  'Hamburger',
  'Pizza',
  'Taco',
  'Fiskepinner',
  'Fiskeburger',
  'Pølselapskaus',
  'Fiskeboller',
  'Spaghetti med kjøttsaus',
  'Pasta Carbonara',
  'Fleskepannekake'
];

function getRandomDinner(dinnerList) {
  const dinnerIndex = Math.floor(Math.random() * dinnerList.length);
  return dinnerList[dinnerIndex];
}

function replaceText(element, newText) {
  element.textContent = newText;
}

generate.addEventListener('click', () => {
  replaceText(middag, getRandomDinner(dinners));
});
