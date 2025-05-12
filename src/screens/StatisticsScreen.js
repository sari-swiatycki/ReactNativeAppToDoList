import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  Dimensions, 
  TouchableOpacity 
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { LineChart, PieChart, BarChart } from 'react-native-chart-kit';

export default function StatisticsScreen({ navigation }) {
  const [tasks, setTasks] = useState([]);
  const [completedCount, setCompletedCount] = useState(0);
  const [activeCount, setActiveCount] = useState(0);
  const [categoryData, setCategoryData] = useState([]);
  const [priorityData, setPriorityData] = useState([]);
  const [weeklyData, setWeeklyData] = useState({
    labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    datasets: [{ data: [0, 0, 0, 0, 0, 0, 0] }]
  });

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    try {
      const storedTasks = await AsyncStorage.getItem('tasks');
      if (storedTasks) {
        const parsedTasks = JSON.parse(storedTasks);
        setTasks(parsedTasks);
        analyzeData(parsedTasks);
      }
    } catch (error) {
      console.error('Failed to load tasks for statistics', error);
    }
  };

  const analyzeData = (taskList) => {
    // Count completed vs active tasks
    let completed = 0;
    let active = 0;
    
    taskList.forEach(task => {
      if (typeof task === 'string') {
        active++;
      } else if (task.completed) {
        completed++;
      } else {
        active++;
      }
    });
    
    setCompletedCount(completed);
    setActiveCount(active);
    
    // Analyze categories
    const categories = {};
    taskList.forEach(task => {
      if (typeof task !== 'string' && task.category) {
        categories[task.category] = (categories[task.category] || 0) + 1;
      }
    });
    
    const categoryChartData = Object.keys(categories).map((key, index) => {
      const colors = ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40'];
      return {
        name: key,
        count: categories[key],
        color: colors[index % colors.length],
        legendFontColor: '#7F7F7F',
        legendFontSize: 12
      };
    });
    
    setCategoryData(categoryChartData.length > 0 ? categoryChartData : [
      { name: 'No Categories', count: taskList.length, color: '#CCCCCC', legendFontColor: '#7F7F7F', legendFontSize: 12 }
    ]);
    
    // Analyze priorities
    const priorities = { high: 0, normal: 0, low: 0, none: 0 };
    taskList.forEach(task => {
      if (typeof task === 'string') {
        priorities.none++;
      } else if (task.priority) {
        priorities[task.priority]++;
      } else {
        priorities.none++;
      }
    });
    
    setPriorityData([
      { name: 'High', count: priorities.high, color: '#e74c3c' },
      { name: 'Normal', count: priorities.normal, color: '#f39c12' },
      { name: 'Low', count: priorities.low, color: '#2ecc71' },
      { name: 'None', count: priorities.none, color: '#bdc3c7' }
    ]);
    
    // Weekly data
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0 = Sunday, 1 = Monday, ...
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1)); // Start from Monday
    
    const weeklyTasksCount = [0, 0, 0, 0, 0, 0, 0]; // Mon to Sun
    
    taskList.forEach(task => {
      if (typeof task !== 'string' && task.createdAt) {
        const taskDate = new Date(task.createdAt);
        const diffDays = Math.floor((taskDate - weekStart) / (24 * 60 * 60 * 1000));
        
        if (diffDays >= 0 && diffDays < 7) {
          weeklyTasksCount[diffDays]++;
        }
      }
    });
    
    setWeeklyData({
      labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
      datasets: [{ data: weeklyTasksCount }]
    });
  };

  const chartConfig = {
    backgroundGradientFrom: '#fff',
    backgroundGradientTo: '#fff',
    color: (opacity = 1) => `rgba(52, 152, 219, ${opacity})`,
    strokeWidth: 2,
    barPercentage: 0.5,
    useShadowColorFromDataset: false
  };

  const screenWidth = Dimensions.get('window').width - 40;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Task Statistics</Text>
      </View>
      
      <View style={styles.summaryContainer}>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryValue}>{tasks.length}</Text>
          <Text style={styles.summaryLabel}>Total Tasks</Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryValue}>{completedCount}</Text>
          <Text style={styles.summaryLabel}>Completed</Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryValue}>{activeCount}</Text>
          <Text style={styles.summaryLabel}>Active</Text>
        </View>
      </View>
      
      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>Task Completion</Text>
        <PieChart
          data={[
            {
              name: 'Completed',
              count: completedCount,
              color: '#2ecc71',
              legendFontColor: '#7F7F7F',
              legendFontSize: 12
            },
            {
              name: 'Active',
              count: activeCount,
              color: '#3498db',
              legendFontColor: '#7F7F7F',
              legendFontSize: 12
            }
          ]}
          width={screenWidth}
          height={180}
          chartConfig={chartConfig}
          accessor="count"
          backgroundColor="transparent"
          paddingLeft="15"
          absolute
        />
      </View>
      
      {categoryData.length > 0 && (
        <View style={styles.chartContainer}>
          <Text style={styles.chartTitle}>Tasks by Category</Text>
          <PieChart
            data={categoryData}
            width={screenWidth}
            height={180}
            chartConfig={chartConfig}
            accessor="count"
            backgroundColor="transparent"
            paddingLeft="15"
            absolute
          />
        </View>
      )}
      
      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>Tasks by Priority</Text>
        <BarChart
          data={{
            labels: priorityData.map(item => item.name),
            datasets: [{
              data: priorityData.map(item => item.count)
            }]
          }}
          width={screenWidth}
          height={220}
          chartConfig={{
            ...chartConfig,
            barPercentage: 0.7,
            color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
          }}
          verticalLabelRotation={0}
          showValuesOnTopOfBars
          fromZero
        />
      </View>
      
      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>Tasks Created This Week</Text>
        <LineChart
          data={weeklyData}
          width={screenWidth}
          height={220}
          chartConfig={chartConfig}
          bezier
        />
      </View>
      
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          {tasks.length > 0 
            ? `You've completed ${completedCount} out of ${tasks.length} tasks (${Math.round((completedCount / tasks.length) * 100)}%)`
            : 'Add some tasks to see your statistics!'}
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  summaryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    backgroundColor: '#fff',
    marginVertical: 10,
    marginHorizontal: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#3498db',
  },
  summaryLabel: {
    fontSize: 14,
    color: '#7f8c8d',
    marginTop: 4,
  },
  chartContainer: {
    backgroundColor: '#fff',
    marginVertical: 10,
    marginHorizontal: 20,
    padding: 15,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
    color: '#333',
  },
  footer: {
    padding: 20,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 16,
    color: '#7f8c8d',
    textAlign: 'center',
  },
});