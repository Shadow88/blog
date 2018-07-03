$(function () {
    let $loginBox = $("#loginBox");
    let $regBox = $("#regBox");
    let $userInof=$("#userInfo");

    //登录和注册切换
    $loginBox.find("a.colMint").on("click", function () {
        $regBox.show();
        $loginBox.hide();
    });
    $regBox.find("a.colMint").on("click", function () {
        $loginBox.show();
        $regBox.hide();
    });

    //进行注册
    $regBox.find("button").on("click",function () {
        $.ajax({
            type:"post",
            url:"/api/user/register",
            data:{
                username:$regBox.find("[name='username']").val(),
                password:$regBox.find("[name='password']").val(),
                regPassword:$regBox.find("[name='regPassword']").val()
            },
            dataType:"json",
            success:function (result) {
                $regBox.find('.colWaring').html(result.message);
                if(!result.code){
                    //注册成功
                    setTimeout(function () {
                        $loginBox.show();
                        $regBox.hide();
                    },1000);
                }
            }
        });
    });
    //进行登录
    $loginBox.find("button").on("click",function () {
        //ajax提交请求
        $.ajax({
           type:'post',
           url:'/api/user/login' ,
            data:{
                username:$loginBox.find("[name='username']").val(),
                password:$loginBox.find("[name='password']").val()
            },
            dataType:'json',
            success:function (result) {
               $loginBox.find('.colWaring').html(result.message);
                if(!result.code){
                    //登录成功
                    // setTimeout(function () {
                    //     $loginBox.hide();
                    //     $userInof.show();
                    //     //显示登录用户信息
                    //     $userInof.find('.user').html(result.userInfo.username);
                    //     $userInof.find(".info").html('欢迎进入您的博客');
                    // },1000);
                    window.location.reload();
                }
            }
        });
    });
$('#logout').on('click',function () {
   $.ajax({
       url:'/api/user/logout',
       success:function (result) {
           if(!result.code){
               window.location.reload();
           }
       }
   });
});

});


/***列表切换
 *
 */
$('#list').click(function(event){
    event.preventDefault();
    $('#products .item').addClass('list-group-item');
});

$('#grid').click(function(event){
    event.preventDefault();
    $('#products .item').removeClass('list-group-item');
    $('#products .item').addClass('grid-group-item');
});


/**
 *toggle显示和隐藏
 */
$('.collapse.in').prev('.panel-heading').addClass('active');
$('#accordion, #bs-collapse')
    .on('show.bs.collapse', function(a) {
        $(a.target).prev('.panel-heading').addClass('active');
    })
    .on('hide.bs.collapse', function(a) {
        $(a.target).prev('.panel-heading').removeClass('active');
    });
