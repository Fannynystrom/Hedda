import React, { useState, useEffect } from 'react';
import { View, Text, Button, TextInput, StyleSheet, FlatList, Alert, Modal, TouchableOpacity, ScrollView, Platform } from 'react-native';
import { Calendar, LocaleConfig } from 'react-native-calendars';
import { firestore } from '../config/firebaseConfig';
import Icon from 'react-native-vector-icons/MaterialIcons';
import DateTimePicker from '@react-native-community/datetimepicker';

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
  const [eventTime, setEventTime] = useState(new Date());
  const [eventText, setEventText] = useState('');
  const [events, setEvents] = useState({});
  const [modalVisible, setModalVisible] = useState(false);
  const [showEventForm, setShowEventForm] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

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

    const newEvent = { date: selectedDate, title: eventTitle, time: eventTime.toTimeString().slice(0, 5), text: eventText };
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
      setEventTime(new Date());
      setEventText('');
      setShowEventForm(false);
      setModalVisible(false);
      Alert.alert('Success', 'Event added successfully.');
    } catch (error) {
      Alert.alert('Error', 'Failed to add event.');
      console.error('Error adding event:', error);
    }
  };

  const handleEditEvent = (event) => {
    setEventTitle(event.title);
    setEventTime(new Date(event.time));
    setEventText(event.text);
    setShowEventForm(true);
  };

  const handleDeleteEvent = async (eventId) => {
    try {
      await firestore.collection('events').doc(eventId).delete();
      setEvents((prevEvents) => {
        const updatedEvents = { ...prevEvents };
        const eventDate = Object.keys(updatedEvents).find(date => updatedEvents[date].events.some(event => event.id === eventId));
        if (eventDate) {
          updatedEvents[eventDate].events = updatedEvents[eventDate].events.filter(event => event.id !== eventId);
          if (updatedEvents[eventDate].events.length === 0) {
            delete updatedEvents[eventDate];
          }
        }
        return updatedEvents;
      });
      Alert.alert( 'Händelse raderat.');
    } catch (error) {
      Alert.alert('Error', 'Det gick inte att radera händelse.');
      console.error('Error deleting event:', error);
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

  const handleTimeChange = (event, selectedTime) => {
    const currentTime = selectedTime || eventTime;
    setShowTimePicker(false);
    setEventTime(currentTime);
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
          todayTextColor: 'black',
          dayTextColor: 'black',
          textDayFontSize: 20, // Större siffror
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
            //varje ruta i kalendern
            base: {
              width: 50, // bredden på varje ruta
              height: 70, //  Höjden på varje ruta här
              alignItems: 'center',
              justifyContent: 'center',
              borderWidth: 1, // Kantlinje runt varje datumruta
              borderColor: 'lightgray', // Färg på kantlinje
            },
            selected: {
              backgroundColor: '#ffeb3b',
              borderRadius: 0,
            },
            today: {
              backgroundColor: 'lightgray',
              borderRadius: 0,
            },
            text: {
              marginTop: 6,
              fontSize: 16,
              fontWeight: 'bold',
            }
          },
          'stylesheet.calendar.header': {
            week: {
              marginTop: 5,
              flexDirection: 'row',
              justifyContent: 'space-around',
              borderWidth: 1,
              borderColor: 'lightgray',
            },
            dayHeader: {
              fontSize: 16,
              fontWeight: 'bold',
              color: 'black',
              marginTop: 5,
              marginBottom: 10,
            },
            dayTextAtIndex0: {
              color: 'black',
            },
            dayTextAtIndex6: {
              color: 'black',
            },
          },
        }}
        firstDay={1} // Måndag först
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
                <View style={styles.timePickerContainer}>
                  <TouchableOpacity style={styles.timePickerButton} onPress={() => setShowTimePicker(true)}>
                    <Text style={styles.buttonText}>Välj tid</Text>
                  </TouchableOpacity>

                  {showTimePicker && (
                    <DateTimePicker
                      value={eventTime}
                      mode="time"
                      is24Hour={true}
                      display="default"
                      onChange={handleTimeChange}
                    />
                  )}
                </View>
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
                <Text style={styles.dateTitle}>{` ${selectedDate}`}</Text>
                {events[selectedDate] && events[selectedDate].events.length > 0 ? (
                  <FlatList
                    data={events[selectedDate].events}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                      <View style={styles.eventItem}>
                        <Text style={styles.eventTitle}>{item.title}</Text>
                        <Text style={styles.eventTime}>{item.time}</Text>
                        <Text style={styles.eventText}>{item.text}</Text>
                        {/* Styling för händelseknappar */}
                        <View style={styles.eventButtonsContainer}>
                          <TouchableOpacity onPress={() => handleEditEvent(item)}>
                            <Icon name="edit" size={24} color="blue" />
                          </TouchableOpacity>
                          <TouchableOpacity onPress={() => handleDeleteEvent(item.id)}>
                            <Icon name="delete" size={24} color="red" />
                          </TouchableOpacity>
                        </View>
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
    padding: 5,
    backgroundColor: 'white',
  },
  header: {
    fontSize: 30,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  //dagens datum i alert
  dateTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    marginTop: 0,
  },
    //rubrik
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 10,
    paddingHorizontal: 10,
    width: '100%',

  },
  inputTitle: {
    fontSize: 25,
    fontFamily: Platform.OS === 'ios' ? 'Arial' : 'sans-serif',

  },
  //beskrivning i alert
  inputText: {
    minHeight: 80,
    textAlignVertical: 'top',
    fontFamily: Platform.OS === 'ios' ? 'Arial' : 'sans-serif',
    width: '300',
    fontSize: 25,

  },
  //boxen för händelseb, dvs rubrik tid, beskrivning och iconer
  eventItem: {
    padding: 20,
    borderBottomColor: 'gray',
    marginBottom: 20,

    
  },
  //rubrik i alert
  eventTitle: {
    fontWeight: 'bold',
    fontSize: 29,
    fontFamily: Platform.OS === 'ios' ? 'Arial' : 'sans-serif',
    justifyContent: 'center',

  },
  // tid i alert
  eventTime: {
    fontSize: 22,
    fontFamily: Platform.OS === 'ios' ? 'Arial' : 'sans-serif',
  },
  // beskrivning i alert
  eventText: {
    fontSize: 25,
    fontFamily: Platform.OS === 'ios' ? 'Arial' : 'sans-serif',
    justifyContent: 'center',
  },
  //bakgrunden för alert (de som visas bakom)
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  //alerten med händelsen
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
  //iconerna för redigering och delete
  eventButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 10,
    width: '100%',
    
  },
  eventButton: {
    flex: 1,
    alignItems: 'center',
  },
  timePickerContainer: {
    width: '100%',
    alignItems: 'center',
    marginVertical: 10,
    borderColor: 'gray', // Färg på kantlinjen
    borderWidth: 1, // Kantlinjens tjocklek
    borderRadius: 5, // Rundade hörn på kantlinjen
    paddingVertical: 10, // Vertikal padding inuti rutan
  },
  timePickerButton: {
    backgroundColor: 'white',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    width: '100%',
    alignItems: 'center',
  },
  buttonText: {
    color: 'gray',
    fontWeight: 'bold',
  },
});

export default CalendarScreen;
