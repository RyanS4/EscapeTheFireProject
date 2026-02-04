import {View, Text, TextInput, Button, StyleSheet} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import React, {useState} from 'react';

const DashboardStaff = () => {
    
    const navigation = useNavigation();

    function handleAlertInitiation() {
        // Handle alert initiation logic here
        console.log('Alert initiated');
    }   

    function handleViewClassRoster() {
        // Handle view class roster logic here
        console.log('Viewing class roster');
    }  

    function handleLogout() {
        // Handle logout logic here
        console.log('Logging out');
        (navigation as any).replace('Login');
    }

    return (
        <View style={styles.container}>
            <Button title="Initiate Alert" onPress={handleAlertInitiation} />
            <View style={{ height: 16 }} />
            <Button title="View Class Roster" onPress={handleViewClassRoster} />
            <View style={{ height: 16 }} />
            <Button title="Logout" onPress={handleLogout} />
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
    title: {
        fontSize: 24,
        marginBottom: 16,
        textAlign: 'center',
    },
});

export default DashboardStaff;