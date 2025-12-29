import {findRandomDinnerWithTags} from '../utils/dinnerUtils.js'
import {dinnerData} from '../data/dinnerData.js'

function getRandomDinner(tags = []) {
  return findRandomDinnerWithTags(dinnerData, tags)
}
