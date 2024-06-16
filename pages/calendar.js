import React, { useState, useEffect } from 'react';
import { View, Text, Button, TextInput, StyleSheet, FlatList, Alert, Modal, TouchableOpacity, ScrollView } from 'react-native';
import { Calendar, LocaleConfig } from 'react-native-calendars';
import { firestore } from '../config/firebaseConfig';
import Icon from 'react-native-vector-icons/MaterialIcons';

LocaleConfig.locales['sv'] = {
  monthNames: ['Januari', 'Februari', 'Mars', 'April', 'Maj', 'Juni', 'Juli', 'Augusti', 'September', 'Oktober', 'November', 'December'],
  monthNamesShort: ['Jan', 'Feb', 'Mar', 'Apr', 'Maj', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dec'],
  dayNames: ['Söndag', 'Måndag', 'Tisdag', 'Onsdag', 'Torsdag', 'Fredag', 'Lördag'],
  dayNamesShort: ['Sön', 'Mån', 'Tis', 'Ons', 'Tor', 'Fre', 'Lör'],
  today: 'Idag'
};
LocaleConfig.defaultLocale = 'sv';

const CalendarScreen = () => {
  const [selectedDate, setSelectedDate] = useState('');
  const [eventTitle, setEventTitle] = useState('');
  const [eventTime, setEventTime] = useState('');
  const [eventText, setEventText] = useState('');
  const [events, setEvents] = useState({});
  const [modalVisible, setModalVisible] = useState(false);
  const [showEventForm, setShowEventForm] = useState(false);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const snapshot = await firestore.collection('events').get();
        const eventsData = snapshot.docs.reduce((acc, doc) => {
          const { date, title, time, text } = doc.data();
          if (!acc[date]) {
            acc[date] = { marked: true, dotColor: 'blue', events: [] };
          }
          acc[date].events.push({ id: doc.id, title, time, text });
          return acc;
        }, {});
        setEvents(eventsData);
      } catch (error) {
        Alert.alert('Error', 'Failed to fetch events.');
        console.error('Error fetching events:', error);
      }
    };

    fetchEvents();
  }, []);

  const handleAddEvent = async () => {
    if (!selectedDate || !eventTitle || !eventTime || !eventText) {
      Alert.alert('Error', 'Please fill all the fields.');
      return;
    }

    const newEvent = { date: selectedDate, title: eventTitle, time: eventTime, text: eventText };
    try {
      const docRef = await firestore.collection('events').add(newEvent);
      setEvents((prevEvents) => {
        const updatedEvents = { ...prevEvents };
        if (!updatedEvents[selectedDate]) {
          updatedEvents[selectedDate] = { marked: true, dotColor: 'blue', events: [] };
        }
        updatedEvents[selectedDate].events.push({ id: docRef.id, ...newEvent });
        return updatedEvents;
      });
      setEventTitle('');
      setEventTime('');
      setEventText('');
      setShowEventForm(false);
      setModalVisible(false);
      Alert.alert('Success', 'Event added successfully.');
    } catch (error) {
      Alert.alert('Error', 'Failed to add event.');
      console.error('Error adding event:', error);
    }
  };

  const handleDayPress = (day) => {
    setSelectedDate(day.dateString);
    if (events[day.dateString] && events[day.dateString].events.length > 0) {
      setShowEventForm(false);
    } else {
      setShowEventForm(true);
    }
    setModalVisible(true);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Kalender</Text>
      <Calendar
        onDayPress={handleDayPress}
        markedDates={Object.keys(events).reduce((acc, date) => {
          if (events[date] && events[date].events.length > 0) {
            acc[date] = { marked: true, dotColor: 'blue' };
          }
          return acc;
        }, {})}
        theme={{
          calendarBackground: 'white',
          textSectionTitleColor: 'black',
          todayTextColor: 'red',
          dayTextColor: 'black',
          textDayFontSize: 16, // Större siffror
          textMonthFontSize: 20, // Större månadsnamn
          textDayHeaderFontSize: 16, // Större dagarsnamn
          dotColor: 'blue',
          selectedDotColor: 'blue',
          dotStyle: {
            width: 10,
            height: 10,
            borderRadius: 5,
            marginVertical: 1,
          },
          'stylesheet.day.basic': {
            base: {
              width: 32,
              height: 32,
              alignItems: 'center',
              justifyContent: 'center',
            },
            text: {
              marginTop: 6,
              fontSize: 16,
              fontWeight: 'bold',
            }
          }
        }}
      />
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <TouchableOpacity style={styles.closeButton} onPress={() => setModalVisible(false)}>
              <Icon name="close" size={24} color="black" />
            </TouchableOpacity>
            {showEventForm ? (
              <ScrollView>
                <TextInput
                  style={[styles.input, styles.inputTitle]}
                  placeholder="Rubrik"
                  value={eventTitle}
                  onChangeText={setEventTitle}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Välj en tid för händelsen (HH:MM)"
                  value={eventTime}
                  onChangeText={setEventTime}
                />
                <TextInput
                  style={[styles.input, styles.inputText]}
                  placeholder="Beskrivning"
                  value={eventText}
                  onChangeText={setEventText}
                  multiline={true}
                />
                <Button title="Lägg till event" onPress={handleAddEvent} />
              </ScrollView>
            ) : (
              <>
                <Text style={styles.dateTitle}>{`Events for ${selectedDate}`}</Text>
                {events[selectedDate] && events[selectedDate].events.length > 0 ? (
                  <FlatList
                    data={events[selectedDate].events}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                      <View style={styles.eventItem}>
                        <Text style={styles.eventTitle}>{item.title}</Text>
                        <Text>{item.time}</Text>
                        <Text>{item.text}</Text>
                      </View>
                    )}
                  />
                ) : (
                  <Text>Inga händelser denna dag.</Text>
                )}
                <Button title="Lägg till en händelse" onPress={() => setShowEventForm(true)} />
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: 'white',
  },
  header: {
    fontSize: 30,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  dateTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    marginTop: 30,
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 10,
    paddingHorizontal: 10,
    width: '100%',
  },
  inputTitle: {
    fontSize: 20,
  },
  inputText: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  eventItem: {
    padding: 10,
    borderBottomColor: 'gray',
    borderBottomWidth: 1,
    marginBottom: 20,
  },
  eventTitle: {
    fontWeight: 'bold',
    fontSize: 18,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '90%',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
  },
  closeButton: {
    alignSelf: 'flex-end',
  },
});

export default CalendarScreen;
