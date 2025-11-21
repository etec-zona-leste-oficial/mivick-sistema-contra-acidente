  /* veiculo.ino
    ESP 2 (veículo) — conecta ao ESP principal (ciclista) via BLE, envia dados do veículo.
  */
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

// ======= WIFI + WS ESP2 =======
String wifiSsid = "";
String wifiPass = "";
bool wifiReady = false;

AsyncWebSocket ws("/ws");
AsyncWebServer server(80);
bool wsStarted = false;

// ---------- CONFIG MPU / I2C (GOOUUU S3 pins) ----------
MPU6050 mpu(Wire);              // CORREÇÃO: Wire (não WWire)
#define MPU_SDA 20
#define MPU_SCL 21
bool mpuActive = false;

// ---------- SENSORES ----------
#define TRIG_PIN 3
#define ECHO_PIN 19
#define SW420_PIN 14
bool sensorActive = false;
bool sw420Active = false;
unsigned long lastImpactTime = 0;

// ---------- ACIDENTE ----------
int acidente = 0;
unsigned long lastResetTime = 0;

// ---------- BLE ----------
#define SERVICE_UUID        "12345678-1234-1234-1234-123456789abc"
#define CHARACTERISTIC_UUID "abcdefab-1234-1234-1234-abcdefabcdef"

NimBLECharacteristic* pCharacteristic = nullptr;
NimBLEServer* pServer = nullptr;   // USAR pServer aqui
bool deviceConnected = false;


// ---------- FOTO THROTTLE ----------
unsigned long lastPhotoMillis = 0;
const unsigned long PHOTO_MIN_INTERVAL = 5000; // 5s entre fotos

// ---------- HELPERS ----------
void notifyClients(String message) { if (wsStarted) ws.textAll(message); }

// ---------- CAMERA ----------
void startCamera(){
  Serial.printf("Heap antes camera: %u\n", esp_get_free_heap_size());
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

  // conservador por padrão para evitar travamentos
  config.frame_size = FRAMESIZE_VGA;
  config.jpeg_quality = 12;
  config.fb_count = 1;
  config.fb_location = CAMERA_FB_IN_DRAM;
  config.grab_mode = CAMERA_GRAB_WHEN_EMPTY;

  if (psramFound()){
    Serial.println("PSRAM detectada -> usando PSRAM para framebuffers");
    config.fb_location = CAMERA_FB_IN_PSRAM;
    config.fb_count = 2;
    config.jpeg_quality = 10;
  } else {
    Serial.println("PSRAM NAO detectada -> modo economico");
  }

  esp_err_t err = esp_camera_init(&config);
  if (err != ESP_OK) {
    Serial.printf("Camera init failed: 0x%x\n", err);
    Serial.printf("Heap apos falha: %u\n", esp_get_free_heap_size());
    return;
  }
  sensor_t *s = esp_camera_sensor_get();
  if (s) s->set_framesize(s, FRAMESIZE_QVGA);
  Serial.printf("Camera init OK. Heap apos init: %u\n", esp_get_free_heap_size());
}

void sendPhotoWS(){
  if (!wsStarted) return;
  if (millis() - lastPhotoMillis < PHOTO_MIN_INTERVAL) return; // throttle
  camera_fb_t* fb = esp_camera_fb_get();
  if (!fb) {
    Serial.println("Falha captura foto");
    return;
  }
  // encode base64
  String b64 = base64::encode(fb->buf, fb->len);
  ws.textAll(b64);
  esp_camera_fb_return(fb);
  Serial.printf("Foto enviada (%d bytes)\n", fb->len);
  lastPhotoMillis = millis();
}

// ---------- BLE callbacks ----------
class MyServerCallbacks : public NimBLEServerCallbacks {
  void onConnect(NimBLEServer* s) override {
    deviceConnected = true;
    Serial.println("BLE conectado");
  }
  void onDisconnect(NimBLEServer* s) override {
    deviceConnected = false;
    sensorActive = mpuActive = sw420Active = false;
    Serial.println("BLE desconectado - restarting adv");
    NimBLEDevice::getAdvertising()->start();
  }
};

class MyCallbacks : public NimBLECharacteristicCallbacks {
  void onWrite(NimBLECharacteristic* c) override {
    std::string val = c->getValue();
    String msg = String(val.c_str());
    Serial.println("BLE escreveu: " + msg);

    if (msg == "ON") {
      sensorActive = mpuActive = sw420Active = true;
      Serial.println("Sensores ativados");
    } else if (msg == "OFF") {
      sensorActive = mpuActive = sw420Active = false;
      Serial.println("Sensores desativados");
    } 
    // ---------- NOVO: Receber WiFi do APP ----------
else if (msg.startsWith("WIFI|")) {
  int p1 = msg.indexOf('|', 5);
  wifiSsid = msg.substring(5, p1);
  wifiPass = msg.substring(p1 + 1);

  Serial.printf("ESP2 recebeu WIFI: %s / %s\n", wifiSsid.c_str(), wifiPass.c_str());

  wifiReady = true;  // marca para conectar no loop
}
  }
};


// ---------- SETUP ----------
void setup(){
  Serial.begin(115200);
  delay(100);

  lastResetTime = millis(); // inicializa contador de reset
// ======== WIFI CONNECT ESP2 =========
if (wifiReady && WiFi.status() != WL_CONNECTED) {
  Serial.println("ESP2 conectando ao WiFi...");
  WiFi.begin(wifiSsid.c_str(), wifiPass.c_str());

  unsigned long t0 = millis();
  while (WiFi.status() != WL_CONNECTED && millis() - t0 < 8000) {
    delay(200);
    Serial.print(".");
  }

  if (WiFi.status() == WL_CONNECTED) {
    Serial.printf("\nESP2 no WiFi! IP: %s\n", WiFi.localIP().toString().c_str());

    if (!wsStarted) {
      ws.onEvent([](AsyncWebSocket *server, AsyncWebSocketClient *client, 
                    AwsEventType type, void *arg, uint8_t *data, size_t len) {
        if (type == WS_EVT_CONNECT) Serial.println("ESP2 conectado ao WS");
      });

      server.addHandler(&ws);
      server.begin();
      wsStarted = true;
      Serial.println("WebSocket ESP2 iniciado!");
    }

  } else {
    Serial.println("\nFalha ao conectar WiFi.");
  }

  wifiReady = false;
}

  // I2C MPU
  Wire.begin(MPU_SDA, MPU_SCL);
  Serial.println("I2C iniciado");
 delay(1000);
  // Camera primeiro
  startCamera();
 delay(5000);
  // BLE init
  NimBLEDevice::init("ESP32-VEICULO-BLE");
  pServer = NimBLEDevice::createServer();           // CORREÇÃO: usar pServer
  pServer->setCallbacks(new MyServerCallbacks());
  NimBLEService* svc = pServer->createService(SERVICE_UUID);
  pCharacteristic = svc->createCharacteristic(CHARACTERISTIC_UUID, NIMBLE_PROPERTY::READ | NIMBLE_PROPERTY::WRITE | NIMBLE_PROPERTY::NOTIFY);
  pCharacteristic->setCallbacks(new MyCallbacks());
  svc->start();
  NimBLEDevice::getAdvertising()->addServiceUUID(SERVICE_UUID);
  NimBLEDevice::getAdvertising()->start();
  Serial.println("BLE advertising iniciado");



  // Não iniciar WebServer ainda - só apos WiFi conectado
  pinMode(TRIG_PIN, OUTPUT);
  pinMode(ECHO_PIN, INPUT);
  pinMode(SW420_PIN, INPUT);
  Serial.println("Setup finalizado (camera + BLE). Aguardando credenciais via BLE.");
}

// ---------- LOOP ----------
void loop(){

  // Ultrassônico
  if (sensorActive){
    digitalWrite(TRIG_PIN, LOW);
    delayMicroseconds(2);
    digitalWrite(TRIG_PIN, HIGH);
    delayMicroseconds(10);
    digitalWrite(TRIG_PIN, LOW);
    long duration = pulseIn(ECHO_PIN, HIGH, 30000);
    float distance_cm = (duration == 0) ? -1 : (duration / 2.0) * 0.0343; // MESMA FÓRMULA
    if (distance_cm > 0 && distance_cm <= 100){
      Serial.printf("Objeto a %.2f cm\n", distance_cm);
      acidente++;
      if (wsStarted) sendPhotoWS();
      notifyClients("VEICULO|ULTRASSONICO|OBJETO_PROXIMO|" + String(distance_cm,2));
      delay(300);
    }
  }

  // MPU6050
  if (mpuActive){
    static bool mpuInit = false;
    if (!mpuInit){
      uint8_t status = mpu.begin();
      if (status == 0){
        mpu.calcOffsets(true, true);
        mpuInit = true;
        Serial.println("MPU iniciado");
      } else {
        Serial.printf("MPU begin status=%u\n", status);
      }
    }
    if (mpuInit){
      mpu.update();
      float acc = sqrt(mpu.getAccX()*mpu.getAccX() + mpu.getAccY()*mpu.getAccY() + mpu.getAccZ()*mpu.getAccZ());
      if (acc > 15.0){
        Serial.println("Impacto MPU");
        acidente++;
        if (pCharacteristic){
          pCharacteristic->setValue("MPU6050|BATIDA");
          pCharacteristic->notify();
        }
        notifyClients("VEICULO|MPU6050|BATIDA|" + String(acc,2));
        if (wsStarted) sendPhotoWS();
        delay(400);
      }
    }
  }

  // SW420
  if (sw420Active){
    int v = digitalRead(SW420_PIN);
    if (v == HIGH && millis() - lastImpactTime > 1000){
      lastImpactTime = millis();
      Serial.println("Impacto SW420");
      acidente++;
      if (pCharacteristic){
        pCharacteristic->setValue("SW420|IMPACTO");
        pCharacteristic->notify();
      }
      notifyClients("VEICULO|SW420|IMPACTO|1");
      if (wsStarted) sendPhotoWS();
      delay(400);
    }
  }

  // Classificacao
  if (acidente >= 2 && acidente <= 3){
    notifyClients("VEICULO|ALERTA|POSSIVEL_ACIDENTE|" + String(acidente));
    if (pCharacteristic){ pCharacteristic->setValue(("POSSIVEL_ACIDENTE|" + String(acidente)).c_str()); pCharacteristic->notify(); }
    Serial.println("POSSIVEL ACIDENTE");
    acidente = 0;
  } else if (acidente > 3 && acidente <= 5){
    notifyClients( "VEICULO|ALERTA|ACIDENTE|" + String(acidente));
    if (pCharacteristic){ pCharacteristic->setValue(("ACIDENTE|" + String(acidente)).c_str()); pCharacteristic->notify(); }
    Serial.println("ACIDENTE CONFIRMADO");
    acidente = 0;
  }

  // Reset contador se sem eventos
  if (millis() - lastResetTime > 5000 && acidente > 0){
    acidente = 0;
    lastResetTime = millis();
  }

  delay(100);
}
