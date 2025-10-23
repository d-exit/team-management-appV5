// src/utils/downloadHtmlAsPdf.ts
// Utility to download HTML+CSS as PDF using jsPDF and html2canvas
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { TournamentBracket, LeagueTable } from '../types';
import { formatBracketForPdf, formatLeagueForPdf } from './pdfFormatters';

interface PdfDownloadOptions {
  filename?: string;
  title?: string;
}

const escapeHTML = (unsafe: string): string => {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
};

export const downloadTableAsPdf = (
  table: TournamentBracket | LeagueTable,
  options: PdfDownloadOptions = {}
): void => {
  const { filename = 'table.pdf', title = '表' } = options;

  // HTMLコンテンツを生成
  let htmlContent = '';
  let tableTitle = '';

  if ('rounds' in table) {
    // トーナメント表
    tableTitle = `トーナメント表: ${escapeHTML(table.name)}`;
    htmlContent = formatBracketForPdf(table as TournamentBracket);
  } else if ('groups' in table) {
    // リーグ表
    tableTitle = `リーグ表: ${escapeHTML(table.name)}`;
    htmlContent = formatLeagueForPdf(table as LeagueTable);
  }

  // 完全なHTMLドキュメントを作成
  const fullHtml = `
    <!DOCTYPE html>
    <html lang="ja">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${tableTitle}</title>
      <style>
        body { 
          font-family: 'Helvetica Neue', 'Helvetica', 'Arial', sans-serif; 
          line-height: 1.3; 
          color: #333; 
          margin: 20px; 
          background-color: #fff; 
        }
        h1 { 
          text-align: center; 
          font-size: 1.5em; 
          margin-bottom: 1em; 
          border-bottom: 2px solid #3498db; 
          padding-bottom: 0.3em; 
          color: #2c3e50; 
        }
        h2 { 
          font-size: 1.2em; 
          color: #2980b9; 
          border-bottom: 1px solid #bdc3c7; 
          padding-bottom: 0.2em; 
          margin-top: 1em; 
          margin-bottom: 0.5em; 
        }
        h3 { 
          font-size: 1.1em; 
          color: #34495e; 
          margin-top: 0.8em; 
          margin-bottom: 0.3em; 
        }
        .fixture-title { 
          font-size: 1.3em; 
          color: #2c3e50; 
          text-align: center; 
          margin-top: 1em; 
          margin-bottom: 0.5em; 
        }
        .bracket-container { 
          display: flex; 
          flex-wrap: wrap; 
          gap: 8px; 
          justify-content: center; 
          margin-top: 1em;
        }
        .bracket-round { 
          display: flex; 
          flex-direction: column; 
          align-items: center; 
          margin: 0 8px; 
        }
        .bracket-round-title { 
          font-weight: bold; 
          text-align: center; 
          margin-bottom: 10px; 
          font-size: 1em;
        }
        .bracket-match { 
          background-color: #f8f9fa; 
          border: 1px solid #dee2e6; 
          border-radius: 6px; 
          padding: 8px; 
          margin-bottom: 12px; 
          width: 150px; 
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        .match-teams { 
          display: flex; 
          justify-content: space-between; 
          padding: 2px 0; 
          border-bottom: 1px solid #e9ecef; 
        }
        .match-teams:last-child { 
          border-bottom: none; 
        }
        .team { 
          flex-grow: 1; 
          font-size: 0.9em; 
          font-weight: 500;
        }
        .score { 
          font-weight: bold; 
          min-width: 25px; 
          text-align: right; 
          font-size: 0.9em; 
          color: #495057;
        }
        .league-table { 
          width: 100%; 
          border-collapse: collapse; 
          font-size: 0.85em; 
          margin-top: 8px; 
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .league-group-title { 
          font-size: 1.1em; 
          font-weight: bold; 
          margin-top: 1em; 
          margin-bottom: 0.5em; 
          color: #2c3e50;
        }
        .league-table th, .league-table td { 
          border: 1px solid #dee2e6; 
          padding: 6px 8px; 
          text-align: center; 
        }
        .league-table th { 
          background-color: #e9ecef; 
          font-weight: bold;
        }
        .league-table td.team-name-cell { 
          text-align: left; 
          font-weight: 500;
        }
        .fixture-list-title { 
          font-size: 1.1em; 
          font-weight: bold; 
          margin-top: 1.5em; 
          margin-bottom: 0.5em; 
        }
        .fixture-table { 
          width: 100%; 
          border-collapse: collapse; 
          font-size: 0.85em; 
          margin-top: 8px; 
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .fixture-table th, .fixture-table td { 
          border: 1px solid #dee2e6; 
          padding: 6px 8px; 
          text-align: center; 
        }
        .fixture-table th { 
          background-color: #f8f9fa; 
          font-weight: bold;
        }
        .fixture-team-name { 
          text-align: left; 
          width: 40%; 
          font-size: 0.9em;
          font-weight: 500;
        }
        .fixture-score { 
          text-align: center; 
          width: 20%; 
          font-weight: bold; 
          font-size: 0.9em; 
        }
        .fixture-time { 
          text-align: center; 
          width: 20%; 
          font-size: 0.8em; 
          color: #6c757d;
        }
        .fixture-court { 
          text-align: center; 
          width: 10%; 
          font-size: 0.8em; 
          color: #6c757d;
        }
        @media print { 
          body { 
            margin: 0; 
            -webkit-print-color-adjust: exact; 
            print-color-adjust: exact; 
          } 
          .bracket-container { 
            page-break-inside: avoid; 
          } 
          .league-table { 
            page-break-inside: avoid; 
          }
        }
      </style>
    </head>
    <body>
      <h1>${tableTitle}</h1>
      ${htmlContent}
    </body>
    </html>
  `;

  // Blobを作成してダウンロード
  const blob = new Blob([fullHtml], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  
  // ダウンロードリンクを作成
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  
  // クリーンアップ
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const downloadTableAsPdfWithPrint = (
  table: TournamentBracket | LeagueTable,
  options: PdfDownloadOptions = {}
): void => {
  const { filename = 'table.pdf', title = '表' } = options;

  // HTMLコンテンツを生成
  let htmlContent = '';
  let tableTitle = '';

  if ('rounds' in table) {
    // トーナメント表
    tableTitle = `トーナメント表: ${escapeHTML(table.name)}`;
    htmlContent = formatBracketForPdf(table as TournamentBracket);
  } else if ('groups' in table) {
    // リーグ表
    tableTitle = `リーグ表: ${escapeHTML(table.name)}`;
    htmlContent = formatLeagueForPdf(table as LeagueTable);
  }

  // 印刷用のHTMLドキュメントを作成
  const printHtml = `
    <!DOCTYPE html>
    <html lang="ja">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${tableTitle}</title>
      <style>
        @media print {
          body { 
            font-family: 'Helvetica Neue', 'Helvetica', 'Arial', sans-serif; 
            line-height: 1.3; 
            color: #000; 
            margin: 15px; 
            background-color: #fff; 
          }
          h1 { 
            text-align: center; 
            font-size: 18px; 
            margin-bottom: 15px; 
            border-bottom: 2px solid #000; 
            padding-bottom: 5px; 
          }
          h2 { 
            font-size: 14px; 
            color: #000; 
            border-bottom: 1px solid #ccc; 
            padding-bottom: 3px; 
            margin-top: 15px; 
            margin-bottom: 8px; 
          }
          h3 { 
            font-size: 12px; 
            color: #000; 
            margin-top: 12px; 
            margin-bottom: 5px; 
          }
          .fixture-title { 
            font-size: 16px; 
            color: #000; 
            text-align: center; 
            margin-top: 15px; 
            margin-bottom: 8px; 
          }
          .bracket-container { 
            display: flex; 
            flex-wrap: wrap; 
            gap: 10px; 
            justify-content: center; 
            margin-top: 15px;
          }
          .bracket-round { 
            display: flex; 
            flex-direction: column; 
            align-items: center; 
            margin: 0 10px; 
          }
          .bracket-round-title { 
            font-weight: bold; 
            text-align: center; 
            margin-bottom: 12px; 
            font-size: 12px;
          }
          .bracket-match { 
            background-color: #f8f9fa; 
            border: 1px solid #000; 
            border-radius: 4px; 
            padding: 6px; 
            margin-bottom: 15px; 
            width: 120px; 
          }
          .match-teams { 
            display: flex; 
            justify-content: space-between; 
            padding: 2px 0; 
            border-bottom: 1px solid #ccc; 
          }
          .match-teams:last-child { 
            border-bottom: none; 
          }
          .team { 
            flex-grow: 1; 
            font-size: 10px; 
            font-weight: 500;
          }
          .score { 
            font-weight: bold; 
            min-width: 20px; 
            text-align: right; 
            font-size: 10px; 
          }
          .league-table { 
            width: 100%; 
            border-collapse: collapse; 
            font-size: 10px; 
            margin-top: 10px; 
          }
          .league-group-title { 
            font-size: 12px; 
            font-weight: bold; 
            margin-top: 15px; 
            margin-bottom: 8px; 
          }
          .league-table th, .league-table td { 
            border: 1px solid #000; 
            padding: 4px 6px; 
            text-align: center; 
          }
          .league-table th { 
            background-color: #f0f0f0; 
            font-weight: bold;
          }
          .league-table td.team-name-cell { 
            text-align: left; 
            font-weight: 500;
          }
          .fixture-list-title { 
            font-size: 12px; 
            font-weight: bold; 
            margin-top: 20px; 
            margin-bottom: 8px; 
          }
          .fixture-table { 
            width: 100%; 
            border-collapse: collapse; 
            font-size: 10px; 
            margin-top: 10px; 
          }
          .fixture-table th, .fixture-table td { 
            border: 1px solid #000; 
            padding: 4px 6px; 
            text-align: center; 
          }
          .fixture-table th { 
            background-color: #f0f0f0; 
            font-weight: bold;
          }
          .fixture-team-name { 
            text-align: left; 
            width: 40%; 
            font-size: 10px;
            font-weight: 500;
          }
          .fixture-score { 
            text-align: center; 
            width: 20%; 
            font-weight: bold; 
            font-size: 10px; 
          }
          .fixture-time { 
            text-align: center; 
            width: 20%; 
            font-size: 9px; 
          }
          .fixture-court { 
            text-align: center; 
            width: 10%; 
            font-size: 9px; 
          }
        }
      </style>
    </head>
    <body>
      <h1>${tableTitle}</h1>
      ${htmlContent}
    </body>
    </html>
  `;

  // 新しいウィンドウで印刷用HTMLを開く
  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(printHtml);
    printWindow.document.close();
    
    // 印刷ダイアログを表示
    printWindow.print();
  }
};
