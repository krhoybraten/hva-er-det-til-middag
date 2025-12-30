export function extractDistinctTags(dinnerData) {
  return [...new Set(dinnerData.flatMap(d => d.tags))].sort((a, b) => a.localeCompare(b, "nb", { sensitivity: "base" }));
}

export function findRandomDinnerWithTags(dinners, requiredTags = []) {
  const matches = dinners.filter(dinner =>
    requiredTags.every(tag => dinner.tags.includes(tag))
  );

  if (matches.length === 0) {
    return null;
  }

  const index = Math.floor(Math.random() * matches.length);
  return matches[index];
}

export function findDinnersByTags(dinners, requiredTags = []) {
  return dinners
    .filter(dinner =>
      requiredTags.every(tag => dinner.tags.includes(tag))
    )
    .sort((a, b) => a.name.localeCompare(b.name, 'nb'));
}

