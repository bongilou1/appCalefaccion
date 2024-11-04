import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { useState } from 'react';
import { useMqtt } from './hooks/useMqtt';
import { Ionicons } from '@expo/vector-icons';

export default function App() {
  const [targetTemp, setTargetTemp] = useState(21.0);
  const { 
    isConnected, 
    currentTemp, 
    setTargetTemperature 
  } = useMqtt();

  const adjustTemperature = (increment: number) => {
    const newTemp = targetTemp + increment;
    if (newTemp >= 15 && newTemp <= 30) {
      setTargetTemp(newTemp);
      setTargetTemperature(newTemp);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Control de Calefacción</Text>
        <View style={[styles.connectionStatus, isConnected ? styles.connected : styles.disconnected]}>
          <Text style={styles.connectionText}>
            {isConnected ? 'Conectado' : 'Desconectado'}
          </Text>
          <Ionicons name={isConnected ? "checkmark-circle" : "close-circle"} size={24} color={isConnected ? "#4CAF50" : "#FF5252"} />
        </View>
      </View>

      {/* Temperature Display */}
      <View style={styles.temperatureSection}>
        <Text style={styles.label}>Temperatura Actual</Text>
        <Text style={styles.currentTemp}>
          {currentTemp !== undefined ? currentTemp.toFixed(1) : '--'}°C
        </Text>
      </View>

      {/* Target Temperature Controls */}
      <View style={styles.targetSection}>
        <Text style={styles.label}>Temperatura Deseada</Text>
        
        <View style={styles.controlsRow}>
          <TouchableOpacity 
            style={styles.controlButton}
            onPress={() => adjustTemperature(-0.5)}
          >
            <Ionicons name="remove-circle-outline" size={48} color="#4CAF50" />
          </TouchableOpacity>

          <Text style={styles.targetTemp}>
            {targetTemp.toFixed(1)}°C
          </Text>

          <TouchableOpacity 
            style={styles.controlButton}
            onPress={() => adjustTemperature(0.5)}
          >
            <Ionicons name="add-circle-outline" size={48} color="#4CAF50" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1E1E2D',
    paddingHorizontal: 20,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 24,
    color: '#FFFFFF',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  connectionStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  connectionText: {
    fontSize: 16,
    marginRight: 8,
  },
  connected: {
    color: '#4CAF50',
  },
  disconnected: {
    color: '#FF5252',
  },
  temperatureSection: {
    alignItems: 'center',
    marginBottom: 40,
  },
  label: {
    fontSize: 20,
    color: '#AAAAAA',
    marginBottom: 5,
    textAlign: 'center',
  },
  currentTemp: {
    fontSize: 60,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  targetSection: {
    alignItems: 'center',
    marginBottom: 50,
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: 10,
  },
  controlButton: {
    padding: 10,
  },
  targetTemp: {
    fontSize: 48,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
});
