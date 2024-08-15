import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Switch, TextInput, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const StudyTimer = () => {
  // Stopwatch states
  const [stopwatchTime, setStopwatchTime] = useState(0);
  const [isStopwatchRunning, setIsStopwatchRunning] = useState(false);

  // Timer states
  const [timerTime, setTimerTime] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [selectedHours, setSelectedHours] = useState('0');
  const [selectedMinutes, setSelectedMinutes] = useState('0');
  const [selectedSeconds, setSelectedSeconds] = useState('0');

  const [isStopwatch, setIsStopwatch] = useState(true);
  const stopwatchIntervalRef = useRef(null);
  const timerIntervalRef = useRef(null);

  useEffect(() => {
    const loadStopwatchData = async () => {
      try {
        const storedStopwatchTime = await AsyncStorage.getItem('stopwatchTime');
        if (storedStopwatchTime !== null) {
          setStopwatchTime(Number(storedStopwatchTime));
        }
      } catch (error) {
        console.error('Failed to load stopwatch data', error);
      }
    };

    const loadTimerData = async () => {
      try {
        const storedTimerTime = await AsyncStorage.getItem('timerTime');
        if (storedTimerTime !== null) {
          setTimerTime(Number(storedTimerTime));
        }
      } catch (error) {
        console.error('Failed to load timer data', error);
      }
    };

    loadStopwatchData();
    loadTimerData();

    return () => {
      clearInterval(stopwatchIntervalRef.current);
      clearInterval(timerIntervalRef.current);
    };
  }, []);

  useEffect(() => {
    const saveStopwatchTime = async () => {
      try {
        await AsyncStorage.setItem('stopwatchTime', stopwatchTime.toString());
      } catch (error) {
        console.error('Failed to save stopwatch time', error);
      }
    };

    const saveTimerTime = async () => {
      try {
        await AsyncStorage.setItem('timerTime', timerTime.toString());
      } catch (error) {
        console.error('Failed to save timer time', error);
      }
    };

    saveStopwatchTime();
    saveTimerTime();
  }, [stopwatchTime, timerTime]);

  const startStopStopwatch = () => {
    if (isStopwatchRunning) {
      clearInterval(stopwatchIntervalRef.current);
    } else {
      const startTime = Date.now() - stopwatchTime;
      stopwatchIntervalRef.current = setInterval(() => {
        setStopwatchTime(Date.now() - startTime);
      }, 1);
    }
    setIsStopwatchRunning(!isStopwatchRunning);
  };

  const resetStopwatch = () => {
    clearInterval(stopwatchIntervalRef.current);
    setStopwatchTime(0);
    setIsStopwatchRunning(false);
  };

  const startStopTimer = () => {
    if (isTimerRunning) {
      clearInterval(timerIntervalRef.current);
    } else {
      const totalMilliseconds = (parseInt(selectedHours) * 3600 + parseInt(selectedMinutes) * 60 + parseInt(selectedSeconds)) * 1000;
      setTimerTime(totalMilliseconds);
      const startTime = Date.now();
      timerIntervalRef.current = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const remainingTime = totalMilliseconds - elapsed;
        if (remainingTime <= 0) {
          clearInterval(timerIntervalRef.current);
          setTimerTime(0);
          setIsTimerRunning(false);
          alert("Time's up!");
        } else {
          setTimerTime(remainingTime);
        }
      }, 100);
    }
    setIsTimerRunning(!isTimerRunning);
  };

  const resetTimer = () => {
    clearInterval(timerIntervalRef.current);
    setTimerTime(0);
    setIsTimerRunning(false);
  };

  const formatTime = (milliseconds) => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const getHours = `0${Math.floor(totalSeconds / 3600)}`.slice(-2);
    const getMinutes = `0${Math.floor((totalSeconds % 3600) / 60)}`.slice(-2);
    const getSeconds = `0${totalSeconds % 60}`.slice(-2);
    return `${getHours}:${getMinutes}:${getSeconds}`;
  };

  const handleToggleSwitch = () => {
    setIsStopwatch(!isStopwatch);
    resetStopwatch();
    resetTimer();
  };

  return (
    <View style={styles.container}>
      <View style={styles.switchContainer}>
        <Text style={styles.switchLabel}>{isStopwatch ? "Stopwatch" : "Timer"}</Text>
        <Switch
          value={isStopwatch}
          onValueChange={handleToggleSwitch}
        />
      </View>
      {isStopwatch ? (
        <Text style={styles.timerText}>{formatTime(stopwatchTime)}</Text>
      ) : (
        isTimerRunning ? (
          <Text style={styles.timerText}>{formatTime(timerTime)}</Text>
        ) : (
          <View style={styles.pickerContainer}>
            <View style={styles.pickerItem}>
              <TextInput
                style={styles.input}
                keyboardType='numeric'
                value={selectedHours}
                onChangeText={setSelectedHours}
              />
              <Text style={styles.pickerLabel}>Hours</Text>
            </View>
            <View style={styles.pickerItem}>
              <TextInput
                style={styles.input}
                keyboardType='numeric'
                value={selectedMinutes}
                onChangeText={setSelectedMinutes}
              />
              <Text style={styles.pickerLabel}>Minutes</Text>
            </View>
            <View style={styles.pickerItem}>
              <TextInput
                style={styles.input}
                keyboardType='numeric'
                value={selectedSeconds}
                onChangeText={setSelectedSeconds}
              />
              <Text style={styles.pickerLabel}>Seconds</Text>
            </View>
          </View>
        )
      )}
      <View style={styles.buttonContainer}>
        {isStopwatch ? (
          <>
            <TouchableOpacity style={[styles.button, styles.startStopButton]} onPress={startStopStopwatch}>
              <Text style={styles.buttonText}>{isStopwatchRunning ? "Stop" : "Start"}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.button, styles.resetButton]} onPress={resetStopwatch}>
              <Text style={styles.buttonText}>Reset</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <TouchableOpacity style={[styles.button, styles.startStopButton]} onPress={startStopTimer}>
              <Text style={styles.buttonText}>{isTimerRunning ? "Stop" : "Start"}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.button, styles.resetButton]} onPress={resetTimer}>
              <Text style={styles.buttonText}>Reset</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  switchContainer: {
    position: 'absolute',
    top: 50,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  switchLabel: {
    marginRight: 10,
    fontSize: 24,
    color: '#fff',
  },
  timerText: {
    fontSize: 200,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#fff',
  },
  pickerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    width: '100%',
    paddingHorizontal: 20,
  },
  pickerItem: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  input: {
    width: 80,
    height: 60,
    borderColor: '#fff',
    borderWidth: 1,
    borderRadius: 5,
    textAlign: 'center',
    fontSize: 30,
    color: '#fff',
    backgroundColor: '#000',
    marginRight: 10,
  },
  pickerLabel: {
    fontSize: 24,
    color: '#fff',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '60%',
    paddingTop: 20,
  },
  button: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  startStopButton: {
    backgroundColor: '#4CAF50', // Green
  },
  resetButton: {
    backgroundColor: '#F44336', // Red
  },
  buttonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
});

export default StudyTimer;
