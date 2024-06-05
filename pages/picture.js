import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Image, Alert } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { firestore } from '../config/firebaseConfig';
import UploadImage from '../components/uploadimage';

const PictureScreen = () => {
  const [selectedMonth, setSelectedMonth] = useState('');
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
    setSelectedMonth(getMonthName(new Date().getMonth())); // Set initial month to the current month
  }, []);

  const getMonthName = (monthIndex) => {
    const months = [
      'Januari', 'Februari', 'Mars', 'April', 'Maj', 'Juni',
      'Juli', 'Augusti', 'September', 'Oktober', 'November', 'December'
    ];
    return months[monthIndex];
  };

  const handleUploadSuccess = async (urls, caption) => {
    const date = new Date();
    const currentMonth = getMonthName(date.getMonth());

    const newPictures = urls.map(url => ({
      id: `${url}-${Date.now()}`, 
      month: currentMonth,
      uri: url,
      caption
    }));

    try {
      const batch = firestore.batch();
      newPictures.forEach(picture => {
        const docRef = firestore.collection('pictures').doc();
        batch.set(docRef, picture);
      });
      await batch.commit();
      setPicturesData([...picturesData, ...newPictures]);
      console.log('Pictures added successfully:', newPictures);
    } catch (error) {
      Alert.alert('Error', 'Failed to save picture data.');
      console.error('Error saving picture data:', error);
    }
  };

  const filteredPictures = selectedMonth === 'Alla bilder'
    ? picturesData
    : picturesData.filter(picture => picture.month === selectedMonth);

  const renderHeader = () => (
    <View style={styles.headerContainer}>
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
        <Picker.Item label="Augusti" value="Augusti" />
        <Picker.Item label="September" value="September" />
        <Picker.Item label="Oktober" value="Oktober" />
        <Picker.Item label="November" value="November" />
        <Picker.Item label="December" value="December" />
      </Picker>
      <UploadImage onUploadSuccess={handleUploadSuccess} />
    </View>
  );

  const renderItem = ({ item }) => (
    <View>
      <View style={styles.imageContainer}>
        {item.caption && (
          <Text style={styles.caption}>{item.caption}</Text>
        )}
        <Image source={{ uri: item.uri }} style={styles.image} resizeMode="contain" />
      </View>
    </View>
  );

  return (
    <FlatList
      ListHeaderComponent={renderHeader}
      data={filteredPictures}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      contentContainerStyle={styles.container}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: 'white',
  },
  headerContainer: {
    marginBottom: 20,
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
  monthHeader: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  imageContainer: {
    width: '100%',
    height: 400, 
    marginBottom: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  caption: {
    fontSize: 16,
    fontStyle: 'italic',
    marginBottom: 5,
  },
  image: {
    width: '100%',
    height: '100%',
  },
});

export default PictureScreen;
