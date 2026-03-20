---
title: ""
date: ""
tags: []
categories: 基础知识/算法/stl
---

主讲人：肖依霖

---

## 课程大纲

### 一、STL容器概述
### 二、vector 
### 三、map 
### 四、set 
### 五、小结

---

## 一、STL容器概述

### 什么是STL容器？

在 C++ 标准模板库（STL）中，容器的**底层数据结构**决定了其核心特性（如访问效率、插入 / 删除效率、内存开销等）。

[STL 容器](https://so.csdn.net/so/search?q=STL%20%E5%AE%B9%E5%99%A8&spm=1001.2101.3001.7020)类：
**序列式容器**：元素顺序与插入顺序一致
- vector, deque, list

**有序关联式容器**：通过键值快速查找
- map, set, multimap, multiset

**无序关联式容器：** 
- unordered_map,unordered_set


---
## 二、 vector 动态数组
### 什么时候用

**需要快速访问、数据量相对固定**

 [P1177 【模板】排序 - 洛谷](https://www.luogu.com.cn/problem/P1177)
[P1047 [NOIP 2005 普及组] 校门外的树 - 洛谷](https://www.luogu.com.cn/problem/P1047)
[P1908 逆序对 - 洛谷](https://www.luogu.com.cn/problem/P1908)

时间复杂度对比
- **手写快排**：平均O(n log n)，最坏O(n²)
- **STL sort**：保证O(n log n)，使用内省排序+插入排序优化
内存对比
- **使用传统数组**：固定分配例如300,000个int（约1.2MB），即使l很小也占用这么多
- **vector**：只分配l+1个bool，内存使用更精确

- 时间复杂度：保证O(n log n)，使用内省排序+插入排序优化
- 动态内存分配，内存使用更精确，减小浪费开销

### 补充：
#### vector核心操作
```cpp
#include <vector>
using namespace std;

// 动态数组，支持随机访问
vector<int> vec;
vector<int> vec = {1, 2, 3};

vec.push_back(4);     // 尾部添加
vec.pop_back();       // 尾部删除  
cout << vec[0];       // 随机访问
cout << vec.size();   // 元素个数
```

```cpp
vector<int> vec = {10, 20, 30};

cout << vec[0];      // 10 (不检查边界)
cout << vec.front(); // 10 (第一个元素)
cout << vec.back();  // 30 (最后一个元素)
```

####  容量操作
```cpp
vec.size();        // 当前元素个数
vec.empty();       // 是否为空
vec.reserve(100);  // 预分配空间，避免频繁扩容
```

####  修改操作
```cpp
vec.push_back(40);     // 尾部添加
vec.pop_back();        // 删除尾部元素
vec.insert(vec.begin() + 1, 25);  // 在指定位置插入
vec.erase(vec.begin() + 2);       // 删除指定位置元素
vec.clear();           // 清空所有元素
```

---

## 三、map - 键值对映射

### 什么时候用？

**需要统计频率、建立映射关系**
**需要快速键值查找，但不关心键的顺序时使用unordered_map**

[P1102 A-B 数对 - 洛谷](https://www.luogu.com.cn/problem/P1102)
[P1918 保龄球 - 洛谷](https://www.luogu.com.cn/problem/P1918)

##### **暴力解法**
O(n²)时间复杂度，n=10^5时需要10^10次操作，肯定超时。
##### **map解法**
- 时间复杂度：从O(n²)优化到O(n log n)
##### **使用unordered_map**
- 比 set 更快，不需要排序
#### 重要特性 
- **按键排序**：默认按键的升序排列
- **唯一键**：每个键只能出现一次
- **查找高效**：基于红黑树，查找、插入、删除：O(log n)时间复杂度
- **自动排序**：插入时自动维护有序性

#### 补充：map的相关操作
##### 1. 创建与初始化
```cpp
#include<map>
using namespace std;

map<char, int> mp;

    for(int i = 0;i < 8;i++){
        char x;cin >> x;
        int y;cin >> y;
        mp.insert({x,y});
    }

    for(auto it = mp.begin(); it != mp.end(); ++it){
        cout << it->first << ": " << it->second;
        cout << '\n';

    }
```


##### 2. 元素访问
```cpp
// 使用[]操作符 
int x = mp["A"];
char y;
cin >> y;

// 查找操作
auto it = mp.find(y);
```

##### 3. 修改操作
```cpp
// 插入元素
scores.insert({"David", 88});

// 删除元素
scores.erase("Bob");

// 清空
scores.clear();
```


---
## 四、set - 有序集合

### 什么时候用？

**需要自动去重+排序、需要有序存储唯一元素**
**需要快速查找、去重，但不关心元素顺序时使用unordered_set**

[P3370 【模板】字符串哈希 - 洛谷](https://www.luogu.com.cn/problem/P3370)
[P1059 [NOIP 2006 普及组] 明明的随机数 - 洛谷](https://www.luogu.com.cn/problem/P1059)

#### 重要特性
- **唯一元素**：不允许重复值
- **自动排序**：元素按升序排列
- **查找高效**：O(log n)时间复杂度
- **基于红黑树**：与map相同的底层实现

#### 补充：set的相关操作
#### 1. 创建与初始化
```cpp

#include <set>
using namespace std;

// 唯一元素集合，自动排
set<int> s1;
set<int> s2 = {1, 3, 5, 2, 4};  // 会自动排序
set<int> s3(s2);                // 拷贝
```

#### 2. 元素操作
```cpp
set<int> s;

// 插入元素
numbers.insert(10);
numbers.insert(20);
numbers.insert(10);  // 重复元素不会被插入

// 删除元素
numbers.erase(10);

// 查找元素
auto it = numbers.find(15);
if(it != numbers.end()) {
    cout << "找到元素: " << *it;
}
```

#### 3. 集合操作
```cpp
set<int> s1 = {1, 2, 3};
set<int> s2 = {2, 3, 4};

// 判断元素是否存在
if(s1.count(2)) {
    cout << "元素2存在";
}

// 获取范围

1 5 8 14 99
auto lower = s1.lower_bound(2);  // >=2的第一个元素
auto upper = s1.upper_bound(2);  // >2的第一个元素
```


--- 
## 五、小结
### 1. 离散化技巧

#### 什么时候用？

**数据范围太大，直接开数组会爆内存**

```cpp
vector<int> arr(n);
for(int i = 0;i < n;i++) cin >> a[i];
vector<int> temp = arr;

// 1. 排序
sort(temp.begin(), temp.end());

// 2. 去重  
temp.erase(unique(temp.begin(), temp.end()), temp.end());

// 3. 映射
int it = lower_bound(temp.begin(), temp.end(), x) - temp.begin();
```

把大数字映射到 0 ~ n-1 的小数字

---

### 2.容器选择

### 根据需求选择合适的容器
#### **容器对比总结**

| 容器                  | 底层结构 | 时间复杂度        | 适用场景   |
| ------------------- | ---- | ------------ | ------ |
| `vector`            | 动态数组 | 随机访问O(1)     | 需要频繁访问 |
| `set/map`           | 红黑树  | 各项操作O(log n) | 需要有序性  |
| `unordered_set/map` | 哈希表  | 平均O(1)       | 需要快速查找 |

大部分情况下用 unordered 系列更快

### 性能对比

| 操作   | vector | map      | set      |
| ---- | ------ | -------- | -------- |
| 随机访问 | O(1)   | O(log n) | O(log n) |
| 头部插入 | O(n)   | -        | -        |
| 尾部插入 | O(1)   | -        | -        |
| 中间插入 | O(n)   | O(log n) | O(log n) |
| 查找   | O(n)   | O(log n) | O(log n) |

---