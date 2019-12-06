var socket = io();
var countMembers = 0;

$('#startGame').click(function () {
    socket.emit("ready", socket.id);
    $(this).remove();
});

$(document).on('click', '#gogo', function () {
    if(countMembers > 1){
        socket.emit("start-game", 'Start Game!');
    }})
    .on('click', '#force-end', function () {
        socket.emit("force-end-game", 'Force End Game!');
    })
    .on('click', '#sortCards', function () {
        socket.emit('sort-cards');
    })
    .on('click', '.bottom .card-single', function () {
        $(this).toggleClass('selected-card');
    })

    .on('click', '#pass', function () {
        socket.emit('pass');
    })
    .on('click', '#playCards', function () {
        let cardsData = [];
        $('.selected-card').map(function(e) {
             let cardId = $(this).data('id');
            cardsData.push(cardId);
        });

        if(cardsData.length > 0){
            socket.emit('play', cardsData);
        }
    });

(function() {
    let playerE = $('.player-container.bottom');

    socket.on("room-members", data => {
        let memList = ``;
        countMembers = 0;
        data.users.map(function (e) {
            countMembers++;
            memList += `<p>UserID : ${e.userId} | ${e.isHosted ? 'Host' : 'members'}</p>`
        });

        $('#current-room-members').html(memList);
    });

    socket.on("start-btn-bind", data => {
        if(data.status === 'success'){
            $('.action-playing').html(`<button id="force-end">Force End Game!</button><button id="gogo">Go Go Go!</button>`);
        }
    });

    socket.on("card-result", data => {
        var cardHtml = ``;
        var invisibleCardHtml = ``;
        if(data.info){
            var leftPlayer = $('.left');
            var rightPlayer = $('.right');
            var topPlayer = $('.top');

            data.info.cards.map((e,i,a) =>  {
                cardHtml += `<div class="card-single" data-id="${e.id}">${e.name}</div>`;
            });

            playerE.html(cardHtml);
            playerE.prepend(`<button id="sortCards">Sap xep</button>`);
            playerE.append(`<button id="playCards">Danh!</button>`);

            for(let i = 0; i < 13; i++){
                invisibleCardHtml += `<div class="card-single card-invisible"></div>`
            }
            let order = data.info.order;
            let leftIdentity = order + 1 > 3 ? order + 1 - 4 : order + 1;
            let topIdentity = order + 2 > 3 ? order + 2 - 4 : order + 2;
            let rightIdentity = order + 3 > 3 ? order + 3 - 4 : order + 3;
            console.log(rightIdentity);

            $('.player-container:not(.bottom)').html(invisibleCardHtml);

            leftPlayer.addClass('order-' + leftIdentity);
            topPlayer.addClass('order-' + topIdentity);
            rightPlayer.addClass('order-' + rightIdentity);

        }
    });

    socket.on('card-sorted', data => {
        let cardHtml = ``;
        if(data.info){
            data.info.cards.map((e,i,a) =>  {
                cardHtml += `<div class="card-single">${e.name}</div>`;
            });
            playerE.html(cardHtml);
        }
    });


    socket.on('your-turn', data => {
        playerE.append(`<button id="pass">Bo Luot!</button>`);
    });

    socket.on('turn-passed-as-pass', data => {
        $('#pass').remove();
    });

    socket.on('not-your-turn', data => {
        alert('It\'s not your turn');
    });
    socket.on("your-turn-can-not-pass", data => {
        alert('You can not pass your turn now!');
    });
    socket.on("your-first-turn-in-first-round", data => {
        alert('You are the first player playing in this game!');
    });
    socket.on("you-need-to-play-smallest-card", data => {
        alert('You need to play combo include smallest card!');
    });

    socket.on('turn-passed-as-play', cardsData => {
        $('#pass').remove();
        let cardsPlayed = ``;
        cardsData.map(e => {
            cardsPlayed += `<div class="card-single">${e}</div>`;
        });
        $('.table').html(cardsPlayed);
    })
})();

function forceEndHack() {
    socket.emit("force-end-hack", socket.id);

}





//
// (function() {
//     fetch("/play")
//         .then(data => {
//             return data.json(); //PROMISE
//         })
//         .then(json => {
//             [json].map(data => {
//             console.log(data.user);
//             });
//         });
// })();

