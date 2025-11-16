/* veiculo.ino
   ESP secundário (veículo) — conecta ao ESP principal (ciclista) via BLE, envia dados do veículo.
*/

#include <Arduino.h>
#include <Wire.h>
#include <NimBLEDevice.h>
#include <WiFi.h>
#include <MPU6050_light.h>
#include "base64.h"

// ================== SENSORES ==================
MPU6050 mpu(Wire);           // CORREÇÃO: Wire (não WWire)
#define MPU_SDA 20
#define MPU_SCL 21
#define TRIG_PIN 3
#define ECHO_PIN 19
#define SW420_PIN 14

// ================== BLE ==================
static NimBLEAdvertisedDevice* advDevice = nullptr;
static NimBLEClient* pClient = nullptr;
static NimBLERemoteCharacteristic* pRemoteChar = nullptr;

const char* SERVER_BLE_NAME = "ESP32-CAM-BLE";

String wifiSSID = "";
String wifiPASS = "";
bool conectadoWiFi = false;
bool mpuInit = false;

int acidente = 0;
unsigned long lastImpactTime = 0;

// ================== FUNÇÃO: CONECTAR WI-FI ==================
void conectarWiFi(String ssid, String senha) {
  WiFi.mode(WIFI_STA);
  WiFi.begin(ssid.c_str(), senha.c_str());

  Serial.printf("📶 Conectando à rede %s...\n", ssid.c_str());

  unsigned long start = millis();
  while (WiFi.status() != WL_CONNECTED && millis() - start < 10000) {
    delay(300);
    Serial.print(".");
  }

  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\n✅ Wi-Fi conectado!");
    conectadoWiFi = true;
  } else {
    Serial.println("\n❌ Falha ao conectar ao Wi-Fi.");
  }
}

// ================== ENVIAR MSG BLE ==================
void notifyServer(String msg) {
  if (!pClient || !pClient->isConnected() || !pRemoteChar) return;

  // writeValue aceita std::string; aqui garantimos que a escrita é feita
  std::string s = msg.c_str();
  pRemoteChar->writeValue(s, false); // sem response para ser mais rápido
  Serial.println("📤 Enviado BLE: " + msg);
}

// ================== CALLBACKS ==================
class ClientCallbacks : public NimBLEClientCallbacks {
  void onConnect(NimBLEClient*) override {
    Serial.println("🔗 Conectado ao ciclista!");
  }

  void onDisconnect(NimBLEClient*) override {
    Serial.println("❌ BLE desconectado. Escaneando...");
    NimBLEDevice::getScan()->start(0);
  }
};

class AdvertisedDeviceCallbacks : public NimBLEAdvertisedDeviceCallbacks {
  void onResult(NimBLEAdvertisedDevice* dev) override {
    if (dev->getName() == SERVER_BLE_NAME) {
      Serial.println("📡 Encontrado ESP32-CAM do ciclista!");
      NimBLEDevice::getScan()->stop();
      advDevice = dev;
    }
  }
};

void connectToServer() {
  if (!advDevice) return;

  pClient = NimBLEDevice::createClient();
  pClient->setClientCallbacks(new ClientCallbacks());

  if (pClient->connect(advDevice)) {
    Serial.println("✅ Conectado ao servidor BLE!");

    NimBLERemoteService* svc = pClient->getService("12345678-1234-1234-1234-123456789abc");
    if (svc) {
      pRemoteChar = svc->getCharacteristic("abcdefab-1234-1234-1234-abcdefabcdef");

      if (pRemoteChar) {
        // recebe notificações (por exemplo WIFI|ssid|pass enviadas pelo ciclista)
        pRemoteChar->subscribe(true, [](NimBLERemoteCharacteristic*, uint8_t* d, size_t len, bool){
          String msg = String((char*)d).substring(0, len);
          Serial.println("📩 Recebido BLE: " + msg);

          if (msg.startsWith("WIFI|")) {
            int p1 = msg.indexOf('|');
            int p2 = msg.indexOf('|', p1 + 1);

            wifiSSID = msg.substring(p1 + 1, p2);
            wifiPASS = msg.substring(p2 + 1);

            conectarWiFi(wifiSSID, wifiPASS);
          }
        });
      }
    }
  }
}

// ================== SETUP ==================
void setup() {
  Serial.begin(115200);
  delay(500);

  WiFi.mode(WIFI_OFF);

  Wire.begin(MPU_SDA, MPU_SCL);

  pinMode(TRIG_PIN, OUTPUT);
  pinMode(ECHO_PIN, INPUT);
  pinMode(SW420_PIN, INPUT);

  NimBLEDevice::init("VEICULO");

  NimBLEScan* scan = NimBLEDevice::getScan();
  scan->setActiveScan(true);
  scan->setAdvertisedDeviceCallbacks(new AdvertisedDeviceCallbacks());
  scan->start(0);

  Serial.println("🔍 Procurando ESP32-CAM do ciclista...");
}

// ================== LOOP ==================
void loop() {

  // -------- Reconnect BLE --------
  if (advDevice && (!pClient || !pClient->isConnected())) {
    connectToServer();
  }

  if (!pClient || !pClient->isConnected()) {
    delay(200);
    return;
  }

  if (conectadoWiFi)
    notifyServer("VEICULO|STATUS|OK");

  // -------- Ultrassônico --------
  digitalWrite(TRIG_PIN, LOW);
  delayMicroseconds(3);
  digitalWrite(TRIG_PIN, HIGH);
  delayMicroseconds(10);
  digitalWrite(TRIG_PIN, LOW);

  long duration = pulseIn(ECHO_PIN, HIGH, 30000);
  float distance = (duration == 0) ? -1 : (duration / 2.0) * 0.0343; // MESMA FÓRMULA

  if (distance > 0 && distance < 120) {
    Serial.printf("🚗 Distância: %.1f cm\n", distance);
    acidente++;
    notifyServer("VEICULO|ULTRASSONICO|" + String(distance, 1));
  }

  // -------- MPU --------
  if (!mpuInit) {
    if (mpu.begin() == 0) {
      mpu.calcOffsets(true, true);
      mpuInit = true;
    }
  } else {
    mpu.update();
    float acc = mpu.getAccX() * mpu.getAccX() +
                mpu.getAccY() * mpu.getAccY() +
                mpu.getAccZ() * mpu.getAccZ();

    acc = sqrt(acc);

    if (acc > 15) {
      Serial.println("💥 Batida detectada");
      acidente++;
      notifyServer("VEICULO|BATIDA|" + String(acc, 2));
    }
  }

  // -------- SW420 --------
  if (digitalRead(SW420_PIN) == HIGH && millis() - lastImpactTime > 1000) {
    lastImpactTime = millis();
    Serial.println("💥 Impacto SW420");
    acidente++;
    notifyServer("VEICULO|IMPACTO|1");
  }

  // -------- Classificação --------
  if (acidente >= 2 && acidente <= 3) {
    notifyServer("ALERTA|VEICULO_POSSIVEL_ACIDENTE|" + String(acidente));
    acidente = 0;
  }

  if (acidente > 3) {
    notifyServer("ALERTA|VEICULO_ACIDENTE|" + String(acidente));
    acidente = 0;
  }

  delay(150);
}
