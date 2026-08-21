// GENERATED FILE - DO NOT EDIT.
//
// Bundled from src/lib/utils/script-triage.ts by scripts/build-skill-validator.mjs.
// This is the SAME routing the f0 importer uses, so the skill's validator and
// the product cannot disagree about whether a script converts or sinks.
//
// Regenerate: npm run build:skill-validator
// src/lib/interactions/import/gsap-loop-target.ts
var NESTED_TARGET_RE = /^([A-Za-z_$][\w$]*)\s*\.\s*querySelectorAll\s*\(\s*(['"`])([^'"`]+)\2\s*\)$/;
function isGsapLoopQueryTarget(expression) {
  return NESTED_TARGET_RE.test(expression.trim());
}

// src/lib/utils/script-triage.ts
function stripComments(src) {
  let out = "";
  let i = 0;
  let quote = null;
  let escaped = false;
  while (i < src.length) {
    const ch = src[i];
    if (quote) {
      out += ch;
      if (escaped) {
        escaped = false;
        i++;
        continue;
      }
      if (ch === "\\") {
        escaped = true;
        i++;
        continue;
      }
      if (ch === quote) quote = null;
      i++;
      continue;
    }
    if (ch === '"' || ch === "'" || ch === "`") {
      quote = ch;
      out += ch;
      i++;
      continue;
    }
    if (ch === "/" && src[i + 1] === "/") {
      i += 2;
      while (i < src.length && src[i] !== "\n") i++;
      continue;
    }
    if (ch === "/" && src[i + 1] === "*") {
      i += 2;
      while (i < src.length && !(src[i] === "*" && src[i + 1] === "/")) i++;
      if (i < src.length) i += 2;
      continue;
    }
    out += ch;
    i++;
  }
  return out;
}
function matchBracket(text, openIdx) {
  const open = text[openIdx];
  const close = open === "(" ? ")" : open === "{" ? "}" : open === "[" ? "]" : "";
  if (!close) return -1;
  let depth = 0;
  let quote = null;
  let escaped = false;
  for (let i = openIdx; i < text.length; i++) {
    const ch = text[i];
    if (quote) {
      if (escaped) {
        escaped = false;
        continue;
      }
      if (ch === "\\") {
        escaped = true;
        continue;
      }
      if (ch === quote) quote = null;
      continue;
    }
    if (ch === '"' || ch === "'" || ch === "`") {
      quote = ch;
      continue;
    }
    if (ch === open) depth++;
    else if (ch === close) {
      depth--;
      if (depth === 0) return i;
    }
  }
  return -1;
}
function splitTopLevelArgs(argsText) {
  const out = [];
  let depth = 0;
  let buf = "";
  let quote = null;
  let escaped = false;
  for (const ch of argsText) {
    if (quote) {
      buf += ch;
      if (escaped) {
        escaped = false;
        continue;
      }
      if (ch === "\\") {
        escaped = true;
        continue;
      }
      if (ch === quote) quote = null;
      continue;
    }
    if (ch === '"' || ch === "'" || ch === "`") {
      quote = ch;
      buf += ch;
      continue;
    }
    if (ch === "(" || ch === "{" || ch === "[") {
      depth++;
      buf += ch;
      continue;
    }
    if (ch === ")" || ch === "}" || ch === "]") {
      depth = Math.max(0, depth - 1);
      buf += ch;
      continue;
    }
    if (ch === "," && depth === 0) {
      out.push(buf.trim());
      buf = "";
      continue;
    }
    buf += ch;
  }
  if (buf.trim()) out.push(buf.trim());
  return out;
}
function isStringLiteral(arg) {
  const value = arg.trim();
  return /^'(?:[^'\\]|\\.)*'$/.test(value) || /^"(?:[^"\\]|\\.)*"$/.test(value) || /^`(?:[^`\\$]|\\.|\$(?!\{))*`$/.test(value);
}
var NESTED_OBJECT_VAR_KEYS = /* @__PURE__ */ new Set([
  "scrollTrigger",
  "stagger",
  "motionPath",
  "svgDraw",
  "svgMorph",
  "textSplit",
  "mediaControl",
  "imageSequence"
]);
function varsObjectIsConvertible(argsBody) {
  const parts = splitTopLevelArgs(argsBody);
  for (const part of parts) {
    if (!part) continue;
    const colon = topLevelColon(part);
    if (colon === -1) return false;
    const value = part.slice(colon + 1).trim();
    if (!value) return false;
    if (/=>/.test(value)) return false;
    if (/\bfunction\b/.test(value)) return false;
    if (value.includes("`")) return false;
    if (value.startsWith("[")) return false;
    if (value.startsWith("{")) {
      const key = part.slice(0, colon).trim().replace(/^['"`]|['"`]$/g, "");
      if (!NESTED_OBJECT_VAR_KEYS.has(key)) return false;
      const innerOpen = value.indexOf("{");
      const innerClose = matchBracket(value, innerOpen);
      if (innerClose === -1) return false;
      const inner = value.slice(innerOpen + 1, innerClose);
      if (!varsObjectIsConvertible(inner)) return false;
    }
  }
  return true;
}
function topLevelColon(part) {
  let depth = 0;
  let quote = null;
  for (let i = 0; i < part.length; i++) {
    const ch = part[i];
    if (quote) {
      if (ch === quote) quote = null;
      continue;
    }
    if (ch === '"' || ch === "'" || ch === "`") {
      quote = ch;
      continue;
    }
    if (ch === "(" || ch === "{" || ch === "[") {
      depth++;
      continue;
    }
    if (ch === ")" || ch === "}" || ch === "]") {
      depth = Math.max(0, depth - 1);
      continue;
    }
    if (ch === ":" && depth === 0) return i;
  }
  return -1;
}
function triageInlineScript(code) {
  const raw = (code ?? "").trim();
  if (!raw) return { decision: "ignore", reason: "empty script" };
  if (/^[[{]/.test(raw) && looksLikeJson(raw)) {
    return { decision: "ignore", reason: "JSON / data block, no executable code" };
  }
  const stripped = stripComments(raw).trim();
  if (!stripped) {
    return { decision: "ignore", reason: "comments / whitespace only" };
  }
  if (/window\s*\.\s*__F0_INTERACTIONS__\s*=/.test(stripped)) {
    return { decision: "ignore", reason: "f0 interactions payload - imported natively" };
  }
  const hasGsap = /\bgsap\b/.test(stripped) || /\bScrollTrigger\b/.test(stripped);
  if (!hasGsap) {
    return hasExecutableContent(stripped) ? { decision: "sink", reason: "non-GSAP script - attached as code element" } : { decision: "ignore", reason: "no executable content" };
  }
  if (/gsap\s*\.\s*timeline\s*\(/.test(stripped)) {
    return { decision: "sink", reason: "gsap.timeline() - attached as code element" };
  }
  if (/ScrollTrigger\s*\.\s*create\s*\(/.test(stripped)) {
    return { decision: "sink", reason: "ScrollTrigger.create() - attached as code element" };
  }
  if (/\bLenis\b/.test(stripped) || /\bSwiper\b/.test(stripped) || /\bSplitType\b/.test(stripped) || /\bSplitting\b/.test(stripped)) {
    return { decision: "sink", reason: "third-party library init - attached as code element" };
  }
  if (/\baddEventListener\s*\(\s*['"]scroll['"]/.test(stripped)) {
    return { decision: "sink", reason: "manual scroll listener - attached as code element" };
  }
  if (/\bgsap\s*\.\s*matchMedia\s*\(/.test(stripped)) {
    return { decision: "sink", reason: "gsap.matchMedia() - attached as code element" };
  }
  const residue = stripRecognizedConstructs(stripped);
  if (hasExecutableContent(residue)) {
    return { decision: "sink", reason: "mixed supported + unsupported code - attached as code element" };
  }
  if (!/gsap\s*\.\s*(from|to|fromTo)\s*\(/.test(stripped)) {
    return { decision: "ignore", reason: "no convertible GSAP tween" };
  }
  return { decision: "convert", reason: "fully within the supported GSAP subset" };
}
function everyGsapTweenIsTriggerConnected(code) {
  const script = stripComments(code ?? "");
  const callRe = /gsap\s*\.\s*(from|to|fromTo)\s*\(/g;
  let m;
  while ((m = callRe.exec(script)) !== null) {
    const openIdx = m.index + m[0].length - 1;
    if (matchBracket(script, openIdx) === -1) return false;
    callRe.lastIndex = openIdx + 1;
  }
  return true;
}
function looksLikeJson(s) {
  try {
    JSON.parse(s);
    return true;
  } catch {
    return false;
  }
}
function stripRecognizedConstructs(src) {
  let out = src;
  out = removeCallsWithBody(out, /gsap\s*\.\s*registerPlugin\s*\(/g, () => true);
  out = unwrapCallbacks(out);
  out = removeConvertibleTweens(out);
  return out;
}
function removeCallsWithBody(src, prefixRe, accept) {
  let out = "";
  let last = 0;
  prefixRe.lastIndex = 0;
  let m;
  while ((m = prefixRe.exec(src)) !== null) {
    const openIdx = m.index + m[0].length - 1;
    const close = matchBracket(src, openIdx);
    if (close === -1) break;
    const argsText = src.slice(openIdx + 1, close);
    if (accept(argsText)) {
      out += src.slice(last, m.index);
      let after = close + 1;
      while (after < src.length && /[\s;]/.test(src[after])) after++;
      last = after;
      prefixRe.lastIndex = close + 1;
    } else {
      prefixRe.lastIndex = close + 1;
    }
  }
  out += src.slice(last);
  return out;
}
function unwrapCallbacks(src) {
  const FN_HEAD = "(?:[A-Za-z_$][\\w$]*\\s*=>|\\([^)]*\\)\\s*=>|function\\b[^{]*)";
  const wrapperRe = new RegExp(
    "(?:\\.\\s*forEach\\s*\\(\\s*" + FN_HEAD + `|\\.\\s*addEventListener\\s*\\(\\s*['"](?:mouseenter|mouseover|click)['"]\\s*,\\s*` + FN_HEAD + `|\\.\\s*on\\s*\\(\\s*['"](?:click|mouseenter|mouseover|hover)['"]\\s*,\\s*` + FN_HEAD + ")\\s*\\{",
    "g"
  );
  let out = src;
  for (let pass = 0; pass < 8; pass++) {
    let changed = false;
    let result = "";
    let last = 0;
    wrapperRe.lastIndex = 0;
    let m;
    while ((m = wrapperRe.exec(out)) !== null) {
      const braceIdx = out.indexOf("{", m.index + m[0].length - 1);
      if (braceIdx === -1) break;
      const braceClose = matchBracket(out, braceIdx);
      if (braceClose === -1) break;
      let after = braceClose + 1;
      while (after < out.length && /\s/.test(out[after])) after++;
      if (out[after] !== ")") {
        wrapperRe.lastIndex = braceClose + 1;
        continue;
      }
      after++;
      while (after < out.length && /[\s;]/.test(out[after])) after++;
      const receiverStart = findReceiverStart(out, m.index);
      const body = out.slice(braceIdx + 1, braceClose);
      result += out.slice(last, receiverStart) + "\n" + body + "\n";
      last = after;
      changed = true;
      wrapperRe.lastIndex = after;
    }
    result += out.slice(last);
    out = result;
    if (!changed) break;
  }
  return out;
}
function findReceiverStart(src, dotIndex) {
  let i = dotIndex - 1;
  while (i >= 0) {
    const ch = src[i];
    if (/\s/.test(ch)) {
      i--;
      continue;
    }
    if (ch === ")" || ch === "]") {
      const open = ch === ")" ? "(" : "[";
      let depth = 0;
      for (; i >= 0; i--) {
        if (src[i] === ch) depth++;
        else if (src[i] === open) {
          depth--;
          if (depth === 0) {
            i--;
            break;
          }
        }
      }
      continue;
    }
    if (/[A-Za-z0-9_$.]/.test(ch)) {
      i--;
      continue;
    }
    break;
  }
  return i + 1;
}
function removeConvertibleTweens(src) {
  const re = /gsap\s*\.\s*(from|to|fromTo)\s*\(/g;
  return removeCallsWithBody(src, re, (argsText) => {
    const parts = splitTopLevelArgs(argsText);
    if (parts.length < 2) return false;
    const target = parts[0].trim();
    const targetOk = isStringLiteral(target) || /^[A-Za-z_$][\w$]*$/.test(target) || isGsapLoopQueryTarget(target);
    if (!targetOk) return false;
    for (let i = 1; i < parts.length; i++) {
      const v = parts[i].trim();
      if (!v.startsWith("{") || !v.endsWith("}")) return false;
      if (!varsObjectIsConvertible(v.slice(1, -1))) return false;
    }
    return true;
  });
}
function hasExecutableContent(src) {
  const noStrings = src.replace(/'[^']*'|"[^"]*"|`[^`]*`/g, "");
  const meaningful = noStrings.replace(/[\s;{}()[\],.]/g, "").replace(/=>/g, "");
  return /[A-Za-z0-9_$+\-*/%<>=!&|^~?:]/.test(meaningful);
}
export {
  everyGsapTweenIsTriggerConnected,
  triageInlineScript
};
