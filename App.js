/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

import React, { Component } from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import {
    RecyclerListView,
    DataProvider,
    LayoutProvider,
} from 'recyclerlistview';
import emoji from 'emojilib';

const category = [{}];

class EmojiInput extends PureComponent {
    constructor(props) {
        super(props);

        let dataProvider = new DataProvider((e1, e2) => {
            return e1.char !== e2.char;
        });

        this._layoutProvider = new LayoutProvider(
            () => {},
            (type, dim) => {
                dim.height = dim.width = 100;
            }
        );

        this._rowRenderer = this._rowRenderer.bind(this);

        this.state = {
            dataProvider: dataProvider.cloneWithRows(emoji.lib),
        };
    }

    _rowRenderer(type, data) {
        <View>
            <Text>{data.char}</Text>
        </View>;
    }

    render() {
        return (
            <RecyclerListView
                layoutProvider={this._layoutProvider}
                dataProvider={this.state.dataProvider}
                rowRenderer={this._rowRenderer}
            />
        );
    }
}

type Props = {};
export default class App extends Component<Props> {
    render() {
        return (
            <View style={styles.container}>
                <EmojiInput />
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F5FCFF',
    },
});
