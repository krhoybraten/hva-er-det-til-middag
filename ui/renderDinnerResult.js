const familyMemberLabels = {
  sloth: "🦥",
  giraffe: "🦒",
  kangaroo: "🦘",
  lemur: "🦝",
  "flying-squirrel": "🐿️"
};

const familyMemberOrder = Object.keys(familyMemberLabels);

function formatDate(date) {
  return new Intl.DateTimeFormat('nb-NO', {
    weekday: 'short',
    day: 'numeric',
    month: 'short'
  }).format(new Date(`${date}T12:00:00`));
}

export function renderDinnerResult({
  dinnerResultContainer,
  dinners,
  name = "dinners",
  planSlots = [],
  onAddToPlan
}) {
  dinnerResultContainer.innerHTML = "";

  const ul = document.createElement("ul");
  ul.id = name;

  for (const dinner of dinners) {
    const li = document.createElement("li");

    const title = document.createElement("h2");
    title.textContent = `${dinner.emoji ?? "🍽️"} ${dinner.name}`;

    li.appendChild(title);

    if (Array.isArray(dinner.likedBy) && dinner.likedBy.length > 0) {
      const likedByList = document.createElement("div");
      likedByList.className = "liked-by-list";

      for (const member of familyMemberOrder) {
        if (!dinner.likedBy.includes(member)) continue;

        const emoji = document.createElement("span");
        emoji.className = "liked-by-emoji";
        emoji.textContent = familyMemberLabels[member];
        likedByList.appendChild(emoji);
      }

      li.appendChild(likedByList);
    }

    if (dinner.preferenceNotes) {
      const notes = document.createElement("p");
      notes.className = "preference-notes";
      notes.textContent = Object.entries(dinner.preferenceNotes)
        .map(([member, note]) => `${familyMemberLabels[member] ?? member}: ${note}`)
        .join(", ");
      li.appendChild(notes);
    }

    const addForm = document.createElement("form");
    addForm.className = "add-to-plan-form";

    const dateSelect = document.createElement("select");
    dateSelect.required = true;

    if (!planSlots.length) {
      const option = document.createElement("option");
      option.textContent = "Lag middagsplan først";
      option.value = "";
      dateSelect.appendChild(option);
      dateSelect.disabled = true;
    } else {
      for (const slot of planSlots) {
        const option = document.createElement("option");
        option.value = slot.date;
        option.textContent = slot.dinner
          ? `${formatDate(slot.date)} - erstatt ${slot.dinner.name}`
          : `${formatDate(slot.date)} - ledig`;
        dateSelect.appendChild(option);
      }
    }

    const addBtn = document.createElement("button");
    addBtn.type = "submit";
    addBtn.textContent = "Legg til i plan";
    addBtn.disabled = !planSlots.length;

    addForm.appendChild(dateSelect);
    addForm.appendChild(addBtn);
    addForm.addEventListener("submit", event => {
      event.preventDefault();
      onAddToPlan?.(dinner, dateSelect.value);
    });
    li.appendChild(addForm);

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
