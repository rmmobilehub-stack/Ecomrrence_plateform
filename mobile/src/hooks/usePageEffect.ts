import { useRefreshRevision } from '../components/PageRefresh';
import { useCallback, type DependencyList, type EffectCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';

// Refresh server data whenever a screen becomes visible, preserving form state.
export function usePageEffect(effect: EffectCallback, dependencies: DependencyList) {
  const revision = useRefreshRevision();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useFocusEffect(useCallback(effect, [...dependencies, revision]));
}
