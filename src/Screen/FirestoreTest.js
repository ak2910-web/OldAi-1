import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import firestore from '@react-native-firebase/firestore';
import { testFirestoreConnection, saveConversation, getUserConversations } from '../services/firebaseService';

/**
 * Firestore Test Screen
 * Tests all Firestore operations
 */
const FirestoreTest = ({ navigation }) => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);

  const addLog = (message, type = 'info') => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, { message, type, timestamp }]);
    console.log(`[${type}] ${message}`);
  };

  // Test 1: Connection Test
  const testConnection = async () => {
    setLoading(true);
    try {
      addLog('Testing Firestore connection...', 'info');
      const success = await testFirestoreConnection();
      if (success) {
        addLog('✅ Connection successful!', 'success');
        Alert.alert('Success', 'Firestore connection test passed!');
      } else {
        throw new Error('Connection test failed');
      }
    } catch (error) {
      addLog(`❌ Error: ${error.message}`, 'error');
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  // Test 2: Write Test
  const testWrite = async () => {
    setLoading(true);
    try {
      addLog('Writing test document...', 'info');
      await firestore()
        .collection('tests')
        .add({
          message: 'Hello Firestore 👋',
          createdAt: firestore.FieldValue.serverTimestamp(),
          timestamp: new Date().toISOString(),
        });
      addLog('✅ Test document written!', 'success');
      Alert.alert('Success', 'Test document created successfully!');
    } catch (error) {
      addLog(`❌ Write error: ${error.message}`, 'error');
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  // Test 3: Read Test
  const testRead = async () => {
    setLoading(true);
    try {
      addLog('Reading test documents...', 'info');
      const snapshot = await firestore()
        .collection('tests')
        .orderBy('createdAt', 'desc')
        .limit(5)
        .get();

      addLog(`✅ Found ${snapshot.size} documents`, 'success');
      
      snapshot.forEach(doc => {
        const data = doc.data();
        addLog(`📄 ${doc.id}: ${data.message}`, 'info');
      });

      Alert.alert('Success', `Read ${snapshot.size} documents`);
    } catch (error) {
      addLog(`❌ Read error: ${error.message}`, 'error');
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  // Test 4: Save Conversation
  const testSaveConversation = async () => {
    setLoading(true);
    try {
      addLog('Saving test conversation...', 'info');
      const docId = await saveConversation(
        'What is 2 + 2?',
        '2 + 2 = 4. This is basic arithmetic.',
        'gemini-2.0-flash',
        'text'
      );
      addLog(`✅ Conversation saved with ID: ${docId}`, 'success');
      Alert.alert('Success', `Conversation saved!\nID: ${docId}`);
    } catch (error) {
      addLog(`❌ Save error: ${error.message}`, 'error');
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  // Test 5: Read Conversations
  const testReadConversations = async () => {
    setLoading(true);
    try {
      addLog('Reading conversations...', 'info');
      const conversations = await getUserConversations(10);
      addLog(`✅ Found ${conversations.length} conversations`, 'success');
      
      conversations.forEach(conv => {
        addLog(`💬 Q: ${conv.question.substring(0, 50)}...`, 'info');
      });

      Alert.alert('Success', `Found ${conversations.length} conversations`);
    } catch (error) {
      addLog(`❌ Read error: ${error.message}`, 'error');
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const clearLogs = () => {
    setLogs([]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => navigation.goBack()} 
          style={styles.backButton}
          activeOpacity={0.7}
        >
          <Icon name="arrow-left" size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.title}>Firestore Tests</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content}>
        <Text style={styles.sectionTitle}>Connection Tests</Text>
        <TouchableOpacity style={styles.button} onPress={testConnection} disabled={loading}>
          <Text style={styles.buttonText}>1️⃣ Test Connection</Text>
        </TouchableOpacity>

        <Text style={styles.sectionTitle}>Basic CRUD Tests</Text>
        <TouchableOpacity style={styles.button} onPress={testWrite} disabled={loading}>
          <Text style={styles.buttonText}>2️⃣ Write Test Document</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.button} onPress={testRead} disabled={loading}>
          <Text style={styles.buttonText}>3️⃣ Read Test Documents</Text>
        </TouchableOpacity>

        <Text style={styles.sectionTitle}>Conversation Tests</Text>
        <TouchableOpacity style={styles.button} onPress={testSaveConversation} disabled={loading}>
          <Text style={styles.buttonText}>4️⃣ Save Test Conversation</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.button} onPress={testReadConversations} disabled={loading}>
          <Text style={styles.buttonText}>5️⃣ Read Conversations</Text>
        </TouchableOpacity>

        <View style={styles.logHeader}>
          <Text style={styles.logTitle}>Logs</Text>
          <TouchableOpacity onPress={clearLogs}>
            <Text style={styles.clearText}>Clear</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.logContainer}>
          {logs.length === 0 ? (
            <Text style={styles.noLogs}>No logs yet. Run a test!</Text>
          ) : (
            logs.map((log, index) => (
              <View key={index} style={styles.logItem}>
                <Text style={styles.logTimestamp}>{log.timestamp}</Text>
                <Text style={[
                  styles.logMessage,
                  log.type === 'error' && styles.logError,
                  log.type === 'success' && styles.logSuccess,
                ]}>
                  {log.message}
                </Text>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5DC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholder: {
    width: 40,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    flex: 1,
    textAlign: 'center',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
    marginTop: 16,
    marginBottom: 12,
  },
  button: {
    backgroundColor: '#FFB84D',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    textAlign: 'center',
  },
  logHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 12,
  },
  logTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  clearText: {
    fontSize: 14,
    color: '#FF8C42',
    fontWeight: '600',
  },
  logContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  noLogs: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  logItem: {
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  logTimestamp: {
    fontSize: 12,
    color: '#999',
    marginBottom: 4,
  },
  logMessage: {
    fontSize: 14,
    color: '#333',
  },
  logError: {
    color: '#DC2626',
  },
  logSuccess: {
    color: '#16A34A',
  },
});

export default FirestoreTest;
