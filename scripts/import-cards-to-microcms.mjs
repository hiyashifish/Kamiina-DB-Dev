import { readFile } from "node:fs/promises";

const serviceDomain = process.env.MICROCMS_SERVICE_DOMAIN;
const apiKey = process.env.MICROCMS_WRITE_API_KEY;
const endpoint = process.env.MICROCMS_ENDPOINT || "cards";

if (!serviceDomain || !apiKey) {
  console.error(
    "MICROCMS_SERVICE_DOMAIN と MICROCMS_WRITE_API_KEY を設定してください。",
  );
  process.exit(1);
}

const source = new URL("../src/data/cards.json", import.meta.url);
const cards = JSON.parse(await readFile(source, "utf8"));
const apiUrl = `https://${serviceDomain}.microcms.io/api/v1/${endpoint}`;

const currentResponse = await fetch(`${apiUrl}?limit=1&fields=id`, {
  headers: { "X-MICROCMS-API-KEY": apiKey },
});

if (!currentResponse.ok) {
  const body = await currentResponse.text();
  throw new Error(
    `登録前の件数確認に失敗しました (${currentResponse.status}): ${body}`,
  );
}

const { totalCount } = await currentResponse.json();
if (totalCount > cards.length) {
  throw new Error(
    `microCMSに移行元より多い${totalCount}件があります。登録を中止しました。`,
  );
}

if (totalCount > 0) {
  console.log(`登録済みの${totalCount}件を飛ばして再開します。`);
}

for (const [index, card] of cards.entries()) {
  if (index < totalCount) continue;
  const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-MICROCMS-API-KEY": apiKey,
      },
      body: JSON.stringify({
        episode: card.id,
        title: card.title,
        caption: card.caption,
        description: card.description,
        tag: [card.tag],
        href: card.href || "#",
      }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(
      `${index + 1}/${cards.length}件目の登録に失敗しました (${response.status}): ${body}`,
    );
  }

  console.log(`${index + 1}/${cards.length}: ${card.title}`);
  // WRITE APIのレート制限に余裕を持たせる。
  await new Promise((resolve) => setTimeout(resolve, 250));
}

console.log(`${cards.length}件の移行が完了しました。`);
