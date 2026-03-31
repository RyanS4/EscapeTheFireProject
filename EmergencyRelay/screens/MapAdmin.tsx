import {View, Text, Button, StyleSheet, TextInput, ScrollView} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import { useAuth } from '../contexts/AuthContext';
import React, {useState, useEffect} from 'react';
import { getUserLocationsServer, getActiveAlertsServer, createAlertServer, confirmAlertServer, cancelAlertServer } from '../services/api';
import { ReportBox } from '../models/Report';

interface AlertData {
    id: string;
    location: string;
    staff: string;
    type: string;
    createdAt?: string;
}

export default function MapAdmin() {
    const navigation = useNavigation();
    const { user } = useAuth();
    const [userLocations, setUserLocations] = useState([]);
    const [loading, setLoading] = useState(false);
    const [locationError, setLocationError] = useState(null);
    const [formError, setFormError] = useState(null);
    const [alerts, setAlerts] = useState<AlertData[]>([]);
    const [selectedAlert, setSelectedAlert] = useState<AlertData | null>(null);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [alertLocation, setAlertLocation] = useState('');
    const [alertType, setAlertType] = useState('');

    function handleBack() {
        (navigation as any).goBack();
    }

    useEffect(() => {
        // Fetch user locations and alerts on mount and periodically
        async function fetchData() {
            try {
                setLoading(true);
                setLocationError(null);
                const locations = await getUserLocationsServer();
                setUserLocations(locations || []);
            } catch (e) {
                console.error('Failed to fetch user locations:', e);
                setLocationError(e && e.message ? e.message : 'Failed to load locations');
            }

            // Fetch alerts separately to avoid breaking location display on alert errors
            try {
                const activeAlerts = await getActiveAlertsServer();
                setAlerts(activeAlerts || []);
            } catch (e) {
                console.error('Failed to fetch alerts:', e);
                // Don't show alert errors - just set empty alerts
                setAlerts([]);
            } finally {
                setLoading(false);
            }
        }

        // Initial fetch
        fetchData();

        // Poll every 5 seconds for updates
        const interval = setInterval(fetchData, 5000);
        return () => clearInterval(interval);
    }, []);

    async function handleCreateAlert() {
        if (!alertType.trim() || !alertLocation.trim()) {
            setFormError('Please fill in all fields');
            return;
        }

        try {
            const newAlert = await createAlertServer({
                location: alertLocation,
                staff: user?.email || 'Admin',
                type: alertType
            });
            setAlerts([...alerts, newAlert]);
            setAlertLocation('');
            setAlertType('');
            setShowCreateForm(false);
            setFormError(null);
        } catch (e) {
            console.error('Failed to create alert:', e);
            setFormError(e && e.message ? e.message : 'Failed to create alert');
        }
    }

    function handleOpenCreateForm() {
        // Auto-populate location with user's current location
        if (userLocations.length > 0) {
            const currentLocation = userLocations[0].lastLocation?.room || 'Unknown';
            setAlertLocation(currentLocation);
        }
        setShowCreateForm(true);
        setFormError(null);
    }

    async function handleConfirmAlert() {
        if (!selectedAlert) return;
        try {
            await confirmAlertServer(selectedAlert.id);
            setAlerts(alerts.filter(a => a.id !== selectedAlert.id));
            setSelectedAlert(null);
        } catch (e) {
            console.error('Failed to confirm alert:', e);
            setFormError(e && e.message ? e.message : 'Failed to confirm alert');
        }
    }

    async function handleCancelAlert() {
        if (!selectedAlert) return;
        try {
            await cancelAlertServer(selectedAlert.id);
            setAlerts(alerts.filter(a => a.id !== selectedAlert.id));
            setSelectedAlert(null);
        } catch (e) {
            console.error('Failed to cancel alert:', e);
            setFormError(e && e.message ? e.message : 'Failed to cancel alert');
        }
    }

    return(
        <View style={styles.container}>
            <View style={styles.mapBox}>
                <Text style={{textAlign: 'center', marginTop: '5%', fontWeight: 'bold', fontSize: 16}}>
                    Live User Locations
                </Text>
                {locationError && (
                    <Text style={{color: 'red', textAlign: 'center', margin: 10}}>
                        Error: {locationError}
                    </Text>
                )}
                {loading && <Text style={{textAlign: 'center', marginTop: 10}}>Loading...</Text>}
                {!loading && userLocations.length === 0 && !locationError && (
                    <Text style={{textAlign: 'center', marginTop: 10, color: '#666'}}>
                        No users with location data
                    </Text>
                )}
                {userLocations.map(u => (
                    <View key={u.id} style={{padding: 10, borderBottomWidth: 1, borderBottomColor: '#ccc'}}>
                        <Text style={{fontWeight: '600'}}>{u.email}</Text>
                        <Text style={{fontSize: 12, color: '#666'}}>
                            {u.lastLocation?.room ? `Room: ${u.lastLocation.room}` : 'Location: Unknown'}
                        </Text>
                        {u.lastLocation?.bssid && (
                            <Text style={{fontSize: 10, color: '#999'}}>
                                WiFi: {u.lastLocation.bssid.substring(0, 17)}
                            </Text>
                        )}
                        {u.lastLocation?.updated && (
                            <Text style={{fontSize: 10, color: '#999'}}>
                                Updated: {new Date(u.lastLocation.updated).toLocaleTimeString()}
                            </Text>
                        )}
                    </View>
                ))}
            </View>

            {showCreateForm ? (
                <>
                    <View style={styles.formContainer}>
                        <Text style={styles.formTitle}>Create New Alert</Text>
                        {formError && (
                            <Text style={{color: 'red', fontSize: 12, marginBottom: 8}}>
                                {formError}
                            </Text>
                        )}
                        <TextInput
                            placeholder="Location (e.g., Room 101)"
                            style={styles.input}
                            value={alertLocation}
                            onChangeText={setAlertLocation}
                        />
                        <TextInput
                            placeholder="Alert Type (e.g., Fire, Medical)"
                            style={styles.input}
                            value={alertType}
                            onChangeText={setAlertType}
                        />
                        <View style={styles.formButtonsContainer}>
                            <Button title="Create" onPress={handleCreateAlert} />
                            <View style={{ width: 8 }} />
                            <Button title="Cancel" onPress={() => setShowCreateForm(false)} />
                        </View>
                    </View>
                </>
            ) : selectedAlert ? (
                <>
                    <ReportBox 
                        location={selectedAlert.location}
                        staff={selectedAlert.staff}
                        type={selectedAlert.type}
                    />
                    {formError && (
                        <Text style={{color: 'red', textAlign: 'center', marginVertical: 8, fontSize: 12}}>
                            {formError}
                        </Text>
                    )}
                    <View style={styles.reportButtonsContainer}>
                        <Button title="Confirm" onPress={handleConfirmAlert} />
                        <View style={{ width: 8 }} />
                        <Button title="Cancel" onPress={handleCancelAlert} />
                        <View style={{ width: 8 }} />
                        <Button title="Back" onPress={() => setSelectedAlert(null)} />
                    </View>
                </>
            ) : alerts.length > 0 ? (
                <>
                    <View style={styles.alertsContainer}>
                        <Text style={styles.alertsTitle}>Active Alerts ({alerts.length})</Text>
                        <ScrollView style={{ maxHeight: 120 }}>
                            {alerts.map(alert => (
                                <Button 
                                    key={alert.id}
                                    title={`${alert.type} - ${alert.location}`}
                                    onPress={() => setSelectedAlert(alert)}
                                />
                            ))}
                        </ScrollView>
                    </View>
                </>
            ) : null}

            <View style={{ height: 16 }} />
            {!showCreateForm && !selectedAlert && (
                <Button title="Create Alert" onPress={handleOpenCreateForm} />
            )}
            {!showCreateForm && !selectedAlert && (
                <View style={{ height: 16 }} />
            )}
            <Button title="Back" onPress={handleBack} />
        </View>
    )
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#ffffffff',
    },
    mapBox: {
        width: '90%',
        height: '50%',
        backgroundColor: '#ddd',
        borderRadius: 8,
        borderColor: '#000',
        borderWidth: 1,
    },
    formContainer: {
        width: '90%',
        padding: 12,
        backgroundColor: '#e3f2fd',
        borderRadius: 8,
        borderColor: '#2196f3',
        borderWidth: 2,
        marginVertical: 8,
    },
    formTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        marginBottom: 8,
        color: '#1976d2',
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        padding: 10,
        marginBottom: 8,
        borderRadius: 4,
        backgroundColor: '#fff',
    },
    formButtonsContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 8,
        marginTop: 8,
    },
    alertsContainer: {
        width: '90%',
        padding: 12,
        backgroundColor: '#fff3cd',
        borderRadius: 8,
        borderColor: '#ffc107',
        borderWidth: 2,
        marginVertical: 8,
    },
    alertsTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        marginBottom: 8,
        color: '#ff6b6b',
    },
    reportButtonsContainer: {
        flexDirection: 'row',
        width: '90%',
        justifyContent: 'center',
        gap: 8,
        marginVertical: 8,
    }
});