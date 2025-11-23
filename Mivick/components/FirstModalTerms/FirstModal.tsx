import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import Modal from "react-native-modal";
import { stylesModalTerms as s } from "./styleFirstModalTerms";

interface FirstModalTermsProps {
  visible: boolean;
  onClose: () => void;
  children?: string; // ← texto puro
}

export const FirstModalTerms: React.FC<FirstModalTermsProps> = ({
  visible,
  onClose,
  children = "",
}) => {
  // Divide automaticamente o texto em parágrafos bonitos
  const paragraphs = children
    .split("\n")
    .map((p) => p.trim())
    .filter((p) => p.length > 0);

  return (
    <Modal
      isVisible={visible}
      animationIn="fadeInUp"
      animationOut="fadeOutDown"
      backdropOpacity={0.5}
      onBackdropPress={onClose}
      useNativeDriver
      hideModalContentWhileAnimating
    >
      <View style={s.modalContainer}>
        {/* Botão de Fechar */}
        <TouchableOpacity onPress={onClose} style={s.closeButton}>
          <Ionicons name="close" size={22} color="#fff" />
        </TouchableOpacity>

        {/* Conteúdo com rolagem */}
        <ScrollView
          showsVerticalScrollIndicator
          style={s.scrollArea}
          contentContainerStyle={s.scrollContent}
        >
          {paragraphs.map((text, index) => (
            <Text key={index} style={s.termsParagraph}>
              {text}
            </Text>
          ))}
        </ScrollView>
      </View>
    </Modal>
  );
};
