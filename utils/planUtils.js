import { dinnerData } from '../data/dinnerData.js'

export function datePlusDays(startDate, days) {
  const date = new Date(`${startDate}T12:00:00Z`)
  date.setUTCDate(date.getUTCDate() + days)
  return date.toISOString().slice(0, 10)
}

export function hasTag(dinner, tag) {
  return dinner.tags?.includes(tag)
}

export function getDefaultRecipeUrl(dinner) {
  return Array.isArray(dinner?.recipeUrls) && dinner.recipeUrls.length
    ? dinner.recipeUrls[0].url
    : null
}

export function buildUsedDinnerNames(planSlots, ignoredDate) {
  return new Set(planSlots
    .filter(slot => slot.date !== ignoredDate)
    .map(slot => slot.dinner?.name)
    .filter(Boolean))
}


export function createPlanner(selectedFamilyMembers = []) {
  function isWeekendDate(date) {
    const day = new Date(`${date}T12:00:00Z`).getUTCDay()
    return day === 0 || day === 5 || day === 6
  }

  function matchesSelectedFamily(dinner) {
    return selectedFamilyMembers.every(member => dinner.likedBy?.includes(member))
  }

  function likedByCount(dinner) {
    return Array.isArray(dinner.likedBy) ? dinner.likedBy.length : 0
  }

  function sortDinnerCandidates(a, b) {
    return likedByCount(b) - likedByCount(a) || a.name.localeCompare(b.name, 'nb')
  }

  function shuffled(items) {
    const next = [...items]

    for (let index = next.length - 1; index > 0; index -= 1) {
      const swapIndex = Math.floor(Math.random() * (index + 1))
      const current = next[index]
      next[index] = next[swapIndex]
      next[swapIndex] = current
    }

    return next
  }

  function weightedRandomDinner(candidates) {
    if (!candidates.length) return null

    const weighted = candidates.map(dinner => ({
      dinner,
      weight: Math.max(1, likedByCount(dinner) + 1)
    }))
    const totalWeight = weighted.reduce((sum, candidate) => sum + candidate.weight, 0)
    let ticket = Math.random() * totalWeight

    for (const candidate of weighted) {
      ticket -= candidate.weight
      if (ticket <= 0) return candidate.dinner
    }

    return weighted.at(-1).dinner
  }

  function findSuggestion(requiredTags, usedDinnerNames, { weekend = false } = {}) {
    const candidates = dinnerData
      .filter(dinner => matchesSelectedFamily(dinner))
      .filter(dinner => weekend || !hasTag(dinner, 'helg'))
      .filter(dinner => requiredTags.every(tag => hasTag(dinner, tag)))
      .filter(dinner => !usedDinnerNames.has(dinner.name))
      .sort(sortDinnerCandidates)

    return weightedRandomDinner(candidates)
  }

  function addAttempt(attempts, tags) {
    const key = tags.join('|')
    if (attempts.some(existing => existing.join('|') === key)) return
    attempts.push(tags)
  }

  function buildSuggestionAttempts({ needsFish, needsVegetarian, quick, weekend }) {
    const attempts = []
    const contextTags = [
      ...(quick ? ['rask'] : []),
      ...(weekend ? ['helg'] : [])
    ]
    const targetAttempts = []
    const relaxedTargetAttempts = []

    if (needsFish) {
      targetAttempts.push(['fisk', ...contextTags])
      relaxedTargetAttempts.push(['fisk', ...(quick ? ['rask'] : [])])
    }

    if (needsVegetarian) {
      targetAttempts.push(['vegetar', ...contextTags])
      relaxedTargetAttempts.push(['vegetar', ...(quick ? ['rask'] : [])])
    }

    for (const tags of shuffled(targetAttempts)) addAttempt(attempts, tags)
    if (quick || weekend) addAttempt(attempts, contextTags)
    for (const tags of shuffled(relaxedTargetAttempts)) addAttempt(attempts, tags)
    if (weekend) addAttempt(attempts, ['helg', ...(quick ? ['rask'] : [])])
    if (quick) {
      addAttempt(attempts, ['rask'])
    } else {
      addAttempt(attempts, [])
    }

    return attempts
  }

  function getWeekTargets(weekSlots) {
    return {
      fishTarget: weekSlots.length >= 7 ? 2 : Math.min(2, Math.ceil(weekSlots.length * 2 / 7)),
      vegetarianTarget: weekSlots.length >= 7 ? 1 : Math.min(1, Math.ceil(weekSlots.length / 7))
    }
  }

  function findSuggestionForSlot(slot, planSlots, usedDinnerNames) {
    const slotIndex = planSlots.findIndex(planSlot => planSlot.date === slot.date)
    const weekStart = Math.floor(slotIndex / 7) * 7
    const weekSlots = planSlots.slice(weekStart, weekStart + 7)
    const { fishTarget, vegetarianTarget } = getWeekTargets(weekSlots)
    const fishCount = weekSlots
      .filter(weekSlot => weekSlot.date !== slot.date && weekSlot.dinner && hasTag(weekSlot.dinner, 'fisk'))
      .length
    const vegetarianCount = weekSlots
      .filter(weekSlot => weekSlot.date !== slot.date && weekSlot.dinner && hasTag(weekSlot.dinner, 'vegetar'))
      .length
    const weekend = isWeekendDate(slot.date)

    const attempts = buildSuggestionAttempts({
      needsFish: fishCount < fishTarget,
      needsVegetarian: vegetarianCount < vegetarianTarget,
      quick: Boolean(slot.quick),
      weekend
    })

    return attempts
      .map(requiredTags => findSuggestion(requiredTags, usedDinnerNames, { weekend }))
      .find(Boolean)
  }

  function fillPlan(dinnerPlan) {
    const nextPlan = dinnerPlan.map(slot => ({ ...slot }))
    const usedDinnerNames = new Set(nextPlan.map(slot => slot.dinner?.name).filter(Boolean))

    for (let weekStart = 0; weekStart < nextPlan.length; weekStart += 7) {
      const weekSlots = nextPlan.slice(weekStart, weekStart + 7)
      const emptyWeekSlots = shuffled(weekSlots.filter(slot => !slot.dinner))
      const { fishTarget, vegetarianTarget } = getWeekTargets(weekSlots)

      let fishCount = weekSlots.filter(slot => slot.dinner && hasTag(slot.dinner, 'fisk')).length
      let vegetarianCount = weekSlots.filter(slot => slot.dinner && hasTag(slot.dinner, 'vegetar')).length

      for (const slot of emptyWeekSlots) {
        const weekend = isWeekendDate(slot.date)
        const attempts = buildSuggestionAttempts({
          needsFish: fishCount < fishTarget,
          needsVegetarian: vegetarianCount < vegetarianTarget,
          quick: Boolean(slot.quick),
          weekend
        })

        const suggestion = attempts
          .map(requiredTags => findSuggestion(requiredTags, usedDinnerNames, { weekend }))
          .find(Boolean)

        if (!suggestion) continue

        slot.dinner = suggestion
        slot.selectedRecipeUrl = getDefaultRecipeUrl(suggestion)
        usedDinnerNames.add(suggestion.name)
        if (hasTag(suggestion, 'fisk')) fishCount += 1
        if (hasTag(suggestion, 'vegetar')) vegetarianCount += 1
      }
    }

    return nextPlan
  }

  return { fillPlan, findSuggestionForSlot }
}
