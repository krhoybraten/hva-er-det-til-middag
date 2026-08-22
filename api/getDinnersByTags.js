import {findDinners} from '../utils/dinnerUtils.js'
import {dinnerData} from '../data/dinnerData.js'

export function getDinnersByTags(tags = [], familyMembers = []) {
  return findDinners(dinnerData, tags, familyMembers)
}
