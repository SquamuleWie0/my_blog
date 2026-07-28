---
title: 途中
sidebar: false
aside: false
---

<script setup>
import LifeFeed from '../.vitepress/theme/components/LifeFeed.vue'

const posts = [
  {
    date: '2026-07-27',
    time: '20:06',
    text: [
      '今天累累的，想巧克力。'
    ],
    images: [
      { src: '/life/2026-07-27-cute.jpg', alt: '可爱吗' }
    ]
  },
  {
    date: '2026-07-27',
    time: '18:12',
    text: [
      '不知道为什么重叠着耳机里放的歌夹杂着暴雨和妖风',
      '想起一句话：风浪越大鱼越贵。',
      '是什么道理呢'
    ]
  },
  {
    date: '2026-07-25',
    time: '21:22',
    text: [
      '香港未必有合江的忧郁',
      '每次看到江和大桥总会想起丹东的夜晚：星空和断桥'
    ],
    layout: 'wide',
    images: [
      { src: '/life/2026-07-25-bridge-1.jpg', alt: '傍晚的合江大桥' },
      { src: '/life/2026-07-25-bridge-2.jpg', alt: '夜色里的合江大桥' }
    ]
  },
  {
    date: '2026-07-25',
    time: '17:52',
    text: [
      '家'
    ],
    images: [
      { src: '/life/2026-07-25-home-1.jpg', alt: '傍晚的山和河' },
      { src: '/life/2026-07-25-home-2.jpg', alt: '窗外的云和山' }
    ]
  },
  {
    date: '2026-07-25',
    time: '17:34',
    text: [
      '荔枝 甜'
    ],
    images: [
      { src: '/life/2026-07-25-lichee.jpg', alt: '荔枝' }
    ]
  },
  {
    date: '2026-07-24',
    time: '17:49',
    text: [
      '这一程 真正的终点是哪儿呢'
    ],
    images: [
      { src: '/life/2026-07-24-d985.jpg', alt: 'D985 检票口' }
    ]
  }
]
</script>

<LifeFeed :posts="posts" />
