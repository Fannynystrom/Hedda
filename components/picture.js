import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Image, Button } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { launchImageLibrary } from 'react-native-image-picker';
import axios from 'axios';
import Config from 'react-native-config';

const PicturesScreen = () => {
  const [selectedMonth, setSelectedMonth] = useState('Alla bilder');
  const [picturesData, setPicturesData] = useState([]);

  useEffect(() => {
    fetchPictures();
  }, []);

  const fetchPictures = async () => {
    try {
      const response = await axios.get(`${Config.API_URL}/pictures`);
      setPicturesData(response.data);
    } catch (error) {
      console.error('Error fetching pictures:', error);
    }
  };

  const uploadImage = async () => {
    launchImageLibrary({}, async (response) => {
      if (response.assets && response.assets.length > 0) {
        const formData = new FormData();
        formData.append('image', {
          uri: response.assets[0].uri,
          type: response.assets[0].type,
          name: response.assets[0].fileName,
        });
        formData.append('month', selectedMonth);

        try {
          await axios.post(`${Config.API_URL}/upload`, formData, {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          });
          fetchPictures();
        } catch (error) {
          console.error('Error uploading image:', error);
        }
      }
    });
  };

  const filteredPictures = selectedMonth === 'Alla bilder'
    ? picturesData
    : picturesData.filter(picture => picture.month === selectedMonth);

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
      </Picker>
      <Button title="Upload Image" onPress={uploadImage} />
      <FlatList
        data={filteredPictures}
        keyExtractor={(item) => item._id}
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

export default PicturesScreen;
