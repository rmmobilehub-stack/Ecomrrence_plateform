import { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useAppTheme } from '../context/ThemeContext';

export type SelectOption = { id: string; label: string; disabled?: boolean };

export function SelectField({
  label,
  placeholder,
  value,
  options,
  onChange,
}: {
  label?: string;
  placeholder: string;
  value: string;
  options: SelectOption[];
  onChange: (id: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const { colors, isDark } = useAppTheme();
  const selected = options.find(option => option.id === value);

  return (
    <View style={styles.wrap}>
      {label ? <Text style={[styles.label, { color: colors.muted }]}>{label}</Text> : null}
      <Pressable
        style={[
          styles.field,
          {
            borderColor: colors.cardBorder,
            backgroundColor: isDark ? 'rgba(8, 28, 58, 0.72)' : colors.card,
          },
        ]}
        onPress={() => setOpen(true)}>
        <Text
          style={[styles.value, { color: selected ? colors.ink : colors.muted }, !selected && styles.placeholder]}
          numberOfLines={1}>
          {selected?.label || placeholder}
        </Text>
        <Text style={[styles.chevron, { color: colors.accentSoft }]}>⌄</Text>
      </Pressable>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.backdrop} onPress={() => setOpen(false)}>
          <View style={[styles.sheet, { backgroundColor: colors.sheetBg, borderColor: colors.cardBorder }]}>
            <Text style={[styles.sheetTitle, { color: colors.ink }]}>{label || placeholder}</Text>
            <ScrollView style={styles.list}>
              {options.map(option => (
                <Pressable
                  key={option.id || 'all'}
                  disabled={option.disabled}
                  style={[
                    styles.row,
                    value === option.id && {
                      backgroundColor: isDark ? 'rgba(47, 123, 255, 0.18)' : '#E6F6FF',
                    },
                    option.disabled && styles.rowDisabled,
                  ]}
                  onPress={() => {
                    if (option.disabled) return;
                    onChange(option.id);
                    setOpen(false);
                  }}>
                  <Text
                    style={[
                      styles.rowText,
                      { color: value === option.id ? colors.ink : colors.muted },
                      value === option.id && styles.rowTextOn,
                    ]}>
                    {option.label}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 6 },
  label: { fontSize: 12, fontWeight: '800', letterSpacing: 0.3 },
  field: {
    minHeight: 50,
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  value: { flex: 1, fontSize: 15, fontWeight: '600' },
  placeholder: { fontWeight: '500' },
  chevron: { fontSize: 18, fontWeight: '700' },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(2, 8, 20, 0.55)',
    justifyContent: 'flex-end',
  },
  sheet: {
    maxHeight: '70%',
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    paddingTop: 16,
    paddingBottom: 28,
    borderWidth: 1,
  },
  sheetTitle: {
    fontWeight: '800',
    fontSize: 16,
    paddingHorizontal: 18,
    marginBottom: 8,
  },
  list: { paddingHorizontal: 10 },
  row: {
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginBottom: 4,
  },
  rowDisabled: { opacity: 0.4 },
  rowText: { fontWeight: '600', fontSize: 15 },
  rowTextOn: { fontWeight: '800' },
});
