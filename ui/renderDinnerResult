export function renderDinnerResult({
  dinnerResultContainer,
  dinners,
  name = "dinners"
}) {
  // Clear container
  dinnerResultContainer.innerHTML = "";

  // Create <ul>
  const ul = document.createElement("ul");
  ul.id = name;

  for (const dinner of dinners) {
    const li = document.createElement("li");
    li.textContent = dinner.name ?? dinner; // supports objects or strings
    ul.appendChild(li);
  }

  dinnerResultContainer.appendChild(ul);
}
