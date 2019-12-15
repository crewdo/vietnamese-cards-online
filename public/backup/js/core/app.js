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

    //Confirm before exit game
    window.onbeforeunload = function ()
    {
        return "";
    };


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

            playerE.find('.card-list').html(cardHtml);
            playerE.find('.action-list').html(`<button id="sortCards">Sap xep</button> <button id="playCards">Danh!</button>`)

            for(let i = 0; i < 13; i++){
                invisibleCardHtml += `<div class="card-single card-invisible"></div>`
            }
            let order = data.info.order;
            let rightIdentity = order + 1 > 3 ? order + 1 - 4 : order + 1;
            let topIdentity = order + 2 > 3 ? order + 2 - 4 : order + 2;
            let leftIdentity = order + 3 > 3 ? order + 3 - 4 : order + 3;

            $('.player-container:not(.bottom)').html(invisibleCardHtml);

            leftPlayer.addClass('order-' + leftIdentity);
            topPlayer.addClass('order-' + topIdentity);
            rightPlayer.addClass('order-' + rightIdentity);

        }
    });



    socket.on('your-turn', data => {
        playerE.find('.pass-container').html(`<button id="pass">Bo Luot!</button>`);
    });

    socket.on('next-player-turn', data => {
        $('.player-container').removeClass('turn-active');
        $('.order-'+ data).addClass('turn-active');
    });

    socket.on('you-win', data => {
       alert('You win!!!')
    });

    socket.on('turn-passed-as-pass', data => {
        $('#pass').remove();
    });

    socket.on('not-own-cards', data => {
        alert('Don\'t hack, I know that cards don\'t belong to you!');

    });

    socket.on('not-your-turn', data => {
        alert('It\'s not your turn');
    });
    socket.on("your-turn-can-not-pass", data => {
        alert('You can not pass your turn now!');
    });
    socket.on("your-first-turn-in-first-round", data => {
        console.log('You are the first player playing in this game!');
    });
    socket.on("you-need-to-play-smallest-card", data => {
        alert('You need to play combo include smallest card!');
    });

    socket.on("invalid-combo", data => {
        alert('Your combo is not valid or not bigger than their combo!');
    });

    socket.on("remaining-cards", data => {
        let cardHtml = ``;
        if(data.info){
            data.info.cards.map((e,i,a) =>  {
                cardHtml += `<div class="card-single" data-id="${e.id}">${e.name}</div>`;
            });
            playerE.find('.card-list').html(cardHtml);
        }
    });

    socket.on('card-sorted', data => {
        let cardHtml = ``;
        if(data.info){
            data.info.cards.map((e,i,a) =>  {
                cardHtml += `<div class="card-single" data-id="${e.id}">${e.name}</div>`;
            });
            playerE.find('.card-list').html(cardHtml);
        }
    });


    socket.on('turn-passed-as-play', cardsData => {
        $('#pass').remove();
        let cardsPlayed = ``;
        cardsData.map(e => {
            cardsPlayed += `<div class="card-single"  data-id="${e}">${e}</div>`;
        });
        $('.table').html(cardsPlayed);
    });

})();





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

