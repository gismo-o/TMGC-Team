import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { AlertTriangle, Lightbulb, Sparkles } from 'lucide-react-native';
import { ShellyStructuredResponse } from '../types';
import { colors, fonts, radius, shadows } from '../theme';

const riskLabels = { low: 'Düşük risk', medium: 'Orta risk', high: 'Yüksek risk' } as const;
const riskColors = { low: colors.success, medium: colors.warning, high: colors.danger } as const;

type Props = {
  response: ShellyStructuredResponse;
};

/** Shelly'nin yapılandırılmış yanıtını (değerlendirme / öneri / dikkat) kart olarak gösterir. */
export default function ShellyAdviceCard({ response }: Props) {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.iconWrap}>
          <Sparkles size={15} color={colors.gold} />
        </View>
        <Text style={styles.title} numberOfLines={1}>
          {response.title}
        </Text>
        <View style={[styles.riskPill, { borderColor: riskColors[response.riskLevel] }]}>
          <View style={[styles.riskDot, { backgroundColor: riskColors[response.riskLevel] }]} />
          <Text style={[styles.riskText, { color: riskColors[response.riskLevel] }]}>
            {riskLabels[response.riskLevel]}
          </Text>
        </View>
      </View>

      <Text style={styles.summary}>{response.summary}</Text>
      {response.reason ? <Text style={styles.reason}>{response.reason}</Text> : null}

      {response.suggestion ? (
        <View style={styles.suggestionRow}>
          <Lightbulb size={15} color={colors.success} style={styles.rowIcon} />
          <Text style={styles.suggestionText}>{response.suggestion}</Text>
        </View>
      ) : null}

      {response.warning ? (
        <View style={styles.warningRow}>
          <AlertTriangle size={15} color={colors.danger} style={styles.rowIcon} />
          <Text style={styles.warningText}>{response.warning}</Text>
        </View>
      ) : null}

      {response.tags.length > 0 && (
        <View style={styles.tagRow}>
          {response.tags.map(tag => (
            <View key={tag} style={styles.tag}>
              <Text style={styles.tagText}>{tag}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: 15,
    borderWidth: 1,
    borderColor: colors.lineGold,
    marginTop: 4,
    marginBottom: 12,
    ...shadows.soft,
  },
  header: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  iconWrap: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.surfaceMuted,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    flex: 1,
    fontFamily: fonts.sansBold,
    fontSize: 14,
    color: colors.ink,
  },
  riskPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: radius.pill,
    borderWidth: 1,
  },
  riskDot: { width: 6, height: 6, borderRadius: 3 },
  riskText: {
    fontFamily: fonts.sansBold,
    fontSize: 10,
  },
  summary: {
    fontFamily: fonts.sansSemiBold,
    fontSize: 13,
    lineHeight: 19,
    color: colors.inkSoft,
  },
  reason: {
    fontFamily: fonts.sans,
    fontSize: 12.5,
    lineHeight: 18,
    color: colors.inkMuted,
    marginTop: 7,
  },
  suggestionRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.successSurface,
    borderRadius: radius.md,
    padding: 11,
    marginTop: 11,
  },
  warningRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.dangerSurface,
    borderRadius: radius.md,
    padding: 11,
    marginTop: 9,
  },
  rowIcon: { marginTop: 1, marginRight: 8 },
  suggestionText: {
    flex: 1,
    fontFamily: fonts.sansSemiBold,
    fontSize: 12.5,
    lineHeight: 18,
    color: colors.inkSoft,
  },
  warningText: {
    flex: 1,
    fontFamily: fonts.sansSemiBold,
    fontSize: 12.5,
    lineHeight: 18,
    color: colors.inkSoft,
  },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 11 },
  tag: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceMuted,
    borderWidth: 1,
    borderColor: colors.line,
  },
  tagText: {
    fontFamily: fonts.sansBold,
    fontSize: 10.5,
    color: colors.sage,
  },
});
