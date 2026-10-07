import { useMemo, useState } from 'react';
import { Linking, ScrollView, StyleSheet, Text } from 'react-native';
import { createLead } from '../api';
import { useStore } from '../context/StoreContext';
import { colors, space } from '../theme';
import { ErrorText, Field, Muted, PrimaryButton, ScreenWrap, Title } from '../ui';
import { isValidWhatsAppNumber, openWhatsApp } from '../whatsapp';

export function ContactScreen() {
  const { store, accent } = useStore();
  const [name, setName] = useState('');
  const [contact, setContact] = useState('');
  const [interest, setInterest] = useState('');
  const [error, setError] = useState('');
  const [done, setDone] = useState('');
  const [saving, setSaving] = useState(false);

  const socials = useMemo(
    () =>
      Object.entries(store?.socialLinks || {})
        .filter(([, href]) => Boolean(href))
        .map(([key, href]) => ({ key, href: String(href) })),
    [store],
  );

  const submit = async () => {
    setSaving(true);
    setError('');
    setDone('');
    try {
      await createLead({ name, contact, interest });
      setDone('Thanks — the store received your message.');
      setName('');
      setContact('');
      setInterest('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not send message');
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScreenWrap>
      <ScrollView contentContainerStyle={styles.pad}>
        <Title>Contact</Title>
        <Muted>Leave a message or open WhatsApp. Chatbot transcripts from the website are not mirrored here.</Muted>
        {isValidWhatsAppNumber(store?.whatsappNumber) && (
          <PrimaryButton
            label="WhatsApp the store"
            color={colors.whatsapp}
            onPress={() =>
              openWhatsApp(store?.whatsappNumber, `Hello ${store?.name || ''}, I have a question.`).catch(() => undefined)
            }
          />
        )}
        <Field label="Your name" value={name} onChangeText={setName} />
        <Field label="Phone or email" value={contact} onChangeText={setContact} />
        <Field label="What do you need?" value={interest} onChangeText={setInterest} multiline />
        <ErrorText>{error}</ErrorText>
        {!!done && <Text style={styles.ok}>{done}</Text>}
        <PrimaryButton label={saving ? 'Sending…' : 'Send message'} onPress={submit} disabled={saving} color={accent} />
        {socials.map(item => (
          <Text key={item.key} style={styles.social} onPress={() => Linking.openURL(item.href)}>
            {item.key}: {item.href}
          </Text>
        ))}
      </ScrollView>
    </ScreenWrap>
  );
}

const styles = StyleSheet.create({
  pad: { padding: space, gap: 10, paddingBottom: 40 },
  ok: { color: colors.success, fontWeight: '600' },
  social: { color: colors.ink, textDecorationLine: 'underline' },
});
