// screens/ConectarDispositivo.tsx
import { FirstButton } from "@/components/FirstButton";
import { FirstCard } from "@/components/FirstCard/FirstCard";
import { FirstModal } from "@/components/FirstModal"; 
import { FirstTitle } from "@/components/FirstTitle";
import { Header } from "@/components/Header";
import React, { useState } from "react";
import { Dimensions, Image, ScrollView, View } from "react-native";

const { height } = Dimensions.get("window");

export default function ConectarDispositivo() {
 
  const [modalVisible, setModalVisible] = useState(false);

 
  const openModal = () => setModalVisible(true);
  const closeModal = () => setModalVisible(false);

  return (
    <View style={{ flex: 1, backgroundColor: "#1B1B1A" }}>
      <ScrollView>
        <Header />

        <FirstTitle
          text="Como conectar?"
          fontSize={40}
          style={{ marginBottom: 9, marginTop: 20, alignSelf: "center" }}
        />

        <View
          style={{
            height: 1,
            backgroundColor: "#F85200",
            width: "106%",
            alignSelf: "center",
            marginVertical: 12,
            marginBottom: 50,
          }}
        />

        <Image
          //source={require('@/assets/images/pareamento.png')}
          style={{
            width: "100%",
            height: height * 0.4,
            marginBottom: 50,
            alignItems: "center",
            justifyContent: "center",
          }}
        />

        <FirstCard
          customStyle={{
            width: "100%",
            height: height * 0.18,
            alignSelf: "center",
            paddingHorizontal: 16,
            marginTop: -200,
            alignItems: "center",
            borderRadius: 0,
            elevation: 0,
            shadowOpacity: 0,
          }}
        >
          <FirstTitle
            text={"Primeiramente, ligue \no Bluetooth no seu \ncelular."}
            fontSize={36}
            style={{ alignSelf: "center", textAlign: "center" }}
          />
        </FirstCard>

        <FirstTitle
          text={"Aceite a permissão do app \npara parear o dispositivo"}
          fontSize={30}
          style={{
            marginBottom: 16,
            marginTop: 12,
            alignSelf: "center",
            textAlign: "center",
          }}
        />

      
        <FirstButton
          title="Parear"
          onPress={openModal}
          customStyle={{
            marginBottom: 40,
            marginTop: 40,
            width: "85%",
            alignSelf: "center",
          }}
        />
      </ScrollView>

      
      <FirstModal visible={modalVisible} onClose={closeModal} />
    </View>
  );
}
