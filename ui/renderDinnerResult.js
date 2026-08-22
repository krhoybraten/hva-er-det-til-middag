const familyMemberLabels = {
  sloth: "🦥",
  giraffe: "🦒",
  kangaroo: "🦘",
  lemur: "🦝",
  "flying-squirrel": "🐿️"
};

export function renderDinnerResult({
  dinnerResultContainer,
  dinners,
  name = "dinners",
  onAddToPlan
}) {
  dinnerResultContainer.innerHTML = "";

  const ul = document.createElement("ul");
  ul.id = name;

  for (const dinner of dinners) {
    const li = document.createElement("li");

    const title = document.createElement("h2");
    title.textContent = `${dinner.emoji ?? "🍽️"} ${dinner.name}`;

    const addBtn = document.createElement("button");
    addBtn.type = "button";
    addBtn.textContent = "Legg til i middagplan";
    addBtn.addEventListener("click", () => onAddToPlan?.(dinner));

    li.appendChild(title);

    if (dinner.preferenceNotes) {
      const notes = document.createElement("p");
      notes.className = "preference-notes";
      notes.textContent = Object.entries(dinner.preferenceNotes)
        .map(([member, note]) => `${familyMemberLabels[member] ?? member}: ${note}`)
        .join(", ");
      li.appendChild(notes);
    }

    li.appendChild(addBtn);

    if (Array.isArray(dinner.recipeUrls) && dinner.recipeUrls.length > 0) {
      const recipeList = document.createElement("ul");
      for (const recipe of dinner.recipeUrls) {
        const recipeItem = document.createElement("li");
        const link = document.createElement("a");
        link.textContent = recipe.name;
        link.href = recipe.url;
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        recipeItem.appendChild(link);
        recipeList.appendChild(recipeItem);
      }
      li.appendChild(recipeList);
    }

    ul.appendChild(li);
  }

  dinnerResultContainer.appendChild(ul);
}
