import React, { useEffect, useState } from 'react';
import { View, Text, Button, FlatList, StyleSheet, Alert } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { getUsersServer, deleteUserServer, getAccessToken, setApiBaseUrl, getApiBaseUrl } from '../services/api';
import { useNavigation } from '@react-navigation/native';

export default function DeleteStaffAccount() {
  const { configureApiBase } = useAuth(); // in case device needs different host
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [lastMessage, setLastMessage] = useState('');
  const navigation = useNavigation();

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    setLastMessage('');
    try {
      const data = await getUsersServer();
      setUsers(data || []);
    } catch (e) {
      console.error('Load users failed', e);
      const msg = e && e.message ? e.message : 'Load users failed';
      setLastMessage(`Load error: ${msg}`);
      Alert.alert('Error', msg);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id, email) {
    console.log('handleDelete called', id, email);
    Alert.alert('Confirm delete', `Delete user ${email}?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          // call an async function so Alert callback isn't an async function itself
          (async () => {
            try {
              console.log('deleting user', id);
              setDeletingId(id);
              await deleteUserServer(id);
              // reload from server to avoid any client/server discrepancies
              await load();
              const successMsg = `${email} has been deleted`;
              setLastMessage(successMsg);
              Alert.alert('Deleted', successMsg);
            } catch (e) {
              console.error('Delete failed', e);
              const msg = e && e.message ? e.message : 'Delete failed';
              setLastMessage(`Delete error: ${msg}`);
              Alert.alert('Error', msg);
            } finally {
              setDeletingId(null);
            }
          })();
        }
      }
    ]);
  }

    function handleCancel() {
      // Handle cancel logic here
      console.log('Cancel delete');
      (navigation as any).navigate('DashboardAdmin');
    }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Delete Staff Accounts</Text>
      <Text style={{ fontSize: 12, color: '#666', marginBottom: 8 }}>API: {getApiBaseUrl()}</Text>
      <Text style={{ fontSize: 12, color: '#666', marginBottom: 8 }}>Token: {getAccessToken() ? String(getAccessToken()).slice(0,12) + '...' : '<none>'}</Text>
      <View style={{ flexDirection: 'row', marginBottom: 8 }}>
        <Button title="Use localhost" onPress={() => { setApiBaseUrl('http://localhost:5000'); load(); }} />
        <View style={{ width: 8 }} />
        <Button title="Use 10.0.2.2" onPress={() => { setApiBaseUrl('http://10.0.2.2:5000'); load(); }} />
      </View>
      <Button title="Refresh" onPress={load} disabled={loading} />
      <FlatList
        data={users}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Text style={styles.email}>{item.email}</Text>
              <Text style={styles.meta}>{(item.roles || []).join(', ')}</Text>
            </View>
            <Button title="Delete" color="#d00" onPress={() => handleDelete(item.id, item.email)} disabled={deletingId === item.id} />
          </View>
        )}
      />
        <Button title="Cancel" onPress={handleCancel} />
        {lastMessage ? <Text style={{ marginTop: 12 }}>{lastMessage}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  title: { fontSize: 20, marginBottom: 12, textAlign: 'center' },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 1, borderColor: '#eee' },
  email: { fontSize: 16 },
  meta: { fontSize: 12, color: '#666' }
});
