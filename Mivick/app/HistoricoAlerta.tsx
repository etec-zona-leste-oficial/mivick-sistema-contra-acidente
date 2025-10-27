import { FirstCard } from "@/components/FirstCard/FirstCard";
import { FirstSubTitle } from "@/components/FirstSubTitle";
import { FirstTitle } from "@/components/FirstTitle";
import { HeaderComLogin } from "@/components/HeaderComLogin";
import React from "react";
import { Dimensions, Image, ScrollView, View } from "react-native";

const { height } = Dimensions.get("window");


export default function HistoricoAlerta() {
    return (
        <View style={{ flex: 1, backgroundColor: '#000' }}>
            <ScrollView>
                <HeaderComLogin />


                <FirstTitle text="Histórico do alerta" fontSize={32} style={{ paddingHorizontal: 25, marginTop: 24 }} />

                <View
                    style={{
                        height: 1,
                        backgroundColor: "#F85200",
                        width: "106%",
                        alignSelf: "center",
                        marginVertical: 20,
                        marginBottom: 0,
                    }}
                />

                <Image
                    source={require('@/assets/images/terceira.jpg')}
                    style={{
                        width: "106%",
                        height: height * 0.25,
                        marginBottom: -12,
                        alignItems: "center",
                        justifyContent: "center",
                    }}
                />

                <FirstCard customStyle={{ width: '106%', borderRadius: 0, }}>
                    <View
                        style={{
                            borderRadius: 0,
                            borderWidth: 1,
                            borderColor: '#F85200',
                            marginTop: 1,
                            width: 210,
                            height: 22, 
                            justifyContent: 'center', 
                            alignSelf: 'center',
                            marginBottom: 10      
                        }}
                    >
                        <FirstSubTitle
                            text="Foto tirada no momento do alerta"
                            style={{
                                textAlign: 'center',
                                includeFontPadding: false, 
                                textAlignVertical: 'center', 
                                lineHeight: 18, 
                                
                            }}
                        />
                    </View>

                    {/* Nível de bateria */}
                    <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 10, paddingHorizontal: 20, marginTop: 10 }}>
                        <FirstTitle text="Sensor Ativado: " fontSize={20} />
                        <FirstSubTitle text="Sensor de distãncia" />
                    </View>

                    {/* Dispositivo */}
                    <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 10, paddingHorizontal: 20, }}>
                        <FirstTitle text="Data: " fontSize={20} />
                        <FirstSubTitle text="16/16/2025" />
                    </View>

                    {/* Sensores */}
                    <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 10, paddingHorizontal: 20, }}>
                        <FirstTitle text="Situação: " fontSize={20} />
                        <FirstSubTitle text="Alerta desligado" />
                    </View>
                </FirstCard>

                    <View
                    style={{
                        height: 1,
                        backgroundColor: "#F85200",
                        width: "85%",
                        alignSelf: "center",
                        marginVertical: -12,
                        marginBottom: 0,
                    }}
                />


            </ScrollView>
        </View>
    )
}