const familyMemberLabels = {
  sloth: "🦥",
  giraffe: "🦒",
  kangaroo: "🦘",
  lemur: "🦝",
  "flying-squirrel": "🐿️"
};

const familyMemberOrder = Object.keys(familyMemberLabels);

function defaultDate() {
  return new Date().toISOString().slice(0, 10);
}

function formatDate(date) {
  return new Intl.DateTimeFormat('nb-NO', {
    weekday: 'short',
    day: 'numeric',
    month: 'short'
  }).format(new Date(`${date}T12:00:00`));
}

function renderLikedBy(dinner) {
  if (!Array.isArray(dinner?.likedBy) || dinner.likedBy.length === 0) return null;

  const likedByList = document.createElement("div");
  likedByList.className = "liked-by-list dinner-plan-liked-by";

  for (const member of familyMemberOrder) {
    if (!dinner.likedBy.includes(member)) continue;

    const emoji = document.createElement("span");
    emoji.className = "liked-by-emoji";
    emoji.textContent = familyMemberLabels[member];
    likedByList.appendChild(emoji);
  }

  return likedByList;
}

function renderRecipes(dinner) {
  if (!Array.isArray(dinner?.recipeUrls) || dinner.recipeUrls.length === 0) return null;

  const recipeList = document.createElement("ul");
  recipeList.className = "dinner-plan-recipes";

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

  return recipeList;
}

export function renderDinnerPlan({
  dinnerPlanContainer,
  planSlots = [],
  defaultStartDate = defaultDate(),
  defaultNumberOfDays = 7,
  onCreatePlan,
  onSuggest,
  onSuggestSlot,
  onRemove,
  onClearSlot,
  onToggleQuick
}) {
  dinnerPlanContainer.innerHTML = "";

  const title = document.createElement("h2");
  title.textContent = "Middagsplan";
  dinnerPlanContainer.appendChild(title);

  const form = document.createElement("form");
  form.className = "dinner-plan-form";

  const startLabel = document.createElement("label");
  startLabel.textContent = "Startdato";
  const startInput = document.createElement("input");
  startInput.type = "date";
  startInput.required = true;
  startInput.value = planSlots[0]?.date ?? defaultStartDate;
  startLabel.appendChild(startInput);

  const daysLabel = document.createElement("label");
  daysLabel.textContent = "Dager";
  const daysInput = document.createElement("input");
  daysInput.type = "number";
  daysInput.min = "1";
  daysInput.max = "31";
  daysInput.required = true;
  daysInput.value = String(planSlots.length || defaultNumberOfDays);
  daysLabel.appendChild(daysInput);

  const createButton = document.createElement("button");
  createButton.type = "submit";
  createButton.textContent = planSlots.length ? "Oppdater plan" : "Lag plan";

  form.appendChild(startLabel);
  form.appendChild(daysLabel);
  form.appendChild(createButton);
  form.addEventListener("submit", event => {
    event.preventDefault();
    onCreatePlan?.(startInput.value, Number(daysInput.value));
  });
  dinnerPlanContainer.appendChild(form);

  if (!planSlots.length) {
    const empty = document.createElement("p");
    empty.textContent = "Velg startdato og antall dager for å lage en datert plan.";
    dinnerPlanContainer.appendChild(empty);
    return;
  }

  const suggestButton = document.createElement("button");
  suggestButton.type = "button";
  suggestButton.className = "suggest-plan";
  suggestButton.textContent = "Foreslå middager";
  suggestButton.addEventListener("click", () => onSuggest?.());
  dinnerPlanContainer.appendChild(suggestButton);

  const ul = document.createElement("ul");
  ul.id = "dinner-plan-items";

  planSlots.forEach(slot => {
    const li = document.createElement("li");

    const header = document.createElement("div");
    header.className = "dinner-plan-slot-header";

    const date = document.createElement("strong");
    date.textContent = formatDate(slot.date);

    const dinner = document.createElement("span");
    dinner.className = "dinner-plan-meal";
    dinner.textContent = slot.dinner
      ? `${slot.dinner.emoji ?? "🍽️"} ${slot.dinner.name}`
      : "Ledig";

    header.appendChild(date);
    header.appendChild(dinner);

    if (slot.dinner && slot.quick) {
      const quickBadge = document.createElement("span");
      quickBadge.className = "quick-day-badge";
      quickBadge.textContent = "Rask dag";
      header.appendChild(quickBadge);
    }

    if (!slot.dinner) {
      const quickLabel = document.createElement("label");
      quickLabel.className = "quick-day-toggle";
      const quickInput = document.createElement("input");
      quickInput.type = "checkbox";
      quickInput.checked = Boolean(slot.quick);
      quickInput.addEventListener("change", () => onToggleQuick?.(slot.date, quickInput.checked));
      quickLabel.appendChild(quickInput);
      quickLabel.append("Rask dag");
      header.appendChild(quickLabel);
    }

    const actions = document.createElement("div");
    actions.className = "dinner-plan-actions";

    const suggestSlotBtn = document.createElement("button");
    suggestSlotBtn.type = "button";
    suggestSlotBtn.textContent = slot.dinner ? "Bytt forslag" : "Foreslå";
    suggestSlotBtn.addEventListener("click", () => onSuggestSlot?.(slot.date));
    actions.appendChild(suggestSlotBtn);

    if (slot.dinner) {
      const clearBtn = document.createElement("button");
      clearBtn.type = "button";
      clearBtn.textContent = "Tøm";
      clearBtn.addEventListener("click", () => onClearSlot?.(slot.date));
      actions.appendChild(clearBtn);
    }

    const removeBtn = document.createElement("button");
    removeBtn.type = "button";
    removeBtn.textContent = "Fjern dag";
    removeBtn.addEventListener("click", () => onRemove?.(slot.date));
    actions.appendChild(removeBtn);

    li.appendChild(header);
    li.appendChild(actions);

    if (slot.dinner) {
      const details = document.createElement("div");
      details.className = "dinner-plan-details";

      const likedBy = renderLikedBy(slot.dinner);
      if (likedBy) details.appendChild(likedBy);

      const recipes = renderRecipes(slot.dinner);
      if (recipes) details.appendChild(recipes);

      if (details.childElementCount) li.appendChild(details);
    }

    ul.appendChild(li);
  });

  dinnerPlanContainer.appendChild(ul);
}
