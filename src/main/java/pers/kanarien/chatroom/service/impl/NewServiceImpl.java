package pers.kanarien.chatroom.service.impl;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import pers.kanarien.chatroom.dao.GroupInfoDao;
import pers.kanarien.chatroom.dao.UserInfoDao;
import pers.kanarien.chatroom.dao.impl.GroupInfoDaoImpl;
import pers.kanarien.chatroom.dao.impl.UserInfoDaoImpl;
import pers.kanarien.chatroom.model.po.UserInfo;
import pers.kanarien.chatroom.service.NewService;

import java.util.List;

@Service
public class NewServiceImpl implements NewService {

    @Autowired
    private UserInfoDao userInfoDao;
    @Autowired
    private GroupInfoDao groupInfoDao;

    @Override
    public void NewFriend(String userId, String key) {
        // 检查 userId 是否有效
        if (key == null || key.isEmpty()) {
            throw new IllegalArgumentException("用户ID不能为空");
        }

        UserInfo byUser = userInfoDao.getByUserId(key);
        if (byUser == null) {
            throw new RuntimeException("用户不存在");
        }

        // 检查是否尝试添加自己
        if (userId.equals(key)) {
            throw new IllegalArgumentException("不能添加自己为好友");
        }

        if (byUser != null) {
            userInfoDao.newFriend(userId, byUser.getUserId());
        }
    }

    @Override
    public void NewGroup(String groupName, List<String> membersId) {
        groupInfoDao.newGroup(groupName, membersId);
    }
}
