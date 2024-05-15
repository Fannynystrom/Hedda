import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity } from 'react-native';

const EventsScreen = () => {
  const [eventText, setEventText] = useState('');
  const [events, setEvents] = useState([]);

  const handleSaveEvent = () => {
    if (eventText.trim() !== '') {
      setEvents([...events, eventText]);
      setEventText('');
    }
  };

  const handleRemoveEvent = indexToRemove => {
    const updatedEvents = events.filter((_, index) => index !== indexToRemove);
    setEvents(updatedEvents);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Händelser</Text>

      {/* Inmatningsruta för att skriva in nya händelser */}
      <TextInput
        style={styles.input}
        value={eventText}
        onChangeText={text => setEventText(text)}
        placeholder="Skriv in en ny händelse"
      />
      <TouchableOpacity onPress={handleSaveEvent}>
        <Text style={styles.saveButton}>Spara</Text>
      </TouchableOpacity>

      {/* Visa sparade händelser */}
      {events.map((event, index) => (
        <View key={index} style={styles.eventContainer}>
          <Text style={styles.eventText}>{event}</Text>
          <TouchableOpacity onPress={() => handleRemoveEvent(index)}>
            <Text style={styles.removeButton}>Ta bort</Text>
          </TouchableOpacity>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'rgb(241, 226, 207)',
    margin: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    width: '100%',
    borderWidth: 1,
    borderColor: 'gray',
    marginBottom: 10,
    padding: 10,
    borderRadius: 5,
  },
  saveButton: {
    fontSize: 16,
    color: 'blue',
    marginBottom: 20,
  },
  eventContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'gray',
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
  },
  eventText: {
    flex: 1,
    fontSize: 16,
  },
  removeButton: {
    color: 'red',
    marginLeft: 10,
  },
});

export default EventsScreen;
