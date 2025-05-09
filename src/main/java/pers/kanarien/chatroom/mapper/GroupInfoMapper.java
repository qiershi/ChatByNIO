package pers.kanarien.chatroom.mapper;

import org.apache.ibatis.annotations.Insert;
import org.apache.ibatis.annotations.Select;
import org.springframework.stereotype.Component;
import pers.kanarien.chatroom.model.po.GroupInfo;

import java.util.List;

@Component
public interface GroupInfoMapper {

    @Select("SELECT * FROM `groups` WHERE group_id = #{groupId}")
    GroupInfo getById(String groupId);

    @Select("SELECT * FROM `groups` WHERE group_name = #{groupName}")
    GroupInfo getByName(String groupName);


    @Select("SELECT user_id FROM group_members WHERE group_id = #{group_id}")
    List<String> getMembersId(String groupId);

    @Insert("INSERT INTO `groups`(group_id, group_name, group_avatar_url) values (null, #{groupName}, null)")
    void newGroup(String groupName);

    @Insert("INSERT INTO group_members(group_id, user_id, join_time) values (#{groupId},#{userId},null)")
    void newGroupMembers(String groupId, String userId);
}
