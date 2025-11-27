import React, { useEffect, useState } from "react";
import {
  Dimensions,
  Image,
  ScrollView,
  View,
  Text
} from "react-native";

import AsyncStorage from "@react-native-async-storage/async-storage";

import { FirstCard } from "@/components/FirstCard/FirstCard";
import { FirstSubTitle } from "@/components/FirstSubTitle";
import { FirstTitle } from "@/components/FirstTitle";
import { HeaderComLogin } from "@/components/HeaderComLogin";
import { BackButton } from "@/components/BackButton/BackButton";

const { width, height } = Dimensions.get("window");

export default function HistoricoAlerta() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const deviceId = await AsyncStorage.getItem("device_id");
      const token = await AsyncStorage.getItem("token");

      const resp = await fetch(
        `http://10.135.37.162:3000/app/mivick/iot/historico/${deviceId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const json = await resp.json();
      setData(json);
      setLoading(false);
    }

    load();
  }, []);

  if (loading) {
    return (
      <View style={{
        flex: 1,
        backgroundColor: "#000",
        justifyContent: "center",
        alignItems: "center",
      }}>
        <Text style={{ color: "#fff" }}>Carregando...</Text>
      </View>
    );
  }

  // COMO É LISTA
  const { alerta = [], logsBLE = [], logsWS = [], leitura } = data;

  const alertaMaisRecente = alerta.length > 0 ? alerta[0] : null;
  const outrosAlertas = alerta.length > 1 ? alerta.slice(1) : [];

  return (
    <View style={{ flex: 1, backgroundColor: "#000" }}>
      <ScrollView contentContainerStyle={{ paddingBottom: 120 }}>
        <HeaderComLogin />
        <BackButton />

        <FirstTitle
          text="Histórico"
          fontSize={Math.min(width * 0.08, 32)}
          style={{
            marginTop: height * 0.03,
            marginBottom: height * 0.025,
            textAlign: "center",
          }}
        />

        <View style={{
          height: 1,
          backgroundColor: "#F85200",
          width: "100%",
        }} />

        {/* ======================== */}
        {/*     ALERTA MAIS RECENTE */}
        {/* ======================== */}
        <FirstCard
          customStyle={{
            width: "100%",
            borderRadius: 20,
            paddingVertical: height * 0.02,
            paddingHorizontal: width * 0.05,
            marginTop: 40,
          }}
        >
          <View
            style={{
              borderRadius: 6,
              borderWidth: 1,
              borderColor: "#F85200",
              width: width * 0.6,
              height: height * 0.035,
              justifyContent: "center",
              alignSelf: "center",
              marginBottom: height * 0.015,
            }}
          >
            <FirstSubTitle
              text="Alerta mais recente"
              style={{
                textAlign: "center",
                fontSize: Math.min(width * 0.035, 15),
              }}
            />
          </View>

          {alertaMaisRecente?.foto ? (
            <Image
              source={{ uri: `data:image/jpeg;base64,${alertaMaisRecente.foto}` }}
              style={{
                width: "100%",
                height: height * 0.22,
                borderRadius: 8,
                marginBottom: height * 0.02,
              }}
              resizeMode="cover"
            />
          ) : (
            <FirstSubTitle
              text="Sem imagem registrada"
              style={{
                textAlign: "center",
                color: "#bbb",
                marginBottom: 15,
              }}
            />
          )}

          {alertaMaisRecente ? (
            <>
              <LinhaInfo label="Descrição: " value={alertaMaisRecente.descricao} />
              <LinhaInfo label="Código: " value={alertaMaisRecente.codigo} />
              <LinhaInfo label="Contato: " value={alertaMaisRecente.contato_nome} />
              <LinhaInfo label="Telefone: " value={alertaMaisRecente.contato_telefone} />
              <LinhaInfo label="Data: " value={formatarDataBonita(alertaMaisRecente.data_hora)} />
            </>
          ) : (
            <FirstSubTitle
              text="Nenhum alerta encontrado."
              style={{ color: "#bbb", textAlign: "center" }}
            />
          )}

          {/* LEITURA (SENSOR) */}
          {leitura && (
            <>
              <LinhaInfo
                label="Sensor ativado: "
                value={
                  leitura.distancia
                    ? "Sensor de Distância"
                    : leitura.impacto
                    ? "Sensor de Impacto"
                    : leitura.movimentacao
                    ? "Movimentação"
                    : "Desconhecido"
                }
              />

              <LinhaInfo
                label="Data: "
                value={formatarDataBonita(leitura.data_hora)}
              />

              <LinhaInfo
                label="Situação: "
                value={
                  leitura.acidente_identificado
                    ? "🚨 Acidente detectado"
                    : "Alerta desligado"
                }
              />
            </>
          )}
        </FirstCard>

        {/* ======================== */}
        {/*        OUTROS ALERTAS    */}
        {/* ======================== */}
        <FirstTitle
          text="Últimos alertas"
          fontSize={26}
          style={{ marginTop: 20, paddingLeft: 20 }}
        />

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20 }}>
          {outrosAlertas.length ? outrosAlertas.map((alerta: any, i: number) => (
            <FirstCard key={i} customStyle={{
              width: width * 0.75,
              padding: 20,
              marginRight: 15,
            }}>
              {alerta.foto ? (
                <Image
                  source={{ uri: `data:image/jpeg;base64,${alerta.foto}` }}
                  style={{
                    width: "100%",
                    height: 140,
                    borderRadius: 10,
                    marginBottom: 15,
                  }}
                  resizeMode="cover"
                />
              ) : (
                <FirstSubTitle
                  text="Sem imagem registrada"
                  style={{ textAlign: "center", color: "#bbb", marginBottom: 15 }}
                />
              )}

              <LinhaInfo label="Descrição: " value={alerta.descricao} />
              <LinhaInfo label="Código: " value={alerta.codigo} />
              <LinhaInfo label="Contato: " value={alerta.contato_nome} />
              <LinhaInfo label="Telefone: " value={alerta.contato_telefone} />
              <LinhaInfo label="Data: " value={formatarDataBonita(alerta.data_hora)} />
            </FirstCard>
          )) : (
            <FirstCard customStyle={{
              width: width * 0.75,
              padding: 20,
              alignItems: "center",
            }}>
              <FirstSubTitle text="Nenhum alerta encontrado." style={{ color: "#bbb" }} />
            </FirstCard>
          )}
        </ScrollView>

        {/* ======================== */}
        {/*        HISTÓRICO BLE      */}
        {/* ======================== */}
        <SectionHistorico
          titulo="Histórico Bluetooth"
          dados={logsBLE}
        />

        {/* ======================== */}
        {/*        HISTÓRICO WIFI     */}
        {/* ======================== */}
        <SectionHistorico
          titulo="Histórico Wi-Fi"
          dados={logsWS}
        />

      </ScrollView>
    </View>
  );
}

/* -------------------------------------------
   COMPONENTE DE HISTÓRICO (BLE / WIFI)
-------------------------------------------- */
function SectionHistorico({
  titulo,
  dados,
}: {
  titulo: string;
  dados: any[];
}) {
  const { width } = Dimensions.get("window");

  return (
    <>
      <FirstTitle
        text={titulo}
        fontSize={26}
        style={{ marginTop: 20, paddingLeft: 20 }}
      />

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20 }}>
        {dados.length ? dados.map((item: any, i: number) => (
          <FirstCard
            key={i}
            customStyle={{
              width: width * 0.75,
              padding: 20,
              marginRight: 15,
            }}
          >
            <LinhaInfo label="Data: " value={formatarDataBonita(item.data_hora)} />
            <LinhaInfo label="Mensagem: " value={item.mensagem} />
          </FirstCard>
        )) : (
          <FirstCard customStyle={{
            width: width * 0.75,
            padding: 20,
            alignItems: "center",
          }}>
            <FirstSubTitle text="Nenhum registro encontrado." style={{ color: "#bbb" }} />
          </FirstCard>
        )}
      </ScrollView>
    </>
  );
}

/* -------------------------------------------
   LINHA INFO (label + valor)
-------------------------------------------- */
function LinhaInfo({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "flex-start",
        marginBottom: height * 0.012,
      }}
    >
      <FirstTitle
        text={label}
        fontSize={Math.min(width * 0.05, 20)}
        style={{
          width: width * 0.28,   // garante alinhamento
          flexShrink: 0,
        }}
      />

      <FirstSubTitle
        text={value}
        style={{
          fontSize: Math.min(width * 0.04, 16),
          color: "#D9D9D9",
          flexShrink: 1,        // permite quebrar
          flexWrap: "wrap",     // quebra o texto
        }}
      />
    </View>
  );
}


/* -------------------------------------------
   FORMATADOR DE DATA
-------------------------------------------- */
function formatarDataBonita(dataStr: string) {
  const data = new Date(dataStr);
  if (isNaN(data.getTime())) return dataStr;

  const dia = String(data.getDate()).padStart(2, "0");
  const mes = String(data.getMonth() + 1).padStart(2, "0");
  const ano = data.getFullYear();
  const hora = String(data.getHours()).padStart(2, "0");
  const min = String(data.getMinutes()).padStart(2, "0");

  return `${dia}/${mes}/${ano} às ${hora}:${min}`;
}
