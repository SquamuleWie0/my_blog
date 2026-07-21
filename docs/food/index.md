---
title: 夏稔食记
aside: false
sidebar: false
---

<script setup>
import FoodFeed from '../.vitepress/theme/components/FoodFeed.vue'

const posts = [
  {
    date: '2025-11-15',
    time: '冬季',
    title: '大连东港 海边码头',
    location: '大连东港',
    text: [
      '海边的夜风很凉。',
      '灯一亮，码头就像被单独留在了冬季里。'
    ],
    images: [
      { src: '/food/2026-06-24-dalian-donggang-pier.jpg', alt: '大连东港海边码头夜景' }
    ],
    tags: ['大连', '东港', '冬天', '海边']
  },
  {
    date: '2026-07-11',
    time: '晚饭后',
    title: '夏天傍晚，吃到一碗很安心的面',
    location: '泸州',
    weather: '微热 / 有风',
    text: [
      '今天没有特意找店，只是走着走着就进去了。',
      '面端上来的时候有点烫，汤很鲜，突然就觉得夏天也没有那么烦。'
    ],
    images: [
      { src: '/food/demo-noodle.svg', alt: '一碗面' },
      { src: '/food/demo-shop.svg', alt: '路边小店' },
      { src: '/food/demo-street.svg', alt: '散步路上' }
    ],
    tags: ['晚饭', '小店', '夏天'],
    note: '这里先放的是 UI 示例图，之后可以替换成真实照片。'
  },
  {
    date: '2026-07-08',
    time: '下午',
    title: '甜口小暂停',
    location: '学校附近',
    weather: '阴天',
    text: [
      '本来只是想买杯喝的，结果还是被甜品拐走了。',
      '有时候生活需要一点不讲道理的小奖励。'
    ],
    images: [
      { src: '/food/demo-dessert.svg', alt: '甜品' }
    ],
    tags: ['下午茶', '甜口']
  }
]
</script>

<FoodFeed :posts="posts" />

## 以后怎么更新

复制下面这一段到 `posts` 数组最前面，换掉日期、文字和图片地址即可：

```js
{
  date: '2026-07-11',
  time: '晚饭后',
  title: '今天这顿很好吃',
  location: '城市 / 店名可选',
  weather: '天气可选',
  text: [
    '第一句碎碎念。',
    '第二句碎碎念。'
  ],
  images: [
    { src: '/food/your-photo-1.jpg', alt: '照片说明' },
    { src: '/food/your-photo-2.jpg', alt: '照片说明' }
  ],
  tags: ['晚饭', '小店', '夏天']
}
```
