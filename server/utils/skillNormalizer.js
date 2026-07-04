// Maps common variations to a single canonical skill name.
// Add to this list as you discover more variations during testing.
const SKILL_ALIASES = {
  "reactjs": "react",
  "react.js": "react",
  "react js": "react",
  "nodejs": "node.js",
  "node js": "node.js",
  "node": "node.js",
  "expressjs": "express",
  "express.js": "express",
  "mongodb": "mongodb",
  "mongo": "mongodb",
  "javascript": "javascript",
  "js": "javascript",
  "typescript": "typescript",
  "ts": "typescript",
  "html5": "html",
  "css3": "css",
  "nextjs": "next.js",
  "next js": "next.js",
  "vuejs": "vue",
  "vue.js": "vue",
  "postgresql": "postgres",
  "postgre": "postgres",
  "restapi": "rest api",
  "rest apis": "rest api",
};

// Normalizes a single skill string: lowercase, trim, strip punctuation noise, apply alias map
export const normalizeSkill = (skill) => {
  if (!skill) return "";

  let normalized = skill
    .toLowerCase()
    .trim()
    .replace(/[.\-_]/g, "") // strip dots, hyphens, underscores for alias lookup
    .replace(/\s+/g, " ");

  // Check alias map using the punctuation-stripped version
  const strippedKey = normalized.replace(/\s/g, "");
  for (const [alias, canonical] of Object.entries(SKILL_ALIASES)) {
    const strippedAlias = alias.replace(/[.\-_\s]/g, "");
    if (strippedKey === strippedAlias) {
      return canonical;
    }
  }

  return normalized;
};

// Normalizes an array of skills, removing duplicates after normalization
export const normalizeSkillList = (skills = []) => {
  const normalized = skills.map(normalizeSkill).filter(Boolean);
  return [...new Set(normalized)];
};