import {findRandomDinner} from '../utils/dinnerUtils.js'
import {dinnerData} from '../data/dinnerData.js'

export function getRandomDinner(tags = [], familyMembers = []) {
  return findRandomDinner(dinnerData, tags, familyMembers)
}
