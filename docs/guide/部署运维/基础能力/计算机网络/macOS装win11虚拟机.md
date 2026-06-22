---
title: ""
date: ""
tags: []
categories: 基础知识/计算机网络
---
# macOS装win11虚拟机

 **虚拟机安装流程：**
1. 装虚拟机软件（VMware）
	- 版本13.6.4
	- 官网入口：[https://www.vmware.com](https://www.vmware.com)
2. 新建虚拟机，设置内存、硬盘
3. 放系统镜像（ISO）
	- https://www.microsoft.com/zh-cn/software-download/windows11
4. 安装操作系统
5. 配置网络，完成使用
 **VMware Fusion 虚拟机**，之前用 **NAT 模式**时一直报错：`无法打开设备/dev/vmnet8`，网络用不了。后来我把网络改成 **桥接模式**，现在网络正常可以上网了。就这两种模式来回切换几乎能解决网络连接问题
 
