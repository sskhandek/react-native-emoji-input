import _ from 'lodash';
import fs from 'fs';

import {
    category,
    categoryIndexMap,
    emojiLib,
    emojiMap,
    emojiArray,
} from '../src/emoji-data';

let data = {
    category,
    categoryIndexMap,
    emojiLib,
    emojiMap,
    emojiArray,
};

data.emojiLib = _(data.emojiLib).mapValues(v =>
    _.set(v, 'localImage', `require('emoji-datasource-apple/img/apple/64/${v.lib.image}')`)
);

var stingified = JSON.stringify(data)
    .replace(/(["'])require(?:(?=(\\?))\2.)*?\1/g, (value) =>
        value.replace(/"/g, ''),
    );

fs.writeFile('src/emoji-data/compiled.js', `module.exports = ${stingified}`, (err) => {
    if (err) throw err;
});
