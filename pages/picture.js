import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Image, Alert, TouchableOpacity, Button } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { firestore, storage } from '../config/firebaseConfig';
import UploadImage from '../components/uploadimage';

const PictureScreen = () => {
  const [selectedMonth, setSelectedMonth] = useState('');
  const [picturesData, setPicturesData] = useState([]);
  const [captionVisible, setCaptionVisible] = useState(true);

  const fetchPictures = async () => {
    try {
      const snapshot = await firestore.collection('pictures').get();
      const pictures = snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(picture => !picture.id.startsWith('http')); // filtrerar ut ogiltliga id
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

  const handleUploadSuccess = async (urls, caption) => {
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
        };
        batch.set(docRef, newPicture);
      });
      await batch.commit();
  
      // hämtar uppdateringar från firebase
      fetchPictures();
  
      console.log('Pictures added successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to save picture data.');
      console.error('Error saving picture data:', error);
    }
  };
  
//BILDER
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
  
  
//BILDTEXT
  const handleDeleteCaption = async (id) => {
    try {
      if (!id || id.startsWith('http')) {
        throw new Error(`Invalid document ID: ${id}`);
      }
      console.log(`Trying to delete caption for picture with id: ${id}`);

      // kontrollerar bildtexten finns i firebase
      const docRef = firestore.collection('pictures').doc(id);
      const doc = await docRef.get();
      if (!doc.exists) {
        throw new Error(`Document does not exist: ${id}`);
      }

      // uppdaterar firebase
      await docRef.update({ caption: '' });
      console.log(`Caption deleted for picture with id: ${id}`);

      // uppdaterar
      fetchPictures();
      Alert.alert('Success', 'Caption deleted successfully.');
    } catch (error) {
      Alert.alert('Error', error.message);
      console.error('Error deleting caption:', error.message);
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

  const renderItem = ({ item, index }) => {
    console.log('Rendering item:', item);
    return (
      <View style={styles.imageContainer}>
        {index === 0 && item.caption && (
          <View style={styles.captionContainer}>
            <Text style={styles.caption}>{item.caption}</Text>
            <Button title="Ta bort text" onPress={() => handleDeleteCaption(item.id)} />
          </View>
        )}
        <Image source={{ uri: item.uri }} style={styles.image} resizeMode="contain" />
        <TouchableOpacity
          style={styles.deleteIcon}
          onPress={() => handleDeletePicture(item.id, item.uri)}
        >
          <Icon name="close" size={24} color="red" />
        </TouchableOpacity>
      </View>
    );
  };

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
  imageContainer: {
    width: '100%',
    height: 400,
    marginBottom: 20,
    justifyContent: 'center',
    alignItems: 'center',
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
  caption: {
    fontSize: 16,
    fontStyle: 'italic',
  },
  image: {
    width: '100%',
    height: '100%',
    margin: 10,
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
