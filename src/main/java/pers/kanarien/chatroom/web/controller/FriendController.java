package pers.kanarien.chatroom.web.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import pers.kanarien.chatroom.service.NewService;

import javax.servlet.http.HttpServletRequest;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/friends")
public class FriendController {

    @Autowired
    private NewService newService;

    @PostMapping("/add")
    public ResponseEntity<?> addFriend(
            @RequestParam("userId") String  userId,
            @RequestParam("note") String message,
            HttpServletRequest request
    ) {
        System.out.println("=== 开始处理添加好友请求 ===");
        System.out.println("接收参数 - userId: " + userId + ", message: " + message);

        try {
            // 从会话获取当前用户ID
            String currentUserId = (String) request.getSession().getAttribute("userId");
            System.out.println("当前登录用户ID: " + currentUserId);

            // 调用服务层方法
            newService.NewFriend(currentUserId, userId);
            System.out.println("服务层调用完成");

            // 构造成功响应
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "好友请求已发送");
            System.out.println("返回响应: " + response);
            return ResponseEntity.ok().body(response);

        } catch (IllegalArgumentException e) {
            System.err.println("参数错误异常: " + e.getMessage());
            e.printStackTrace(); // 打印完整堆栈轨迹
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(error);

        } catch (RuntimeException e) {
            System.err.println("运行时异常: " + e.getMessage());
            e.printStackTrace(); // 打印完整堆栈轨迹
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", e.getMessage());
            return ResponseEntity.status(409).body(error);
        } finally {
            System.out.println("=== 结束请求处理 ===");
        }
    }
}