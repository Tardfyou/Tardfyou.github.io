---
title: "一次博客移植"
date: 2024-03-01T01:43:35.000Z
lastmod: 2024-03-01T07:37:03.570Z
draft: false
author: "Tardfyou"
description: "继承与磨练"
summary: "继承与磨练"
slug: "一次博客移植"
aliases:
  - "/2024/03/01/一次博客移植/"
tags:
  - "learning"
categories:
  - "way of life"
images:
  - "https://seaside-station.com/wpbin/wp-content/uploads/umishibaura_09.jpg"
lightgallery: true
---

# 一切的一切
关于我为什么长时间没更新了这个问题，在23年的12月和1月，我的电脑经历了开机蓝屏的事故，在尝试了几十种方法无果后，我放弃了。但是，却听从了售后的建议重置了系统，这直接导致我的blog仓库和github连接切断。我预先保存好了blog的一切文件，在搜寻了一些网上教程后，重新密钥连接了github仓库和我的本地机后台，索性直接写一篇来讲一下我是怎么做的，以及遇到的问题。o(＝•𖥦＜=)o★～
![](/images/image.png)
# 不断尝试
## 寻找MyBlog
最开始，我从OneDrive中保存到桌面，但是文件数量过多导致下载统计极度缓慢。我的解决方案是，利用everything文件资源管理器，快速查找我的四个盘中的文件然后快速复制到桌面上。

## 环境配置
对于以前的环境，现在都需要重新配置，主要包括hexo的下载和nmp的安装（因为hexo需要npm才能装）

### git准备
对于git的安装，可以直接去官网，或者利用腾讯管家的软件市场一步到位完成，只需注意环境变量的配置，然后能正常使用git bash即可。注意，一定要配置好环境变量，否则后面使用hexo会报错。
>[git 下载链接](https://git-scm.com/downloads)
配置上，主要包括两个信息。
```
git config --global user.name "你的名字"（注意前边是“- -global”，有两个横线）
git config --global user.email "你的邮箱"
```
然后，去配置ssh：
首先，检查是否存在.ssh文件夹，如果有，选cd，没有则mkdir
```
cd ~/.ssh/
// mkdir ~/.ssh （无.ssh）
ssh-kengen -t rsa -C "youremail"
```
不需要设置密码的话，一路回车就行。
然后在.ssh/ 目录下将id_rsa.pub的内容复制到github，具体位置在设置-SSH keys中，新建一个密钥把内容粘贴进去。

### npm安装
网上有npm（实际上是nodejs）的详细教程，对于不学vue的小白来说，不需要全部照做，我在此只把hexo移植需要的步骤写下来，具体流程放在下面，需要者自取。
>[npm安装-详细教程](https://blog.csdn.net/panpan_Yang/article/details/130284726)

#### npm是什么
npm 是 NodeJS 下的包管理器，vue-cli脚手架模板就是基于 node 下的 npm 来完成安装的。
相关介绍~
webpack: 它的主要用途是通过CommonJS的语法把所有浏览器端需要发布的静态资源做相应的准备，比如资源的合并和打包。
vue-cli：官方提供的一个脚手架，用于快速生成一个 vue 的项目模板。

#### 安装，配置环境变量
windows下的NodeJS安装是比较方便的（v0.6.0版本之后，支持windows native），只需要直接访问官网，这里我们可以选择 Windows 安装包 (.msi)-64位 进行安装。
>[npm下载官网](https://nodejs.cn/download/)
安装过程一路next即可，会默认添加到环境变量里。
对于安装的确认，win+R输入cmd打开命令行，输入node -v检查，有版本号即可。
可以选择给你的npm换成淘宝源，下载东西更快。
```
npm config set registry https://registry.npm.taobao.org/
```

### 安装hexo
首先打开git bash，执行下面的语句安装hexo。
```
npm install hexo-cli -g
```
用hexo -v检查是否安装成功。
当时，我遇到了一个报错：
```
$ npm install hexo-deployer-git --save
npm WARN tarball tarball data for gifsicle@https://registry.npmmirror.com/gifsicle/-/gifsicle-5.3.0.tgz (sha512-9ewIQQCAnSmkU2DhuWafd1DdsgzAkKqIWnY+023xBLSiK9Az2TDUozWQW+SyRQgFMclbe6RQldUk/49TRO3Aqw==) seems to be corrupted. Trying again.
npm ERR! code EINTEGRITY
npm ERR! sha512-9ewIQQCAnSmkU2DhuWafd1DdsgzAkKqIWnY+023xBLSiK9Az2TDUozWQW+SyRQgFMclbe6RQldUk/49TRO3Aqw== integrity checksum failed when using sha512: wanted sha512-9ewIQQCAnSmkU2DhuWafd1DdsgzAkKqIWnY+023xBLSiK9Az2TDUozWQW+SyRQgFMclbe6RQldUk/49TRO3Aqw== but got sha512-FJTpgdj1Ow/FITB7SVza5HlzXa+/lqEY0tHQazAJbuAdvyJtkH4wIdsR2K414oaTwRXHFLLF+tYbipj+OpYg+Q==. (578258 bytes)

npm ERR! A complete log of this run can be found in: C:\Users\31435\AppData\Local\npm-cache\_logs\2024-02-29T14_53_32_988Z-debug-0.log
```
这个错误表明在下载 gifsicle 软件包时出现了问题，导致校验和不匹配。这可能是由于网络问题或者 npm 源的问题引起的。
我找到了一些网上的解决方案：
```
// 1.清除npm缓存并重试
npm cache clean --force
npm install hexo-deployer-git --save

// 2.更改 npm 源：尝试切换到其他 npm 源，例如官方源。
npm config set registry https://registry.npmjs.org/
npm install hexo-deployer-git --save

// 3.手动安装 gifsicle：直接下载 gifsicle 的压缩包并手动安装。
npm install gifsicle@latest --save

//如果以上方法都无法解决问题，建议等待一段时间后再尝试安装，可能是 npm 源的临时问题。
```
𖦹ࡇ𖦹.ᐟ.ᐟ
当然，这些对我都没起作用，我直接用了以前下载的nodejs，在系统盘彻底重置后，缺少了很多依赖dll，在重装并设置新源后解决了。

## 最终
### 本地try
把你之前的库文件夹复制到你的工作文件夹下，然后进入库根目录，右键打开git bash
直接尝试
```
hexo c && hexo d && hexo s
```
然后去浏览器local：指定端口查看。
### 除此之外
以上方案是针对你的库没有丢失任何文件的，如果你选择保留node_modules以外的文件，就要在最终步前，根目录下执行
```
npm install hexo-deployer-git --save
```
当然，你也可以选择只保留
+ _config.yml
+ package.json
+ scaffolds/
+ source/
+ themes/
然后，由一句话变成四句
```
 npm install
 npm install hexo-deployer-git --save
 npm install hexo-generator-feed --save
 npm install hexo-generator-sitemap --save
```

好了，到这一步，我们的blog就彻底完成移植工作了，如果执行hexo d的时候报权限禁止了，就检查下你的密钥复制对了没，git配置对了没。
新学期了，祝大家能够活出自我，一直向前，朝着理想中的自己不断前进。♡>𖥦<)!!
