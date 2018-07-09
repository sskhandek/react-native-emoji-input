import React from 'react';
import PropTypes from 'prop-types';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import _ from 'lodash';

const EMOJI_DATASOURCE_VERSION = '4.0.4';

class Emoji extends React.PureComponent {
    static propTypes = {
        data: PropTypes.shape({
            char: PropTypes.char,
            unified: PropTypes.char
        }),
        onPress: PropTypes.func,
        onLongPress: PropTypes.func,
        native: PropTypes.bool,
        size: PropTypes.number,
        style: PropTypes.object,
        labelStyle: PropTypes.object
    };

    static defaultProps = {
        native: true
    };

    _getImage = data => {
        let localImage = _.get(data, 'localImage');
        if (localImage) return localImage;

        let image = _.get(data, 'lib.image');
        let imageSource = localImage || {
            uri: `https://unpkg.com/emoji-datasource-apple@${EMOJI_DATASOURCE_VERSION}/img/apple/64/${image}`
        };
        return imageSource;
    };

    render() {
        let imageComponent = null;

        const {
            native,
            style,
            labelStyle,
            data,
            onPress,
            onLongPress
        } = this.props;

        if (!native) {
            const emojiImageFile = this._getImage(data);

            const imageStyle = {
                width: this.props.size,
                height: this.props.size
            };

            imageComponent = (
                <Image style={imageStyle} source={emojiImageFile} />
            );
        } else {
            if (!data.char) {
                data.char = data.unified.replace(/(^|-)([a-z0-9]+)/gi, (s, b, cp) =>
                    String.fromCodePoint(parseInt(cp, 16))
                );
            }
        }

        const emojiComponent = (
            <View style={StyleSheet.flatten([styles.emojiWrapper, style])}>
                {native ? (
                    <Text
                        style={StyleSheet.flatten([
                            styles.labelStyle,
                            labelStyle,
                            {
                                fontSize: this.props.size
                            }
                        ])}
                    >
                        {data.char}
                    </Text>
                ) : (
                    imageComponent
                )}
            </View>
        );

        return onPress || onLongPress ? (
            <TouchableOpacity
                style={styles.emojiWrapper}
                onPress={evt => {
                    onPress && onPress(data, evt);
                }}
                onLongPress={evt => {
                    onLongPress && onLongPress(data, evt);
                }}
            >
                {emojiComponent}
            </TouchableOpacity>
        ) : (
            emojiComponent
        );
    }
}

const styles = StyleSheet.create({
    emojiWrapper: {
        justifyContent: 'space-around',
        alignItems: 'center',
        flex: 1
    },
    labelStyle: {
        color: 'black',
        fontWeight: 'bold'
    }
});

export default Emoji;
