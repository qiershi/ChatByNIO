package pers.kanarien.chatroom.dao.impl;

import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;
import java.util.Map.Entry;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;

import pers.kanarien.chatroom.dao.GroupInfoDao;
import pers.kanarien.chatroom.dao.UserInfoDao;
import pers.kanarien.chatroom.mapper.UserInfoMapper;
import pers.kanarien.chatroom.model.po.GroupInfo;
import pers.kanarien.chatroom.model.po.UserInfo;
import pers.kanarien.chatroom.util.Constant;

@Repository
public class UserInfoDaoImpl implements UserInfoDao {

    @Autowired
    private UserInfoMapper userInfoMapper;

    @Autowired
    private GroupInfoDao groupInfoDao;

    /**
     * 这里使用死数据，不使用数据库
     */
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
}
