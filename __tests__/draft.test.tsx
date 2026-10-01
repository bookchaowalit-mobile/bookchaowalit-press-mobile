import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import {TextInput} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import HomeScreen from '../src/screens/HomeScreen';
import {ReleaseProvider} from '../src/state';
import {
  DRAFT_STORAGE_KEY,
  EMPTY_RELEASE,
  parseDraft,
  serializeDraft,
} from '../src/lib/pressRelease';

const flush = () => new Promise(resolve => setTimeout(resolve, 0));

function headlineInput(tree: ReactTestRenderer.ReactTestRenderer) {
  return tree.root
    .findAllByType(TextInput)
    .find(input => input.props.accessibilityLabel === 'Headline')!;
}

describe('parseDraft', () => {
  it('round-trips a release', () => {
    const r = {...EMPTY_RELEASE, headline: 'Hi', city: 'Bangkok'};
    expect(parseDraft(serializeDraft(r))).toEqual(r);
  });

  it('returns null for missing, corrupt or foreign data', () => {
    expect(parseDraft(null)).toBeNull();
    expect(parseDraft('{oops')).toBeNull();
    expect(parseDraft(JSON.stringify({v: 2, release: {}}))).toBeNull();
    expect(
      parseDraft(JSON.stringify({v: 1, release: {headline: 42}})),
    ).toBeNull();
  });

  it('fills missing fields and drops unknown ones', () => {
    const parsed = parseDraft(
      JSON.stringify({v: 1, release: {headline: 'X', extra: 'y'}}),
    );
    expect(parsed).toEqual({...EMPTY_RELEASE, headline: 'X'});
  });
});

describe('draft persistence', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
  });

  it('saves edits and restores them in a new session', async () => {
    let tree!: ReactTestRenderer.ReactTestRenderer;
    await ReactTestRenderer.act(async () => {
      tree = ReactTestRenderer.create(
        <ReleaseProvider>
          <HomeScreen />
        </ReleaseProvider>,
      );
      await flush();
    });
    await ReactTestRenderer.act(async () => {
      headlineInput(tree).props.onChangeText('Saved headline');
      await flush();
    });
    expect(
      parseDraft(await AsyncStorage.getItem(DRAFT_STORAGE_KEY))?.headline,
    ).toBe('Saved headline');
    await ReactTestRenderer.act(async () => tree.unmount());

    let next!: ReactTestRenderer.ReactTestRenderer;
    await ReactTestRenderer.act(async () => {
      next = ReactTestRenderer.create(
        <ReleaseProvider>
          <HomeScreen />
        </ReleaseProvider>,
      );
      await flush();
    });
    expect(headlineInput(next).props.value).toBe('Saved headline');
  });

  it('never overwrites the stored draft after a failed read', async () => {
    await AsyncStorage.setItem(
      DRAFT_STORAGE_KEY,
      serializeDraft({...EMPTY_RELEASE, headline: 'Keep me'}),
    );
    // The storage mock's getItem is already a jest.fn; fail only the next read.
    (AsyncStorage.getItem as jest.Mock).mockRejectedValueOnce(
      new Error('disk busy'),
    );
    let tree!: ReactTestRenderer.ReactTestRenderer;
    await ReactTestRenderer.act(async () => {
      tree = ReactTestRenderer.create(
        <ReleaseProvider>
          <HomeScreen />
        </ReleaseProvider>,
      );
      await flush();
    });
    await ReactTestRenderer.act(async () => {
      headlineInput(tree).props.onChangeText('Session only');
      await flush();
    });
    expect(
      parseDraft(await AsyncStorage.getItem(DRAFT_STORAGE_KEY))?.headline,
    ).toBe('Keep me');
  });
});
