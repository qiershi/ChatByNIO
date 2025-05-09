package pers.kanarien.chatroom.dao.impl;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;

import pers.kanarien.chatroom.dao.GroupInfoDao;
import pers.kanarien.chatroom.mapper.GroupInfoMapper;
import pers.kanarien.chatroom.model.po.GroupInfo;

@Repository
public class GroupInfoDaoImpl implements GroupInfoDao{

    @Autowired
    private GroupInfoMapper groupInfoMapper;

    @Override
    public void loadGroupInfo() {
    }

    @Override
    public GroupInfo getById(String groupId) {
        return groupInfoMapper.getById(groupId);
    }

    @Override
    public List<String> getMembersId(String groupId) {
        return groupInfoMapper.getMembersId(groupId);
    }

    @Override
    public void newGroup(String groupName, List<String> membersId) {
        // 查询当前最大值
        Integer maxId = groupInfoMapper.getMaxGroupId();
        int newGroupId = (maxId == null) ? 1 : maxId + 1; // 若表为空则从1开始
        groupInfoMapper.newGroup(String.valueOf(newGroupId),groupName);

        GroupInfo groupInfo = groupInfoMapper.getByName(groupName);
        String id = groupInfo.getGroupId();
        for (String memberId : membersId) {
            groupInfoMapper.newGroupMembers(id,memberId);
        }
    }
}
