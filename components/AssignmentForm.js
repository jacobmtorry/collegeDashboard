import React, { useEffect, useState } from "react";
import { View, Text, TextInput, StyleSheet, Modal, TouchableOpacity } from "react-native";

const AssignmentForm = ({ visible, onClose, onAdd, editItem }) => {
  const [assignmentName, setAssignmentName] = useState('');
  const [className, setClassName] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [color, setColor] = useState('#000000');
  const [colorPickerVisible, setColorPickerVisible] = useState(false);
  const [numberOfAssignments, setNumberOfAssignments] = useState('1');

  useEffect(() => {
    if (editItem) {
      setAssignmentName(editItem.assignmentName);
      setClassName(editItem.className);
      setDueDate(editItem.dueDate);
      setColor(editItem.color);
      setNumberOfAssignments('1'); // Set default value to 1 when editing
    } else {
      resetForm();
    }
  }, [editItem]);

  const resetForm = () => {
    setAssignmentName('');
    setClassName('');
    setDueDate('');
    setColor('#000000');
    setNumberOfAssignments('1'); // Set default value to 1
  };

  const handleAdd = () => {
    const assignments = [];
    const numberOfAssignmentsToCreate = editItem ? 1 : parseInt(numberOfAssignments);
    for (let i = 0; i < numberOfAssignmentsToCreate; i++) {
      assignments.push({ assignmentName, className, dueDate, color });
    }
    onAdd(assignments);
    resetForm();
    onClose();
  };

  const colors = [
    { label: 'Black', value: '#000000' },
    { label: 'Dark Brown', value: '#5c4033' },
    { label: 'Deep Pink', value: '#ff1493' },
    { label: 'Magenta', value: '#ff00ff' },
    { label: 'Indigo', value: '#4b0082' },
    { label: 'Navy', value: '#000080' },
    { label: 'Dark Green', value: '#2f4f2f' },
    { label: 'Gold', value: '#ffd700' },
    { label: 'Dark Orange', value: '#ff8c00' },
    { label: 'Dark Red', value: '#8b0000' },
    { label: 'Gray', value: '#808080' },
    { label: 'Brown', value: '#a52a2a' },
    { label: 'Hot Pink', value: '#ff69b4' },
    { label: 'Orchid', value: '#da70d6' },
    { label: 'Purple', value: '#800080' },
    { label: 'Blue', value: '#0000ff' },
    { label: 'Green', value: '#008000' },
    { label: 'Yellow', value: '#ffff00' },
    { label: 'Orange', value: '#ffa500' },
    { label: 'Red', value: '#ff0000' },
    { label: 'Silver', value: '#c0c0c0' },
    { label: 'Tan', value: '#d2b48c' },
    { label: 'Pink', value: '#ffc0cb' },
    { label: 'Violet', value: '#ee82ee' },
    { label: 'Lavender', value: '#cc99cc' },
    { label: 'Light Blue', value: '#add8e6' },
    { label: 'Light Green', value: '#90ee90' },
    { label: 'Light Yellow', value: '#ffffe0' },
    { label: 'Peach', value: '#ff9955' },
    { label: 'Bright Red', value: '#ff0033' },
  ];

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.title}>{editItem ? 'Edit Assignment' : 'Create Assignment'}</Text>
          <TextInput
            style={styles.input}
            placeholder="Assignment Name"
            value={assignmentName}
            onChangeText={setAssignmentName}
          />
          <TextInput
            style={styles.input}
            placeholder="Class Name"
            value={className}
            onChangeText={setClassName}
          />
          <TextInput
            style={styles.input}
            placeholder="Due Date"
            value={dueDate}
            onChangeText={setDueDate}
          />
          <View style={styles.colorPickerContainer}>
            <TouchableOpacity style={styles.colorButton} onPress={() => setColorPickerVisible(true)}>
              <Text style={styles.colorButtonText}>Choose Color</Text>
            </TouchableOpacity>
            <View style={[styles.selectedColor, { backgroundColor: color }]} />
          </View>
          <View style={styles.buttonContainer}>
            <TouchableOpacity onPress={handleAdd} style={styles.actionButton}>
              <Text style={styles.buttonText}>{editItem ? 'Save Changes' : 'Add Assignment'}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => { resetForm(); onClose(); }} style={styles.actionButton}>
              <Text style={styles.buttonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
      <Modal
        animationType="slide"
        transparent={true}
        visible={colorPickerVisible}
        onRequestClose={() => setColorPickerVisible(false)}
      >
        <View style={styles.colorModalContainer}>
          <View style={styles.colorModalContent}>
            <Text style={styles.colorModalTitle}>Choose A Color</Text>
            <View style={styles.colorOptions}>
              {colors.map((item, index) => (
                <View key={index} style={styles.colorOptionContainer}>
                  <TouchableOpacity style={[styles.colorOption, { backgroundColor: item.value }]} onPress={() => { setColor(item.value); setColorPickerVisible(false) }} />
                  <Text style={styles.colorLabel}>{item.label}</Text>
                </View>
              ))}
            </View>
            <TouchableOpacity onPress={() => setColorPickerVisible(false)} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '80%',
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 10,
  },
  title: {
    fontSize: 20,
    marginBottom: 20,
    textAlign: 'center',
    fontWeight: 'bold',
    color: '#000000'
  },
  input: {
    height: 40,
    borderColor: '#4b0082',
    borderWidth: 1,
    marginBottom: 10,
    paddingHorizontal: 10,
  },
  colorPickerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  colorButton: {
    padding: 10,
    backgroundColor: '#CCB6F4',
    borderRadius: 5,
    marginRight: 10,
  },
  colorButtonText: {
    color: '#4b0082',
    fontSize: 16,
    fontWeight: 'bold'
  },
  selectedColor: {
    width: 40,
    height: 40,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  colorPickerLabel: {
    marginBottom: 10,
    textAlign: 'center',
  },
  colorPicker: {
    height: 200,
    width: '100%',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  buttonSpacing: {
    width: 10,
  },
  actionButton: {
    padding: 10,
    backgroundColor: '#CCB6F4',
    borderRadius: 5,
    marginHorizontal: 10,
    marginLeft: 0
  },
  buttonText: {
    color: '#4b0082',
    fontSize: 16,
    fontWeight: 'bold'
  },
  colorModalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  colorModalContent: {
    width: '90%',
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 10,
    alignItems: 'center',
  },
  colorModalTitle: {
    fontSize: 20,
    marginBottom: 20,
    textDecorationColor: 'black',
  },
  colorOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  colorOptionContainer: {
    alignItems: 'center',
    margin: 10,
  },
  colorOption: {
    width: 40,
    height: 40,
    margin: 10,
    borderRadius: 20,
  },
  colorLabel: {
    marginTop: 0,
    textAlign: 'center',
    fontSize: 12,
  },
  closeButton: {
    marginTop: 20,
    padding: 10,
    backgroundColor: '#007bff',
    borderRadius: 5,
  },
  closeButtonText: {
    color: 'white',
    fontSize: 16,
  },
});

export default AssignmentForm;
