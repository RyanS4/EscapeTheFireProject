import {View, Text, TextInput, Button, StyleSheet} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import { useAuth } from '../contexts/AuthContext';
import React from 'react';


const StudentRoster = () => {
    
    const navigation = useNavigation();
    const { isAdmin } = useAuth();

    const handleReturnToDashboard = () => {
        if (isAdmin && isAdmin()) {
            (navigation as any).navigate('DashboardAdmin');
        } else {
            (navigation as any).navigate('DashboardStaff');
        }
    };

    return (<View>
        <Button title="Return to Dashboard" onPress={handleReturnToDashboard} />
    </View>);
}

export default StudentRoster;