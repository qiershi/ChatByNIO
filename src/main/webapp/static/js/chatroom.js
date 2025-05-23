// 个人信息&好友消息列表
function setUserInfo() {
    $.ajax({
        type: 'POST',
        url: 'chatroom/get_userinfo',
        dataType: 'json',
        async: true,
        success: function (data) {
            console.log("获取用户信息...");
            console.log(data);
            if (data.status == 200) {
                var userInfo = data.data.userInfo;
                userId = userInfo.userId;
                $("#username").html(userInfo.username);
                $("#avatarUrl").attr("src", userInfo.avatarUrl);
                var groupListHTML = "";
                var groupList = data.data.groupList;
                for (var i = 0; i < groupList.length; i++) {
                    groupListHTML +=
                        '<li>' +
                        '<div class="liLeft"><img src="' + groupList[i].groupAvatarUrl + '"></div>' +
                        '<div class="liRight">' +
                        '<span class="hidden-groupId">' + groupList[i].groupId + '</span>' +
                        '<span class="intername">' + groupList[i].groupName + '</span>' +
                        '<span class="infor"></span>' +
                        '</div>' +
                        '</li>';
                }
                $('.conLeft ul').append(groupListHTML);

                var friendListHTML = "";
                var friendList = data.data.friendList;
                console.log(friendList[0].userId);
                for (var i = 0; i < friendList.length; i++) {
                    friendListHTML +=
                        '<li>' +
                        '<div class="liLeft"><img src="' + friendList[i].avatarUrl + '">' +
                        '<span class="online-status ' + (friendList[i].online ? '' : 'offline') + '"></span>' +
                        '</div>' +
                        '<div class="liRight">' +
                        '<span class="hidden-userId">' + friendList[i].userId + '</span>' +
                        '<span class="intername">' + friendList[i].username + '</span>' +
                        '<span class="infor"></span>' +
                        '</div>' +
                        '</li>';
                }
                // 设置好友列表
                $('.conLeft ul').append(friendListHTML);
                // 绑定好友框点击事件
                $('.conLeft ul li').on('click', friendLiClickEvent);
                // 初始化轮询好友状态
                startStatusPolling();
            } else {
                alert(data.msg);
            }
        }
    });
}

var statusUpdateInterval;
function startStatusPolling() {
    // 先立即获取一次
    fetchFriendStatus();
    // 然后每30秒更新一次
    statusUpdateInterval = setInterval(fetchFriendStatus, 30000);
}

// 获取好友在线状态
function fetchFriendStatus() {
    $.ajax({
        url: 'chatroom/get_friend_status',
        type: 'GET',
        dataType: 'json',
        success: function(response) {
            if (response.status == 200) {
                updateFriendStatusUI(response.data);
            }
        },
        error: function(error) {
            console.error('获取好友状态失败:', error);
        }
    });
}

function updateFriendStatusUI(friendsStatus) {
    friendsStatus.forEach(function(friend) {
        var $statusElement = $('.hidden-userId').filter(function() {
            return $(this).text() == friend.userId;
        }).closest('li').find('.online-status');

        $statusElement.toggleClass('offline', !friend.online);
    });
}
// WebSocket状态更新
if (typeof socket !== 'undefined') {
    socket.on('friend_status_change', function(data) {
        var $statusElement = $('.hidden-userId').filter(function() {
            return $(this).text() == data.userId;
        }).closest('li').find('.online-status');

        $statusElement.toggleClass('offline', !data.online);
    });
}
// 页面卸载时停止轮询
$(window).on('beforeunload', function() {
    if (statusUpdateInterval) {
        clearInterval(statusUpdateInterval);
    }
});



// 加号按钮功能
function initAddButton() {
    const addBtn = document.getElementById('addBtn');
    const addMenu = document.getElementById('addMenu');
    const addFriendModal = document.getElementById('addFriendModal');
    const createGroupModal = document.getElementById('createGroupModal');


    // 点击加号显示/隐藏菜单
    addBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        addMenu.style.display = addMenu.style.display === 'block' ? 'none' : 'block';
    });

    // 点击其他地方隐藏菜单
    document.addEventListener('click', function() {
        addMenu.style.display = 'none';
    });

    // 添加好友功能 - 打开弹窗
    document.getElementById('addFriend').addEventListener('click', function() {
        document.getElementById('friendModal').style.display = 'block';
        addMenu.style.display = 'none';
    });

    // 创建群聊功能 - 打开弹窗
    document.getElementById('createGroup').addEventListener('click', function() {
        // 打开弹窗前先加载好友列表
        loadFriendsForGroup();
        document.getElementById('groupModal').style.display = 'block';
        addMenu.style.display = 'none';
    });

    // 关闭弹窗
    const closeButtons = document.querySelectorAll('.friend-modal .close, .group-modal .close');
    closeButtons.forEach(button => {
        button.addEventListener('click', function() {
            this.closest('.friend-modal, .group-modal').style.display = 'none';
        });
    });

    // 点击弹窗外部关闭弹窗
    window.addEventListener('click', function(event) {
        if (event.target.classList.contains('friend-modal')) {
            document.getElementById('friendModal').style.display = 'none';
        }
        if (event.target.classList.contains('group-modal')) {
            document.getElementById('groupModal').style.display = 'none';
        }
    });

    // 确认添加好友
    document.getElementById('confirmAddFriend').addEventListener('click', function() {
        const userId = document.getElementById('friendUserID').value.trim();
        const note = document.getElementById('friendNote').value.trim();

        if (!userId) {
            alert('请输入好友ID');
            return;
        }

        // 发送添加好友请求
        sendAddFriendRequest(userId, note);
    });

    // 确认创建群聊
    document.getElementById('confirmCreateGroup').addEventListener('click', function() {
        const groupName = document.getElementById('groupName').value.trim();
        const selectedFriends = getSelectedFriends();

        if (!groupName) {
            alert('请输入群名称');
            return;
        }

        if (selectedFriends.length < 1) {
            alert('请至少选择一位好友');
            return;
        }

        // 发送创建群聊请求
        sendCreateGroupRequest(groupName, selectedFriends);
    });
}

// 加载好友列表用于创建群聊
function loadFriendsForGroup() {
    const checkboxList = document.getElementById('friendCheckboxList');
    checkboxList.innerHTML = '';

    // 假设我们从DOM中获取好友列表
    $('.conLeft ul li').each(function() {
        const userId = $(this).find('.hidden-userId').text();
        const username = $(this).find('.intername').text();

        if (userId && username) {
            const checkboxItem = document.createElement('div');
            checkboxItem.className = 'checkbox-item';
            checkboxItem.innerHTML = `
                <input type="checkbox" id="friend_${userId}" value="${userId}">
                <label for="friend_${userId}">${username}</label>
            `;
            checkboxList.appendChild(checkboxItem);
        }
    });
}

// 获取选中的好友
function getSelectedFriends() {
    const checkboxes = document.querySelectorAll('#friendCheckboxList input[type="checkbox"]:checked');
    const selectedFriends = [];

    checkboxes.forEach(checkbox => {
        selectedFriends.push(checkbox.value);
    });

    return selectedFriends;
}

// 发送添加好友请求
function sendAddFriendRequest(userId, note) {
    $.ajax({
        type: 'POST',
        url: 'api/friends/add',
        data: {
            userId: userId,
            note: note || '请求添加您为好友'
        },
        dataType: 'json',
        success: function(data) {
            if (data.success) {
                alert('好友请求已发送');
                document.getElementById('addFriendModal').style.display = 'none';
                // 清空表单
                document.getElementById('friendUserID').value = '';
                document.getElementById('friendNote').value = '';
            } else {
                alert(data.msg || '添加好友失败');
            }
        },
        error: function() {
            alert('请求失败，请稍后重试');
        }
    });
}

// 发送创建群聊请求
function sendCreateGroupRequest(groupName, memberIds) {
    $.ajax({
        type: 'POST',
        url: 'group/create_group',
        data: {
            groupName: groupName,
            memberIds: memberIds.join(',')
        },
        dataType: 'json',
        success: function(data) {
            console.log(data);
            if (data.status == 200) {
                alert('群聊创建成功');
                document.getElementById('createGroupModal').style.display = 'none';
                // 清空表单
                document.getElementById('groupName').value = '';
                // 刷新群组列表
                setUserInfo();
            } else {
                alert(data.msg || '创建群聊失败');
            }
        },
        error: function() {
            alert('请求失败，请稍后重试');
        }
    });
}

// 搜索功能
function initSearch() {
    $('.searchInput').on('input', function() {
        const keyword = $(this).val().trim().toLowerCase();

        if (keyword === '') {
            $('.conLeft ul li').show();
            return;
        }

        $('.conLeft ul li').each(function() {
            const text = $(this).find('.intername').text().toLowerCase();
            if (text.includes(keyword)) {
                $(this).show();
            } else {
                $(this).hide();
            }
        });
    });
}

//连接
var ws = {
    register: function () {
        if (!window.WebSocket) {
            return;
        }
        if (socket.readyState == WebSocket.OPEN) {
            var data = {
                "userId": userId,
                "type": "REGISTER"
            };
            socket.send(JSON.stringify(data));
        } else {
            alert("Websocket连接没有开启！");
        }
    },

    singleSend: function (fromUserId, toUserId, content) {
        if (!window.WebSocket) {
            return;
        }
        if (socket.readyState == WebSocket.OPEN) {
            var data = {
                "fromUserId": fromUserId,
                "toUserId": toUserId,
                "content": content,
                "type": "SINGLE_SENDING"
            };
            socket.send(JSON.stringify(data));
        } else {
            alert("Websocket连接没有开启！");
        }
    },

    groupSend: function (fromUserId, toGroupId, content) {
        if (!window.WebSocket) {
            return;
        }
        if (socket.readyState == WebSocket.OPEN) {
            var data = {
                "fromUserId": fromUserId,
                "toGroupId": toGroupId,
                "content": content,
                "type": "GROUP_SENDING"
            };
            socket.send(JSON.stringify(data));
        } else {
            alert("Websocket连接没有开启！");
        }
    },

    fileMsgSingleSend: function (fromUserId, toUserId, originalFilename, fileUrl, fileSize) {
        if (!window.WebSocket) {
            return;
        }
        if (socket.readyState == WebSocket.OPEN) {
            var data = {
                "fromUserId": fromUserId,
                "toUserId": toUserId,
                "originalFilename": originalFilename,
                "fileUrl": fileUrl,
                "fileSize": fileSize,
                "type": "FILE_MSG_SINGLE_SENDING"
            };
            socket.send(JSON.stringify(data));
        } else {
            alert("Websocket连接没有开启！");
        }
    },

    fileMsgGroupSend: function (fromUserId, toGroupId, originalFilename, fileUrl, fileSize) {
        if (!window.WebSocket) {
            return;
        }
        if (socket.readyState == WebSocket.OPEN) {
            var data = {
                "fromUserId": fromUserId,
                "toGroupId": toGroupId,
                "originalFilename": originalFilename,
                "fileUrl": fileUrl,
                "fileSize": fileSize,
                "type": "FILE_MSG_GROUP_SENDING"
            };
            socket.send(JSON.stringify(data));
        } else {
            alert("Websocket连接没有开启！");
        }
    },

    registerReceive: function () {
        console.log("userId为 " + userId + " 的用户登记到在线用户表成功！");
    },

    singleReceive: function (data) {
        // 获取、构造参数
        console.log(data);
        var fromUserId = data.fromUserId;
        var content = data.content;
        var fromAvatarUrl;
        var $receiveLi;
        $('.conLeft').find('span.hidden-userId').each(function () {
            if (this.innerHTML == fromUserId) {
                fromAvatarUrl = $(this).parent(".liRight")
                    .siblings(".liLeft").children('img').attr("src");
                $receiveLi = $(this).parent(".liRight").parent("li");
            }
        })
        var answer = '';
        answer += '<li>' +
            '<div class="answers">' + content + '</div>' +
            '<div class="answerHead"><img src="' + fromAvatarUrl + '"/></div>' +
            '</li>';

        // 消息框处理
        processMsgBox.receiveSingleMsg(answer, fromUserId);
        // 好友列表处理
        processFriendList.receiving(content, $receiveLi);
    },

    groupReceive: function (data) {
        // 获取、构造参数
        console.log(data);
        var fromUserId = data.fromUserId;
        var content = data.content;
        var toGroupId = data.toGroupId;
        var fromAvatarUrl;
        var $receiveLi;
        $('.conLeft').find('span.hidden-userId').each(function () {
            if (this.innerHTML == fromUserId) {
                fromAvatarUrl = $(this).parent(".liRight")
                    .siblings(".liLeft").children('img').attr("src");
                /* $receiveLi = $(this).parent(".liRight").parent("li"); */
            }
        })
        $('.conLeft').find('span.hidden-groupId').each(function () {
            if (this.innerHTML == toGroupId) {
                $receiveLi = $(this).parent(".liRight").parent("li");
            }
        })
        var answer = '';
        answer += '<li>' +
            '<div class="answers">' + content + '</div>' +
            '<div class="answerHead"><img src="' + fromAvatarUrl + '"/></div>' +
            '</li>';

        // 消息框处理
        processMsgBox.receiveGroupMsg(answer, toGroupId);
        // 好友列表处理
        processFriendList.receiving(content, $receiveLi);
    },

    fileMsgSingleRecieve: function (data) {
        // 获取、构造参数
        console.log(data);
        var fromUserId = data.fromUserId;
        var originalFilename = data.originalFilename;
        var fileSize = data.fileSize;
        var fileUrl = data.fileUrl;
        var content = "[文件]";
        var fromAvatarUrl;
        var $receiveLi;
        $('.conLeft').find('span.hidden-userId').each(function () {
            if (this.innerHTML == fromUserId) {
                fromAvatarUrl = $(this).parent(".liRight")
                    .siblings(".liLeft").children('img').attr("src");
                $receiveLi = $(this).parent(".liRight").parent("li");
            }
        })
        var fileHtml =
            '<li>' +
            '<div class="receive-file-shown">' +
            '<div class="media">' +
            '<div class="media-body"> ' +
            '<h5 class="media-heading">' + originalFilename + '</h5>' +
            '<span>' + fileSize + '</span>' +
            '</div>' +
            '<a href="' + fileUrl + '" class="media-right">' +
            '<i class="glyphicon glyphicon-file" style="font-size:28pt;"></i>' +
            '</a>' +
            '</div>' +
            '</div>' +
            '<div class="answerHead"><img src="' + fromAvatarUrl + '"/></div>' +
            '</li>';

        // 消息框处理
        processMsgBox.receiveSingleMsg(fileHtml, fromUserId);
        // 好友列表处理
        processFriendList.receiving(content, $receiveLi);
    },

    fileMsgGroupRecieve: function (data) {
        // 1. 获取、构造参数
        console.log(data);
        var fromUserId = data.fromUserId;
        var toGroupId = data.toGroupId;
        var originalFilename = data.originalFilename;
        var fileSize = data.fileSize;
        var fileUrl = data.fileUrl;
        var content = "[文件]";
        var fromAvatarUrl;
        var $receiveLi;
        $('.conLeft').find('span.hidden-userId').each(function () {
            if (this.innerHTML == fromUserId) {
                fromAvatarUrl = $(this).parent(".liRight")
                    .siblings(".liLeft").children('img').attr("src");
                /* $receiveLi = $(this).parent(".liRight").parent("li"); */
            }
        })
        $('.conLeft').find('span.hidden-groupId').each(function () {
            if (this.innerHTML == toGroupId) {
                $receiveLi = $(this).parent(".liRight").parent("li");
            }
        })
        var fileHtml =
            '<li>' +
            '<div class="receive-file-shown">' +
            '<div class="media">' +
            '<div class="media-body"> ' +
            '<h5 class="media-heading">' + originalFilename + '</h5>' +
            '<span>' + fileSize + '</span>' +
            '</div>' +
            '<a href="' + fileUrl + '" class="media-right">' +
            '<i class="glyphicon glyphicon-file" style="font-size:28pt;"></i>' +
            '</a>' +
            '</div>' +
            '</div>' +
            '<div class="answerHead"><img src="' + fromAvatarUrl + '"/></div>' +
            '</li>';

        // 2. 消息框处理
        processMsgBox.receiveGroupMsg(fileHtml, toGroupId);
        // 3. 好友列表处理
        processFriendList.receiving(content, $receiveLi);
    },

    remove: function () {
        socket.close();
    }
};

//退出登录
function logout() {
    // 1. 关闭websocket连接
    ws.remove();

    // 2. 注销登录状态
    $.ajax({
        type: 'POST',
        url: 'logout',
        dataType: 'json',
        async: true,
        success: function (data) {
            if (data.status == 200) {
                // 3. 注销成功，进行页面跳转
                console.log("注销成功！");
                window.location.href = "login";
            } else {
                alert(data.msg);
            }
        }
    });
}

// 绑定发送按钮回车事件
$('#dope').keydown(function (e) {
    if (e.keyCode == 13) {
        $('.sendBtn').trigger('click');
        e.preventDefault(); //屏蔽enter对系统作用。按后增加\r\n等换行
    }
});

// 绑定发送按钮点击事件
$('.sendBtn').on('click', function () {
    var fromUserId = userId;
    var toUserId = $('#toUserId').val();
    var toGroupId = $('#toGroupId').val();
    var news = $('#dope').val();
    if (toUserId == '' && toGroupId == '') {
        alert("请选择对话方");
        return;
    }
    if (news == '') {
        alert('消息不能为空');
        return;
    } else {
        if (toUserId.length != 0) {
            ws.singleSend(fromUserId, toUserId, news);
        } else {
            ws.groupSend(fromUserId, toGroupId, news);
        }

        $('#dope').val('');
        var avatarUrl = $('#avatarUrl').attr("src");
        var msg = '';
        msg += '<li>' +
            '<div class="news">' + news + '</div>' +
            '<div class="nesHead"><img src="' + avatarUrl + '"/></div>' +
            '</li>';

        // 消息框处理：
        processMsgBox.sendMsg(msg, toUserId, toGroupId)

        // 好友列表处理：
        var $sendLi = $('.conLeft').find('li.bg');
        processFriendList.sending(news, $sendLi);
    }
})

// 表情包
function initEmojis() {
    // 1. 生成表情HTML
    const emojiContainer = $('.emjon ul');
    const emojiCount = 24; // 表情总数
    const emojiBasePath = 'static/img/emoji/emoji_';

    emojiContainer.empty(); // 清空容器

    // 循环生成表情HTML
    for (let i = 1; i <= emojiCount; i++) {
        const num = i < 10 ? `0${i}` : i;
        emojiContainer.append(`
            <li>
                <img src="${emojiBasePath}${num}.png" alt="表情${num}" data-emoji="emoji_${num}">
            </li>
        `);
    }

    // 2. 绑定表情面板显示/隐藏事件
    $('.ExP').on('mouseenter', function() {
        $('.emjon').show();
    });

    $('.emjon').on('mouseleave', function() {
        $('.emjon').hide();
    });

    // 3. 绑定表情点击事件
    $('.emjon').on('click', 'li', function() {
        const imgSrc = $(this).find('img').attr('src');
        $('.emjon').hide();

        const toUserId = $('#toUserId').val();
        const toGroupId = $('#toGroupId').val();

        if (!toUserId && !toGroupId) {
            alert("请选择对话方");
            return;
        }

        const content = `<img class="Expr" src="${imgSrc}">`;
        const avatarUrl = $('#avatarUrl').attr('src');
        const msg = `
            <li>
                <div class="news">${content}</div>
                <div class="nesHead"><img src="${avatarUrl}"/></div>
            </li>
        `;

        // 发送消息
        if (toUserId) {
            ws.singleSend(userId, toUserId, content);
        } else {
            ws.groupSend(userId, toGroupId, content);
        }

        // 处理消息显示
        processMsgBox.sendMsg(msg, toUserId, toGroupId);

        // 更新消息列表
        const $sendLi = $('.conLeft').find('li.bg');
        processFriendList.sending("[表情]", $sendLi);
    });
}




//疑似聊天窗
function setSentMessageMap() {
    sentMessageMap = new SentMessageMap();
    sentMessageMap.put("001", new Array());
    sentMessageMap.put("002", new Array());
    sentMessageMap.put("003", new Array());
    sentMessageMap.put("004", new Array());
    sentMessageMap.put("005", new Array());
    sentMessageMap.put("006", new Array());
    sentMessageMap.put("007", new Array());
    sentMessageMap.put("008", new Array());
    sentMessageMap.put("009", new Array());
    sentMessageMap.put("01", new Array());
}



$(".myfile").fileinput({
    uploadUrl: "chatroom/upload",
    uploadAsync: true, //默认异步上传
    showUpload: true, //是否显示上传按钮,跟随文本框的那个
    showRemove: false, //显示移除按钮,跟随文本框的那个
    showCaption: false,//是否显示标题,就是那个文本框
    showPreview: true, //是否显示预览,不写默认为true
    dropZoneTitle: "请通过拖拽图片文件放到这里",
    dropZoneEnabled: false,//是否显示拖拽区域，默认不写为true，但是会占用很大区域
    maxFileSize: 30720,//单位为kb，如果为0表示不限制文件大小
    maxFileCount: 1, //表示允许同时上传的最大文件个数
    enctype: 'multipart/form-data',
    validateInitialCount: true,
    previewFileIcon: "<i class='glyphicon glyphicon-file'></i>",
    msgFilesTooMany: "选择上传的文件数量({n}) 超过允许的最大数值{m}！",
    language: 'zh'
})
//异步上传返回结果处理
$('.myfile').on('fileerror', function (event, data, msg) {
    console.log("fileerror");
    console.log(data);
});
//异步上传返回结果处理
$(".myfile").on("fileuploaded", function (event, data, previewId, index) {

    // 1. 上传成功1.5秒后自动关闭上传模态框
    console.log("fileuploaded");
    setTimeout(function () {
        $('#upload-cancel').trigger('click');
        $('.fileinput-remove').trigger('click');
    }, 1500);

    // 2. 获取、设置参数
    var returnData = data.response.data;
    var originalFilename = returnData.originalFilename;
    var fileSize = returnData.fileSize;
    var fileUrl = returnData.fileUrl;
    var content = "[文件]";
    var fromUserId = userId;
    var avatarUrl = $('#avatarUrl').attr("src");
    var $sendLi = $('.conLeft').find('li.bg');
    var toUserId = $('#toUserId').val();
    var toGroupId = $('#toGroupId').val();
    var fileHtml =
        '<li>' +
        '<div class="send-file-shown">' +
        '<div class="media">' +
        '<a href="' + fileUrl + '" class="media-left">' +
        '<i class="glyphicon glyphicon-file" style="font-size:28pt;"></i>' +
        '</a>' +
        '<div class="media-body"> ' +
        '<h5 class="media-heading">' + originalFilename + '</h5>' +
        '<span>' + fileSize + '</span>' +
        '</div>' +
        '</div>' +
        '</div>' +
        '<div class="nesHead"><img src="' + avatarUrl + '"/></div>' +
        '</li>';

    // 3. 发送信息到服务器
    if (toUserId.length != 0) {
        ws.fileMsgSingleSend(fromUserId, toUserId, originalFilename, fileUrl, fileSize);
    } else {
        ws.fileMsgGroupSend(fromUserId, toGroupId, originalFilename, fileUrl, fileSize);
    }

    // 4. 消息框处理：
    processMsgBox.sendFileMsg(fileHtml, toUserId, toGroupId);

    // 5. 好友列表处理
    processFriendList.sending(content, $sendLi);
});

//上传前
$('.myfile').on('filepreupload', function (event, data, previewId, index) {
    console.log("filepreupload");
});






// 好友框点击事件
function friendLiClickEvent() {

    // 1. 设置点击阴影效果
    $(this).addClass('bg').siblings().removeClass('bg');

    // 2. 设置显示右侧消息框
    $('.conRight').css("display", "flex");

    // 3. 设置消息框显示对方信息，清空对方id
    var intername = $(this).children('.liRight').children('.intername').text();
    var toUserId = $(this).children('.liRight').children('.hidden-userId').text();
    var toGroupId = $(this).children('.liRight').children('.hidden-groupId').text();

    $('.headName').text(intername);
    $('#toUserId').val("");
    $('#toGroupId').val("");

    // 4. 设置显示已收到的信息，设置好对方的id
    $('.newsList').html('');
    var messageArray;
    if (toUserId.length != 0) {
        messageArray = sentMessageMap.get(toUserId);
        $('#toUserId').val(toUserId);
    } else {
        messageArray = sentMessageMap.get(toGroupId);
        $('#toGroupId').val(toGroupId);
    }
    for (var i = 0; i < messageArray.length; i++) {
        $('.newsList').append(messageArray[i]);
    }

    // 5.设置消息框滚动条滑到底部
    $('.RightCont').scrollTop($('.RightCont')[0].scrollHeight);

    // 6. 去掉红色提醒徽章
    var $badge = $(this).find(".layui-badge");
    if ($badge.length > 0) {
        $badge.remove();
    }
}

// 处理消息框的对象，统一管理相关处理函数，主要包括4个事件函数：
// (实际上应该有8个事件函数，发送得4个：单发普通信息、群发普通信息、单发文件信息、群发文件信息，
// 再加上对应的接收4个，但根据实际情况，发现代码可重用，于是便缩减为4个)
// 1. sendMsg: 发送(单个、群)消息时，调用此函数处理消息框变化；
// 2. sendFileMsg： 文件上传成功后，发送(单个、群)文件消息时，调用此函数处理消息框变化；
// 3. receiveSingleMsg： 收到单发(普通对话、文件)消息时，调用此函数处理消息框变化；
// 4. receiveGroupMsg： 收到群发(普通对话、文件)消息时，调用此函数处理消息框变化。
var processMsgBox = {
    sendMsg: function (msg, toUserId, toGroupId) {
        // 1. 把内容添加到消息框
        $('.newsList').append(msg);

        // 2. 手动计算、调整回显消息的宽度
        var $newsDiv = $('.newsList li').last().children("div").first();
        var fixWidth = 300; // 自定义的消息框本身的最长宽度
        var maxWidth = 493; // 消息框所在行(div)的满宽度(不包含头像框的宽度部分)
        var minMarginLeftWidth = 224; // 按理说应该是 maxwidth - fixWidth，这里出现了点问题
        var marginLeftWidth; // 要计算消息框的margin-left宽度
        if ($newsDiv.actual('width') < fixWidth) {
            marginLeftWidth = maxWidth - $newsDiv.actual('width');;
            $newsDiv.css("margin-left", marginLeftWidth + "px");
        } else {
            $newsDiv.css("width", fixWidth + "px")
                .css("margin-left", minMarginLeftWidth + "px");
        }

        // 3. 把 调整后的消息html标签字符串 添加到已发送用户消息表
        if (toUserId.length != 0) {
            sentMessageMap.get(toUserId).push($('.newsList li').last().prop("outerHTML"));
        } else {
            sentMessageMap.get(toGroupId).push($('.newsList li').last().prop("outerHTML"));
        }

        // 4. 滚动条往底部移
        $('.RightCont').scrollTop($('.RightCont')[0].scrollHeight);
    },

    sendFileMsg: function (msg, toUserId, toGroupId) {
        // 注意，文件信息消息框不需要计算宽度，已通过css设置好固定的样式
        // 1. 回显发送的新消息
        $('.newsList').append(msg);

        // 2. 把消息html标签字符串 添加到已发送用户消息表
        if (toUserId.length != 0) {
            sentMessageMap.get(toUserId).push($('.newsList li').last().prop("outerHTML"));
        } else {
            sentMessageMap.get(toGroupId).push($('.newsList li').last().prop("outerHTML"));
        }

        // 3. 消息框往下移
        $('.RightCont').scrollTop($('.RightCont')[0].scrollHeight);
    },

    receiveSingleMsg: function (msg, fromUserId) {
        // 1. 设置消息框可见
        $('.conRight').css("display", "-webkit-box");

        // 2. 把新消息放到暂存区$('.newsList-temp)，如果用户正处于与发出新消息的用户的消息框，则消息要回显
        $('.newsList-temp').append(msg);
        var $focusUserId = $(".conLeft .bg").find('span.hidden-userId');
        if ($focusUserId.length > 0 && $focusUserId.html() == fromUserId) {
            $('.newsList').append(msg);
        }

        // 3. 利用暂存区手动计算、调整新消息的宽度；
        var $answersDiv = $('.newsList-temp li').last().children("div").first();
        var fixWidth = 300; // 消息框本身的最长宽度
        var maxWidth = 480; // 消息框所在行(div)的满宽度(不包含头像框的宽度部分)
        var minMarginRightWidth = 212; // 按理说应该是 maxwidth - fixWidth，这里出现了点问题
        var marginRightWidth; // 要计算消息框的margin-right宽度
        if ($answersDiv.actual('width') < fixWidth) {
            marginRightWidth = maxWidth - $answersDiv.actual('width');
            $answersDiv.css("margin-right", marginRightWidth + "px");
            if ($focusUserId.length > 0 && $focusUserId.html() == fromUserId) {
                $('.newsList li').last().children("div").first()
                    .css("margin-right", marginRightWidth + "px");
            }
        } else {
            $answersDiv.css("width", fixWidth + "px")
                .css("margin-right", minMarginRightWidth + "px");
            if ($focusUserId.length > 0 && $focusUserId.html() == fromUserId) {
                $('.newsList li').last().children("div").first()
                    .css("width", fixWidth + "px")
                    .css("margin-right", minMarginRightWidth + "px");
            }
        }

        // 4. 把 调整后的消息html标签字符串 添加到已发送用户消息表，并清空暂存区
        sentMessageMap.get(fromUserId).push($('.newsList-temp li').last().prop("outerHTML"));
        $('.newsList-temp').empty();

        // 5. 滚动条滑到底
        $('.RightCont').scrollTop($('.RightCont')[0].scrollHeight);
    },

    receiveGroupMsg: function (msg, toGroupId) {
        // 1. 设置消息框可见
        $('.conRight').css("display", "-webkit-box");

        // 2. 把新消息放到暂存区$('.newsList-temp)，如果用户正处于与发出新消息的用户的消息框，则消息要回显
        $('.newsList-temp').append(msg);
        var $focusGroupId = $(".conLeft .bg").find('span.hidden-groupId');
        if ($focusGroupId.length > 0 && $focusGroupId.html() == toGroupId) {
            $('.newsList').append(msg);
        }

        // 3. 手动计算、调整回显消息的宽度
        var $answersDiv = $('.newsList-temp li').last().children("div").first();
        var fixWidth = 300; // 消息框本身的最长宽度
        var maxWidth = 480; // 消息框所在行(div)的满宽度(不包含头像框的宽度部分)
        var minMarginRightWidth = 212; // 按理说应该是 maxwidth - fixWidth，这里出现了点问题
        var marginRightWidth; // 要计算消息框的margin-right宽度
        if ($answersDiv.actual('width') < fixWidth) {
            marginRightWidth = maxWidth - $answersDiv.actual('width');
            $answersDiv.css("margin-right", marginRightWidth + "px");
            if ($focusGroupId.length > 0 && $focusGroupId.html() == toGroupId) {
                $('.newsList li').last().children("div").first()
                    .css("margin-right", marginRightWidth + "px");
            }
        } else {
            $answersDiv.css("width", fixWidth + "px")
                .css("margin-right", minMarginRightWidth + "px");
            if ($focusGroupId.length > 0 && $focusGroupId.html() == toGroupId) {
                $('.newsList li').last().children("div").first()
                    .css("width", fixWidth + "px")
                    .css("margin-right", minMarginRightWidth + "px");
            }
        }

        // 4. 把 调整后的消息html标签字符串 添加到已发送用户消息表，并清空暂存区
        sentMessageMap.get(toGroupId).push($('.newsList-temp li').last().prop("outerHTML"));
        $('.newsList-temp').empty();

        // 5. 滚动条滑到底
        $('.RightCont').scrollTop($('.RightCont')[0].scrollHeight);
    }
}

//未读提醒
var processFriendList = {
    sending: function (content, $sendLi) {
        // 1. 设置部分新消息提醒
        if (content.length > 8) {
            content = content.substring(0, 8) + "...";
        }
        $('.conLeft').find('li.bg').children('.liRight').children('.infor').text(content);
        // 2. 如果存在新消息提醒徽章，则去除徽章
        if ($sendLi.find('.layui-badge').length > 0) {
            $sendLi.find('.layui-badge').remove();
        }
        //$('.conLeft ul').prepend('<li class="bg">' + $sendLi.html() + '</li>');
        // 3. 好友框新消息置顶
        $('.conLeft ul').prepend($sendLi.prop("outerHTML"));
        $sendLi.remove();
        $('.conLeft ul li').first().on('click', friendLiClickEvent)
    },

    receiving: function (content, $receiveLi) {
        // 1. 设置红色提醒徽章
        var $badge = $receiveLi.find(".layui-badge");
        if ($badge.length > 0) {
            $badge.html(parseInt($badge.html()) + 1);
        } else {
            var badgeHTML = '<span class="layui-badge badge-avatar">1</span>';
            $receiveLi.children(".liLeft").prepend(badgeHTML);
        }
        // 2. 设置部分新消息提醒
        if (content.length > 8) { // 只显示前八个字符
            content = content.substring(0, 8) + "...";
        }
        if (content.search("<img") != -1) { // 若是图片，显示 “[图片]”
            content = "[图片]";
        }
        $receiveLi.children(".liRight").children('.infor').text(content);

        // 3. 新消息置顶
        $('.conLeft ul').prepend($receiveLi.prop("outerHTML"));
        $('.conLeft ul li').first().on('click', friendLiClickEvent);
        $receiveLi.remove();
    }
}

// 自定义数据结构：已发送用户消息表
function SentMessageMap() {
    this.elements = new Array();

    //获取MAP元素个数
    this.size = function () {
        return this.elements.length;
    };

    //判断MAP是否为空
    this.isEmpty = function () {
        return (this.elements.length < 1);
    };

    //删除MAP所有元素
    this.clear = function () {
        this.elements = new Array();
    };

    //向MAP中增加元素（key, value)
    this.put = function (_key, _value) {
        this.elements.push({
            key: _key,
            value: _value
        });
    };

    //删除指定KEY的元素，成功返回True，失败返回False
    this.removeByKey = function (_key) {
        var bln = false;
        try {
            for (i = 0; i < this.elements.length; i++) {
                if (this.elements[i].key == _key) {
                    this.elements.splice(i, 1);
                    return true;
                }
            }
        } catch (e) {
            bln = false;
        }
        return bln;
    };

    //删除指定VALUE的元素，成功返回True，失败返回False
    this.removeByValue = function (_value) {//removeByValueAndKey
        var bln = false;
        try {
            for (i = 0; i < this.elements.length; i++) {
                if (this.elements[i].value == _value) {
                    this.elements.splice(i, 1);
                    return true;
                }
            }
        } catch (e) {
            bln = false;
        }
        return bln;
    };

    //删除指定VALUE的元素，成功返回True，失败返回False
    this.removeByValueAndKey = function (_key, _value) {
        var bln = false;
        try {
            for (i = 0; i < this.elements.length; i++) {
                if (this.elements[i].value == _value && this.elements[i].key == _key) {
                    this.elements.splice(i, 1);
                    return true;
                }
            }
        } catch (e) {
            bln = false;
        }
        return bln;
    };

    //获取指定KEY的元素值VALUE，失败返回NULL
    this.get = function (_key) {
        try {
            for (i = 0; i < this.elements.length; i++) {
                if (this.elements[i].key == _key) {
                    return this.elements[i].value;
                }
            }
        } catch (e) {
            return false;
        }
        return false;
    };

    //获取指定索引的元素（使用element.key，element.value获取KEY和VALUE），失败返回NULL
    this.element = function (_index) {
        if (_index < 0 || _index >= this.elements.length) {
            return null;
        }
        return this.elements[_index];
    };

    //判断MAP中是否含有指定KEY的元素
    this.containsKey = function (_key) {
        var bln = false;
        try {
            for (i = 0; i < this.elements.length; i++) {
                if (this.elements[i].key == _key) {
                    bln = true;
                }
            }
        } catch (e) {
            bln = false;
        }
        return bln;
    };

    //判断MAP中是否含有指定VALUE的元素
    this.containsValue = function (_value) {
        var bln = false;
        try {
            for (i = 0; i < this.elements.length; i++) {
                if (this.elements[i].value == _value) {
                    bln = true;
                }
            }
        } catch (e) {
            bln = false;
        }
        return bln;
    };

    //判断MAP中是否含有指定VALUE的元素
    this.containsObj = function (_key, _value) {
        var bln = false;
        try {
            for (i = 0; i < this.elements.length; i++) {
                if (this.elements[i].value == _value && this.elements[i].key == _key) {
                    bln = true;
                }
            }
        } catch (e) {
            bln = false;
        }
        return bln;
    };

    //获取MAP中所有VALUE的数组（ARRAY）
    this.values = function () {
        var arr = new Array();
        for (i = 0; i < this.elements.length; i++) {
            arr.push(this.elements[i].value);
        }
        return arr;
    };

    //获取MAP中所有VALUE的数组（ARRAY）
    this.valuesByKey = function (_key) {
        var arr = new Array();
        for (i = 0; i < this.elements.length; i++) {
            if (this.elements[i].key == _key) {
                arr.push(this.elements[i].value);
            }
        }
        return arr;
    };

    //获取MAP中所有KEY的数组（ARRAY）
    this.keys = function () {
        var arr = new Array();
        for (i = 0; i < this.elements.length; i++) {
            arr.push(this.elements[i].key);
        }
        return arr;
    };

    //获取key通过value
    this.keysByValue = function (_value) {
        var arr = new Array();
        for (i = 0; i < this.elements.length; i++) {
            if (_value == this.elements[i].value) {
                arr.push(this.elements[i].key);
            }
        }
        return arr;
    };

    //获取MAP中所有KEY的数组（ARRAY）
    this.keysRemoveDuplicate = function () {
        var arr = new Array();
        for (i = 0; i < this.elements.length; i++) {
            var flag = true;
            for (var j = 0; j < arr.length; j++) {
                if (arr[j] == this.elements[i].key) {
                    flag = false;
                    break;
                }
            }
            if (flag) {
                arr.push(this.elements[i].key);
            }
        }
        return arr;
    };
}




// 在页面加载完成后调用初始化函数
$(document).ready(function() {

    initEmojis();
    initAddButton();
    initSearch();

});