/**
 * Certificate PDF Generator
 *
 * Generates a professional course completion certificate using @react-pdf/renderer.
 * Includes legal disclaimer prominently.
 */

import { Document, Page, Text, View, StyleSheet, pdf } from '@react-pdf/renderer';
import type { CourseDiploma, CertificateLevel } from '../types/courseCompletion';
import { LEGAL_DISCLAIMER_TEXT, CERTIFICATE_LEVELS } from '../types/courseCompletion';

// =============================================================================
// Styles
// =============================================================================

const COLORS = {
  primary: '#1e3a5f',
  gold: '#ca8a04',
  goldLight: '#fef3c7',
  text: '#1e293b',
  textLight: '#64748b',
  border: '#d1d5db',
  disclaimerBg: '#fef2f2',
  disclaimerBorder: '#dc2626',
  white: '#ffffff',
};

const LEVEL_COLORS: Record<CertificateLevel, string> = {
  basico: '#2563eb',
  intermediario: '#7c3aed',
  avancado: '#dc2626',
};

const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: COLORS.white,
    padding: 40,
    fontFamily: 'Helvetica',
  },
  // Outer border
  outerBorder: {
    borderWidth: 3,
    borderColor: COLORS.gold,
    padding: 20,
    flex: 1,
  },
  innerBorder: {
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 25,
    flex: 1,
    justifyContent: 'space-between',
  },
  // Header
  headerSection: {
    alignItems: 'center',
    marginBottom: 15,
  },
  platformName: {
    fontSize: 12,
    color: COLORS.textLight,
    letterSpacing: 3,
    textTransform: 'uppercase',
  },
  mainTitle: {
    fontSize: 24,
    fontFamily: 'Helvetica-Bold',
    color: COLORS.primary,
    marginTop: 8,
    letterSpacing: 2,
  },
  divider: {
    width: 80,
    height: 2,
    backgroundColor: COLORS.gold,
    marginTop: 8,
    marginBottom: 8,
  },
  levelBadge: {
    paddingHorizontal: 16,
    paddingVertical: 4,
    borderRadius: 4,
    marginTop: 4,
  },
  levelText: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    color: COLORS.white,
    letterSpacing: 1,
  },
  // Body
  bodySection: {
    alignItems: 'center',
    marginBottom: 15,
  },
  certifyText: {
    fontSize: 11,
    color: COLORS.textLight,
    marginBottom: 6,
  },
  studentName: {
    fontSize: 22,
    fontFamily: 'Helvetica-Bold',
    color: COLORS.text,
    marginBottom: 6,
  },
  courseLabel: {
    fontSize: 11,
    color: COLORS.textLight,
    marginBottom: 4,
  },
  courseName: {
    fontSize: 18,
    fontFamily: 'Helvetica-Bold',
    color: COLORS.primary,
    marginBottom: 10,
  },
  competenciesTitle: {
    fontSize: 10,
    color: COLORS.textLight,
    marginBottom: 6,
    textAlign: 'center',
  },
  competencyItem: {
    fontSize: 9,
    color: COLORS.text,
    marginBottom: 3,
    textAlign: 'center',
  },
  // Stats
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
    marginTop: 12,
    marginBottom: 10,
  },
  statItem: {
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  statValue: {
    fontSize: 14,
    fontFamily: 'Helvetica-Bold',
    color: COLORS.primary,
  },
  statLabel: {
    fontSize: 8,
    color: COLORS.textLight,
    marginTop: 2,
  },
  // Certificate ID & Date
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  metaText: {
    fontSize: 8,
    color: COLORS.textLight,
  },
  // Legal Disclaimer
  disclaimerBox: {
    marginTop: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: COLORS.disclaimerBorder,
    backgroundColor: COLORS.disclaimerBg,
  },
  disclaimerTitle: {
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    color: COLORS.disclaimerBorder,
    marginBottom: 4,
    textAlign: 'center',
  },
  disclaimerText: {
    fontSize: 6.5,
    color: COLORS.text,
    lineHeight: 1.4,
    textAlign: 'justify',
  },
  // Footer
  footer: {
    marginTop: 8,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 7,
    color: COLORS.textLight,
  },
});

// =============================================================================
// PDF Document Component
// =============================================================================

function CertificateDocument({ diploma }: { diploma: CourseDiploma }) {
  const levelConfig = CERTIFICATE_LEVELS.find((l) => l.level === diploma.certificateLevel);
  const levelColor = LEVEL_COLORS[diploma.certificateLevel] || COLORS.primary;
  const issuedDate = new Date(diploma.issuedAt).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  return (
    <Document>
      <Page size="A4" orientation="landscape" style={styles.page}>
        <View style={styles.outerBorder}>
          <View style={styles.innerBorder}>
            {/* Header */}
            <View style={styles.headerSection}>
              <Text style={styles.platformName}>MyEasyAI - MyEasyLearning</Text>
              <Text style={styles.mainTitle}>CERTIFICADO DE CONCLUSAO</Text>
              <View style={styles.divider} />
              <View style={[styles.levelBadge, { backgroundColor: levelColor }]}>
                <Text style={styles.levelText}>
                  NIVEL {levelConfig?.label.toUpperCase() || diploma.certificateLevel.toUpperCase()}
                </Text>
              </View>
            </View>

            {/* Body */}
            <View style={styles.bodySection}>
              <Text style={styles.certifyText}>Certificamos que</Text>
              <Text style={styles.studentName}>{diploma.studentName}</Text>
              <Text style={styles.courseLabel}>concluiu com exito o curso de</Text>
              <Text style={styles.courseName}>{diploma.skillName}</Text>

              {/* Competencies */}
              {levelConfig && (
                <>
                  <Text style={styles.competenciesTitle}>
                    demonstrando competencia em:
                  </Text>
                  {levelConfig.whatItAttests.map((item, idx) => (
                    <Text key={idx} style={styles.competencyItem}>
                      • {item}
                    </Text>
                  ))}
                </>
              )}
            </View>

            {/* Stats */}
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{diploma.finalExamScore}%</Text>
                <Text style={styles.statLabel}>Nota Prova Final</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{diploma.totalHoursStudied}h</Text>
                <Text style={styles.statLabel}>Horas de Estudo</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{diploma.lessonsCompleted}</Text>
                <Text style={styles.statLabel}>Licoes Concluidas</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{diploma.exercisesCompleted}</Text>
                <Text style={styles.statLabel}>Exercicios Concluidos</Text>
              </View>
            </View>

            {/* Meta */}
            <View style={styles.metaRow}>
              <Text style={styles.metaText}>ID: {diploma.id}</Text>
              <Text style={styles.metaText}>Data de conclusao: {issuedDate}</Text>
            </View>

            {/* Legal Disclaimer */}
            <View style={styles.disclaimerBox}>
              <Text style={styles.disclaimerTitle}>AVISO LEGAL IMPORTANTE</Text>
              <Text style={styles.disclaimerText}>{LEGAL_DISCLAIMER_TEXT}</Text>
            </View>

            {/* Footer */}
            <View style={styles.footer}>
              <Text style={styles.footerText}>
                Gerado em {issuedDate} - MyEasyAI / MyEasyLearning
              </Text>
            </View>
          </View>
        </View>
      </Page>
    </Document>
  );
}

// =============================================================================
// Export Function
// =============================================================================

export async function exportCertificatePdf(diploma: CourseDiploma): Promise<void> {
  const blob = await pdf(<CertificateDocument diploma={diploma} />).toBlob();

  const date = new Date().toISOString().split('T')[0];
  const safeName = diploma.skillName.replace(/[^a-zA-Z0-9]/g, '_');
  const filename = `Certificado_${safeName}_${date}.pdf`;

  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
