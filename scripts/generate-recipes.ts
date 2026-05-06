/**
 * 이유식 레시피 생성 스크립트 (v2)
 * 대한소아과학회 / 질병관리청 이유식 가이드라인 기반
 * 실행: npx tsx scripts/generate-recipes.ts
 */

import { writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

type Stage = 'early' | 'middle' | 'late' | 'finishing';
type SubType = '미음' | '죽' | '무른밥' | '진밥' | '핑거푸드' | '반찬';

interface RI { ingredientId: string; amount: string; optional?: boolean; }
interface RS { order: number; instructionKo: string; }
interface Recipe {
  id: string; nameKo: string; stage: Stage; subType: SubType;
  ingredients: RI[]; steps: RS[];
  prepTimeMin: number; servings: string; ricePortionRatio?: string;
  allergenIngredientIds: string[]; tipsKo?: string; sourceKo?: string;
}

const SRC = '대한소아과학회/질병관리청 이유식 가이드라인';
const ALLERGEN_IDS = new Set(['egg_yolk','egg_whole','plain_yogurt','cheese_natural',
  'butter_unsalted','wheat_flour','pasta_small','bread_plain',
  'peanut_butter_unsalted','almond_powder','shrimp','oyster']);

const alg = (ids: string[]) => ids.filter(id => ALLERGEN_IDS.has(id));

// ══════════════════════════════════════════════════════════════
// EARLY (초기, 4-6개월) — 미음, 10배죽/8배죽, 단순 조합
// ══════════════════════════════════════════════════════════════

const E_VEGS = [
  {id:'sweet_potato', n:'고구마'},
  {id:'pumpkin',      n:'단호박'},
  {id:'carrot',       n:'당근'},
  {id:'zucchini',     n:'애호박'},
  {id:'potato',       n:'감자'},
  {id:'broccoli',     n:'브로콜리'},
];
const E_FRUITS = [
  {id:'apple',  n:'사과'},
  {id:'pear',   n:'배'},
  {id:'banana', n:'바나나'},
];
const E_GRAINS = [
  {id:'rice',       n:'쌀',   ratio:'10배죽'},
  {id:'oatmeal',    n:'오트밀', ratio:'10배죽'},
  {id:'rice_flour', n:'쌀가루', ratio:'10배죽'},
];

function earlySteps(added: string, ratio='10배죽'): RS[] {
  return [
    {order:1, instructionKo:'쌀(또는 오트밀)을 깨끗이 씻어 30분 불립니다.'},
    {order:2, instructionKo:`${added}을(를) 껍질 제거 후 삶거나 쪄서 부드럽게 만듭니다.`},
    {order:3, instructionKo:`불린 곡물, 손질한 재료, 물을 ${ratio} 비율로 믹서에 곱게 갑니다.`},
    {order:4, instructionKo:'냄비에 붓고 약한 불로 저어가며 10~15분 끓입니다.'},
    {order:5, instructionKo:'충분히 식혀 제공합니다.'},
  ];
}

const earlyRecipes: Recipe[] = [];

// 1) 단일 곡물 미음 (3)
earlyRecipes.push({
  id:'', nameKo:'쌀미음', stage:'early', subType:'미음',
  ingredients:[{ingredientId:'rice', amount:'10g'}],
  steps:[
    {order:1, instructionKo:'쌀을 씻어 30분 이상 물에 불립니다.'},
    {order:2, instructionKo:'불린 쌀과 물 100ml를 믹서에 곱게 갑니다.'},
    {order:3, instructionKo:'냄비에 붓고 약불로 저어가며 12분 끓입니다.'},
    {order:4, instructionKo:'충분히 식힌 후 제공합니다.'},
  ],
  prepTimeMin:20, servings:'1회분(80ml)', ricePortionRatio:'10배죽',
  allergenIngredientIds:[],
  tipsKo:'처음엔 1~2 숟가락부터 시작. 3~5일 반응 관찰 후 양을 늘립니다.',
  sourceKo:SRC,
});
earlyRecipes.push({
  id:'', nameKo:'오트밀미음', stage:'early', subType:'미음',
  ingredients:[{ingredientId:'oatmeal', amount:'10g'}],
  steps:[
    {order:1, instructionKo:'오트밀을 물에 10분 불립니다.'},
    {order:2, instructionKo:'불린 오트밀과 물 80ml를 믹서에 갑니다.'},
    {order:3, instructionKo:'약불에서 저어가며 6분 끓입니다.'},
  ],
  prepTimeMin:15, servings:'1회분(80ml)', ricePortionRatio:'10배죽',
  allergenIngredientIds:[],
  tipsKo:'오트밀은 소화가 잘 되고 식이섬유가 풍부합니다.',
  sourceKo:SRC,
});
earlyRecipes.push({
  id:'', nameKo:'쌀가루미음', stage:'early', subType:'미음',
  ingredients:[{ingredientId:'rice_flour', amount:'10g'}],
  steps:[
    {order:1, instructionKo:'쌀가루에 물을 조금씩 넣어 멍울 없이 풀어줍니다.'},
    {order:2, instructionKo:'냄비에 붓고 물 90ml를 추가해 중불로 끓입니다.'},
    {order:3, instructionKo:'농도가 생기면 약불로 줄여 5분 더 끓입니다.'},
  ],
  prepTimeMin:10, servings:'1회분(80ml)', ricePortionRatio:'10배죽',
  allergenIngredientIds:[],
  tipsKo:'쌀가루는 불리는 시간 없이 빠르게 만들 수 있습니다.',
  sourceKo:SRC,
});

// 2) 쌀+단일 채소 미음 (6)
for (const v of E_VEGS) {
  earlyRecipes.push({
    id:'', nameKo:`${v.n}미음`, stage:'early', subType:'미음',
    ingredients:[
      {ingredientId:'rice', amount:'10g'},
      {ingredientId:v.id, amount:'20g'},
    ],
    steps:earlySteps(v.n),
    prepTimeMin:25, servings:'1회분(90ml)', ricePortionRatio:'10배죽',
    allergenIngredientIds:[],
    tipsKo:`${v.n}은(는) 새 재료 도입 후 3일간 알레르기 반응을 관찰하세요.`,
    sourceKo:SRC,
  });
}

// 3) 쌀+단일 과일 미음 (3)
for (const f of E_FRUITS) {
  earlyRecipes.push({
    id:'', nameKo:`${f.n}미음`, stage:'early', subType:'미음',
    ingredients:[
      {ingredientId:'rice', amount:'10g'},
      {ingredientId:f.id, amount:'20g'},
    ],
    steps:[
      {order:1, instructionKo:'쌀을 30분 불립니다.'},
      {order:2, instructionKo:`${f.n}을(를) 손질합니다.`},
      {order:3, instructionKo:'재료와 물 100ml를 믹서에 곱게 갑니다.'},
      {order:4, instructionKo:'약불에서 10분 끓입니다.'},
    ],
    prepTimeMin:20, servings:'1회분(90ml)', ricePortionRatio:'10배죽',
    allergenIngredientIds:[],
    tipsKo:`${f.n}은(는) 자연 단맛이 있어 아기가 좋아합니다.`,
    sourceKo:SRC,
  });
}

// 4) 오트밀+채소/과일 (9)
const oatCombos = [...E_VEGS, ...E_FRUITS].slice(0,9);
for (const v of oatCombos) {
  earlyRecipes.push({
    id:'', nameKo:`오트밀${v.n}미음`, stage:'early', subType:'미음',
    ingredients:[
      {ingredientId:'oatmeal', amount:'8g'},
      {ingredientId:v.id, amount:'20g'},
    ],
    steps:[
      {order:1, instructionKo:'오트밀을 10분 불립니다.'},
      {order:2, instructionKo:`${v.n}을(를) 쪄서 부드럽게 합니다.`},
      {order:3, instructionKo:'재료와 물 75ml를 믹서에 곱게 갑니다.'},
      {order:4, instructionKo:'약불에서 5분 끓입니다.'},
    ],
    prepTimeMin:18, servings:'1회분(85ml)', ricePortionRatio:'10배죽',
    allergenIngredientIds:[],
    tipsKo:'오트밀과 채소 조합은 식이섬유가 풍부합니다.',
    sourceKo:SRC,
  });
}

// 5) 채소+채소 조합 (15 pairs)
const vegPairs: [typeof E_VEGS[0], typeof E_VEGS[0]|typeof E_FRUITS[0]][] = [];
for (let i=0; i<E_VEGS.length; i++) {
  for (let j=0; j<E_VEGS.length; j++) {
    if (i!==j && vegPairs.length<15) vegPairs.push([E_VEGS[i], E_VEGS[j]]);
  }
}
for (const [v1,v2] of vegPairs) {
  earlyRecipes.push({
    id:'', nameKo:`${v1.n}${v2.n}미음`, stage:'early', subType:'미음',
    ingredients:[
      {ingredientId:'rice', amount:'8g'},
      {ingredientId:v1.id, amount:'15g'},
      {ingredientId:v2.id, amount:'15g'},
    ],
    steps:[
      {order:1, instructionKo:'쌀을 30분 불립니다.'},
      {order:2, instructionKo:`${v1.n}과 ${v2.n}을(를) 각각 쪄서 부드럽게 합니다.`},
      {order:3, instructionKo:'재료와 물 80ml를 믹서에 곱게 갑니다.'},
      {order:4, instructionKo:'약불에서 10분 끓입니다.'},
    ],
    prepTimeMin:25, servings:'1회분(90ml)', ricePortionRatio:'10배죽',
    allergenIngredientIds:[],
    tipsKo:'두 가지 채소를 함께 도입할 때는 이전에 각각 테스트가 완료된 후 시도합니다.',
    sourceKo:SRC,
  });
}

// 6) 채소+과일 조합 (9 pairs)
const vegFruitPairs: [typeof E_VEGS[0], typeof E_FRUITS[0]][] = [];
for (const v of E_VEGS.slice(0,3)) {
  for (const f of E_FRUITS) vegFruitPairs.push([v,f]);
}
for (const [v,f] of vegFruitPairs) {
  earlyRecipes.push({
    id:'', nameKo:`${v.n}${f.n}미음`, stage:'early', subType:'미음',
    ingredients:[
      {ingredientId:'rice', amount:'8g'},
      {ingredientId:v.id, amount:'15g'},
      {ingredientId:f.id, amount:'15g'},
    ],
    steps:[
      {order:1, instructionKo:'쌀을 30분 불립니다.'},
      {order:2, instructionKo:`${v.n}을(를) 쪄서 부드럽게 합니다.`},
      {order:3, instructionKo:`${f.n}을(를) 손질합니다.`},
      {order:4, instructionKo:'재료와 물 80ml를 믹서에 곱게 갑니다.'},
      {order:5, instructionKo:'약불에서 8분 끓입니다.'},
    ],
    prepTimeMin:22, servings:'1회분(90ml)', ricePortionRatio:'10배죽',
    allergenIngredientIds:[],
    tipsKo:'채소의 영양과 과일의 단맛이 조화롭습니다.',
    sourceKo:SRC,
  });
}

// 7) 8배죽 (이유식 4~5주 이후) — 각 채소별 8배죽 (6)
for (const v of E_VEGS) {
  earlyRecipes.push({
    id:'', nameKo:`${v.n}미음(8배죽)`, stage:'early', subType:'미음',
    ingredients:[
      {ingredientId:'rice', amount:'12g'},
      {ingredientId:v.id, amount:'25g'},
    ],
    steps:[
      {order:1, instructionKo:'쌀을 30분 불립니다.'},
      {order:2, instructionKo:`${v.n}을(를) 쪄서 부드럽게 합니다.`},
      {order:3, instructionKo:'재료와 물 96ml(8배)를 믹서에 갑니다.'},
      {order:4, instructionKo:'약불에서 10분 끓입니다.'},
    ],
    prepTimeMin:20, servings:'1회분(100ml)', ricePortionRatio:'8배죽',
    allergenIngredientIds:[],
    tipsKo:'이유식 시작 4~5주 후부터 8배죽으로 농도를 높입니다.',
    sourceKo:SRC,
  });
}

// 8) 3가지 재료 조합 (10)
const triple3 = [
  [E_VEGS[0], E_VEGS[1], E_VEGS[2]],
  [E_VEGS[0], E_VEGS[3], E_FRUITS[0]],
  [E_VEGS[1], E_VEGS[4], E_FRUITS[1]],
  [E_VEGS[2], E_VEGS[5], E_FRUITS[0]],
  [E_VEGS[3], E_VEGS[0], E_FRUITS[2]],
  [E_VEGS[4], E_VEGS[1], E_FRUITS[1]],
  [E_VEGS[5], E_VEGS[2], E_FRUITS[2]],
  [E_VEGS[0], E_VEGS[2], E_VEGS[5]],
  [E_VEGS[1], E_VEGS[3], E_VEGS[4]],
  [E_VEGS[2], E_VEGS[0], E_VEGS[4]],
];
for (const [a,b,c] of triple3 as {id:string,n:string}[][]) {
  earlyRecipes.push({
    id:'', nameKo:`${a.n}${b.n}${c.n}미음`, stage:'early', subType:'미음',
    ingredients:[
      {ingredientId:'rice', amount:'8g'},
      {ingredientId:a.id, amount:'12g'},
      {ingredientId:b.id, amount:'12g'},
      {ingredientId:c.id, amount:'12g'},
    ],
    steps:[
      {order:1, instructionKo:'쌀을 30분 불립니다.'},
      {order:2, instructionKo:`${a.n}, ${b.n}, ${c.n}을(를) 각각 손질하여 쪄서 부드럽게 합니다.`},
      {order:3, instructionKo:'재료와 물 80ml를 믹서에 곱게 갑니다.'},
      {order:4, instructionKo:'약불에서 10분 끓입니다.'},
    ],
    prepTimeMin:30, servings:'1회분(90ml)', ricePortionRatio:'10배죽',
    allergenIngredientIds:[],
    tipsKo:'세 가지 재료를 함께 사용할 때는 각각 사전 테스트가 완료되어야 합니다.',
    sourceKo:SRC,
  });
}

// 9) 분유/모유 첨가 미음 (8)
const formulaBase = [
  {main:E_VEGS[0], ratio:'10배죽'},
  {main:E_VEGS[1], ratio:'10배죽'},
  {main:E_FRUITS[0], ratio:'10배죽'},
  {main:E_FRUITS[2], ratio:'10배죽'},
  {main:E_VEGS[2], ratio:'8배죽'},
  {main:E_VEGS[3], ratio:'8배죽'},
  {main:E_VEGS[4], ratio:'8배죽'},
  {main:E_VEGS[5], ratio:'8배죽'},
];
for (const {main, ratio} of formulaBase) {
  earlyRecipes.push({
    id:'', nameKo:`${main.n}분유미음`, stage:'early', subType:'미음',
    ingredients:[
      {ingredientId:'rice', amount:'10g'},
      {ingredientId:main.id, amount:'20g'},
      {ingredientId:'formula', amount:'20ml', optional:true},
    ],
    steps:[
      {order:1, instructionKo:'쌀을 30분 불립니다.'},
      {order:2, instructionKo:`${main.n}을(를) 쪄서 부드럽게 합니다.`},
      {order:3, instructionKo:'재료와 물 80ml를 믹서에 갑니다.'},
      {order:4, instructionKo:'약불에서 10분 끓인 후 분유를 타서 섞습니다.'},
    ],
    prepTimeMin:22, servings:'1회분(100ml)', ricePortionRatio:ratio,
    allergenIngredientIds:[],
    tipsKo:'분유를 넣으면 기존 맛에 익숙한 아기가 이유식을 더 잘 먹습니다.',
    sourceKo:SRC,
  });
}

// 10) 과일+과일 조합 미음 (3)
const fruitFruitPairs: [typeof E_FRUITS[0], typeof E_FRUITS[0]][] = [
  [E_FRUITS[0], E_FRUITS[1]], [E_FRUITS[0], E_FRUITS[2]], [E_FRUITS[1], E_FRUITS[2]],
];
for (const [f1, f2] of fruitFruitPairs) {
  earlyRecipes.push({
    id:'', nameKo:`${f1.n}${f2.n}미음`, stage:'early', subType:'미음',
    ingredients:[
      {ingredientId:'rice', amount:'8g'},
      {ingredientId:f1.id, amount:'15g'},
      {ingredientId:f2.id, amount:'15g'},
    ],
    steps:[
      {order:1, instructionKo:'쌀을 30분 불립니다.'},
      {order:2, instructionKo:`${f1.n}과 ${f2.n}을(를) 각각 손질합니다.`},
      {order:3, instructionKo:'재료와 물 80ml를 믹서에 곱게 갑니다.'},
      {order:4, instructionKo:'약불에서 8분 끓입니다.'},
    ],
    prepTimeMin:18, servings:'1회분(88ml)', ricePortionRatio:'10배죽',
    allergenIngredientIds:[],
    tipsKo:'과일을 섞으면 자연 단맛이 납니다.',
    sourceKo:SRC,
  });
}

// 11) 쌀가루+채소 미음 (6)
for (const v of E_VEGS) {
  earlyRecipes.push({
    id:'', nameKo:`쌀가루${v.n}미음`, stage:'early', subType:'미음',
    ingredients:[
      {ingredientId:'rice_flour', amount:'10g'},
      {ingredientId:v.id, amount:'20g'},
    ],
    steps:[
      {order:1, instructionKo:'쌀가루에 물을 조금씩 넣어 풀어줍니다.'},
      {order:2, instructionKo:`${v.n}을(를) 쪄서 믹서에 갑니다.`},
      {order:3, instructionKo:'쌀가루물과 채소, 추가 물 70ml를 합쳐 냄비에 끓입니다.'},
      {order:4, instructionKo:'저어가며 10분 끓입니다.'},
    ],
    prepTimeMin:15, servings:'1회분(90ml)', ricePortionRatio:'10배죽',
    allergenIngredientIds:[],
    tipsKo:'쌀가루 미음은 불리는 시간이 없어 빠르게 만들 수 있습니다.',
    sourceKo:SRC,
  });
}

// 12) 쌀가루+과일 미음 (3)
for (const f of E_FRUITS) {
  earlyRecipes.push({
    id:'', nameKo:`쌀가루${f.n}미음`, stage:'early', subType:'미음',
    ingredients:[
      {ingredientId:'rice_flour', amount:'10g'},
      {ingredientId:f.id, amount:'20g'},
    ],
    steps:[
      {order:1, instructionKo:'쌀가루에 물을 조금씩 넣어 풀어줍니다.'},
      {order:2, instructionKo:`${f.n}을(를) 손질합니다.`},
      {order:3, instructionKo:'재료를 합쳐 믹서에 갑니다.'},
      {order:4, instructionKo:'냄비에 붓고 약불에서 8분 끓입니다.'},
    ],
    prepTimeMin:12, servings:'1회분(90ml)', ricePortionRatio:'10배죽',
    allergenIngredientIds:[],
    tipsKo:'과일 미음은 냉동 보관 후 데워서 사용 가능합니다.',
    sourceKo:SRC,
  });
}

// 13) 오트밀+과일+과일 (3)
const oatFruitPairs: [typeof E_FRUITS[0], typeof E_FRUITS[0]][] = [
  [E_FRUITS[0], E_FRUITS[1]], [E_FRUITS[0], E_FRUITS[2]], [E_FRUITS[1], E_FRUITS[2]],
];
for (const [f1, f2] of oatFruitPairs) {
  earlyRecipes.push({
    id:'', nameKo:`오트밀${f1.n}${f2.n}미음`, stage:'early', subType:'미음',
    ingredients:[
      {ingredientId:'oatmeal', amount:'8g'},
      {ingredientId:f1.id, amount:'12g'},
      {ingredientId:f2.id, amount:'12g'},
    ],
    steps:[
      {order:1, instructionKo:'오트밀을 10분 불립니다.'},
      {order:2, instructionKo:`${f1.n}과 ${f2.n}을(를) 손질합니다.`},
      {order:3, instructionKo:'재료와 물 75ml를 믹서에 갑니다.'},
      {order:4, instructionKo:'약불에서 5분 끓입니다.'},
    ],
    prepTimeMin:18, servings:'1회분(85ml)', ricePortionRatio:'10배죽',
    allergenIngredientIds:[],
    tipsKo:'오트밀과 과일 조합은 아기들이 좋아하는 달콤한 맛입니다.',
    sourceKo:SRC,
  });
}

// 14) 쌀+채소+채소+과일 (6)
const triPlusFruit = [
  [E_VEGS[0], E_VEGS[2], E_FRUITS[0]],
  [E_VEGS[1], E_VEGS[3], E_FRUITS[1]],
  [E_VEGS[2], E_VEGS[5], E_FRUITS[2]],
  [E_VEGS[3], E_VEGS[0], E_FRUITS[0]],
  [E_VEGS[4], E_VEGS[1], E_FRUITS[1]],
  [E_VEGS[5], E_VEGS[4], E_FRUITS[2]],
];
for (const [v1, v2, f] of triPlusFruit as {id:string,n:string}[][]) {
  earlyRecipes.push({
    id:'', nameKo:`${v1.n}${v2.n}${f.n}미음`, stage:'early', subType:'미음',
    ingredients:[
      {ingredientId:'rice', amount:'8g'},
      {ingredientId:v1.id, amount:'10g'},
      {ingredientId:v2.id, amount:'10g'},
      {ingredientId:f.id, amount:'10g'},
    ],
    steps:[
      {order:1, instructionKo:'쌀을 30분 불립니다.'},
      {order:2, instructionKo:`${v1.n}과 ${v2.n}을(를) 쪄서 부드럽게 합니다.`},
      {order:3, instructionKo:`${f.n}을(를) 손질합니다.`},
      {order:4, instructionKo:'재료와 물 80ml를 믹서에 곱게 갑니다.'},
      {order:5, instructionKo:'약불에서 10분 끓입니다.'},
    ],
    prepTimeMin:28, servings:'1회분(90ml)', ricePortionRatio:'10배죽',
    allergenIngredientIds:[],
    tipsKo:'세 가지 이상 조합은 각 재료 테스트 완료 후 시도합니다.',
    sourceKo:SRC,
  });
}

// 15) 오트밀+채소+과일 (12)
const oatVegFruit = [
  [E_VEGS[0], E_FRUITS[0]], [E_VEGS[0], E_FRUITS[1]], [E_VEGS[0], E_FRUITS[2]],
  [E_VEGS[1], E_FRUITS[0]], [E_VEGS[1], E_FRUITS[1]], [E_VEGS[1], E_FRUITS[2]],
  [E_VEGS[2], E_FRUITS[0]], [E_VEGS[2], E_FRUITS[1]], [E_VEGS[3], E_FRUITS[0]],
  [E_VEGS[3], E_FRUITS[2]], [E_VEGS[4], E_FRUITS[1]], [E_VEGS[5], E_FRUITS[2]],
];
for (const [v, f] of oatVegFruit as {id:string,n:string}[][]) {
  earlyRecipes.push({
    id:'', nameKo:`오트밀${v.n}${f.n}미음`, stage:'early', subType:'미음',
    ingredients:[
      {ingredientId:'oatmeal', amount:'8g'},
      {ingredientId:v.id, amount:'15g'},
      {ingredientId:f.id, amount:'12g'},
    ],
    steps:[
      {order:1, instructionKo:'오트밀을 10분 불립니다.'},
      {order:2, instructionKo:`${v.n}을(를) 쪄서 부드럽게 합니다.`},
      {order:3, instructionKo:`${f.n}을(를) 손질합니다.`},
      {order:4, instructionKo:'재료와 물 75ml를 믹서에 곱게 갑니다.'},
      {order:5, instructionKo:'약불에서 5분 끓입니다.'},
    ],
    prepTimeMin:20, servings:'1회분(88ml)', ricePortionRatio:'10배죽',
    allergenIngredientIds:[],
    tipsKo:'오트밀, 채소, 과일의 균형 잡힌 미음입니다.',
    sourceKo:SRC,
  });
}

// 16) 특수 미음 5종
const special5 = [
  {nameKo:'브로콜리감자사과미음', ids:['broccoli','potato','apple'], amounts:['10g','10g','12g']},
  {nameKo:'당근단호박배미음', ids:['carrot','pumpkin','pear'], amounts:['10g','10g','12g']},
  {nameKo:'고구마애호박바나나미음', ids:['sweet_potato','zucchini','banana'], amounts:['10g','10g','12g']},
  {nameKo:'감자당근배미음', ids:['potato','carrot','pear'], amounts:['10g','10g','12g']},
  {nameKo:'단호박바나나오트밀미음', ids:['pumpkin','banana','oatmeal'], amounts:['15g','15g','8g']},
];
for (const s of special5) {
  earlyRecipes.push({
    id:'', nameKo:s.nameKo, stage:'early', subType:'미음',
    ingredients: s.ids.map((id,i) => ({ingredientId:id, amount:s.amounts[i]})),
    steps:[
      {order:1, instructionKo:'곡물(쌀/오트밀)을 불립니다.'},
      {order:2, instructionKo:'채소 재료를 쪄서 부드럽게 손질합니다.'},
      {order:3, instructionKo:'모든 재료와 물 80ml를 믹서에 곱게 갑니다.'},
      {order:4, instructionKo:'약불에서 10분 끓입니다.'},
    ],
    prepTimeMin:25, servings:'1회분(90ml)', ricePortionRatio:'10배죽',
    allergenIngredientIds:[],
    tipsKo:'세 가지 재료 조합은 각각 사전 테스트 후 시도합니다.',
    sourceKo:SRC,
  });
}

// ══════════════════════════════════════════════════════════════
// MIDDLE (중기, 7-8개월) — 죽, 7배죽/5배죽, 단백질 추가
// ══════════════════════════════════════════════════════════════

const M_PROTEINS = [
  {id:'beef_minced',    n:'소고기',     prep:'소고기 다짐육을 찬물에 20분 담가 핏물 제거 후 삶아 다집니다.', isAllergen:false},
  {id:'chicken_breast', n:'닭가슴살',   prep:'닭가슴살을 삶아 잘게 다집니다.', isAllergen:false},
  {id:'chicken_tender', n:'닭안심',     prep:'닭안심을 삶아 잘게 다집니다.', isAllergen:false},
  {id:'cod',            n:'대구',       prep:'대구살을 쪄서 가시를 완전히 제거하고 잘게 다집니다.', isAllergen:false},
  {id:'pollack',        n:'동태',       prep:'동태살을 쪄서 가시를 제거하고 잘게 다집니다.', isAllergen:false},
  {id:'tofu',           n:'두부',       prep:'두부를 끓는 물에 2분 데쳐 으깨어 줍니다.', isAllergen:false},
  {id:'egg_yolk',       n:'달걀노른자', prep:'달걀을 완숙으로 삶아 노른자만 분리해 으깹니다.', isAllergen:true},
];

const M_VEGS = [
  {id:'sweet_potato',      n:'고구마'},
  {id:'pumpkin',           n:'단호박'},
  {id:'carrot',            n:'당근'},
  {id:'zucchini',          n:'애호박'},
  {id:'potato',            n:'감자'},
  {id:'broccoli',          n:'브로콜리'},
  {id:'spinach',           n:'시금치'},
  {id:'cabbage',           n:'양배추'},
  {id:'onion',             n:'양파'},
  {id:'radish',            n:'무'},
  {id:'tomato',            n:'토마토'},
  {id:'mushroom_shiitake', n:'표고버섯'},
  {id:'seaweed_miyeok',    n:'미역'},
  {id:'bok_choy',          n:'청경채'},
  {id:'avocado',           n:'아보카도'},
];

const middleRecipes: Recipe[] = [];

// 1) 7배죽: 단백질×채소 모든 조합 (7×15 = 105)
for (const p of M_PROTEINS) {
  for (const v of M_VEGS) {
    middleRecipes.push({
      id:'', nameKo:`${p.n}${v.n}죽`, stage:'middle', subType:'죽',
      ingredients:[
        {ingredientId:'rice', amount:'15g'},
        {ingredientId:p.id, amount:'20g'},
        {ingredientId:v.id, amount:'25g'},
      ],
      steps:[
        {order:1, instructionKo:'쌀을 30분 불립니다.'},
        {order:2, instructionKo:p.prep},
        {order:3, instructionKo:`${v.n}을(를) 손질하여 잘게 다집니다.`},
        {order:4, instructionKo:'냄비에 쌀, 채소, 물 105ml를 넣고 중불로 끓입니다.'},
        {order:5, instructionKo:'끓으면 약불로 줄이고 단백질 재료를 넣어 15분 더 익힙니다.'},
        {order:6, instructionKo:'핸드블렌더로 반만 갈아 입자감을 약간 남깁니다.'},
      ],
      prepTimeMin:35, servings:'1회분(120ml)', ricePortionRatio:'7배죽',
      allergenIngredientIds:alg([p.id]),
      tipsKo: p.isAllergen
        ? `${p.n}은(는) 알레르기 유발 가능 식품입니다. 소량부터 시작해 3일간 관찰합니다.`
        : '중기 이유식은 두부 정도의 굳기로, 완전히 갈지 않고 입자감을 남깁니다.',
      sourceKo:SRC,
    });
  }
}

// 2) 5배죽: 단백질×채소 (일부 조합, 20개)
const fiveBase = [
  [M_PROTEINS[0], M_VEGS[2]], [M_PROTEINS[0], M_VEGS[6]],
  [M_PROTEINS[0], M_VEGS[7]], [M_PROTEINS[0], M_VEGS[11]],
  [M_PROTEINS[1], M_VEGS[0]], [M_PROTEINS[1], M_VEGS[3]],
  [M_PROTEINS[1], M_VEGS[5]], [M_PROTEINS[1], M_VEGS[12]],
  [M_PROTEINS[2], M_VEGS[1]], [M_PROTEINS[2], M_VEGS[8]],
  [M_PROTEINS[3], M_VEGS[3]], [M_PROTEINS[3], M_VEGS[13]],
  [M_PROTEINS[4], M_VEGS[0]], [M_PROTEINS[4], M_VEGS[7]],
  [M_PROTEINS[5], M_VEGS[1]], [M_PROTEINS[5], M_VEGS[6]],
  [M_PROTEINS[6], M_VEGS[0]], [M_PROTEINS[6], M_VEGS[4]],
  [M_PROTEINS[0], M_VEGS[14]], [M_PROTEINS[1], M_VEGS[9]],
] as [typeof M_PROTEINS[0], typeof M_VEGS[0]][];
for (const [p,v] of fiveBase) {
  middleRecipes.push({
    id:'', nameKo:`${p.n}${v.n}죽(5배)`, stage:'middle', subType:'죽',
    ingredients:[
      {ingredientId:'rice', amount:'20g'},
      {ingredientId:p.id, amount:'25g'},
      {ingredientId:v.id, amount:'30g'},
    ],
    steps:[
      {order:1, instructionKo:'쌀을 30분 불립니다.'},
      {order:2, instructionKo:p.prep},
      {order:3, instructionKo:`${v.n}을(를) 작은 알갱이 크기로 썹니다.`},
      {order:4, instructionKo:'냄비에 재료와 물 100ml를 넣고 중약불로 20분 끓입니다.'},
      {order:5, instructionKo:'입자감을 약간 남기며 마무리합니다.'},
    ],
    prepTimeMin:30, servings:'1회분(140ml)', ricePortionRatio:'5배죽',
    allergenIngredientIds:alg([p.id]),
    tipsKo:'5배죽으로 진해진 만큼 이유식 외 수분 보충에 신경 써주세요.',
    sourceKo:SRC,
  });
}

// 3) 채소만 죽 (단백질 없음, 10개)
const vegOnlyMiddle = [
  [M_VEGS[0], M_VEGS[2]], [M_VEGS[1], M_VEGS[5]], [M_VEGS[2], M_VEGS[8]],
  [M_VEGS[6], M_VEGS[4]], [M_VEGS[7], M_VEGS[2]], [M_VEGS[11], M_VEGS[3]],
  [M_VEGS[12], M_VEGS[4]], [M_VEGS[13], M_VEGS[2]], [M_VEGS[14], M_VEGS[0]],
  [M_VEGS[9], M_VEGS[4]],
] as [typeof M_VEGS[0], typeof M_VEGS[0]][];
for (const [v1,v2] of vegOnlyMiddle) {
  middleRecipes.push({
    id:'', nameKo:`${v1.n}${v2.n}죽`, stage:'middle', subType:'죽',
    ingredients:[
      {ingredientId:'rice', amount:'15g'},
      {ingredientId:v1.id, amount:'25g'},
      {ingredientId:v2.id, amount:'20g'},
    ],
    steps:[
      {order:1, instructionKo:'쌀을 30분 불립니다.'},
      {order:2, instructionKo:`${v1.n}과 ${v2.n}을(를) 잘게 다집니다.`},
      {order:3, instructionKo:'냄비에 재료와 물 105ml를 넣고 20분 끓입니다.'},
      {order:4, instructionKo:'핸드블렌더로 반만 갈아줍니다.'},
    ],
    prepTimeMin:30, servings:'1회분(120ml)', ricePortionRatio:'7배죽',
    allergenIngredientIds:[],
    tipsKo:'단백질은 별도 반찬으로 제공할 때 활용합니다.',
    sourceKo:SRC,
  });
}

// ══════════════════════════════════════════════════════════════
// LATE (후기, 9-11개월) — 무른밥/핑거푸드/반찬, 3배죽
// ══════════════════════════════════════════════════════════════

const L_PROTEINS = [
  {id:'beef_minced',    n:'소고기',       allergen:false},
  {id:'beef_sirloin',   n:'소고기안심',   allergen:false},
  {id:'chicken_breast', n:'닭가슴살',     allergen:false},
  {id:'chicken_tender', n:'닭안심',       allergen:false},
  {id:'pork_loin',      n:'돼지안심',     allergen:false},
  {id:'cod',            n:'대구',         allergen:false},
  {id:'pollack',        n:'동태',         allergen:false},
  {id:'salmon',         n:'연어',         allergen:false},
  {id:'tofu',           n:'두부',         allergen:false},
  {id:'egg_whole',      n:'달걀',         allergen:true},
  {id:'black_bean',     n:'검은콩',       allergen:false},
];

const L_VEGS = [
  {id:'sweet_potato',       n:'고구마'},
  {id:'pumpkin',            n:'단호박'},
  {id:'carrot',             n:'당근'},
  {id:'zucchini',           n:'애호박'},
  {id:'potato',             n:'감자'},
  {id:'broccoli',           n:'브로콜리'},
  {id:'spinach',            n:'시금치'},
  {id:'cabbage',            n:'양배추'},
  {id:'onion',              n:'양파'},
  {id:'mushroom_shiitake',  n:'표고버섯'},
  {id:'mushroom_king_oyster',n:'새송이버섯'},
  {id:'corn',               n:'옥수수'},
  {id:'tomato',             n:'토마토'},
  {id:'seaweed_miyeok',     n:'미역'},
  {id:'bok_choy',           n:'청경채'},
  {id:'perilla_leaf',       n:'깻잎'},
  {id:'asparagus',          n:'아스파라거스'},
];

const lateRecipes: Recipe[] = [];

// 1) 무른밥: 단백질×채소쌍 조합 (각 단백질당 채소 5쌍씩 = 11×5 = 55)
const lateVegPairs: [typeof L_VEGS[0], typeof L_VEGS[0]][] = [
  [L_VEGS[0], L_VEGS[2]], [L_VEGS[1], L_VEGS[8]], [L_VEGS[2], L_VEGS[5]],
  [L_VEGS[3], L_VEGS[6]], [L_VEGS[4], L_VEGS[8]], [L_VEGS[5], L_VEGS[9]],
  [L_VEGS[6], L_VEGS[2]], [L_VEGS[7], L_VEGS[3]], [L_VEGS[8], L_VEGS[9]],
  [L_VEGS[9], L_VEGS[3]], [L_VEGS[10], L_VEGS[2]], [L_VEGS[11], L_VEGS[8]],
  [L_VEGS[12], L_VEGS[3]], [L_VEGS[13], L_VEGS[4]], [L_VEGS[14], L_VEGS[2]],
  [L_VEGS[0], L_VEGS[6]], [L_VEGS[1], L_VEGS[5]], [L_VEGS[2], L_VEGS[8]],
  [L_VEGS[3], L_VEGS[9]], [L_VEGS[4], L_VEGS[5]], [L_VEGS[5], L_VEGS[8]],
  [L_VEGS[6], L_VEGS[9]], [L_VEGS[7], L_VEGS[2]], [L_VEGS[15], L_VEGS[8]],
  [L_VEGS[16], L_VEGS[2]], [L_VEGS[0], L_VEGS[9]], [L_VEGS[1], L_VEGS[3]],
  [L_VEGS[2], L_VEGS[3]], [L_VEGS[11], L_VEGS[4]], [L_VEGS[12], L_VEGS[8]],
  [L_VEGS[13], L_VEGS[8]], [L_VEGS[14], L_VEGS[3]], [L_VEGS[0], L_VEGS[10]],
  [L_VEGS[1], L_VEGS[11]], [L_VEGS[2], L_VEGS[10]], [L_VEGS[3], L_VEGS[5]],
  [L_VEGS[4], L_VEGS[3]], [L_VEGS[5], L_VEGS[3]], [L_VEGS[6], L_VEGS[3]],
  [L_VEGS[7], L_VEGS[5]], [L_VEGS[8], L_VEGS[3]], [L_VEGS[9], L_VEGS[8]],
  [L_VEGS[10], L_VEGS[8]], [L_VEGS[15], L_VEGS[3]], [L_VEGS[16], L_VEGS[4]],
  [L_VEGS[0], L_VEGS[7]], [L_VEGS[1], L_VEGS[2]], [L_VEGS[2], L_VEGS[7]],
  [L_VEGS[3], L_VEGS[7]], [L_VEGS[4], L_VEGS[7]], [L_VEGS[5], L_VEGS[4]],
  [L_VEGS[6], L_VEGS[7]], [L_VEGS[7], L_VEGS[9]], [L_VEGS[16], L_VEGS[8]],
  [L_VEGS[13], L_VEGS[3]],
];

for (const p of L_PROTEINS) {
  const pIdx = L_PROTEINS.indexOf(p);
  const start = (pIdx * 10) % lateVegPairs.length;
  const pairs5: [typeof L_VEGS[0], typeof L_VEGS[0]][] = [];
  for (let k = 0; k < 10; k++) pairs5.push(lateVegPairs[(start + k) % lateVegPairs.length]);
  for (const [v1,v2] of pairs5) {
    lateRecipes.push({
      id:'', nameKo:`${p.n}${v1.n}${v2.n}무른밥`, stage:'late', subType:'무른밥',
      ingredients:[
        {ingredientId:'rice', amount:'30g'},
        {ingredientId:p.id, amount:'30g'},
        {ingredientId:v1.id, amount:'25g'},
        {ingredientId:v2.id, amount:'20g'},
      ],
      steps:[
        {order:1, instructionKo:'쌀을 30분 불립니다.'},
        {order:2, instructionKo:`${p.n}을(를) 3~5mm 크기로 손질합니다.`},
        {order:3, instructionKo:`${v1.n}과 ${v2.n}을(를) 3~5mm 크기로 썹니다.`},
        {order:4, instructionKo:'냄비에 쌀, 채소, 물 90ml를 넣어 중불로 10분 끓입니다.'},
        {order:5, instructionKo:'단백질 재료를 넣고 약불에서 15분 더 익힙니다.'},
        {order:6, instructionKo:'잇몸으로 으깰 수 있는 무른 밥이 되면 완성입니다.'},
      ],
      prepTimeMin:35, servings:'1회분(150ml)', ricePortionRatio:'3배죽',
      allergenIngredientIds:alg([p.id]),
      tipsKo:`후기 이유식은 잇몸으로 으깰 수 있는 굳기입니다.`,
      sourceKo:SRC,
    });
  }
}

// 2) 핑거푸드 (20개)
const fingerFoods2: {nameKo:string; ids:{ingredientId:string;amount:string;optional?:boolean}[]; tip:string}[] = [
  {nameKo:'고구마스틱', ids:[{ingredientId:'sweet_potato',amount:'50g'}], tip:'쪄서 손가락 모양으로 자릅니다.'},
  {nameKo:'단호박핑거', ids:[{ingredientId:'pumpkin',amount:'50g'}], tip:'쪄서 큐브 모양으로 자릅니다.'},
  {nameKo:'바나나스틱', ids:[{ingredientId:'banana',amount:'50g'}], tip:'잘 익은 바나나를 4등분합니다.'},
  {nameKo:'아보카도스틱', ids:[{ingredientId:'avocado',amount:'40g'}], tip:'스틱 모양으로 자릅니다. 지방이 풍부합니다.'},
  {nameKo:'두부구이', ids:[{ingredientId:'tofu',amount:'50g'},{ingredientId:'olive_oil',amount:'1/2작은술'}], tip:'올리브유 살짝 발라 팬에 굽습니다.'},
  {nameKo:'브로콜리핑거', ids:[{ingredientId:'broccoli',amount:'40g'}], tip:'꽃 부분을 쪄서 줄기 잡고 먹게 합니다.'},
  {nameKo:'당근스틱', ids:[{ingredientId:'carrot',amount:'40g'}], tip:'스틱 모양으로 잘라 푹 쪄줍니다.'},
  {nameKo:'감자스틱', ids:[{ingredientId:'potato',amount:'50g'}], tip:'쪄서 스틱 모양으로 자릅니다.'},
  {nameKo:'블루베리(반으로)', ids:[{ingredientId:'blueberry',amount:'30g'}], tip:'반으로 잘라 제공합니다.'},
  {nameKo:'딸기핑거', ids:[{ingredientId:'strawberry',amount:'40g'}], tip:'세로로 4등분하여 제공합니다.'},
  {nameKo:'달걀스크램블', ids:[{ingredientId:'egg_whole',amount:'1개'},{ingredientId:'olive_oil',amount:'1/2작은술'}], tip:'소금 없이 스크램블 합니다. 알레르기 확인 필수.'},
  {nameKo:'고구마두부볼', ids:[{ingredientId:'sweet_potato',amount:'30g'},{ingredientId:'tofu',amount:'30g'}], tip:'섞어 볼 모양으로 빚어 쪄줍니다.'},
  {nameKo:'연어구이', ids:[{ingredientId:'salmon',amount:'30g'},{ingredientId:'olive_oil',amount:'1/2작은술'}], tip:'가시 완전 제거 후 팬에 굽습니다.'},
  {nameKo:'닭고기볼', ids:[{ingredientId:'chicken_breast',amount:'40g'},{ingredientId:'potato',amount:'20g'}], tip:'갈아 볼로 만들어 쪄줍니다.'},
  {nameKo:'새송이버섯구이', ids:[{ingredientId:'mushroom_king_oyster',amount:'40g'},{ingredientId:'olive_oil',amount:'1/2작은술'}], tip:'스틱 모양으로 잘라 팬에 가볍게 굽습니다.'},
  {nameKo:'단호박두부볼', ids:[{ingredientId:'pumpkin',amount:'30g'},{ingredientId:'tofu',amount:'30g'}], tip:'쪄서 으깨고 섞어 볼로 빚습니다.'},
  {nameKo:'사과채', ids:[{ingredientId:'apple',amount:'50g'}], tip:'껍질 벗겨 얇게 채 썰어 제공합니다.'},
  {nameKo:'포도(반으로)', ids:[{ingredientId:'grape',amount:'30g'}], tip:'씨를 제거하고 반으로 잘라 제공합니다.'},
  {nameKo:'딸기바나나핑거', ids:[{ingredientId:'strawberry',amount:'30g'},{ingredientId:'banana',amount:'30g'}], tip:'각각 손에 쥐기 좋은 크기로 자릅니다.'},
  {nameKo:'으깬감자볼', ids:[{ingredientId:'potato',amount:'60g'},{ingredientId:'olive_oil',amount:'1/2작은술'}], tip:'으깨어 둥글게 빚어 제공합니다.'},
];
for (const ff of fingerFoods2) {
  lateRecipes.push({
    id:'', nameKo:ff.nameKo, stage:'late', subType:'핑거푸드',
    ingredients:ff.ids,
    steps:[
      {order:1, instructionKo:'재료를 깨끗이 씻어 손질합니다.'},
      {order:2, instructionKo:'잇몸으로 부술 수 있는 굳기로 조리합니다.'},
      {order:3, instructionKo:'아기가 잡기 쉬운 크기(4~5cm)로 자릅니다.'},
      {order:4, instructionKo:'충분히 식힌 후 제공합니다.'},
    ],
    prepTimeMin:15, servings:'1회분',
    allergenIngredientIds:alg(ff.ids.map(i=>i.ingredientId)),
    tipsKo:ff.tip, sourceKo:SRC,
  });
}

// ══════════════════════════════════════════════════════════════
// FINISHING (완료기, 12-15개월) — 진밥/반찬/핑거푸드
// ══════════════════════════════════════════════════════════════

const F_PROTEINS = [
  {id:'beef_minced',    n:'소고기',     allergen:false},
  {id:'beef_sirloin',   n:'소고기안심', allergen:false},
  {id:'chicken_breast', n:'닭가슴살',   allergen:false},
  {id:'chicken_tender', n:'닭안심',     allergen:false},
  {id:'pork_loin',      n:'돼지안심',   allergen:false},
  {id:'cod',            n:'대구',       allergen:false},
  {id:'salmon',         n:'연어',       allergen:false},
  {id:'tofu',           n:'두부',       allergen:false},
  {id:'egg_whole',      n:'달걀',       allergen:true},
  {id:'black_bean',     n:'검은콩',     allergen:false},
  {id:'lentil',         n:'렌틸콩',     allergen:false},
  {id:'pollack',        n:'동태',       allergen:false},
];

const F_VEGS = [
  {id:'sweet_potato',       n:'고구마'},
  {id:'pumpkin',            n:'단호박'},
  {id:'carrot',             n:'당근'},
  {id:'zucchini',           n:'애호박'},
  {id:'potato',             n:'감자'},
  {id:'broccoli',           n:'브로콜리'},
  {id:'spinach',            n:'시금치'},
  {id:'cabbage',            n:'양배추'},
  {id:'onion',              n:'양파'},
  {id:'mushroom_shiitake',  n:'표고버섯'},
  {id:'mushroom_king_oyster',n:'새송이버섯'},
  {id:'corn',               n:'옥수수'},
  {id:'tomato',             n:'토마토'},
  {id:'seaweed_miyeok',     n:'미역'},
  {id:'green_onion',        n:'파'},
  {id:'perilla_leaf',       n:'깻잎'},
  {id:'asparagus',          n:'아스파라거스'},
  {id:'avocado',            n:'아보카도'},
];

const finishingRecipes: Recipe[] = [];

// 1) 진밥: 단백질×채소쌍 (12×6 = 72)
const finVegPairs: [typeof F_VEGS[0], typeof F_VEGS[0]][] = [
  [F_VEGS[0], F_VEGS[9]],  [F_VEGS[5], F_VEGS[8]],  [F_VEGS[6], F_VEGS[2]],
  [F_VEGS[1], F_VEGS[10]], [F_VEGS[11], F_VEGS[8]], [F_VEGS[13], F_VEGS[8]],
  [F_VEGS[2], F_VEGS[3]],  [F_VEGS[7], F_VEGS[2]],  [F_VEGS[4], F_VEGS[8]],
  [F_VEGS[15], F_VEGS[8]], [F_VEGS[14], F_VEGS[9]], [F_VEGS[16], F_VEGS[2]],
  [F_VEGS[0], F_VEGS[5]],  [F_VEGS[3], F_VEGS[9]],  [F_VEGS[12], F_VEGS[8]],
  [F_VEGS[6], F_VEGS[9]],  [F_VEGS[1], F_VEGS[3]],  [F_VEGS[17], F_VEGS[5]],
  [F_VEGS[9], F_VEGS[3]],  [F_VEGS[10], F_VEGS[3]], [F_VEGS[2], F_VEGS[7]],
  [F_VEGS[0], F_VEGS[3]],  [F_VEGS[11], F_VEGS[4]], [F_VEGS[8], F_VEGS[9]],
];

for (const p of F_PROTEINS) {
  const pairStart = (F_PROTEINS.indexOf(p) * 9) % finVegPairs.length;
  const pairs6 = [];
  for (let i = 0; i < 9; i++) pairs6.push(finVegPairs[(pairStart + i) % finVegPairs.length]);
  for (const [v1,v2] of pairs6) {
    finishingRecipes.push({
      id:'', nameKo:`${p.n}${v1.n}${v2.n}진밥`, stage:'finishing', subType:'진밥',
      ingredients:[
        {ingredientId:'rice', amount:'40g'},
        {ingredientId:p.id, amount:'35g'},
        {ingredientId:v1.id, amount:'25g'},
        {ingredientId:v2.id, amount:'20g'},
      ],
      steps:[
        {order:1, instructionKo:'쌀을 30분 불립니다.'},
        {order:2, instructionKo:`${p.n}을(를) 5~7mm 크기로 손질합니다.`},
        {order:3, instructionKo:`${v1.n}과 ${v2.n}을(를) 5~7mm 크기로 썹니다.`},
        {order:4, instructionKo:'냄비에 쌀과 물 80ml를 넣고 중불로 8분 끓입니다.'},
        {order:5, instructionKo:'재료를 모두 넣고 약불에서 10분 더 익힙니다.'},
        {order:6, instructionKo:'쌀알이 퍼지며 촉촉한 진밥이 되면 완성입니다.'},
      ],
      prepTimeMin:30, servings:'1회분(180ml)', ricePortionRatio:'2배죽',
      allergenIngredientIds:alg([p.id]),
      tipsKo:'완료기에는 씹는 연습이 중요합니다. 스스로 먹으려는 시도를 격려하세요.',
      sourceKo:SRC,
    });
  }
}

// 2) 반찬류 (20개)
const sideDishes2: {nameKo:string; subType:SubType; ids:{ingredientId:string;amount:string;optional?:boolean}[]; steps:RS[]; min:number; srv:string; tip:string; ratio?:string}[] = [
  {
    nameKo:'달걀찜', subType:'반찬',
    ids:[{ingredientId:'egg_whole',amount:'2개'},{ingredientId:'formula',amount:'50ml',optional:true}],
    steps:[
      {order:1,instructionKo:'달걀을 잘 풀어 체에 걸러줍니다.'},
      {order:2,instructionKo:'물(또는 분유) 50ml를 섞습니다.'},
      {order:3,instructionKo:'찜기에 넣고 중약불로 12분 찝니다.'},
    ],
    min:20, srv:'2회분', tip:'소금 없이 부드럽게 쪄서 줍니다.',
  },
  {
    nameKo:'두부조림(무염)', subType:'반찬',
    ids:[{ingredientId:'tofu',amount:'100g'},{ingredientId:'olive_oil',amount:'1작은술'}],
    steps:[
      {order:1,instructionKo:'두부를 1분 데칩니다.'},
      {order:2,instructionKo:'1cm 큐브로 자릅니다.'},
      {order:3,instructionKo:'팬에 올리브유를 두르고 노릇하게 굽습니다.'},
    ],
    min:15, srv:'2회분', tip:'소금 없이 두부 고유의 맛으로 조리합니다.',
  },
  {
    nameKo:'소고기완자', subType:'반찬',
    ids:[{ingredientId:'beef_minced',amount:'60g'},{ingredientId:'tofu',amount:'30g'},{ingredientId:'onion',amount:'20g'}],
    steps:[
      {order:1,instructionKo:'두부는 물기를 짜서 으깨고, 양파는 잘게 다집니다.'},
      {order:2,instructionKo:'소고기, 두부, 양파를 잘 섞습니다.'},
      {order:3,instructionKo:'2cm 볼로 빚어 찜기에서 10분 찝니다.'},
    ],
    min:25, srv:'10개', tip:'냉동 보관 가능합니다.',
  },
  {
    nameKo:'닭고기채소볶음', subType:'반찬',
    ids:[{ingredientId:'chicken_breast',amount:'50g'},{ingredientId:'broccoli',amount:'30g'},{ingredientId:'carrot',amount:'20g'},{ingredientId:'olive_oil',amount:'1작은술'}],
    steps:[
      {order:1,instructionKo:'닭고기를 5mm로 다집니다.'},
      {order:2,instructionKo:'채소를 작은 크기로 썹니다.'},
      {order:3,instructionKo:'팬에 올리브유 두르고 닭고기 먼저 볶습니다.'},
      {order:4,instructionKo:'채소 넣고 함께 볶습니다.'},
    ],
    min:20, srv:'2회분', tip:'소금 없이 재료 본연의 맛으로 조리합니다.',
  },
  {
    nameKo:'미역국(무염)', subType:'반찬',
    ids:[{ingredientId:'seaweed_miyeok',amount:'불린것50g'},{ingredientId:'beef_minced',amount:'30g'},{ingredientId:'olive_oil',amount:'1/2작은술'}],
    steps:[
      {order:1,instructionKo:'미역을 20분 불려 5cm로 자릅니다.'},
      {order:2,instructionKo:'소고기를 잘게 다집니다.'},
      {order:3,instructionKo:'냄비에 올리브유, 소고기, 미역을 볶습니다.'},
      {order:4,instructionKo:'물 300ml 붓고 15분 끓입니다.'},
    ],
    min:30, srv:'3회분', tip:'아기 것 먼저 떠두고 나머지에만 간을 합니다.',
  },
  {
    nameKo:'단호박죽(간식용)', subType:'반찬',
    ids:[{ingredientId:'pumpkin',amount:'100g'},{ingredientId:'formula',amount:'100ml',optional:true}],
    steps:[
      {order:1,instructionKo:'단호박을 쪄서 껍질을 제거합니다.'},
      {order:2,instructionKo:'믹서에 단호박과 물 100ml를 넣고 갑니다.'},
      {order:3,instructionKo:'약불로 5분 끓입니다.'},
    ],
    min:20, srv:'2회분', tip:'간식으로도 활용 가능합니다.',
  },
  {
    nameKo:'오트밀팬케이크', subType:'핑거푸드',
    ids:[{ingredientId:'oatmeal',amount:'40g'},{ingredientId:'banana',amount:'50g'},{ingredientId:'egg_whole',amount:'1개'}],
    steps:[
      {order:1,instructionKo:'바나나를 으깨고 달걀을 풀어 섞습니다.'},
      {order:2,instructionKo:'오트밀을 넣고 반죽을 만듭니다.'},
      {order:3,instructionKo:'기름 없이 팬에 작게 부칩니다.'},
    ],
    min:20, srv:'6~8개', tip:'달걀 알레르기 확인 후 시도합니다.',
  },
  {
    nameKo:'감자채소전', subType:'반찬',
    ids:[{ingredientId:'potato',amount:'80g'},{ingredientId:'carrot',amount:'20g'},{ingredientId:'zucchini',amount:'20g'},{ingredientId:'olive_oil',amount:'1작은술'}],
    steps:[
      {order:1,instructionKo:'감자를 갈아 전분물을 받아둡니다.'},
      {order:2,instructionKo:'당근, 애호박을 채 썰어 넣습니다.'},
      {order:3,instructionKo:'전분물 다시 넣어 반죽을 완성합니다.'},
      {order:4,instructionKo:'팬에 올리브유 두르고 약불로 앞뒤 굽습니다.'},
    ],
    min:25, srv:'3~4조각', tip:'소금 없이도 재료 고유 맛이 납니다.',
  },
  {
    nameKo:'검은콩밥(진밥)', subType:'진밥',
    ids:[{ingredientId:'rice',amount:'40g'},{ingredientId:'black_bean',amount:'10g'}],
    steps:[
      {order:1,instructionKo:'검은콩을 2시간 이상 불립니다.'},
      {order:2,instructionKo:'쌀도 30분 불립니다.'},
      {order:3,instructionKo:'냄비에 쌀, 콩, 물 90ml 넣고 밥을 짓습니다.'},
      {order:4,instructionKo:'약불에서 15분 뜸 들입니다.'},
    ],
    min:25, srv:'1회분(160ml)', ratio:'2배죽', tip:'검은콩은 철분이 풍부합니다.',
  },
  {
    nameKo:'연두부볼', subType:'핑거푸드',
    ids:[{ingredientId:'tofu',amount:'80g'},{ingredientId:'sweet_potato',amount:'40g'}],
    steps:[
      {order:1,instructionKo:'두부는 물기를 짜서 으깹니다.'},
      {order:2,instructionKo:'고구마를 쪄서 으깹니다.'},
      {order:3,instructionKo:'섞어서 볼 모양으로 빚어 찝니다.'},
    ],
    min:20, srv:'8~10개', tip:'냉장 2일 보관 가능합니다.',
  },
  {
    nameKo:'소고기미역국', subType:'반찬',
    ids:[{ingredientId:'beef_sirloin',amount:'40g'},{ingredientId:'seaweed_miyeok',amount:'불린것60g'},{ingredientId:'olive_oil',amount:'1/2작은술'}],
    steps:[
      {order:1,instructionKo:'소고기를 잘게 다집니다.'},
      {order:2,instructionKo:'미역을 불려 5cm로 자릅니다.'},
      {order:3,instructionKo:'냄비에 볶다가 물 400ml를 붓고 20분 끓입니다.'},
    ],
    min:35, srv:'4회분', tip:'무염으로 만들어 아기 분량을 먼저 떠둡니다.',
  },
  {
    nameKo:'닭고기두부완자', subType:'반찬',
    ids:[{ingredientId:'chicken_breast',amount:'50g'},{ingredientId:'tofu',amount:'40g'},{ingredientId:'carrot',amount:'20g'}],
    steps:[
      {order:1,instructionKo:'닭고기를 갈거나 잘게 다집니다.'},
      {order:2,instructionKo:'두부 물기를 짜서 섞고 당근을 다져 넣습니다.'},
      {order:3,instructionKo:'볼 모양으로 빚어 찜기에서 12분 찝니다.'},
    ],
    min:25, srv:'10개', tip:'한 번에 여러 개 만들어 냉동 보관합니다.',
  },
  {
    nameKo:'달걀토마토볶음', subType:'반찬',
    ids:[{ingredientId:'egg_whole',amount:'2개'},{ingredientId:'tomato',amount:'50g'},{ingredientId:'olive_oil',amount:'1작은술'}],
    steps:[
      {order:1,instructionKo:'토마토 껍질을 제거하고 작게 자릅니다.'},
      {order:2,instructionKo:'달걀을 풀어둡니다.'},
      {order:3,instructionKo:'팬에 올리브유 두르고 토마토 볶은 후 달걀 넣어 스크램블 합니다.'},
    ],
    min:15, srv:'2회분', tip:'달걀 알레르기 확인 후 제공합니다.',
  },
  {
    nameKo:'연어아보카도볼', subType:'핑거푸드',
    ids:[{ingredientId:'salmon',amount:'30g'},{ingredientId:'avocado',amount:'30g'},{ingredientId:'rice',amount:'20g'}],
    steps:[
      {order:1,instructionKo:'연어를 쪄서 으깹니다.'},
      {order:2,instructionKo:'아보카도를 으깹니다.'},
      {order:3,instructionKo:'밥과 함께 섞어 볼 모양으로 빚습니다.'},
    ],
    min:20, srv:'6개', tip:'건강한 지방이 풍부한 조합입니다.',
  },
  {
    nameKo:'렌틸콩수프', subType:'반찬',
    ids:[{ingredientId:'lentil',amount:'30g'},{ingredientId:'carrot',amount:'30g'},{ingredientId:'onion',amount:'20g'},{ingredientId:'olive_oil',amount:'1작은술'}],
    steps:[
      {order:1,instructionKo:'렌틸콩을 30분 불립니다.'},
      {order:2,instructionKo:'당근, 양파를 작게 썰어 볶습니다.'},
      {order:3,instructionKo:'렌틸콩, 물 200ml 넣고 20분 끓입니다.'},
    ],
    min:35, srv:'3회분', tip:'렌틸콩은 철분이 풍부하고 소화가 잘 됩니다.',
  },
  {
    nameKo:'단호박스프', subType:'반찬',
    ids:[{ingredientId:'pumpkin',amount:'150g'},{ingredientId:'onion',amount:'30g'},{ingredientId:'olive_oil',amount:'1작은술'}],
    steps:[
      {order:1,instructionKo:'단호박을 쪄서 속을 파냅니다.'},
      {order:2,instructionKo:'양파를 볶아 단호박과 물 100ml와 믹서에 갑니다.'},
      {order:3,instructionKo:'냄비에 넣고 5분 끓입니다.'},
    ],
    min:25, srv:'3회분', tip:'비타민A가 풍부합니다.',
  },
  {
    nameKo:'두부달걀찜', subType:'반찬',
    ids:[{ingredientId:'tofu',amount:'60g'},{ingredientId:'egg_whole',amount:'2개'}],
    steps:[
      {order:1,instructionKo:'두부를 으깨고 달걀을 풀어 섞습니다.'},
      {order:2,instructionKo:'찜기에 넣고 중약불로 12분 찝니다.'},
    ],
    min:20, srv:'2회분', tip:'달걀 알레르기 확인 후 제공합니다.',
  },
  {
    nameKo:'닭고기수프', subType:'반찬',
    ids:[{ingredientId:'chicken_tender',amount:'50g'},{ingredientId:'potato',amount:'40g'},{ingredientId:'onion',amount:'20g'}],
    steps:[
      {order:1,instructionKo:'닭안심, 감자, 양파를 작게 자릅니다.'},
      {order:2,instructionKo:'물 250ml 넣고 20분 끓입니다.'},
      {order:3,instructionKo:'핸드블렌더로 반만 갑니다.'},
    ],
    min:30, srv:'3회분', tip:'소금 없이 닭고기 자체의 맛을 살립니다.',
  },
  {
    nameKo:'소고기시금치볶음', subType:'반찬',
    ids:[{ingredientId:'beef_minced',amount:'50g'},{ingredientId:'spinach',amount:'40g'},{ingredientId:'olive_oil',amount:'1작은술'}],
    steps:[
      {order:1,instructionKo:'시금치를 데쳐 물기를 짜고 다집니다.'},
      {order:2,instructionKo:'소고기를 잘게 다집니다.'},
      {order:3,instructionKo:'팬에 올리브유 두르고 소고기 먼저 볶고 시금치 넣어 볶습니다.'},
    ],
    min:20, srv:'2회분', tip:'철분이 풍부한 조합입니다.',
  },
  {
    nameKo:'사과요거트(간식)', subType:'반찬',
    ids:[{ingredientId:'apple',amount:'50g'},{ingredientId:'plain_yogurt',amount:'80g'}],
    steps:[
      {order:1,instructionKo:'사과를 껍질 벗겨 잘게 다집니다.'},
      {order:2,instructionKo:'플레인 요거트와 섞어줍니다.'},
    ],
    min:10, srv:'1회분', tip:'유제품 알레르기 확인 후 제공합니다.',
  },
];
for (const r of sideDishes2) {
  finishingRecipes.push({
    id:'', nameKo:r.nameKo, stage:'finishing', subType:r.subType,
    ingredients:r.ids,
    steps:r.steps,
    prepTimeMin:r.min, servings:r.srv, ricePortionRatio:r.ratio,
    allergenIngredientIds:alg(r.ids.map(i=>i.ingredientId)),
    tipsKo:r.tip, sourceKo:SRC,
  });
}

// ══════════════════════════════════════════════════════════════
// 번호 부여 및 저장
// ══════════════════════════════════════════════════════════════

function assignIds(recipes: Recipe[], stage: Stage): Recipe[] {
  return recipes.map((r, i) => ({ ...r, id: `${stage}_${String(i + 1).padStart(3, '0')}` }));
}

const allRecipes: Recipe[] = [
  ...assignIds(earlyRecipes, 'early'),
  ...assignIds(middleRecipes, 'middle'),
  ...assignIds(lateRecipes, 'late'),
  ...assignIds(finishingRecipes, 'finishing'),
];

const outputPath = join(__dirname, '../src/data/recipes.json');
writeFileSync(outputPath, JSON.stringify(allRecipes, null, 2), 'utf-8');

const counts = allRecipes.reduce((acc, r) => { acc[r.stage]++; return acc; }, {early:0,middle:0,late:0,finishing:0} as Record<Stage,number>);
console.log('✅ recipes.json 생성 완료');
console.log(`  초기(early):       ${counts.early}개`);
console.log(`  중기(middle):      ${counts.middle}개`);
console.log(`  후기(late):        ${counts.late}개`);
console.log(`  완료기(finishing): ${counts.finishing}개`);
console.log(`  총계: ${allRecipes.length}개`);
