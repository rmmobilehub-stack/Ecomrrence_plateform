import { ScrollView, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useStore } from '../context/StoreContext';
import { space } from '../theme';
import { Card, Muted, PrimaryButton, ScreenWrap, Title } from '../ui';
import type { RootStackParamList } from '../navigation/types';

export function MoreScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { store, accent } = useStore();

  return (
    <ScreenWrap>
      <ScrollView contentContainerStyle={styles.pad}>
        <Title>Services</Title>
        <Muted>Doorstep iPhone repair, a free phone check, and store contact.</Muted>
        <Card>
          <PrimaryButton label="Book a repair" onPress={() => navigation.navigate('Repair')} color={accent} />
        </Card>
        <Card>
          <PrimaryButton label="Free phone check" onPress={() => navigation.navigate('PhoneCheck')} color={accent} />
        </Card>
        <Card>
          <PrimaryButton label="Contact store" onPress={() => navigation.navigate('Contact')} color={accent} />
        </Card>
        {!!store?.contactEmail && <Muted>Email {store.contactEmail}</Muted>}
      </ScrollView>
    </ScreenWrap>
  );
}

const styles = StyleSheet.create({
  pad: { padding: space, gap: 12 },
});
