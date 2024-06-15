import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Image, Alert, TouchableOpacity, TextInput, Button } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { firestore, storage } from '../config/firebaseConfig';
import UploadImage from '../components/uploadimage';

const PictureScreen = () => {
  const [selectedMonth, setSelectedMonth] = useState('');
  const [picturesData, setPicturesData] = useState([]);
  const [caption, setCaption] = useState('');
  const [editingCaption, setEditingCaption] = useState(false);
  const [newCaption, setNewCaption] = useState('');

  const fetchPictures = async () => {
    try {
      const snapshot = await firestore.collection('pictures').get();
      const pictures = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      console.log('Fetched pictures:', pictures);
      setPicturesData(pictures);
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch pictures.');
      console.error('Error fetching pictures:', error);
    }
  };

  useEffect(() => {
    fetchPictures();
    setSelectedMonth(getMonthName(new Date().getMonth())); // sätter aktuell månad 
  }, []);

  const getMonthName = (monthIndex) => {
    const months = [
      'Januari', 'Februari', 'Mars', 'April', 'Maj', 'Juni',
      'Juli', 'Augusti', 'September', 'Oktober', 'November', 'December'
    ];
    return months[monthIndex];
  };

  const handleUploadSuccess = async (urls, caption, creator) => {
    const date = new Date();
    const currentMonth = getMonthName(date.getMonth());
  
    try {
      const batch = firestore.batch();
      urls.forEach(url => {
        const docRef = firestore.collection('pictures').doc(); // genererar ett unikt id
        const newPicture = {
          month: currentMonth,
          uri: url,
          caption,
          creator: creator || 'Anonym', // Om namnet inte är ifyllt, använd "Anonym"
          date: date.toLocaleDateString(),
        };
        batch.set(docRef, newPicture);
      });
      await batch.commit();
  
      // hämtar uppdateringar från firebase
      fetchPictures();
      setCaption(caption);
  
      console.log('Pictures added successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to save picture data.');
      console.error('Error saving picture data:', error);
    }
  };

  // BILDER
  const handleDeletePicture = async (id, uri) => {
    Alert.alert(
      'Bekräfta borttagning',
      'Vill du radera bilden?',
      [
        {
          text: 'Nej',
          style: 'cancel',
        },
        {
          text: 'Ja',
          onPress: async () => {
            try {
              if (!id || id.startsWith('http')) {
                throw new Error(`Invalid document ID: ${id}`);
              }
              console.log(`Trying to delete picture with id: ${id} and uri: ${uri}`);
  
              // kontrollerar om bilden finns i firebase
              const docRef = firestore.collection('pictures').doc(id);
              const doc = await docRef.get();
              if (!doc.exists) {
                throw new Error(`Document does not exist: ${id}`);
              }
  
              // filnamnet från url
              const fileName = decodeURIComponent(uri.split('/o/')[1].split('?')[0]);
              const imageRef = storage.ref().child(fileName);
  
              // raderar i storage 
              await imageRef.delete();
              console.log(`Deleted picture from Storage with uri: ${uri}`);
  
              // raderar i firebase
              await docRef.delete();
              console.log(`Deleted picture from Firestore with id: ${id}`);
  
              // uppdaterar
              fetchPictures();
              Alert.alert('Success', 'Picture deleted successfully.');
            } catch (error) {
              Alert.alert('Error', error.message);
              console.error('Error deleting picture:', error.message);
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  // BILDTEXT
  const handleDeleteCaption = async () => {
    try {
      const batch = firestore.batch();
      const snapshot = await firestore.collection('pictures').where('caption', '==', caption).get();
      snapshot.forEach(doc => {
        batch.update(doc.ref, { caption: '' });
      });
      await batch.commit();

      setCaption('');
      fetchPictures();
      Alert.alert('Success', 'Caption deleted successfully.');
    } catch (error) {
      Alert.alert('Error', 'Failed to delete caption.');
      console.error('Error deleting caption:', error);
    }
  };

  const handleEditCaption = () => {
    setEditingCaption(true);
    setNewCaption(caption);
  };

  const handleSaveCaption = async () => {
    try {
      const batch = firestore.batch();
      const snapshot = await firestore.collection('pictures').where('caption', '==', caption).get();
      snapshot.forEach(doc => {
        batch.update(doc.ref, { caption: newCaption });
      });
      await batch.commit();

      setCaption(newCaption);
      setEditingCaption(false);
      fetchPictures();
      Alert.alert('Success', 'Caption updated successfully.');
    } catch (error) {
      Alert.alert('Error', 'Failed to update caption.');
      console.error('Error updating caption:', error);
    }
  };

  const filteredPictures = selectedMonth === 'Alla bilder'
    ? picturesData
    : picturesData.filter(picture => picture.month === selectedMonth);

  const groupedPictures = filteredPictures.reduce((acc, picture) => {
    const key = `${picture.caption}-${picture.creator}-${picture.date}`;
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(picture);
    return acc;
  }, {});

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

  const renderItem = ({ item }) => {
    const firstPicture = item[0];
    const { date, caption, creator } = firstPicture;
    const images = item.map(picture => picture.uri);
    return (
      <View style={styles.postContainer}>
        <View style={styles.captionContainer}>
          {editingCaption ? (
            <>
              <TextInput
                style={styles.captionInput}
                value={newCaption}
                onChangeText={setNewCaption}
              />
              <Button title="Spara" onPress={handleSaveCaption} />
            </>
          ) : (
            <>
              <Text style={styles.caption}>{caption}</Text>
              <Button title="Redigera text" onPress={handleEditCaption} />
            </>
          )}
          <Button title="Ta bort text" onPress={handleDeleteCaption} />
        </View>
        {images.map((uri, index) => (
          <View key={index} style={styles.imageContainer}>
            <Image source={{ uri }} style={styles.image} resizeMode="contain" />
            <TouchableOpacity
              style={styles.deleteIcon}
              onPress={() => handleDeletePicture(firstPicture.id, uri)}
            >
              <Icon name="close" size={24} color="red" />
            </TouchableOpacity>
          </View>
        ))}
        <View style={styles.footer}>
          <Text style={styles.creator}>Skapad av: {creator}</Text>
          <Text style={styles.date}>Datum: {date}</Text>
        </View>
      </View>
    );
  };

  return (
    <FlatList
      ListHeaderComponent={renderHeader}
      data={Object.values(groupedPictures)}
      keyExtractor={(item) => item[0].id}
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
  postContainer: {
    borderWidth: 1,
    borderColor: 'gray',
    borderRadius: 10,
    padding: 10,
    marginBottom: 20,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 2,
  },
  imageContainer: {
    width: '100%',
    marginBottom: 20,
    position: 'relative',
  },
  captionContainer: {
    padding: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 5,
    marginBottom: 10,
    width: '100%',
    alignItems: 'center',
  },
  captionInput: {
    fontSize: 16,
    borderColor: 'gray',
    borderWidth: 1,
    padding: 5,
    width: '100%',
  },
  caption: {
    fontSize: 16,
    fontStyle: 'italic',
  },
  image: {
    width: '100%',
    height: 400,
  },
  footer: {
    marginTop: 10,
    alignItems: 'flex-start',
  },
  creator: {
    fontSize: 14,
    color: 'gray',
  },
  date: {
    fontSize: 14,
    color: 'gray',
  },
  deleteIcon: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderRadius: 12,
    padding: 5,
  },
});

export default PictureScreen;
