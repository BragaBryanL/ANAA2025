import React, { useState } from 'react';
import { View, Text, TextInput, Button, Alert, StyleSheet, TouchableOpacity } from 'react-native';
import axios from 'axios';

const HomeScreen = ({ route, navigation }) => {
  const { user } = route.params || {};
  const { facultyInfo } = user || {};

  const [formData, setFormData] = useState({
    firstname: '',
    middle: '',
    lastname: '',
    age: '',
    rfid: '',
    status: '',
  });

  const [status, setStatus] = useState(facultyInfo?.availability || '');

  const updateAvailability = async (newStatus) => {
    try {
      const response = await axios.put(
        `http://172.22.25.154:3001/update-availability/${facultyInfo.id}`,
        { availability: newStatus }
      );
      console.log('Availability updated:', response.data);
      setStatus(newStatus);
    } catch (error) {
      console.error('Error updating availability:', error);
      Alert.alert('Error', 'Failed to update status');
    }
  };

  if (!facultyInfo) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Enter Faculty Info</Text>

        <TextInput
          style={styles.input}
          placeholder="First Name"
          value={formData.firstname}
          onChangeText={(text) => setFormData({ ...formData, firstname: text })}
        />
        <TextInput
          style={styles.input}
          placeholder="Middle Name"
          value={formData.middle}
          onChangeText={(text) => setFormData({ ...formData, middle: text })}
        />
        <TextInput
          style={styles.input}
          placeholder="Last Name"
          value={formData.lastname}
          onChangeText={(text) => setFormData({ ...formData, lastname: text })}
        />
        <TextInput
          style={styles.input}
          placeholder="Age"
          keyboardType="numeric"
          value={formData.age}
          onChangeText={(text) => setFormData({ ...formData, age: text })}
        />
        <TextInput
          style={styles.input}
          placeholder="RFID"
          value={formData.rfid}
          onChangeText={(text) => setFormData({ ...formData, rfid: text })}
        />
        <TextInput
          style={styles.input}
          placeholder="Status"
          value={formData.status}
          onChangeText={(text) => setFormData({ ...formData, status: text })}
        />

        <Button
          title="Submit"
          onPress={() => {
            console.log('User Info Submitted:', formData);
            navigation.goBack();
          }}
          color="#4CAF50"
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Change your status, {facultyInfo.firstname}?</Text>
        <View style={styles.infoGroup}>
          <Text style={styles.infoLabel}>Email:</Text>
          <Text style={styles.infoValue}>{user.email}</Text>
        </View>
        <View style={styles.separator} />
        <View style={styles.infoGroup}>
          <Text style={styles.infoLabel}>First Name:</Text>
          <Text style={styles.infoValue}>{facultyInfo.firstname}</Text>
        </View>
        <View style={styles.separator} />
        <View style={styles.infoGroup}>
          <Text style={styles.infoLabel}>Last Name:</Text>
          <Text style={styles.infoValue}>{facultyInfo.lastname}</Text>
        </View>
        <View style={styles.separator} />
        <View style={styles.infoGroup}>
          <Text style={styles.infoLabel}>RFID:</Text>
          <Text style={styles.infoValue}>{facultyInfo.rfid}</Text>
        </View>
      </View>

      <View style={styles.statusCard}>
        <Text style={styles.statusTitle}>Change Status:</Text>
        <View style={styles.statusContainer}>
          <TouchableOpacity
            style={[styles.statusButton, status === '1' && styles.statusAvailable]}
            onPress={() => updateAvailability('1')}
          >
            <Text style={styles.statusText}>Available</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.statusButton, status === '2' && styles.statusBusy]}
            onPress={() => updateAvailability('2')}
          >
            <Text style={styles.statusText}>Busy</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.statusButton, status === '0' && styles.statusOffline]}
            onPress={() => updateAvailability('0')}
          >
            <Text style={styles.statusText}>Offline</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.separator} />
        <Text style={styles.currentStatus}>Current Status: {status === '1' ? 'Available' : status === '2' ? 'Busy' : 'Offline'}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#001f3f',
  },
  card: {
    backgroundColor: '#003366',
    padding: 20,
    borderRadius: 10,
    width: '100%',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#FFDC00',
    textAlign: 'left',
  },
  infoGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 5,
  },
  infoLabel: {
    fontSize: 18,
    color: '#FFDC00',
  },
  infoValue: {
    fontSize: 18,
    color: '#FFFFFF',
  },
  separator: {
    height: 1,
    backgroundColor: '#FFDC00',
    marginVertical: 10,
  },
  statusCard: {
    backgroundColor: '#003366',
    padding: 20,
    borderRadius: 10,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  statusTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#FFDC00',
    textAlign: 'center',
  },
  statusContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 10,
  },
  statusButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    backgroundColor: '#444',
  },
  statusAvailable: {
    backgroundColor: '#2ECC40',
  },
  statusBusy: {
    backgroundColor: '#FF851B',
  },
  statusOffline: {
    backgroundColor: '#FF4136',
  },
  statusText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  currentStatus: {
    fontSize: 18,
    color: '#FFDC00',
    textAlign: 'center',
    marginTop: 10,
  },
  input: {
    width: '90%',
    padding: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginVertical: 10,
    backgroundColor: '#fff',
    fontSize: 16,
    color: '#333',
  },
});

export default HomeScreen;
