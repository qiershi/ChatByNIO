package pers.kanarien.chatroom.service;

import java.util.List;

public interface NewService {
    void NewFriend(String userId, String key);
    void NewGroup(String groupName, List<String> membersId);
}
