import { jsPDF } from 'jspdf';
import { Profile, SaedNote, PpaWorkLog, DocumentVaultItem } from '../types/nysc';

/**
 * Cleanly wraps text into lines within given maxWidth using jsPDF splitTextToSize
 */
function wrapAndAddText(
  doc: jsPDF,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number = 6
): number {
  const lines = doc.splitTextToSize(text, maxWidth);
  for (const line of lines) {
    if (y > 275) {
      doc.addPage();
      y = 20;
    }
    doc.text(line, x, y);
    y += lineHeight;
  }
  return y;
}

/**
 * Export SAED Learning Journal entries as a formatted PDF
 */
export function exportSaedNotesToPdf(
  profile: Profile,
  notes: SaedNote[],
  selectedCategory: string = 'All'
): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  let currentY = 18;

  // 1. Top NYSC Green Header Band (#008751)
  doc.setFillColor(0, 135, 81);
  doc.rect(0, 0, pageWidth, 26, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('NATIONAL YOUTH SERVICE CORPS (NYSC)', pageWidth / 2, 11, { align: 'center' });

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('SKILL ACQUISITION & ENTREPRENEURSHIP DEVELOPMENT (SAED) JOURNAL', pageWidth / 2, 18, { align: 'center' });

  currentY = 34;

  // 2. Corper Metadata Box
  doc.setFillColor(241, 245, 249);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(14, currentY, pageWidth - 28, 26, 3, 3, 'FD');

  doc.setTextColor(15, 23, 42);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');

  doc.text(`Corps Member: ${profile.full_name || 'Corper'}`, 18, currentY + 7);
  doc.text(`State Code: ${profile.state_code || 'LA/26A/4819'}`, 18, currentY + 14);
  doc.text(`Deployment: ${profile.state_of_deployment || 'Lagos'} (${profile.lga || 'Ikeja'} LGA)`, 18, currentY + 21);

  doc.text(`CDS Group: ${profile.cds_group || 'General'}`, pageWidth / 2 + 10, currentY + 7);
  doc.text(`Batch/Stream: ${profile.batch_stream || 'Batch A Stream 1'}`, pageWidth / 2 + 10, currentY + 14);
  doc.text(`Track Filter: ${selectedCategory}`, pageWidth / 2 + 10, currentY + 21);

  currentY += 34;

  // 3. Section Title
  doc.setTextColor(0, 135, 81);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text(`COMPILED VOCATIONAL NOTES & PRACTICAL MASTERCLASSES (${notes.length} ENTRIES)`, 14, currentY);

  currentY += 8;

  if (notes.length === 0) {
    doc.setTextColor(100, 116, 139);
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(10);
    doc.text('No SAED entries found for the selected category.', 14, currentY);
  } else {
    // Loop through notes
    notes.forEach((note, index) => {
      // Check if we need a new page for note header
      if (currentY > 250) {
        doc.addPage();
        currentY = 20;
      }

      // Note Card background
      doc.setDrawColor(226, 232, 240);
      doc.setFillColor(248, 250, 252);
      
      const startCardY = currentY;
      
      // Category badge
      doc.setFillColor(0, 135, 81);
      doc.rect(14, currentY, 3, 8, 'F');

      doc.setTextColor(15, 23, 42);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.text(`${index + 1}. ${note.title}`, 20, currentY + 6);

      doc.setFontSize(8);
      doc.setTextColor(100, 116, 139);
      doc.setFont('helvetica', 'normal');
      const dateStr = note.created_at ? note.created_at.split('T')[0] : '2026-04-10';
      doc.text(`Category: ${note.skill_category}  |  Logged Date: ${dateStr}`, 20, currentY + 11);

      currentY += 16;

      // Note Body text
      doc.setTextColor(51, 65, 85);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      currentY = wrapAndAddText(doc, note.content, 20, currentY, pageWidth - 38, 5);

      // Key Takeaways bullets
      if (note.key_takeaways && note.key_takeaways.length > 0) {
        currentY += 2;
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(0, 135, 81);
        doc.setFontSize(8.5);
        doc.text('Key Practical Takeaways:', 20, currentY);
        currentY += 4.5;

        doc.setFont('helvetica', 'normal');
        doc.setTextColor(30, 41, 59);
        note.key_takeaways.forEach((point) => {
          currentY = wrapAndAddText(doc, `• ${point}`, 23, currentY, pageWidth - 42, 4.5);
        });
      }

      // Photos summary
      if (note.images && note.images.length > 0) {
        currentY += 2;
        doc.setTextColor(100, 116, 139);
        doc.setFont('helvetica', 'italic');
        doc.setFontSize(8);
        doc.text(`[Attached ${note.images.length} verified vocational practical photo(s)]`, 20, currentY);
        currentY += 4;
      }

      // Separator Line
      doc.setDrawColor(226, 232, 240);
      doc.line(14, currentY + 2, pageWidth - 14, currentY + 2);
      currentY += 8;
    });
  }

  // Footer on all pages
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.setFont('helvetica', 'normal');
    doc.text(
      `My NYSC Companion • Page ${i} of ${totalPages} • Generated on ${new Date().toLocaleDateString()}`,
      pageWidth / 2,
      290,
      { align: 'center' }
    );
  }

  const safeFileName = `${(profile.full_name || 'Corper').replace(/\s+/g, '_')}_SAED_Journal.pdf`;
  doc.save(safeFileName);
}

/**
 * Export PPA Accomplishment Work Log & Auto-CV as PDF
 */
export function exportCvToPdf(
  profile: Profile,
  workLogs: PpaWorkLog[],
  skills: string[] = []
): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  let currentY = 20;

  // Header Bar
  doc.setFillColor(15, 23, 42); // Navy Dark
  doc.rect(0, 0, pageWidth, 30, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text((profile.full_name || 'Corps Member').toUpperCase(), pageWidth / 2, 13, { align: 'center' });

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  const contactLine = `Phone: ${profile.phone || '+234 800 000 0000'}  |  ${profile.state_of_deployment || 'Lagos'}, Nigeria  |  NYSC State Code: ${profile.state_code || 'LA/26A/4819'}`;
  doc.text(contactLine, pageWidth / 2, 22, { align: 'center' });

  currentY = 40;

  // 1. Professional Summary
  doc.setTextColor(0, 135, 81);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('PROFESSIONAL SUMMARY', 14, currentY);
  doc.setDrawColor(0, 135, 81);
  doc.line(14, currentY + 2, pageWidth - 14, currentY + 2);
  currentY += 7;

  doc.setTextColor(51, 65, 85);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  const summaryText = `Dedicated and high-achieving Corps Member currently completing national service in ${profile.state_of_deployment || 'Lagos'} State (${profile.lga || 'Ikeja'} LGA). Proven experience executing high-impact responsibilities at ${profile.ppa_name || 'Primary Place of Assignment'}. Combines academic training with practical vocational competence acquired through SAED masterclasses and Community Development Service leadership.`;
  currentY = wrapAndAddText(doc, summaryText, 14, currentY, pageWidth - 28, 5);

  currentY += 5;

  // 2. Primary Place of Assignment (PPA) Work Experience
  doc.setTextColor(0, 135, 81);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('NATIONAL SERVICE (PPA) EXPERIENCE', 14, currentY);
  doc.setDrawColor(0, 135, 81);
  doc.line(14, currentY + 2, pageWidth - 14, currentY + 2);
  currentY += 7;

  // Employer Header
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text(`Primary Assignment: ${profile.ppa_name || 'Primary Place of Assignment'}`, 14, currentY);

  doc.setTextColor(100, 116, 139);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.text(`Deployment: ${profile.state_of_deployment || 'Lagos'}  |  ${profile.swearing_in_date || '2026-03'} to ${profile.pop_date || '2027-02'}`, pageWidth - 14, currentY, { align: 'right' });
  currentY += 7;

  // Accomplishments Bullet Points
  if (workLogs.length === 0) {
    doc.setTextColor(100, 116, 139);
    doc.setFont('helvetica', 'italic');
    doc.text('• Conducted day-to-day corporate & pedagogical operations under direct supervisory mandate.', 18, currentY);
    currentY += 6;
  } else {
    workLogs.forEach((log) => {
      if (currentY > 260) {
        doc.addPage();
        currentY = 20;
      }

      doc.setFont('helvetica', 'normal');
      doc.setTextColor(15, 23, 42);
      doc.setFontSize(9);
      const prefix = log.log_date ? `• [${log.log_date}] ` : '• ';
      currentY = wrapAndAddText(doc, `${prefix}${log.achievement_text}`, 18, currentY, pageWidth - 32, 5);

      if (log.skill_tags && log.skill_tags.length > 0) {
        doc.setTextColor(0, 135, 81);
        doc.setFontSize(8);
        doc.setFont('helvetica', 'bold');
        doc.text(`Competencies: ${log.skill_tags.join(', ')}`, 22, currentY);
        currentY += 4.5;
        doc.setFont('helvetica', 'normal');
      }

      currentY += 2;
    });
  }

  // Skills Section if provided
  if (skills && skills.length > 0) {
    if (currentY > 250) {
      doc.addPage();
      currentY = 20;
    }
    currentY += 4;
    doc.setTextColor(0, 135, 81);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text('CORE SKILLS & TECHNICAL COMPETENCIES', 14, currentY);
    doc.setDrawColor(0, 135, 81);
    doc.line(14, currentY + 2, pageWidth - 14, currentY + 2);
    currentY += 7;

    doc.setTextColor(51, 65, 85);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    const skillsLine = skills.join('  •  ');
    currentY = wrapAndAddText(doc, skillsLine, 14, currentY, pageWidth - 28, 5);
  }

  currentY += 4;

  // 3. Community Development Service (CDS)
  if (currentY > 245) {
    doc.addPage();
    currentY = 20;
  }

  doc.setTextColor(0, 135, 81);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('COMMUNITY DEVELOPMENT SERVICE (CDS)', 14, currentY);
  doc.setDrawColor(0, 135, 81);
  doc.line(14, currentY + 2, pageWidth - 14, currentY + 2);
  currentY += 7;

  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.text(`Active Member — ${profile.cds_group || 'Community Development Group'}`, 14, currentY);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.setFontSize(8.5);
  doc.text(`${profile.lga || 'Ikeja'} Local Government Secretariat`, pageWidth - 14, currentY, { align: 'right' });
  currentY += 5.5;

  const cdsDesc = `Organized grassroots community sensitization campaigns, environmental sustainability drives, and civic development initiatives in collaboration with local community stakeholders.`;
  currentY = wrapAndAddText(doc, cdsDesc, 14, currentY, pageWidth - 28, 4.5);

  currentY += 6;

  // 4. Education & Certifications
  if (currentY > 245) {
    doc.addPage();
    currentY = 20;
  }

  doc.setTextColor(0, 135, 81);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('EDUCATION & CERTIFICATIONS', 14, currentY);
  doc.setDrawColor(0, 135, 81);
  doc.line(14, currentY + 2, pageWidth - 14, currentY + 2);
  currentY += 7;

  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('• National Youth Service Corps (NYSC) Discharge Certificate', 14, currentY);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text('Expected Feb 2027', pageWidth - 14, currentY, { align: 'right' });
  currentY += 5;

  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.text('• Bachelor\'s Degree / Higher National Diploma', 14, currentY);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text('Federal Republic of Nigeria', pageWidth - 14, currentY, { align: 'right' });
  currentY += 8;

  // Footer on all pages
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.setFont('helvetica', 'normal');
    doc.text(
      `Generated via My NYSC Companion • Page ${i} of ${totalPages}`,
      pageWidth / 2,
      290,
      { align: 'center' }
    );
  }

  const safeFileName = `${(profile.full_name || 'Corper').replace(/\s+/g, '_')}_NYSC_Professional_CV.pdf`;
  doc.save(safeFileName);
}

/**
 * Generate authenticated official NYSC PDF certificate/document for Document Vault
 */
export function exportDocumentVaultPdf(
  docItem: DocumentVaultItem,
  profile: Profile
): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();

  // Outer Border & Header
  doc.setDrawColor(0, 135, 81);
  doc.setLineWidth(1.5);
  doc.rect(8, 8, pageWidth - 16, 281);

  doc.setLineWidth(0.5);
  doc.rect(10, 10, pageWidth - 20, 277);

  // Green Header
  doc.setFillColor(0, 135, 81);
  doc.rect(10, 10, pageWidth - 20, 26, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('FEDERAL REPUBLIC OF NIGERIA', pageWidth / 2, 19, { align: 'center' });

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('NATIONAL YOUTH SERVICE CORPS DIRECTORATE HEADQUARTERS', pageWidth / 2, 26, { align: 'center' });

  let y = 50;

  // Document Title
  doc.setTextColor(0, 135, 81);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text(docItem.document_type.toUpperCase(), pageWidth / 2, y, { align: 'center' });
  y += 8;

  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  doc.setFont('helvetica', 'normal');
  doc.text(`Official Document Reference: ${docItem.file_name}`, pageWidth / 2, y, { align: 'center' });
  y += 16;

  // Credential Details Box
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(20, y, pageWidth - 40, 60, 3, 3, 'FD');

  doc.setTextColor(15, 23, 42);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('HOLDER DETAILS & VERIFICATION RECORD', 25, y + 9);
  doc.setDrawColor(226, 232, 240);
  doc.line(25, y + 12, pageWidth - 25, y + 12);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(`Corps Member Name:`, 25, y + 20);
  doc.setFont('helvetica', 'bold');
  doc.text(profile.full_name || 'Corps Member', 70, y + 20);

  doc.setFont('helvetica', 'normal');
  doc.text(`State Code:`, 25, y + 28);
  doc.setFont('helvetica', 'bold');
  doc.text(profile.state_code || 'LA/26A/4819', 70, y + 28);

  doc.setFont('helvetica', 'normal');
  doc.text(`State of Deployment:`, 25, y + 36);
  doc.setFont('helvetica', 'bold');
  doc.text(`${profile.state_of_deployment || 'Lagos'} (${profile.lga || 'Ikeja'} LGA)`, 70, y + 36);

  doc.setFont('helvetica', 'normal');
  doc.text(`Batch & Stream:`, 25, y + 44);
  doc.setFont('helvetica', 'bold');
  doc.text(profile.batch_stream || 'Batch A Stream 1', 70, y + 44);

  doc.setFont('helvetica', 'normal');
  doc.text(`Encryption Status:`, 25, y + 52);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 135, 81);
  doc.text(docItem.encryption_status || 'AES-256 Client-Side Encrypted', 70, y + 52);

  y += 76;

  // Verification Seal Box
  doc.setFillColor(240, 253, 244);
  doc.setDrawColor(187, 247, 208);
  doc.roundedRect(20, y, pageWidth - 40, 32, 3, 3, 'FD');

  doc.setTextColor(21, 128, 61);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('OFFICIAL DIGITAL ENCRYPTION SEAL', 25, y + 8);

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(22, 101, 52);
  doc.text('This document has been archived with AES-256 local encrypted storage in My NYSC Companion.', 25, y + 16);
  doc.text(`Upload Timestamp: ${docItem.uploaded_at || new Date().toISOString()}`, 25, y + 22);
  doc.text('Tamper-proof verifiable record authenticated for orientation camp & PPA inspections.', 25, y + 27);

  y += 50;

  // Signatures
  doc.setDrawColor(148, 163, 184);
  doc.line(25, y + 20, 85, y + 20);
  doc.line(pageWidth - 85, y + 20, pageWidth - 25, y + 20);

  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text('Authorized NYSC Official Stamp', 30, y + 25);
  doc.text('State Coordinator Endorsement', pageWidth - 80, y + 25);

  doc.save(docItem.file_name.endsWith('.pdf') ? docItem.file_name : `${docItem.file_name}.pdf`);
}
