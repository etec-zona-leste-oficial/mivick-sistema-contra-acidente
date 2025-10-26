// components/FirstModal.tsx
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useRef } from "react";
import { Animated, Text, TouchableOpacity, View } from "react-native";
import Modal from "react-native-modal";
import { styles } from "./stylefirstModal";

interface FirstModalProps {
    visible: boolean;
    onClose: () => void;
}

export const FirstModal: React.FC<FirstModalProps> = ({ visible, onClose }) => {

    const dot1 = useRef(new Animated.Value(1)).current;
    const dot2 = useRef(new Animated.Value(0.5)).current;
    const dot3 = useRef(new Animated.Value(0.3)).current;


    useEffect(() => {
        const animate = () => {
            Animated.loop(
                Animated.stagger(200, [
                    Animated.sequence([
                        Animated.timing(dot1, { toValue: 0.3, duration: 400, useNativeDriver: true }),
                        Animated.timing(dot1, { toValue: 1, duration: 400, useNativeDriver: true }),
                    ]),
                    Animated.sequence([
                        Animated.timing(dot2, { toValue: 0.3, duration: 400, useNativeDriver: true }),
                        Animated.timing(dot2, { toValue: 1, duration: 400, useNativeDriver: true }),
                    ]),
                    Animated.sequence([
                        Animated.timing(dot3, { toValue: 0.3, duration: 400, useNativeDriver: true }),
                        Animated.timing(dot3, { toValue: 1, duration: 400, useNativeDriver: true }),
                    ]),
                ])
            ).start();
        };

        animate();
    }, [dot1, dot2, dot3]);

    return (
        <Modal
            isVisible={visible}
            animationIn="zoomIn"
            animationOut="zoomOut"
            backdropOpacity={0.7}
            onBackdropPress={onClose}
            useNativeDriver
        >
            <View style={styles.modalContainer}>
                {/* HEADER */}
                <View style={styles.header}>
                    <Text style={styles.headerText}>Adicionar dispositivo</Text>
                    <TouchableOpacity onPress={onClose}>
                        <Ionicons name="close" size={24} color="#F85200" />
                    </TouchableOpacity>
                </View>

                <View
                    style={{
                        height: 1,
                        backgroundColor: '#F85200',
                        width: '114%',
                        alignSelf: 'center',
                        marginVertical: 12,
                    }}
                />

                {/* CORPO */}
                <Text style={styles.bodyText}>
                    Procurando dispositivo... {"\n"}
                    Certifique-se de que o dispositivo está ligado e selecione ele abaixo.
                </Text>

                <View
                    style={{
                        height: 6,
                        backgroundColor: '#F85200',
                        width: '114%',
                        alignSelf: 'center',
                        marginVertical: 12,
                    }}
                />



                <View style={styles.dotsContainer}>
                    <Animated.View style={[styles.dot, { opacity: dot1 }]} />
                    <Animated.View style={[styles.dot, { opacity: dot2 }]} />
                    <Animated.View style={[styles.dot, { opacity: dot3 }]} />
                </View>

                <View style={styles.devicesContainer}>
                    <Text style={styles.devicesPlaceholder}>Nenhum dispositivo encontrado ainda...</Text>
                </View>
            </View>
        </Modal>
    );
};
