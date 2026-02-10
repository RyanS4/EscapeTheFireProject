import React, { useEffect, useState } from 'react';
import { View, Text, Button, FlatList, StyleSheet, Image, Switch, TouchableOpacity, ActivityIndicator, Alert, TextInput } from 'react-native';
import { getRoster, addStudentToRoster, updateStudentInRoster, getStudentsServer } from '../services/api';

export default function RosterDetail({ rosterId, onClose }) {
    const [selectedRoster, setSelectedRoster] = useState(null);
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(false);
    const [studentList, setStudentList] = useState([]);

    useEffect(() => {
        if (rosterId) openRoster(rosterId);
    }, [rosterId]);

    async function openRoster(id) {
        setLoading(true);
        try {
            const r = await getRoster(id);
            setSelectedRoster(r);
            setStudents(r.students || []);
        } catch (e) {
            console.error('Open roster failed', e);
            Alert.alert('Error', e && e.message ? e.message : 'Open roster failed');
        } finally {
            setLoading(false);
        }
    }

    async function loadStudents() {
        try {
            const rows = await getStudentsServer();
            setStudentList(rows || []);
        } catch (e) {
            console.error('Load students failed', e);
        }
    }

    async function handleAddExistingStudent(item) {
        if (!selectedRoster) return Alert.alert('Error', 'No roster open');
        try {
            const name = `${item.firstName} ${item.lastName}`;
            const s = await addStudentToRoster(selectedRoster.id, { name, imageUrl: item.imageUrl || undefined });
            setStudents(prev => [...prev, s]);
            Alert.alert('Success', 'Student added to roster');
        } catch (e) {
            console.error('Add existing student failed', e);
            Alert.alert('Error', e && e.message ? e.message : 'Add failed');
        }
    }

    async function toggleAccounted(studentId, value) {
        if (!selectedRoster) return;
        try {
            const updated = await updateStudentInRoster(selectedRoster.id, studentId, { accounted: value });
            setStudents(prev => prev.map(s => s.id === studentId ? updated : s));
        } catch (e) {
            console.error('Update student failed', e);
            Alert.alert('Error', e && e.message ? e.message : 'Update failed');
        }
    }

    if (loading) return <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}><ActivityIndicator /></View>;
    if (!selectedRoster) return null;

    return (
        <View style={{ flex: 1 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 8 }}>
                <Text style={{ fontSize: 20 }}>{selectedRoster.name}</Text>
                {onClose ? <Button title="Close" onPress={onClose} /> : null}
            </View>
            <FlatList
                data={students}
                keyExtractor={item => item.id || item._id || `${item.name || item.firstName || ''}`}
                renderItem={({ item }) => (
                    <View style={styles.row}>
                        {item.imageUrl ? <Image source={{ uri: item.imageUrl }} style={styles.avatar} /> : <View style={[styles.avatar, { backgroundColor: '#eee' }]} />}
                        <Text style={{ flex: 1 }}>{item.name || `${item.firstName || ''} ${item.lastName || ''}`.trim()}</Text>
                        <Switch value={!!item.accounted} onValueChange={(val) => toggleAccounted(item.id || item._id, val)} />
                    </View>
                )}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 1, borderColor: '#eee' },
    avatar: { width: 48, height: 48, borderRadius: 24, marginRight: 12 },
});
