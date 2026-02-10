import React, { useEffect, useState } from 'react';
import { View, Text, Button, FlatList, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { listRosters } from '../services/api';
import RosterDetail from './RosterDetail';
import { useAuth } from '../contexts/AuthContext';

export default function RostersStaff() {
    const navigation = useNavigation();
    const { user } = useAuth();
    const [rosters, setRosters] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => { loadRosters(); }, []);

    const [selectedRosterId, setSelectedRosterId] = useState(null);
    async function loadRosters() {
        setLoading(true);
        try { const data = await listRosters(); setRosters(data || []); } catch (e) { console.error(e); } finally { setLoading(false); }
    }

    function openRoster(id) { setSelectedRosterId(id); }

    const assigned = (rosters || []).filter(r => r.assignedTo && user && r.assignedTo === user.id);

    return (
        <View style={{ flex: 1, padding: 16 }}>
            <Text style={{ fontSize: 20, marginBottom: 12 }}>Rosters (Staff)</Text>
            <Button title="Refresh" onPress={loadRosters} />
            <View style={{ marginVertical: 12 }}>
                <Text style={{ fontSize: 16 }}>Your roster</Text>
                {assigned.length === 0 ? <Text style={{ color: '#666' }}>No rosters assigned to you</Text> : null}
                {assigned.map(r => (
                    <TouchableOpacity key={r.id} style={{ padding: 8, borderBottomWidth: 1, borderColor: '#eee' }} onPress={() => openRoster(r.id)}>
                        <Text>{r.name}{r.assignedToEmail ? ` - ${r.assignedToEmail}` : ''}</Text>
                    </TouchableOpacity>
                ))}
            </View>
            {selectedRosterId ? (
                <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: '#fff' }}>
                    <RosterDetail rosterId={selectedRosterId} onClose={() => { setSelectedRosterId(null); loadRosters(); }} />
                </View>
            ) : null}
            <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 16, marginBottom: 8 }}>All Rosters</Text>
                <FlatList data={rosters} keyExtractor={i => i.id} renderItem={({ item }) => (
                    <TouchableOpacity style={{ padding: 8, borderBottomWidth: 1, borderColor: '#eee' }} onPress={() => openRoster(item.id)}>
                        <Text>{item.name}{item.assignedToEmail ? ` - ${item.assignedToEmail}` : ''}</Text>
                    </TouchableOpacity>
                )} />
            </View>

            <Button title="Back" onPress={() => navigation.goBack()} />
        </View>
    );
}

const styles = StyleSheet.create({});
