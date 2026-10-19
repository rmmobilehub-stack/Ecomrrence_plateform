import { RefreshScrollView } from './PageRefresh';
import { useEffect, useRef, type ComponentRef } from 'react';
import { DeviceEventEmitter, Keyboard, Platform, ScrollView, TextInput, type ScrollViewProps } from 'react-native';

export function KeyboardScrollView(props: ScrollViewProps) {
  const scroll = useRef<ComponentRef<typeof ScrollView>>(null);
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    const reveal = () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        const input = TextInput.State.currentlyFocusedInput();
        if (input && Keyboard.isVisible()) {
          scroll.current?.scrollResponderScrollNativeHandleToKeyboard(input, 32, true);
        }
      }, 100);
    };
    const keyboard = Keyboard.addListener('keyboardDidShow', reveal);
    const focus = DeviceEventEmitter.addListener('formInputFocused', reveal);
    return () => { clearTimeout(timer); keyboard.remove(); focus.remove(); };
  }, []);
  return <RefreshScrollView
    ref={scroll}
    automaticallyAdjustKeyboardInsets={Platform.OS === 'ios'}
    keyboardShouldPersistTaps="handled"
    keyboardDismissMode="interactive"
    {...props}
    showsVerticalScrollIndicator
  />;
}
