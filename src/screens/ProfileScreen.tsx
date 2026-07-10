import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function ProfileScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.name}>Chaowalit Greepoke</Text>
      <Text style={styles.link}>bookchaowalit.com</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  name: { fontSize: 20, fontWeight: 'bold', marginBottom: 8 },
  link: { fontSize: 16, color: '#6200ee' },
});
