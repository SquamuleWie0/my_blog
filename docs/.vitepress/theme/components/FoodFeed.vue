<script setup lang="ts">
import { computed } from 'vue'
import { withBase } from 'vitepress'

type FoodImage = {
  src: string
  alt?: string
}

type FoodPost = {
  date: string
  title: string
  location?: string
  weather?: string
  time?: string
  text: string[]
  images?: FoodImage[]
  tags?: string[]
  note?: string
}

const props = withDefaults(defineProps<{
  posts?: FoodPost[]
}>(), {
  posts: () => []
})

const groupedPosts = computed(() => {
  const groups = new Map<string, FoodPost[]>()

  for (const post of props.posts) {
    const month = post.date.slice(0, 7).replace('-', '.')
    if (!groups.has(month)) groups.set(month, [])
    groups.get(month)!.push(post)
  }

  return Array.from(groups.entries()).map(([month, posts]) => ({ month, posts }))
})

function imageClass(count = 0) {
  if (count <= 1) return 'one'
  if (count === 2) return 'two'
  if (count === 3) return 'three'
  return 'nine'
}

function formatDay(date: string) {
  const parts = date.split('-')
  return parts.length === 3 ? `${parts[1]}.${parts[2]}` : date
}
</script>

<template>
  <section class="food-feed">
    <header class="food-hero-card">
      <div>
        <p class="food-kicker">夏稔食记</p>
        <h1>一些吃饭、散步、路过的瞬间</h1>
        <p class="food-desc">
          不做餐厅测评，也不写标准攻略。这里更像一个安静版朋友圈：记录吃到的一口、当时的天气、同行的人，以及某个忽然觉得生活还不错的时刻。
        </p>
      </div>
      <div class="food-hero-mark" aria-hidden="true">食</div>
    </header>

    <div v-if="groupedPosts.length" class="food-timeline">
      <section v-for="group in groupedPosts" :key="group.month" class="food-month-section">
        <div class="food-month-title">
          <span>{{ group.month }}</span>
          <i />
        </div>

        <article v-for="post in group.posts" :key="`${post.date}-${post.title}`" class="food-card">
          <div class="food-card-left">
            <div class="food-avatar">🍚</div>
          </div>

          <div class="food-card-main">
            <div class="food-meta-row">
              <span class="food-author">wie0</span>
              <span class="food-dot">·</span>
              <time>{{ formatDay(post.date) }}</time>
              <span v-if="post.time" class="food-dot">·</span>
              <span v-if="post.time">{{ post.time }}</span>
            </div>

            <h2>{{ post.title }}</h2>

            <p v-if="post.location || post.weather" class="food-submeta">
              <span v-if="post.location">📍 {{ post.location }}</span>
              <span v-if="post.weather">{{ post.weather }}</span>
            </p>

            <div class="food-text">
              <p v-for="line in post.text" :key="line">{{ line }}</p>
            </div>

            <div
              v-if="post.images?.length"
              class="food-image-grid"
              :class="imageClass(post.images.length)"
            >
              <a
                v-for="(image, index) in post.images"
                :key="`${image.src}-${index}`"
                :href="withBase(image.src)"
                target="_blank"
                rel="noreferrer"
                class="food-image-item"
              >
                <img :src="withBase(image.src)" :alt="image.alt || post.title" loading="lazy" />
              </a>
            </div>

            <p v-if="post.note" class="food-note">{{ post.note }}</p>

            <div v-if="post.tags?.length" class="food-tags">
              <span v-for="tag in post.tags" :key="tag">#{{ tag }}</span>
            </div>
          </div>
        </article>
      </section>
    </div>

    <div v-else class="food-empty">
      还没有食记。先放一张照片，再写两三句话就很好。
    </div>
  </section>
</template>

<style scoped>
.food-feed {
  width: 100%;
  max-width: 1720px;
  margin: 0 auto;
  padding: 10px 0 70px;
}

.food-hero-card {
  position: relative;
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 22px;
  align-items: center;
  width: 100%;
  margin: 6px auto 34px;
  padding: 24px 32px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 22px;
  background:
    radial-gradient(circle at 88% 18%, rgba(232, 160, 189, 0.18), transparent 34%),
    linear-gradient(135deg, rgba(255, 255, 255, 0.9), rgba(250, 250, 250, 0.68));
  box-shadow: 0 18px 44px rgba(15, 23, 42, 0.06);
  overflow: hidden;
}

.dark .food-hero-card {
  background:
    radial-gradient(circle at 88% 18%, rgba(244, 166, 192, 0.16), transparent 34%),
    linear-gradient(135deg, rgba(28, 28, 34, 0.9), rgba(21, 21, 26, 0.78));
  box-shadow: 0 18px 44px rgba(0, 0, 0, 0.2);
}

.food-kicker {
  margin: 0 0 8px !important;
  color: var(--vp-c-brand-1) !important;
  font-size: 0.82rem;
  font-weight: 700;
  letter-spacing: 0.12em;
}

.food-hero-card h1 {
  margin: 0 0 12px;
  border: none;
  font-size: 2rem;
  line-height: 1.24;
  letter-spacing: -0.03em;
}

.food-desc {
  margin: 0 !important;
  max-width: 560px;
  color: var(--vp-c-text-2) !important;
  line-height: 1.9 !important;
}

.food-hero-mark {
  display: grid;
  place-items: center;
  width: 86px;
  height: 86px;
  border-radius: 30px;
  background: rgba(232, 160, 189, 0.16);
  color: var(--vp-c-brand-1);
  font-family: 'Caveat', cursive;
  font-size: 3rem;
  font-weight: 700;
  transform: rotate(5deg);
}

.food-timeline {
  display: grid;
  gap: 34px;
}

.food-month-section {
  display: grid;
  gap: 18px;
}

.food-month-title {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 14px;
  align-items: center;
  color: var(--vp-c-text-2);
  font-size: 0.9rem;
  font-weight: 700;
  letter-spacing: 0.08em;
}

.food-month-title i {
  height: 1px;
  background: linear-gradient(90deg, var(--vp-c-divider), transparent);
}

.food-card {
  display: grid;
  grid-template-columns: 48px 1fr;
  gap: 11px;
  width: 100%;
  margin: 0 auto;
  padding: 18px 22px 19px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 19px;
  background: rgba(255, 255, 255, 0.74);
  box-shadow: 0 14px 34px rgba(15, 23, 42, 0.055);
  transition: transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease;
}

.food-card:hover {
  transform: translateY(-2px);
  border-color: rgba(232, 160, 189, 0.46);
  box-shadow: 0 18px 42px rgba(15, 23, 42, 0.075);
}

.dark .food-card {
  background: rgba(21, 21, 26, 0.76);
  box-shadow: 0 14px 34px rgba(0, 0, 0, 0.18);
}

.food-avatar {
  display: grid;
  place-items: center;
  width: 42px;
  height: 42px;
  border-radius: 15px;
  background: var(--vp-c-brand-soft);
  font-size: 1.25rem;
}

.food-meta-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px;
  margin-bottom: 5px;
  color: var(--vp-c-text-3);
  font-size: 0.86rem;
}

.food-author {
  color: var(--vp-c-brand-1);
  font-weight: 700;
}

.food-dot {
  color: var(--vp-c-text-3);
}

.food-card h2 {
  margin: 0 0 8px;
  border: none;
  color: var(--vp-c-text-1);
  font-size: 1.2rem;
  line-height: 1.45;
  letter-spacing: -0.01em;
}

.food-submeta {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin: 0 0 12px !important;
  color: var(--vp-c-text-2) !important;
  font-size: 0.9rem;
  line-height: 1.6 !important;
}

.food-text {
  margin: 10px 0 14px;
}

.food-text p {
  margin: 6px 0 !important;
  color: var(--vp-c-text-1) !important;
  font-size: 0.98rem;
  line-height: 1.9 !important;
}

.food-image-grid {
  display: grid;
  gap: 4px;
  margin: 14px 0 14px;
  max-width: 280px;
}

.food-image-grid.one {
  grid-template-columns: minmax(0, 1fr);
  max-width: 216px;
}

.food-image-grid.two {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.food-image-grid.three,
.food-image-grid.nine {
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.food-image-item {
  position: relative;
  display: block;
  overflow: hidden;
  border-radius: 4px;
  background: var(--vp-c-bg-mute);
  border: 1px solid rgba(0, 0, 0, 0.04);
}

.dark .food-image-item {
  border-color: rgba(255, 255, 255, 0.06);
}

.food-image-grid.one .food-image-item {
  aspect-ratio: auto;
}

.food-image-grid.two .food-image-item,
.food-image-grid.three .food-image-item,
.food-image-grid.nine .food-image-item {
  aspect-ratio: 1 / 1;
}

.food-image-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  transition: transform 0.22s ease, filter 0.22s ease;
}

.food-image-grid.one .food-image-item img {
  height: auto;
  max-height: min(72vh, 760px);
  object-fit: contain;
}

.food-image-item:hover img {
  transform: scale(1.035);
  filter: saturate(1.04);
}

.food-note {
  margin: 12px 0 0 !important;
  padding: 10px 12px;
  border-radius: 14px;
  background: var(--vp-c-brand-soft);
  color: var(--vp-c-text-2) !important;
  font-size: 0.9rem;
  line-height: 1.75 !important;
}

.food-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 14px;
}

.food-tags span {
  display: inline-flex;
  padding: 4px 9px;
  border-radius: 999px;
  background: var(--vp-c-default-soft);
  color: var(--vp-c-text-2);
  font-size: 0.82rem;
  line-height: 1.4;
}

.food-empty {
  padding: 28px;
  border: 1px dashed var(--vp-c-divider);
  border-radius: 22px;
  color: var(--vp-c-text-2);
  text-align: center;
}

@media (max-width: 720px) {
  .food-feed {
    padding-bottom: 36px;
  }

  .food-hero-card {
    grid-template-columns: 1fr;
    width: 100%;
    max-width: 100%;
    margin-left: 0;
    transform: none;
    padding: 22px 20px;
    border-radius: 20px;
  }

  .food-hero-card h1 {
    font-size: 1.62rem;
  }

  .food-hero-mark {
    display: none;
  }

  .food-card {
    grid-template-columns: 38px 1fr;
    gap: 10px;
    width: 100%;
    max-width: 100%;
    margin-left: 0;
    transform: none;
    padding: 18px 14px 20px;
    border-radius: 20px;
  }

  .food-card:hover {
    transform: translateY(-2px);
  }

  .food-avatar {
    width: 34px;
    height: 34px;
    border-radius: 12px;
    font-size: 1rem;
  }

  .food-image-grid.three,
  .food-image-grid.nine {
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 5px;
  }

  .food-image-item {
    border-radius: 10px;
  }
}
</style>
