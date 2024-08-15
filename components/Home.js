import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Home = () => {
  const [assignments, setAssignments] = useState([]);
  const [classesWithGrades, setClassesWithGrades] = useState([]);

  useEffect(() => {
    const loadAssignments = async () => {
      try {
        const storedAssignments = JSON.parse(await AsyncStorage.getItem('assignments')) || [];
        setAssignments(storedAssignments);
      } catch (error) {
        console.error('Failed to load assignments.', error);
      }
    };

    const loadClasses = async () => {
      const loadedClasses = await loadClassesWithGrades();
      setClassesWithGrades(loadedClasses);
    };

    loadAssignments();
    loadClasses();
  }, []);

  const loadClassesWithGrades = async () => {
    try {
      const classesString = await AsyncStorage.getItem('classes');
      const classes = classesString ? JSON.parse(classesString) : [];

      const classesWithGrades = [];
      for (const classInfo of classes) {
        const classDataString = await AsyncStorage.getItem(`classData_${classInfo.className}`);
        if (classDataString) {
          const classData = JSON.parse(classDataString);
          let finalGrade = 0;
          classData.categories.forEach(category => {
            const assignmentsInCategory = classData.assignments.filter(a => a.category === category.name);
            const averageGrade = assignmentsInCategory.reduce((acc, a) => acc + a.grade, 0) / assignmentsInCategory.length;
            finalGrade += (averageGrade * category.weight) / 100;
          });
          classesWithGrades.push({ ...classInfo, finalGrade: finalGrade.toFixed(2) });
        }
      }
      return classesWithGrades;
    } catch (error) {
      console.error('Failed to load classes or calculate grades.', error);
      return [];
    }
  };

  const getAssignmentsDueIn7Days = (assignments) => {
    const today = new Date();
    const nextWeek = new Date();
    nextWeek.setDate(today.getDate() + 7);

    return assignments.filter(assignment => {
      const dueDate = new Date(assignment.dueDate);
      return dueDate >= today && dueDate <= nextWeek;
    });
  };

  const assignmentsDueIn7Days = getAssignmentsDueIn7Days(assignments);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.pane}>
        <View style={styles.leftPane}>
          <Text style={styles.headerText}>7 Day Preview</Text>
          {assignmentsDueIn7Days.length === 0 ? (
            <Text style={styles.noAssignmentsText}>No assignments due within the next 7 days</Text>
          ) : (
            assignmentsDueIn7Days.map((assignment, index) => (
              <View key={index} style={styles.assignment}>
                <Text style={styles.assignmentText}>
                  {assignment.assignmentName} - {assignment.className} (Due: {assignment.dueDate})
                </Text>
              </View>
            ))
          )}
        </View>

        <View style={styles.rightPane}>
          <Text style={styles.headerText}>Current Classes and Grades</Text>
          {classesWithGrades.length === 0 ? (
            <Text style={styles.noAssignmentsText}>No classes available</Text>
          ) : (
            classesWithGrades.map((classInfo, index) => (
              <View key={index} style={styles.class}>
                <Text style={styles.classText}>
                  {classInfo.className}: {classInfo.finalGrade}%
                </Text>
              </View>
            ))
          )}
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    flexDirection: 'column',
    alignItems: 'center',
  },
  pane: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  leftPane: {
    width: '48%',
    marginRight: '2%',
  },
  rightPane: {
    width: '48%',
    marginLeft: '2%',
  },
  headerText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#ffffff',
    textAlign: 'center',
  },
  assignment: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  assignmentText: {
    fontSize: 18,
    color: 'black',
  },
  noAssignmentsText: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
    marginTop: 20,
  },
  class: {
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    alignItems: 'center'
  },
  classText: {
    fontSize: 18,
    color: 'white',
  },
});

export default Home;
