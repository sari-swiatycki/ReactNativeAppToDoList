import React, { useState } from 'react';
import { View, TextInput, Button, StyleSheet, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';




export default function AddTaskScreen({ navigation }) {
  const [task, setTask] = useState('');
  const saveTask = async () => {
    if (!task.trim()) {
      Alert.alert('Please enter a task.');
      return;
    }
    const storedTasks = await AsyncStorage.getItem('tasks');
    const tasks = storedTasks ? JSON.parse(storedTasks) : [];
    tasks.push(task);
    await AsyncStorage.setItem('tasks', JSON.stringify(tasks));
    navigation.goBack();
  };
  return (
    <View style={styles.container}>
      <TextInput
        placeholder="Enter a new task"
        value={task}
        onChangeText={setTask}
        style={styles.input}
      />
      <Button title="Save Task" onPress={saveTask} />
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 12,
    marginBottom: 16,
  },
});