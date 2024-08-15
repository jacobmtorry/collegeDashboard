import React, { useState } from 'react';
import { View, StatusBar, StyleSheet } from 'react-native';
import * as Font from 'expo-font';
import AppLoading from 'expo-app-loading';
import Dashboard from './screens/Dashboard';
import Landing from './screens/Landing';

const loadFonts = () => {
  return Font.loadAsync({
    'DuneRise': require('./assets/fonts/Dune_Rise.ttf'),
  });
};

export default function App() {
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const [activeSemester, setActiveSemester] = useState(null);

  const handleSelectSemester = (semester) => {
    setActiveSemester(semester);
  };

  const handleBack = () => {
    setActiveSemester(null);
  };

  if (!fontsLoaded) {
    return (
      <AppLoading
        startAsync={loadFonts}
        onFinish={() => setFontsLoaded(true)}
        onError={(err) => console.log(err)}
      />
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="auto" />
      {activeSemester === null ? (
        <Landing onSelectSemester={handleSelectSemester} />
      ) : (
        <Dashboard semesterId={activeSemester.id} semesterName={activeSemester.name} onBack={handleBack} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});
