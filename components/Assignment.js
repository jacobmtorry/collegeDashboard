import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

const Assignment = (props) => {
    const { color } = props

    return (
        <View style={styles.item}>
            <View style={styles.itemLeft}>
                <TouchableOpacity style={[styles.square, { borderColor: color, backgroundColor: props.completed ? color : '#ffffff' }]} onPress={props.onComplete} />
                <Text style={styles.itemText}>{props.text}</Text>   
            </View>
            <View style={styles.itemRight}>
                <TouchableOpacity style={styles.button} onPress={props.onEdit}>Edit</TouchableOpacity>
                <TouchableOpacity style={styles.button} onPress={props.onDelete}>Delete</TouchableOpacity>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    item: {
        backgroundColor: '#ffffff',
        padding: 15,
        borderRadius: 10,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 20,
        marginRight: 20
    },
    itemLeft: {
        flexDirection: "row",
        alignItems: 'center',
        flexWrap: 'wrap'
    },
    square: {
        width: 24,
        height: 24,
        backgroundColor: '#FFFFFF',
        borderWidth: 3,
        borderColor: '#55BCF6',
        borderRadius: 5,
        marginRight: 15
    },
    squareCompleted: {
        width: 24,
        height: 24,
        backgroundColor: '#55BCF6',
        borderWidth: 3,
        borderColor: '#55BCF6',
        borderRadius: 5,
        marginRight: 15
    },
    itemText: {
        maxWidth: '100%',
        color: 'black',
        fontSize: 16,
        fontWeight: '600'
    }, 
    itemRight: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    button: {
        padding: 5
    }
})

export default Assignment