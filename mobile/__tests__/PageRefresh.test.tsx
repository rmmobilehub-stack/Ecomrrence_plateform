import React from 'react';
import { act, create, type ReactTestRenderer } from 'react-test-renderer';
import { RefreshControl } from 'react-native';
import { PageRefresh, RefreshScrollView, useRefreshRevision } from '../src/components/PageRefresh';
import { Text, TextInput } from '../src/components/AppText';

const mockReload = jest.fn();
jest.mock('../src/context/StoreContext', () => ({ useStore: () => ({ reload: mockReload }) }));
jest.mock('../src/context/ThemeContext', () => ({ useAppTheme: () => ({ colors: { accent: '#0088ff' } }) }));

function Revision() { return <Text testID="revision">{useRefreshRevision()}</Text>; }

test('refresh reloads data once, signals screen effects, and stops after completion', async () => {
  let finish!: () => void;
  mockReload.mockReturnValue(new Promise<void>(resolve => { finish = resolve; }));
  let tree!: ReactTestRenderer;
  await act(async () => { tree = create(<PageRefresh><RefreshScrollView><Revision /></RefreshScrollView></PageRefresh>); });
  await act(async () => {
    tree.root.findByType(RefreshControl).props.onRefresh();
    tree.root.findByType(RefreshControl).props.onRefresh();
  });
  expect(mockReload).toHaveBeenCalledTimes(1);
  expect(tree.root.findByType(RefreshControl).props.refreshing).toBe(true);
  expect(tree.root.findByProps({ testID: 'revision' }).props.children).toBe(1);
  await act(async () => { finish(); });
  expect(tree.root.findByType(RefreshControl).props.refreshing).toBe(false);
  await act(async () => { tree.unmount(); });
});

test('text and inputs keep font scaling disabled', async () => {
  let tree!: ReactTestRenderer;
  await act(async () => { tree = create(<><Text allowFontScaling>Label</Text><TextInput allowFontScaling /></>); });
  const hosts = tree.root.findAll(node => typeof node.type === 'string' && node.props.allowFontScaling !== undefined);
  expect(hosts.length).toBeGreaterThan(0);
  for (const host of hosts) {
    expect(host.props.allowFontScaling).toBe(false);
    expect(host.props.maxFontSizeMultiplier).toBe(1);
  }
  await act(async () => { tree.unmount(); });
});
