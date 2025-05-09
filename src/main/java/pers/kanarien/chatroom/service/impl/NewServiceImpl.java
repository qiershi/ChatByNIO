package pers.kanarien.chatroom.service.impl;

import pers.kanarien.chatroom.dao.GroupInfoDao;
import pers.kanarien.chatroom.dao.UserInfoDao;
import pers.kanarien.chatroom.dao.impl.GroupInfoDaoImpl;
import pers.kanarien.chatroom.dao.impl.UserInfoDaoImpl;
import pers.kanarien.chatroom.model.po.UserInfo;
import pers.kanarien.chatroom.service.NewService;

import java.util.List;

public class NewServiceImpl implements NewService {

    private UserInfoDao userInfoDao = new UserInfoDaoImpl();
    private GroupInfoDao groupInfoDao = new GroupInfoDaoImpl();

    @Override
    public void NewFriend(String userId, String key) {
        UserInfo byUser = userInfoDao.getByUsername(key);
        if (byUser != null) {
            userInfoDao.newFriend(userId, byUser.getUserId());
        }
    }

    @Override
    public void NewGroup(String groupName, List<String> membersId) {
        groupInfoDao.newGroup(groupName, membersId);
    }
}
