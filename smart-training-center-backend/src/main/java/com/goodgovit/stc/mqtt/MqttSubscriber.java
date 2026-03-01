package com.goodgovit.stc.mqtt;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.integration.annotation.ServiceActivator;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageHeaders;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class MqttSubscriber {

    private final MqttMessageHandler mqttMessageHandler;

    /**
     * Receives all inbound MQTT messages from the mqttInputChannel
     * and delegates to MqttMessageHandler for processing.
     */
    @ServiceActivator(inputChannel = "mqttInputChannel")
    public void handleMqttMessage(Message<?> message) {
        MessageHeaders headers = message.getHeaders();
        String topic = (String) headers.get("mqtt_receivedTopic");
        String payload = message.getPayload().toString();

        log.debug("MQTT subscriber received: topic={}", topic);
        mqttMessageHandler.handleMessage(topic, payload);
    }
}
