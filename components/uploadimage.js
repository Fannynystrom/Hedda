import React, { useState } from 'react';
import { View, Button, Image, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { storage } from '../config/firebaseConfig';

const UploadImage = ({ onUploadSuccess }) => {
  const [image, setImage] = useState(null);
  const [uploading, setUploading] = useState(false);

  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    console.log('Permission result:', permissionResult);

    if (!permissionResult.granted) {
      alert('Permission to access media library is required!');
      return;
    }

    try {
      const pickerResult = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false, // Disable cropping
        aspect: [4, 3],
        quality: 1,
      });

      console.log('Picker result:', pickerResult);

      if (!pickerResult.canceled) {
        const pickedImageUri = pickerResult.assets[0].uri;
        console.log('Image picked:', pickedImageUri);
        setImage(pickedImageUri);
      } else {
        console.log('Image picking cancelled');
      }
    } catch (error) {
      console.error('Error picking image:', error);
      alert('Error picking image: ' + error.message);
    }
  };

  const uploadImage = async () => {
    if (!image) return;

    try {
      console.log('Starting upload for image:', image);
      const response = await fetch(image);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const blob = await response.blob();
      const ref = storage.ref().child(`images/${Date.now()}`);

      setUploading(true);
      const snapshot = await ref.put(blob);
      const url = await snapshot.ref.getDownloadURL();

      console.log('Image uploaded successfully! URL:', url);
      setUploading(false);
      alert('Image uploaded successfully! URL: ' + url);
      setImage(null);
      onUploadSuccess(url);
    } catch (error) {
      setUploading(false);
      alert('Image upload failed: ' + error.message);
      console.error('Error uploading image:', error);
    }
  };

  return (
    <View style={styles.container}>
      <Button title="Pick an image from camera roll" onPress={pickImage} />
      {image && <Image source={{ uri: image }} style={styles.image} />}
      {uploading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        <Button title="Upload Image" onPress={uploadImage} />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    width: 200,
    height: 200,
    marginTop: 20,
  },
});

export default UploadImage;

