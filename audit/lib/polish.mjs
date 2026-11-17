// The Polish score: eleven dimensions scored 0-4 from screenshots against the
// rubric in audit/POLISH.md. This module validates a polish.json and computes
// the score; the judgement itself is made by the agent or a person.

import fs from 'node:fs';

export const POLISH_DIMENSIONS = [
  { id: 'hierarchy', title: 'Hierarchy and focal point' },
  { id: 'typography', title: 'Typography' },
  { id: 'spacing', title: 'Spacing and layout' },
  { id: 'colour', title: 'Colour' },
  { id: 'surfaces', title: 'Surfaces, depth and shape' },
  { id: 'components', title: 'Component craft' },
  { id: 'imagery', title: 'Imagery, icons and assets' },
  { id: 'motion', title: 'Motion and feedback' },
  { id: 'copy', title: 'Copy and content' },
  { id: 'consistency', title: 'Consistency' },
  { id: 'journey', title: 'Journey: conversion or activation' },
];

/** Minimum Polish score, and minimum per dimension, for /ui-elevate to be done. */
export const POLISH_TARGET = { score: 80, dimension: 2 };

export function polishBand(score) {
  if (score >= 90) return 'premium';
  if (score >= 80) return 'polished';
  if (score >= 60) return 'competent';
  return 'generic';
}

/** Validate parsed polish.json data and compute the score. Throws with every problem listed. */
export function scorePolish(data, source = 'polish.json') {
  const problems = [];
  if (!data || typeof data !== 'object' || !data.dimensions || typeof data.dimensions !== 'object') {
    throw new Error(`${source}: expected an object with a "dimensions" object (see audit/POLISH.md)`);
  }
  const known = new Set(POLISH_DIMENSIONS.map((d) => d.id));
  for (const id of Object.keys(data.dimensions)) if (!known.has(id)) problems.push(`unknown dimension "${id}"`);
  const dimensions = [];
  for (const { id, title } of POLISH_DIMENSIONS) {
    const d = data.dimensions[id];
    if (!d || typeof d !== 'object') { problems.push(`missing dimension "${id}"`); continue; }
    const s = d.score;
    if (s !== null && !(Number.isInteger(s) && s >= 0 && s <= 4)) problems.push(`"${id}".score must be an integer from 0 to 4, or null (got ${JSON.stringify(s)})`);
    if (s === null && !d.note) problems.push(`"${id}" is not scored: give it a score from 0 to 4, or keep null and say in "note" why it does not apply`);
    if (d.evidence !== undefined && !Array.isArray(d.evidence)) problems.push(`"${id}".evidence must be an array of screenshot file names`);
    dimensions.push({ id, title, score: s, note: typeof d.note === 'string' ? d.note : '', evidence: Array.isArray(d.evidence) ? d.evidence.map(String) : [] });
  }
  if (problems.length) throw new Error(`${source}:\n  - ${problems.join('\n  - ')}`);
  const scored = dimensions.filter((d) => d.score !== null);
  if (!scored.length) throw new Error(`${source}: every dimension is null; score at least one`);
  const score = Math.round((100 * scored.reduce((n, d) => n + d.score, 0)) / (4 * scored.length));
  const weakest = Math.min(...scored.map((d) => d.score));
  return {
    score,
    band: polishBand(score),
    target: POLISH_TARGET,
    meetsTarget: score >= POLISH_TARGET.score && weakest >= POLISH_TARGET.dimension,
    assessedAt: typeof data.assessedAt === 'string' ? data.assessedAt : null,
    pages: Array.isArray(data.pages) ? data.pages.map(String) : [],
    dimensions,
  };
}

export function loadPolish(file) {
  let data;
  try {
    data = JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch (err) {
    throw new Error(`Cannot read ${file}: ${err.message}`);
  }
  return scorePolish(data, file);
}
