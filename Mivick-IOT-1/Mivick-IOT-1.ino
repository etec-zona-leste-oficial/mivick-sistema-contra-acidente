// Merged - ESP32-S3 GOOUUU safe version (Option A)
// Mantém: BLE controlando WiFi, repasse VEICULO, sensores, camera, WebSocket

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
// Ajustado para ESP32-S3 GOOUUU (I2C SDA=4, SCL=5)
MPU6050 mpu(Wire);
#define MPU_SDA 20
#define MPU_SCL 21
bool mpuActive = false;

// ================= CONFIGURAÇÃO ULTRASSÔNICO =================
#define TRIG_PIN 3
#define ECHO_PIN 19
bool sensorActive = false;

// ================= CONFIGURAÇÃO SW-420 =================
#define SW420_PIN 14
bool sw420Active = false;
unsigned long lastImpactTime = 0;

// ================= VARIÁVEL DE ACIDENTE =================
int acidente = 0;
unsigned long lastResetTime = 0; // controle para resetar o contador

// ================= CONFIGURAÇÃO BLE =================
#define SERVICE_UUID        "12345678-1234-1234-1234-123456789abc"
#define CHARACTERISTIC_UUID "abcdefab-1234-1234-1234-abcdefabcdef"

NimBLECharacteristic* pCharacteristic = nullptr;
NimBLEServer* pServer = nullptr;
bool deviceConnected = false;

// ================= CONFIGURAÇÃO WEBSOCKET =================
AsyncWebServer server(80);
AsyncWebSocket ws("/ws");
bool wsStarted = false;

// ================= VARIÁVEIS WIFI (via BLE) =================
String wifiSSID = "", wifiPASS = "";
bool wifiRequest = false;       // recebeu credenciais via BLE e precisa conectar
bool wifiConnecting = false;
unsigned long wifiStartAttempt = 0;
const unsigned long WIFI_TIMEOUT = 15000; // 15s

// ================= FUNÇÕES GLOBAIS =================
void notifyClients(String message) {
    // envia mensagem textual para todos clientes WS
    ws.textAll(message);
}

void sendPhotoWS() {
    camera_fb_t *fb = esp_camera_fb_get();
    if (!fb) {
        Serial.println("❌ Falha ao capturar imagem");
        return;
    }

    String imageBase64 = base64::encode(fb->buf, fb->len);
    // se WebSocket não iniciado, evitamos enviar
    if (wsStarted) ws.textAll(imageBase64);
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

class MyCallbacks : public NimBLECharacteristicCallbacks {
    void onWrite(NimBLECharacteristic* pCharacteristic) override {
        std::string val = pCharacteristic->getValue();
        String msg = String(val.c_str());
        Serial.print("📩 Recebido via BLE: ");
        Serial.println(msg);

        // Ativa/desativa sensores
        if (msg == "ON") {
            sensorActive = true;
            mpuActive = true;
            sw420Active = true;
            Serial.println("✅ Sensores ativados");
        } else if (msg == "OFF") {
            sensorActive = false;
            mpuActive = false;
            sw420Active = false;
            Serial.println("🛑 Sensores desativados");
        }
        // Recebe credenciais Wi-Fi: WIFI|SSID|PASS
        else if (msg.startsWith("WIFI|")) {
            int first = msg.indexOf('|');
            int second = msg.indexOf('|', first + 1);
            if (first != -1 && second != -1) {
                wifiSSID = msg.substring(first + 1, second);
                wifiPASS = msg.substring(second + 1);
                Serial.printf("📡 Credenciais recebidas via BLE: SSID=%s, PASS=%s\n",
                              wifiSSID.c_str(), wifiPASS.c_str());
                // sinaliza ao loop para conectar
                wifiRequest = true;
            } else {
                Serial.println("⚠️ Formato WIFI inválido");
            }
        }
        // Mensagem do veículo -> repassar para app + ws
        else if (msg.startsWith("VEICULO|")) {
            Serial.println("📡 Mensagem do veículo recebida: " + msg);
            // Repassa via BLE (echo back)
            pCharacteristic->setValue(msg.c_str());
            pCharacteristic->notify();
            // Repassa via WebSocket (se houver)
            if (wsStarted) notifyClients(msg);
        }
    }
};

// ================= CAMÊRA =================
void startCamera() {
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

    // configuração conservadora por padrão (evita estourar memória)
    config.frame_size = FRAMESIZE_VGA;
    config.jpeg_quality = 12;
    config.fb_count = 1;
    config.fb_location = CAMERA_FB_IN_DRAM;
    config.grab_mode = CAMERA_GRAB_WHEN_EMPTY;

    if (psramFound()) {
        Serial.println("✅ PSRAM detectada - usando configuração otimizada");
        config.fb_location = CAMERA_FB_IN_PSRAM;
        config.fb_count = 2;
        config.jpeg_quality = 10;
        // ainda mantemos frame_size = VGA para estabilidade; se quiser maior, ajuste aqui
    } else {
        Serial.println("⚠️ PSRAM NÃO detectada - usando configuração economia de memória");
        config.frame_size = FRAMESIZE_VGA;
        config.fb_count = 1;
        config.fb_location = CAMERA_FB_IN_DRAM;
    }

    esp_err_t err = esp_camera_init(&config);
    if (err != ESP_OK) {
        Serial.printf("❌ Camera init failed with error 0x%x\n", err);
        Serial.printf("Heap após falha: %u\n", esp_get_free_heap_size());
        return;
    }

    sensor_t *s = esp_camera_sensor_get();
    if (s) {
        // Ajustes básicos
        s->set_framesize(s, FRAMESIZE_QVGA); // torna estável por padrão
        if (s->id.PID == OV3660_PID) {
            s->set_vflip(s, 1);
            s->set_brightness(s, 1);
            s->set_saturation(s, -2);
        }
    }

    Serial.printf("📷 Câmera iniciada. Heap após init: %u\n", esp_get_free_heap_size());
}

// ================= SETUP =================
void setup() {
    Serial.begin(115200);
    delay(100);

    // I2C do MPU (pinos do GOOUUU S3)
    Wire.begin(MPU_SDA, MPU_SCL);
    Serial.println("I2C inicializado (MPU SDA/SCL)");

    // Inicia câmera cedo
    startCamera();

    // ===== BLE =====
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

    NimBLEDevice::getAdvertising()->addServiceUUID(SERVICE_UUID);
    NimBLEDevice::getAdvertising()->start();
    Serial.println("🚀 BLE iniciado! Aguardando conexão do app...");

    // NOTA: não iniciamos WebSocket/Async server ainda; somente após Wi-Fi conectado

    // Configura trigger/sensor pins (mas não inicia o ultrassônico ativamente)
    pinMode(TRIG_PIN, OUTPUT);
    pinMode(ECHO_PIN, INPUT);
    pinMode(SW420_PIN, INPUT);

    Serial.println("✅ Setup inicial completo (camera + BLE).");
    Serial.println("Aguardando comando via BLE (WIFI|ssid|pass) ou comandos ON/OFF.");
}

// ================= LOOP =================
void loop() {
    // Ajuste de limpeza do WS (se estiver ativo)
    if (wsStarted) ws.cleanupClients();

    // ========= Gerenciamento de conexão Wi-Fi requisitada via BLE =========
    if (wifiRequest && !wifiConnecting) {
        Serial.println("🔌 Iniciando tentativa de conexão Wi-Fi (solicitada via BLE)...");
        Serial.printf("Tentando SSID: %s\n", wifiSSID.c_str());
        WiFi.begin(wifiSSID.c_str(), wifiPASS.c_str());
        wifiConnecting = true;
        wifiStartAttempt = millis();
    }

    if (wifiConnecting) {
        if (WiFi.status() == WL_CONNECTED) {
            Serial.println("\n✅ Wi-Fi conectado! IP: " + WiFi.localIP().toString());
            // Notifica via BLE
            String ip = WiFi.localIP().toString();
            if (pCharacteristic) {
                String okMsg = "WIFI_OK|" + ip;
                pCharacteristic->setValue(okMsg.c_str());
                pCharacteristic->notify();
            }
            // Envia também as credenciais para o ESP veículo (conforme antigo)
            if (pCharacteristic) {
                String wifiMsg = "WIFI|" + wifiSSID + "|" + wifiPASS;
                pCharacteristic->setValue(wifiMsg.c_str());
                pCharacteristic->notify();
                Serial.println("📤 Credenciais enviadas via BLE para o ESP do veículo!");
            }
            // Agora que Wi-Fi está ativo, inicia WebSocket/HTTP server se ainda não iniciado
            if (!wsStarted) {
                ws.onEvent([](AsyncWebSocket * server, AsyncWebSocketClient * client, AwsEventType type, void * arg, uint8_t *data, size_t len){
                    if(type == WS_EVT_CONNECT){
                        Serial.println("📡 Cliente WebSocket conectado");
                    } else if(type == WS_EVT_DISCONNECT){
                        Serial.println("❌ Cliente WebSocket desconectado");
                    }
                });
                server.addHandler(&ws);
                server.begin();
                wsStarted = true;
                Serial.println("🌐 WebServer + WebSocket iniciados");
            }

            // reset flags
            wifiRequest = false;
            wifiConnecting = false;
        } else {
            // timeout?
            if (millis() - wifiStartAttempt > WIFI_TIMEOUT) {
                Serial.println("\n❌ Timeout ao conectar Wi-Fi");
                if (pCharacteristic) {
                    pCharacteristic->setValue("WIFI_FAIL");
                    pCharacteristic->notify();
                }
                wifiRequest = false;
                wifiConnecting = false;
            }
        }
    }

    // ===== ULTRASSÔNICO =====
    if (sensorActive) {
        digitalWrite(TRIG_PIN, LOW);
        delayMicroseconds(2);
        digitalWrite(TRIG_PIN, HIGH);
        delayMicroseconds(10);
        digitalWrite(TRIG_PIN, LOW);

        long duration = pulseIn(ECHO_PIN, HIGH, 30000);
        float distance_cm = (duration == 0) ? -1 : (duration / 2.0) * 0.0343;

        if (distance_cm > 0 && distance_cm <= 100) {
            Serial.printf("🚨 Objeto a %.2f cm -> próximo\n", distance_cm);
            acidente++;
            if (wsStarted) sendPhotoWS();
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
            } else {
                Serial.printf("⚠️ Falha ao iniciar MPU6050 status=%u\n", status);
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
                if (pCharacteristic) {
                    pCharacteristic->setValue("MPU6050|BATIDA");
                    pCharacteristic->notify();
                }
                notifyClients("MPU6050|BATIDA|" + String(accMagnitude, 2));
                if (wsStarted) sendPhotoWS();
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
            if (pCharacteristic) {
                pCharacteristic->setValue("SW420|IMPACTO");
                pCharacteristic->notify();
            }
            notifyClients("SW420|IMPACTO|1");
            if (wsStarted) sendPhotoWS();
            delay(500);
        }
    }

    // ===== CLASSIFICAÇÃO DO EVENTO =====
    if (acidente >= 2 && acidente <= 3) {
        notifyClients("ALERTA|POSSIVEL_ACIDENTE|" + String(acidente));
        if (pCharacteristic) {
            pCharacteristic->setValue(("POSSIVEL_ACIDENTE|" + String(acidente)).c_str());
            pCharacteristic->notify();
        }
        Serial.println("⚠️ POSSÍVEL ACIDENTE DETECTADO!");
        acidente = 0;
    } 
    else if (acidente > 3 && acidente <= 5) {
        notifyClients("ALERTA|ACIDENTE|" + String(acidente));
        if (pCharacteristic) {
            pCharacteristic->setValue(("ACIDENTE|" + String(acidente)).c_str());
            pCharacteristic->notify();
        }
        Serial.println("🚨 ACIDENTE CONFIRMADO!");
        acidente = 0;
    }

    // ===== RESET APÓS 5s SEM NOVOS EVENTOS =====
    if (millis() - lastResetTime > 5000 && acidente > 0) {
        Serial.println("🔁 Resetando contador de acidente (sem novos eventos)...");
        acidente = 0;
    }

    delay(200);
}
