import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Button,
} from 'react-native';
import api from '../api/axios';
import * as Keychain from 'react-native-keychain';
import {CommonActions} from '@react-navigation/native';
import {navigationRef} from '../navigation/RootNavigation'; // adjust path if needed

const HomeScreen = () => {
  const [user, setUser] = useState(null);

  // ✅ Fetch current user data from protected endpoint
  const fetchUser = async () => {
    try {
      const creds = await Keychain.getGenericPassword();
      console.log('📥 Token from Keychain:', creds?.password);

      const response = await api.get('/users/me');
      setUser(response.data.user);
    } catch (err) {
      console.error('❌ Fetch error:', err.response?.data || err.message);
      Alert.alert('Error', 'Failed to fetch user data.');
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  // 🔐 Logout: Clear tokens and reset navigation to SignIn
  const handleLogout = async () => {
    try {
      // 🧹 Clear secure tokens from Keychain
      await Keychain.resetGenericPassword();
      await Keychain.resetInternetCredentials('refresh');

      // 🔄 Reset navigation stack to prevent going back to Home
      if (navigationRef.isReady()) {
        navigationRef.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [{name: 'SignIn'}],
          }),
        );
      } else {
        console.warn('Navigation is not ready yet');
      }
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  if (!user) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" />
        <Text>Loading your data...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.welcome}>Welcome, {user.name} 👋</Text>
      <Text style={styles.email}>Email: {user.email}</Text>
      <Text style={styles.id}>ID: {user._id}</Text>

      {/* 🚪 Logout button */}
      <Button title="Logout" onPress={handleLogout} />
    </View>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  welcome: {
    fontSize: 26,
    marginBottom: 10,
  },
  email: {
    fontSize: 18,
  },
  id: {
    fontSize: 14,
    color: '#666',
    marginTop: 10,
  },
});
