import React, { PureComponent } from 'react';
import {
    View,
    Text,
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
const { width } = Dimensions.get('window');

const column = 6;

const emojiSize = width / column;
const categorySize = 40;

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

class EmojiInput extends PureComponent {
    constructor(props) {
        super(props);

        this.emoji = [];
        let categoryIndexMap = _(category)
            .map((v, idx) => ({ ...v, idx }))
            .keyBy('key')
            .value();
        let tempEmoji = _.range(_.size(category)).map((v, k) => [
            { char: category[k].key, categoryMarker: true, ...category[k] },
        ]);
        _(emoji.lib)
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

            c.y = _.ceil(lastCount / column) * emojiSize + accurateY;
            accurateY = c.y + categorySize;

            lastCount = _.size(v) - 1;
        });
        this.emoji = _.flatten(tempEmoji);

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
                        dim.height = categorySize;
                        dim.width = width;
                        break;
                    case ViewTypes.EMOJI:
                        dim.height = dim.width = emojiSize;
                        break;
                }
            }
        );

        this._rowRenderer = this._rowRenderer.bind(this);

        this.state = {
            dataProvider: dataProvider.cloneWithRows(this.emoji),
            currentCategoryKey: category[0].key,
        };
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
                        <Text style={styles.emojiText}>{data.char}</Text>
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
                <RecyclerListView
                    style={{ flex: 1 }}
                    renderAheadOffset={500}
                    layoutProvider={this._layoutProvider}
                    dataProvider={this.state.dataProvider}
                    rowRenderer={this._rowRenderer}
                    ref={component => (this._recyclerListView = component)}
                    onScroll={this.handleScroll}
                />
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
                                        size: this.props.emojiFontSize,
                                    })}
                                </View>
                            </TouchableOpacity>
                        ))}
                    </View>
                </TouchableWithoutFeedback>
            </View>
        );
    }
}

EmojiInput.defaultProps = {
    keyboardBackgroundColor: '#E3E1EC',
    categoryUnhighlightedColor: 'lightgray',
    categoryHighlightColor: 'black',
    numColumns: 6,
    emojiFontSize: responsiveFontSize(4),
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
        fontSize: responsiveFontSize(30 / column),
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
    },
};

export default EmojiInput;
