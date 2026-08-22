export function renderTagCheckboxes({
  tagContainer,
  tags,
  name = "tags",
  onChange
}) {
  tagContainer.innerHTML = "";

  for (const tag of tags) {
    const value = typeof tag === "string" ? tag : tag.id;
    const labelText = typeof tag === "string" ? tag : tag.label;
    const id = `${name}-${value}`;

    const label = document.createElement("label");
    label.style.display = "block";

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.name = name;
    checkbox.value = value;
    checkbox.id = id;

    if (onChange) {
      checkbox.addEventListener("change", onChange);
    }

    label.appendChild(checkbox);
    label.append(` ${labelText}`);

    tagContainer.appendChild(label);
  }
}
