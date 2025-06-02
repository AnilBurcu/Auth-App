import * as Keychain from 'react-native-keychain';
import axios from 'axios';
import {navigate} from '../navigation/RootNavigation';

const rawApi = axios.create({
  baseURL: 'http://192.168.1.10:5500/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

export const refreshAccessToken = async () => {
  try {
    const creds = await Keychain.getInternetCredentials('refresh');
    const refreshToken = creds?.password;

    if (!refreshToken) throw new Error('No refresh token available');

    const response = await rawApi.post('/auth/refresh-token', {
      refreshToken,
    });

    const {accessToken} = response.data.data;

    // 🔐 Store new accessToken
    await Keychain.setGenericPassword('access', accessToken);

    return accessToken;
  } catch (error) {
    console.error(
      '🔁 Refresh token error:',
      error.response?.data || error.message,
    );

    // Clear tokens and redirect
    await Keychain.resetGenericPassword();
    await Keychain.resetInternetCredentials('refresh');

    navigate('SignIn'); // or whatever your login screen is named

    throw error;
  }
};
