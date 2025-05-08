package pers.kanarien.chatroom.mapper;

import org.apache.ibatis.annotations.Select;
import pers.kanarien.chatroom.model.po.UserInfo;

public interface UserInfoMapper {

//    void loadUserInfo();
//
//    UserInfo getByUsername(String username);

    @Select("SELECT * FROM user WHERE user_id = #{userId}")
    UserInfo getByUserId(String userId);
}
