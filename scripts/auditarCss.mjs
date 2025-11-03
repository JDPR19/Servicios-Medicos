import { PurgeCSS } from 'purgecss';
import { writeFile, mkdir } from 'fs/promises';

const outDir = './.cache-css-audit';
await mkdir(outDir, { recursive: true });

const cssFiles = [
  'src/index.css',
  'src/styles/*.css', // no incluir *.module.css
];

const contentFiles = [
  'index.html',
  'src/**/*.{js,jsx,ts,tsx,html}',
];

const safelist = {
  standard: [
    'btn', 'btn-primary', 'btn-secondary', 'btn-outline', 'btn-xs',
    'badge', 'badge--warn', 'badge--info', 'badge--success', 'badge--muted',
    'spinner-overlay', 'spinner', 'spinner-text', 'spinner-wrapper', 'spinner-inline', 'spinner-column',
    'modal-overlay', 'modal-content', 'modal-fullscreen-content', 'slide-in', 'fade', 'slide-down', 'slide-up', 'zoom',
    'pac-page', 'consultas-page',
  ],
  greedy: [/^btn-/, /^badge-/, /^pogress-/, /^seguimiento-/, /^qa-/],
};

const purge = new PurgeCSS();
const results = await purge.purge({ content: contentFiles, css: cssFiles, safelist });

// CSS purgado por archivo (opcional)
for (const r of results) {
  const outCssPath = `${outDir}/${r.file.replace(/.*[\\/]/, '').replace('.css', '.purged.css')}`;
  await writeFile(outCssPath, r.css, 'utf8');
}

// Reporte de selectores no usados
const report = results.map(r => ({
  file: r.file,
  rejectedCount: (r.rejected || []).length,
  rejected: r.rejected || [],
}));

await writeFile(`${outDir}/unused-css-report.json`, JSON.stringify(report, null, 2), 'utf8');

const lines = report.flatMap(r => [`# ${r.file}`, ...(r.rejected || []).map(s => `  - ${s}`), '']);
await writeFile(`${outDir}/unused-css.txt`, lines.join('\n'), 'utf8');

console.log(`OK. Revisa:
  ${outDir}/unused-css-report.json
  ${outDir}/unused-css.txt
  (CSS purgado en ${outDir}/*.purged.css)`);

  // node .\scripts\auditarCss.mjs