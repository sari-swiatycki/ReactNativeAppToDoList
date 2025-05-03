import React, { useState, useCallback } from 'react';
import {
  FlatList,
  View,
  Button,
  StyleSheet,
  ImageBackground,
  TouchableOpacity,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import TaskItem from '../components/TaskItem';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons'; // אייקונים

export default function HomeScreen({ navigation }) {
  const [tasks, setTasks] = useState([]);

  useFocusEffect(
    useCallback(() => {
      const loadTasks = async () => {
        const storedTasks = await AsyncStorage.getItem('tasks');
        if (storedTasks) {
          setTasks(JSON.parse(storedTasks));
        } else {
          setTasks([]);
        }
      };
      loadTasks();
    }, [])
  );

  const deleteTask = async (index) => {
    const updatedTasks = [...tasks];
    updatedTasks.splice(index, 1);
    setTasks(updatedTasks);
    await AsyncStorage.setItem('tasks', JSON.stringify(updatedTasks));
  };

  return (
    <ImageBackground
      source={require('../../assets/marissa-grootes-ck0i9Dnjtj0-unsplash.jpg')}
      style={styles.background}
    >
      <View style={styles.container}>
        <FlatList
          data={tasks}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item, index }) => (
            <View style={styles.taskContainer}>
              <TaskItem task={item} />
              <TouchableOpacity
                onPress={() => deleteTask(index)}
                style={styles.iconButton}
              >
                <Ionicons name="trash-outline" size={20} color="#ff4444" />
              </TouchableOpacity>
            </View>
          )}
        />
        <Button title="Add Task" onPress={() => navigation.navigate('AddTask')} />
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    resizeMode: 'cover',
  },
  container: {
    flex: 1,
    padding: 20,
  },
  taskContainer: {
    marginBottom: 10,
    backgroundColor: '#ffffffcc',
    padding: 10,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  iconButton: {
    padding: 4,
  },
});





// import React, { useState, useCallback } from 'react';
// import { FlatList, View, Button, StyleSheet, ImageBackground } from 'react-native';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import TaskItem from '../components/TaskItem';
// import { useFocusEffect } from '@react-navigation/native';

// export default function HomeScreen({ navigation }) {
//   const [tasks, setTasks] = useState([]);

//   useFocusEffect(
//     useCallback(() => {
//       const loadTasks = async () => {
//         const storedTasks = await AsyncStorage.getItem('tasks');
//         if (storedTasks) {
//           setTasks(JSON.parse(storedTasks));
//         } else {
//           setTasks([]);
//         }
//       };
//       loadTasks();
//     }, [])
//   );

//   return (
//     <ImageBackground
//       source={require('../../assets/marissa-grootes-ck0i9Dnjtj0-unsplash.jpg')} // ודא שהתמונה קיימת
//       style={styles.background}
//     >
//       <View style={styles.container}>
//         <FlatList
//           data={tasks}
//           keyExtractor={(item, index) => index.toString()}
//           renderItem={({ item }) => <TaskItem task={item} />}
//         />
//         <Button title="Add Task" onPress={() => navigation.navigate('AddTask')} />
//       </View>
//     </ImageBackground>
//   );
// }

// const styles = StyleSheet.create({
//   background: {
//     flex: 1,
//     resizeMode: 'cover',
//   },
//   container: {
//     flex: 1,
//     padding: 20,
//   },
// });
