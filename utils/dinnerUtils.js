export function extractDistinctTags(dinnerData) {
  return [...new Set(dinnerData.flatMap(d => d.tags))].sort((a, b) => a.localeCompare(b, "nb", { sensitivity: "base" }));
}

function matchesDinner(dinner, requiredTags = [], requiredFamilyMembers = []) {
  return (
    requiredTags.every(tag => dinner.tags.includes(tag)) &&
    requiredFamilyMembers.every(member => dinner.likedBy?.includes(member))
  );
}

function likedByCount(dinner) {
  return Array.isArray(dinner.likedBy) ? dinner.likedBy.length : 0;
}

function sortByBestMatch(a, b) {
  return likedByCount(b) - likedByCount(a) || a.name.localeCompare(b.name, 'nb');
}

export function findRandomDinner(dinners, requiredTags = [], requiredFamilyMembers = []) {
  const matches = dinners.filter(dinner =>
    matchesDinner(dinner, requiredTags, requiredFamilyMembers)
  );

  if (matches.length === 0) {
    return null;
  }

  const index = Math.floor(Math.random() * matches.length);
  return matches[index];
}

export function findDinners(dinners, requiredTags = [], requiredFamilyMembers = []) {
  return dinners
    .filter(dinner =>
      matchesDinner(dinner, requiredTags, requiredFamilyMembers)
    )
    .sort(sortByBestMatch);
}

export const findRandomDinnerWithTags = findRandomDinner;
export const findDinnersByTags = findDinners;
