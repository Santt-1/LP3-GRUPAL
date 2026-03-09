/**
 * exportUtils.js
 * ──────────────
 * Utilidades de exportación para los reportes del módulo admin.
 */

/**
 * Exporta un array de objetos a CSV y descarga el archivo.
 * @param {Object[]} rows - Array de objetos planos (cada key será un header).
 * @param {string}   filename - Nombre del archivo sin extensión.
 */
export const exportToCSV = (rows, filename = 'reporte') => {
  if (!rows || rows.length === 0) return;

  const headers = Object.keys(rows[0]);
  const csvRows = [
    headers.join(','),
    ...rows.map((row) =>
      headers
        .map((h) => {
          const value = row[h] ?? '';
          const escaped = String(value).replace(/"/g, '""');
          return `"${escaped}"`;
        })
        .join(','),
    ),
  ];

  const BOM = '\uFEFF';
  const blob = new Blob([BOM + csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename}_${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * Exporta datos a PDF abriendo una ventana de impresión.
 * @param {string}   title - Título del reporte.
 * @param {Object[]} rows  - Array de objetos planos.
 */
export const exportToPDF = (title = 'Reporte', rows) => {
  if (!rows || rows.length === 0) return;

  const headers = Object.keys(rows[0]);
  const headerHtml = headers.map((h) => `<th>${h}</th>`).join('');
  const bodyHtml = rows
    .map((row) => `<tr>${headers.map((h) => `<td>${row[h] ?? ''}</td>`).join('')}</tr>`)
    .join('');

  const html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <title>${title}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: Arial, sans-serif; font-size: 11px; color: #111; padding: 24px; }
    h1 { font-size: 16px; font-weight: bold; margin-bottom: 4px; }
    .subtitle { font-size: 10px; color: #6b7280; margin-bottom: 16px; }
    table { width: 100%; border-collapse: collapse; margin-top: 8px; }
    thead tr { background-color: #16a34a; color: white; }
    th { padding: 7px 10px; text-align: left; font-size: 10px; }
    td { padding: 6px 10px; border-bottom: 1px solid #e5e7eb; font-size: 11px; }
    tr:nth-child(even) td { background-color: #f9fafb; }
    @media print { body { padding: 0; } }
  </style>
</head>
<body>
  <h1>${title}</h1>
  <p class="subtitle">Generado el ${new Date().toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
  <table>
    <thead><tr>${headerHtml}</tr></thead>
    <tbody>${bodyHtml}</tbody>
  </table>
</body>
</html>`;

  const printWindow = window.open('', '_blank', 'width=900,height=650');
  if (!printWindow) return;
  printWindow.document.write(html);
  printWindow.document.close();
  setTimeout(() => printWindow.print(), 400);
};
