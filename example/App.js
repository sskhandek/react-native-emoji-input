/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

import React, { Component } from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import EmojiInput from './src/EmojiInput';

type Props = {};
export default class App extends Component<Props> {
  constructor() {
    super();

    this.state = {
      currentEmoji: 'X'
    }
  }

  handleEmojiSelected = (emoji) => {
    this.setState({ currentEmoji: emoji.char });
  }

  render() {
    return (
      <View style={styles.container}>
        <Text style={{
          fontSize: 50,
          textAlign: 'center',
          margin: 50,
          color: 'black'
        }}>
          {this.state.currentEmoji}
        </Text>
        <EmojiInput onEmojiSelected={this.handleEmojiSelected}/>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
  }
});
