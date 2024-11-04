import { useState, useEffect, useCallback } from 'react';
import { Client, Message } from 'paho-mqtt';
import * as Notifications from 'expo-notifications';

interface MqttState {
  isConnected: boolean;
  actualTemperature: number;
}

const MQTT_CONFIG = {
  uri: 'wss://2c87a101d88f41f3a2cc7fd81f41ca2a.s1.eu.hivemq.cloud:8884/mqtt',
  clientId: 'TemperatureApp_' + Math.random().toString(16).substr(2, 8),
  username: 'bongilou',
  password: 'Hmagufo01',
};

export const useMqtt = () => {
  const [mqttState, setMqttState] = useState<MqttState>({
    isConnected: false,
    actualTemperature: 0,
  });
  const [client, setClient] = useState<Client | null>(null);
  const [targetTemperature, setTargetTemperature] = useState(21); // Temperatura deseada

  const setupClient = useCallback(() => {
    // Solo crea el cliente una vez
    if (!client) {
      const newClient = new Client(MQTT_CONFIG.uri, MQTT_CONFIG.clientId);
      setClient(newClient);
    }
  }, [client]);

  const sendNotification = async (title: string, body: string) => {
    await Notifications.scheduleNotificationAsync({
      content: { title, body },
      trigger: null,
    });
  };

  useEffect(() => {
    setupClient();

    if (!client) return;

    // Configuración del cliente solo si no está conectado
    if (!client.isConnected()) {
      console.log('Iniciando conexión MQTT...');
      
      // Gestiona la pérdida de conexión y reconexión controlada
      client.onConnectionLost = (responseObject) => {
        console.log('Conexión perdida: ', responseObject.errorMessage);
        setMqttState((prevState) => ({ ...prevState, isConnected: false }));
        sendNotification("Calefacción", "Conexión perdida con el servidor MQTT.");

        // Intento de reconexión después de 5 segundos, solo si está desconectado
        setTimeout(() => {
          if (!client.isConnected()) {
            client.connect({
              onSuccess: () => {
                console.log('Reconexión exitosa');
                setMqttState((prevState) => ({ ...prevState, isConnected: true }));
                client.subscribe('casa/temperatura/actual', { qos: 1 });
              },
              onFailure: (err) => console.log("Fallo en la reconexión:", err),
              userName: MQTT_CONFIG.username,
              password: MQTT_CONFIG.password,
              useSSL: true,
              cleanSession: false,
            });
          }
        }, 5000);
      };

      // Configuración para recibir mensajes
      client.onMessageArrived = (message: Message) => {
        console.log('Mensaje recibido:', message.payloadString);
        const temp = parseFloat(message.payloadString);
        if (!isNaN(temp)) {
          setMqttState((prevState) => ({
            ...prevState,
            actualTemperature: temp,
          }));

          // Notificación si se alcanza la temperatura deseada
          if (temp >= targetTemperature) {
            sendNotification(
              "Calefacción",
              `La temperatura deseada de ${targetTemperature}°C se ha alcanzado.`
            );
          }
        }
      };

      // Conexión inicial del cliente
      client.connect({
        onSuccess: () => {
          console.log('Conectado a MQTT exitosamente');
          setMqttState((prevState) => ({ ...prevState, isConnected: true }));
          client.subscribe('casa/temperatura/actual', { qos: 1 });
          sendNotification("Calefacción", "Conectado al servidor MQTT.");
        },
        onFailure: (err) => console.log("Error en la conexión inicial:", err),
        userName: MQTT_CONFIG.username,
        password: MQTT_CONFIG.password,
        useSSL: true,
        cleanSession: false,
      });
    }

    // Desconecta al desmontar
    return () => {
      if (client.isConnected()) {
        client.disconnect();
      }
    };
  }, [client, setupClient, targetTemperature]);

  // Función para enviar temperatura deseada solo si está conectado
  const sendDesiredTemperature = (temperature: number) => {
    if (mqttState.isConnected && client) {
      console.log('Enviando temperatura deseada:', temperature);
      try {
        client.send('casa/temperatura/deseada', temperature.toString(), 1, false);
      } catch (error) {
        console.log('Error al enviar temperatura deseada:', error);
      }
    } else {
      console.log('No se puede enviar la temperatura: MQTT no está conectado');
    }
  };

  // Maneja el cambio de temperatura deseada
  return {
    isConnected: mqttState.isConnected,
    currentTemp: mqttState.actualTemperature,
    setTargetTemperature: (temp) => {
      setTargetTemperature(temp);
      sendDesiredTemperature(temp);
    },
  };
};
