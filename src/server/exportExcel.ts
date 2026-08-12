import ExcelJS from 'exceljs';
import { TimeEntry, User, Mission, Client } from '../types.js';

interface ExportOptions {
  user: User;
  timeEntries: TimeEntry[];
  missions: Mission[];
  clients: Client[];
  periodLabel?: string;
  startDate?: string;
  endDate?: string;
  isFullExport?: boolean;
}

interface WeekBucket {
  weekNum: number;
  startDateStr: string; // YYYY-MM-DD
  endDateStr: string;   // YYYY-MM-DD
  formattedRange: string;
  entries: TimeEntry[];
}

/**
 * Format date YYYY-MM-DD to DD/MM/YYYY
 */
function formatDateFr(dateStr: string): string {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }
  return dateStr;
}

/**
 * Get Monday YYYY-MM-DD for a given date
 */
function getMondayOfDate(d: Date): Date {
  const date = new Date(d.getTime());
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is Sunday
  date.setDate(diff);
  return date;
}

function dateToYmd(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export async function generateTimesheetExcel(options: ExportOptions): Promise<Buffer> {
  const { user, timeEntries, periodLabel = 'Toutes périodes', startDate, endDate } = options;

  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'STK-TIMESHEET App';
  workbook.lastModifiedBy = `${user.firstName} ${user.lastName}`;
  workbook.created = new Date();

  // Color palette
  const NAVY_HEADER_FILL = '1E293B';
  const SUBHEADER_FILL = 'F1F5F9';
  const TABLE_HEADER_FILL = '334155';
  const LIGHT_ROW_FILL = 'F8FAFC';
  const BORDER_COLOR = 'CBD5E1';

  const dayNamesFr = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];

  // 1. Determine Date Range for Weeks
  let minDate: Date;
  let maxDate: Date;

  if (startDate && endDate) {
    minDate = new Date(startDate);
    maxDate = new Date(endDate);
  } else if (timeEntries.length > 0) {
    const dates = timeEntries.map(e => new Date(e.date).getTime()).filter(t => !isNaN(t));
    minDate = new Date(Math.min(...dates));
    maxDate = new Date(Math.max(...dates));
  } else {
    // Default to current month
    const now = new Date();
    minDate = new Date(now.getFullYear(), now.getMonth(), 1);
    maxDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  }

  // Find Monday of first week and Sunday of last week
  let currentMonday = getMondayOfDate(minDate);
  const endLimitMonday = getMondayOfDate(maxDate);

  const weekBuckets: WeekBucket[] = [];
  let weekCounter = 1;

  while (currentMonday.getTime() <= endLimitMonday.getTime()) {
    const weekStartStr = dateToYmd(currentMonday);
    const currentSunday = new Date(currentMonday.getTime());
    currentSunday.setDate(currentSunday.getDate() + 6);
    const weekEndStr = dateToYmd(currentSunday);

    const formattedRange = `du ${formatDateFr(weekStartStr)} au ${formatDateFr(weekEndStr)}`;

    // Filter time entries belonging to this calendar week
    const weekEntries = timeEntries
      .filter(e => e.date >= weekStartStr && e.date <= weekEndStr)
      .sort((a, b) => a.date.localeCompare(b.date));

    weekBuckets.push({
      weekNum: weekCounter,
      startDateStr: weekStartStr,
      endDateStr: weekEndStr,
      formattedRange,
      entries: weekEntries
    });

    // Move to next week
    currentMonday.setDate(currentMonday.getDate() + 7);
    weekCounter++;
  }

  // If no buckets created, create at least week 1
  if (weekBuckets.length === 0) {
    const today = new Date();
    const mon = getMondayOfDate(today);
    const sun = new Date(mon.getTime());
    sun.setDate(sun.getDate() + 6);
    weekBuckets.push({
      weekNum: 1,
      startDateStr: dateToYmd(mon),
      endDateStr: dateToYmd(sun),
      formattedRange: `du ${formatDateFr(dateToYmd(mon))} au ${formatDateFr(dateToYmd(sun))}`,
      entries: []
    });
  }

  // 2. Generate One Worksheet per Week
  for (const bucket of weekBuckets) {
    const sheetName = `Semaine ${bucket.weekNum}`;
    const sheet = workbook.addWorksheet(sheetName, {
      views: [{ showGridLines: true }]
    });

    // Title Block
    sheet.mergeCells('A1:H1');
    const titleCell = sheet.getCell('A1');
    titleCell.value = `STK-TIMESHEET — SEMAINE ${bucket.weekNum}`;
    titleCell.font = { name: 'Arial', size: 14, bold: true, color: { argb: 'FFFFFF' } };
    titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: NAVY_HEADER_FILL } };
    titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
    sheet.getRow(1).height = 34;

    // Subheader Info Block
    sheet.mergeCells('A2:H2');
    const subCell = sheet.getCell('A2');
    subCell.value = `Collaborateur: ${user.firstName} ${user.lastName}  |  Période: ${periodLabel}  |  Dates: ${bucket.formattedRange}`;
    subCell.font = { name: 'Arial', size: 10, bold: true, color: { argb: '334155' } };
    subCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: SUBHEADER_FILL } };
    subCell.alignment = { horizontal: 'center', vertical: 'middle' };
    sheet.getRow(2).height = 22;

    sheet.addRow([]); // Blank row 3

    // Table Column Headers
    const headers = [
      'Date',
      'Jour',
      'Client',
      'Mission / Projet',
      'Activité / Tâche',
      'Description / Remarques',
      'Statut',
      'Durée (h)'
    ];

    const headerRow = sheet.addRow(headers);
    headerRow.height = 26;
    headerRow.eachCell((cell) => {
      cell.font = { name: 'Arial', size: 10, bold: true, color: { argb: 'FFFFFF' } };
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: TABLE_HEADER_FILL } };
      cell.alignment = { horizontal: 'center', vertical: 'middle' };
      cell.border = {
        top: { style: 'thin', color: { argb: BORDER_COLOR } },
        bottom: { style: 'medium', color: { argb: '0F172A' } },
        left: { style: 'thin', color: { argb: BORDER_COLOR } },
        right: { style: 'thin', color: { argb: BORDER_COLOR } }
      };
    });

    const startRowIndex = 5;
    let currentRowIndex = startRowIndex;

    if (bucket.entries.length === 0) {
      const emptyRow = sheet.addRow(['Aucune tâche enregistrée pour cette semaine', '', '', '', '', '', '', 0]);
      sheet.mergeCells(`A${currentRowIndex}:G${currentRowIndex}`);
      emptyRow.height = 22;
      emptyRow.eachCell((cell, colNum) => {
        cell.font = { name: 'Arial', size: 9, italic: true, color: { argb: '64748B' } };
        cell.border = {
          top: { style: 'thin', color: { argb: BORDER_COLOR } },
          bottom: { style: 'thin', color: { argb: BORDER_COLOR } },
          left: { style: 'thin', color: { argb: BORDER_COLOR } },
          right: { style: 'thin', color: { argb: BORDER_COLOR } }
        };
        if (colNum === 8) {
          cell.alignment = { horizontal: 'right' };
          cell.numFmt = '0.0 "h"';
        } else {
          cell.alignment = { horizontal: 'center' };
        }
      });
      currentRowIndex++;
    } else {
      bucket.entries.forEach((entry, idx) => {
        const entryDate = new Date(entry.date);
        const dayName = dayNamesFr[entryDate.getDay()] || '';
        const taskStatusVal = entry.taskStatus || 'Terminé';

        const row = sheet.addRow([
          formatDateFr(entry.date),
          dayName,
          entry.clientName,
          entry.missionName,
          entry.activity,
          entry.description || '-',
          taskStatusVal,
          entry.hours
        ]);

        row.height = 22;
        const isEven = idx % 2 === 0;

        row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
          cell.font = { name: 'Arial', size: 9 };
          cell.border = {
            top: { style: 'thin', color: { argb: BORDER_COLOR } },
            bottom: { style: 'thin', color: { argb: BORDER_COLOR } },
            left: { style: 'thin', color: { argb: BORDER_COLOR } },
            right: { style: 'thin', color: { argb: BORDER_COLOR } }
          };

          if (!isEven) {
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: LIGHT_ROW_FILL } };
          }

          if (colNumber === 1 || colNumber === 2) {
            cell.alignment = { horizontal: 'center' };
            cell.font = { name: 'Arial', size: 9, bold: true };
          } else if (colNumber === 7) {
            // Task Status
            cell.alignment = { horizontal: 'center' };
            cell.font = { name: 'Arial', size: 9, bold: true };
            if (taskStatusVal === 'En attente') {
              cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FEF3C7' } };
              cell.font = { name: 'Arial', size: 9, bold: true, color: { argb: 'B45309' } };
            } else if (taskStatusVal === 'En cours') {
              cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'DBEAFE' } };
              cell.font = { name: 'Arial', size: 9, bold: true, color: { argb: '1D4ED8' } };
            } else { // Terminé
              cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'DCFCE7' } };
              cell.font = { name: 'Arial', size: 9, bold: true, color: { argb: '15803D' } };
            }
          } else if (colNumber === 8) {
            // Hours
            cell.alignment = { horizontal: 'right' };
            cell.numFmt = '0.0 "h"';
            cell.font = { name: 'Arial', size: 9, bold: true };
          } else {
            cell.alignment = { horizontal: 'left' };
          }
        });

        currentRowIndex++;
      });
    }

    // Weekly Total Row
    const totalRowIndex = currentRowIndex;
    const totalRow = sheet.addRow([
      `TOTAL SEMAINE ${bucket.weekNum}`,
      '', '', '', '', '', '',
      { formula: `SUM(H${startRowIndex}:H${totalRowIndex - 1})` }
    ]);

    sheet.mergeCells(`A${totalRowIndex}:G${totalRowIndex}`);
    totalRow.height = 26;

    totalRow.eachCell({ includeEmpty: true }, (cell, colNumber) => {
      cell.font = { name: 'Arial', size: 10, bold: true, color: { argb: '0F172A' } };
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'E2E8F0' } };
      cell.border = {
        top: { style: 'medium', color: { argb: '0F172A' } },
        bottom: { style: 'double', color: { argb: '0F172A' } },
        left: { style: 'thin', color: { argb: BORDER_COLOR } },
        right: { style: 'thin', color: { argb: BORDER_COLOR } }
      };

      if (colNumber === 1) {
        cell.alignment = { horizontal: 'right', vertical: 'middle' };
      } else if (colNumber === 8) {
        cell.alignment = { horizontal: 'right', vertical: 'middle' };
        cell.numFmt = '0.0 "h"';
      }
    });

    // Column widths
    sheet.columns = [
      { width: 14 }, // Date
      { width: 12 }, // Jour
      { width: 22 }, // Client
      { width: 26 }, // Mission / Projet
      { width: 24 }, // Activité / Tâche
      { width: 42 }, // Description
      { width: 16 }, // Statut
      { width: 14 }  // Durée (h)
    ];
  }

  // Generate Excel buffer
  const arrayBuffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(arrayBuffer);
}
