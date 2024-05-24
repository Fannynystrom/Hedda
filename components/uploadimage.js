import React, { useState, useEffect } from 'react';
import { View, Button, Image, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { storage, auth } from '../config/firebaseConfig';

const UploadImage = () => {
  const [image, setImage] = useState(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    (async () => {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission to access media library is required!');
      }
    })();
  }, []);

  const pickImage = async () => {
    if (!auth.currentUser) {
      Alert.alert('Error', 'You must be logged in to upload images.');
      return;
    }

    try {
      const pickerResult = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      if (!pickerResult.cancelled) {
        setImage(pickerResult.uri);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick image: ' + error.message);
      console.error('Error picking image:', error);
    }
  };

  const uploadImage = async () => {
    if (!image) return;

    try {
      const response = await fetch(image);
      const blob = await response.blob();
      const ref = storage.ref().child(`images/${Date.now()}`);

      setUploading(true);
      const snapshot = await ref.put(blob);
      const url = await snapshot.ref.getDownloadURL();

      setUploading(false);
      alert('Image uploaded successfully! URL: ' + url);
      setImage(null);
    } catch (error) {
      setUploading(false);
      Alert.alert('Error', 'Image upload failed: ' + error.message);
      console.error('Error uploading image:', error);
    }
  };

  return (
    <View style={styles.container}>
      <Button title="Välj en bild från dina bilder" onPress={pickImage} />
      {image && <Image source={{ uri: image }} style={styles.image} />}
      {uploading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        <Button title=" Ladda upp bild" onPress={uploadImage} />
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
