const SLOTH = 'sloth';
const GIRAFFE = 'giraffe';
const KANGAROO = 'kangaroo';
const LEMUR = 'lemur';
const FLYING_SQUIRREL = 'flying-squirrel';

const likedBy = (...members) => [GIRAFFE, LEMUR, ...members];
const likedByFishBalls = (...members) => [GIRAFFE, ...members];

export const familyMembers = [
  { id: SLOTH, label: '🦥' },
  { id: GIRAFFE, label: '🦒' },
  { id: KANGAROO, label: '🦘' },
  { id: LEMUR, label: '🦝' },
  { id: FLYING_SQUIRREL, label: '🐿️' }
];

export const dinnerData = [
  { name: 'Hamburger', emoji: '🍔', tags: ['helg', 'oksekjøtt', 'rask', 'grill'], likedBy: likedBy(SLOTH, KANGAROO, FLYING_SQUIRREL) },
  { name: 'Pizza', emoji: '🍕', tags: ['helg', 'oksekjøtt', 'svinekjøtt', 'kylling', 'grill'], likedBy: likedBy(SLOTH, KANGAROO, FLYING_SQUIRREL) },
  { name: 'Calzone', emoji: '🍕', tags: ['helg', 'svinekjøtt', 'oksekjøtt'], likedBy: likedBy(SLOTH, KANGAROO, FLYING_SQUIRREL), recipeUrls: [{name: 'Godt.no: Calzone', url: 'https://www.godt.no/oppskrifter/pizza/15046/calzone'}] },
  { name: 'Taco', emoji: '🌮', tags: ['helg', 'oksekjøtt', 'lammekjøtt'], likedBy: likedBy(SLOTH, KANGAROO, FLYING_SQUIRREL) },
  { name: 'Cevapcici', emoji: '🍽️', tags: ['oksekjøtt', 'lammekjøtt'], likedBy: likedBy(SLOTH, KANGAROO, FLYING_SQUIRREL) },
  { name: 'Fiskepinner', emoji: '🐟', tags: ['fisk'], likedBy: likedBy(SLOTH, FLYING_SQUIRREL) },
  { name: 'Fiskeburger', emoji: '🍔', tags: ['fisk', 'rask', 'grill'], likedBy: likedBy(SLOTH, KANGAROO, FLYING_SQUIRREL), recipeUrls: [{name: 'Godt.no: Lakseburger med parmesankrem og søtpotetfries', url: 'https://www.godt.no/oppskrifter/burger/9224/lakseburger-med-parmesankrem-og-soetpotetfries'}] },
  { name: 'Stekt laks', emoji: '🐟', tags: ['fisk'], likedBy: likedBy(KANGAROO) },
  { name: 'Pølselapskaus', emoji: '🍲', tags: ['svinekjøtt'], likedBy: likedBy(SLOTH, KANGAROO) },
  { name: 'Fiskeboller', emoji: '🐟', tags: ['fisk', 'rask'], likedBy: likedByFishBalls(SLOTH, KANGAROO, FLYING_SQUIRREL) },
  { name: 'Spaghetti med kjøttsaus', emoji: '🍝', tags: ['oksekjøtt', 'rask', 'pasta'], likedBy: likedBy(KANGAROO) },
  { name: 'Pasta Carbonara', emoji: '🍝', tags: ['svinekjøtt', 'rask', 'pasta'], likedBy: likedBy(SLOTH) },
  { name: 'Pastagrateng med rigatoni', emoji: '🍝', tags: ['pasta'], likedBy: likedBy(SLOTH, KANGAROO), recipeUrls: [{name: 'Godt.no: Pastagrateng med rigatoni', url: 'https://www.godt.no/oppskrifter/pasta/8642/pasta-til-hele-familien'}] },
  { name: 'Fleskepannekake', emoji: '🥞', tags: ['svinekjøtt'], likedBy: likedBy(SLOTH, KANGAROO, FLYING_SQUIRREL) },
  { name: 'Pannekaker', emoji: '🥞', tags: ['svinekjøtt'], likedBy: likedBy(SLOTH, KANGAROO, FLYING_SQUIRREL) },
  { name: 'Bakt potet', emoji: '🥔', tags: ['svinekjøtt', 'helg'], likedBy: likedBy(SLOTH, KANGAROO), recipeUrls: [{name: 'Godt.no: Bakt potet', url: 'https://www.godt.no/oppskrifter/groennsaker/potet/2537/bakt-potet'}] },
  { name: 'Bygg selv-salat', emoji: '🥗', tags: ['kylling', 'rask', 'vegetar'], likedBy: likedBy(SLOTH, KANGAROO, FLYING_SQUIRREL) },
  { name: 'Kyllingvinger', emoji: '🍗', tags: ['kylling', 'helg', 'rask'], likedBy: likedBy(SLOTH, KANGAROO, FLYING_SQUIRREL) },
  { name: 'Kylling i pita', emoji: '🥙', tags: ['kylling'], likedBy: likedBy(SLOTH, KANGAROO, FLYING_SQUIRREL) },
  { name: 'Lasagne', emoji: '🍝', tags: ['oksekjøtt', 'helg', 'pasta'], likedBy: likedBy(SLOTH, KANGAROO) },
  { name: 'Vårruller', emoji: '🥟', tags: ['oksekjøtt', 'svinekjøtt', 'vegetar', 'kylling'], likedBy: likedBy(SLOTH, FLYING_SQUIRREL) },
  { name: 'Ferske vårruller', emoji: '🥬', tags: ['oksekjøtt', 'svinekjøtt', 'vegetar', 'kylling'], likedBy: likedBy(SLOTH), recipeUrls: [{url: 'https://www.matprat.no/oppskrifter/familien/ferske-varruller-med-kylling/', name: 'Matprat.no: Ferske vårruller med kylling'}] },
  { name: 'Gyoza', emoji: '🥟', tags: ['svinekjøtt'], likedBy: likedBy(SLOTH, KANGAROO, FLYING_SQUIRREL), recipeUrls: [{name: 'Godt.no: Gyoza', url: 'https://www.godt.no/oppskrifter/smaarett/7709/gyoza'}] },
  { name: 'Fiskekakewraps', emoji: '🌯', tags: ['fisk', 'rask'], likedBy: likedBy(SLOTH, KANGAROO) },
  { name: 'Nachos', emoji: '🧀', tags: ['oksekjøtt', 'helg', 'rask'], likedBy: likedBy(SLOTH, KANGAROO, FLYING_SQUIRREL) },
  { name: 'Steik', emoji: '🥩', tags: ['oksekjøtt', 'svinekjøtt', 'lammekjøtt', 'vilt', 'helg', 'grill'], likedBy: likedBy(SLOTH), recipeUrls: [{name: 'Godt.no: Røkt svinekam med rotgrønnsaker', url: 'https://www.godt.no/oppskrifter/kjoett/svin/13820/roekt-svinekam'}, {name: 'Godt.no: Ytrefilet av svin', url: 'https://www.godt.no/oppskrifter/kjoett/13622/ytrefilet-av-svin'}, {name: 'Godt.no: Oksestek', url: 'https://www.godt.no/oppskrifter/kjoett/storfe/9335/oksestek'}, {name: 'Godt.no: Helstekt entrecôte med rosmarin og hvitløksmør', url: 'https://www.godt.no/oppskrifter/kjoett/storfe/7893/helstekt-entrecote-med-rosmarin-og-hvitloeksmoer'}] },
  { name: 'Fiskegrateng', emoji: '🐟', tags: ['fisk', 'pasta'], likedBy: likedBy() },
  { name: 'Koteletter', emoji: '🍖', tags: ['svinekjøtt', 'lammekjøtt', 'helg', 'grill'], likedBy: likedBy(SLOTH) },
  { name: 'Wok', emoji: '🥢', tags: ['svinekjøtt', 'oksekjøtt', 'kylling'], likedBy: likedBy(), recipeUrls: [{name: 'Godt.no: Nudler kylling kung pao', url: 'https://www.godt.no/oppskrifter/wok/9197/nudler-kylling-kung-pao'}] },
  { name: 'Stekt ris', emoji: '🍚', tags: ['oksekjøtt'], likedBy: likedBy(SLOTH, KANGAROO, FLYING_SQUIRREL), recipeUrls: [{name: 'Godt.no: Stekt ris med kjøttdeig', url: 'https://www.godt.no/oppskrifter/ris/12929/stekt-ris-med-kjoettdeig'}] },
  { name: 'Sushi', emoji: '🍣', tags: ['helg', 'fisk'], likedBy: likedBy() },
  { name: 'Pølser', emoji: '🌭', tags: ['rask', 'svinekjøtt'], likedBy: likedBy(SLOTH, KANGAROO, FLYING_SQUIRREL) },
  { name: 'Tomatsuppe med tilbehør', emoji: '🍅', tags: ['svinekjøtt', 'pasta', 'vegetar'], likedBy: likedBy(SLOTH, KANGAROO, FLYING_SQUIRREL), preferenceNotes: { kangaroo: 'bare posesuppe' } },
  { name: 'Kjøttboller med potetmos', emoji: '🍽️', tags: ['svinekjøtt', 'rask'], likedBy: likedBy(SLOTH, KANGAROO, FLYING_SQUIRREL), preferenceNotes: { sloth: 'bare hvis kjøttbollene er hjemmelagde', kangaroo: 'svenske', 'flying-squirrel': 'svenske' } },
  { name: 'Pølse- og makaronigrateng', emoji: '🥘', tags: ['svinekjøtt', 'pasta', 'rask'], likedBy: likedBy(SLOTH, KANGAROO, FLYING_SQUIRREL) },
  { name: 'Kjøttkaker', emoji: '🍽️', tags: ['oksekjøtt', 'svinekjøtt', 'helg'], likedBy: likedBy(SLOTH, KANGAROO, FLYING_SQUIRREL) },
  { name: 'Butter Chicken', emoji: '🍛', tags: ['indisk', 'kylling', 'rask'], likedBy: likedBy() },
  { name: 'Korma', emoji: '🍛', tags: ['indisk', 'kylling', 'oksekjøtt', 'lammekjøtt', 'svinekjøtt'], likedBy: likedBy() },
  { name: 'Ramen', emoji: '🍜', tags: [], likedBy: likedBy(SLOTH) },
  { name: 'Lammelår', emoji: '🍖', tags: ['lammekjøtt', 'helg', 'grill'], likedBy: likedBy(SLOTH), recipeUrls: [{name: 'Godt.no: Langtidsstekt lammelår', url: 'https://www.godt.no/oppskrifter/kjoett/lam/11180/langtidsstekt-lammelaar'}] },
  { name: 'Frossenpizza', emoji: '🍕', tags: ['svinekjøtt', 'oksekjøtt', 'rask'], likedBy: likedBy(SLOTH, KANGAROO, FLYING_SQUIRREL) },
  { name: 'Pasta med pesto', emoji: '🌿', tags: ['svinekjøtt', 'oksekjøtt', 'fisk', 'pasta', 'rask', 'vegetar'], likedBy: likedBy(KANGAROO) },
  { name: 'Chicken nuggets', emoji: '🍗', tags: ['kylling', 'rask'], likedBy: likedBy(SLOTH, KANGAROO, FLYING_SQUIRREL)},
  { name: 'Finnbiff', emoji: '🦌', tags: ['vilt'], likedBy: likedBy()},
  { name: 'Sosekjøtt', emoji: '🍲', tags: ['oksekjøtt', 'helg'], likedBy: likedBy(), recipeUrls: [{name: 'Matprat: Sosekjøtt', url: 'https://www.matprat.no/oppskrifter/tradisjon/sosekjott/'}] },
  { name: 'Flesk og duppe', emoji: '🥓', tags: ['svinekjøtt'], likedBy: likedBy(SLOTH, FLYING_SQUIRREL), recipeUrls: [{name: 'Matprat: Flesk og duppe', url: 'https://www.matprat.no/oppskrifter/tradisjon/flesk-og-duppe/'}]},
  { name: 'Crispy duck', emoji: '🦆', tags: ['and', 'helg'], likedBy: likedBy(SLOTH, KANGAROO, FLYING_SQUIRREL), recipeUrls: [{name: 'Matprat: enkel Crispy duck', url: 'https://www.matprat.no/oppskrifter/gjester/enkel-crispy-duck/'}]},
  { name: 'Lammegryte', emoji: '🐑', tags: ['lammekjøtt'], likedBy: likedBy(SLOTH), recipeUrls: [{name: 'Rema 1000: Lammegryte med potetmos og rotgrønnsaker', url: 'https://www.rema.no/oppskrifter/lam-og-farekjott/lammegryte-med-potetmos-og-rotgronnsaker/'}]},
  { name: 'Irish stew', emoji: '🍲', tags: ['lammekjøtt'], likedBy: likedBy(SLOTH, KANGAROO, FLYING_SQUIRREL), recipeUrls: [{name: 'Godt.no: Irish stew', url: 'https://www.godt.no/oppskrifter/gryte/8464/irish-stew'}] },
  { name: 'Shepherd\'s pie', emoji: '🐑', tags: ['lammekjøtt', 'helg'], likedBy: likedBy()}
];
