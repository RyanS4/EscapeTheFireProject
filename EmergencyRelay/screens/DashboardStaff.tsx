import {View, Text, TextInput, Button, StyleSheet, Alert, Platform} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import { useAuth } from '../contexts/AuthContext';
import React, {useState} from 'react';

const DashboardStaff = () => {
    
    const navigation = useNavigation();
    const { signOut } = useAuth();  

    function handleAlertInitiation() {
        // Handle alert initiation logic here
        console.log('Alert initiated');
        (navigation as any).navigate('MapStaff');
    }   

    function handleViewClassRoster() {
        // Handle view class roster logic here
        console.log('Viewing class roster');
        (navigation as any).navigate('RostersStaff');
    }  

    function handleInstructions() {
        console.log('Navigating to instructions');
        (navigation as any).navigate('Instructions');
    }

    async function handleLogout() {
        if (Platform.OS === 'web') {
            // Use window.confirm on web since Alert.alert callbacks can be unreliable
            const confirmed = window.confirm('Are you sure you want to log out?');
            if (confirmed) {
                try {
                    await signOut();
                } catch (e) {
                    console.error('Logout failed:', e);
                }
            }
        } else {
            Alert.alert(
                'Confirm Logout',
                'Are you sure you want to log out?',
                [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Logout', style: 'destructive', onPress: async () => {
                        try {
                            await signOut();
                        } catch (e) {
                            console.error('Logout failed:', e);
                        }
                    }}
                ]
            );
        }
    }

    

    return (
        <View style={styles.container}>
            <View style={styles.containerBox}>
                <Text style={styles.title}>Emergency Management</Text>
                <Text style={styles.caption}>From here you can initiate alerts and your class roster(s)</Text>
                <View style={{ height: 16 }} />
                <Button title="Initiate Alert" onPress={handleAlertInitiation} />
                <View style={{ height: 16 }} />
                <Button title="View Class Roster" onPress={handleViewClassRoster} />
                <View style={{ height: 16 }} />
                <Button title="Instructions" onPress={handleInstructions} />
                <View style={{ height: 16 }} />
            </View>
            <View style={{ height: 32 }} />
            <View style={{width: '100%', maxWidth: 400}}>
                <Button title="Logout" onPress={handleLogout} />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#ffffffff',
    },
    containerBox: {
        width: '100%',
        maxWidth: 400,
        padding: 16,
        borderRadius: 8,
        borderColor: '#000',
        borderWidth: 1,
        backgroundColor: '#f9f9f9',
        elevation: 2,
    },
    title: {
        fontSize: 24,
        marginBottom: 16,
        textAlign: 'center',
    },
        caption: {
        fontSize: 12,
        color: '#666',
        marginBottom: 8,
        textAlign: 'center',
    },
});

export default DashboardStaff;