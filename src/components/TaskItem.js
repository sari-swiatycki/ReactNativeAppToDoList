import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function TaskItem({ task }) {
  return (
    <View style={styles.item}>
      <Text>{task}</Text>
    </View>
  );
}


const styles = StyleSheet.create({
  item: {
    padding: 16,
    backgroundColor: '#f2f2f2',
    borderRadius: 8,
    marginBottom: 10,
  },
});