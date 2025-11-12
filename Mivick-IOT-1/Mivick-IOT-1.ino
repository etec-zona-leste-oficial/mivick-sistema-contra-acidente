#include <Wire.h>
#include <Arduino.h>
#include <NimBLEDevice.h>
#include <MPU6050_light.h>
#include "esp_camera.h"
#include "board_config.h"
#include <WiFi.h>
#include <AsyncTCP.h>
#include <ESPAsyncWebServer.h>
#include "base64.h"

using namespace std;


// ================= CONFIGURAÇÃO MPU6050 =================
MPU6050 mpu(Wire);
#define MPU_SDA 20
#define MPU_SCL 21
// ================= CONFIGURAÇÃO ULTRASSÔNICO =================
#define TRIG_PIN 3
#define ECHO_PIN 19
// ================= CONFIGURAÇÃO SW-420 =================
#define SW420_PIN 14

// ================= CONFIG =================
#define SERVICE_UUID        "12345678-1234-1234-1234-123456789abc"
#define CHARACTERISTIC_UUID "abcdefab-1234-1234-1234-abcdefabcdef"
bool mpuActive = false, sensorActive = false, sw420Active = false;
int acidente = 0;
unsigned long lastImpactTime = 0, lastResetTime = 0;
String wifiSSID = "", wifiPASS = "";

AsyncWebServer server(80);
AsyncWebSocket ws("/ws");

NimBLECharacteristic* pCharacteristic = nullptr;
NimBLEServer* pServer = nullptr;
bool deviceConnected = false;
// ================= FUNÇÕES GLOBAIS =================
void notifyClients(String message) {
    ws.textAll(message);
}

void sendPhotoWS() {
    camera_fb_t *fb = esp_camera_fb_get();
    if (!fb) {
        Serial.println("❌ Falha ao capturar imagem");
        return;
    }

    String imageBase64 = base64::encode(fb->buf, fb->len);
    ws.textAll(imageBase64);
    esp_camera_fb_return(fb);
    Serial.println("✅ Foto enviada via WebSocket");
    Serial.printf("📷 Tamanho da imagem: %d bytes\n", fb->len);
}
// ================= CALLBACKS BLE =================
class MyServerCallbacks : public NimBLEServerCallbacks {
    void onConnect(NimBLEServer* pServer) override {
        deviceConnected = true;
        Serial.println("🔗 Cliente BLE conectado!");
    }
    void onDisconnect(NimBLEServer* pServer) override {
        deviceConnected = false;
        sensorActive = false;
        mpuActive = false;
        sw420Active = false;
        Serial.println("❌ Cliente BLE desconectado!");
        NimBLEDevice::getAdvertising()->start();
        Serial.println("🔄 Recomeçando advertising BLE...");
    }
};

// ================= BLE WRITE CALLBACK =================
class MyCallbacks : public NimBLECharacteristicCallbacks {
  void onWrite(NimBLECharacteristic* pCharacteristic) override {
    String msg = String(pCharacteristic->getValue().c_str());
    Serial.println("📩 Recebido via BLE: " + msg);

    if (msg == "ON") {
      sensorActive = mpuActive = sw420Active = true;
      Serial.println("✅ Sensores ativados");
    } 
    else if (msg == "OFF") {
      sensorActive = mpuActive = sw420Active = false;
      Serial.println("🛑 Sensores desativados");
    }
    else if (msg.startsWith("WIFI|")) {
      int first = msg.indexOf('|');
      int second = msg.indexOf('|', first + 1);
      wifiSSID = msg.substring(first + 1, second);
      wifiPASS = msg.substring(second + 1);
      Serial.printf("📡 Credenciais recebidas: SSID=%s, PASS=%s\n", wifiSSID.c_str(), wifiPASS.c_str());

      WiFi.begin(wifiSSID.c_str(), wifiPASS.c_str());
      unsigned long start = millis();
      while (WiFi.status() != WL_CONNECTED && millis() - start < 15000) {
        delay(500);
        Serial.print(".");
      }

      if (WiFi.status() == WL_CONNECTED) {
        Serial.println("\n✅ Wi-Fi conectado!");
        String ip = WiFi.localIP().toString();
        pCharacteristic->setValue(("WIFI_OK|" + ip).c_str());
        pCharacteristic->notify();

        // Envia Wi-Fi para o ESP do veículo
        String wifiMsg = "WIFI|" + wifiSSID + "|" + wifiPASS;
        pCharacteristic->setValue(wifiMsg.c_str());
        pCharacteristic->notify();
        Serial.println("📤 Credenciais enviadas via BLE para o ESP do veículo!");
      } else {
        pCharacteristic->setValue("WIFI_FAIL");
        pCharacteristic->notify();
      }
    }
  }
};

// ================= CAMÊRA =================
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
    config.frame_size = FRAMESIZE_UXGA;
    config.fb_location = CAMERA_FB_IN_PSRAM;
    config.grab_mode = CAMERA_GRAB_WHEN_EMPTY;
    config.jpeg_quality = 12;
    config.fb_count = 1;

    if (psramFound()) {
        config.jpeg_quality = 10;
        config.fb_count = 2;
        config.grab_mode = CAMERA_GRAB_LATEST;
    } else {
        config.frame_size = FRAMESIZE_VGA;
        config.jpeg_quality = 10;
        config.fb_location = CAMERA_FB_IN_DRAM;
    }

    esp_err_t err = esp_camera_init(&config);
    if (err != ESP_OK) {
        Serial.printf("Camera init failed with error 0x%x\n", err);
        return;
    }

    sensor_t *s = esp_camera_sensor_get();
    if (s->id.PID == OV3660_PID) {
        s->set_vflip(s, 1);
        s->set_brightness(s, 1);
        s->set_saturation(s, -2);
    }

    if (config.pixel_format == PIXFORMAT_JPEG) {
        s->set_framesize(s, FRAMESIZE_QVGA);
    }
}

// ================= SETUP =================
void setup() {
  Serial.begin(115200);
  Wire.begin(MPU_SDA, MPU_SCL);
  startCamera();

// ===== BLE =====
  NimBLEDevice::init("ESP32-CAM-BLE");
  pServer = NimBLEDevice::createServer();
  pServer->setCallbacks(new MyServerCallbacks());

  NimBLEService* pService = pServer->createService(SERVICE_UUID);
  pCharacteristic = pService->createCharacteristic(CHARACTERISTIC_UUID, NIMBLE_PROPERTY::READ | NIMBLE_PROPERTY::WRITE | NIMBLE_PROPERTY::NOTIFY);
  pCharacteristic->setCallbacks(new MyCallbacks());
  pService->start();

  NimBLEDevice::getAdvertising()->addServiceUUID(SERVICE_UUID);
  NimBLEDevice::getAdvertising()->start();

  ws.onEvent([](AsyncWebSocket *, AsyncWebSocketClient *, AwsEventType type, void *, uint8_t *, size_t){
    if (type == WS_EVT_CONNECT) Serial.println("📡 Cliente WebSocket conectado");
  });
  server.addHandler(&ws);
  server.begin();

  pinMode(TRIG_PIN, OUTPUT);
  pinMode(ECHO_PIN, INPUT);
  pinMode(SW420_PIN, INPUT);

  Serial.println("✅ Setup completo!");
}



// ================= LOOP =================
void loop() {
    ws.cleanupClients();

    // ===== ULTRASSÔNICO =====
    if (sensorActive) {
        digitalWrite(TRIG_PIN, LOW);
        delayMicroseconds(2);
        digitalWrite(TRIG_PIN, HIGH);
        delayMicroseconds(10);
        digitalWrite(TRIG_PIN, LOW);

        long duration = pulseIn(ECHO_PIN, HIGH, 30000);
        float distance_cm = (duration == 0) ? -1 : (duration / 2.0) * 0.0343;

        if (distance_cm <= 100 && distance_cm > 0) {
            Serial.printf("🚨 Objeto a %.2f cm -> próximo\n", distance_cm);
            acidente++;
            sendPhotoWS();
            notifyClients("ULTRASSONICO|OBJETO_PROXIMO|" + String(distance_cm, 2));
            delay(500);
        }
    }

    // ===== MPU6050 =====
    if (mpuActive) {
        static bool mpuInit = false;
        if (!mpuInit) {
            uint8_t status = mpu.begin();
            if (status == 0) {
                mpu.calcOffsets(true, true);
                mpuInit = true;
                Serial.println("✅ MPU6050 iniciado");
            }
        }
        if (mpuInit) {
            mpu.update();
            float accMagnitude = sqrt(
                mpu.getAccX()*mpu.getAccX() +
                mpu.getAccY()*mpu.getAccY() +
                mpu.getAccZ()*mpu.getAccZ()
            );
            if (accMagnitude > 15.0) {
                Serial.println("💥 BATIDA DETECTADA (MPU)!");
                acidente++;
                pCharacteristic->setValue("MPU6050|BATIDA");
                pCharacteristic->notify();
                notifyClients("MPU6050|BATIDA|" + String(accMagnitude, 2));
                sendPhotoWS();
                delay(500);
            }
        }
    }

    // ===== SW420 =====
    if (sw420Active) {
        int impact = digitalRead(SW420_PIN);
        if (impact == HIGH && millis() - lastImpactTime > 1000) {
            lastImpactTime = millis();
            Serial.println("💥 IMPACTO DETECTADO (SW420)!");
            acidente++;
            pCharacteristic->setValue("SW420|IMPACTO");
            pCharacteristic->notify();
            notifyClients("SW420|IMPACTO|1");
            sendPhotoWS();
            delay(500);
        }
    }

    // ===== CLASSIFICAÇÃO DO EVENTO =====
    if (acidente >= 2 && acidente <= 3) {
        notifyClients("ALERTA|POSSIVEL_ACIDENTE|" + String(acidente));
        pCharacteristic->setValue("POSSIVEL_ACIDENTE|" + String(acidente));
        pCharacteristic->notify();
        Serial.println("⚠️ POSSÍVEL ACIDENTE DETECTADO!");
        acidente = 0;
    } 
    else if (acidente > 3 && acidente <= 5) {
        notifyClients("ALERTA|ACIDENTE|" + String(acidente));
        pCharacteristic->setValue("ACIDENTE|" + String(acidente));
        pCharacteristic->notify();
        Serial.println("🚨 ACIDENTE CONFIRMADO!");
        acidente = 0;
    }

    // ===== RESET APÓS 5s SEM NOVOS EVENTOS =====
    if (millis() - lastResetTime > 5000 && acidente > 0) {
        Serial.println("🔁 Resetando contador de acidente (sem novos eventos)...");
        acidente = 0;
    }

    delay(500);
}
