export function extractDistinctTags(dinnerData) {
  return [...new Set(dinnerData.flatMap(d => d.tags))];
}
