package pers.kanarien.chatroom.service;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.springframework.web.multipart.MultipartFile;

import pers.kanarien.chatroom.model.vo.ResponseJson;

public interface FileService {
    public void download(String filename, HttpServletResponse response, HttpServletRequest request);
    ResponseJson upload(MultipartFile file, HttpServletRequest request);
}
