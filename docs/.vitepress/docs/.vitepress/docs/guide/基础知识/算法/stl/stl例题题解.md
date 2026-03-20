---
title: ""
date: ""
tags: []
categories: 基础知识/算法/stl
---

[P1177 【模板】排序 - 洛谷](https://www.luogu.com.cn/problem/P1177)

[P1047 [NOIP 2005 普及组] 校门外的树 - 洛谷](https://www.luogu.com.cn/problem/P1047)

[P1908 逆序对 - 洛谷](https://www.luogu.com.cn/problem/P1908)

[P1102 A-B 数对 - 洛谷](https://www.luogu.com.cn/problem/P1102)

[P1918 保龄球 - 洛谷](https://www.luogu.com.cn/problem/P1918)

[P3370 【模板】字符串哈希 - 洛谷](https://www.luogu.com.cn/problem/P3370)

[P1059 [NOIP 2006 普及组] 明明的随机数 - 洛谷](https://www.luogu.com.cn/problem/P1059)

## 1. P1177 排序

**最优解**：`vector` + `sort`

```cpp
#include<bits/stdc++.h>
using namespace std;

int main() {
    int n;
    cin >> n;
    vector<int> arr(n);
    for (int i = 0; i < n; i++) cin >> arr[i];
    sort(arr.begin(), arr.end());
    for (int i = 0; i < n; i++) cout << arr[i] << " ";
    return 0;
}
```

## 2. P1047 校门外的树

**最优解**：`vector<bool>`

```cpp
#include <iostream>
#include <vector>
using namespace std;

int main() {
    int l, m;
    cin >> l >> m;
    vector<bool> tree(l + 1, true);

    while (m--) {
        int u, v;
        cin >> u >> v;
        for (int i = u; i <= v; i++) tree[i] = false;
    }

    int cnt = 0;
    for (int i = 0; i <= l; i++) 
        if (tree[i]) cnt++;
    cout << cnt;
    return 0;
}
```

## 3. P1908 逆序对

**最优解**：`vector` + 树状数组 + 离散化

```cpp
#include<bits/stdc++.h>
using namespace std;
#define int long long
const int MAXN = 500000+10;
int tree[MAXN];

int lowbit(int x)
{
    return x & -x;
}

void add(int x, int n)
{
    while (x <= n)
    {
        tree[x]++;
        x += lowbit(x);
    }
}

int ask(int x)
{
    int res = 0;
    while (x)
    {
        res += tree[x];
        x -= lowbit(x);
    }
    return res;
}

signed main()
{
    ios::sync_with_stdio(false);
    cin.tie(0);
    
    int n;
    cin >> n;
    vector<int> a(n), b(n);
    for (int i = 0; i < n; i++)
    {
        cin >> a[i];
        b[i] = a[i];
    }
    // 离散化

    sort(b.begin(), b.end());
    b.erase(unique(b.begin(), b.end()), b.end());

    // 映射

    for (int i = 0; i < n; i++)
    {
        a[i] = lower_bound(b.begin(), b.end(), a[i]) - b.begin() + 1;
    }
    // 统计逆序对
    int ans = 0;
    for (int i = n - 1; i >= 0; i--)
    {
        ans += ask(a[i] - 1);
        add(a[i], n);
    }
    
    cout << ans << '\n';
    
    return 0;

}
```

## 4. P1102 A-B数对

**最优解**：`unordered_map`

```cpp
#include<bits/stdc++.h>
using namespace std;
#define int long long

signed main()

{

    ios::sync_with_stdio(false);
    cin.tie(0);cout.tie(0);
    
    int n, c;
    cin >> n >> c;
    //map<int, int> cnt;
    unordered_map<int, int> cnt;

    vector<int> a(n);
    for(int i = 0;i < n;i++){

        cin >> a[i];
        cnt[a[i]]++;

    }

    int ans = 0;
    for(int i = 0;i < n;i++){
        int target = a[i] - c;
        if(cnt.find(target) != cnt.end())
            ans += cnt[target];
    }
    //处理c=0的情况
    if(c == 0) ans -= n;
    cout << ans << '\n';

    return 0;
}
```

## 5. P1918 保龄球

**最优解**：`unordered_map`

```cpp
#include<bits/stdc++.h>
using namespace std;

int main() {
    ios::sync_with_stdio(false);
    cin.tie(0);

    int n;
    cin >> n;
    unordered_map<int, int> mp;

    for (int i = 1; i <= n; i++) {
        int x;
        cin >> x;
        mp[x] = i;
    }

    int q;
    cin >> q;
    while (q--) {
        int m;
        cin >> m;
        if (mp.count(m)) cout << mp[m] << "\n";
        else cout << "0\n";
    }
    return 0;
}
```

## 6. P3370 字符串哈希

**最优解**：`unordered_set`

```cpp
#include<bits/stdc++.h>
using namespace std;
int main()

{

    ios::sync_with_stdio(false);
    cin.tie(0);cout.tie(0);
    
    int n;cin >> n;

    unordered_set<string> s;
    while(n--)

    {
        string str;
        cin >> str;
        s.insert(str);
    }


    cout << s.size() << '\n';
	return 0;
}
```

## 7. P1059 明明的随机数

**最优解**：`set`

```cpp
#include<bits/stdc++.h>
using namespace std;

int main() {
    int n;
    cin >> n;
    set<int> s;
    
    for(int i = 0; i < n; i++) {
        int x;
        cin >> x;
        s.insert(x);
    }
    
    cout << s.size() << '\n';
    for(auto num : s) {
        cout << num << ' ';
    }
    return 0;
}
```

---

## 总结

**核心原则**：

- 需要排序/有序输出 → `set/map`
- 只需要快速查找 → `unordered_set/unordered_map`  
- 需要连续存储/算法操作 → `vector`
- 大数据范围 → `vector` + 离散化
  
#### 树状数组&离散化（有兴趣的可以先学着玩）
  
**`lowbit(x)`**：这是一个数学计算，用来确定在树状数组中需要操作哪些位置。
  公式 `x & -x` ，就是找到在二进制中第一个为 1 的位置。

**`add(x, n)`**：这个函数做两件事：

1. 在位置x处加1（表示这个数字出现了一次）
2. 自动更新所有需要同步更新的其他位置

**`ask(x)`**：这个函数快速计算前x个位置的总和，也就是统计小于等于x的数字出现了多少次。

#### 解决逆序对问题的固定步骤：

**第一步**：从后往前遍历数组

- 这样能保证我们只统计每个数字与它后面数字构成的逆序对

**第二步**：对每个数字a[i]：

1. 先调用 `ask(a[i]-1)` → 得到后面比a[i]小的数字个数

2. 把这个数加到答案中

3. 再调用 `add(a[i], n)` → 标记a[i]已经出现

**第三步**：累加的结果就是逆序对总数

- `unique(b.begin(), b.end())`：把重复元素移到末尾，返回新结尾位置

- `b.erase(新结尾, 原结尾)`：删除重复元素

- `lower_bound(b.begin(), b.end(), a[i])`：在b中找到第一个 ≥ a[i] 的位置

- `b.begin()`：得到下标（从0开始）

- `+ 1`：让下标从1开始（因为树状数组要求下标从1开始）

**离散化前**：

- 数字范围：可能1-10^9
- 内存问题：无法直接开大数组

**离散化后**：

- 数字范围：1-n（n≤50万）
- 内存足够：可以用树状数组处理