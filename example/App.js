/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

import React, { Component } from 'react';
import { Platform, StyleSheet, Text, View, ToastAndroid } from 'react-native';
import EmojiInput from './src/EmojiInput';

type Props = {};
export default class App extends Component<Props> {
    constructor() {
        super();

        this.state = {
            currentEmoji: 'X',
            reset: false,
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
                <Text onPress={() => { this._emojiInput.clearFrequentlyUsedEmoji(); }}>
                    Remove Frequently Used Emoji
                </Text>
                <Text onPress={() => {
                    if (this.state.reset) {
                        this.setState({ reset: false })
                    } else {
                        this.setState({ reset: true })
                    }
                }}>
                    Clear
                </Text>
                <EmojiInput
                    onEmojiSelected={this.handleEmojiSelected}
                    ref={emojiInput => this._emojiInput = emojiInput}
                    resetSearch={this.state.reset}
                    loggingFunction={this.loggingFunction.bind(this)}
                    verboseLoggingFunction={this.verboseLoggingFunction.bind(this)}
                />
            </View>
        );
    }

    loggingFunction(text) {
        console.log(text)
    }
    verboseLoggingFunction(text,type) {
        console.log(text,type)
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'flex-start',
        alignItems: 'center',
    }
});
