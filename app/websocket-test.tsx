import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import { useTheme } from '@/context/ThemeContext';
import { LinearGradient } from 'expo-linear-gradient';
import { InnerContainer } from '@/components/base/InnerContainer';
import NavBar from '@/components/feature/NavBar';
import { ThemedText } from '@/components/base/ThemedText';
import webSocketService from '@/services/WebSocketService';

export default function WebSocketTestScreen() {
  const { colors } = useTheme();
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Function to add a log message
  const addLog = (message: string) => {
    setLogs(prevLogs => [...prevLogs, `${new Date().toISOString().slice(11, 19)} - ${message}`]);
  };

  // Function to test the WebSocket connection
  const testConnection = async () => {
    setIsLoading(true);
    addLog('Testing WebSocket connection...');

    try {
      const result = await webSocketService.testConnection();
      setTestResult(result);
      addLog(result.message);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      setTestResult({ success: false, message: `Error: ${errorMessage}` });
      addLog(`Error: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Function to clear logs
  const clearLogs = () => {
    setLogs([]);
    setTestResult(null);
  };

  // Function to get WebSocket URL and browser support info
  const getWebSocketInfo = () => {
    const url = process.env.NODE_ENV === 'production'
      ? 'wss://dev.blinker.eterny.fr'
      : 'ws://localhost:3011';

    const isSupported = webSocketService.isWebSocketSupported();

    addLog(`WebSocket URL: ${url}`);
    addLog(`NODE_ENV: ${process.env.NODE_ENV}`);
    addLog(`WebSocket supported by browser: ${isSupported ? 'Yes' : 'No'}`);

    // Check if we're in a secure context (needed for wss:// in some browsers)
    if (typeof window !== 'undefined') {
      const isSecureContext = window.isSecureContext;
      addLog(`Secure context: ${isSecureContext ? 'Yes' : 'No'}`);
    }

    return url;
  };

  return (
    <>
      <Stack.Screen options={{ title: 'WebSocket Test' }} />
      <SafeAreaView style={styles.container}>
        <LinearGradient colors={colors.gradient} style={styles.background}>
          <InnerContainer>
            <NavBar />

            <View style={styles.content}>
              <ThemedText variant="Title">WebSocket Connection Test</ThemedText>

              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={[styles.button, { backgroundColor: colors.accent }]}
                  onPress={testConnection}
                  disabled={isLoading}
                >
                  <ThemedText style={styles.buttonText}>
                    {isLoading ? 'Testing...' : 'Test Connection'}
                  </ThemedText>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.button, { backgroundColor: colors.card }]}
                  onPress={getWebSocketInfo}
                >
                  <ThemedText style={styles.buttonText}>Get WebSocket Info</ThemedText>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.button, { backgroundColor: colors.card }]}
                  onPress={clearLogs}
                >
                  <ThemedText style={styles.buttonText}>Clear Logs</ThemedText>
                </TouchableOpacity>
              </View>

              {testResult && (
                <View style={[
                  styles.resultContainer,
                  { backgroundColor: testResult.success ? '#2e7d32' : '#c62828' }
                ]}>
                  <ThemedText style={styles.resultText}>
                    {testResult.success ? '✓ Connected' : '✗ Failed'}
                  </ThemedText>
                  <ThemedText style={styles.resultMessage}>{testResult.message}</ThemedText>
                </View>
              )}

              <View style={[styles.logsContainer, { backgroundColor: colors.card }]}>
                <ThemedText variant="SubTitle">Logs</ThemedText>
                <ScrollView style={styles.logs}>
                  {logs.map((log, index) => (
                    <ThemedText key={index} style={styles.logText}>{log}</ThemedText>
                  ))}
                  {logs.length === 0 && (
                    <ThemedText style={styles.emptyLogs}>No logs yet. Click a button to start.</ThemedText>
                  )}
                </ScrollView>
              </View>
            </View>
          </InnerContainer>
        </LinearGradient>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 16,
    gap: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 16,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    minWidth: 120,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  resultContainer: {
    padding: 16,
    borderRadius: 8,
    marginTop: 16,
  },
  resultText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 18,
  },
  resultMessage: {
    color: 'white',
    marginTop: 8,
  },
  logsContainer: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    marginTop: 16,
  },
  logs: {
    flex: 1,
    marginTop: 8,
  },
  logText: {
    fontSize: 12,
    marginBottom: 4,
  },
  emptyLogs: {
    fontStyle: 'italic',
    opacity: 0.7,
  },
});
