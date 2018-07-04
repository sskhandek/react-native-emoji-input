import _ from 'lodash';
import emoji from 'emoji-datasource-apple';
import emojilib from 'emojilib';
import emojiSynonyms from './emojiSynonyms.json';
import userInputEmojiSynonyms from './userInputtedSynonyms.json';

const emojiData = _(emoji)
    .filter('has_img_apple')
    .mapKeys(({ short_name }) => short_name)
    .value();

emojilib.lib = _(emojilib.lib)
    .pickBy((v, k) => _.has(emojiData, k))
    .mapValues((v, k) => ({
        ...v,
        lib: emojiData[k],
        key: k
    }))
    .value();

const category = [
    {
        key: 'fue',
        title: 'Frequently Used'
    },
    {
        key: 'people',
        title: 'People'
    },
    {
        key: 'animals_and_nature',
        title: 'Nature'
    },
    {
        key: 'food_and_drink',
        title: 'Foods'
    },
    {
        key: 'activity',
        title: 'Activity'
    },
    {
        key: 'travel_and_places',
        title: 'Places'
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
        (v, k) =>
            k +
            ' ' +
            v.keywords.map(v => v.replace(/_/g, ' ')).join(' ') +
            emojiSynonyms[k].map(v => v.replace(/_/g, ' ')).join(' ')
    )
    .invert()
    .value();

const emojiArray = _.keys(emojiMap);

const emojiLib = emojilib.lib;

export { category, categoryIndexMap, emojiLib, emojiMap, emojiArray };
