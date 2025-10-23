// utils/pdfGenerator.ts
// ...ver4の正しい内容をここに挿入...
// src/utils/pdfGenerator.ts
import { TournamentInfoFormData, TournamentBracket, LeagueTable } from '../types';
import { formatBracketForPdf, formatLeagueForPdf } from './pdfFormatters';

interface PdfContent {
  html: string;
  styles: string;
}

const escapeHTML = (unsafe: string): string => {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
};

export const prepareTournamentPDFContent = (
  data: TournamentInfoFormData,
  bracket?: TournamentBracket,
  league?: LeagueTable
): PdfContent => {
  const buildHtml = (d: TournamentInfoFormData): string => {
    const s = (text: string | undefined | number) => escapeHTML(text?.toString().trim() || '-');
    const pre = (text: string | undefined) => {
      const escapedText = escapeHTML(text?.toString() || '');
      return `<div class="pre-wrap">${escapedText.replace(/\n/g, '<br />') || '-'}</div>`;
    };

    let fixtureHtml = '';
    if (league && league.groups.some(g => g.teams.length > 0)) {
      fixtureHtml += formatLeagueForPdf(league);
    }
    if (bracket) {
      if (fixtureHtml) fixtureHtml += `<div class="page-break"></div>`;
      fixtureHtml += formatBracketForPdf(bracket);
    }

    return `
      <h1>${s(d.eventName)}</h1>
      
      <div class="grid-container">
        <section><h2>大会概要</h2>
          <p><strong>主催:</strong> ${s(d.organizerInfo.organizationName)}</p>
          <p><strong>担当:</strong> ${s(d.organizerInfo.contactPersonName)}</p>
        </section>
        <section><h2>開催日時・会場</h2>
          <p><strong>開催日:</strong> ${s(d.eventDateTime.eventDate)}</p>
          <p><strong>時間:</strong> ${s(d.eventDateTime.startTime)} 〜 ${s(d.eventDateTime.endTime)}</p>
          <p><strong>受付:</strong> ${s(d.eventDateTime.entryTime)}</p>
          <p><strong>会場:</strong> ${s(d.venueInfo.facilityName)}</p>
          <p><strong>住所:</strong> ${s(d.venueInfo.address)}</p>
        </section>
        <section class="full-width"><h2>参加チーム</h2>${pre(d.participatingTeams)}</section>
        <section><h2>参加資格</h2>
          <p><strong>学年等:</strong> ${s(d.participantEligibility.gradeLevel)}</p>
          <p><strong>年齢制限:</strong> ${s(d.participantEligibility.ageLimit)}</p>
        </section>
        <section><h2>競技情報</h2>
          <p><strong>コート:</strong> ${s(d.courtInfo.size)} (${s(d.courtInfo.numberOfCourts)}面)</p>
          <p><strong>試合人数:</strong> ${s(d.matchFormat.playersPerTeam)}</p>
          <p><strong>ゴール:</strong> ${s(d.matchFormat.goalSpecifications)}</p>
          <p><strong>使用球:</strong> ${s(d.ballInfo)}</p>
          <p><strong>審判:</strong> ${s(d.refereeSystem)}</p>
        </section>
        <section class="full-width"><h2>競技規則</h2>${pre(d.competitionRules)}</section>
        <section><h2>試合形式・時間</h2>
          <p><strong>式典等:</strong> ${s(d.matchSchedule.ceremonyInfo)}</p>
          <p><strong>飲水タイム:</strong> ${s(d.matchSchedule.waterBreakInfo)}</p>
        </section>
        <section><h2>順位決定方法</h2>
          <p><strong>勝ち点:</strong> ${s(d.rankingMethod.pointsRule)}</p>
          <p><strong>タイブレーク:</strong> ${s(d.rankingMethod.tieBreakerRule)}</p>
          <p><strong>詳細:</strong></p>${pre(d.rankingMethod.leagueSystemDescription)}
        </section>
        <section><h2>表彰</h2>
          <p><strong>優勝:</strong> ${s(d.awards.winner)}</p>
          <p><strong>準優勝:</strong> ${s(d.awards.runnerUp)}</p>
          <p><strong>3位:</strong> ${s(d.awards.thirdPlace)}</p>
          <p><strong>個人賞:</strong> ${s(d.awards.individualAwards)}</p>
        </section>
        <section><h2>参加費</h2>
          <p><strong>金額:</strong> ${s(d.participationFee.amount)}</p>
          <p><strong>支払方法:</strong> ${s(d.participationFee.paymentMethod)}</p>
          <p><strong>備考:</strong></p>${pre(d.participationFee.paymentNotes)}
        </section>
        <section class="full-width"><h2>注意事項</h2>
          <p><strong>駐車場:</strong> ${s(d.generalNotes.parkingInfo)}</p>
          <p><strong>観戦エリア:</strong> ${s(d.generalNotes.spectatorArea)}</p>
          <p><strong>キャンセル規定:</strong> ${s(d.generalNotes.cancellationPolicy)}</p>
        </section>
        <section class="full-width"><h2>緊急連絡先</h2>
          <p><strong>担当者:</strong> ${s(d.contactInfo.personName)}</p>
          <p><strong>電話番号:</strong> ${s(d.contactInfo.phoneNumber)}</p>
        </section>
      </div>

      ${fixtureHtml ? `<div class="page-break"></div>${fixtureHtml}` : ''}
    `;
  };

  const styles = `
    body { font-family: 'Helvetica Neue', 'Helvetica', 'Arial', sans-serif; line-height: 1.3; color: #333; margin: 8px; background-color: #fff; }
    h1 { text-align: center; font-size: 1.2em; margin-bottom: 0.7em; border-bottom: 1px solid #3498db; padding-bottom: 0.2em; color: #2c3e50; }
    h2 { font-size: 1em; color: #2980b9; border-bottom: 1px solid #bdc3c7; padding-bottom: 0.1em; margin-top: 0.7em; margin-bottom: 0.4em; }
    .grid-container { display: grid; grid-template-columns: 1fr 1fr; gap: 8px 12px; }
    section { padding: 3px; border-radius: 3px; break-inside: avoid; }
    section.full-width { grid-column: 1 / -1; }
    p { margin: 0.2em 0; font-size: 0.85em; }
    strong { color: #34495e; min-width: 60px; display: inline-block; font-size: 0.85em; }
    .pre-wrap { white-space: pre-wrap; word-wrap: break-word; background-color: #f9f9f9; padding: 4px; border-radius: 3px; border: 1px solid #eee; margin-top: 0.2em; font-size: 0.8em; }
    .page-break { page-break-before: always; }
    .fixture-title { font-size: 1em; color: #2c3e50; text-align: center; margin-top: 0.7em; margin-bottom: 0.4em; }
    /* Fixture Styles */
    .bracket-container { display: flex; flex-wrap: wrap; gap: 4px; justify-content: center; }
    .bracket-round { display: flex; flex-direction: column; align-items: center; margin: 0 4px; }
    .bracket-round-title { font-weight: bold; text-align: center; margin-bottom: 6px; font-size: 0.9em;}
    .bracket-match { background-color: #f0f0f0; border: 1px solid #ccc; border-radius: 3px; padding: 3px; margin-bottom: 7px; width: 110px; }
    .match-teams { display: flex; justify-content: space-between; padding: 1px 0; border-bottom: 1px solid #ddd; }
    .match-teams:last-child { border-bottom: none; }
    .team { flex-grow: 1; font-size: 0.8em; }
    .score { font-weight: bold; min-width: 18px; text-align: right; font-size: 0.8em; }
    .league-table { width: 100%; border-collapse: collapse; font-size: 0.7em; margin-top: 4px; }
    .league-group-title { font-size: 0.9em; font-weight: bold; margin-top: 0.5em; margin-bottom: 0.2em; }
    .league-table th, .league-table td { border: 1px solid #ccc; padding: 2px 3px; text-align: center; }
    .league-table th { background-color: #e9ecef; }
    .league-table td.team-name-cell { text-align: left; }
    .fixture-list-title { font-size: 0.9em; font-weight: bold; margin-top: 1em; margin-bottom: 0.2em; }
    .fixture-table { width: 100%; border-collapse: collapse; font-size: 0.7em; margin-top: 4px; }
    .fixture-table th, .fixture-table td { border: 1px solid #ccc; padding: 2px 3px; text-align: center; }
    .fixture-table th { background-color: #f8f9fa; }
    .fixture-team-name { text-align: left; width: 40%; font-size: 0.8em;}
    .fixture-score { text-align: center; width: 20%; font-weight: bold; font-size: 0.8em; }
    @media print { body { margin: 0; -webkit-print-color-adjust: exact; print-color-adjust: exact; } .grid-container { display: block; } section { padding: 0; margin-bottom: 0.5em; } h1, h2 { page-break-after: avoid; } }
  `;

  return {
    html: buildHtml(data),
    styles
  };
};
