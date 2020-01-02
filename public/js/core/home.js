$(document).ready(function () {

    let usernameInputContainer = $('#user-name-form');
    let errorEmptyUserName = 'Nhập tên trước đã!';
    let usernameData = $('#username_data');
    let signInModal = $('#modal-sign-in');
    let setUserName = (userName) => {

        usernameInputContainer.addClass('hidden');
        usernameData.html(`Xin chào ${userName}`);
        usernameData.parent().removeClass('hidden');
    }
    let userNameGlobal = localStorage.getItem('client_name') || null;

    if(userNameGlobal){
        // usernameInputContainer.addClass('hidden');
        // $('#username_data').html(`Xin chào ${userNameGlobal}`);
        setUserName(userNameGlobal);
    }
    $('.account button').click(function () {
        // signInModal.
        signInModal.modal('show');
        let activeTab = $(this).data('modal');
        $('#'+activeTab).tab('show');

    });
    $('#ready').click(function () {
        let userName = $('#username').val();
        if (userName !== "") {
            // usernameInputContainer.addClass('hidden');
            // $('#username_data').html(`Xin chào ${userNameGlobal}`);
            localStorage.setItem('client_name', userName);
            userNameGlobal = userName;
            setUserName(userName)
            // $('.room-area').removeClass('display-none');
        } else {
            alertify.notify(errorEmptyUserName, 'error', 4, function () {
            });
        }
    });

    $('#username').keypress(function (e) {
        if (e.keyCode === 13) {
            $('#ready').click();
        }
    });
    //
    // window.onbeforeunload = function () {
    //     return "";
    // };

    $(document)
        .on('keypress', function (e) {
            if (e.which === 13) {
                usernameInputContainer.find('input').focus();
            }
        })
        .on('click', '.game-select .game-item', function (e) {
            if (!userNameGlobal) {
                e.preventDefault();
                alertify.notify('Nhập tên trước đã!', 'error', 4, function () {
                });
            }
        })
});

