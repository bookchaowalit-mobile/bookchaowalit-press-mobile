import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import {TextInput} from 'react-native';
import HomeScreen from '../src/screens/HomeScreen';
import ExploreScreen from '../src/screens/ExploreScreen';
import {ReleaseProvider} from '../src/state';

function textOf(tree: ReactTestRenderer.ReactTestRenderer): string {
  return JSON.stringify(tree.toJSON());
}

it('updates the checklist and preview as fields are typed', async () => {
  let tree!: ReactTestRenderer.ReactTestRenderer;
  await ReactTestRenderer.act(() => {
    tree = ReactTestRenderer.create(
      <ReleaseProvider>
        <HomeScreen />
        <ExploreScreen />
      </ReleaseProvider>,
    );
  });
  expect(textOf(tree)).toContain('"0","%"');

  const headline = tree.root
    .findAllByType(TextInput)
    .find(input => input.props.accessibilityLabel === 'Headline');
  await ReactTestRenderer.act(() => {
    headline!.props.onChangeText('Acme launches offline snippet manager');
  });

  // 2 of 7 checks now pass (length + case).
  expect(textOf(tree)).toContain('"29","%"');
  expect(textOf(tree)).toContain('Acme launches offline snippet manager');
});
