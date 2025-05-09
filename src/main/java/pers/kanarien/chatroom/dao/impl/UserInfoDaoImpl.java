package pers.kanarien.chatroom.dao.impl;

import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;

import pers.kanarien.chatroom.dao.GroupInfoDao;
import pers.kanarien.chatroom.dao.UserInfoDao;
import pers.kanarien.chatroom.mapper.UserInfoMapper;
import pers.kanarien.chatroom.model.po.GroupInfo;
import pers.kanarien.chatroom.model.po.UserInfo;

@Repository
public class UserInfoDaoImpl implements UserInfoDao {

    @Autowired
    private UserInfoMapper userInfoMapper;

    @Autowired
    private GroupInfoDao groupInfoDao;

    @Override
    public void loadUserInfo() {

    }

    @Override
    public UserInfo getByUsername(String username) {
        return userInfoMapper.getByUsername(username);
    }
    
    @Override
    public UserInfo getByUserId(String userId) {
        return userInfoMapper.getById(userId);
    }

    @Override
    public List<UserInfo> getFriendList(String userId) {
        List<String> friendsId = userInfoMapper.getFriendsId(userId);
        List<UserInfo> friendList = new ArrayList<>();
        for (String friendId : friendsId) {
            friendList.add(getByUserId(friendId));
        }
        return friendList;
    }

    @Override
    public List<GroupInfo> getGroupList(String groupId) {
        List<String> groupsId = userInfoMapper.getGroupsId(groupId);
        List<GroupInfo> groupList = new ArrayList<>();
        for (String gId : groupsId) {
            groupList.add(groupInfoDao.getById(gId));
        }
        return groupList;
    }

    public void newFriend(String userId, String friendId) {
        userInfoMapper.addFriend(userId, friendId);
        userInfoMapper.addFriend(friendId, userId);
    }

    @Override
    public void register(UserInfo user) {
        // 查询当前最大值
        Integer maxId = userInfoMapper.getMaxUserId();
        int newUserId = (maxId == null) ? 1 : maxId + 1; // 若表为空则从1开始
        String username = user.getUsername();
        String password = user.getPassword();
        String avatarUrl = "static/img/avatar/Member00"+ ((int)(Math.random()*10)+1) + ".jpg";
        userInfoMapper.register(String.valueOf(newUserId),username,password,avatarUrl);
    }


}
