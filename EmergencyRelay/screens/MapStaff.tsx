import {View, Text, Button, StyleSheet} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import { useAuth } from '../contexts/AuthContext';
import React, {useState, useEffect} from 'react';
import { getUserLocationsServer } from '../services/api';

export default function MapStaff() {
    const navigation = useNavigation();
    const [userLocations, setUserLocations] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    function handleBack() {
        (navigation as any).goBack();
    }

    useEffect(() => {
        // Fetch user locations on mount and periodically
        async function fetchLocations() {
            try {
                setError(null);
                const users = await getUserLocationsServer();
                setUserLocations(users || []);
            } catch (e) {
                console.error('Failed to fetch user locations:', e);
                setError(e && e.message ? e.message : 'Failed to load locations');
            } finally {
                setLoading(false);
            }
        }

        // Initial fetch
        fetchLocations();

        // Poll every 5 seconds for location updates
        const interval = setInterval(fetchLocations, 5000);
        return () => clearInterval(interval);
    }, []);

    return(
        <View style={styles.container}>
            <View style={styles.mapBox}>
                <Text style={{textAlign: 'center', marginTop: '5%', fontWeight: 'bold', fontSize: 16}}>
                    Live User Locations
                </Text>
                {error && (
                    <Text style={{color: 'red', textAlign: 'center', margin: 10}}>
                        Error: {error}
                    </Text>
                )}
                {loading && <Text style={{textAlign: 'center', marginTop: 10}}>Loading...</Text>}
                {!loading && userLocations.length === 0 && (
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
            <View style={{ height: 16 }} />
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
        height: '80%',
        backgroundColor: '#ddd',
        borderRadius: 8,
        borderColor: '#000',
        borderWidth: 1,
    }
});