import React from "react";
import { View, ScrollView, Text, Dimensions, Image } from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import { FirstTitle } from "@/components/FirstTitle";
import { FirstSubTitle } from "@/components/FirstSubTitle";
import { FirstButton } from "@/components/FirstButton";
import { FirstCard } from "@/components/FirstCard/FirstCard";
import { HeaderComLogin } from "@/components/HeaderComLogin";
import { Header } from "@/components/Header";


const { height, width } = Dimensions.get("window");

export default function ConectarDispositivo() {
    return
    (
        <View style={{ flex: 1, backgroundColor: '#1B1B1A' }}>
            <ScrollView>
                <Header />
                <FirstTitle
                    text="Como conectar?"
                />


                <View
                    style={{
                        height: 2,
                        backgroundColor: '#F85200',
                        width: '106%',
                        alignSelf: 'center',
                        marginVertical: 12,
                        marginBottom: 50,
                    }}
                />

                <Image
                    source={require('@/assets/images/pareamento.png')}
                    style={{
                        width: '100%',
                        height: height * 0.4,
                        marginBottom: 50,
                    }}
                />

            </ScrollView>
        </View>
    )
}