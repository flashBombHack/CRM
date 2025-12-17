import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import Papa from 'papaparse';

export type ExportFormat = 'pdf' | 'csv';

export interface ExportDataItem {
  [key: string]: any;
}

// Format currency for display
const formatCurrency = (value: number | null | undefined): string => {
  if (value == null || Number.isNaN(value)) return '–';
  const formatter = new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
    maximumFractionDigits: 0,
  });
  return formatter.format(value);
};

// Format date for display
const formatDate = (date: string | null | undefined): string => {
  if (!date) return '–';
  try {
    return new Date(date).toLocaleDateString('en-GB', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return date;
  }
};

// Get module name from ID
export const getModuleName = (moduleId: number): string => {
  const modules: { [key: number]: string } = {
    1: 'Leads',
    2: 'Qualification',
    3: 'Opportunity',
    4: 'Discovery',
    5: 'Proposal',
    6: 'Contracts',
    7: 'Activation',
    8: 'Invoice',
    9: 'Customer Level',
    10: 'Renewal',
  };
  return modules[moduleId] || 'Unknown';
};

// Generate CSV from data
export const exportToCSV = (
  data: ExportDataItem[],
  moduleName: string,
  startDate?: string,
  endDate?: string
): void => {
  if (!data || data.length === 0) {
    alert('No data to export');
    return;
  }

  // Flatten nested arrays (like productInterest) into comma-separated strings
  const flattenedData = data.map((item) => {
    const flattened: ExportDataItem = {};
    Object.keys(item).forEach((key) => {
      if (Array.isArray(item[key])) {
        flattened[key] = (item[key] as any[]).join(', ');
      } else {
        flattened[key] = item[key];
      }
    });
    return flattened;
  });

  const csv = Papa.unparse(flattenedData);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  const dateRange = startDate && endDate
    ? `_${formatDate(startDate)}_to_${formatDate(endDate)}`
    : '';
  const filename = `${moduleName}_Export${dateRange}_${new Date().toISOString().split('T')[0]}.csv`;

  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// Generate beautiful PDF report
export const exportToPDF = async (
  data: ExportDataItem[],
  moduleName: string,
  startDate?: string,
  endDate?: string
): Promise<void> => {
  if (!data || data.length === 0) {
    alert('No data to export');
    return;
  }

  // Create a temporary container for the report
  const container = document.createElement('div');
  container.style.position = 'absolute';
  container.style.left = '-9999px';
  container.style.width = '210mm'; // A4 width
  container.style.backgroundColor = '#ffffff';
  container.style.fontFamily = 'system-ui, -apple-system, sans-serif';
  document.body.appendChild(container);

  try {
    // Generate report HTML
    const reportHTML = generateReportHTML(data, moduleName, startDate, endDate);
    container.innerHTML = reportHTML;

    // Wait for any images or fonts to load
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Convert to canvas then PDF
    const canvas = await html2canvas(container, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
      width: container.scrollWidth,
      height: container.scrollHeight,
    });

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const imgWidth = canvas.width;
    const imgHeight = canvas.height;
    const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
    const imgScaledWidth = imgWidth * ratio;
    const imgScaledHeight = imgHeight * ratio;

    // Calculate how many pages we need
    const pageHeight = imgScaledHeight;
    let heightLeft = imgScaledHeight;
    let position = 0;

    pdf.addImage(imgData, 'PNG', 0, position, imgScaledWidth, imgScaledHeight);
    heightLeft -= pdfHeight;

    while (heightLeft > 0) {
      position = heightLeft - imgScaledHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, imgScaledWidth, imgScaledHeight);
      heightLeft -= pdfHeight;
    }

    const dateRange = startDate && endDate
      ? `_${formatDate(startDate)}_to_${formatDate(endDate)}`
      : '';
    const filename = `${moduleName}_Report${dateRange}_${new Date().toISOString().split('T')[0]}.pdf`;

    pdf.save(filename);
  } catch (error) {
    console.error('Error generating PDF:', error);
    alert('Failed to generate PDF. Please try again.');
  } finally {
    document.body.removeChild(container);
  }
};

// Generate beautiful HTML report
const generateReportHTML = (
  data: ExportDataItem[],
  moduleName: string,
  startDate?: string,
  endDate?: string
): string => {
  const dateRange = startDate && endDate
    ? `${formatDate(startDate)} - ${formatDate(endDate)}`
    : new Date().toLocaleDateString('en-GB', { year: 'numeric', month: 'long' });

  // Calculate statistics
  const stats = calculateStatistics(data);

  // Get all unique keys for dynamic field handling
  const allKeys = new Set<string>();
  data.forEach((item) => {
    Object.keys(item).forEach((key) => allKeys.add(key));
  });
  const fieldKeys = Array.from(allKeys).filter(
    (key) => key !== 'id' && !Array.isArray(data[0]?.[key])
  );

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        body {
          font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          background: #ffffff;
          color: #1f2937;
          line-height: 1.6;
        }
        .report-container {
          padding: 40px;
          max-width: 210mm;
          margin: 0 auto;
        }
        .header {
          border-bottom: 3px solid #0072CE;
          padding-bottom: 20px;
          margin-bottom: 30px;
        }
        .header h1 {
          font-size: 32px;
          font-weight: 700;
          color: #0072CE;
          margin-bottom: 8px;
        }
        .header .subtitle {
          font-size: 14px;
          color: #6b7280;
          margin-bottom: 4px;
        }
        .header .date-range {
          font-size: 12px;
          color: #9ca3af;
        }
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 16px;
          margin-bottom: 40px;
        }
        .stat-card {
          background: linear-gradient(135deg, #f7f8f8 0%, #ffffff 100%);
          border: 1px solid #e5e7eb;
          border-radius: 12px;
          padding: 20px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
        }
        .stat-card .label {
          font-size: 12px;
          color: #6b7280;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 8px;
          font-weight: 600;
        }
        .stat-card .value {
          font-size: 24px;
          font-weight: 700;
          color: #1f2937;
        }
        .section-title {
          font-size: 20px;
          font-weight: 700;
          color: #1f2937;
          margin: 40px 0 20px 0;
          padding-bottom: 10px;
          border-bottom: 2px solid #e5e7eb;
        }
        .data-table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 30px;
          background: #ffffff;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          border-radius: 8px;
          overflow: hidden;
        }
        .data-table thead {
          background: linear-gradient(135deg, #0072CE 0%, #005BA5 100%);
          color: #ffffff;
        }
        .data-table th {
          padding: 14px 16px;
          text-align: left;
          font-size: 12px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .data-table tbody tr {
          border-bottom: 1px solid #e5e7eb;
          transition: background-color 0.2s;
        }
        .data-table tbody tr:hover {
          background-color: #f9fafb;
        }
        .data-table tbody tr:last-child {
          border-bottom: none;
        }
        .data-table td {
          padding: 12px 16px;
          font-size: 13px;
          color: #374151;
        }
        .data-table td:first-child {
          font-weight: 600;
          color: #1f2937;
        }
        .badge {
          display: inline-block;
          padding: 4px 12px;
          border-radius: 12px;
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .badge-success {
          background: #d1fae5;
          color: #065f46;
        }
        .badge-warning {
          background: #fef3c7;
          color: #92400e;
        }
        .badge-info {
          background: #dbeafe;
          color: #1e40af;
        }
        .badge-primary {
          background: #dbeafe;
          color: #0072CE;
        }
        .footer {
          margin-top: 40px;
          padding-top: 20px;
          border-top: 1px solid #e5e7eb;
          text-align: center;
          font-size: 11px;
          color: #9ca3af;
        }
        .chart-container {
          margin: 30px 0;
          padding: 20px;
          background: #f9fafb;
          border-radius: 8px;
          border: 1px solid #e5e7eb;
        }
        .chart-title {
          font-size: 16px;
          font-weight: 600;
          color: #1f2937;
          margin-bottom: 16px;
        }
        .bar-chart {
          display: flex;
          align-items: flex-end;
          gap: 8px;
          height: 200px;
          padding: 20px 0;
        }
        .bar {
          flex: 1;
          background: linear-gradient(180deg, #0072CE 0%, #005BA5 100%);
          border-radius: 4px 4px 0 0;
          min-height: 20px;
          position: relative;
          display: flex;
          align-items: flex-end;
          justify-content: center;
          padding-bottom: 8px;
          color: #ffffff;
          font-size: 10px;
          font-weight: 600;
        }
        .bar-label {
          position: absolute;
          bottom: -20px;
          left: 50%;
          transform: translateX(-50%);
          font-size: 10px;
          color: #6b7280;
          white-space: nowrap;
        }
        .product-interest-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
        }
        .tag {
          background: #e0e7ff;
          color: #3730a3;
          padding: 4px 10px;
          border-radius: 6px;
          font-size: 11px;
          font-weight: 500;
        }
      </style>
    </head>
    <body>
      <div class="report-container">
        <div class="header">
          <h1>${moduleName} Report</h1>
          <div class="subtitle">Comprehensive Data Analysis</div>
          <div class="date-range">Period: ${dateRange}</div>
        </div>

        <div class="stats-grid">
          <div class="stat-card">
            <div class="label">Total Records</div>
            <div class="value">${data.length}</div>
          </div>
          ${stats.totalPotential ? `
          <div class="stat-card">
            <div class="label">Total Potential</div>
            <div class="value">${formatCurrency(stats.totalPotential)}</div>
          </div>
          ` : ''}
          ${stats.avgPotential ? `
          <div class="stat-card">
            <div class="label">Average Potential</div>
            <div class="value">${formatCurrency(stats.avgPotential)}</div>
          </div>
          ` : ''}
          ${stats.statusCounts ? Object.entries(stats.statusCounts).slice(0, 1).map(([status, count]) => `
          <div class="stat-card">
            <div class="label">${status}</div>
            <div class="value">${count}</div>
          </div>
          `).join('') : ''}
        </div>

        ${generateCharts(data, stats)}

        <div class="section-title">Data Details</div>
        <table class="data-table">
          <thead>
            <tr>
              ${fieldKeys.slice(0, 8).map(key => `<th>${formatFieldName(key)}</th>`).join('')}
            </tr>
          </thead>
          <tbody>
            ${data.slice(0, 50).map(item => `
              <tr>
                ${fieldKeys.slice(0, 8).map(key => `
                  <td>${formatCellValue(item[key], key)}</td>
                `).join('')}
              </tr>
            `).join('')}
          </tbody>
        </table>

        ${data.length > 50 ? `
        <div style="text-align: center; color: #6b7280; font-size: 12px; margin-top: 20px;">
          Showing first 50 of ${data.length} records
        </div>
        ` : ''}

        <div class="footer">
          Generated on ${new Date().toLocaleDateString('en-GB', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })} | ${moduleName} Export Report
        </div>
      </div>
    </body>
    </html>
  `;
};

// Calculate statistics from data
const calculateStatistics = (data: ExportDataItem[]) => {
  const stats: {
    totalPotential?: number;
    avgPotential?: number;
    statusCounts?: { [key: string]: number };
    sourceCounts?: { [key: string]: number };
    countryCounts?: { [key: string]: number };
  } = {};

  let totalPotential = 0;
  let potentialCount = 0;

  data.forEach((item) => {
    // Calculate potential
    if (item.estimatedPotential != null && !Number.isNaN(item.estimatedPotential)) {
      totalPotential += Number(item.estimatedPotential);
      potentialCount++;
    }

    // Count statuses
    if (item.status) {
      stats.statusCounts = stats.statusCounts || {};
      stats.statusCounts[item.status] = (stats.statusCounts[item.status] || 0) + 1;
    }

    // Count sources
    if (item.source) {
      stats.sourceCounts = stats.sourceCounts || {};
      stats.sourceCounts[item.source] = (stats.sourceCounts[item.source] || 0) + 1;
    }

    // Count countries
    if (item.country) {
      stats.countryCounts = stats.countryCounts || {};
      stats.countryCounts[item.country] = (stats.countryCounts[item.country] || 0) + 1;
    }
  });

  if (potentialCount > 0) {
    stats.totalPotential = totalPotential;
    stats.avgPotential = totalPotential / potentialCount;
  }

  return stats;
};

// Generate charts HTML
const generateCharts = (data: ExportDataItem[], stats: any): string => {
  let chartsHTML = '';

  // Status distribution chart
  if (stats.statusCounts && Object.keys(stats.statusCounts).length > 0) {
    const statusEntries = Object.entries(stats.statusCounts).sort((a, b) => (b[1] as number) - (a[1] as number));
    const maxCount = Math.max(...statusEntries.map(([, count]) => count as number));
    
    chartsHTML += `
      <div class="chart-container">
        <div class="chart-title">Status Distribution</div>
        <div class="bar-chart">
          ${statusEntries.slice(0, 6).map(([status, count]) => {
            const height = ((count as number) / maxCount) * 100;
            return `
              <div style="flex: 1; display: flex; flex-direction: column; align-items: center;">
                <div class="bar" style="height: ${height}%;">
                  ${count}
                </div>
                <div class="bar-label">${status}</div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;
  }

  // Source distribution chart
  if (stats.sourceCounts && Object.keys(stats.sourceCounts).length > 0) {
    const sourceEntries = Object.entries(stats.sourceCounts).sort((a, b) => (b[1] as number) - (a[1] as number));
    const maxCount = Math.max(...sourceEntries.map(([, count]) => count as number));
    
    chartsHTML += `
      <div class="chart-container">
        <div class="chart-title">Source Distribution</div>
        <div class="bar-chart">
          ${sourceEntries.slice(0, 6).map(([source, count]) => {
            const height = ((count as number) / maxCount) * 100;
            return `
              <div style="flex: 1; display: flex; flex-direction: column; align-items: center;">
                <div class="bar" style="height: ${height}%;">
                  ${count}
                </div>
                <div class="bar-label">${source}</div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;
  }

  return chartsHTML;
};

// Format field names for display
const formatFieldName = (key: string): string => {
  return key
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (str) => str.toUpperCase())
    .trim();
};

// Format cell values for display
const formatCellValue = (value: any, key: string): string => {
  if (value == null || value === '') return '–';
  
  if (Array.isArray(value)) {
    if (value.length === 0) return '–';
    return `<div class="product-interest-tags">${value.map(v => `<span class="tag">${v}</span>`).join('')}</div>`;
  }
  
  if (typeof value === 'number') {
    if (key.toLowerCase().includes('potential') || key.toLowerCase().includes('price') || key.toLowerCase().includes('revenue')) {
      return formatCurrency(value);
    }
    return value.toLocaleString();
  }
  
  if (typeof value === 'boolean') {
    return value ? 'Yes' : 'No';
  }
  
  // Format status with badge
  if (key.toLowerCase() === 'status') {
    const statusLower = String(value).toLowerCase();
    let badgeClass = 'badge-primary';
    if (statusLower.includes('opportunity')) badgeClass = 'badge-success';
    if (statusLower.includes('qualification')) badgeClass = 'badge-warning';
    return `<span class="badge ${badgeClass}">${value}</span>`;
  }
  
  return String(value);
};

