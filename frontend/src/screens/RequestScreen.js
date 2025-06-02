import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import api from '../api/axios';

const RequestResetScreen = ({navigation}) => {
  const [email, setEmail] = useState('');
  const [timer, setTimer] = useState(0);
  const [isSending, setIsSending] = useState(false);

  const handleRequestReset = async () => {
    if (!email.trim()) {
      return Alert.alert('Missing Email', 'Please enter your email.');
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return Alert.alert(
        'Invalid Email',
        'Please enter a valid email address.',
      );
    }

    setIsSending(true);

    try {
      const response = await api.post('/auth/request-reset-otp', {email});

      if (response.data.success) {
        Alert.alert('Success', response.data.message, [
          {
            text: 'OK',
            onPress: () => {
              // 👇 Navigate to ResetOtpScreen and pass email
              navigation.navigate('ResetOtp', {email});
            },
          },
        ]);
        setTimer(120);
      } else {
        Alert.alert('Error', 'Unexpected response. Try again.');
        setIsSending(false);
      }
    } catch (error) {
      console.error('❌ Request Error:', error);
      const errorMsg =
        error.response?.data?.message ||
        'Cannot connect to server. Please try again later.';
      Alert.alert('Error', errorMsg);
      setIsSending(false);
    }
  };

  useEffect(() => {
    let interval;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer(prev => prev - 1);
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [timer]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Request Password Reset</Text>

      <TextInput
        placeholder="Enter your email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        style={styles.input}
      />

      <TouchableOpacity
        style={[
          styles.button,
          (timer > 0 || isSending) && {backgroundColor: '#ccc'},
        ]}
        onPress={handleRequestReset}
        disabled={timer > 0 || isSending}
        activeOpacity={0.8}>
        <Text style={styles.buttonText}>
          {timer > 0 ? `Resend available in ${timer}s` : 'Send Reset Link'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default RequestResetScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 24,
    textAlign: 'center',
    color: '#2b3b42',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
    backgroundColor: '#f1f1f1',
  },
  button: {
    backgroundColor: '#2b3b42',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
});
