package pers.kanarien.chatroom.web.controller;

import javax.servlet.http.HttpSession;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import pers.kanarien.chatroom.model.po.UserInfo;
import pers.kanarien.chatroom.model.vo.ResponseJson;
import pers.kanarien.chatroom.service.SecurityService;
import pers.kanarien.chatroom.service.UserInfoService;

@Controller
public class SecurityController {

    @Autowired
    SecurityService securityService;
    
    @RequestMapping(value = {"login", "/"}, method = RequestMethod.GET)
    public String toLogin() {
        return "login";
    }
    
    @RequestMapping(value = "login", method = RequestMethod.POST)
    @ResponseBody
    public ResponseJson login(HttpSession session,
            @RequestParam String username,
            @RequestParam String password) {
        return securityService.login(username, password, session);
    }
    
    @RequestMapping(value = "logout", method = RequestMethod.POST)
    @ResponseBody
    public ResponseJson logout(HttpSession session) {
        return securityService.logout(session);
    }

    @Autowired
    private UserInfoService registrationService;
    @GetMapping("/registerForm")
    public String toRegister(){
        return "register";
    }
    @PostMapping("/register")
    @ResponseBody
    public ResponseJson register(@RequestBody UserInfo user) {
        return registrationService.register(user.getUsername(), user.getPassword());
    }
}
