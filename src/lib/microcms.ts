import fallbackCards from "../data/cards.json";

export interface CardItem {
  id: number;
  title: string;
  caption: string;
  description: string;
  tag: string | string[];
  href: string;
}

interface MicroCMSCard {
  id: string;
  episode: number;
  title: string;
  caption?: string;
  description?: string;
  tag: string;
  href: string;
}

interface MicroCMSListResponse {
  contents: MicroCMSCard[];
  totalCount: number;
  offset: number;
  limit: number;
}

const PAGE_SIZE = 100;

export async function getCards(): Promise<CardItem[]> {
  const serviceDomain = import.meta.env.MICROCMS_SERVICE_DOMAIN;
  const apiKey = import.meta.env.MICROCMS_API_KEY;
  const endpoint = import.meta.env.MICROCMS_ENDPOINT || "cards";

  // microCMSの設定前も、既存JSONでローカル開発できるようにする。
  if (!serviceDomain || !apiKey) return fallbackCards as CardItem[];

  const cards: CardItem[] = [];
  let offset = 0;
  let totalCount = Infinity;

  while (offset < totalCount) {
    const url = new URL(
      `https://${serviceDomain}.microcms.io/api/v1/${endpoint}`,
    );
    url.searchParams.set("limit", String(PAGE_SIZE));
    url.searchParams.set("offset", String(offset));
    url.searchParams.set(
      "fields",
      "id,episode,title,caption,description,tag,href",
    );

    const response = await fetch(url, {
      headers: { "X-MICROCMS-API-KEY": apiKey },
    });

    if (!response.ok) {
      throw new Error(
        `microCMSからコンテンツを取得できませんでした (${response.status})`,
      );
    }

    const page = (await response.json()) as MicroCMSListResponse;
    cards.push(
      ...page.contents.map((item) => ({
        id: item.episode,
        title: item.title,
        caption: item.caption ?? "",
        description: item.description ?? "",
        tag: Array.isArray(item.tag) ? (item.tag[0] ?? "") : item.tag,
        href: item.href,
      })),
    );
    totalCount = page.totalCount;
    offset += page.contents.length;

    if (page.contents.length === 0) break;
  }

  return cards.sort((a, b) => a.id - b.id);
}
