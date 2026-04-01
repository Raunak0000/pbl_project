package com.syncpace.backend.controller;

import java.util.Map;

import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;

@Controller
public class WebSocketsController {
    @MessageMapping("/live-editing")
    @SendTo("/topic/live-editing")
    public Map<String, Object> handleLiveEditingEvent(Map<String, Object> event) {
        return event;
    }

}
