import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Image, Button, Alert } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import * as ImagePicker from 'expo-image-picker';
import { firestore, storage } from '../config/firebaseConfig';

const PictureScreen = () => {
  const [selectedMonth, setSelectedMonth] = useState('Alla bilder');
  const [picturesData, setPicturesData] = useState([]);

  useEffect(() => {
    const fetchPictures = async () => {
      const snapshot = await firestore.collection('pictures').get();
      const pictures = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setPicturesData(pictures);
    };

    fetchPictures();
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

    if (!result.cancelled) {
      const imageUrl = await uploadImage(result.uri);
      if (imageUrl) {
        const newPicture = { month: selectedMonth, uri: imageUrl };
        await firestore.collection('pictures').add(newPicture);
        setPicturesData([...picturesData, { id: newPicture.uri, ...newPicture }]);
      }
    }
  };

  const uploadImage = async (uri) => {
    const response = await fetch(uri);
    const blob = await response.blob();
    const ref = storage.ref().child(`images/${Date.now()}`);
    const snapshot = await ref.put(blob);
    const url = await snapshot.ref.getDownloadURL();
    return url;
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
        <Picker.Item label="January" value="January" />
        <Picker.Item label="February" value="February" />
        <Picker.Item label="March" value="March" />
        {/* Lägg till fler månader här */}
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
