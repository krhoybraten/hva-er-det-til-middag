export function renderDinnerPlan({
  dinnerPlanContainer,
  dinners,
  name = "dinner-plan",
  onRemove
}) {
  dinnerPlanContainer.innerHTML = "";

  const title = document.createElement("h2");
  title.textContent = "Middagplan";
  dinnerPlanContainer.appendChild(title);

  if (!dinners.length) {
    const empty = document.createElement("p");
    empty.textContent = "Ingen middager i planen ennå.";
    dinnerPlanContainer.appendChild(empty);
    return;
  }

  const ul = document.createElement("ul");
  ul.id = name;

  dinners.forEach((dinner, index) => {
    const li = document.createElement("li");

    const text = document.createElement("span");
    text.textContent = `${dinner.emoji ?? "🍽️"} ${dinner.name}`;

    const removeBtn = document.createElement("button");
    removeBtn.type = "button";
    removeBtn.textContent = "Fjern";
    removeBtn.addEventListener("click", () => onRemove?.(index));

    li.appendChild(text);
    li.appendChild(removeBtn);
    ul.appendChild(li);
  });

  dinnerPlanContainer.appendChild(ul);
}
