import React, { PureComponent } from 'react';
import { View } from 'react-native';

class EmojiInput extends PureComponent {
    constructor() {
        super();
        this.state = {
            searchQuery: '',
            selectedIndex: 0,
        };
    }

    render() {
        return <View style={this.props.style} />;
    }
}

export default EmojiInput;
