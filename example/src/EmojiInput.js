import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import {
    View,
    Text,
    TextInput,
    Dimensions,
    TouchableOpacity,
    TouchableWithoutFeedback,
} from 'react-native';
import {
    RecyclerListView,
    DataProvider,
    LayoutProvider,
} from 'recyclerlistview';
import { Icon } from 'react-native-elements';
import emoji from 'emojilib';
import _ from 'lodash';
import {
    responsiveFontSize,
    responsiveHeight,
    responsiveWidth,
} from 'react-native-responsive-dimensions';
import Wade from 'wade';
const { width } = Dimensions.get('window');

const ViewTypes = {
    EMOJI: 0,
    CATEGORY: 1,
};

const category = [
    {
        key: 'people',
        title: 'People',
        icon: props => <Icon name="face" {...props} />,
    },
    {
        key: 'animals_and_nature',
        title: 'Nature',
        icon: props => <Icon name="trees" type="foundation" {...props} />,
    },
    {
        key: 'food_and_drink',
        title: 'Foods',
        icon: props => (
            <Icon name="food" type="material-community" {...props} />
        ),
    },
    {
        key: 'activity',
        title: 'Activity',
        icon: props => (
            <Icon name="football" type="material-community" {...props} />
        ),
    },
    {
        key: 'travel_and_places',
        title: 'Places',
        icon: props => <Icon name="plane" type="font-awesome" {...props} />,
    },
    {
        key: 'objects',
        title: 'Objects',
        icon: props => (
            <Icon name="lightbulb" type="material-community" {...props} />
        ),
    },
    {
        key: 'symbols',
        title: 'Symbols',
        icon: props => <Icon name="heart" type="foundation" {...props} />,
    },
    {
        key: 'flags',
        title: 'Flags',
        icon: props => <Icon name="flag" {...props} />,
    },
];
const categoryIndexMap = _(category)
    .map((v, idx) => ({ ...v, idx }))
    .keyBy('key')
    .value();

const emojiMap = _(emoji.lib).mapValues((v, k) => k + ' ' + v.keywords.join(' ')).invert().value();
const emojiArray = _.keys(emojiMap);
const search = Wade(emojiArray);

class EmojiInput extends PureComponent {
    constructor(props) {
        super(props);

        this.emojiSize = width / this.props.numColumns;

        this.emoji = [];

        let dataProvider = new DataProvider((e1, e2) => {
            return e1.char !== e2.char;
        });

        this._layoutProvider = new LayoutProvider(
            index =>
                _.has(this.emoji[index], 'categoryMarker')
                    ? ViewTypes.CATEGORY
                    : ViewTypes.EMOJI,
            (type, dim) => {
                switch (type) {
                    case ViewTypes.CATEGORY:
                        dim.height = this.props.categorySize;
                        dim.width = width;
                        break;
                    case ViewTypes.EMOJI:
                        dim.height = dim.width = this.emojiSize;
                        break;
                }
            }
        );

        this._rowRenderer = this._rowRenderer.bind(this);

        this.state = {
            dataProvider: dataProvider.cloneWithRows(this.emoji),
            currentCategoryKey: category[0].key,
            searchQuery: ''
        };
    }

    componentDidMount() {
        this.search();
    }

    componentDidUpdate(prevProps, prevStates) {
        if (prevStates.searchQuery !== this.state.searchQuery) {
            this.search();
        }
    }

    search = () => {
        let query = this.state.searchQuery;

        if (query) {
            let result = _(search(query)).map(({ index }) => emoji.lib[emojiMap[emojiArray[index]]]).value();
            this.emojiRenderer(result);
            this._recyclerListView.scrollTo(false);
        } else {
            let _emoji = emoji.lib;
            this.emojiRenderer(_emoji);
        }
    }

    emojiRenderer = (emoji) => {
        let dataProvider = new DataProvider((e1, e2) => {
            return e1.char !== e2.char;
        });

        this.emoji = [];
        let categoryIndexMap = _(category)
            .map((v, idx) => ({ ...v, idx }))
            .keyBy('key')
            .value();
        let tempEmoji = _.range(_.size(category)).map((v, k) => [
            { char: category[k].key, categoryMarker: true, ...category[k] },
        ]);
        _(emoji)
            .values()
            .each(e => {
                if (_.has(categoryIndexMap, e.category)) {
                    tempEmoji[categoryIndexMap[e.category].idx].push(e);
                }
            });
        let accurateY = 0;
        let lastCount = 0;
        let s = 0;
        _(tempEmoji).each(v => {
            let idx = categoryIndexMap[v[0].key].idx;
            let c = category[idx];

            c.idx = s;
            s = s + lastCount;

            c.y = _.ceil(lastCount / this.props.numColumns) * this.emojiSize + accurateY;
            accurateY = c.y + this.props.categorySize;

            lastCount = _.size(v) - 1;
        });
        this.emoji = _(tempEmoji).filter(c => c.length > 1).flatten(tempEmoji).value();

        this.setState({
            dataProvider: dataProvider.cloneWithRows(this.emoji)
        });
    }

    _rowRenderer(type, data) {
        switch (type) {
            case ViewTypes.CATEGORY:
                return <Text style={styles.categoryText}>{data.title}</Text>;
            case ViewTypes.EMOJI:
                return (
                    <TouchableOpacity
                        style={styles.cellContainer}
                        onPress={() => {
                            this.props.onEmojiSelected(data);
                        }}>
                        <Text style={{ ...styles.emojiText, fontSize: this.props.emojiFontSize }}>{data.char}</Text>
                    </TouchableOpacity>
                );
        }
    }

    handleCategoryPress = key => {
        this._recyclerListView.scrollToOffset(
            0,
            category[categoryIndexMap[key].idx].y + 1,
            true
        );
    };

    handleScroll = (rawEvent, offsetX, offsetY) => {
        let idx = _(category).findLastIndex(c => c.y < offsetY);
        if (idx < 0) idx = 0;
        this.setState({ currentCategoryKey: category[idx].key });
    };

    render() {
        return (
            <View
                style={{
                    flex: 1,
                    width: '100%',
                    backgroundColor: this.props.keyboardBackgroundColor,
                }}>
                { this.props.enableSearch && (
                    <TextInput
                        placeholderTextColor={'#A0A0A2'}
                        style={{
                            backgroundColor: 'white',
                            borderColor: '#A0A0A2',
                            borderWidth: 0.5,
                            color: 'black',
                            fontSize: responsiveFontSize(2),
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
                )}
                <RecyclerListView
                    style={{ flex: 1 }}
                    renderAheadOffset={500}
                    layoutProvider={this._layoutProvider}
                    dataProvider={this.state.dataProvider}
                    rowRenderer={this._rowRenderer}
                    ref={component => (this._recyclerListView = component)}
                    onScroll={this.handleScroll}
                />
                { !this.state.searchQuery && this.props.showCategoryTab && (
                    <TouchableWithoutFeedback>
                        <View style={styles.footerContainer}>
                            {category.map(({ key, icon }) => (
                                <TouchableOpacity
                                    key={key}
                                    onPress={() => this.handleCategoryPress(key)}
                                    style={styles.categoryIconContainer}>
                                    <View>
                                        {icon({
                                            color:
                                            key ===
                                            this.state.currentCategoryKey
                                                ? this.props
                                                      .categoryHighlightColor
                                                : this.props
                                            .categoryUnhighlightedColor,
                                            size: this.props.categoryFontSize,
                                        })}
                                    </View>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </TouchableWithoutFeedback>
                )}
            </View>
        );
    }
}

EmojiInput.defaultProps = {
    keyboardBackgroundColor: '#E3E1EC',
    categoryUnhighlightedColor: 'lightgray',
    categoryHighlightColor: 'black',
    numColumns: 6,
    categorySize: 40,
    emojiFontSize: responsiveFontSize(5),
    categoryFontSize: responsiveFontSize(4),

    showCategoryTab: true,
    enableSearch: true
};

EmojiInput.propTypes = {
    keyboardBackgroundColor: PropTypes.string,
    categoryUnhighlightedColor: PropTypes.string,
    categoryHighlightColor: PropTypes.string,
    numColumns: PropTypes.number,
    categorySize: PropTypes.number,
    emojiFontSize: PropTypes.number,
    categoryFontSize: PropTypes.number,

    onEmojiSelected: PropTypes.func.isRequired,

    showCategoryTab: PropTypes.bool,
    enableSearch: PropTypes.bool
};

const styles = {
    cellContainer: {
        justifyContent: 'space-around',
        alignItems: 'center',
        flex: 1,
    },
    footerContainer: {
        width: '100%',
        height: responsiveHeight(8),
        backgroundColor: '#fff',
        flexDirection: 'row',
    },
    emojiText: {
        color: 'black',
        fontWeight: 'bold',
    },
    categoryText: {
        fontSize: responsiveFontSize(3.5),
        color: 'black',
        fontWeight: 'bold',
        paddingTop: responsiveHeight(2),
        paddingBottom: responsiveHeight(2),
        paddingLeft: responsiveWidth(4),
    },
    categoryIconContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'space-around',
    }
};

export default EmojiInput;
