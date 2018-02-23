import React, { PureComponent } from 'react';
import ReactNative from 'react-native';
import { ButtonGroup, Icon } from 'react-native-elements';
const {
    StyleSheet,
    View,
    Text,
    TouchableOpacity,
    TextInput,
    SectionList,
} = ReactNative;
import PropTypes from 'prop-types';
import cateEmoji from './utils/cateEmoji.json';
import allEmoji from './utils/allEmoji.json';
import {
    responsiveFontSize,
    responsiveHeight,
    responsiveWidth,
} from 'react-native-responsive-dimensions';
import EmojiCategory from './EmojiCategory';
import OpicoStyles from '../styles/OpicoStyles';

let color = [
    'lightgray',
    'lightgray',
    'lightgray',
    'lightgray',
    'lightgray',
    'lightgray',
    'lightgray',
    'lightgray',
];
let c1 = () => <Icon name="face" color={color[0]} />;
let c2 = () => <Icon name="trees" type="foundation" color={color[1]} />;
let c3 = () => <Icon name="food" type="material-community" color={color[2]} />;
let c4 = () => (
    <Icon name="football" type="material-community" color={color[3]} />
);
let c5 = () => <Icon name="plane" type="font-awesome" color={color[4]} />;
let c6 = () => (
    <Icon name="lightbulb" type="material-community" color={color[5]} />
);
let c7 = () => <Icon name="heart" type="foundation" color={color[6]} />;
let c8 = () => <Icon name="flag" color={color[7]} />;
let buttons = [
    { element: c1 },
    { element: c2 },
    { element: c3 },
    { element: c4 },
    { element: c5 },
    { element: c6 },
    { element: c7 },
    { element: c8 },
];

class EmojiPicker extends PureComponent {
    constructor() {
        super();
        this.state = {
            searchQuery: '',
            selectedIndex: 0,
        };
    }

    renderItem({ item }) {
        return (
            <EmojiCategory
                set={item}
                onEmojiSelected={this.props.onEmojiSelected}
            />
        );
    }

    scroll(event) {
        let p = event.nativeEvent.contentOffset.y;
        let rate = responsiveFontSize(1);
        if (p < 287 * rate) {
            this.setState({
                selectedIndex: 0,
            });
        } else if (p >= 287 * rate && p < 376 * rate) {
            this.setState({
                selectedIndex: 1,
            });
        } else if (p >= 376 * rate && p < 454 * rate) {
            this.setState({
                selectedIndex: 2,
            });
        } else if (p >= 454 * rate && p < 504 * rate) {
            this.setState({
                selectedIndex: 3,
            });
        } else if (p >= 504 * rate && p < 656 * rate) {
            this.setState({
                selectedIndex: 4,
            });
        } else if (p >= 656 * rate && p < 779 * rate) {
            this.setState({
                selectedIndex: 5,
            });
        } else if (p >= 779 * rate && p < 931 * rate) {
            this.setState({
                selectedIndex: 6,
            });
        } else if (p >= 931 * rate) {
            this.setState({
                selectedIndex: 7,
            });
        }
    }

    renderSearchResults() {
        let re = new RegExp(this.state.searchQuery, 'ig');
        let searchResults = allEmoji.filter(data => {
            return re.test(data.keywords) || re.test(data.name);
        });

        return (
            <EmojiCategory
                set={searchResults}
                onEmojiSelected={this.props.onEmojiSelected.bind(this)}
            />
        );
    }

    renderAllEmojis() {
        let emojis = cateEmoji;

        for (let i = 0; i < 8; i++) {
            color[i] = 'lightgray';
        }

        color[this.state.selectedIndex] = OpicoStyles.secondaryColor;

        return (
            <View style={{ flex: 1 }}>
                <ButtonGroup
                    onPress={n => {
                        this.setState({
                            selectedIndex: n,
                        });
                        this.refs.emojilist.scrollToLocation({
                            animated: false,
                            sectionIndex: n,
                            itemIndex: -1,
                        });
                    }}
                    selectedIndex={this.state.selectedIndex}
                    buttons={buttons}
                    containerStyle={{
                        height: 30,
                        borderColor: 'white',
                    }}
                    buttonStyle={{ backgroundColor: 'white' }}
                    innerBorderStyle={{ color: 'white' }}
                />
                <SectionList
                    ref="emojilist"
                    onScroll={this.scroll.bind(this)}
                    sections={emojis}
                    keyExtractor={(item, index) => index}
                    getItemLayout={(data, index) => ({
                        length: responsiveFontSize(4),
                        offset: responsiveFontSize(4) * index,
                        index,
                    })}
                    renderItem={this.renderItem.bind(this)}
                    renderSectionHeader={({ section }) => (
                        <Text
                            key={section.cate}
                            style={{
                                fontSize: responsiveFontSize(2.5),
                                color: 'black',
                                fontWeight: 'bold',
                                paddingTop: responsiveHeight(1),
                                paddingBottom: responsiveHeight(1),
                                paddingLeft: responsiveWidth(3),
                                paddingRight: responsiveWidth(3),
                            }}>
                            {section.cate}
                        </Text>
                    )}
                />
            </View>
        );
    }

    render() {
        return (
            <View style={this.props.style}>
                <TextInput
                    placeholderTextColor={'#A0A0A2'}
                    style={{
                        backgroundColor: 'white',
                        borderColor: '#A0A0A2',
                        borderWidth: 0.5,
                        color: 'black',
                        fontSize: responsiveFontSize(2),
                        fontFamily: OpicoStyles.primaryFontFamily,
                        padding: responsiveHeight(1),
                        paddingLeft: 15,
                        borderRadius: 15,
                        marginLeft: responsiveWidth(4),
                        marginRight: responsiveWidth(4),
                        marginTop: responsiveHeight(1),
                        marginBottom: responsiveHeight(0.25),
                    }}
                    returnKeyType={'search'}
                    clearButtonMode={'always'}
                    placeholder={'Search emoji'}
                    autoCorrect={false}
                    onChangeText={text => {
                        this.setState({
                            searchQuery: text,
                        });
                    }}
                />
                {!this.state.searchQuery
                    ? this.renderAllEmojis()
                    : this.renderSearchResults()}
            </View>
        );
    }
}

const EmojiOverlay = props => (
    <View>
        <TouchableOpacity onPress={props.onTapOutside}>
            <View style={styles.background} />
        </TouchableOpacity>
        {props.visible ? <EmojiPicker {...props} /> : null}
    </View>
);

const styles = StyleSheet.create({
    container: {
        padding: 5,
    },
    absolute: {
        position: 'absolute',
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
    },
    visible: {
        top: 0,
        flex: 1,
        justifyContent: 'center',
    },
    hidden: {
        top: 1000,
        flex: 1,
    },
    categoryInner: {
        flex: 1,
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    headerText: {
        padding: 5,
        color: 'black',
        justifyContent: 'center',
        textAlignVertical: 'center',
        fontSize: responsiveFontSize(2.5),
        fontFamily: OpicoStyles.primaryFontFamily,
        marginTop: 5,
    },
    selectedCategory: {
        fontSize: responsiveFontSize(1.5),
        color: 'white',
        backgroundColor: 'black',
    },
    unselectedCategory: {
        fontSize: responsiveFontSize(1.5),
        color: 'black',
        padding: 2,
        fontFamily: OpicoStyles.primaryFontFamily,
    },
    categoryContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        borderBottomWidth: 1,
        borderColor: 'lightgray',
    },
    categoryItem: {
        paddingBottom: 5,
        paddingTop: 10,
    },
});

EmojiPicker.propTypes = {
    onEmojiSelected: PropTypes.func.isRequired,
};

export { EmojiPicker as default, EmojiOverlay };
