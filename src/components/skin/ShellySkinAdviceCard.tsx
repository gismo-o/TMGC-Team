import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { AlertTriangle, Eye, Link2, Lightbulb, Sparkles } from 'lucide-react-native';
import { SkinAnalysis, SkinChangeLevel } from '../../types';
import { colors, fonts, gradients, radius, shadows } from '../../theme';
import { changeLabels, levelColors, levelLabels } from './skinLabels';

type Props = {
  analysis: SkinAnalysis;
};

export default function ShellySkinAdviceCard({ analysis }: Props) {
  const changeEntries = Object.entries(analysis.visibleChanges) as [string, SkinChangeLevel][];

  return (
    <View style={styles.container}>
      {/* Shelly'nin Yorumu */}
      <LinearGradient colors={gradients.forest} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.heroCard}>
        <View style={styles.heroHeader}>
          <View style={styles.heroIcon}>
            <Sparkles size={17} color={colors.goldSoft} />
          </View>
          <Text style={styles.heroTitle}>{analysis.title || "Shelly'nin Yorumu"}</Text>
        </View>
        <Text style={styles.heroText}>{analysis.summary}</Text>
        {analysis.tags.length > 0 && (
          <View style={styles.tagRow}>
            {analysis.tags.map(tag => (
              <View key={tag} style={styles.tag}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
          </View>
        )}
      </LinearGradient>

      {/* Görünür Değişimler */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Eye size={16} color={colors.sage} />
          <Text style={styles.cardTitle}>Görünür Değişimler</Text>
        </View>
        {changeEntries.map(([key, level]) => (
          <View key={key} style={styles.changeRow}>
            <Text style={styles.changeLabel}>{changeLabels[key]}</Text>
            <View style={styles.changeLevelWrap}>
              <View style={[styles.changeDot, { backgroundColor: levelColors[level] }]} />
              <Text style={[styles.changeLevel, { color: levelColors[level] }]}>{levelLabels[level]}</Text>
            </View>
          </View>
        ))}
      </View>

      {/* Rutinle Bağlantı */}
      {analysis.routineConnection ? (
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Link2 size={16} color={colors.gold} />
            <Text style={styles.cardTitle}>Rutinle Bağlantı</Text>
          </View>
          <Text style={styles.cardText}>{analysis.routineConnection}</Text>
        </View>
      ) : null}

      {/* Bugünkü Öneri */}
      {analysis.suggestion ? (
        <View style={[styles.card, styles.suggestionCard]}>
          <View style={styles.cardHeader}>
            <Lightbulb size={16} color={colors.success} />
            <Text style={styles.cardTitle}>Bugünkü Öneri</Text>
          </View>
          <Text style={styles.cardText}>{analysis.suggestion}</Text>
        </View>
      ) : null}

      {/* Dikkat */}
      {analysis.warning ? (
        <View style={[styles.card, styles.warningCard]}>
          <View style={styles.cardHeader}>
            <AlertTriangle size={16} color={colors.danger} />
            <Text style={[styles.cardTitle, { color: colors.danger }]}>Dikkat</Text>
          </View>
          <Text style={styles.cardText}>{analysis.warning}</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 13 },
  heroCard: {
    borderRadius: radius.xl,
    padding: 18,
    ...shadows.card,
  },
  heroHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 11 },
  heroIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(216,195,154,0.35)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroTitle: {
    flex: 1,
    fontFamily: fonts.display,
    fontSize: 18,
    color: colors.onDark,
  },
  heroText: {
    fontFamily: fonts.sans,
    fontSize: 13.5,
    lineHeight: 21,
    color: 'rgba(255,255,255,0.9)',
  },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 7, marginTop: 13 },
  tag: {
    paddingHorizontal: 11,
    paddingVertical: 5,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(216,195,154,0.3)',
  },
  tagText: {
    fontFamily: fonts.sansBold,
    fontSize: 11,
    color: colors.goldSoft,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.line,
    ...shadows.soft,
  },
  suggestionCard: {
    backgroundColor: colors.successSurface,
    borderColor: '#D3E6D8',
  },
  warningCard: {
    backgroundColor: colors.dangerSurface,
    borderColor: '#F2D9D6',
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  cardTitle: {
    fontFamily: fonts.sansBold,
    fontSize: 14.5,
    color: colors.ink,
  },
  cardText: {
    fontFamily: fonts.sans,
    fontSize: 13,
    lineHeight: 20,
    color: colors.inkSoft,
  },
  changeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: colors.surfaceMuted,
  },
  changeLabel: {
    flex: 1,
    fontFamily: fonts.sansSemiBold,
    fontSize: 13,
    color: colors.inkSoft,
  },
  changeLevelWrap: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  changeDot: { width: 7, height: 7, borderRadius: 4 },
  changeLevel: {
    fontFamily: fonts.sansBold,
    fontSize: 12.5,
  },
});
