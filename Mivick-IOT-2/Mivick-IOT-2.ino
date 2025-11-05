#include <Arduino.h>
#include <Wire.h>
#include <NimBLEDevice.h>
#include <MPU6050_light.h>
#include "esp_camera.h"
#include "board_config.h"
#include "base64.h"

// ==================== CONFIGURAÇÃO MPU ====================
MPU6050 mpu(Wire);
#define MPU_SDA 20
#define MPU_SCL 21

// ==================== ULTRASSÔNICO ====================
#define TRIG_PIN 3
#define ECHO_PIN 19

// ==================== SW420 ====================
#define SW420_PIN 14

// ==================== VARIÁVEIS ====================
bool sensoresAtivos = true;
int acidente = 0;
unsigned long lastImpactTime = 0;
unsigned long lastResetTime = 0;

// ==================== CONFIGURAÇÃO BLE CLIENT ====================
static NimBLEAdvertisedDevice* advDevice;
static NimBLEClient* pClient = nullptr;
static NimBLERemoteCharacteristic* pRemoteChar = nullptr;

const char* SERVER_BLE_NAME = "ESP32-CAM-BLE"; // nome do ESP do usuário

void notifyServer(String msg) {
  if (pRemoteChar && pClient && pClient->isConnected()) {
    pRemoteChar->writeValue(msg.c_str());
    Serial.println("📤 Enviado BLE: " + msg);
  }
}

class ClientCallbacks : public NimBLEClientCallbacks {
  void onConnect(NimBLEClient* pClient) override {
    Serial.println("🔗 Conectado ao ESP do usuário!");
  }
  void onDisconnect(NimBLEClient* pClient) override {
    Serial.println("❌ Desconectado! Tentando reconectar...");
    delay(2000);
    NimBLEDevice::getScan()->start(0);
  }
};

class AdvertisedDeviceCallbacks : public NimBLEAdvertisedDeviceCallbacks {
  void onResult(NimBLEAdvertisedDevice* advertisedDevice) override {
    if (advertisedDevice->getName() == SERVER_BLE_NAME) {
      Serial.println("📡 Encontrado servidor BLE!");
      NimBLEDevice::getScan()->stop();
      advDevice = advertisedDevice;
    }
  }
};

// ==================== CONECTAR AO ESP USUÁRIO ====================
void connectToServer() {
  if (!advDevice) return;
  pClient = NimBLEDevice::createClient();
  pClient->setClientCallbacks(new ClientCallbacks());

  if (pClient->connect(advDevice)) {
    Serial.println("✅ Conectado ao ESP Usuário via BLE!");

    NimBLERemoteService* pService = pClient->getService("12345678-1234-1234-1234-123456789abc");
    if (pService) {
      pRemoteChar = pService->getCharacteristic("abcdefab-1234-1234-1234-abcdefabcdef");
    }
  } else {
    Serial.println("❌ Falha na conexão BLE");
    NimBLEDevice::deleteClient(pClient);
  }
}

// ==================== CÂMERA ====================
void startCamera() {
  camera_config_t config;
  config.ledc_channel = LEDC_CHANNEL_0;
  config.ledc_timer = LEDC_TIMER_0;
  config.pin_d0 = Y2_GPIO_NUM;
  config.pin_d1 = Y3_GPIO_NUM;
  config.pin_d2 = Y4_GPIO_NUM;
  config.pin_d3 = Y5_GPIO_NUM;
  config.pin_d4 = Y6_GPIO_NUM;
  config.pin_d5 = Y7_GPIO_NUM;
  config.pin_d6 = Y8_GPIO_NUM;
  config.pin_d7 = Y9_GPIO_NUM;
  config.pin_xclk = XCLK_GPIO_NUM;
  config.pin_pclk = PCLK_GPIO_NUM;
  config.pin_vsync = VSYNC_GPIO_NUM;
  config.pin_href = HREF_GPIO_NUM;
  config.pin_sccb_sda = SIOD_GPIO_NUM;
  config.pin_sccb_scl = SIOC_GPIO_NUM;
  config.pin_pwdn = PWDN_GPIO_NUM;
  config.pin_reset = RESET_GPIO_NUM;
  config.xclk_freq_hz = 20000000;
  config.pixel_format = PIXFORMAT_JPEG;
  config.frame_size = FRAMESIZE_VGA;
  config.jpeg_quality = 12;
  config.fb_count = 1;

  esp_camera_init(&config);
}

// ==================== SETUP ====================
void setup() {
  Serial.begin(115200);
  Wire.begin(MPU_SDA, MPU_SCL);
  startCamera();

  pinMode(TRIG_PIN, OUTPUT);
  pinMode(ECHO_PIN, INPUT);
  pinMode(SW420_PIN, INPUT);

  NimBLEDevice::init("");
  NimBLEScan* pScan = NimBLEDevice::getScan();
  pScan->setAdvertisedDeviceCallbacks(new AdvertisedDeviceCallbacks());
  pScan->setInterval(45);
  pScan->setWindow(15);
  pScan->setActiveScan(true);
  pScan->start(0);

  Serial.println("🔍 Procurando ESP do usuário...");
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
