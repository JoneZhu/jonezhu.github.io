// 把 Markdown 正文转成纯文本，仅用于搜索索引与摘要。
// 不使用 innerHTML，调用方以 textContent 安全输出。
// 代码块只去掉围栏、保留内容，方便检索代码符号。

/** 去掉 Markdown 记号但保留正文与代码内容。 */
export function toPlainText(markdown) {
  const source = String(markdown ?? '');
  const codeBlocks = [];
  const withoutFences = source.replace(/```[^\n]*\n([\s\S]*?)```/g, (_m, code) => {
    codeBlocks.push(code);
    return ' \u0000CODE\u0000 ';
  });

  const cleaned = withoutFences
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/<[^>]+>/g, ' ')
    .replace(/^\s{0,3}#{1,6}\s*/gm, '')
    .replace(/[#>*_~|]/g, ' ')
    .replace(/`([^`]*)`/g, '$1')
    .replace(/\s+/g, ' ')
    .trim();

  const code = codeBlocks.join(' ').replace(/\s+/g, ' ').trim();
  return [cleaned, code].filter(Boolean).join(' ');
}

/** 截取纯文本前 limit 个字符，超出以省略号结尾。 */
export function truncate(text, limit = 140) {
  const t = String(text ?? '');
  if (t.length <= limit) return t;
  return t.slice(0, limit).trimEnd() + '…';
}
