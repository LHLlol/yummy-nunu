export interface DishExtractionResult {
  dishName: string | null;
  candidates: string[];
  confidence: number;
  message?: string;
}

const KNOWN_DISHES = [
  "蒜香排骨",
  "糖醋排骨",
  "红烧排骨",
  "红烧肉",
  "可乐鸡翅",
  "麻辣香锅",
  "麻婆豆腐",
  "酸菜鱼",
  "水煮鱼",
  "水煮肉片",
  "番茄牛腩",
  "黄焖鸡",
  "辣子鸡",
  "宫保鸡丁",
  "小龙虾",
  "烤鱼",
  "烤肉",
  "炸鸡",
  "火锅",
  "冒烤鸭",
  "螺蛳粉",
  "牛肉面",
  "拌饭",
  "炒年糕",
  "烤冷面",
  "煎饼果子",
  "肉夹馍",
  "汉堡",
  "披萨",
  "蛋糕",
  "甜品",
  "奶茶",
  "生腌",
];

const DISH_SUFFIX_PATTERN =
  /[\u4e00-\u9fa5A-Za-z0-9]{1,10}(?:排骨|小排|牛腩|牛肉|肥牛|鸡翅|鸡腿|鸡|鸭|鱼|虾|蟹|豆腐|火锅|香锅|烤肉|烤鱼|拌饭|炒饭|盖饭|米饭|面|粉|年糕|冷面|饼|包|丸|汤|粥|串|汉堡|披萨|蛋糕|甜品|奶茶)/g;

const DIRTY_WORDS = [
  "抖音",
  "小红书",
  "复制",
  "链接",
  "打开",
  "分享",
  "视频",
  "笔记",
  "教程",
  "做法",
  "主页",
  "今天",
  "这个",
  "真的",
  "一定",
];

function cleanCandidate(candidate: string): string {
  return candidate
    .replace(/[#@【】《》（）()，。！？!?:：；;、\s]/g, "")
    .replace(/^(想吃|爱吃|试试|收藏|学做|安排|这个|一份)/, "")
    .replace(/(教程|做法|美食|配方|笔记|视频|链接|分享)$/g, "")
    .trim();
}

function isUsefulCandidate(candidate: string): boolean {
  return (
    candidate.length >= 2 &&
    candidate.length <= 12 &&
    !DIRTY_WORDS.some((word) => candidate.includes(word))
  );
}

function uniqueCandidates(candidates: string[]): string[] {
  return Array.from(new Set(candidates.map(cleanCandidate).filter(isUsefulCandidate))).slice(0, 5);
}

export function extractDishNameFromText(text: string): DishExtractionResult {
  const normalizedText = text.replace(/\s+/g, " ");
  const exactMatches = KNOWN_DISHES.filter((dish) => normalizedText.includes(dish));

  if (exactMatches.length > 0) {
    const candidates = uniqueCandidates([
      ...exactMatches,
      ...exactMatches.map((dish) => dish.replace(/^(蒜香|糖醋|红烧|麻辣|番茄|可乐)/, "")),
    ]);

    return {
      dishName: candidates[0],
      candidates,
      confidence: 0.86,
    };
  }

  const suffixMatches = uniqueCandidates(normalizedText.match(DISH_SUFFIX_PATTERN) ?? []);

  if (suffixMatches.length > 0) {
    return {
      dishName: suffixMatches[0],
      candidates: suffixMatches,
      confidence: 0.58,
    };
  }

  const desireMatch = normalizedText.match(
    /(?:想吃|想试|安排|馋|收藏|下次做|今晚吃)([\u4e00-\u9fa5A-Za-z0-9]{2,12})/,
  );
  const desireCandidate = desireMatch?.[1] ? cleanCandidate(desireMatch[1]) : null;

  if (desireCandidate && isUsefulCandidate(desireCandidate)) {
    return {
      dishName: desireCandidate,
      candidates: [desireCandidate],
      confidence: 0.42,
      message: "根据分享文案猜到的低置信度菜名",
    };
  }

  return {
    dishName: "神秘下饭菜",
    candidates: ["神秘下饭菜"],
    confidence: 0.24,
    message: "未识别到明确菜名，先用低置信度心愿占位",
  };
}
