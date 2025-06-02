import React, {useEffect, useState} from 'react';
import {NavigationContainer, CommonActions} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import * as Keychain from 'react-native-keychain';
import {jwtDecode} from 'jwt-decode';
import {ActivityIndicator, View} from 'react-native';
import SignInScreen from './src/screens/SignInScreen';
import HomeScreen from './src/screens/HomeScreen';
import {navigationRef} from './src/navigation/RootNavigation';
import SignUpScreen from './src/screens/SignUpScreen';
import RequestResetScreen from './src/screens/RequestScreen';
import ResetOtpScreen from './src/screens/ResetOtpScreen';

const Stack = createNativeStackNavigator();

type DecodedToken = {
  userId: string;
  exp: number;
  iat?: number;
};

export default function App() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAccessToken = async () => {
      try {
        const credentials = await Keychain.getGenericPassword();

        if (credentials) {
          const token = credentials.password;
          const decoded = jwtDecode<DecodedToken>(token);
          const now = Date.now() / 1000;

          if (decoded.exp > now) {
            // ✅ Redirect to Home
            navigationRef.current?.dispatch(
              CommonActions.reset({
                index: 0,
                routes: [{name: 'Home'}],
              }),
            );
          } else {
            console.log('🕒 Token expired');
            navigationRef.current?.dispatch(
              CommonActions.reset({
                index: 0,
                routes: [{name: 'SignIn'}],
              }),
            );
          }
        } else {
          console.log('❌ No token found');
          navigationRef.current?.dispatch(
            CommonActions.reset({
              index: 0,
              routes: [{name: 'SignIn'}],
            }),
          );
        }
      } catch (error) {
        console.error('Token check failed:', error);
        navigationRef.current?.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [{name: 'SignIn'}],
          }),
        );
      } finally {
        setIsLoading(false);
      }
    };

    checkAccessToken();
  }, []);

  if (isLoading) {
    return (
      <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <NavigationContainer ref={navigationRef}>
      <Stack.Navigator screenOptions={{headerShown: false}}>
        <Stack.Screen name="SignIn" component={SignInScreen} />
        <Stack.Screen name="SignUp" component={SignUpScreen} />
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="RequestReset" component={RequestResetScreen} />
        <Stack.Screen name="ResetOtp" component={ResetOtpScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
