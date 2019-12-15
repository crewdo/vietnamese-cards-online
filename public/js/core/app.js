var socket = io();

$(document).ready(function () {
    $('#ready').click(function () {
        socket.emit("ready", socket.id);
        $(this).parent().remove();
    });

    $(document).on('click', '#gogo', function () {
        socket.emit("start-game", 'Start Game!');
        })
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

    // window.onbeforeunload = functionxs ()
    // {
    //     return true;
    // };


    (function() {
        socket.on("start-btn-bind", data => {
            if(data.status === 'success'){
                $('.start-game').removeClass('hidden');
            }
        });

        socket.on('you-come-in', data => {
            console.log(data.newOrder)
            var selfPlayer = $('.bottom');
            selfPlayer.data('order', data.newOrder);
            selfPlayer.addClass('order-' + data.newOrder);
            selfPlayer.html(`<div class="player-info">
                    <strong>${data.comeInPlayer.userId}</strong>
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
                     <strong>${e.userId}</strong>
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
                                <img src="./image/${e.name}.png">
                        </div>`;
                });
                $('.cards').html(cardHtml);

                $('#sortCards').removeClass('hidden');
            }
        });

        socket.on('card-sorted', data => {
            let cardHtml = ``;
            if(data.info){
                data.info.cards.map((e,i,a) =>  {
                    cardHtml += `<div class="single-card" data-id="${e.id}">
                                <img src="./image/${e.name}.png">
                                 </div>`;
                });
                $('.cards').html(cardHtml);
            }
        });

        socket.on("your-first-turn-in-first-round", data => {
            $('.action-container').removeClass('hidden');
        });

        socket.on('your-turn', data => {
            $('.action-container').removeClass('hidden');
        });

        socket.on('turn-passed-as-pass', data => {
            $('.action-container').addClass('hidden');
        });

        socket.on('turn-passed-as-play', cardsData => {
            $('.action-container').addClass('hidden');

            // let cardsPlayed = ``;
            // cardsData.map(e => {
            //     cardsPlayed += `<div class="card-single"  data-id="${e}">${e}</div>`;
            // });
            // $('.table').html(cardsPlayed);
        });

        socket.on("remaining-cards", data => {
            let cardHtml = ``;
            if(data.info){
                data.info.cards.map((e,i,a) =>  {
                    cardHtml += `<div class="single-card" data-id="${e.id}">
                                <img src="./image/${e.name}.png">
                                 </div>`;
                });
                $('.cards').html(cardHtml);
            }
        });

        socket.on('next-player-turn', order => {
            $('.single-player').removeClass('turn-active');
            $('.order-'+ order).addClass('turn-active');
        });

        socket.on('you-win', data => {
            alert('You win!!!')
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



        socket.on("you-need-to-play-smallest-card", data => {
            alert('You need to play combo include smallest card!');
        });

        socket.on("invalid-combo", data => {
            alert('Your combo is not valid or not bigger than their combo!');
        });


    })();

});





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

