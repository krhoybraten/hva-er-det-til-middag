import { dinnerData } from "../data/dinnerData.js";
import { extractDistinctTags } from "../utils/dinnerUtils.js";

export async function getTags() {
  return Promise.resolve(extractDistinctTags(dinnerData));
}
