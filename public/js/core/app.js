var socket = io();
var countMembers = 0;

$(document).ready(function () {
    $('#ready').click(function () {
        socket.emit("ready", socket.id);
        $(this).parent().remove();
    });

    $(document).on('click', '#gogo', function () {
        if(countMembers > 1){
            socket.emit("start-game", 'Start Game!');
        }})
        // .on('click', '#force-end', function () {
        //     socket.emit("force-end-game", 'Force End Game!');
        // })
        .on('click', '#sortCards', function () {
            socket.emit('sort-cards');
        })
        .on('click', '.cards .single-card', function () {
            $(this).toggleClass('picking');
        })
        .on('click', '#pass', function () {
            socket.emit('pass');
        })
        .on('click', '#playCards', function () {
            let cardsData = [];
            $('.picking').map(function(e) {
                let cardId = $(this).data('id');
                cardsData.push(cardId);
            });

            if(cardsData.length > 0){
                socket.emit('play', cardsData);
            }
        });
});
(function() {
    // window.onbeforeunload = functionxs ()
    // {
    //     return true;
    // };
    socket.on('you-come-in', data => {
        var selfPlayer = $('.bottom');
        selfPlayer.addClass('order-' + data.newOrder);
        selfPlayer.html(`<div class="player-info">
                    <strong>${data.comeInPlayer.userId}</strong>
                    <img src="image/node-ava.png"> </div>
                     <div class="cards-container">
                    </div>`);
    });
    socket.on("room-members", data => {

    });

    // socket.on("room-members", data => {
    //     countMembers = 0;
    //     var leftPlayer = $('.left');
    //     var rightPlayer = $('.right');
    //     var topPlayer = $('.top');
    //
    //     let order = data.info.order;
    //
    //     let rightIdentity = order + 1 > 3 ? order + 1 - 4 : order + 1;
    //     let topIdentity = order + 2 > 3 ? order + 2 - 4 : order + 2;
    //     let leftIdentity = order + 3 > 3 ? order + 3 - 4 : order + 3;
    //
    //     $('.single-player:not(.bottom)').html(`
    //            <div class="player-info">
    //                 <strong>Xuan Phuc</strong>
    //                 <img src="./image/node-ava.png">
    //             </div>
    //             <div class="back-image-wrapper">
    //                 <img src="./image/backof.jpg" class="back-image">
    //             </div>
    //     `);
    //
    //     leftPlayer.addClass('order-' + leftIdentity);
    //     topPlayer.addClass('order-' + topIdentity);
    //     rightPlayer.addClass('order-' + rightIdentity);
    //
    //     data.users.map(function (e) {
    //         countMembers++;
    //     });
    //     $('#current-room-members').html(memList);
    // });


    let playerE = $('.player-container.bottom');
    socket.on("start-btn-bind", data => {
        if(data.status === 'success'){
                $('.start-game').removeClass('hidden');
        }
    });

    socket.on("card-result", data => {
        var cardHtml = ``;
        if(data.info){

            data.info.cards.map((e,i,a) =>  {
                cardHtml += `<div class="card-single" data-id="${e.id}">${e.name}</div>`;
            });

            playerE.find('.card-list').html(cardHtml);
            playerE.find('.action-list').html(`<button id="sortCards">Sap xep</button> <button id="playCards">Danh!</button>`)


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

