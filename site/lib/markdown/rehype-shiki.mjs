import { codeToHast } from "shiki";

const DEFAULT_THEMES = {
  light: "catppuccin-latte",
  dark: "catppuccin-mocha",
};

const LANGUAGE_ALIASES = {
  js: "javascript",
  jsx: "jsx",
  ts: "typescript",
  tsx: "tsx",
  py: "python",
  rs: "rust",
  sh: "bash",
  shell: "bash",
  plaintext: "text",
  plain: "text",
};

function getClassNames(node) {
  const className = node.properties?.className ?? node.properties?.class;

  if (Array.isArray(className)) {
    return className.map(String);
  }

  return typeof className === "string" ? className.split(/\s+/) : [];
}

function getLanguage(node) {
  const languageClass = getClassNames(node).find((name) =>
    name.startsWith("language-"),
  );

  return languageClass?.slice("language-".length) || "text";
}

function getText(node) {
  if (node.type === "text") {
    return node.value;
  }

  if (Array.isArray(node.children)) {
    return node.children.map(getText).join("");
  }

  return "";
}

function isElement(node, tagName) {
  return node?.type === "element" && node.tagName === tagName;
}

function getCodeElement(pre) {
  return pre.children?.find((child) => isElement(child, "code"));
}

async function highlightCodeBlock(code, language, themes) {
  const normalizedLanguage = LANGUAGE_ALIASES[language] || language;

  try {
    return await codeToHast(code, {
      lang: normalizedLanguage,
      themes,
      defaultColor: false,
    });
  } catch {
    // An unknown fence language should never make an otherwise valid post
    // unbuildable. Shiki's text grammar keeps the source visible and copied.
    return await codeToHast(code, {
      lang: "text",
      themes,
      defaultColor: false,
    });
  }
}

async function transformTree(node, themes) {
  if (!Array.isArray(node?.children)) {
    return;
  }

  for (let index = 0; index < node.children.length; index += 1) {
    const child = node.children[index];

    if (isElement(child, "pre")) {
      const codeElement = getCodeElement(child);

      if (!codeElement) {
        continue;
      }

      const language = getLanguage(codeElement);
      const source = getText(codeElement);
      const highlighted = await highlightCodeBlock(source, language, themes);
      const highlightedPre = highlighted.children.find((item) =>
        isElement(item, "pre"),
      );

      if (!highlightedPre) {
        continue;
      }

      const highlightedProperties = { ...highlightedPre.properties };
      delete highlightedProperties.className;
      highlightedPre.properties = {
        ...highlightedProperties,
        class: [...getClassNames(highlightedPre), "code-block"].join(" "),
        "data-language": language,
      };

      const highlightedCode = getCodeElement(highlightedPre);

      if (highlightedCode) {
        highlightedCode.properties = {
          ...highlightedCode.properties,
          "data-code-block": "true",
        };
      }

      node.children[index] = highlightedPre;
      continue;
    }

    await transformTree(child, themes);
  }
}

/**
 * Replaces MDX-generated fenced-code `<pre>` nodes with static Shiki HTML.
 * Both Catppuccin themes are emitted into the same document so the existing
 * `next-themes` `.dark` class can switch them without client JavaScript.
 */
export default function rehypeShiki(options = {}) {
  const themes = options.themes || DEFAULT_THEMES;

  return async function transform(tree) {
    await transformTree(tree, themes);
  };
}
