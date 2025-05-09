package pers.kanarien.chatroom.mapper;

import org.apache.ibatis.annotations.Insert;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;
import org.springframework.stereotype.Component;
import org.springframework.stereotype.Repository;
import pers.kanarien.chatroom.model.po.UserInfo;

import java.util.List;

@Component
public interface UserInfoMapper {

//    void loadUserInfo();

    @Select("SELECT * FROM users WHERE username = #{username}")
    UserInfo getByUsername(String username);

    @Select("SELECT * FROM users WHERE user_id = #{userId}")
    UserInfo getById(@Param("userId")String userId);

    @Select("SELECT friend_id FROM user_friends WHERE user_id = #{userId}")
    List<String> getFriendsId(String userId);

    @Select("SELECT group_id FROM group_members WHERE user_id = #{userId}")
    List<String> getGroupsId(String userId);

    @Insert("INSERT INTO user_friends(user_id, friend_id, created_at) values (#{userId}, #{friendId}, null)")
    void addFriend(
            @Param("userId")String userId,
            @Param("friendId") String friendId);

    @Insert("INSERT INTO users(user_id,username, password, avatar_url) VALUES (#{userId},#{username}, #{password}, #{avatarUrl})")
    void register(
            @Param("userId") String user_id,
            @Param("username") String username,
            @Param("password") String password,
            @Param("avatarUrl") String avatarUrl
    );

    // Mapper 接口
    @Select("SELECT MAX(CAST(user_id AS UNSIGNED)) FROM users")
    Integer getMaxUserId();
}
