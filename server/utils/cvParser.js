import fs from "fs";
import pdfParse from "pdf-parse";
import { normalizeSkillList } from "./skillNormalizer.js";

// A base skill vocabulary to scan for in CV text.
// Extend this list as needed — it drives what extractedSkills can ever contain.
const KNOWN_SKILLS = [
  "javascript", "typescript", "python", "java", "c++", "c#",
  "react", "react.js", "reactjs", "vue", "vuejs", "angular",
  "node.js", "nodejs", "express", "express.js",
  "mongodb", "mongo", "postgres", "postgresql", "mysql", "redis",
  "html", "html5", "css", "css3", "tailwind", "sass",
  "git", "docker", "kubernetes", "aws", "azure", "gcp",
  "rest api", "graphql", "next.js", "nextjs",
  "mongoose", "jwt", "oauth", "figma",
];

const EDUCATION_KEYWORDS = [
  "bachelor", "master", "b.sc", "m.sc", "phd", "diploma",
  "university", "college", "degree",
];

const CERTIFICATION_KEYWORDS = [
  "certified", "certification", "certificate",
];

export const extractTextFromPDF = async (filePath) => {
  const dataBuffer = fs.readFileSync(filePath);
  const data = await pdfParse(dataBuffer);
  return data.text;
};

export const extractSkillsFromText = (text) => {
  const lowerText = text.toLowerCase();
  const found = KNOWN_SKILLS.filter((skill) => lowerText.includes(skill));
  return normalizeSkillList(found);
};

export const extractEducationFromText = (text) => {
  const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
  return lines.filter((line) =>
    EDUCATION_KEYWORDS.some((kw) => line.toLowerCase().includes(kw))
  );
};

export const extractCertificationsFromText = (text) => {
  const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
  return lines.filter((line) =>
    CERTIFICATION_KEYWORDS.some((kw) => line.toLowerCase().includes(kw))
  );
};