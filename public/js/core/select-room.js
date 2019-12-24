var socket = io();
var userNameGlobal = null;
var roomIdGlobal = null;

$(document).ready(function () {
    socket.emit('has-just-come');

    let lastUsername = localStorage.getItem('client_name');
    if (lastUsername == null || lastUsername === "") {
        $('#username').parent().removeClass('hidden');
    }
    else{
        $('.room-area').removeClass('display-none');
        $('#username').val(lastUsername); //For change Username in the future
    }
    $('#ready').click(function () {
        let userName = $('#username').val();
        if (userName !== "") {
            $('#username').parent().addClass('hidden');
            localStorage.setItem('client_name', userName);
            userNameGlobal = userName;
            $('.room-area').removeClass('display-none');

        } else {
            alertify.notify('Nhập tên trước đã!', 'error', 4, function () {
            });
        }
    });

    $('#username').keypress(function (e) {
        if (e.keyCode === 13) {
            $('#ready').click();
        }
    });

    window.onbeforeunload = function () {
        // return "";
    };

    $(document)
        .on('click', '#createRoom', function () {
            socket.emit("room-created", userNameGlobal, function (roomId) {
                roomIdGlobal = roomId;
                $('.container').removeClass('display-none');

            });
        })
        .on('click', '.room-name', function () {
            let roomId = $(this).data('id');
            socket.emit("join-a-room", roomId, userNameGlobal, function (data) {
                roomIdGlobal = roomId;
                $('.container').removeClass('display-none');
            });
        })
        .on('click', '#gogo', function () {
            socket.emit("start-game", roomIdGlobal);

        })
        .on('click', '#sortCards', function () {
            socket.emit('sort-cards', roomIdGlobal);
        })
        .on('click', '.cards .single-card', function () {
            $(this).toggleClass('picking');
            playAudio('./sound/picking.wav');
        })
        .on('click', '#pass', function () {
            socket.emit('pass', roomIdGlobal);
        })
        .on('click', '#playCards', function () {
            let cardsData = [];
            $('.picking').map(function(e) {
                let cardId = $(this).data('id');
                cardsData.push(cardId);
            });

            if(cardsData.length > 0){
                socket.emit('play', roomIdGlobal, cardsData);
            }
        });
});


(function () {
        // socket.on('ping', msg => {
        //     alert(msg);
        // });
        socket.on("rooms", data => {
        let roomList = ``;
        Object.keys(data).forEach(function (item) {
            roomList += `<div class="room-name" data-id="${item}">${item} -  So nguoi: ${data[item].length}</div>`; // key
        });
        $('.room-list').html(roomList)
        });

        socket.on("the-game-is-playing", () =>{
            alertify.notify('Bàn này đang chơi rồi, đợi hoặc chọn bàn khác nhé bạn iu!', 'error', 4, function(){});
        });
        socket.on("not-enough-player", () =>{
            alertify.notify('Chưa đủ người, tính đánh một mình hả?', 'error', 4, function(){});
        });

        socket.on("start-btn-bind", data => {
            if(data.status === 'success'){
                $('.start-game').removeClass('hidden');
            }
        });

        socket.on('you-come-in', data => {
            var selfPlayer = $('.bottom');
            selfPlayer.data('order', data.newOrder);
            selfPlayer.addClass('order-' + data.newOrder);
            selfPlayer.html(`<div class="player-info">
                    <strong>${data.comeInPlayer.userName}</strong>
                    <img src="image/node-ava.png"> </div>
                     <div class="cards-container">
                    </div>`);
        });

        socket.on("room-members", data => {
            let order = $('.bottom').data('order');
            var leftPlayer = $('.left');
            var rightPlayer = $('.right');
            var topPlayer = $('.top');

            leftPlayer.html("");
            rightPlayer.html("");
            topPlayer.html("");

            let rightIdentity = order + 1 > 3 ? order + 1 - 4 : order + 1;
            let topIdentity = order + 2 > 3 ? order + 2 - 4 : order + 2;
            let leftIdentity = order + 3 > 3 ? order + 3 - 4 : order + 3;

            leftPlayer.addClass('order-' + leftIdentity);
            topPlayer.addClass('order-' + topIdentity);
            rightPlayer.addClass('order-' + rightIdentity);

            data.users.map(function (e) {
                $('.order-' + e.order).html(`<div class="player-info">
                     <strong>${e.userName}</strong>
                    <img src="image/node-ava.png">
                    </div>
                    <div class="back-image-wrapper">
                    <img src="image/backof.jpg" class="back-image">
                     </div>`);
            });

        });

        socket.on("card-result", data => {
            var cardHtml = ``;
            if(data.info){
                data.info.cards.map((e,i,a) =>  {
                    cardHtml += `<div class="single-card" data-id="${e.id}">
                                <img src="./image/${e.id}.png">
                        </div>`;
                });
                $('.cards').html(cardHtml);
                $('.played-area-container').html('');
                $('#sortCards').removeClass('hidden');
                $('.start-game').addClass('hidden');

                let singlePlayer =$('.single-player');
                singlePlayer.removeClass('turn-active');
            }
        });

        socket.on('card-sorted', data => {
            let cardHtml = ``;
            if(data.info){
                data.info.cards.map((e,i,a) =>  {
                    cardHtml += `<div class="single-card" data-id="${e.id}">
                                <img src="./image/${e.id}.png">
                                 </div>`;
                });
                $('.cards').html(cardHtml);
                playAudio('./sound/picking.wav');
            }
        });

        socket.on("your-first-turn-in-first-round", data => {
            $('.action-container').removeClass('hidden');
        });

        socket.on('your-turn', data => {
            $('.action-container').removeClass('hidden');
        });

        socket.on('turn-passed-as-pass', orderData => {
            $('.action-container').addClass('hidden');
        });

        socket.on('turn-passed-as-pass-global', orderData => {
            $('.order-' + orderData).addClass('opacity-03');
        });
        socket.on('new-round', data => {
            $('.single-player').removeClass('opacity-03');
        });

        socket.on('turn-passed-as-play', cardsData => {
            $('.action-container').addClass('hidden');
            let cardsPlayed = ``;

            cardsData.map(id => {
                cardsPlayed += `<img class="card-played" src="./image/${id}.png">`;
            });

            $('.last-combo-container').removeClass('last-combo-highlight');
            $('.played-area-container').append(`<div class="last-combo-container last-combo-highlight">${cardsPlayed}`);

            if(cardsData.indexOf(48) !== -1 || cardsData.indexOf(49) !== -1 || cardsData.indexOf(50) !== -1 || cardsData.indexOf(51) !== -1){
                playAudio('./sound/hit-two.mp3');
            }
            else{
                playAudio('./sound/hit.wav');
            }

        });

        socket.on("remaining-cards", data => {
            let cardHtml = ``;
            if(data.info){
                data.info.cards.map((e,i,a) =>  {
                    cardHtml += `<div class="single-card" data-id="${e.id}">
                                <img src="./image/${e.id}.png">
                                 </div>`;
                });
                $('.cards').html(cardHtml);
            }
        });

        socket.on('next-player-turn', order => {
            $('.single-player').removeClass('turn-active');
            $('.order-'+ order).addClass('turn-active');
        });

        socket.on('you-win', player => {
            alertify.notify(player.userName + ' đã hết bài!', 'error', 4, function(){});
        });

        socket.on('game-end', data => {
            $('.cards').html('');
            $('.action-container').addClass('hidden');
            let singlePlayer =$('.single-player');
            singlePlayer.removeClass('opacity-03');

        });

        socket.on('kill-two', data => {
            playAudio('./sound/killtwo.mp3');
        });

        socket.on('not-your-turn', data => {
            alertify.notify('Chưa đến lượt, bình tĩnh...', 'error', 4, function(){});
        });

        socket.on("your-turn-can-not-pass", data => {
            alertify.notify('Đang cầm vòng, sao bỏ được?', 'error', 4, function(){});
        });

        socket.on("you-need-to-play-smallest-card", data => {
            alertify.notify('Ván đầu, đánh con nhỏ nhất giùm', 'error', 4, function(){});
        });

        socket.on("invalid-combo", data => {
            alertify.notify('Không được phép đánh như vậy...', 'error', 4, function(){});
        });

        socket.on("the-game-is-busy", data => {
            alert('Đợi đi, mọi người đang trong game rồi.');
        });


})();

function playAudio(url) {
    var a = new Audio(url);
    a.play();
}

