import React from 'react';
import {
  KeyboardTypeOptions,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import {
  checkRelease,
  readinessScore,
  readingMinutes,
  wordCount,
  type Release,
} from '../lib/pressRelease';
import {useRelease} from '../state';

type FieldProps = {
  field: keyof Release;
  label: string;
  placeholder?: string;
  multiline?: boolean;
  keyboardType?: KeyboardTypeOptions;
};

function Field({field, label, placeholder, multiline, keyboardType}: FieldProps) {
  const {release, update} = useRelease();
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        accessibilityLabel={label}
        style={[styles.input, multiline && styles.multiline]}
        value={release[field]}
        onChangeText={text => update({[field]: text})}
        placeholder={placeholder}
        placeholderTextColor="#999"
        multiline={multiline}
        keyboardType={keyboardType}
        autoCapitalize={keyboardType === 'email-address' ? 'none' : 'sentences'}
        textAlignVertical={multiline ? 'top' : 'center'}
      />
    </View>
  );
}

export default function HomeScreen() {
  const {release} = useRelease();
  const checks = checkRelease(release);
  const score = readinessScore(checks);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled">
      <View
        style={styles.scoreCard}
        accessibilityRole="summary"
        accessibilityLabel={`Readiness ${score} percent`}>
        <Text style={styles.score}>{score}%</Text>
        <Text style={styles.scoreLabel}>ready to send</Text>
      </View>
      {checks.map(check => (
        <View key={check.id} style={styles.check}>
          <Text style={check.ok ? styles.ok : styles.todo}>
            {check.ok ? '✓' : '○'}
          </Text>
          <View style={styles.checkText}>
            <Text style={styles.checkLabel}>{check.label}</Text>
            {!check.ok && <Text style={styles.hint}>{check.hint}</Text>}
          </View>
        </View>
      ))}

      <Field field="headline" label="Headline" placeholder="What happened, in one line" />
      <Field field="subheadline" label="Subheadline (optional)" />
      <Field field="city" label="City" placeholder="Bangkok" />
      <Field field="date" label="Release date" placeholder="YYYY-MM-DD" keyboardType="numbers-and-punctuation" />
      <Field field="body" label="Body" multiline placeholder="Who, what, when, where, why" />
      <Text style={styles.meta}>
        {wordCount(release.body)} words · ~{readingMinutes(release.body)} min read
      </Text>
      <Field field="quote" label="Quote" multiline />
      <Field field="quoteBy" label="Quote attribution" placeholder="Name, Title at Company" />
      <Field field="boilerplate" label="About (boilerplate)" multiline />
      <Field field="contactName" label="Media contact name" />
      <Field field="contactEmail" label="Media contact email" keyboardType="email-address" />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#fafafa'},
  content: {padding: 16, paddingBottom: 48},
  scoreCard: {
    backgroundColor: '#1d3557',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  score: {color: '#fff', fontSize: 36, fontWeight: 'bold'},
  scoreLabel: {color: '#cdd9e5', fontSize: 14},
  check: {flexDirection: 'row', alignItems: 'flex-start', marginBottom: 6},
  ok: {color: '#2a9d8f', fontSize: 16, width: 22, fontWeight: 'bold'},
  todo: {color: '#e76f51', fontSize: 16, width: 22},
  checkText: {flex: 1},
  checkLabel: {fontSize: 14, color: '#222'},
  hint: {fontSize: 12, color: '#777'},
  field: {marginTop: 14},
  label: {fontSize: 13, color: '#555', marginBottom: 4, fontWeight: '600'},
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 10,
    fontSize: 15,
    color: '#111',
  },
  multiline: {minHeight: 110},
  meta: {fontSize: 12, color: '#777', marginTop: 4},
});
