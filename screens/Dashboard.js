import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MaterialIcons } from '@expo/vector-icons';
import AssignmentList from '../components/AssignmentList';
import GradeCalculator from '../components/GradeCalculator';
import Home from '../components/Home';

const Dashboard = ({ semesterId, semesterName, onBack }) => {
  const [activeTab, setActiveTab] = useState('Home');
  const [assignments, setAssignments] = useState([]);
  const [completedAssignments, setCompletedAssignments] = useState([]);
  const [sidebarVisible, setSidebarVisible] = useState(true);

  useEffect(() => {
    loadAssignments();
  }, [semesterId]);

  useEffect(() => {
    saveAssignments();
  }, [assignments, completedAssignments]);

  const loadAssignments = async () => {
    try {
      const taskItems = await AsyncStorage.getItem(`assignments_${semesterId}`);
      const completedItems = await AsyncStorage.getItem(`completedAssignments_${semesterId}`);
      if (taskItems != null) {
        setAssignments(JSON.parse(taskItems));
      } else {
        setAssignments([]);
      }
      if (completedItems != null) {
        setCompletedAssignments(JSON.parse(completedItems));
      } else {
        setCompletedAssignments([]);
      }
    } catch (e) {
      console.error('Failed to load assignments.', e);
    }
  };

  const saveAssignments = async () => {
    try {
      const taskItems = JSON.stringify(assignments);
      const completedItems = JSON.stringify(completedAssignments);
      await AsyncStorage.setItem(`assignments_${semesterId}`, taskItems);
      await AsyncStorage.setItem(`completedAssignments_${semesterId}`, completedItems);
    } catch (e) {
      console.error('Failed to save assignments.', e);
    }
  };

  const handleAddAssignment = (newAssignments, newCompletedAssignments) => {
    setAssignments(newAssignments);
    setCompletedAssignments(newCompletedAssignments);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'Assignments':
        return (
          <AssignmentList
            assignments={assignments}
            completedAssignments={completedAssignments}
            onAddAssignment={handleAddAssignment}
            semesterName={semesterName}
            onBack={onBack}
          />
        );
      case 'GradeCalculator':
        return <GradeCalculator />;
      case 'Timer':
        return <StudyTimer />;
      case 'Home':
      default:
        return <Home />;
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.topBar}>
          <View style={styles.semesterNameContainer}>
            <Text style={styles.semesterName}>{semesterName}</Text>
          </View>
        </View>
        <View style={styles.mainContent}>
          {sidebarVisible ? (
            <View style={styles.sidebar}>
              <View style={styles.sidebarContent}>
                <TouchableOpacity style={styles.tab} onPress={() => setActiveTab('Home')}>
                  <Text style={[styles.tabText, activeTab === 'Home' && styles.activeTabText]}>Home</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.tab} onPress={() => setActiveTab('Assignments')}>
                  <Text style={[styles.tabText, activeTab === 'Assignments' && styles.activeTabText]}>Assignments</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.tab} onPress={() => setActiveTab('GradeCalculator')}>
                  <Text style={[styles.tabText, activeTab === 'GradeCalculator' && styles.activeTabText]}>Grade Calculator</Text>
                </TouchableOpacity>
                <View style={styles.backButtonContainer}>
                  <TouchableOpacity onPress={onBack}>
                    <Text style={styles.backButton}>&larr; Back</Text> 
                  </TouchableOpacity>
                </View>
              </View>
              <TouchableOpacity style={styles.collapseButton} onPress={() => setSidebarVisible(false)}>
                <MaterialIcons name="chevron-left" size={30} color="#CCB6F4" />
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity style={styles.expandButton} onPress={() => setSidebarVisible(true)}>
              <MaterialIcons name="chevron-right" size={30} color="#CCB6F4" />
            </TouchableOpacity>
          )}
          <View style={[styles.content, !sidebarVisible && styles.contentExpanded]}>
            {renderContent()}
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#000000',
  },
  container: {
    flex: 1,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#000000',
    borderBottomColor: '#CCB6F4',
    borderBottomWidth: 1,
    padding: 10,
    justifyContent: 'space-between',
  },
  backButtonContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingBottom: 20
  },
  backButton: {
    fontSize: 16,
    color: '#CCB6F4',
    paddingLeft: 15,
    paddingTop: 15,
  },
  semesterNameContainer: {
    flex: 2,
    alignItems: 'center',
  },
  semesterName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    fontFamily: 'DuneRise',
    marginTop: 15,
    marginBottom: 15
  },
  mainContent: {
    flex: 1,
    flexDirection: 'row',
  },
  sidebar: {
    width: 175,
    backgroundColor: '#000000',
    borderRightWidth: 1,
    borderRightColor: '#CCB6F4',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  sidebarContent: {
    flex: 1,
    justifyContent: 'space-between',
  },
  collapseButton: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 5,
  },
  expandButton: {
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
  },
  tab: {
    padding: 15,
  },
  tabText: {
    fontSize: 16,
    color: '#ffffff',
  },
  activeTabText: {
    fontWeight: 'bold',
    color: '#CCB6F4',
  },
  content: {
    flex: 1,
  },
  contentExpanded: {
    flex: 1,
  },
});

export default Dashboard;
