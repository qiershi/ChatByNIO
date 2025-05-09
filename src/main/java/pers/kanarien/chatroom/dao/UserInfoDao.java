package pers.kanarien.chatroom.dao;

import pers.kanarien.chatroom.model.po.GroupInfo;
import pers.kanarien.chatroom.model.po.UserInfo;

import java.util.List;

public interface UserInfoDao {

    void loadUserInfo();
    
    UserInfo getByUsername(String username);
    
    UserInfo getByUserId(String userId);

    List<UserInfo> getFriendList(String userId);

    List<GroupInfo> getGroupList(String userId);

    void newFriend(String userId, String friendId);
}
