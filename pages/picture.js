import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Image, Button, Alert, Platform } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import * as ImagePicker from 'expo-image-picker';
import { firestore, storage } from '../config/firebaseConfig';
import UploadImage from '../components/uploadimage';

const PictureScreen = () => {
  const [selectedMonth, setSelectedMonth] = useState('Alla bilder');
  const [picturesData, setPicturesData] = useState([]);

  useEffect(() => {
    const fetchPictures = async () => {
      try {
        const snapshot = await firestore.collection('pictures').get();
        const pictures = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setPicturesData(pictures);
      } catch (error) {
        Alert.alert('Error', 'Failed to fetch pictures.');
        console.error('Error fetching pictures:', error);
      }
    };

    fetchPictures();
  }, []);

  useEffect(() => {
    (async () => {
      if (Platform.OS !== 'web') {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Sorry, we need camera roll permissions to make this work!');
        }
      }
    })();
  }, []);

  const filteredPictures = selectedMonth === 'Alla bilder'
    ? picturesData
    : picturesData.filter(picture => picture.month === selectedMonth);

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      const imageUrl = await uploadImage(result.uri);
      if (imageUrl) {
        const newPicture = { month: selectedMonth, uri: imageUrl };
        try {
          await firestore.collection('pictures').add(newPicture);
          setPicturesData([...picturesData, { id: newPicture.uri, ...newPicture }]);
        } catch (error) {
          Alert.alert('Error', 'Failed to save picture data.');
          console.error('Error saving picture data:', error);
        }
      } else {
        Alert.alert('Error', 'Failed to upload image.');
      }
    }
  };

  const uploadImage = async (uri) => {
    try {
      const response = await fetch(uri);
      const blob = await response.blob();
      const ref = storage.ref().child(`images/${Date.now()}`);
      const snapshot = await ref.put(blob);
      const url = await snapshot.ref.getDownloadURL();
      return url;
    } catch (error) {
      Alert.alert('Error', 'Failed to upload image.');
      console.error('Error uploading image:', error);
      return null;
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Bilder</Text>
      <Picker
        selectedValue={selectedMonth}
        onValueChange={(itemValue) => setSelectedMonth(itemValue)}
        style={styles.picker}
      >
        <Picker.Item label="Alla bilder" value="Alla bilder" />
        <Picker.Item label="Januari" value="Januari" />
        <Picker.Item label="Februari" value="Februari" />
        <Picker.Item label="Mars" value="Mars" />
        <Picker.Item label="April" value="April" />
        <Picker.Item label="Maj" value="Maj" />
        <Picker.Item label="Juni" value="Juni" />
        <Picker.Item label="Juli" value="Juli" />
        <Picker.Item label="Augisti" value="Augusti" />
        <Picker.Item label="September" value="September" />
        <Picker.Item label="Oktober" value="Oktober" />
        <Picker.Item label="November" value="November" />
        <Picker.Item label="December" value="December" />
      </Picker>

      <Button title="Upload Image" onPress={pickImage} />
      <FlatList
        data={filteredPictures}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Image source={{ uri: item.uri }} style={styles.image} />
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: 'white',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  picker: {
    height: 50,
    width: '100%',
    marginBottom: 20,
  },
  image: {
    width: '100%',
    height: 200,
    marginBottom: 20,
  },
});

export default PictureScreen;
