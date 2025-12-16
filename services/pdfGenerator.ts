import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Reading, Stats } from '../types';
import { formatTime, formatDate, getGlucoseStatus } from '../utils/helpers';

export const generateReport = (readings: Reading[], stats: Stats, rangeLabel: string) => {
  const doc = new jsPDF();
  
  // Header
  doc.setFillColor(14, 165, 233); // Clinical Blue 500
  doc.rect(0, 0, 210, 40, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.text('Glucose Report', 14, 20);
  
  doc.setFontSize(10);
  doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 30);
  doc.text(`Filter: ${rangeLabel}`, 14, 35);

  // Summary Cards
  let yPos = 50;
  doc.setTextColor(60, 60, 60);
  doc.setFontSize(14);
  doc.text('Summary Statistics', 14, yPos);
  
  yPos += 10;
  const cardWidth = 60;
  const cardHeight = 25;
  
  // Avg Card
  doc.setFillColor(241, 245, 249); // Slate 100
  doc.setDrawColor(203, 213, 225); // Slate 300
  doc.roundedRect(14, yPos, cardWidth, cardHeight, 3, 3, 'FD');
  doc.setFontSize(10);
  doc.setTextColor(100, 116, 139);
  doc.text('Average', 20, yPos + 8);
  doc.setFontSize(16);
  doc.setTextColor(15, 23, 42);
  doc.text(`${Math.round(stats.avg)} mg/dL`, 20, yPos + 20);

  // Min Card
  doc.setFillColor(241, 245, 249);
  doc.roundedRect(14 + cardWidth + 5, yPos, cardWidth, cardHeight, 3, 3, 'FD');
  doc.setFontSize(10);
  doc.setTextColor(100, 116, 139);
  doc.text('Lowest', 20 + cardWidth + 5, yPos + 8);
  doc.setFontSize(16);
  doc.setTextColor(22, 163, 74); // Green
  doc.text(`${stats.min} mg/dL`, 20 + cardWidth + 5, yPos + 20);

  // Max Card
  doc.setFillColor(241, 245, 249);
  doc.roundedRect(14 + (cardWidth + 5) * 2, yPos, cardWidth, cardHeight, 3, 3, 'FD');
  doc.setFontSize(10);
  doc.setTextColor(100, 116, 139);
  doc.text('Highest', 20 + (cardWidth + 5) * 2, yPos + 8);
  doc.setFontSize(16);
  doc.setTextColor(220, 38, 38); // Red
  doc.text(`${stats.max} mg/dL`, 20 + (cardWidth + 5) * 2, yPos + 20);

  // Table
  const tableData = readings.map(r => [
    formatDate(r.date),
    formatTime(r.time),
    r.type,
    `${r.value} mg/dL`,
    getGlucoseStatus(r.value, r.type)
  ]);

  autoTable(doc, {
    startY: yPos + 35,
    head: [['Date', 'Time', 'Type', 'Level', 'Status']],
    body: tableData,
    theme: 'grid',
    headStyles: { fillColor: [14, 165, 233], textColor: 255 },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    columnStyles: {
      3: { fontStyle: 'bold' }
    }
  });

  doc.save(`GlucoseReport_${new Date().toISOString().split('T')[0]}.pdf`);
};