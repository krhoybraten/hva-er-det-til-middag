import {findDinnersByTags} from '../utils/dinnerUtils.js'
import {dinnerData} from '../data/dinnerData.js'

export function getDinnersByTags(tags = []) {
  return findDinnersByTags(dinnerData, tags)
}
