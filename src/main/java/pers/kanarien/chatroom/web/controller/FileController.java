package pers.kanarien.chatroom.web.controller;

import static org.springframework.web.bind.annotation.RequestMethod.POST;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.multipart.MultipartFile;

import pers.kanarien.chatroom.model.vo.ResponseJson;
import pers.kanarien.chatroom.service.FileService;

@Controller
@RequestMapping("/chatroom")
public class FileController {

    @Autowired
    private FileService fileService;
    
    @RequestMapping(value = "/upload", method = POST)
    @ResponseBody 
    public ResponseJson upload(
            @RequestParam(value = "file", required = true) MultipartFile file, HttpServletRequest request) {
        return fileService.upload(file, request);
    }

    @GetMapping("/download")
    public void download(
            @RequestParam String filename,
            HttpServletResponse response,
            HttpServletRequest request) {
        System.out.println("请求文件为:" + filename);
        fileService.download(filename, response, request);
    }
}
