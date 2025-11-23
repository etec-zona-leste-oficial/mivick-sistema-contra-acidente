import { Ionicons } from "@expo/vector-icons";
import React, { Children, useEffect, useRef } from "react";
import { Animated, Text, TouchableOpacity, View } from "react-native";
import Modal from "react-native-modal";

interface FirstModalTermsProps {
    visible: boolean;
    onClose: () => void;
    children?: React.ReactNode;
}

//export const FirstModalTerms: React.FC<FirstModalTermsProps> = ({ visible, onClose, children }) => {

//}