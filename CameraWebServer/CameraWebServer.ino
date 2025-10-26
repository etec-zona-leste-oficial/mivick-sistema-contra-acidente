#include <Wire.h>
#include <Arduino.h>
#include <NimBLEDevice.h>
#include <MPU6050_light.h>
#include "esp_camera.h"
#include "board_config.h"
#include <WiFi.h>
#include <AsyncTCP.h>
#include <ESPAsyncWebServer.h>
#include <ArduinoWebsockets.h>
#include "base64.h"

using namespace websockets;

// ================= CONFIGURAÇÃO Wi-Fi =================
const char* ssid = "Uai Fai";
const char* password = "Rhema@1103";

// ================= CONFIGURAÇÃO MPU6050 =================
MPU6050 mpu(Wire);
#define MPU_SDA 20
#define MPU_SCL 21
bool mpuActive = false;

// ================= CONFIGURAÇÃO ULTRASSÔNICO =================
#define TRIG_PIN 3
#define ECHO_PIN 19
bool sensorActive = false;

// ================= CONFIGURAÇÃO BLE =================
#define SERVICE_UUID        "12345678-1234-1234-1234-123456789abc"
#define CHARACTERISTIC_UUID "abcdefab-1234-1234-1234-abcdefabcdef"

NimBLECharacteristic* pCharacteristic = nullptr;
NimBLEServer* pServer = nullptr;
bool deviceConnected = false;

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
    Serial.println("❌ Cliente BLE desconectado!");
    NimBLEDevice::getAdvertising()->start();
    Serial.println("🔄 Recomeçando advertising BLE...");
  }
};

class MyCallbacks : public NimBLECharacteristicCallbacks {
  void onWrite(NimBLECharacteristic* pCharacteristic) override {
    std::string value = pCharacteristic->getValue();
    Serial.print("📩 Recebido via BLE: ");
    Serial.println(value.c_str());

    if (value == "ON") {
      sensorActive = true;
      mpuActive = true;
      Serial.println("✅ Sensores ativados");
    } else if (value == "OFF") {
      sensorActive = false;
      mpuActive = false;
      Serial.println("🛑 Sensores desativados");
    }
  }
};

// ================= CONFIGURAÇÃO WEBSOCKET =================
AsyncWebServer server(80);
AsyncWebSocket ws("/ws"); // ponto de conexão WebSocket

void notifyClients(String message) {
  ws.textAll(message);
}

void sendPhotoWS() {
  camera_fb_t *fb = esp_camera_fb_get();
  if (!fb) {
    Serial.println("❌ Falha ao capturar imagem");
    return;
  }

  //ws.binaryAll(fb->buf, fb->len);
  String imageBase64 = base64::encode(fb->buf, fb->len);
  ws.textAll(imageBase64);
  esp_camera_fb_return(fb);
  Serial.println("✅ Foto enviada via WebSocket");
  Serial.printf("📷 Tamanho da imagem: %d bytes\n", fb->len);
}

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
    config.frame_size = FRAMESIZE_VGA;   // 640x480
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

#if defined(CAMERA_MODEL_M5STACK_WIDE) || defined(CAMERA_MODEL_M5STACK_ESP32CAM)
  s->set_vflip(s, 1);
  s->set_hmirror(s, 1);
#endif



#if defined(LED_GPIO_NUM)
  setupLedFlash();
#endif
}

// ================== SETUP ==================
void setup() {
  Serial.begin(115200);
  Wire.begin(MPU_SDA, MPU_SCL);
  startCamera();

  // Wi-Fi
  WiFi.begin(ssid, password);
  Serial.print("Conectando Wi-Fi");
  while (WiFi.status() != WL_CONNECTED) {
    Serial.print(".");
    delay(500);
  }
  Serial.println("\n✅ Wi-Fi conectado! IP: " + WiFi.localIP().toString());

  // WebSocket
  ws.onEvent([](AsyncWebSocket * server, AsyncWebSocketClient * client, AwsEventType type, void * arg, uint8_t *data, size_t len){
    if(type == WS_EVT_CONNECT){
      Serial.println("📡 Cliente WebSocket conectado");
    } else if(type == WS_EVT_DISCONNECT){
      Serial.println("❌ Cliente WebSocket desconectado");
    }
  });
  server.addHandler(&ws);
  server.begin();

  // Ultrassônico
  pinMode(TRIG_PIN, OUTPUT);
  pinMode(ECHO_PIN, INPUT);

  // BLE
  NimBLEDevice::init("ESP32-CAM-BLE");
  pServer = NimBLEDevice::createServer();
  pServer->setCallbacks(new MyServerCallbacks());
  NimBLEService* pService = pServer->createService(SERVICE_UUID);
  pCharacteristic = pService->createCharacteristic(
                      CHARACTERISTIC_UUID,
                      NIMBLE_PROPERTY::READ |
                      NIMBLE_PROPERTY::WRITE |
                      NIMBLE_PROPERTY::NOTIFY
                    );
  pCharacteristic->setCallbacks(new MyCallbacks());
  pService->start();
  NimBLEAdvertising* pAdvertising = NimBLEDevice::getAdvertising();
  pAdvertising->addServiceUUID(SERVICE_UUID);
  pAdvertising->start();

  Serial.println("🚀 Setup completo!");
}

// ================== LOOP ==================
void loop() {
  ws.cleanupClients();

  // Ultrassônico
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
      sendPhotoWS();
      notifyClients("ALERTA: Objeto próximo!");
      delay(500);
    }
  }

  // MPU6050
  if (mpuActive) {
    static bool mpuInit = false;
    if (!mpuInit) {
      byte status = mpu.begin();
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
        Serial.println("💥 BATIDA DETECTADA!");
        pCharacteristic->setValue("BATIDA");
        pCharacteristic->notify();
        notifyClients("ALERTA: Batida detectada!");
      }
    }
  }

  delay(200);
}
