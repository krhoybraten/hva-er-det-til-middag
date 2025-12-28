const middag = document.getElementById("middag");
const generate = document.getElementById("generate");

const dinners = ['Hamburger', 'Pizza', 'Taco'];

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
