package pers.kanarien.chatroom.web.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import pers.kanarien.chatroom.service.NewService;

import java.util.*;

// GroupController.java
@RestController
@RequestMapping("/group")
public class GroupController {

    @Autowired
    private NewService newService;

    @PostMapping("/create_group")
    public Map<String, Object> createGroup(
            @RequestParam("groupName") String groupName,
            @RequestParam("memberIds") String memberIdsStr // 前端传逗号分隔的字符串
    ) {
        Map<String, Object> response = new HashMap<>();
        try {
            // 参数转换
            List<String> memberIds = new ArrayList<>();
            for (String string : memberIdsStr.split(",")) {
                memberIds.add(string.trim());
            }

            // 执行业务逻辑
            newService.NewGroup(groupName, memberIds);

            response.put("status", 200);
            response.put("msg", "群组创建成功");

            return response;

        } catch (IllegalArgumentException e) {
            response.put("status", 400);
            response.put("msg", e.getMessage());
            return response;
        }
    }
}
