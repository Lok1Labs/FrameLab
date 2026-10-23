// Generates a static Russian dictionary from the existing UI copy.
// Translation requests happen only when this maintenance script is run.
import fs from "node:fs";
import ts from "typescript";

const normalize = (value) => value.replace(/\s+/g, " ").trim();
const propertyNames = new Set([
  "label", "title", "description", "name", "placeholder", "text",
  "heading", "tooltip", "message", "subtitle", "caption", "alt",
  "summary", "question", "answer", "q", "a", "body", "intro",
  "eyebrow", "buttonText", "emptyMessage", "errorMessage",
  "action", "cta", "badge", "tagline", "hint", "note", "value",
]);
const attributeNames = new Set(["title", "placeholder", "aria-label", "alt", "label"]);
const roots = ["app", "components", "lib"];
const candidates = new Set();

function add(value) {
  const text = normalize(value);
  if (text.length < 2 || text.length > 900 || !/[a-z]{2}/i.test(text)) return;
  if (/https?:\/\/|^[\/\.\#]|^(?:className|rgba\(|rgb\(|var\(|console\.|process\.|import |export |const |function )/.test(text)) return;
  if (/^[a-z0-9_-]+$/.test(text) && text.length > 24) return;
  candidates.add(text);
}

for (const root of roots) {
  for (const relative of fs.readdirSync(root, { recursive: true })) {
    if (!/\.tsx?$/.test(relative)) continue;
    const file = `${root}/${relative}`;
    const source = ts.createSourceFile(file, fs.readFileSync(file, "utf8"), ts.ScriptTarget.Latest, true);
    function visit(node) {
      if (ts.isJsxText(node)) add(node.getText(source));
      if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) {
        const parent = node.parent;
        if (ts.isJsxAttribute(parent) && attributeNames.has(parent.name.text)) add(node.text);
        if (ts.isPropertyAssignment(parent) && propertyNames.has(parent.name.getText(source))) add(node.text);
        if (ts.isArrayLiteralExpression(parent) && !/[{}<>/]|\b(?:px|rem|#[0-9a-f]{3,8})\b/i.test(node.text)) add(node.text);
        if (ts.isCallExpression(parent) && /\btoast\./.test(parent.expression.getText(source))) add(node.text);
        if (!ts.isJsxAttribute(parent) && /[A-Z]/.test(node.text) &&
            !/[{}<>]/.test(node.text) && !/^\s*(?:[\w.-]+\/|#|--)/.test(node.text)) add(node.text);
      }
      ts.forEachChild(node, visit);
    }
    visit(source);
  }
}

const english = JSON.parse(fs.readFileSync("messages/en.json", "utf8"));
function collect(value) {
  if (typeof value === "string") add(value);
  else if (value && typeof value === "object") Object.values(value).forEach(collect);
}
collect(english);
if (fs.existsSync("localization/browser-copy.json")) {
  for (const value of JSON.parse(fs.readFileSync("localization/browser-copy.json", "utf8"))) add(value);
}

const dictionaryPath = "messages/ru-ui.json";
const dictionary = fs.existsSync(dictionaryPath)
  ? JSON.parse(fs.readFileSync(dictionaryPath, "utf8"))
  : {};
const untranslated = [...candidates].filter((value) => !dictionary[value]);
const batches = [];
let batch = [];
let length = 0;
for (const value of untranslated) {
  if (batch.length && (length + value.length > 650 || batch.length >= 12)) {
    batches.push(batch);
    batch = [];
    length = 0;
  }
  batch.push(value);
  length += value.length;
}
if (batch.length) batches.push(batch);

async function request(text) {
  const url = new URL("https://translate.googleapis.com/translate_a/single");
  url.search = new URLSearchParams({ client: "gtx", sl: "en", tl: "ru", dt: "t", q: text });
  for (let attempt = 0; attempt < 4; attempt++) {
    try {
      const response = await fetch(url, { signal: AbortSignal.timeout(15000) });
      if (!response.ok) throw new Error(`Translation HTTP ${response.status}`);
      const body = await response.json();
      return body[0].map((part) => part[0]).join("").trim();
    } catch (error) {
      if (attempt === 3) throw error;
      await new Promise((resolve) => setTimeout(resolve, 400 * (attempt + 1)));
    }
  }
}

let next = 0;
await Promise.all(Array.from({ length: 6 }, async () => {
  while (next < batches.length) {
    const index = next++;
    const group = batches[index];
    let translated = (await request(group.join(" ¶ "))).split(/\s*¶\s*/);
    if (translated.length !== group.length) {
      translated = await Promise.all(group.map(request));
    }
    group.forEach((source, position) => {
      dictionary[source] = normalize(translated[position] || source);
    });
    if (index % 25 === 0) console.log(`${index + 1}/${batches.length} batches`);
  }
}));

const overrides = {
  FrameLab: "FrameLab", Lok1Labs: "Lok1Labs", "GitHub": "GitHub",
  "Telegram": "Telegram", "PNG": "PNG", "JPEG": "JPEG", "WebP": "WebP",
  "MP4": "MP4", "GIF": "GIF", "X": "X", "Safari": "Safari", "Chrome": "Chrome",
  "Open Editor": "Открыть редактор", "Save": "Сохранить", "Copy": "Копировать",
  "Upload": "Загрузить", "Templates": "Шаблоны", "Background": "Фон",
  "Settings": "Настройки", "Export": "Экспорт", "Cancel": "Отмена",
  "Animate": "Анимация", "No layers": "Нет слоёв", "Hug": "Плотная тень",
  "Best quality, larger file": "Лучшее качество, файл большего размера",
  "85% quality, sharp & shareable": "Качество 85% — чёткое изображение для публикации",
  "82% quality, smallest file": "Качество 82% — небольшой файл",
  "Lossless, better compression": "Без потерь, более сильное сжатие",
  "75% quality, good compression": "Качество 75% — хорошее сжатие",
  "72% quality, very small file": "Качество 72% — очень небольшой файл",
  "Lossless, max compression": "Без потерь, максимальное сжатие",
  "60% quality, maximum compression": "Качество 60% — максимальное сжатие",
  "55% quality, tiny file": "Качество 55% — минимальный размер файла",
  "Undo": "Отменить", "Redo": "Повторить", "Reset": "Сбросить",
  "Contact Developer": "Связаться с разработчиком",
};
Object.assign(dictionary, overrides);
for (const key of Object.keys(dictionary)) {
  dictionary[key] = dictionary[key].replaceAll("КадрЛаб", "FrameLab");
}
fs.writeFileSync(dictionaryPath, `${JSON.stringify(Object.fromEntries(Object.entries(dictionary).sort(([a], [b]) => a.localeCompare(b))), null, 2)}\n`);

function translateTree(value) {
  if (typeof value === "string") return dictionary[normalize(value)] || value;
  if (Array.isArray(value)) return value.map(translateTree);
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, translateTree(item)]));
  }
  return value;
}
fs.writeFileSync("messages/ru.json", `${JSON.stringify(translateTree(english), null, 2)}\n`);
console.log(`${Object.keys(dictionary).length} static translations written`);
