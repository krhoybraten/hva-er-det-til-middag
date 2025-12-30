export function renderDinnerResult({
  dinnerResultContainer,
  dinners,
  name = "dinners"
}) {
  // Clear container
  dinnerResultContainer.innerHTML = "";

  const ul = document.createElement("ul");
  ul.id = name;

  for (const dinner of dinners) {
    const li = document.createElement("li");

    // Dinner title (semantic)
    const title = document.createElement("h2");
    title.textContent = `${dinner.emoji ?? '🍽️'} ${dinner.name}`;
    li.appendChild(title);

    // Optional recipe list
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
