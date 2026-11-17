// Human-readable report for the terminal.

const CODES = { red: 31, yellow: 33, blue: 34, green: 32, dim: 2, bold: 1 };

export function formatText(result, { color = false, maxPerFile = 0 } = {}) {
  const c = (name, s) => (color ? `\u001b[${CODES[name]}m${s}\u001b[0m` : s);
  const sev = { error: c('red', 'error  '), warning: c('yellow', 'warning'), info: c('blue', 'info   ') };
  const out = [];
  out.push(c('bold', `ui-polish audit: ${result.root}`));
  out.push(c('dim', `${result.filesScanned} files scanned${result.configFile ? `, config ${result.configFile}` : ''}${result.designDoc ? `, design doc ${result.designDoc}` : ''}`));
  if (result.surface) {
    const { value, source, signals } = result.surface;
    const why = source === 'detected' && signals ? ` from ${[...signals.marketing, ...signals.app].slice(0, 4).join(', ') || 'no clear signals'}` : '';
    out.push(c('dim', value === 'unknown'
      ? 'Surface: unknown, so marketing-only and app-only rules were skipped. Add "Surface: marketing | app | both" to design.md.'
      : `Surface: ${value} (${source}${why})`));
  }
  if (result.unusedStylesheets?.length) out.push(c('dim', `Skipped ${result.unusedStylesheets.length} stylesheet${result.unusedStylesheets.length === 1 ? '' : 's'} nothing references: ${result.unusedStylesheets.join(', ')}. Delete ${result.unusedStylesheets.length === 1 ? 'it' : 'them'}, or import ${result.unusedStylesheets.length === 1 ? 'it' : 'them'} if they should apply.`));
  out.push('');

  const groups = new Map();
  for (const f of result.findings) {
    const key = f.file ?? '(project)';
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(f);
  }
  for (const [file, list] of groups) {
    out.push(c('bold', file));
    const shown = maxPerFile > 0 ? list.slice(0, maxPerFile) : list;
    for (const f of shown) {
      const where = f.file ? `${f.line}:${f.column}`.padEnd(8) : ''.padEnd(8);
      out.push(`  ${where} ${sev[f.severity]}  ${f.ruleId}  ${f.message}`);
    }
    if (shown.length < list.length) out.push(c('dim', `  … ${list.length - shown.length} more (run with --json or without --max-per-file)`));
    out.push('');
  }

  const topics = Object.entries(result.byTopic).filter(([, t]) => t.error + t.warning + t.info > 0);
  if (topics.length) {
    out.push(c('bold', 'By topic'));
    for (const [prefix, t] of topics) {
      out.push(`  ${prefix}  ${t.topic.padEnd(22)} ${String(t.error).padStart(3)} error  ${String(t.warning).padStart(3)} warning  ${String(t.info).padStart(3)} info   -${t.deducted}`);
    }
    out.push('');
  }

  const { error, warning, info } = result.counts;
  const verdict = result.pass ? c('green', 'PASS') : c('red', 'FAIL');
  out.push(`${error} error${error === 1 ? '' : 's'}, ${warning} warning${warning === 1 ? '' : 's'}, ${info} info`);
  out.push(`Score ${c('bold', `${result.score}/100`)} (minimum ${result.minScore}, fail on ${result.failOn})  ${verdict}`);
  if (result.polish) {
    const p = result.polish;
    out.push(`Polish ${c('bold', `${p.score}/100`)} (${p.band}; target ${p.target.score}, no dimension below ${p.target.dimension})  ${p.meetsTarget ? c('green', 'MEETS TARGET') : c('yellow', 'BELOW TARGET')}`);
  }
  if (!result.findings.length) out.push('No static findings. Static checks cannot see layout, spacing rhythm or visual quality: run the visual audit in audit/PROCEDURE.md.');
  else out.push(c('dim', 'Each rule ID is explained in rules/ (rule, why, bad/good example, how to check). Suppress a deliberate exception with a `ui-polish-ignore-next-line <ID>` comment.'));
  return out.join('\n');
}
