---
title: "第一次Linux Kernel的patch提交"
date: 2023-10-23T11:20:22.000Z
lastmod: 2024-03-01T01:55:38.055Z
draft: false
author: "Tardfyou"
description: "久练则承"
summary: "久练则承"
slug: "第一次Linux-Kernel的patch提交"
tags:
  - "learning"
categories:
  - "way of life"
images:
  - "https://seaside-station.com/wpbin/wp-content/uploads/arimagawa_15.jpg"
lightgallery: true
---

# 记录第一次对Linux Kernel所做的贡献
Linux 内核是 Linux 计算机操作系统的核心。内核是计算机硬件与其进程之间的核心接口，确保有可用的内存供 Linux 应用程序运行、优化处理器以及在应用程序间导航系统要求。Linux 内核通过“中断”在硬件和应用程序之间进行通信（摘录自bing）。

~~通过提交自己的patch可以让代码进入到kernel中，永世保存~~x
修改不良的代码风格和解决相关安全隐患√
## 什么是Linux Kernel的patch？
Linux patch 命令 Linux patch 命令用于修补文件。 patch 指令让用户利用设置修补文件的方式，修改，更新原始文件。 倘若一次仅修改一个文件，可直接在指令列中下达指令依序执行。 如果配合修补文件的方式则能一次修补大批文件，这也是 Linux 系统核心的升级方法之一。

Linux内核作为世界最大的开源软件之一，其开发和维护工作非常重要，需要无数开发者共同努力。
向Linux社区贡献代码的最基本方式是邮件向maintainer提交补丁，而不是通过github中的fork和pull request。

提交patch和submit message需要遵循相关规范，具体可参考相关文档。
>[PATCH 格式](https://www.cnblogs.com/pengdonglin137/p/3341159.html)
>[commit message格式](https://www.cnblogs.com/qianxiaox/p/14110940.html)

## 前期准备
本文基于Windows介绍自己提交的全过程以及遇到的问题，不过这边建议直接用linux或者GBN相关的系统，会少走一些弯路，看到后面就明白了。我因为懒得经常开虚拟机和没有liveUSB去装载外置系统所以还是用的windows。
+ 版本控制git （一般自带git diff）
+ 标准bash（一般自带git send-email没有则自己装）
+ perl （在bash中一般自带，用perl -v查看）

git send-email 为发送补丁的第三方客户端，diff比较文件差异，perl用于执行后面提到的patch检查脚本。

此外，git send-email需要提前配置。
就我而言，需要使用校园邮箱，配置示例如下
```
[sendemail]
        smtpEncryption = ssl
        smtpServer = mail.hust.edu.cn
        smtpUser = <你的邮箱地址>
        smtpServerPort = 465
        smptAuth = LOGIN
```

## 进行修改
首先，通过git clone拷贝官网仓库
```
git clone https://git.kernel.org/pub/scm/linux/kernel/git/torvalds/linux.git/
```
在进行下一步时，出现了报错**Clone succeeded, but checkout failed. drivers/gpu/drm/nouveau/nvkm/subdev/i2c/aux.c**去stackoverflow查找原因，给我的回答是因为windows的NTFS保护机制造成的报错，解决方案
```
git config core.protectNTFS false
git reset --hard HEAD
```
解决后我们拿到了kernel源码，准备进行修改，修改前，学校的静态扫描工具已经提前告知我错误位置
```
ERROR: space required after that ',' (ctx:VxV)
#119: FILE: ../linux-next/drivers/media/usb/dvb-usb/dibusb-mc-common.c:119:
+       u8 a,b;
            ^
ERROR: space required after that ',' (ctx:VxV)
#127: FILE: ../linux-next/drivers/media/usb/dvb-usb/dibusb-mc-common.c:127:
+               dibusb_read_eeprom_byte(adap->dev,0x7E,&a);
                                                 ^
```
这边建议新建一个自己工作的分支，不要影响主分支。
后面就是找到文件，根据报错添加空格。
## commit and make patch
进行commit时，需要描述进行的改动，标题格式参考其他patch，作为新手，我直接使用了下面这条指令
```
git commit -asev
```
参数s表示自动添加Signed-off-by： balabala，同时参数e会启动打开vim编辑器。commit message可参考如下示例。
```
media: dvb: add space after comma to fix coding style

checkpacth complains that:

ERROR: space required after that ',' (ctx:VxV)
#119: FILE: ../linux-next/drivers/media/usb/dvb-usb/dibusb-mc-common.c:119:
+       u8 a,b;
            ^
ERROR: space required after that ',' (ctx:VxV)
#127: FILE: ../linux-next/drivers/media/usb/dvb-usb/dibusb-mc-common.c:127:
+               dibusb_read_eeprom_byte(adap->dev,0x7E,&a);
                                                 ^
Fix it by adding required spaces after the commas to fix the coding
style issue.

Signed-off-by: Yalong Zou <yalongz@hust.edu.cn>
```
下面直接利用刚才的commit生成patch
```
git format-patch -1
```
上述命令直接在当前目录生成了一份包含标准邮件格式的.patch文件，-1表示进包含一个commit。
Subject：至Signed-off-by行之间，需要对补丁详细描述，如何发现问题，错误原因，修改方式等。

最后回到仓库根目录，运行检查脚本，确保没有其他错误。
```
在内核代码仓库目录下
./scripts/checkpatch.pl <生成的 patch 的文件名>
```
## 发送邮件，等待回复
```
git send-email --to=收件人邮箱 --cc=抄送的对象 <生成的 patch 的文件名>
```
发送过程中需要完成密码验证，只需更改邮箱设置独立密码即可用于验证。

在这之前，最后现发给别人看看，不要因为低级错误浪费审核人的时间。比如将收件人邮箱替换为自己的QQ邮箱。
发送之后，只需耐心等待，内核维护者们都很勤奋，但不一定及时。加入长时间没人回复可以ping或者resend。
```
git format-patch -1 --subject-prefix='PING'
# or
git format-patch -1 --subject-prefix='RESEND'
```

## 修改v2，v3……
当Re： PATCH到达邮箱大门时，也许只是一句普通的问候，也是是一长串的问题指出。
对于新的PATCH v2，应在最初的分支上改动，而不是在Commit基础上提交新的代码。

按意见更改后，就可以发出PATCH v2了，然后记得在Reviewed by后加上Changelog信息，即进行的修改。如：
```
v1 -> v2: Directed deleted 'base' and its related code based on PATCH v1
```
新的邮件主题也要改
```
git format-patch -1 --subject-prefix='PATCH v2'
```
之后一样的发送。

## 接受后
当补丁被maintainer接受后，先被合并到该模块的子树，然后和其他补丁一起交给Linux，最后进入内核主线。自此，完成了对kernel的一次贡献。

## 其他注意事项
+ 第二次commit时可以更改一些指令，我还没有具体尝试，等以后会补充更新。
+ 好懒，以后要勤奋更blog了QAQ，明天是1024程序节，提前祝世界各地的开发者们节日快乐，也祝自己别再掉发了（哭）。
