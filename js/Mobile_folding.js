//手机侧边栏默认不展开
var mobile_sidebar_menus = document.getElementById("mobile-sidebar-menus");
if (mobile_sidebar_menus != null) {
    var menus_item_child = mobile_sidebar_menus.getElementsByClassName("menus_item_child");
    var menus_expand = mobile_sidebar_menus.getElementsByClassName("expand");
    for (var i = 0; i < menus_item_child.length; i++) {
        menus_item_child[i].style.display = "none";
        menus_expand[i].className += " closed";
    }
}   
