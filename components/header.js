import React from 'react';
import { Image, View, StyleSheet } from 'react-native';
import RubrikImage from '../img/RubrikImage.png';

const Header = () => {
  return (
    <View style={styles.headerContainer}>
    <Image source={RubrikImage}

        style={styles.headerImage}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    width: '100%',
    padding: 10,
    backgroundColor: 'rgb(229, 220, 208)',
  },
  headerImage: {
    width: '100%',
    height: 200, // Anpassa efter behov
    resizeMode: 'contain',
  }
});

export default Header;
