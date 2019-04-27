import Fuse from "fuse.js";

const { emojiArray } = require("./emoji-data/compiled");

const emojiSynonyms = require("./emoji-data/emojiSynonyms");

// Extend keywords using synonym JSON file
for (let i = 0; i < emojiArray.length; i++) {
  emojiArray[i]["keywords"] = emojiArray[i]["keywords"].concat(
    emojiSynonyms[i]["keywords"]
  );
}

const fuseOptions = {
  shouldSort: true,
  threshold: 0.0, // threshold of 0.0 is perfect match and 1.0 is any match
  keys: ["keywords"]
};

var EmojiSearchSpace = new Fuse(emojiArray, fuseOptions);

export default EmojiSearchSpace;
