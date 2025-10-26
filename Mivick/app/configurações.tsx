import { FirstCard } from "@/components/FirstCard/FirstCard";
import { FirstSubTitle } from "@/components/FirstSubTitle";
import { FirstTitle } from "@/components/FirstTitle";
import { HeaderComLogin } from "@/components/HeaderComLogin";
import { FontAwesome } from "@expo/vector-icons";
import React from "react";
import { Dimensions, ScrollView, View } from "react-native";

const { height } = Dimensions.get("window");

export default function ConfigurarDispositivo() {
    return (
        <View style={{ flex: 1, backgroundColor: "#1B1B1A" }}>
            <ScrollView
                style={{ flex: 1 }}
                contentContainerStyle={{ paddingBottom: height * 0.05 }}
                showsVerticalScrollIndicator={false}
            >

                {/* --- Header --- */}
                <HeaderComLogin />

                {/* --- Titulo --- */}
                <FirstTitle
                    text={"Configurações do \ndispositivo"}
                    fontSize={32}
                    style={{
                        marginBottom: 12,
                        marginTop: 20,
                        paddingHorizontal: 25,
                    }}
                />

                {/* --- Linha --- */}
                <View
                    style={{
                        height: 1,
                        backgroundColor: "#F85200",
                        width: "106%",
                        alignSelf: "center",
                        marginVertical: 12,
                        marginBottom: -20,
                    }}
                />

                {/* Card de Status do dispositivo */}
                <FirstCard
                    customStyle={{
                        width: "100%",
                        height: height * 0.22,
                        alignSelf: "center",
                        paddingHorizontal: 25,
                        marginTop: 20,
                        borderRadius: 0,
                        elevation: 0,
                        shadowOpacity: 0,
                        marginBottom: 15,
                        justifyContent: "center",
                    }}
                >

                    <View
                        style={{
                            flexDirection: "row",
                            alignItems: "center",
                            justifyContent: "center",
                            marginBottom: 12,
                        }}
                    >
                        <FontAwesome
                            name="wifi"
                            size={22}
                            color="#FF4500"
                            style={{ marginRight: 8 }}
                        />
                        <FirstTitle text="Status do dispositivo:" fontSize={25} />
                    </View>

                    {/* Nível de bateria */}
                    <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 6, paddingHorizontal: 20, }}>
                        <FirstTitle text="Nível de bateria: " fontSize={18} />
                        <FirstSubTitle text="100%" />
                    </View>

                    {/* Dispositivo */}
                    <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 6, paddingHorizontal: 20, }}>
                        <FirstTitle text="Dispositivo: " fontSize={18} />
                        <FirstSubTitle text="Ligado" />
                    </View>

                    {/* Sensores */}
                    <View style={{ flexDirection: "row", alignItems: "center", paddingHorizontal: 20, }}>
                        <FirstTitle text="Sensores: " fontSize={18} />
                        <FirstSubTitle text="Conectados" />
                    </View>
                </FirstCard>

                {/* --- Linha --- */}
                <View
                    style={{
                        height: 1,
                        backgroundColor: "#F85200",
                        width: "90%",
                        alignSelf: "center",
                        marginVertical: 12,
                        marginBottom: 50,
                    }}
                />

                {/* --- Opções do dispositivo --- */}

                <View
                    style={{
                        alignSelf: 'center',
                        marginTop: 50,
                        marginBottom: 13,
                        borderRadius: 80,
                        borderWidth: 1,
                        borderColor: '#F85200',
                        padding: 3,
                    }}
                >  <FontAwesome
                        name="wifi"
                        size={40}
                        color="#FF4500"
                        style={{ marginRight: 8 }}
                    /></View>


                {/* --- Linha --- */}
                <View
                    style={{
                        height: 1,
                        backgroundColor: "#F85200",
                        width: "90%",
                        alignSelf: "center",
                        marginVertical: 12,
                        marginBottom: 50,
                    }}
                />


                {/* --- Histórico --- */}
            </ScrollView>
        </View>
    );
}
