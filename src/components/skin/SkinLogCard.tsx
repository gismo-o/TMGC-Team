import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { ChevronRight, NotebookPen } from 'lucide-react-native';
import { SkinChangeLevel, SkinLogEntry } from '../../types';
import { colors, fonts, radius, shadows } from '../../theme';
import { changeLabels, levelColors, levelLabels } from './skinLabels';

const formatDate = (value: string | null) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', weekday: 'long' });
};

type Props = {
  log: SkinLogEntry;
  onPress?: () => void;
  onLongPress?: () => void;
};

export default function SkinLogCard({ log, onPress, onLongPress }: Props) {
  const levels: [string, SkinChangeLevel | null][] = [
    ['redness', log.rednessLevel],
    ['dryness', log.drynessLevel],
    ['oiliness', log.oilinessLevel],
    ['blemishAppearance', log.blemishLevel],
  ];
  const knownLevels = levels.filter(([, level]) => level && level !== 'unknown');

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} onLongPress={onLongPress} activeOpacity={0.78}>
      <View style={styles.header}>
        <View style={styles.iconWrap}>
          <NotebookPen size={16} color={colors.sage} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.date}>{formatDate(log.createdAt)}</Text>
          {log.skinFeeling ? <Text style={styles.feeling}>His: {log.skinFeeling}</Text> : null}
        </View>
        <ChevronRight size={17} color={colors.inkMuted} />
      </View>

      {knownLevels.length > 0 && (
        <View style={styles.levelRow}>
          {knownLevels.slice(0, 3).map(([key, level]) => (
            <View key={key} style={styles.levelPill}>
              <View style={[styles.levelDot, { backgroundColor: levelColors[level as SkinChangeLevel] }]} />
              <Text style={styles.levelText} numberOfLines={1}>
                {changeLabels[key]}: {levelLabels[level as SkinChangeLevel]}
              </Text>
            </View>
          ))}
        </View>
      )}

      {log.userNote ? (
        <Text style={styles.note} numberOfLines={2}>
          “{log.userNote}”
        </Text>
      ) : null}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: 15,
    borderWidth: 1,
    borderColor: colors.line,
    ...shadows.soft,
  },
  header: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  iconWrap: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.surfaceSage,
    justifyContent: 'center',
    alignItems: 'center',
  },
  date: {
    fontFamily: fonts.sansBold,
    fontSize: 13.5,
    color: colors.ink,
  },
  feeling: {
    fontFamily: fonts.sansSemiBold,
    fontSize: 11.5,
    color: colors.inkMuted,
    marginTop: 2,
  },
  levelRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 11,
  },
  levelPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: colors.surfaceMuted,
    borderRadius: radius.pill,
    paddingHorizontal: 9,
    paddingVertical: 5,
  },
  levelDot: { width: 6, height: 6, borderRadius: 3 },
  levelText: {
    fontFamily: fonts.sansSemiBold,
    fontSize: 10.5,
    color: colors.inkSoft,
  },
  note: {
    fontFamily: fonts.sans,
    fontSize: 12.5,
    lineHeight: 18,
    color: colors.inkMuted,
    marginTop: 10,
    fontStyle: 'italic',
  },
});
