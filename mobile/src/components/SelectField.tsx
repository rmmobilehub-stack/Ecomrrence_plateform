import { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

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
  const selected = options.find(option => option.id === value);

  return (
    <View style={styles.wrap}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <Pressable style={styles.field} onPress={() => setOpen(true)}>
        <Text style={[styles.value, !selected && styles.placeholder]} numberOfLines={1}>
          {selected?.label || placeholder}
        </Text>
        <Text style={styles.chevron}>⌄</Text>
      </Pressable>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.backdrop} onPress={() => setOpen(false)}>
          <View style={styles.sheet}>
            <Text style={styles.sheetTitle}>{label || placeholder}</Text>
            <ScrollView style={styles.list}>
              {options.map(option => (
                <Pressable
                  key={option.id || 'all'}
                  disabled={option.disabled}
                  style={[
                    styles.row,
                    value === option.id && styles.rowOn,
                    option.disabled && styles.rowDisabled,
                  ]}
                  onPress={() => {
                    if (option.disabled) return;
                    onChange(option.id);
                    setOpen(false);
                  }}>
                  <Text style={[styles.rowText, value === option.id && styles.rowTextOn]}>{option.label}</Text>
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
  label: { color: '#A8C0DA', fontSize: 12, fontWeight: '800', letterSpacing: 0.3 },
  field: {
    minHeight: 50,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(126, 200, 255, 0.35)',
    backgroundColor: 'rgba(8, 28, 58, 0.72)',
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  value: { flex: 1, color: '#F4F8FF', fontSize: 15, fontWeight: '600' },
  placeholder: { color: '#7A93B0', fontWeight: '500' },
  chevron: { color: '#8EC8FF', fontSize: 18, fontWeight: '700' },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(2, 8, 20, 0.72)',
    justifyContent: 'flex-end',
  },
  sheet: {
    maxHeight: '70%',
    backgroundColor: '#0B1F3F',
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    paddingTop: 16,
    paddingBottom: 28,
    borderWidth: 1,
    borderColor: 'rgba(126, 200, 255, 0.28)',
  },
  sheetTitle: {
    color: '#F7FBFF',
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
  rowOn: { backgroundColor: 'rgba(47, 123, 255, 0.18)' },
  rowDisabled: { opacity: 0.4 },
  rowText: { color: '#C5D5EC', fontWeight: '600', fontSize: 15 },
  rowTextOn: { color: '#FFFFFF', fontWeight: '800' },
});
