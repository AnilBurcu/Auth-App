import React from 'react';
import {View, Text, StyleSheet, Modal} from 'react-native';

const NotificationToast = ({visible, type, message}) => {
  return (
    <Modal transparent visible={visible} animationType="fade">
      <View style={styles.overlay}>
        <View
          style={[
            styles.toast,
            type === 'error' ? styles.error : styles.success,
          ]}>
          <Text style={styles.title}>
            {type === 'error' ? '❌ Error' : '✅ Success'}
          </Text>
          <Text style={styles.message}>{message}</Text>
        </View>
      </View>
    </Modal>
  );
};

export default NotificationToast;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  toast: {
    padding: 20,
    borderRadius: 8,
    width: '80%',
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 6,
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  success: {
    borderColor: '#2ecc71',
    borderLeftWidth: 6,
  },
  error: {
    borderColor: '#e74c3c',
    borderLeftWidth: 6,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  message: {
    fontSize: 14,
    textAlign: 'center',
  },
});
