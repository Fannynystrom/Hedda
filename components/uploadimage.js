import React, { useState } from 'react';
import { View, Button, Image, StyleSheet, ActivityIndicator, Alert, TextInput, ScrollView } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { storage } from '../config/firebaseConfig';

const UploadImage = ({ onUploadSuccess }) => {
  const [images, setImages] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [caption, setCaption] = useState('');

  const pickImages = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      alert('Permission to access media library is required!');
      return;
    }

    try {
      const pickerResult = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true, // aktiverar flera val
        allowsEditing: false,
        aspect: [4, 3],
        quality: 1,
      });

      if (!pickerResult.cancelled) {
        console.log('Images picked:', pickerResult.assets);
        setImages(pickerResult.assets);
      } else {
        console.log('Image picking cancelled');
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
        console.log('Uploading image:', image.uri);
        const response = await fetch(image.uri);
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const blob = await response.blob();
        const ref = storage.ref().child(`images/${Date.now()}-${image.uri.split('/').pop()}`);
        const snapshot = await ref.put(blob);
        const url = await snapshot.ref.getDownloadURL();
        console.log('Uploaded image URL:', url);
        return url;
      }));

      setUploading(false);
      setImages([]);
      setCaption('');
      onUploadSuccess(uploadedUrls, caption);
    } catch (error) {
      setUploading(false);
      alert('Image upload failed: ' + error.message);
      console.error('Error uploading images:', error);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Button title="Pick images from camera roll" onPress={pickImages} />
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
      {uploading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        <Button title="Upload Images" onPress={uploadImages} />
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
