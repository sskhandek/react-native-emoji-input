import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import {
    View,
    Text,
    TextInput,
    Dimensions,
    TouchableOpacity,
    TouchableWithoutFeedback,
    AsyncStorage,
    StyleSheet,
    Image,
} from 'react-native';
import {
    RecyclerListView,
    DataProvider,
    LayoutProvider
} from 'recyclerlistview';
import { Icon } from 'react-native-elements';
import emoji from 'emojilib';
import _ from 'lodash';
import {
    responsiveFontSize,
    responsiveHeight,
    responsiveWidth
} from 'react-native-responsive-dimensions';
import Wade from 'wade';

import emojiSynonyms from './emojiSynonyms.json';
import userInputEmojiSynonyms from './userInputtedSynonyms.json';

EMOJI_DATASOURCE_VERSION = '4.0.4';

class Emoji extends PureComponent {
    static propTypes = {
        data: PropTypes.shape({
            char: PropTypes.char,
        }),
        onPress: PropTypes.func.isRequired,
        size: PropTypes.number,
        native: PropTypes.bool,
        style: PropTypes.object,
        set: PropTypes.string,
    }

    static defaultProps = {
        native: true,
        set: 'apple',
    }

    constructor(props) {
        super(props);
    }

    _getImage = data => {
        const { set } = this.props;

        let image = '';

        let imageSource = {
            uri: `https://unpkg.com/emoji-datasource-${set}@${EMOJI_DATASOURCE_VERSION}/img/${set}/64/${image}`,
        };

        return imageSource;
    }

    render() {
        let imageComponent = null;

        const { native, style, labelStyle, data, onPress, size } = this.props;

        if (!native) {
            const emojiImageFile = this._getImage(data);

            const imageStyle = {
                width: this.props.size,
                height: this.props.size,
            };

            imageComponent = (
                <Image
                    style={imageStyle}
                    source={emojiImageFile}
                />
            )
        }

        const emojiComponent = (
            <View style={StyleSheet.flatten([ styles.emojiWrapper, style ])}>
                { native ? (
                    <Text
                        style={StyleSheet.flatten([
                            styles.labelStyle,
                            {
                                fontSize: size,
                            }
                        ])}
                    >
                        {data.char}
                    </Text>
                ) : (
                    imageComponent
                ) }
            </View>
        );

        return onPress ? (
            <TouchableOpacity
                style={styles.emojiWrapper}
                onPress={() => {
                    console.log(data);
                    onPress(data);
                }}
            >
                {emojiComponent}
            </TouchableOpacity>
        ) : (
            emojiComponent
        );
    }
};

const styles = StyleSheet.create({
    emojiWrapper: {
        justifyContent: 'space-around',
        alignItems: 'center',
        flex: 1
    },
    labelStyle: {
        color: 'black',
        fontWeight: 'bold'
    },
});

export default Emoji;
