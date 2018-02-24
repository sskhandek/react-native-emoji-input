# React Native Emoji Input

A performant, customizable keyboard input for React Native.

## Installation

`npm install --save react-native-emoji-input`

or

`yarn add react-native-emoji-input`

## Default Props

| Prop              | Description                      | type     |
| ----------------- | -------------------------------- | -------- |
| `onEmojiSelected` | A handler for the selected emoji | function |

## Optional Props

| Prop                         | Description                                                 | type    | default value |
| ---------------------------- | ----------------------------------------------------------- | ------- | ------------- |
| `keyboardBackgroundColor`    | Set the background color of the main keyboard pane          | string  | '#E3E1EC'     |
| `categoryUnhighlightedColor` | Set the default color of the category icons                 | string  | 'lightgray'   |
| `categoryHighlightColor`     | Set the color of a higlighted category icon                 | string  | 'black'       |
| `numColumns`                 | Number of emoji columns to display                          | number  | 6             |
| `categoryLabelSize`          | The height of category title                                | number  | 40            |
| `emojiFontSize`              | The default size of the emojis                              | number  | 40            |
| `categoryFontSize`           | The default size of the category icons                      | number  | 40            |
| `numFrequentlyUsedEmoji`     | Max number of frequently used emojis in the section         | number  | 18            |
| `showCategoryTab`            | Whether the categories should be shown or not               | boolean | true          |
| `enableSearch`               | Whether the search bar should be shown or not               | boolean | true          |
| `enableFrequentlyUsedEmoji`  | Whether the frequently used category should be shown or not | boolean | true          |

## Usage

```
<EmojiInput
	onEmojiSelected={(emoji) => {console.log(emoji)}}
	/>
```
