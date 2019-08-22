import { EmojiData } from "emoji-datasource";
import React from "react";
import { StyleProp, TextStyle } from "react-native";

interface Emoji {
    category: string;
    char: string;
    keywords: string[];
    lib: EmojiData;
}

// NOTE: props are not complete
interface Props {
    onEmojiSelected: (emoji: Emoji) => void;
    keyboardBackgroundColor?: string;
    categoryLabelTextStyle?: StyleProp<TextStyle>;
    categoryLabelHeight?: number;
    numColumns?: number;
    emojiFontSize?: number;
    onCategoryPress?: (category: string) => void;
    enableSearch?: boolean;
    renderAheadOffset?: number;
}

export default class EmojiInput extends React.Component<Props> { }
