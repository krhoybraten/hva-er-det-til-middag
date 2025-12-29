export function renderTagCheckboxes({
  tagContainer,
  tags,
  name = "tags",
  onChange
}) {
  tagContainer.innerHTML = "";

  for (const tag of tags) {
    const id = `${name}-${tag}`;

    const label = document.createElement("label");
    label.style.display = "block";

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.name = name;
    checkbox.value = tag;
    checkbox.id = id;

    if (onChange) {
      checkbox.addEventListener("change", onChange);
    }

    label.appendChild(checkbox);
    label.append(` ${tag}`);

    tagContainer.appendChild(label);
  }
}
