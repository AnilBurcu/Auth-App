import React, {useState, useRef, useEffect} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Animated,
} from 'react-native';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import Ionicons from 'react-native-vector-icons/Ionicons';
import api from '../api/axios';
import * as Keychain from 'react-native-keychain';

const SignUpScreen = ({navigation}) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [secureEntry, setSecureEntry] = useState(true);
  const [resendCooldown, setResendCooldown] = useState(0);

  const [strength, setStrength] = useState('');
  const [barColor, setBarColor] = useState('#ccc');
  const strengthBar = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    let timer;
    if (resendCooldown > 0) {
      timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [resendCooldown]);

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

  const handleSignUp = async () => {
    if (!name || !email || !password) {
      return Alert.alert('Missing Fields', 'Please fill in all fields.');
    }

    if (password.length < 6) {
      return Alert.alert(
        'Weak Password',
        'Password must be at least 6 characters long.',
      );
    }

    try {
      const response = await api.post('/auth/sign-up', {
        name,
        email,
        password,
      });

      if (response.data?.data?.accessToken) {
        const {accessToken, refreshToken, user} = response.data.data;

        await Keychain.setGenericPassword('access', accessToken);
        await Keychain.setInternetCredentials('refresh', 'user', refreshToken);

        Alert.alert('Success', `Welcome, ${user.name}!`);
        navigation.replace('Home');
      } else {
        Alert.alert(
          'Sign Up Successful',
          `A verification link was sent to ${email}. Please check your inbox.`,
        );
        navigation.replace('SignIn');
      }
    } catch (error) {
      console.error('❌ Sign up error:', error.response?.data || error.message);
      const errorMsg = error.response?.data?.message || 'Something went wrong.';

      if (errorMsg.includes('not verified')) {
        // 📨 Account exists but not verified
        Alert.alert(
          'Account Not Verified',
          'Would you like to resend the verification email?',
          [
            {text: 'Cancel', style: 'cancel'},
            {
              text:
                resendCooldown > 0 ? `Resend (${resendCooldown}s)` : 'Resend',
              onPress: () => handleResendVerification(),
              disabled: resendCooldown > 0,
            },
          ],
        );
      } else if (errorMsg.includes('User already exists')) {
        // 🛑 Account exists and verified
        Alert.alert(
          'Account Already Exists',
          'This email is already registered and verified. Forgot your password?',
          [
            {text: 'Cancel', style: 'cancel'},
            {
              text: 'Reset Password',
              onPress: () => navigation.navigate('RequestReset'), // 👈 your forgot password screen
            },
          ],
        );
      } else {
        // Other errors
        Alert.alert('Sign Up Failed', errorMsg);
      }
    }
  };

  const handleResendVerification = async () => {
    if (resendCooldown > 0) return;

    try {
      await api.post('/auth/resend-verification', {email});
      Alert.alert(
        'Success',
        'Verification email resent. Please check your inbox.',
      );
      setResendCooldown(60); // 🎯 Start 60 second cooldown
    } catch (err) {
      console.error('❌ Resend error:', err.response?.data || err.message);
      Alert.alert('Error', 'Failed to resend verification email.');
    }
  };

  return (
    <View style={styles.background}>
      <View style={styles.container}>
        <Text style={styles.title}>Create Account</Text>
        <Text style={styles.subtitle}>Sign up to get started</Text>

        {/* Name */}
        <View style={styles.inputContainer}>
          <FontAwesome5
            name="user"
            size={16}
            color="rgba(0,0,0,0.4)"
            style={styles.icon}
          />
          <TextInput
            placeholder="Name"
            value={name}
            onChangeText={setName}
            style={styles.input}
          />
        </View>

        {/* Email */}
        <View style={styles.inputContainer}>
          <FontAwesome5
            name="envelope"
            size={16}
            color="rgba(0,0,0,0.4)"
            style={styles.icon}
          />
          <TextInput
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            style={styles.input}
          />
        </View>

        {/* Password */}
        <View style={styles.inputContainer}>
          <FontAwesome5
            name="lock"
            size={16}
            color="rgba(0,0,0,0.4)"
            style={styles.icon}
          />
          <TextInput
            placeholder="Password"
            secureTextEntry={secureEntry}
            value={password}
            onChangeText={text => {
              setPassword(text);
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
        {password.length > 0 && (
          <Text style={styles.strengthLabel}>{strength}</Text>
        )}

        {/* Signup Button */}
        <TouchableOpacity style={styles.signUpButton} onPress={handleSignUp}>
          <Text style={styles.signUpButtonText}>Create Account</Text>
        </TouchableOpacity>

        {/* Sign In link */}
        <View style={styles.signinContainer}>
          <Text>Already have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('SignIn')}>
            <Text style={styles.signInText}>Sign In</Text>
          </TouchableOpacity>
        </View>

        {/* Optional: Show resend timer manually */}
        {resendCooldown > 0 && (
          <Text style={{marginTop: 10, color: '#999'}}>
            You can resend in {resendCooldown}s
          </Text>
        )}
      </View>
    </View>
  );
};

export default SignUpScreen;

const styles = StyleSheet.create({
  background: {
    flex: 1,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  container: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 8},
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
    alignItems: 'center',
  },
  title: {
    fontSize: 30,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#2b3b42',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 30,
    textAlign: 'center',
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
  icon: {
    marginRight: 10,
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
    color: '#555',
    fontSize: 14,
    marginBottom: 20,
    marginTop: -4,
  },
  signUpButton: {
    backgroundColor: '#2b3b42',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    width: '100%',
    marginBottom: 20,
  },
  signUpButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  signinContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  signInText: {
    color: '#007bff',
    fontWeight: '600',
  },
});
