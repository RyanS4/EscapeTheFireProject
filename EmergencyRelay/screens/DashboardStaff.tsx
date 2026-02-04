import {View, Text, TextInput, Button, StyleSheet} from 'react-native';
import React, {useState} from 'react';

const DashboardStaff = () => {
    return (
        <View style={styles.container}>
            <Button title="Initiate Alert" onPress={() => { /* Handle alert initiation */ }} />
            <View style={{ height: 16 }} />
            <Button title="View Class Roster" onPress={() => { /* Handle view class roster */ }} />
            <View style={{ height: 16 }} />
            <Button title="Logout" onPress={() => { /* Handle logout */ }} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#7afa9aff',
    },
    title: {
        fontSize: 24,
        marginBottom: 16,
        textAlign: 'center',
    },
});

export default DashboardStaff;