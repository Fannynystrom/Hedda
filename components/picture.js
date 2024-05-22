import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, Image, Button } from 'react-native';
import { Picker } from '@react-native-picker/picker';

const picturesData = [
  { id: '1', month: 'January', uri: require('../assets/näsa.jpg') },
  { id: '2', month: 'February', uri: require('../assets/alfons.jpg') },
  { id: '3', month: 'March', uri: require('../assets/HEDDA2.png') },
  // Lägg till fler bilder här
];

const PictureScreen = () => {
  const [selectedMonth, setSelectedMonth] = useState('Alla bilder');

  const filteredPictures = selectedMonth === 'Alla bilder'
    ? picturesData
    : picturesData.filter(picture => picture.month === selectedMonth);

  const uploadImage = () => {
    // Denna funktion gör ingenting för nu, eftersom vi inte laddar upp bilder
    console.log('Upload image button pressed');
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
      <Button title="Upload Image" onPress={uploadImage} />
      <FlatList
        data={filteredPictures}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Image source={item.uri} style={styles.image} />
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
