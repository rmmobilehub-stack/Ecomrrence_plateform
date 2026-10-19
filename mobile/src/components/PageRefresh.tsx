import { createContext, forwardRef, useContext, useRef, useState, type ComponentRef, type ReactNode } from 'react';
import { RefreshControl, ScrollView, type ScrollViewProps } from 'react-native';
import { useStore } from '../context/StoreContext';
import { useAppTheme } from '../context/ThemeContext';

const RefreshContext = createContext({ revision: 0, refreshing: false, refresh: () => {} });
export function PageRefresh({ children }: { children: ReactNode }) {
  const { reload } = useStore();
  const [revision, setRevision] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const pending = useRef(false);
  const refresh = () => {
    if (pending.current) return;
    pending.current = true;
    setRefreshing(true);
    setRevision(value => value + 1);
    void reload().finally(() => { pending.current = false; setRefreshing(false); });
  };
  return <RefreshContext.Provider value={{ revision, refreshing, refresh }}>{children}</RefreshContext.Provider>;
}
export function useRefreshRevision() { return useContext(RefreshContext).revision; }
export const RefreshScrollView = forwardRef<ComponentRef<typeof ScrollView>, ScrollViewProps>((props, ref) => {
  const { refreshing, refresh } = useContext(RefreshContext);
  const { colors } = useAppTheme();
  return <ScrollView {...props} ref={ref}
    contentContainerStyle={[!props.horizontal && { flexGrow: 1 }, props.contentContainerStyle]}
    alwaysBounceVertical={!props.horizontal}
    refreshControl={props.horizontal ? undefined : <RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={colors.accent} colors={[colors.accent]} />}
  />;
});
