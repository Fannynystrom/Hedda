import React, { useState } from 'react';
import { View, Text, Image, StyleSheet, ActivityIndicator, Alert, TextInput, ScrollView, TouchableOpacity } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { storage } from '../config/firebaseConfig';

const UploadImage = ({ onUploadSuccess }) => {
  const [images, setImages] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [caption, setCaption] = useState('');
  const [creator, setCreator] = useState('');

  const pickImages = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      alert('Permission to access media library is required!');
      return;
    }

    try {
      const pickerResult = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true,
        allowsEditing: false,
        aspect: [4, 3],
        quality: 1,
      });

      if (!pickerResult.cancelled) {
        setImages(pickerResult.assets);
      }
    } catch (error) {
      console.error('Error picking images:', error);
      alert('Error picking images: ' + error.message);
    }
  };

  const uploadImages = async () => {
    if (images.length === 0) return;

    try {
      setUploading(true);
      const uploadedUrls = await Promise.all(images.map(async (image) => {
        const response = await fetch(image.uri);
        const blob = await response.blob();
        const ref = storage.ref().child(`images/${Date.now()}-${image.uri.split('/').pop()}`);
        const snapshot = await ref.put(blob);
        return await snapshot.ref.getDownloadURL();
      }));

      setUploading(false);
      setImages([]);
      setCaption('');
      setCreator('');
      onUploadSuccess(uploadedUrls, caption, creator);
    } catch (error) {
      setUploading(false);
      alert('Image upload failed: ' + error.message);
      console.error('Error uploading images:', error);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <TouchableOpacity style={styles.button} onPress={pickImages}>
        <Text style={styles.buttonText}>Välj bilder från kamerarulle</Text>
      </TouchableOpacity>
      {images.length > 0 && (
        <ScrollView horizontal>
          {images.map((image, index) => (
            <Image key={index} source={{ uri: image.uri }} style={styles.image} />
          ))}
        </ScrollView>
      )}
      <TextInput
        style={styles.input}
        placeholder="Enter caption (optional)"
        value={caption}
        onChangeText={setCaption}
      />
      <TextInput
        style={styles.input}
        placeholder="Enter your name"
        value={creator}
        onChangeText={setCreator}
      />
      {uploading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        <TouchableOpacity style={styles.button} onPress={uploadImages}>
          <Text style={styles.buttonText}>Ladda upp inlägg</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: 'white',
  },
  image: {
    width: 100,
    height: 100,
    marginRight: 10,
    marginTop: 10,
  },
  button: {
    backgroundColor: '#b7ebed',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 5,
    marginHorizontal: 5,
    marginVertical: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: 'black',
    fontWeight: 'bold',
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 10,
    paddingHorizontal: 10,
    marginTop: 10,
  },
});

export default UploadImage;
