// pages/CalendarScreen.js
import React, { useState, useEffect } from 'react';
import { View, Text, Button, TextInput, StyleSheet, FlatList, Alert, Platform } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { firestore } from '../config/firebaseConfig';

const CalendarScreen = () => {
  const [selectedDate, setSelectedDate] = useState('');
  const [eventTitle, setEventTitle] = useState('');
  const [eventTime, setEventTime] = useState('');
  const [eventText, setEventText] = useState('');
  const [events, setEvents] = useState({});

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const snapshot = await firestore.collection('events').get();
        const eventsData = snapshot.docs.reduce((acc, doc) => {
          const { date, title, time, text } = doc.data();
          if (!acc[date]) {
            acc[date] = { marked: true, events: [] };
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
          updatedEvents[selectedDate] = { marked: true, events: [] };
        }
        updatedEvents[selectedDate].events.push({ id: docRef.id, ...newEvent });
        return updatedEvents;
      });
      setEventTitle('');
      setEventTime('');
      setEventText('');
      Alert.alert('Success', 'Event added successfully.');
    } catch (error) {
      Alert.alert('Error', 'Failed to add event.');
      console.error('Error adding event:', error);
    }
  };

  useEffect(() => {
    if (selectedDate) {
      const fetchEventsForDate = async () => {
        try {
          const snapshot = await firestore.collection('events').where('date', '==', selectedDate).get();
          const eventsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          setEvents((prevEvents) => ({
            ...prevEvents,
            [selectedDate]: { marked: true, events: eventsData },
          }));
        } catch (error) {
          Alert.alert('Error', 'Failed to fetch events.');
          console.error('Error fetching events:', error);
        }
      };

      fetchEventsForDate();
    }
  }, [selectedDate]);

  return (
    <View style={styles.container}>
      <Calendar
        onDayPress={(day) => setSelectedDate(day.dateString)}
        markedDates={Object.keys(events).reduce((acc, date) => {
          acc[date] = { marked: true };
          return acc;
        }, {})}
      />
      <TextInput
        style={styles.input}
        placeholder="Event title"
        value={eventTitle}
        onChangeText={setEventTitle}
      />
      <TextInput
        style={styles.input}
        placeholder="Event time (HH:MM)"
        value={eventTime}
        onChangeText={setEventTime}
      />
      <TextInput
        style={styles.input}
        placeholder="Event details"
        value={eventText}
        onChangeText={setEventText}
      />
      <Button title="Add Event" onPress={handleAddEvent} />
      {selectedDate && events[selectedDate] && (
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
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: 'white',
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 10,
    paddingHorizontal: 10,
  },
  eventItem: {
    padding: 10,
    borderBottomColor: 'gray',
    borderBottomWidth: 1,
  },
  eventTitle: {
    fontWeight: 'bold',
  },
});

export default CalendarScreen;
