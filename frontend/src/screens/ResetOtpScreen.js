import React, {useRef, useState, useEffect} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Animated,
  Keyboard,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import api from '../api/axios';

const ResetOtpScreen = ({navigation, route}) => {
  const [email] = useState(route.params?.email || '');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [newPassword, setNewPassword] = useState('');
  const [secureEntry, setSecureEntry] = useState(true);
  const [counter, setCounter] = useState(120); // 2 minutes
  const [strength, setStrength] = useState('');
  const [barColor, setBarColor] = useState('#ccc');
  const strengthBar = useRef(new Animated.Value(0)).current;
  const inputs = useRef([]);

  useEffect(() => {
    let timer;
    if (counter > 0) {
      timer = setTimeout(() => setCounter(prev => prev - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [counter]);

  const evaluateStrength = password => {
    let score = 0;
    if (password.length >= 6) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    Animated.timing(strengthBar, {
      toValue: score / 4,
      duration: 300,
      useNativeDriver: false,
    }).start();

    if (score <= 1) {
      setStrength('Weak');
      setBarColor('#e74c3c');
    } else if (score === 2 || score === 3) {
      setStrength('Medium');
      setBarColor('#f39c12');
    } else {
      setStrength('Strong');
      setBarColor('#2ecc71');
    }
  };

  const handleChangeOtp = (text, index) => {
    if (text.length > 1) text = text.charAt(0);

    const newOtp = [...otp];
    newOtp[index] = text;
    setOtp(newOtp);

    if (text && index < 5 && text) {
      inputs.current[index + 1]?.focus();
    } else if (!text && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  };

  const handleVerifyOtp = async () => {
    const fullOtp = otp.join('');

    if (!fullOtp || !newPassword.trim()) {
      return Alert.alert('Missing Fields', 'Please fill all the fields.');
    }

    if (fullOtp.length !== 6) {
      return Alert.alert('Invalid OTP', 'Please enter the full 6-digit OTP.');
    }

    if (newPassword.length < 6) {
      return Alert.alert(
        'Weak Password',
        'Password must be at least 6 characters.',
      );
    }

    try {
      const response = await api.post('/auth/verify-reset-otp', {
        email,
        otp: fullOtp,
        newPassword,
      });

      Alert.alert('Success', response.data.message);
      navigation.replace('SignIn');
    } catch (err) {
      console.error('❌', err);
      const errorMsg =
        err.response?.data?.message || 'OTP Verification failed.';
      Alert.alert('Error', errorMsg);
    }
  };

  const handleResendOtp = async () => {
    try {
      await api.post('/auth/request-reset-otp', {email});
      Alert.alert('Success', 'OTP resent successfully.');
      setCounter(120); // restart 2 minutes
    } catch (err) {
      console.error('❌', err);
      Alert.alert('Error', 'Failed to resend OTP.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Reset Your Password</Text>
      <Text style={styles.subtitle}>Enter the 6-digit code sent to</Text>
      <Text style={styles.emailText}>{email}</Text>

      <View style={styles.otpContainer}>
        {otp.map((digit, index) => (
          <TextInput
            key={index}
            ref={ref => (inputs.current[index] = ref)}
            value={digit}
            onChangeText={text => handleChangeOtp(text, index)}
            keyboardType="numeric"
            maxLength={1}
            style={styles.otpBox}
          />
        ))}
      </View>

      <TouchableOpacity
        disabled={counter > 0}
        onPress={handleResendOtp}
        style={styles.resendButton}>
        <Text style={{color: counter > 0 ? 'gray' : '#007bff'}}>
          {counter > 0
            ? `Resend OTP in ${Math.floor(counter / 60)}:${String(
                counter % 60,
              ).padStart(2, '0')}`
            : 'Resend OTP'}
        </Text>
      </TouchableOpacity>

      {/* New Password */}
      <View style={styles.inputContainer}>
        <TextInput
          placeholder="New Password"
          secureTextEntry={secureEntry}
          value={newPassword}
          onChangeText={text => {
            setNewPassword(text);
            evaluateStrength(text);
          }}
          style={styles.input}
        />
        <TouchableOpacity onPress={() => setSecureEntry(!secureEntry)}>
          <Ionicons
            name={secureEntry ? 'eye-off' : 'eye'}
            size={18}
            color="rgba(0,0,0,0.4)"
            style={{marginRight: 8}}
          />
        </TouchableOpacity>
      </View>

      {/* Password Strength */}
      <View style={styles.strengthContainer}>
        <Animated.View
          style={[
            styles.strengthBar,
            {
              width: strengthBar.interpolate({
                inputRange: [0, 1],
                outputRange: ['0%', '100%'],
              }),
              backgroundColor: barColor,
            },
          ]}
        />
      </View>
      {newPassword.length > 0 && (
        <Text style={styles.strengthLabel}>{strength}</Text>
      )}

      <TouchableOpacity style={styles.submitButton} onPress={handleVerifyOtp}>
        <Text style={styles.submitButtonText}>Submit</Text>
      </TouchableOpacity>
    </View>
  );
};

export default ResetOtpScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
    backgroundColor: '#ffffff',
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 4,
    color: '#2b3b42',
  },
  subtitle: {
    textAlign: 'center',
    color: '#666',
    fontSize: 14,
  },
  emailText: {
    textAlign: 'center',
    color: '#2b3b42',
    fontSize: 16,
    marginBottom: 24,
    fontWeight: '600',
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  otpBox: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    width: 50,
    height: 55,
    textAlign: 'center',
    fontSize: 20,
    backgroundColor: '#f1f1f1',
  },
  resendButton: {
    alignSelf: 'center',
    marginBottom: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f1f1',
    borderRadius: 10,
    marginBottom: 15,
    paddingHorizontal: 12,
    width: '100%',
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
  },
  strengthContainer: {
    height: 10,
    width: '100%',
    backgroundColor: '#eee',
    borderRadius: 5,
    overflow: 'hidden',
    marginBottom: 8,
  },
  strengthBar: {
    height: 10,
    borderRadius: 5,
  },
  strengthLabel: {
    textAlign: 'right',
    fontSize: 14,
    color: '#555',
    marginBottom: 20,
  },
  submitButton: {
    backgroundColor: '#2b3b42',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
