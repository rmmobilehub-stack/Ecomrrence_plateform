import { forwardRef, type ComponentRef } from 'react';
import { Text as NativeText, TextInput as NativeTextInput, type TextProps, type TextInputProps } from 'react-native';

// Keep typography consistent regardless of the device's text-size preference.
export const Text = forwardRef<ComponentRef<typeof NativeText>, TextProps>((props, ref) =>
  <NativeText {...props} ref={ref} allowFontScaling={false} maxFontSizeMultiplier={1} />,
);
export const TextInput = forwardRef<ComponentRef<typeof NativeTextInput>, TextInputProps>((props, ref) =>
  <NativeTextInput {...props} ref={ref} allowFontScaling={false} maxFontSizeMultiplier={1} />,
);
