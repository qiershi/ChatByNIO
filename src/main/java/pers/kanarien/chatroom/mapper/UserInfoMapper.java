package pers.kanarien.chatroom.mapper;

import org.apache.ibatis.annotations.Insert;
import org.apache.ibatis.annotations.Select;
import org.springframework.stereotype.Component;
import pers.kanarien.chatroom.model.po.UserInfo;

import java.util.List;

@Component
public interface UserInfoMapper {

//    void loadUserInfo();

    @Select("SELECT * FROM users WHERE username = #{username}")
    UserInfo getByUsername(String username);

    @Select("SELECT * FROM users WHERE user_id = #{userId}")
    UserInfo getById(String userId);

    @Select("SELECT friend_id FROM user_friends WHERE user_id = #{userId}")
    List<String> getFriendsId(String userId);

    @Select("SELECT group_id FROM group_members WHERE user_id = #{userId}")
    List<String> getGroupsId(String userId);

    @Insert("INSERT INTO user_friends(user_id, friend_id, created_at) values (#{userId}, #{friendId}, null)")
    void addFriend(String userId, String friendId);
}
