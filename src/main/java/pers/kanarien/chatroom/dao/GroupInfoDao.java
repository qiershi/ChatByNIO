package pers.kanarien.chatroom.dao;


import pers.kanarien.chatroom.model.po.GroupInfo;

import java.util.List;

public interface GroupInfoDao {

    void loadGroupInfo();
    
    GroupInfo getById(String groupId);

    List<String> getMembersId(String groupId);

    void newGroup(String groupName, List<String> membersId);
}
