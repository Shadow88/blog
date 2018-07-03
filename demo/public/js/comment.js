
let perpage=2;//每页显示两条
let page=1;//当前页
let pages=0;//总页数
let comments=[];
$("#messageButton").on("click",function () {
    $.ajax({
        type:'post',
        url:'/api/comment/post',
        data:{
            content:$("#messageContent").val(),
            contentid:$("#contentId").val()
        },
        success:function (responseDate) {
            content:$("#messageContent").val('');
            comments = responseDate.data.comments.reverse();
            renderComment();
        }

    });
});
//页面刷新时重载
$.ajax({
    url:'/api/comment',
    data:{
        contentid:$("#contentId").val()
    },
    success:function (responseDate) {
       comments = responseDate.data.reverse();
       renderComment();
    }

});
function formAt(fmt) {
    let date = new Date(fmt);
    return date.getFullYear() + "年" + (date.getMonth()+1) + "月" + date.getDate() + "日" + date.getHours() + "时" + date.getMinutes() + "分" + date.getSeconds() + "秒";

}
function renderComment() {
    $('.messageCount').html(comments.length);
    let $lis=$(".page .pager li");
    let pages=Math.max(Math.ceil(comments.length/perpage),1);
    $lis.eq(1).html(page+'/'+pages);
    let html='';
    let start=Math.max(0,(page-1) * perpage);
    let end=Math.min(start + perpage,comments.length);
    if(page <= 1){
        page=1;
        $lis.eq(0).html('<span>没有上一页了</span>');
    }else{
        $lis.eq(0).html('<a href="javascript:;"><span aria-hidden="true">&larr;</span> 上一页</a>');
    }
    if(page>=pages){
        page=pages;
        $lis.eq(2).html('<span>没有下一页了</span>');
    }else{
        $lis.eq(2).html('<a href="javascript:;"><span aria-hidden="true">&larr;</span> 下一页</a>');
    }
    if(comments.length==0){
        $(".messageList").html(`<div class="messageBox"><p>还没有评论</p></div>`);
    }else{
        for (let i= start;i<end; i++){
            console.log(comments);
            html+=` <div class="messageBox">
               <p class="clear"><span class="fl">${comments[i].username}</span><span>${formAt(comments[i].postTime)}</span></p>
               <p>${comments[i].content}</p>
             </div>`
        }
        $(".messageList").html(html);
    }

}
$('.pager').delegate('a','click',function () {
     if($(this).parent().hasClass('previous')){
        page--;
     }else{
         page++;
     }
     renderComment();
});

