import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Modal, TextInput, FlatList, StyleSheet, ImageBackground } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MaterialIcons } from '@expo/vector-icons';

const Landing = ({ onSelectSemester }) => {
  const [semesters, setSemesters] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [newSemesterName, setNewSemesterName] = useState('');
  const [editing, setEditing] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editSemesterId, setEditSemesterId] = useState(null);
  const [editSemesterName, setEditSemesterName] = useState('');

  useEffect(() => {
    loadSemesters();
  }, []);

  const loadSemesters = async () => {
    try {
      const jsonValue = await AsyncStorage.getItem('semesters');
      if (jsonValue != null) {
        setSemesters(JSON.parse(jsonValue));
      }
    } catch (e) {
      console.error('Failed to load semesters.', e);
    }
  };

  const saveSemesters = async (newSemesters) => {
    try {
      const jsonValue = JSON.stringify(newSemesters);
      await AsyncStorage.setItem('semesters', jsonValue);
      setSemesters(newSemesters);
    } catch (e) {
      console.error('Failed to save semesters.', e);
    }
  };

  const addSemester = () => {
    if (newSemesterName.trim().length > 0) {
      const newSemesters = [...semesters, { name: newSemesterName, id: Date.now().toString() }];
      setNewSemesterName('');
      setModalVisible(false);
      saveSemesters(newSemesters);
    }
  };

  const deleteSemester = (id) => {
    const newSemesters = semesters.filter(semester => semester.id !== id);
    saveSemesters(newSemesters);
  };

  const updateSemesterName = () => {
    const newSemesters = semesters.map(semester =>
      semester.id === editSemesterId ? { ...semester, name: editSemesterName } : semester
    );
    saveSemesters(newSemesters);
    setEditModalVisible(false);
    setEditSemesterId(null);
    setEditSemesterName('');
  };

  const renderSemesterItem = ({ item }) => (
    <View style={styles.semesterItemContainer}>
      <TouchableOpacity style={styles.semesterItem} onPress={() => onSelectSemester(item)}>
        <Text style={styles.semesterText}>{item.name}</Text>
      </TouchableOpacity>
      {editing && (
        <View style={styles.iconContainer}>
          <TouchableOpacity onPress={() => { setEditSemesterId(item.id); setEditSemesterName(item.name); setEditModalVisible(true); }}>
            <MaterialIcons name="edit" size={24} color="#CCB6F4" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => deleteSemester(item.id)}>
            <MaterialIcons name="delete" size={24} color="#CCB6F4" />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  return (
    <ImageBackground
      source={require('../assets/images/background.jpg')}
      style={styles.backgroundImage}
      imageStyle={{ resizeMode: 'cover' }}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.titleContainer}>
            <Text style={styles.title}>N e u r o</Text>
          </View>
          <View style={styles.semestersContainer}>
            <FlatList
              data={semesters}
              renderItem={renderSemesterItem}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
            />
          </View>
          {!editing && (
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => setModalVisible(true)}
            >
              <MaterialIcons name="add" size={30} color="#4b0082" />
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => setEditing(!editing)}
          >
            <MaterialIcons name={editing ? "close" : "edit"} size={30} color="#4b0082" />
          </TouchableOpacity>
          <Modal
            animationType="slide"
            transparent={true}
            visible={modalVisible}
            onRequestClose={() => setModalVisible(false)}
          >
            <View style={styles.modalContainer}>
              <View style={styles.modalContent}>
                <TextInput
                  placeholder="Enter semester name"
                  value={newSemesterName}
                  onChangeText={setNewSemesterName}
                  style={styles.input}
                />
                <TouchableOpacity
                  style={styles.modalButton}
                  onPress={addSemester}
                >
                  <Text style={styles.modalButtonText}>Create Semester</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.modalButton}
                  onPress={() => setModalVisible(false)}
                >
                  <Text style={styles.modalButtonText}>Close</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
          <Modal
            animationType="slide"
            transparent={true}
            visible={editModalVisible}
            onRequestClose={() => setEditModalVisible(false)}
          >
            <View style={styles.modalContainer}>
              <View style={styles.modalContent}>
                <TextInput
                  placeholder="Edit semester name"
                  value={editSemesterName}
                  onChangeText={setEditSemesterName}
                  style={styles.input}
                />
                <TouchableOpacity
                  style={styles.modalButton}
                  onPress={updateSemesterName}
                >
                  <Text style={styles.modalButtonText}>Save Changes</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.modalButton}
                  onPress={() => setEditModalVisible(false)}
                >
                  <Text style={styles.modalButtonText}>Close</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
        </View>
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)'
  },
  container: {
    flex: 1,
    paddingTop: 60,
    alignItems: 'center',
  },
  titleContainer: {
    marginBottom: 80,
  },
  title: {
    fontSize: 54,
    color: 'white',
    fontFamily: 'DuneRise'
  },
  semestersContainer: {
    flex: 1,
    width: '80%',
  },
  semesterItemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
    width: '60%'
  },
  semesterItem: {
    flex: 1,
    padding: 15,
    borderBottomWidth: 3,
    borderBottomColor: '#4b0082',
    backgroundColor: '#CCB6F4',
    borderRadius: 10,
    marginRight: 10
  },
  semesterText: {
    fontSize: 18,
    textAlign: 'center',
    color: '#4b0082',
    fontWeight: 'bold'
  },
  iconContainer: {
    flexDirection: 'row',
  },
  addButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: '#CCB6F4',
    padding: 10,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  editButton: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    backgroundColor: '#CCB6F4',
    padding: 10,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    width: 300,
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 10,
  },
  input: {
    height: 40,
    borderColor: '#ddd',
    borderWidth: 1,
    marginBottom: 10,
    paddingHorizontal: 10,
  },
  modalButton: {
    backgroundColor: '#CCB6F4',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginBottom: 10,
  },
  modalButtonText: {
    color: '#4b0082',
    fontSize: 16,
  },
});

export default Landing;
