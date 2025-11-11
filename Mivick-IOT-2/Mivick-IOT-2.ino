#include <Arduino.h>
#include <Wire.h>
#include <NimBLEDevice.h>
#include <WiFi.h>
#include <MPU6050_light.h>
#include "base64.h"

MPU6050 mpu(Wire);
#define MPU_SDA 20
#define MPU_SCL 21
#define TRIG_PIN 3
#define ECHO_PIN 19
#define SW420_PIN 14

static NimBLEAdvertisedDevice* advDevice;
static NimBLEClient* pClient = nullptr;
static NimBLERemoteCharacteristic* pRemoteChar = nullptr;

const char* SERVER_BLE_NAME = "ESP32-CAM-BLE";
String wifiSSID = "", wifiPASS = "";
bool conectadoWiFi = false;
int acidente = 0;
unsigned long lastImpactTime = 0, lastResetTime = 0;
void conectarWiFi(String ssid, String senha) {
  WiFi.begin(ssid.c_str(), senha.c_str());
  Serial.printf("📶 Conectando à rede %s...\n", ssid.c_str());
  unsigned long start = millis();
  while (WiFi.status() != WL_CONNECTED && millis() - start < 15000) {
    delay(500);
    Serial.print(".");
  }
  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\n✅ Wi-Fi conectado com sucesso!");
    conectadoWiFi = true;
  } else {
    Serial.println("\n❌ Falha ao conectar ao Wi-Fi!");
  }
}

void notifyServer(String msg) {
  if (pRemoteChar && pClient && pClient->isConnected()) {
    pRemoteChar->writeValue(msg.c_str());
    Serial.println("📤 Enviado BLE: " + msg);
  }
}

class ClientCallbacks : public NimBLEClientCallbacks {
  void onConnect(NimBLEClient*) override { Serial.println("🔗 Conectado ao ciclista!"); }
  void onDisconnect(NimBLEClient*) override {
    Serial.println("❌ BLE desconectado. Reescaneando...");
    NimBLEDevice::getScan()->start(0);
  }
};

class AdvertisedDeviceCallbacks : public NimBLEAdvertisedDeviceCallbacks {
  void onResult(NimBLEAdvertisedDevice* advertisedDevice) override {
    if (advertisedDevice->getName() == SERVER_BLE_NAME) {
      Serial.println("📡 Encontrado servidor BLE do ciclista!");
      NimBLEDevice::getScan()->stop();
      advDevice = advertisedDevice;
    }
  }
};

void connectToServer() {
  if (!advDevice) return;
  pClient = NimBLEDevice::createClient();
  pClient->setClientCallbacks(new ClientCallbacks());

  if (pClient->connect(advDevice)) {
    Serial.println("✅ Conectado ao BLE do ciclista!");
    NimBLERemoteService* pService = pClient->getService("12345678-1234-1234-1234-123456789abc");
    if (pService) {
      pRemoteChar = pService->getCharacteristic("abcdefab-1234-1234-1234-abcdefabcdef");
      pRemoteChar->subscribe(true, [](NimBLERemoteCharacteristic*, uint8_t* data, size_t length, bool){
        String msg = String((char*)data).substring(0, length);
        Serial.println("📩 Recebido via BLE: " + msg);

        if (msg.startsWith("WIFI|")) {
          int first = msg.indexOf('|');
          int second = msg.indexOf('|', first + 1);
          wifiSSID = msg.substring(first + 1, second);
          wifiPASS = msg.substring(second + 1);
          conectarWiFi(wifiSSID, wifiPASS);
        }
      });
    }
  }
}

void setup() {
  Serial.begin(115200);
  Wire.begin(MPU_SDA, MPU_SCL);
  pinMode(TRIG_PIN, OUTPUT);
  pinMode(ECHO_PIN, INPUT);
  pinMode(SW420_PIN, INPUT);
  NimBLEDevice::init("");
  NimBLEScan* pScan = NimBLEDevice::getScan();
  pScan->setAdvertisedDeviceCallbacks(new AdvertisedDeviceCallbacks());
  pScan->setActiveScan(true);
  pScan->start(0);
  Serial.println("🔍 Procurando ESP32-CAM (ciclista)...");
}



// ==================== LOOP ====================
void loop() {
  if (advDevice && (!pClient || !pClient->isConnected())) {
    connectToServer();
  }

  if (!pClient || !pClient->isConnected()) {
    delay(500);
    return;
  }
if (conectadoWiFi) {
    // Enviar leitura simulada do veículo
    notifyServer("VEICULO|STATUS|OK");
  }
  // ===== ULTRASSÔNICO =====
  digitalWrite(TRIG_PIN, LOW);
  delayMicroseconds(2);
  digitalWrite(TRIG_PIN, HIGH);
  delayMicroseconds(10);
  digitalWrite(TRIG_PIN, LOW);

  long duration = pulseIn(ECHO_PIN, HIGH, 30000);
  float distance = (duration == 0) ? -1 : (duration / 2.0) * 0.0343;
  if (distance > 0 && distance < 100) {
    Serial.printf("🚗 Objeto a %.1f cm (veículo)\n", distance);
    acidente++;
    notifyServer("VEICULO|ULTRASSONICO|" + String(distance, 1));
  }

  // ===== MPU =====
  static bool mpuInit = false;
  if (!mpuInit) {
    if (mpu.begin() == 0) {
      mpu.calcOffsets(true, true);
      mpuInit = true;
    }
  } else {
    mpu.update();
    float acc = sqrt(pow(mpu.getAccX(), 2) + pow(mpu.getAccY(), 2) + pow(mpu.getAccZ(), 2));
    if (acc > 15.0) {
      Serial.println("💥 Batida detectada (veículo)");
      acidente++;
      notifyServer("VEICULO|BATIDA|" + String(acc, 2));
    }
  }

  // ===== SW420 =====
  int shock = digitalRead(SW420_PIN);
  if (shock == HIGH && millis() - lastImpactTime > 1000) {
    lastImpactTime = millis();
    acidente++;
    Serial.println("💥 Impacto detectado (SW420)");
    notifyServer("VEICULO|IMPACTO|1");
  }

  // ===== CLASSIFICAÇÃO =====
  if (acidente >= 2 && acidente <= 3) {
    notifyServer("ALERTA|VEICULO_POSSIVEL_ACIDENTE|" + String(acidente));
    acidente = 0;
  } else if (acidente > 3) {
    notifyServer("ALERTA|VEICULO_ACIDENTE|" + String(acidente));
    acidente = 0;
  }

  delay(300);
}
