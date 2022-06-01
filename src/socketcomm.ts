import { IMessage } from './message.model';
import { io, Socket } from 'socket.io-client';

window.onload = function () {
  const ttlMsgs: IMessage[] = [];
  const socket = io(window.location.hostname);

  const ttlMsgsContainer = document.getElementById('ttl-mssgs-container');
  const newTtlMsgInput = document.getElementById(
    'new-ttl-mssg',
  ) as HTMLInputElement;
  // var new_ttl_mssg_send_button = document.getElementById('send-new-ttl-mssg');

  // new message coming
  socket.on('message in', (data: IMessage) => {
    ttlMsgs.push(data);
    ttlMsgsContainer.append(
      '<div class="ttl-mssg" id="' +
        data.id +
        '"><div class="ttl-mssg-user">' +
        data.username +
        '</div><div class="ttl-mssg-ttl">' +
        data.timeRemaining +
        '</div><div class="ttl-mssg-content">' +
        data.message +
        '</div></div>',
    );
    //$('#' + data.id + '').find('ttl-mssg-promote').onclick = socket.emit('message up', data.id);
  });

  //one message has died
  socket.on('message to delete', (data: string) => {
    document.getElementById(data).remove();
    for (let index = 0; index < ttlMsgs.length - 1; index++) {
      if (ttlMsgs[index].id === data) {
        ttlMsgs.splice(index, 1);
        break;
      }
    }
  });

  //one message has been promoted
  socket.on('message up', function (data) {
    msgUp(data);
  });

  //definition of the events that sends a new message
  //new_ttl_mssg_send_button.onclick = function () {
  //    send_message(new_ttl_mssg_content_field.value, socket);
  //}
  newTtlMsgInput.onkeydown = (evt) => {
    if (evt.key === 'Enter') {
      evt.preventDefault();
      sendMsg(newTtlMsgInput.value, socket);
    }
  };

  //timing the messages countdown (it can be client-side-hacked, but the message will be deleted anyway when ttl expires)
  setInterval(() => {
    document.querySelectorAll('.ttl-mssg-ttl').forEach((value) => {
      try {
        value.innerHTML = (parseInt(value.innerHTML) - 1).toString();
      } catch {
        // do nothing
      }
    });
  }, 1000);
};

const sendMsg = (msg: string, socket: Socket) => {
  if (msg.length > 128) {
    alert('You have excedeed the maximum length (128 characters)');
  } else if (msg.length > 0) {
    const newMsg = {
      username: document.getElementById('email').innerText,
      message: msg,
    };
    socket.emit('message out', newMsg);
    document.getElementById('new-ttl-mssg').innerText = '';
  }
};

function msgUp(data: string) {
  // TODO
  console.log('The server wants to promote a message!');
}
