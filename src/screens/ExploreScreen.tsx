import React from 'react';
import {
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {checkRelease, formatRelease, readinessScore} from '../lib/pressRelease';
import {useRelease} from '../state';

/** Preview of the formatted release, with share and reset actions. */
export default function ExploreScreen() {
  const {release, reset} = useRelease();
  const text = formatRelease(release);
  const score = readinessScore(checkRelease(release));

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.note}>
        {score === 100
          ? 'All checks pass — ready to send.'
          : `${score}% ready. Finish the checklist on the Compose tab.`}
      </Text>
      <View style={styles.paper}>
        <Text selectable style={styles.body}>
          {text}
        </Text>
      </View>
      <View style={styles.actions}>
        <Pressable
          accessibilityRole="button"
          style={[styles.button, styles.primary]}
          onPress={() => Share.share({message: text, title: release.headline})}>
          <Text style={styles.primaryText}>Share release</Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          style={styles.button}
          onPress={reset}>
          <Text style={styles.buttonText}>Start over</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#fafafa'},
  content: {padding: 16, paddingBottom: 48},
  note: {fontSize: 14, color: '#555', marginBottom: 12},
  paper: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e5e5e5',
  },
  body: {fontSize: 15, lineHeight: 22, color: '#111'},
  actions: {flexDirection: 'row', gap: 12, marginTop: 16},
  button: {
    flex: 1,
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#1d3557',
  },
  primary: {backgroundColor: '#1d3557'},
  primaryText: {color: '#fff', fontWeight: '600'},
  buttonText: {color: '#1d3557', fontWeight: '600'},
});
