# React Native Emoji Input

[![npm version](https://badge.fury.io/js/react-native-emoji-input.svg)](https://badge.fury.io/js/react-native-emoji-input)

A performant, customizable keyboard input for React Native. Built for and used in [Opico](http://onelink.to/opico).

![Emoji Input Example](https://media.giphy.com/media/7OWdR4BGCEtKJai6nu/giphy.gif)

## Installation

`npm install --save react-native-emoji-input`

or

`yarn add react-native-emoji-input`

If you make changes to the emoji synonyms files, you need to recompile the data sources. To compile the emoji dataset, run:

```
npx babel-node scripts/compile.js
```

## Default Props

| Prop              | Description                      | type     |
| ----------------- | -------------------------------- | -------- |
| `onEmojiSelected` | A handler for the selected emoji | function |

## Optional Props

| Prop                               | Description                                                                         | type          | default value  |
| ---------------------------------- | ----------------------------------------------------------------------------------- | ------------- | -------------- |
| `keyboardBackgroundColor`          | Set the background color of the main keyboard pane                                  | string        | '#E3E1EC'      |
| `categoryUnhighlightedColor`       | Set the default color of the category icons                                         | string        | 'lightgray'    |
| `categoryHighlightColor`           | Set the color of a higlighted category icon                                         | string        | 'black'        |
| `width`                            | Width of the keyboard, number in px                                                 | number        | window width   |
| `numColumns`                       | Number of emoji columns to display                                                  | number        | 6              |
| `categoryLabelHeight`              | The height of category title                                                        | number        | 40             |
| `categoryLabelTextStyle`           | The text size of the category title                                                 | object        | {fontSize: 25} |
| `emojiFontSize`                    | The default size of the emojis                                                      | number        | 40             |
| `categoryFontSize`                 | The default size of the category icons                                              | number        | 40             |
| `numFrequentlyUsedEmoji`           | Max number of frequently used emojis in the section                                 | number        | 18             |
| `showCategoryTab`                  | Whether the categories should be shown or not                                       | boolean       | true           |
| `enableSearch`                     | Whether the search bar should be shown or not                                       | boolean       | true           |
| `showCategoryTitleInSearchResults` | Whether the search title should be shown or not in search results                   | boolean       | false          |
| `enableFrequentlyUsedEmoji`        | Whether the frequently used category should be shown or not                         | boolean       | true           |
| `defaultFrequentlyUsedEmoji`       | An array of keys for emojis that will always render in the frequently used category | Array(string) | []             |
| `resetSearch`                      | Pass this in if you want to clear the the search                                    | boolean       | false          |
| `loggingFunction`                  | Logging function to be called when applicable.\*                                    | function      | none           |
| `verboseLoggingFunction`           | Same as loggingFunction but also provides strategy used to determine failed search  | boolean       | false          |
| `filterFunctions`                  | Array of functions that are used to limit which emojis should be rendered. Each of this function will be invoked with single parameter being `emoji` data and if every function returns `true` for `emoji` then this emoji will be included and displayed.| Array(function) | []  |
| `renderAheadOffset`                | Specify how many pixels in advance you want views to be rendered. Increasing this value can help reduce blanks (if any). However, making this low can improve performance if you're having issues with it (see [#36](https://github.com/sskhandek/react-native-emoji-input/issues/36)). Higher values also increase re-render compute | number | 1500  |
| `keyboardShouldPersistTaps`                | Determines when the keyboard should stay visible after a tap. Useful when you want to prevent the keyboard from getting dismissed on emoji selection. [More about this props.](https://reactnative.dev/docs/scrollview#keyboardshouldpersisttaps) | enum('always', 'never', 'handled') | 'always'  |
> \* When the search function yields this function is called. Additionally when the user clears the query box this function is called with the previous longest query since the last time the query box was empty. By default the function is called with one parameter, a string representing the query. If the verbose logging function parameter is set to true the function is called with a second parameter that is a string specifying why the function was called (either 'emptySearchResult' or 'longestPreviousQuery').

## Usage

```
<EmojiInput
	onEmojiSelected={(emoji) => {console.log(emoji)}}
	/>
```

## Compile emoji-data from source

The project is using [iamcal/emoji-data](https://github.com/iamcal/emoji-data). We only use the `emoji.json` that contains all the Unicode characters, short names, keywords, and categories. To embrace the latest version of Emoji, we suggest to compile the json file from source.

```shell
# You need first check out the `emoji-data` repo. We will use the compile tool provided in the repo.
git clone https://github.com/iamcal/emoji-data.git
cd emoji-data/build

# Pull data from Unicode standard
sh download_spec_files.sh

# Add new shortnames. Here're some examples in current dir, check out data_emoji_names.txt, data_emoji_names_v4.txt
vim data_emoji_names_vxx.txt # xx should be version of emoji, e.g. 11

# Compile from spec files into json
php build_map.php
```

Then copy the `emoji-data/emoji.json` to `src/emoji-data/emoji-data.json` and make sure the entry point is point to this json file.
```javascript
// src/emoji-data/index.js
import emoji from './emoji-data.json';
```

Finally compile the data file that used in the keyboard.
```shell
node-babel ./scripts/compile.js
```

## Missing Emojis on some devices

So why Emojis are displayed as `X` / other characters insetad of actual Emojis for some of your users?  
That is because this library renders Emojis based on Font and Font need to support Emoji character in order to render it. And those fonts are updated with every system release, but because there is a lot of Android device manufacturers who are actually using Android as a base to come up with their own UI layer then it is harder for them to keep up with system updates.  
You can read more about it here [Emojipedia article link](https://blog.emojipedia.org/androids-emoji-problem/)  

So what can you do?  
Apps such as `Slack` / `WhatsApp` are actually providing Emojis as little images so that they can be render regardless of operating system on mobile phone. The problem in `React-Native` is that there is no support for placing images in `Input` element at time of writing this.  
Other solution is to limit number of possible emojis to most basic ones which are supported on most devices. Choosing emojis from `Unicode 6.0` seems like solid solution: [Unicode 6.0 Emojis List](https://emojipedia.org/unicode-6.0/) - you get tons of Emojis that are most likely to be correctly rendered across most of the devices.  

In `React-Native-Emoji-Input` you can limit emojis displayed by using `filterFunctions` prop and passing array of functions. Each of this function takes `emoji` as an single parameter and if every function passed in `filterFunctions` prop returns `true` then emoji will be included in final list.  
We can use that to show only emojis which are part of `Unicode 6.0` or `Unicode 6.1` like so:  
```
	filterFunctionByUnicode = emoji => {
		return emoji.lib.added_in === "6.0" || emoji.lib.added_in === "6.1"
	}

	<EmojiInput
		onEmojiSelected={this.handleEmojiSelected}
		ref={emojiInput => this._emojiInput = emojiInput}
		resetSearch={this.state.reset}
		loggingFunction={this.verboseLoggingFunction.bind(this)}
		verboseLoggingFunction={true}
		filterFunctions={[this.filterFunctionByUnicode]}
	/>
```
This will render only emojis from Unicode 6.0 and Unicode 6.1 in input.