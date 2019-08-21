import React from 'react';
import PropTypes from 'prop-types';
import {
    View,
    Text,
    TextInput,
    Dimensions,
    TouchableOpacity,
    TouchableWithoutFeedback,
    AsyncStorage
} from 'react-native';
import {
    RecyclerListView,
    DataProvider,
    LayoutProvider
} from 'recyclerlistview';
import Triangle from 'react-native-triangle';
import _ from 'lodash';
import {
    responsiveFontSize
} from 'react-native-responsive-dimensions';
import * as Animatable from 'react-native-animatable';
import EmojiSearchSpace from "./EmojiSearch";

import Emoji from './Emoji';

const {
    category,
    categoryIndexMap,
    emojiLib,
} = require('./emoji-data/compiled');

const categoryIcon = {
    fue: props => (
        <Text style={styles.categoryTabEmoji} {...props}>
            🕘
        </Text>
    ),
    people: props => (
        <Text style={styles.categoryTabEmoji} {...props}>
            😊
        </Text>
    ),
    animals_and_nature: props => (
        <Text style={styles.categoryTabEmoji} {...props}>
            🦄
        </Text>
    ),
    food_and_drink: props => (
        <Text style={styles.categoryTabEmoji} {...props}>
            🍔
        </Text>
    ),
    activity: props => (
        <Text style={styles.categoryTabEmoji} {...props}>
            ⚾️
        </Text>
    ),
    travel_and_places: props => (
        <Text style={styles.categoryTabEmoji} {...props}>
            ✈️
        </Text>
    ),
    objects: props => (
        <Text style={styles.categoryTabEmoji} {...props}>
            💡
        </Text>
    ),
    symbols: props => (
        <Text style={styles.categoryTabEmoji} {...props}>
            🔣
        </Text>
    ),
    flags: props => (
        <Text style={styles.categoryTabEmoji} {...props}>
            🏳️
        </Text>
    ),
};

const { width: WINDOW_WIDTH } = Dimensions.get('window');

const ViewTypes = {
    EMOJI: 0,
    CATEGORY: 1
};

// fromCodePoint polyfill
if (!String.fromCodePoint) {
    (function() {
        var defineProperty = (function() {
            // IE 8 only supports `Object.defineProperty` on DOM elements
            try {
                var object = {};
                var $defineProperty = Object.defineProperty;
                var result =
                    $defineProperty(object, object, object) && $defineProperty;
            } catch (error) {}
            return result;
        })();
        var stringFromCharCode = String.fromCharCode;
        var floor = Math.floor;
        var fromCodePoint = function() {
            var MAX_SIZE = 0x4000;
            var codeUnits = [];
            var highSurrogate;
            var lowSurrogate;
            var index = -1;
            var length = arguments.length;
            if (!length) {
                return '';
            }
            var result = '';
            while (++index < length) {
                var codePoint = Number(arguments[index]);
                if (
                    !isFinite(codePoint) || // `NaN`, `+Infinity`, or `-Infinity`
                    codePoint < 0 || // not a valid Unicode code point
                    codePoint > 0x10ffff || // not a valid Unicode code point
                    floor(codePoint) != codePoint // not an integer
                ) {
                    throw RangeError('Invalid code point: ' + codePoint);
                }
                if (codePoint <= 0xffff) {
                    // BMP code point
                    codeUnits.push(codePoint);
                } else {
                    // Astral code point; split in surrogate halves
                    // http://mathiasbynens.be/notes/javascript-encoding#surrogate-formulae
                    codePoint -= 0x10000;
                    highSurrogate = (codePoint >> 10) + 0xd800;
                    lowSurrogate = (codePoint % 0x400) + 0xdc00;
                    codeUnits.push(highSurrogate, lowSurrogate);
                }
                if (index + 1 == length || codeUnits.length > MAX_SIZE) {
                    result += stringFromCharCode.apply(null, codeUnits);
                    codeUnits.length = 0;
                }
            }
            return result;
        };
        if (defineProperty) {
            defineProperty(String, 'fromCodePoint', {
                value: fromCodePoint,
                configurable: true,
                writable: true
            });
        } else {
            String.fromCodePoint = fromCodePoint;
        }
    })();
}

class EmojiInput extends React.PureComponent {
    constructor(props) {
        super(props);

        if (this.props.enableFrequentlyUsedEmoji) this.getFrequentlyUsedEmoji();

        this.emojiSize = _.floor(props.width / this.props.numColumns);

        this.emoji = [];

        this.loggingFunction = this.props.loggingFunction
            ? this.props.loggingFunction
            : null;

        this.verboseLoggingFunction = this.props.verboseLoggingFunction
            ? this.props.verboseLoggingFunction
            : false;

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
                        dim.height = this.props.categoryLabelHeight;
                        dim.width = props.width;
                        break;
                    case ViewTypes.EMOJI:
                        dim.height = dim.width = this.emojiSize;
                        break;
                }
            }
        );

        this._rowRenderer = this._rowRenderer.bind(this);
        this._isMounted = false;

        this.state = {
            dataProvider: dataProvider.cloneWithRows(this.emoji),
            currentCategoryKey: this.props.enableFrequentlyUsedEmoji
                ? category[0].key
                : category[1].key,
            searchQuery: '',
            emptySearchResult: false,
            frequentlyUsedEmoji: {},
            previousLongestQuery: '',
            selectedEmoji: null,
            offsetY: 0
        };
    }

    componentDidMount() {
        this._isMounted = true;
        this.search();
    }

    componentDidUpdate(prevProps, prevStates) {
        if (this.props.resetSearch) {
            this.textInput.clear();
            this.setState({
                searchQuery: ''
            });
        }
        if (
            prevStates.searchQuery !== this.state.searchQuery ||
            prevStates.frequentlyUsedEmoji !== this.state.frequentlyUsedEmoji
        ) {
            this.search();
        }
    }

    componentWillUnmount() {
        this._isMounted = false;
    }

    getFrequentlyUsedEmoji = () => {
        AsyncStorage.getItem('@EmojiInput:frequentlyUsedEmoji').then(
            frequentlyUsedEmoji => {
                if (frequentlyUsedEmoji !== null) {
                    frequentlyUsedEmoji = JSON.parse(frequentlyUsedEmoji);
                    this.setState({ frequentlyUsedEmoji });
                }
            }
        );
    };

    addFrequentlyUsedEmoji = data => {
        let emoji = data.key;
        let { frequentlyUsedEmoji } = this.state;
        if (_(frequentlyUsedEmoji).has(emoji)) {
            frequentlyUsedEmoji[emoji]++;
        } else {
            frequentlyUsedEmoji[emoji] = 1;
        }
        this.setState({ frequentlyUsedEmoji });
        AsyncStorage.setItem(
            '@EmojiInput:frequentlyUsedEmoji',
            JSON.stringify(frequentlyUsedEmoji)
        );
    };

    clearFrequentlyUsedEmoji = () => {
        AsyncStorage.removeItem('@EmojiInput:frequentlyUsedEmoji');
    };

    search = () => {
        let query = this.state.searchQuery;
        this.setState({ emptySearchResult: false });

        if (query) {
            let result = _(EmojiSearchSpace.search(query).slice(0,50)) // Only show top 50 relevant results
                .map(({ emoji_key }) => emojiLib[emoji_key])           // speeds up response time
                .value();

            if (!result.length) {
                this.setState({ emptySearchResult: true });
                if (this.loggingFunction) {
                    if (this.verboseLoggingFunction) {
                        this.loggingFunction(query, 'emptySearchResult');
                    } else {
                        this.loggingFunction(query);
                    }
                }
            }
            this.emojiRenderer(result);
            setTimeout(() => {
                if (this._isMounted) {
                    this._recyclerListView._pendingScrollToOffset = null;
                    this._recyclerListView.scrollToTop(false);
                }
            }, 15);
        } else {
            let fue = _(this.state.frequentlyUsedEmoji)
                .toPairs()
                .sortBy([1])
                .reverse()
                .map(([key]) => key)
                .value();
            fue = _(this.props.defaultFrequentlyUsedEmoji)
                .concat(fue)
                .take(this.props.numFrequentlyUsedEmoji)
                .value();
            let _emoji = _(emojiLib)
                .pick(fue)
                .mapKeys((v, k) => `FUE_${k}`)
                .mapValues(v => ({ ...v, category: 'fue' }))
                .extend(emojiLib)
                .value();
            this.emojiRenderer(_emoji);
        }
    };

    emojiRenderer = emojis => {
        let dataProvider = new DataProvider((e1, e2) => {
            return e1.char !== e2.char;
        });

        this.emoji = [];
        let categoryIndexMap = _(category)
            .map((v, idx) => ({ ...v, idx }))
            .keyBy('key')
            .value();

        let tempEmoji = _
            .range(_.size(category))
            .map((v, k) => [
                { char: category[k].key, categoryMarker: true, ...category[k] }
            ]);
        _(emojis)
            .values()
            .filter(emoji => _.every(this.props.filterFunctions, fn => fn(emoji)))
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

            c.y =
                _.ceil(lastCount / this.props.numColumns) * this.emojiSize +
                accurateY;
            accurateY =
                c.y + (_.size(v) === 1 ? 0 : this.props.categoryLabelHeight);

            lastCount = _.size(v) - 1;
        });
        this.emoji = _(tempEmoji)
            .filter(c => c.length > 1)
            .flatten(tempEmoji)
            .value();
        if (
            !this.props.showCategoryTitleInSearchResults &&
            this.state.searchQuery
        ) {
            this.emoji = _.filter(this.emoji, c => !c.categoryMarker);
        }

        _.reduce(
            this.emoji,
            ({ x, y, i, previousDimension }, emoji) => {
                const layoutType = this._layoutProvider.getLayoutTypeForIndex(
                    i
                );
                const dimension = { width: 0, height: 0 };
                this._layoutProvider._setLayoutForType(
                    layoutType,
                    dimension,
                    i
                );

                x = x + dimension.width;
                if (x > this.props.width) {
                    x = dimension.width;
                    y = y + previousDimension.height;
                }

                emoji.y = y;
                emoji.x = x - dimension.width;

                return { x, y, i: i + 1, previousDimension: dimension };
            },
            { x: 0, y: 0, i: 0, previousDimension: null }
        );
        this.setState({
            dataProvider: dataProvider.cloneWithRows(this.emoji)
        });
    };

    _rowRenderer(type, data) {
        switch (type) {
            case ViewTypes.CATEGORY:
                return (
                    <Text
                        style={[
                            styles.categoryText,
                            { ...this.props.categoryLabelTextStyle }
                        ]}
                    >
                        {data.title}
                    </Text>
                );
            case ViewTypes.EMOJI:
                return (
                    <Emoji
                        onPress={this.handleEmojiPress}
                        onLongPress={this.handleEmojiLongPress}
                        data={data}
                        size={this.props.emojiFontSize}
                    />
                );
        }
    }

    handleCategoryPress = key => {
        this.props.onCategoryPress(key);
        this._recyclerListView.scrollToOffset(
            0,
            category[categoryIndexMap[key].idx].y + 1,
            false
        );
    };

    handleScroll = (rawEvent, offsetX, offsetY) => {
        let idx = _(category).findLastIndex(c => c.y < offsetY);
        if (idx < 0) idx = 0;
        this.setState({
            currentCategoryKey: category[idx].key,
            selectedEmoji: null,
            offsetY
        });
    };

    handleEmojiPress = data => {
        this.props.onEmojiSelected(data);
        if (_.has(data, 'derivedFrom')) {
            data = data.derivedFrom;
        }
        if (this.props.enableFrequentlyUsedEmoji)
            this.addFrequentlyUsedEmoji(data);
        this.hideSkinSelector();
    };

    handleEmojiLongPress = data => {
        // disable long press for now
        // if (!_.has(data, ['lib', 'skin_variations'])) return;
        // this.setState({ selectedEmoji: data });
    };

    hideSkinSelector = () => {
        this.setState({ selectedEmoji: null });
    };

    render() {
        const { selectedEmoji, offsetY } = this.state;
        const { enableSearch, width, renderAheadOffset } = this.props;
        return (
            <View
                style={{
                    flex: 1,
                    width,
                    backgroundColor: this.props.keyboardBackgroundColor,
                    position: 'relative'
                }}
            >
                {enableSearch && (
                    <TextInput
                        ref={input => {
                            this.textInput = input;
                        }}
                        placeholderTextColor={'#A0A0A2'}
                        style={{
                            backgroundColor: "#FFFFFF",
                            fontSize: responsiveFontSize(2),
                            padding: 10,
                            paddingLeft: 15,
                            borderRadius: 7.5,
                            margin: 10,
                        }}
                        returnKeyType={'search'}
                        clearButtonMode={'always'}
                        placeholder={'Search emoji'}
                        autoCorrect={false}
                        onChangeText={text => {
                            this.setState({
                                searchQuery: text
                            });
                            if (text.length) {
                                if (
                                    text.length >
                                    this.state.previousLongestQuery.length
                                ) {
                                    this.setState({
                                        previousLongestQuery: text
                                    });
                                }
                            } else {
                                if (this.loggingFunction) {
                                    if (this.verboseLoggingFunction) {
                                        this.loggingFunction(
                                            this.state.previousLongestQuery,
                                            'previousLongestQuery'
                                        );
                                    } else {
                                        this.loggingFunction(
                                            this.state.previousLongestQuery
                                        );
                                    }
                                }
                                this.setState({
                                    previousLongestQuery: ''
                                });
                            }
                        }}
                    />
                )}
                {this.state.emptySearchResult && (
                    <View style={styles.emptySearchResultContainer}>
                        <Text>No search results.</Text>
                    </View>
                )}
                <View style={styles.recyclerListView}>
                    <RecyclerListView
                        renderAheadOffset={renderAheadOffset}
                        layoutProvider={this._layoutProvider}
                        dataProvider={this.state.dataProvider}
                        rowRenderer={this._rowRenderer}
                        ref={component => (this._recyclerListView = component)}
                        onScroll={this.handleScroll}
                    />
                </View>
                {!this.state.searchQuery &&
                    this.props.showCategoryTab && (
                        <TouchableWithoutFeedback>
                        <View style={styles.footerContainer}>
                            {_.drop(category, this.props.enableFrequentlyUsedEmoji ? 0 : 1).map(
                                ({ key }) => {
                                    const tabSelected = key === this.state.currentCategoryKey;

                                    return (
                                        <TouchableOpacity
                                            key={key}
                                            onPress={() => this.handleCategoryPress(key)}
                                            style={[styles.categoryIconContainer, { height: this.props.categoryFontSize + 15 }]}                                               
                                        >
                                            <View>
                                                {categoryIcon[key]({
                                                    size: this.props.categoryFontSize,
                                                })}
                                            </View>
                                            {/* Active category indicator */}
                                            {tabSelected && (
                                                <View
                                                    style={styles.tabIndicator}
                                                />
                                            )}
                                        </TouchableOpacity>
                                    );
                                }
                            )}
                        </View>
                        </TouchableWithoutFeedback>
                    )}
                {selectedEmoji && (
                    <Animatable.View
                        animation="bounceIn"
                        style={[
                            styles.skinSelectorContainer,
                            {
                                top:
                                    selectedEmoji.y -
                                    offsetY -
                                    width / this.props.numColumns +
                                    (enableSearch ? 35 : 0)
                            }
                        ]}
                    >
                        <View
                            style={[
                                styles.skinSelector,
                                {
                                    height: this.props.emojiFontSize + 20
                                }
                            ]}
                        >
                            {_(_.get(selectedEmoji, ['lib', 'skin_variations']))
                                .map(data => {
                                    return (
                                        <View
                                            style={styles.skinEmoji}
                                            key={data.unified}
                                        >
                                            <Emoji
                                                onPress={this.handleEmojiPress}
                                                data={{
                                                    ...data,
                                                    derivedFrom: selectedEmoji
                                                }}
                                                size={this.props.emojiFontSize}
                                            />
                                        </View>
                                    );
                                })
                                .value()}
                        </View>
                        <View
                            style={[
                                styles.skinSelectorTriangleContainer,
                                {
                                    marginLeft:
                                        selectedEmoji.x +
                                        width / this.props.numColumns / 2 -
                                        30 / 2
                                }
                            ]}
                        >
                            <Triangle
                                width={30}
                                height={20}
                                color={'#fff'}
                                direction={'down'}
                            />
                        </View>
                    </Animatable.View>
                )}
            </View>
        );
    }
}

EmojiInput.defaultProps = {
    keyboardBackgroundColor: '#E3E1EC',
    width: WINDOW_WIDTH,
    numColumns: 6,

    showCategoryTab: true,
    showCategoryTitleInSearchResults: false,
    categoryUnhighlightedColor: 'lightgray',
    categoryHighlightColor: 'black',
    enableSearch: true,

    enableFrequentlyUsedEmoji: true,
    numFrequentlyUsedEmoji: 18,
    defaultFrequentlyUsedEmoji: [],

    categoryLabelHeight: 20,
    categoryLabelTextStyle: {
        fontSize: 25,
    },
    emojiFontSize: 38,
    categoryFontSize: 20,
    resetSearch: false,
    filterFunctions: [],
    renderAheadOffset: 1500
};

EmojiInput.propTypes = {
    keyboardBackgroundColor: PropTypes.string,
    width: PropTypes.number,
    numColumns: PropTypes.number,
    emojiFontSize: PropTypes.number,

    onEmojiSelected: PropTypes.func.isRequired,
    onCategoryPress: PropTypes.func,

    showCategoryTab: PropTypes.bool,
    showCategoryTitleInSearchResults: PropTypes.bool,
    categoryFontSize: PropTypes.number,
    categoryUnhighlightedColor: PropTypes.string,
    categoryHighlightColor: PropTypes.string,
    categorySize: PropTypes.number,
    categoryLabelHeight: PropTypes.number,
    enableSearch: PropTypes.bool,
    categoryLabelTextStyle: PropTypes.object,

    enableFrequentlyUsedEmoji: PropTypes.bool,
    numFrequentlyUsedEmoji: PropTypes.number,
    defaultFrequentlyUsedEmoji: PropTypes.arrayOf(PropTypes.string),
    resetSearch: PropTypes.bool,
    filterFunctions: PropTypes.arrayOf(PropTypes.func),
    renderAheadOffset: PropTypes.number
};

const styles = {
    cellContainer: {
        justifyContent: 'space-around',
        alignItems: 'center',
        flex: 1
    },
    footerContainer: {
        width: '100%',
        backgroundColor: '#fff',
        flexDirection: 'row'
    },
    emptySearchResultContainer: {
        flex: 1,
        alignItems: 'center',
        padding: 20
    },
    emojiText: {
        color: 'black',
        fontWeight: 'bold'
    },
    categoryText: {
        color: 'black',
        fontWeight: 'bold',
        paddingTop: 8,
        paddingBottom: 2,
        paddingLeft: 10
    },
    categoryIconContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'space-around', 
        paddingTop: 4,
        paddingBottom: 8,
    },
    skinSelectorContainer: {
        width: '100%',
        flex: 1,
        flexDirection: 'column',
        justifyContent: 'flex-start',
        position: 'absolute'
    },
    skinSelector: {
        width: '100%',
        justifyContent: 'space-around',
        alignItems: 'center',
        flexDirection: 'row',
        backgroundColor: '#fff'
    },
    skinSelectorTriangleContainer: {
        height: 20
    },
    skinEmoji: {
        flex: 1
    },
    categoryTabEmoji: {
        color: "#000000", // Fixes fade emoji on Android
    },
    tabIndicator:{
        width: 5,
        height: 5,
        borderRadius: 2.5,
        bottom: 3.5,
        position: "absolute",
        backgroundColor: "#00AAE5",
    },
    recyclerListView: { // Fix RecyclerListView error 
        minWidth: 1, 
        minHeight: 1, 
        flex: 1
    }
};

export default EmojiInput;
