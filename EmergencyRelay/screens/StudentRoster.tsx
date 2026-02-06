import React, { useEffect, useState } from 'react';
import { View, Text, Button, FlatList, StyleSheet, Image, Switch, TouchableOpacity, ActivityIndicator, Alert, TextInput, Modal } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { listRosters, getRoster, updateStudentInRoster, createRoster, addStudentToRoster, assignRoster, getUsersServer } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

export default function StudentRoster() {
    const navigation = useNavigation();
    const { isAdmin, user } = useAuth();
    const amAdmin = isAdmin && isAdmin();
    const [rosters, setRosters] = useState([]);
    const [selectedRoster, setSelectedRoster] = useState(null);
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(false);
        const [creating, setCreating] = useState(false);
        const [newRosterName, setNewRosterName] = useState('');
        const [assignEmail, setAssignEmail] = useState('');
    const [creatingRosterStaff, setCreatingRosterStaff] = useState(null);
        const [newStudentName, setNewStudentName] = useState('');
        const [newStudentImage, setNewStudentImage] = useState('');
        const [newGlobalStudentName, setNewGlobalStudentName] = useState('');
        const [newGlobalStudentImage, setNewGlobalStudentImage] = useState('');
        const [selectedRosterForStudent, setSelectedRosterForStudent] = useState(null);
    const [staffList, setStaffList] = useState([]);
    const [staffLoading, setStaffLoading] = useState(false);
    const [showStaffModal, setShowStaffModal] = useState(false);
    const [staffSelectTarget, setStaffSelectTarget] = useState(null);
    const [selectedStaffForAssign, setSelectedStaffForAssign] = useState(null);

    async function openStaffModal(target) {
        setStaffSelectTarget(target);
        try {
            if (!staffList || staffList.length === 0) {
                await loadStaff();
            }
        } catch (e) {
            // loadStaff shows its own error
        }
        setShowStaffModal(true);
    }

    useEffect(() => {
        loadRosters();
    }, []);

    async function loadRosters() {
        setLoading(true);
        try {
            const data = await listRosters();
            setRosters(data || []);
            if (amAdmin) loadStaff();
        } catch (e) {
            console.error('Load rosters failed', e);
            Alert.alert('Error', e && e.message ? e.message : 'Load rosters failed');
        } finally {
            setLoading(false);
        }
    }

    async function loadStaff() {
        setStaffLoading(true);
        try {
            const users = await getUsersServer();
            const staff = (users || []).filter(u => Array.isArray(u.roles) ? u.roles.includes('staff') : true);
            setStaffList(staff);
        } catch (e) {
            console.error('Load staff failed', e);
            Alert.alert('Error', 'Could not load staff list');
        } finally {
            setStaffLoading(false);
        }
    }

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

    async function handleCreateRoster() {
        if (!newRosterName) return Alert.alert('Error', 'Roster name required');
        setCreating(true);
        try {
            const r = await createRoster({ name: newRosterName, assignedToEmail: creatingRosterStaff ? creatingRosterStaff.email : undefined });
            setNewRosterName('');
            setAssignEmail('');
            setCreatingRosterStaff(null);
            await loadRosters();
            if (r && r.id) openRoster(r.id);
        } catch (e) {
            console.error('Create roster failed', e);
            Alert.alert('Error', e && e.message ? e.message : 'Create failed');
        } finally {
            setCreating(false);
        }
    }

    async function handleAssignRoster(rosterId) {
        const staff = selectedStaffForAssign;
        if (!staff) return Alert.alert('Error', 'Select a staff member to assign');
        try {
            await assignRoster(rosterId, { staffId: staff.id, staffEmail: staff.email });
            setSelectedStaffForAssign(null);
            await loadRosters();
        } catch (e) {
            console.error('Assign failed', e);
            Alert.alert('Error', e && e.message ? e.message : 'Assign failed');
        }
    }

    async function handleAddStudent() {
        if (!selectedRoster) return;
        if (!newStudentName) return Alert.alert('Error', 'Student name required');
        try {
            const s = await addStudentToRoster(selectedRoster.id, { name: newStudentName, imageUrl: newStudentImage || undefined });
            setNewStudentName('');
            setNewStudentImage('');
            setStudents(prev => [...prev, s]);
        } catch (e) {
            console.error('Add student failed', e);
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

    if (selectedRoster) {
        return (
            <View style={{ flex: 1, padding: 16 }}>
                <Button title="Back to Rosters" onPress={() => { setSelectedRoster(null); setStudents([]); }} />
                <Text style={{ fontSize: 20, marginVertical: 12 }}>{selectedRoster.name}</Text>
                                { (amAdmin) || (selectedRoster.assignedTo == null) ? (
                                        <View style={{ marginBottom: 8 }}>
                                            <Text style={{ fontSize: 12, color: '#666' }}>Assign to staff:</Text>
                                            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                                                <Button title={selectedStaffForAssign ? `Staff: ${selectedStaffForAssign.email}` : 'Select staff'} onPress={() => openStaffModal('assignRoster')} />
                                                <View style={{ width: 8 }} />
                                                <Button title="Assign" onPress={() => handleAssignRoster(selectedRoster.id)} />
                                            </View>
                                        </View>
                                    ) : null }
                    { ((amAdmin) || (selectedRoster.assignedTo == null) || (selectedRoster.assignedTo === user?.id)) ? (
                                    <View style={{ marginBottom: 8 }}>
                                        <Text style={{ fontSize: 12, color: '#666' }}>Add student:</Text>
                                        <TextInput value={newStudentName} onChangeText={setNewStudentName} placeholder="Student name" style={{ borderWidth: 1, borderColor: '#ddd', padding: 8, marginBottom: 8 }} />
                                        <TextInput value={newStudentImage} onChangeText={setNewStudentImage} placeholder="Image URL (optional)" style={{ borderWidth: 1, borderColor: '#ddd', padding: 8, marginBottom: 8 }} />
                                        <Button title="Add Student" onPress={handleAddStudent} />
                                    </View>
                    ) : null }
                <FlatList
                    data={students}
                    keyExtractor={item => item.id}
                    renderItem={({ item }) => (
                        <View style={styles.row}>
                            {item.imageUrl ? <Image source={{ uri: item.imageUrl }} style={styles.avatar} /> : <View style={[styles.avatar, { backgroundColor: '#eee' }]} />}
                            <Text style={{ flex: 1 }}>{item.name}</Text>
                            <Switch value={!!item.accounted} onValueChange={(val) => toggleAccounted(item.id, val)} />
                        </View>
                    )}
                />
            </View>
        );
    }

    return (
        <View style={{ flex: 1, padding: 16 }}>
            <Button title="Back" onPress={() => navigation.goBack()} />
            <Text style={{ fontSize: 20, marginBottom: 12 }}>Rosters</Text>
            <Button title="Refresh" onPress={loadRosters} />

            {amAdmin ? (
                <View style={{ marginVertical: 12, padding: 8, borderWidth: 1, borderColor: '#eee', borderRadius: 6 }}>
                    <Text style={{ fontSize: 16, marginBottom: 8 }}>Create roster</Text>
                    <TextInput value={newRosterName} onChangeText={setNewRosterName} placeholder="Roster name" style={{ borderWidth: 1, borderColor: '#ddd', padding: 8, marginBottom: 8 }} />
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                        <Button title={creatingRosterStaff ? `Assign: ${creatingRosterStaff.email}` : 'Select staff to assign (optional)'} onPress={() => openStaffModal('createRoster')} />
                        <View style={{ width: 8 }} />
                        <Button title={creating ? 'Creating...' : 'Create Roster'} onPress={async () => {
                            // hard-check selected staff if provided
                            if (creatingRosterStaff) {
                                // ensure staffList is loaded
                                if (!staffList || staffList.length === 0) await loadStaff();
                                const found = (staffList || []).find(s => s.email && s.email.toLowerCase() === creatingRosterStaff.email.toLowerCase());
                                if (!found) return Alert.alert('Error', 'No staff member found with that email');
                            }
                            try {
                                await handleCreateRoster();
                                Alert.alert('Success', 'Roster created');
                            } catch (e) {
                                // handleCreateRoster already alerts; rethrow if needed
                            }
                        }} />
                    </View>
                    <View style={{ height: 8 }} />
                    <Text style={{ fontSize: 16, marginBottom: 8 }}>Create student and assign to roster</Text>
                    <TextInput value={newGlobalStudentName} onChangeText={setNewGlobalStudentName} placeholder="Student name" style={{ borderWidth: 1, borderColor: '#ddd', padding: 8, marginBottom: 8 }} />
                    <TextInput value={newGlobalStudentImage} onChangeText={setNewGlobalStudentImage} placeholder="Image URL (optional)" style={{ borderWidth: 1, borderColor: '#ddd', padding: 8, marginBottom: 8 }} />
                    <Text style={{ fontSize: 12, color: '#666', marginBottom: 6 }}>Select roster to add to:</Text>
                    <View style={{ maxHeight: 140, marginBottom: 8 }}>
                        <FlatList
                            data={rosters}
                            keyExtractor={i => i.id}
                            renderItem={({ item }) => (
                                <TouchableOpacity onPress={() => setSelectedRosterForStudent(item.id)} style={{ padding: 8, backgroundColor: selectedRosterForStudent === item.id ? '#def' : '#fff', borderBottomWidth: 1, borderColor: '#eee' }}>
                                    <Text>{item.name}</Text>
                                </TouchableOpacity>
                            )}
                        />
                    </View>
                    <Button title="Create & Assign Student" onPress={async () => {
                        if (!newGlobalStudentName) return Alert.alert('Error', 'Student name required');
                        if (!selectedRosterForStudent) return Alert.alert('Error', 'Select a roster');
                        try {
                            const s = await addStudentToRoster(selectedRosterForStudent, { name: newGlobalStudentName, imageUrl: newGlobalStudentImage || undefined });
                            setNewGlobalStudentName('');
                            setNewGlobalStudentImage('');
                            setSelectedRosterForStudent(null);
                            await loadRosters();
                            // If the roster currently open, add to its list
                            if (selectedRoster && selectedRoster.id === selectedRosterForStudent) {
                                setStudents(prev => [...prev, s]);
                            }
                            Alert.alert('Success', 'Student created and assigned');
                        } catch (e) {
                            console.error('Create & assign student failed', e);
                            Alert.alert('Error', e && e.message ? e.message : 'Create failed');
                        }
                    }} />
                </View>
            ) : null }
            <Text style={{ fontSize: 16, marginTop: 12 }}>Assigned Rosters</Text>
            <FlatList
                data={rosters.filter(r => r.assignedTo)}
                keyExtractor={item => item.id}
                style={{ maxHeight: 200 }}
                renderItem={({ item }) => (
                    <TouchableOpacity style={styles.rosterRow} onPress={() => openRoster(item.id)}>
                        <Text style={{ fontSize: 16 }}>{item.name} {item.assignedToEmail ? `- ${item.assignedToEmail}` : ''}</Text>
                    </TouchableOpacity>
                )}
            />
            <Text style={{ fontSize: 16, marginTop: 12 }}>Unassigned Rosters</Text>
            <FlatList
                data={rosters.filter(r => !r.assignedTo)}
                keyExtractor={item => item.id}
                style={{ maxHeight: 200 }}
                renderItem={({ item }) => (
                    <TouchableOpacity style={styles.rosterRow} onPress={() => openRoster(item.id)}>
                        <Text style={{ fontSize: 16 }}>{item.name}</Text>
                    </TouchableOpacity>
                )}
            />

            <Modal visible={showStaffModal} animationType="slide" onRequestClose={() => setShowStaffModal(false)}>
                <View style={{ flex: 1, padding: 16 }}>
                    <Text style={{ fontSize: 18, marginBottom: 12 }}>Select staff</Text>
                    {staffLoading ? <ActivityIndicator /> : (
                        <FlatList
                            data={staffList}
                            keyExtractor={i => i.id}
                            renderItem={({ item }) => (
                                <TouchableOpacity style={{ padding: 12, borderBottomWidth: 1, borderColor: '#eee' }} onPress={() => {
                                    if (staffSelectTarget === 'assignRoster') setSelectedStaffForAssign(item);
                                    if (staffSelectTarget === 'createRoster') setCreatingRosterStaff(item);
                                    setShowStaffModal(false);
                                }}>
                                    <Text style={{ fontSize: 16 }}>{item.email}</Text>
                                </TouchableOpacity>
                            )}
                        />
                    )}
                    <View style={{ height: 12 }} />
                    <Button title="Close" onPress={() => setShowStaffModal(false)} />
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 1, borderColor: '#eee' },
    avatar: { width: 48, height: 48, borderRadius: 24, marginRight: 12 },
    rosterRow: { paddingVertical: 12, borderBottomWidth: 1, borderColor: '#eee' }
});