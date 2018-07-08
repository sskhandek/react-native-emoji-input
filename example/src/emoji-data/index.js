import _ from 'lodash';
import emoji from 'emoji-datasource-apple';
import emojilib from 'emojilib';
import emojiSynonyms from './emojiSynonyms.json';
import userInputEmojiSynonyms from './userInputtedSynonyms.json';

const categoryTitleToKey = {
    'Frequently Used': 'fue',
    'Smileys & People': 'people',
    'Animals & Nature': 'animals_and_nature',
    'Food & Drink': 'food_and_drink',
    Activities: 'activity',
    'Travel & Places': 'travel_and_places',
    Objects: 'objects',
    Symbols: 'symbols',
    Flags: 'flags'
};

emojilib.lib = _(emoji)
    .sortBy('sort_order')
    .filter('has_img_apple')
    .mapKeys(({ short_name }) => short_name)
    .mapValues((v, k) => ({
        char: String.fromCodePoint.apply(
            null,
            v.unified.split('-').map(v => `0x${v}`)
        ),
        key: v.short_name,
        keywords: [v.short_name],
        category: categoryTitleToKey[v.category],
        lib: v
    }))
    .value();

const category = [
    {
        key: 'fue',
        title: 'Frequently Used'
    },
    {
        key: 'people',
        title: 'Smileys & People'
    },
    {
        key: 'animals_and_nature',
        title: 'Animals & Nature'
    },
    {
        key: 'food_and_drink',
        title: 'Food & Drink'
    },
    {
        key: 'activity',
        title: 'Activities'
    },
    {
        key: 'travel_and_places',
        title: 'Travel & Places'
    },
    {
        key: 'objects',
        title: 'Objects'
    },
    {
        key: 'symbols',
        title: 'Symbols'
    },
    {
        key: 'flags',
        title: 'Flags'
    }
];

const categoryIndexMap = _(category)
    .map((v, idx) => ({ ...v, idx }))
    .keyBy('key')
    .value();

_.each(emojiSynonyms, (v, k) => {
    emojiSynonyms[k] = _.uniq(
        emojiSynonyms[k].concat(userInputEmojiSynonyms[k])
    );
});

const emojiMap = _(emojilib.lib)
    .mapValues(
        (v, k) => k + ' ' + v.keywords.map(v => v.replace(/_/g, ' ')).join(' ')
    )
    .invert()
    .value();

const emojiArray = _.keys(emojiMap);

const emojiLib = emojilib.lib;

export { category, categoryIndexMap, emojiLib, emojiMap, emojiArray };
