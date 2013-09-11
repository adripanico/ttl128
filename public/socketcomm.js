window.onload = function() {

    var ttl_mssgs = new Array();
    var socket = io.connect(window.location.hostname);

    var ttl_mssgs_container = document.getElementById('ttl-mssgs-container');
    var new_ttl_mssg_content_field = document.getElementById('new-ttl-mssg');
    var new_ttl_mssg_send_button = document.getElementById('send-new-ttl-mssg');
 
    //new message coming
    socket.on('message in', function (data) {
        ttl_mssgs.push(data);
        $('#ttl-mssgs-container').append('<div class="ttl-mssg" id="' + data.id + '"><div class="ttl-mssg-user">' + data.username + '</div><div class="ttl-mssg-ttl">' + data.timeremaining + '</div><div class="ttl-mssg-content">' + data.message + '</div></div>');
        //$('#' + data.id + '').find('ttl-mssg-promote').onclick = socket.emit('message up', data.id);

    });

    //one message has died
    socket.on('message to delete', function (data) {
        $('#' + data).remove();
        for (var index = 0; i < ttl_mssgs.length - 1; index++) {
            if (ttl_mssgs[index].id == data) {
                ttl_mssgs.splice(index, 1);
                break;
            }
        }
    });

    //one message has been promoted
    socket.on('message up', function (data) {
        mssg_up(data);
    });

    //definition of the events that sends a new message
    //new_ttl_mssg_send_button.onclick = function () {
    //    send_message(new_ttl_mssg_content_field.value, socket);
    //}
    new_ttl_mssg_content_field.onkeydown = function (e) {
        if (e.which == 13 || e.keyCode == 13) {
            e.preventDefault();
            send_message(new_ttl_mssg_content_field.value, socket);
        }
    }

    //timing the messages countdown (it can be client-side-hacked, but the message will be deleted anyway when ttl expires)
    setInterval(function () {
        $('.ttl-mssg-ttl').each(function (key, value) { console.log($(this).context.innerHTML--); });
    }, 1000);
 
}

function send_message(mssg, socket) {
    if (mssg.length > 128) {
        alert('You have excedeed the maximum length (128 characters)');
    } else if (mssg.length > 0) {
        var new_json_mssg = JSON.parse('{"username": "' + $("#email").text() + '",  "message": "' + mssg + '"}'); //TODO
        socket.emit('message out', new_json_mssg);
        $('#new-ttl-mssg').val('');
    }
}

function mssg_up() {
    alert('el servidor quiere promover un mensaje!');
}