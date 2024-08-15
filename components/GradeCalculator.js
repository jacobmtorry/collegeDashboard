import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Button, Modal, TextInput, TouchableOpacity, FlatList, Picker } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MaterialIcons } from '@expo/vector-icons';

const GradeCalculator = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [className, setClassName] = useState('');
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [assignmentModalVisible, setAssignmentModalVisible] = useState(false);
  const [assignmentName, setAssignmentName] = useState('');
  const [grade, setGrade] = useState('');
  const [category, setCategory] = useState('');
  const [categoryModalVisible, setCategoryModalVisible] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryWeight, setNewCategoryWeight] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [editAssignmentMode, setEditAssignmentMode] = useState(false);
  const [editCategoryMode, setEditCategoryMode] = useState(false);
  const [assignmentToEdit, setAssignmentToEdit] = useState(null);
  const [categoryToEdit, setCategoryToEdit] = useState(null);
  const [screen, setScreen] = useState('classList');
  const [calculatedGrades, setCalculatedGrades] = useState({});

  useEffect(() => {
    loadClasses();
  }, []);

  const saveClasses = async (updatedClasses) => {
    try {
      await AsyncStorage.setItem('classes', JSON.stringify(updatedClasses));
    } catch (e) {
      console.error('Failed to save classes.', e);
    }
  };

  const loadClasses = async () => {
    try {
      const classesString = await AsyncStorage.getItem('classes');
      if (classesString) {
        setClasses(JSON.parse(classesString));
      }
    } catch (e) {
      console.error('Failed to load classes.', e);
    }
  };

  const saveClassData = async (className, data) => {
    try {
      await AsyncStorage.setItem(`classData_${className}`, JSON.stringify(data));
    } catch (e) {
      console.error('Failed to save class data.', e);
    }
  };

  const loadClassData = async (className) => {
    try {
      const classDataString = await AsyncStorage.getItem(`classData_${className}`);
      if (classDataString) {
        const classData = JSON.parse(classDataString);
        setSelectedClass({ className, ...classData });
        calculateGrades(classData);
        return classData;
      } else {
        return {
          categories: [],
          assignments: [],
        };
      }
    } catch (e) {
      console.error('Failed to load class data.', e);
      return {
        categories: [],
        assignments: [],
      };
    }
  };

  const openModal = () => {
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setClassName('');
    setEditMode(false);
    setSelectedClass(null);
  };

  const handleAddClass = () => {
    if (className) {
      const newClasses = [...classes, { className }];
      setClasses(newClasses);
      saveClasses(newClasses);
      closeModal();
    }
  };

  const handleEditClass = () => {
    if (className && selectedClass) {
      const updatedClasses = classes.map((classInfo) => {
        if (classInfo.className === selectedClass.className) {
          return { ...classInfo, className };
        }
        return classInfo;
      });
      setClasses(updatedClasses);
      saveClasses(updatedClasses);

      // Update selectedClass with new className to reflect the changes in the assignment list
      setSelectedClass({ ...selectedClass, className });

      // Also update the stored data for the class if any
      const updatedClassData = { ...selectedClass, className };
      saveClassData(selectedClass.className, updatedClassData);

      closeModal();
    }
  };

  const handleDeleteClass = (classNameToDelete) => {
    const newClasses = classes.filter((classInfo) => classInfo.className !== classNameToDelete);
    setClasses(newClasses);
    saveClasses(newClasses);
    AsyncStorage.removeItem(`classData_${classNameToDelete}`);
  };

  const handleClassClick = async (classInfo) => {
    const classData = await loadClassData(classInfo.className);
    setSelectedClass({ ...classInfo, ...classData });
    calculateGrades(classData);
    setScreen('assignmentList');
  };

  const handleAddAssignment = () => {
    if (assignmentName && grade && category) {
      const newAssignments = [...selectedClass.assignments, { assignmentName, grade: parseFloat(grade), category }];
      const updatedClass = { ...selectedClass, assignments: newAssignments };
      setSelectedClass(updatedClass);
      saveClassData(selectedClass.className, updatedClass);
      setAssignmentName('');
      setGrade('');
      setCategory('');
      setAssignmentModalVisible(false);
      calculateGrades(updatedClass);
    }
  };

  const handleEditAssignment = () => {
    if (assignmentToEdit) {
      const updatedAssignments = selectedClass.assignments.map((assignment) => {
        if (assignment.assignmentName === assignmentToEdit.assignmentName) {
          return { assignmentName, grade: parseFloat(grade), category };
        }
        return assignment;
      });
      const updatedClass = { ...selectedClass, assignments: updatedAssignments };
      setSelectedClass(updatedClass);
      saveClassData(selectedClass.className, updatedClass);
      setAssignmentModalVisible(false);
      setEditAssignmentMode(false);
      setAssignmentToEdit(null);
      setAssignmentName('');
      setGrade('');
      setCategory('');
      calculateGrades(updatedClass);
    }
  };

  const handleDeleteAssignment = (assignmentToDelete) => {
    const updatedAssignments = selectedClass.assignments.filter((assignment) => assignment.assignmentName !== assignmentToDelete.assignmentName);
    const updatedClass = { ...selectedClass, assignments: updatedAssignments };
    setSelectedClass(updatedClass);
    saveClassData(selectedClass.className, updatedClass);
    calculateGrades(updatedClass);
  };

  const handleAddCategory = () => {
    if (newCategoryName && newCategoryWeight) {
      const updatedCategories = [...selectedClass.categories, { name: newCategoryName, weight: parseFloat(newCategoryWeight) }];
      const updatedClass = { ...selectedClass, categories: updatedCategories };
      setSelectedClass(updatedClass);
      saveClassData(selectedClass.className, updatedClass);
      setNewCategoryName('');
      setNewCategoryWeight('');
      setCategoryModalVisible(false);
      if (updatedCategories.length === 1) {
        setCategory(updatedCategories[0].name);
      }
      calculateGrades(updatedClass);
    }
  };

  const handleEditCategory = () => {
    if (categoryToEdit) {
      const updatedCategories = selectedClass.categories.map((cat) => {
        if (cat.name === categoryToEdit.name) {
          return { name: newCategoryName, weight: parseFloat(newCategoryWeight) };
        }
        return cat;
      });
      const updatedClass = { ...selectedClass, categories: updatedCategories };
      setSelectedClass(updatedClass);
      saveClassData(selectedClass.className, updatedClass);
      setEditCategoryMode(false);
      setCategoryToEdit(null);
      setCategoryModalVisible(false);
      calculateGrades(updatedClass);
    }
  };

  const handleDeleteCategory = (categoryToDelete) => {
    const updatedCategories = selectedClass.categories.filter((cat) => cat.name !== categoryToDelete.name);
    const updatedClass = { ...selectedClass, categories: updatedCategories };
    setSelectedClass(updatedClass);
    saveClassData(updatedClass.className, updatedClass);
    calculateGrades(updatedClass);
  };

  const handleBackToClassList = () => {
    setScreen('classList');
    setSelectedClass(null);
  };

  const openEditAssignmentModal = (assignment) => {
    setAssignmentToEdit(assignment);
    setAssignmentName(assignment.assignmentName);
    setGrade(assignment.grade.toString());
    setCategory(assignment.category);
    setEditAssignmentMode(true);
    setAssignmentModalVisible(true);
  };

  const openEditCategoryModal = (category) => {
    setCategoryToEdit(category);
    setNewCategoryName(category.name);
    setNewCategoryWeight(category.weight.toString());
    setEditCategoryMode(true);
    setCategoryModalVisible(true);
  };

  const calculateGrades = (currentClass) => {
    if (currentClass && currentClass.categories) {
      const grades = currentClass.categories.map((cat) => {
        const categoryAssignments = currentClass.assignments.filter((assignment) => assignment.category === cat.name);
        const totalGrades = categoryAssignments.reduce((total, assignment) => total + assignment.grade, 0);
        const averageGrade = categoryAssignments.length ? totalGrades / categoryAssignments.length : 0;
        return {
          category: cat.name,
          grade: (averageGrade * (cat.weight / 100)).toFixed(2),
        };
      });

      const finalGrade = grades.reduce((total, item) => total + parseFloat(item.grade), 0).toFixed(2);

      setCalculatedGrades({ grades, finalGrade });
    }
  };

  return (
    <View style={styles.container}>
      {screen === 'classList' ? (
        <>
          <Text style={styles.title}>Classes</Text>
          <FlatList
            data={classes}
            keyExtractor={(item) => item.className}
            renderItem={({ item }) => (
              <View style={styles.classContainer}>
                <TouchableOpacity style={styles.classButton} onPress={() => handleClassClick(item)}>
                  <Text style={styles.classButtonText}>{item.className}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.editButton} onPress={() => { setEditMode(true); setSelectedClass(item); setClassName(item.className); openModal(); }}>
                  <MaterialIcons name="edit" size={24} color="#CCB6F4" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.deleteButton} onPress={() => handleDeleteClass(item.className)}>
                  <MaterialIcons name="delete" size={24} color="#CCB6F4" />
                </TouchableOpacity>
              </View>
            )}
          />
          <TouchableOpacity style={styles.addClassButton} onPress={openModal}>
            <Text style={styles.addClassButtonText}>Add Class</Text>
          </TouchableOpacity>
        </>
      ) : (
        <View style={styles.contentContainer}>
          <View style={styles.leftPane}>
            <TouchableOpacity onPress={handleBackToClassList}>
              <Text style={styles.backButton}>&larr; Back to Classes</Text>
            </TouchableOpacity>
            <View style={styles.titleContainer}>
              <Text style={styles.title}>Assignments for {selectedClass.className}</Text>
              <TouchableOpacity style={styles.addButton} onPress={() => setAssignmentModalVisible(true)}>
                <Text style={styles.addButtonText}>+ Add</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              data={selectedClass.assignments}
              keyExtractor={(item, index) => index.toString()}
              renderItem={({ item }) => (
                <View style={styles.assignmentContainer}>
                  <View style={styles.assignmentTextContainer}>
                    <Text style={styles.assignmentText}>{item.assignmentName}: {item.grade}%</Text>
                    <Text style={styles.assignmentCategory}>{item.category}</Text>
                  </View>
                  <TouchableOpacity style={styles.editButton} onPress={() => openEditAssignmentModal(item)}>
                    <Text style={styles.editButtonText}>Edit</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.deleteButton} onPress={() => handleDeleteAssignment(item)}>
                    <Text style={styles.deleteButtonText}>Delete</Text>
                  </TouchableOpacity>
                </View>
              )}
            />
          </View>
          <View style={styles.rightPane}>
            <View style={styles.gradeCalculationContainer}>
              <View style={styles.titleContainer}>
                <Text style={styles.tableTitle}>Calculated Grades</Text>
                <TouchableOpacity style={styles.addButton} onPress={() => setCategoryModalVisible(true)}>
                  <Text style={styles.addButtonText}>Edit Table</Text>
                </TouchableOpacity>
              </View>
              {calculatedGrades.grades && (
                <View style={styles.gradeTableContainer}>
                  <View style={styles.gradeTable}>
                    {calculatedGrades.grades.map((grade, index) => (
                      <View style={styles.tableRow} key={index}>
                        <Text style={styles.tableCell}>{grade.category}:</Text>
                        <Text style={styles.gradeText}>{grade.grade}%</Text>
                      </View>
                    ))}
                    <View style={[styles.tableRow, styles.finalGradeRow]}>
                      <Text style={styles.tableCell}>Final Grade:</Text>
                      <Text style={styles.finalGradeText}>{calculatedGrades.finalGrade}%</Text>
                    </View>
                  </View>
                </View>
              )}
            </View>
          </View>
        </View>
      )}

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={closeModal}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalView}>
            <Text style={styles.modalTitle}>{editMode ? 'Edit Class' : 'Add Class'}</Text>
            <TextInput
              style={styles.input}
              placeholder="Class Name"
              placeholderTextColor="#aaa"
              value={className}
              onChangeText={setClassName}
            />
            <View style={styles.buttonContainer}>
              <TouchableOpacity style={styles.button} onPress={editMode ? handleEditClass : handleAddClass}>
                <Text style={styles.buttonText}>{editMode ? 'Save Changes' : 'Add'}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.button} onPress={closeModal}>
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        animationType="slide"
        transparent={true}
        visible={assignmentModalVisible}
        onRequestClose={() => setAssignmentModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalView}>
            <Text style={styles.modalTitle}>{editAssignmentMode ? 'Edit Assignment' : 'Add Assignment'}</Text>
            <TextInput
              style={styles.input}
              placeholder="Assignment Name"
              placeholderTextColor="#aaa"
              value={assignmentName}
              onChangeText={setAssignmentName}
            />
            <TextInput
              style={styles.input}
              placeholder="Grade"
              placeholderTextColor="#aaa"
              value={grade}
              onChangeText={setGrade}
              keyboardType="numeric"
            />
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={category}
                style={styles.picker}
                onValueChange={(itemValue) => setCategory(itemValue)}
              >
                <Picker.Item label="Choose weight category" value="" />
                {selectedClass?.categories?.map((cat, index) => (
                  <Picker.Item key={index} label={`${cat.name} (${cat.weight}%)`} value={cat.name} />
                ))}
              </Picker>
            </View>
            <View style={styles.buttonContainer}>
              <TouchableOpacity style={styles.button} onPress={editAssignmentMode ? handleEditAssignment : handleAddAssignment}>
                <Text style={styles.buttonText}>{editAssignmentMode ? 'Save Changes' : 'Add'}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.button} onPress={() => setAssignmentModalVisible(false)}>
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        animationType="slide"
        transparent={true}
        visible={categoryModalVisible}
        onRequestClose={() => setCategoryModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalView}>
            <Text style={styles.modalTitle}>{editCategoryMode ? 'Edit Category' : 'Add Category'}</Text>
            <TextInput
              style={styles.input}
              placeholder="Category Name"
              placeholderTextColor="#aaa"
              value={newCategoryName}
              onChangeText={setNewCategoryName}
            />
            <TextInput
              style={styles.input}
              placeholder="Category Weight (%)"
              placeholderTextColor="#aaa"
              value={newCategoryWeight}
              onChangeText={setNewCategoryWeight}
              keyboardType="numeric"
            />
            <View style={styles.buttonContainer}>
              <TouchableOpacity style={styles.button} onPress={editCategoryMode ? handleEditCategory : handleAddCategory}>
                <Text style={styles.buttonText}>{editCategoryMode ? 'Save Changes' : 'Add'}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.button} onPress={() => setCategoryModalVisible(false)}>
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
            </View>

            {/* List of categories for editing and deleting */}
            <Text style={styles.currentCategories}>Current Categories</Text>
            <FlatList
              data={selectedClass?.categories || []}
              keyExtractor={(item) => item.name}
              renderItem={({ item }) => (
                <View style={styles.categoryItemContainer}>
                  <View style={styles.categoryTextContainer}>
                    <Text style={styles.categoryText}>{item.name}: {item.weight}%</Text>
                  </View>
                  <TouchableOpacity style={styles.editButton} onPress={() => openEditCategoryModal(item)}>
                    <Text style={styles.editButtonText2}>Edit</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.deleteButton} onPress={() => handleDeleteCategory(item)}>
                    <Text style={styles.deleteButtonText2}>Delete</Text>
                  </TouchableOpacity>
                </View>
              )}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: 'black',
  },
  contentContainer: {
    flex: 1,
    flexDirection: 'row',
  },
  leftPane: {
    flex: 1,
    paddingRight: 10
  },
  rightPane: {
    flex: 1,
    paddingLeft: 10,
    justifyContent: 'space-between',
    paddingTop: 65
  },
  categoryContainer: {
    flex: 1,
    marginBottom: 20,
  },
  gradeCalculationContainer: {
    flex: 1,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  title: {
    fontSize: 24,
    color: 'white',
    marginBottom: 10
  },
  title2: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  classContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
  },
  classButton: {
    backgroundColor: 'white',
    padding: 10,
    borderRadius: 5,
    flex: 1,
  },
  classButtonText: {
    fontSize: 16,
    color: 'black',
    fontWeight: 'bold'
  },
  addButton: {
    backgroundColor: '#CCB6F4',   //light purple
    padding: 8,
    borderRadius: 5,
  },
  addButtonText: {
    color: '#4b0082',   //Dark purple
    fontSize: 16,
    fontWeight: 'bold',
  },
  editButton: {
    marginLeft: 5,
    padding: 5,
    borderRadius: 5,
  },
  editButtonText: {
    color: 'white',
  },
  editButtonText2: {
    color: 'black',
  },
  deleteButton: {
    marginLeft: 5,
    padding: 5,
    borderRadius: 5,
  },
  deleteButtonText: {
    color: 'white'
  },
  deleteButtonText2: {
    color: 'black'
  },
  addClassButton: {
    backgroundColor: '#CCB6F4',
    padding: 10,
    borderRadius: 10,
    justifyContent: 'center',
    borderBottomColor: '#4B0082',
    borderBottomWidth: 4
  },
  addClassButtonText:{
    color: '#4B0082',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center'
  },
  backButton: {
    fontSize: 16,
    color: '#CCB6F4',
    marginBottom: 40,
  },
  input: {
    width: '100%',
    height: 40,
    borderColor: '#555',
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 15,
    paddingLeft: 10,
    color: 'black',
  },
  pickerContainer: {
    width: '100%',
    borderColor: 'black',
    borderWidth: 0.25,
    borderRadius: 5,
    marginBottom: 15,
    overflow: 'hidden',
  },
  picker: {
    height: 40,
    color: 'black',
    backgroundColor: 'white',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  button: {
    backgroundColor: '#CCB6F4',
    borderRadius: 5,
    padding: 10,
    margin: 5,
    flex: 1,
    alignItems: 'center',
    borderBottomWidth: 3,
    borderBottomColor: "#4B0082"
  },
  buttonText: {
    color: '#4B0082',
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalView: {
    width: '80%',
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    marginBottom: 15,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: 'bold',
    color: 'black',
  },
  assignmentContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  assignmentTextContainer: {
    flex: 1, 
  },
  assignmentText: {
    fontSize: 16,
    color: 'white',
  },
  assignmentCategory: {
    fontSize: 14,
    color: '#aaa',
  },
  gradeTableContainer: {
    marginTop: 10,
  },
  tableTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 10,
  },
  gradeTable: {
    backgroundColor: 'white',
    borderRadius: 5,
    padding: 10,
  },
  gradeText: {
    color: 'black'
  },
  tableRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  tableCell: {
    fontSize: 16,
    color: 'black',
  },
  finalGradeRow: {
    borderTopWidth: 1,
    borderTopColor: 'black',
    paddingTop: 5,
    marginTop: 5,
  },
  finalGradeText: {
    fontSize: 18,
    color: 'black',
    fontWeight: 'bold',
  },
  categoryText: {
    color: 'black',
    marginRight: 40
  },
  currentCategories: {
    color: "black",
    marginTop: 15
  },
  categoryItemContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  categoryTextContainer: {
    flex: 1,
  }
});

export default GradeCalculator;
