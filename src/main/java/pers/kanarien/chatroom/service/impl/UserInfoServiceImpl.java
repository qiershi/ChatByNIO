package pers.kanarien.chatroom.service.impl;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import pers.kanarien.chatroom.dao.UserInfoDao;
import pers.kanarien.chatroom.mapper.UserInfoMapper;
import pers.kanarien.chatroom.model.po.GroupInfo;
import pers.kanarien.chatroom.model.po.UserInfo;
import pers.kanarien.chatroom.model.vo.ResponseJson;
import pers.kanarien.chatroom.service.UserInfoService;

import java.util.List;

@Service
public class UserInfoServiceImpl implements UserInfoService {

    @Autowired
    private UserInfoDao userInfoDao;

    @Autowired
    private UserInfoMapper userInfoMapper;

    @Override
    public ResponseJson getByUserId(String userId) {
        ResponseJson success = new ResponseJson().success();

        UserInfo userInfo = userInfoDao.getByUserId(userId);
        success.setData("userInfo", userInfo);

        List<UserInfo> friendList = userInfoDao.getFriendList(userId);
        success.setData("friendList", friendList);

        List<GroupInfo> groupList = userInfoDao.getGroupList(userId);
        success.setData("groupList", groupList);

        System.out.println(success.toString());
        return success;
    }

}
