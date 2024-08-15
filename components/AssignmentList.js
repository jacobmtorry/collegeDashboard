import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Alert, SectionList, Dimensions } from 'react-native';
import Assignment from './Assignment';
import AssignmentForm from './AssignmentForm';
import { Modal, Portal, Button, Provider as PaperProvider } from 'react-native-paper';
import * as Progress from 'react-native-progress';
import AsyncStorage from '@react-native-async-storage/async-storage';

const screenWidth = Dimensions.get('window').width;

const AssignmentList = ({ assignments, completedAssignments, onAddAssignment, onCompleteAssignment }) => {
  const [taskItems, setTaskItems] = useState(assignments);
  const [completedItems, setCompletedItems] = useState(completedAssignments);
  const [modalVisible, setModalVisible] = useState(false);
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [sortBy, setSortBy] = useState('className');
  const [editItem, setEditItem] = useState(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    loadSortMethod();
    updateProgress();
  }, []);

  useEffect(() => {
    updateProgress();
    saveAssignmentsToStorage();
  }, [taskItems, completedItems]);

  const saveAssignmentsToStorage = async () => {
    try {
      await AsyncStorage.setItem('assignments', JSON.stringify(taskItems));
      await AsyncStorage.setItem('completedAssignments', JSON.stringify(completedItems));
    } catch (error) {
      console.error('Failed to save assignments.', error);
    }
  };

  const handleAddAssignment = (newAssignments) => {
    let updatedItems = taskItems;
    newAssignments.forEach(assignment => {
      if (editItem !== null) {
        updatedItems[editItem] = assignment;
        setEditItem(null);
      } else {
        updatedItems = [...updatedItems, assignment];
      }
    });
    setTaskItems(updatedItems);
    onAddAssignment(updatedItems, completedItems);
    setModalVisible(false);
  };

  const toggleAssignment = (index, listType) => {
    if (listType === 'todo') {
      let itemsCopy = [...taskItems];
      let completedItem = itemsCopy.splice(index, 1)[0];
      setTaskItems(itemsCopy);
      setCompletedItems([...completedItems, completedItem]);
      onAddAssignment(itemsCopy, [...completedItems, completedItem]);
    } else if (listType === 'completed') {
      let itemsCopy = [...completedItems];
      let taskItem = itemsCopy.splice(index, 1)[0];
      setCompletedItems(itemsCopy);
      setTaskItems([...taskItems, taskItem]);
      onAddAssignment([...taskItems, taskItem], itemsCopy);
    }
    updateProgress();
  };

  const deleteAssignment = (index, listType) => {
    if (listType === 'todo') {
      let itemsCopy = [...taskItems];
      itemsCopy.splice(index, 1);
      setTaskItems(itemsCopy);
      onAddAssignment(itemsCopy, completedItems);
    } else if (listType === 'completed') {
      let itemsCopy = [...completedItems];
      itemsCopy.splice(index, 1);
      setCompletedItems(itemsCopy);
      onAddAssignment(taskItems, itemsCopy);
    }
    updateProgress();
  };

  const editAssignment = (index) => {
    setEditItem(index);
    setModalVisible(true);
  };

  const loadSortMethod = async () => {
    try {
      const sortMethod = await AsyncStorage.getItem('sortBy');
      if (sortMethod != null) {
        setSortBy(sortMethod);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to load sorting method.');
    }
  };

  const saveSortMethod = async (method) => {
    try {
      await AsyncStorage.setItem('sortBy', method);
      setSortBy(method);
      applySortMethod(method);
    } catch (error) {
      Alert.alert('Error', 'Failed to save sorting method.');
    }
  };

  const applySortMethod = (method) => {
    const sortedTasks = sortAssignments([...taskItems], method);
    const sortedCompletedTasks = sortAssignments([...completedItems], method);
    setTaskItems(sortedTasks);
    setCompletedItems(sortedCompletedTasks);
  };

  const sortAssignments = (items, method = sortBy) => {
    return items.sort((a, b) => {
      if (method === 'dueDate') {
        return new Date(a.dueDate) - new Date(b.dueDate);
      } else if (method === 'dueDateB') {
        return new Date(b.dueDate) - new Date(a.dueDate);
      } else if (method === 'classNameAtoZ') {
        return (a.className || '').localeCompare(b.className || '');
      } else if (method === 'classNameZtoA') {
        return (b.className || '').localeCompare(a.className || '');
      }
      return 0;
    });
  };

  const updateProgress = () => {
    const totalAssignments = taskItems.length + completedItems.length;
    const completedCount = completedItems.length;
    setProgress(totalAssignments === 0 ? 0 : completedCount / totalAssignments);
  };

  const renderAssignment = ({ item, index }) => (
    <Assignment
      key={index}
      text={`${item.assignmentName} - ${item.className} (Due: ${item.dueDate})`}
      color={item.color}
      onComplete={() => toggleAssignment(index, 'todo')}
      onDelete={() => deleteAssignment(index, 'todo')}
      onEdit={() => editAssignment(index)}
      completed={false}
    />
  );

  const renderCompletedAssignment = ({ item, index }) => (
    <Assignment
      key={index}
      text={`${item.assignmentName} - ${item.className} (Due: ${item.dueDate})`}
      color={item.color}
      onComplete={() => toggleAssignment(index, 'completed')}
      onDelete={() => deleteAssignment(index, 'completed')}
      onEdit={() => editAssignment(index)}
      completed={true}
    />
  );

  const sections = [
    {
      title: 'To-Do Assignments',
      data: taskItems,
      renderItem: renderAssignment
    },
    {
      title: 'Completed Assignments',
      data: completedItems,
      renderItem: renderCompletedAssignment
    }
  ];

  return (
    <PaperProvider>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.mainTitle}>Assignment Checklist</Text>
          <Button icon="filter" mode="contained" onPress={() => setFilterModalVisible(true)} style={styles.filterButton} buttonColor='#CCB6F4' labelStyle={styles.buttonText}>
            Filter
          </Button>
          <Button icon="plus" mode="contained" onPress={() => setModalVisible(true)} style={styles.addButton} buttonColor='#CCB6F4' labelStyle={styles.buttonText}>
            Add
          </Button>
        </View>
        <View style={styles.progressBarContainer}>
          <View style={styles.progressBar}>
            <Progress.Bar progress={progress} width={null} color="#ffffff" />
          </View>
          <Text style={styles.progressText}>{`${(progress * 100).toFixed(0)}%`}</Text>
        </View>
        {(taskItems.length === 0 && completedItems.length === 0) ? (
          <Text style={styles.noAssignmentsText}>No Assignments</Text>
        ) : (
          <SectionList
            sections={sections}
            keyExtractor={(item, index) => item + index}
            renderItem={({ section, item, index }) => section.renderItem({ item, index })}
            renderSectionHeader={({ section: { title } }) => (
              <Text style={styles.title}>{title}</Text>
            )}
          />
        )}
        <AssignmentForm
          visible={modalVisible}
          onClose={() => {
            setModalVisible(false);
            setEditItem(null);
          }}
          onAdd={handleAddAssignment}
          editItem={editItem !== null ? taskItems[editItem] : null}
        />
        <Portal>
          <Modal visible={filterModalVisible} onDismiss={() => setFilterModalVisible(false)} contentContainerStyle={styles.modalContainer}>
            <Text style={styles.modalTitle}>Sort Assignments By</Text>
            <Button onPress={() => { saveSortMethod('dueDate'); setFilterModalVisible(false); }} textColor='#4b0082'>Due Date (Closest to Furthest)</Button>
            <Button onPress={() => { saveSortMethod('dueDateB'); setFilterModalVisible(false); }} textColor='#4b0082'>Due Date (Furthest to Closest)</Button>
            <Button onPress={() => { saveSortMethod('classNameAtoZ'); setFilterModalVisible(false); }} textColor='#4b0082'>Class Name (A to Z)</Button>
            <Button onPress={() => { saveSortMethod('classNameZtoA'); setFilterModalVisible(false); }} textColor='#4b0082'>Class Name (Z to A)</Button>
            <Button onPress={() => setFilterModalVisible(false)} textColor='#4b0082' buttonColor='#CCB6F4'>Close</Button>
          </Modal>
        </Portal>
      </View>
    </PaperProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20
  },
  mainTitle: {
    fontSize: screenWidth > 400 ? 24 : 16,
    flex: 1,
    color: '#ffffff',
  },
  title: {
    color: '#ffffff',
    marginBottom: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  progressBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20
  },
  progressBar: {
    flex: 1,
    marginRight: 10,
  },
  progressText: {
    marginLeft: 10,
    fontSize: 16,
    marginRight: 10,
    color: 'white',
  },
  filterButton: {
    marginLeft: 10
  },
  addButton: {
    marginLeft: 10,
  },
  noAssignmentsText: {
    textAlign: 'center',
    color: '#888',
    marginTop: 10,
  },
  modalContainer: {
    backgroundColor: 'white',
    padding: 20,
    margin: 20,
    borderRadius: 10,
  },
  modalTitle: {
    fontSize: 18,
    marginBottom: 10,
  },
  buttonText: {
    color: '#4b0082'
  }
});

export default AssignmentList;
