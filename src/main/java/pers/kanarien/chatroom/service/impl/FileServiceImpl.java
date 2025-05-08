package pers.kanarien.chatroom.service.impl;

import org.apache.commons.fileupload.disk.DiskFileItem;
import org.springframework.stereotype.Service;
import org.springframework.util.StreamUtils;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.multipart.commons.CommonsMultipartFile;
import pers.kanarien.chatroom.model.vo.ResponseJson;
import pers.kanarien.chatroom.service.FileService;
import pers.kanarien.chatroom.util.FileUtils;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;

@Service
public class FileServiceImpl implements FileService {

    private final static String SERVER_URL_PREFIX = "http://localhost:8080/chatroom/download?";
    private final static String FILE_STORE_PATH = "UploadFile";

    @Override
    public ResponseJson upload(MultipartFile file, HttpServletRequest request) {
        // 重命名文件，防止重名
        String filename = getRandomUUID();
        String suffix = "";
        String originalFilename = file.getOriginalFilename();
        String fileSize = FileUtils.getFormatSize(file.getSize());

        // 截取文件的后缀名
        if (originalFilename.contains(".")) {
            suffix = originalFilename.substring(originalFilename.lastIndexOf("."));
        }
        filename = filename + suffix;

        String prefix = request.getSession().getServletContext().getRealPath("/") + FILE_STORE_PATH;
        System.out.println("存储路径为:" + prefix + "\\" + filename);
        Path directory = Paths.get(prefix);

        try {
            Files.createDirectories(directory);

            Path filePath = directory.resolve(filename);
            Files.copy(file.getInputStream(), filePath);

            String fileUrl = SERVER_URL_PREFIX + "filename=" + filename;

            return new ResponseJson().success()
                    .setData("originalFilename", originalFilename)
                    .setData("fileSize", fileSize)
                    .setData("fileUrl", fileUrl);

        } catch (IOException e) {
            e.printStackTrace();
            return new ResponseJson().error("文件上传发生错误！");
        }
    }

    private String getRandomUUID() {
        return UUID.randomUUID().toString().replace("-", "");
    }

    @Override
    public void download(String filename, HttpServletResponse response, HttpServletRequest request) {
        // 构建文件存储路径
        String prefix = request.getSession().getServletContext().getRealPath("/") + FILE_STORE_PATH;
        Path filePath = Paths.get(prefix, filename);

        // 检查文件是否存在
        if (!Files.exists(filePath)) {
            response.setStatus(HttpServletResponse.SC_NOT_FOUND);
            return;
        }

        // 设置响应头
        String contentType = FileUtils.detectContentType(filePath);
        response.setContentType(contentType);
        response.setHeader("Content-Disposition", "attachment; filename=\"" + filename + "\"");

        // 将文件写入响应流
        File file = new File(String.valueOf(filePath));
        MultipartFile multipartFile;
        DiskFileItem fileItem = new DiskFileItem("file", "text/plain", true, file.getName(), (int) file.length(), file.getParentFile());
        try {
            org.apache.commons.io.FileUtils.copyFile(file,fileItem.getOutputStream());
            multipartFile = new CommonsMultipartFile(fileItem);
            StreamUtils.copy(multipartFile.getInputStream(), response.getOutputStream());
            response.flushBuffer();
        } catch (IOException e) {
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            e.printStackTrace();
        }
    }
}
