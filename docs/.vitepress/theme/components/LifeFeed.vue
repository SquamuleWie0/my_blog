<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { withBase } from 'vitepress'

type LifeImage = {
  src: string
  alt?: string
}

type LifeVideo = {
  src: string
  title?: string
  poster?: string
  type?: string
}

type LifePost = {
  date: string
  time?: string
  title?: string
  place?: string
  mood?: string
  text: string[]
  images?: LifeImage[]
  videos?: LifeVideo[]
  imageMode?: 'cards'
  layout?: 'portrait' | 'wide'
  tags?: string[]
}

const props = withDefaults(defineProps<{
  posts?: LifePost[]
}>(), {
  posts: () => []
})

const previewImages = ref<LifeImage[]>([])
const previewIndex = ref(0)
const cardIndexes = ref<Record<string, number>>({})
const touchStartX = ref(0)
const touchStartY = ref(0)
const touchLastX = ref(0)
const touchLastY = ref(0)
const isTouchingPreview = ref(false)
const cardTouchKey = ref('')
const cardTouchStartX = ref(0)
const cardTouchStartY = ref(0)
const cardTouchLastX = ref(0)
const cardTouchLastY = ref(0)

const currentPreview = computed(() => previewImages.value[previewIndex.value])

const galleryImages = computed(() => props.posts.flatMap((post) => post.images ?? []))

const groupedPosts = computed(() => {
  const groups = new Map<string, LifePost[]>()

  for (const post of props.posts) {
    const month = post.date.slice(0, 7).replace('-', '.')
    if (!groups.has(month)) groups.set(month, [])
    groups.get(month)!.push(post)
  }

  return Array.from(groups.entries()).map(([month, posts]) => ({ month, posts }))
})

function formatDay(date: string) {
  const parts = date.split('-')
  return parts.length === 3 ? `${parts[1]}.${parts[2]}` : date
}

function postKey(post: LifePost) {
  return `${post.date}-${post.time || ''}-${post.title || post.text[0] || ''}`
}

function imageClass(post: LifePost) {
  const count = post.images?.length ?? 0
  const layout = post.layout

  if (count <= 1) return 'one'
  if (count === 2) return ['two', layout]
  return ['grid', layout]
}

function cardIndex(post: LifePost) {
  const count = post.images?.length ?? 0
  if (!count) return 0

  const current = cardIndexes.value[postKey(post)] ?? 0
  return current >= 0 && current < count ? current : 0
}

function showCard(post: LifePost, index: number) {
  const count = post.images?.length ?? 0
  if (!count) return

  cardIndexes.value[postKey(post)] = (index + count) % count
}

function showPrevCard(post: LifePost) {
  showCard(post, cardIndex(post) - 1)
}

function showNextCard(post: LifePost) {
  showCard(post, cardIndex(post) + 1)
}

function cardSlideClass(post: LifePost, index: number) {
  const active = cardIndex(post)
  const count = post.images?.length ?? 0

  if (index === active) return 'active'
  if (count === 2) return 'next'
  if (index === (active + 1) % count) return 'next'
  if (index === (active - 1 + count) % count) return 'prev'
  return 'hidden'
}

function handleCardClick(post: LifePost, image: LifeImage, index: number) {
  if (index !== cardIndex(post)) {
    showCard(post, index)
    return
  }

  openPreview(image)
}

function handleCardKeydown(event: KeyboardEvent, post: LifePost) {
  if ((post.images?.length ?? 0) <= 1) return

  if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
    event.preventDefault()
    showPrevCard(post)
  }

  if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
    event.preventDefault()
    showNextCard(post)
  }
}

function openPreview(image: LifeImage) {
  const images = galleryImages.value
  const index = images.findIndex((item) => item.src === image.src)

  if (!images.length || index === -1) return
  previewImages.value = images
  previewIndex.value = index
}

function closePreview() {
  previewImages.value = []
  previewIndex.value = 0
}

function showPrev() {
  const count = previewImages.value.length
  if (!count) return
  previewIndex.value = (previewIndex.value - 1 + count) % count
}

function showNext() {
  const count = previewImages.value.length
  if (!count) return
  previewIndex.value = (previewIndex.value + 1) % count
}

function resetPreviewTouch() {
  isTouchingPreview.value = false
  touchStartX.value = 0
  touchStartY.value = 0
  touchLastX.value = 0
  touchLastY.value = 0
}

function resetCardTouch() {
  cardTouchKey.value = ''
  cardTouchStartX.value = 0
  cardTouchStartY.value = 0
  cardTouchLastX.value = 0
  cardTouchLastY.value = 0
}

function handlePreviewTouchStart(event: TouchEvent) {
  if (!currentPreview.value || event.touches.length !== 1) return

  const touch = event.touches[0]
  isTouchingPreview.value = true
  touchStartX.value = touch.clientX
  touchStartY.value = touch.clientY
  touchLastX.value = touch.clientX
  touchLastY.value = touch.clientY
}

function handlePreviewTouchMove(event: TouchEvent) {
  if (!isTouchingPreview.value || event.touches.length !== 1) return

  const touch = event.touches[0]
  touchLastX.value = touch.clientX
  touchLastY.value = touch.clientY
}

function handlePreviewTouchEnd() {
  if (!isTouchingPreview.value || previewImages.value.length <= 1) {
    resetPreviewTouch()
    return
  }

  const deltaX = touchLastX.value - touchStartX.value
  const deltaY = touchLastY.value - touchStartY.value
  const absX = Math.abs(deltaX)
  const absY = Math.abs(deltaY)

  resetPreviewTouch()

  if (absX < 44 || absX < absY * 1.2) return
  if (deltaX > 0) showPrev()
  else showNext()
}

function handleCardTouchStart(event: TouchEvent, post: LifePost) {
  if ((post.images?.length ?? 0) <= 1 || event.touches.length !== 1) return

  const touch = event.touches[0]
  cardTouchKey.value = postKey(post)
  cardTouchStartX.value = touch.clientX
  cardTouchStartY.value = touch.clientY
  cardTouchLastX.value = touch.clientX
  cardTouchLastY.value = touch.clientY
}

function handleCardTouchMove(event: TouchEvent) {
  if (!cardTouchKey.value || event.touches.length !== 1) return

  const touch = event.touches[0]
  cardTouchLastX.value = touch.clientX
  cardTouchLastY.value = touch.clientY
}

function handleCardTouchEnd(post: LifePost) {
  if (cardTouchKey.value !== postKey(post)) {
    resetCardTouch()
    return
  }

  const deltaX = cardTouchLastX.value - cardTouchStartX.value
  const deltaY = cardTouchLastY.value - cardTouchStartY.value
  const absX = Math.abs(deltaX)
  const absY = Math.abs(deltaY)

  resetCardTouch()

  if (absX < 38 || absX < absY * 1.15) return
  if (deltaX > 0) showPrevCard(post)
  else showNextCard(post)
}

function handlePreviewKeydown(event: KeyboardEvent) {
  if (!currentPreview.value) return

  if (event.key === 'Escape') {
    closePreview()
    return
  }

  if (event.key === 'ArrowLeft') {
    event.preventDefault()
    showPrev()
  }

  if (event.key === 'ArrowRight') {
    event.preventDefault()
    showNext()
  }
}

onMounted(() => {
  window.addEventListener('keydown', handlePreviewKeydown)
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', handlePreviewKeydown)
})
</script>

<template>
  <section class="life-feed">
    <header class="life-head">
      <h1>途中</h1>
    </header>

    <div v-if="groupedPosts.length" class="life-stream">
      <section v-for="group in groupedPosts" :key="group.month" class="life-month">
        <div class="life-month-label">{{ group.month }}</div>

        <div class="life-month-posts">
          <article v-for="post in group.posts" :key="`${post.date}-${post.title || post.text[0]}`" class="life-post">
            <img class="life-avatar" :src="withBase('/life/avatar.jpg')" alt="wie0 的头像" loading="lazy">

            <div class="life-card">
              <div class="life-meta">
                <span>wie0</span>
                <i v-if="post.place || post.mood">/</i>
                <em v-if="post.place">{{ post.place }}</em>
                <i v-if="post.place && post.mood">/</i>
                <em v-if="post.mood">{{ post.mood }}</em>
              </div>

              <h2 v-if="post.title">{{ post.title }}</h2>

              <div class="life-text">
                <p v-for="line in post.text" :key="line">{{ line }}</p>
              </div>

              <div
                v-if="post.imageMode === 'cards' && post.images?.length"
                class="life-image-cards"
                tabindex="0"
                aria-label="照片卡牌"
                @keydown="handleCardKeydown($event, post)"
                @touchstart.passive="handleCardTouchStart($event, post)"
                @touchmove.passive="handleCardTouchMove"
                @touchend="handleCardTouchEnd(post)"
                @touchcancel="resetCardTouch"
              >
                <div class="life-card-stage">
                  <button
                    v-for="(image, index) in post.images"
                    :key="`${image.src}-${index}`"
                    type="button"
                    class="life-card-slide"
                    :class="cardSlideClass(post, index)"
                    @click="handleCardClick(post, image, index)"
                  >
                    <img :src="withBase(image.src)" :alt="image.alt || post.title || '生活照片'" loading="lazy" />
                  </button>
                </div>

                <button
                  v-if="post.images.length > 1"
                  class="life-card-nav prev"
                  type="button"
                  aria-label="上一张"
                  @click="showPrevCard(post)"
                >
                  ‹
                </button>
                <button
                  v-if="post.images.length > 1"
                  class="life-card-nav next"
                  type="button"
                  aria-label="下一张"
                  @click="showNextCard(post)"
                >
                  ›
                </button>

                <div v-if="post.images.length > 1" class="life-card-count">
                  {{ cardIndex(post) + 1 }} / {{ post.images.length }}
                </div>
              </div>

              <div
                v-else-if="post.images?.length"
                class="life-images"
                :class="imageClass(post)"
              >
                <button
                  v-for="(image, index) in post.images"
                  :key="`${image.src}-${index}`"
                  type="button"
                  @click="openPreview(image)"
                >
                  <img :src="withBase(image.src)" :alt="image.alt || post.title || '生活照片'" loading="lazy" />
                </button>
              </div>

              <div v-if="post.videos?.length" class="life-videos">
                <figure v-for="(video, index) in post.videos" :key="`${video.src}-${index}`" class="life-video">
                  <video
                    controls
                    playsinline
                    preload="metadata"
                    :poster="video.poster ? withBase(video.poster) : undefined"
                  >
                    <source :src="withBase(video.src)" :type="video.type || 'video/mp4'">
                  </video>
                  <figcaption v-if="video.title">{{ video.title }}</figcaption>
                </figure>
              </div>

              <div v-if="post.tags?.length" class="life-tags">
                <span v-for="tag in post.tags" :key="tag">#{{ tag }}</span>
              </div>

              <div class="life-time-row">
                <span>{{ formatDay(post.date) }}</span>
                <i v-if="post.time">/</i>
                <span v-if="post.time">{{ post.time }}</span>
              </div>
            </div>
          </article>
        </div>
      </section>
    </div>

    <div v-else class="life-empty">这里先留空。</div>

    <Teleport to="body">
      <div
        v-if="currentPreview"
        class="life-preview"
        @click.self="closePreview"
        @touchstart.passive="handlePreviewTouchStart"
        @touchmove.passive="handlePreviewTouchMove"
        @touchend="handlePreviewTouchEnd"
        @touchcancel="resetPreviewTouch"
      >
        <button class="life-preview-close" type="button" aria-label="关闭预览" @click="closePreview">×</button>
        <button
          v-if="previewImages.length > 1"
          class="life-preview-nav prev"
          type="button"
          aria-label="上一张"
          @click.stop="showPrev"
        >
          ‹
        </button>
        <img :src="withBase(currentPreview.src)" :alt="currentPreview.alt || '生活照片预览'">
        <button
          v-if="previewImages.length > 1"
          class="life-preview-nav next"
          type="button"
          aria-label="下一张"
          @click.stop="showNext"
        >
          ›
        </button>
        <div v-if="previewImages.length > 1" class="life-preview-count">
          {{ previewIndex + 1 }} / {{ previewImages.length }}
        </div>
      </div>
    </Teleport>
  </section>
</template>

<style scoped>
.life-feed {
  width: 100%;
  max-width: 980px;
  margin: 0 auto;
  padding: 10px 0 72px;
}

.life-head {
  padding: 14px 0 20px;
  border-bottom: 1px solid var(--vp-c-divider);
}

.life-head h1 {
  margin: 0;
  border: none;
  color: var(--vp-c-text-1);
  font-size: clamp(1.55rem, 3vw, 2.15rem);
  line-height: 1.25;
  letter-spacing: 0;
}

.life-stream {
  display: grid;
  gap: 40px;
  margin-top: 28px;
}

.life-month {
  display: grid;
  grid-template-columns: 82px minmax(0, 1fr);
  gap: 0;
  column-gap: 22px;
  align-items: start;
}

.life-month-label {
  margin: 0;
  padding-top: 22px;
  color: var(--vp-c-text-3);
  font-size: 0.96rem;
  font-weight: 700;
  line-height: 1.4;
  letter-spacing: 0.08em;
  text-align: right;
}

.life-month-posts {
  display: grid;
  gap: 0;
  min-width: 0;
  padding-left: 26px;
  border-left: 1px solid var(--vp-c-divider);
}

.life-post {
  position: relative;
  display: grid;
  grid-template-columns: 46px minmax(0, 1fr);
  gap: 16px;
  padding: 22px 0 28px;
  border-bottom: 1px solid var(--vp-c-divider);
}

.life-post::before {
  content: "";
  position: absolute;
  top: 38px;
  left: -31px;
  width: 9px;
  height: 9px;
  border: 2px solid var(--vp-c-brand-1);
  border-radius: 999px;
  background: var(--vp-c-bg);
  box-shadow: 0 0 0 4px var(--vp-c-bg);
}

.life-avatar {
  display: block;
  width: 46px;
  height: 46px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 9px;
  object-fit: cover;
  object-position: center;
  background: var(--vp-c-bg-soft);
}

.life-card {
  min-width: 0;
  padding: 0;
  border: 0;
  border-radius: 0;
  background: transparent;
}

.life-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  align-items: center;
  margin-bottom: 9px;
  color: var(--vp-c-text-3);
  font-size: 1rem;
}

.life-meta span {
  color: var(--vp-c-brand-1);
  font-weight: 700;
}

.life-meta i,
.life-meta em {
  font-style: normal;
}

.life-card h2 {
  margin: 0 0 8px;
  border: none;
  color: var(--vp-c-text-1);
  font-size: 1.05rem;
  line-height: 1.55;
  letter-spacing: 0;
}

.life-text {
  display: grid;
  gap: 4px;
}

.life-text p {
  margin: 0 !important;
  color: var(--vp-c-text-1) !important;
  font-size: 1.12rem;
  line-height: 1.62 !important;
}

.life-images {
  display: grid;
  gap: 6px;
  margin-top: 16px;
  width: min(100%, 520px);
}

.life-images.one {
  grid-template-columns: minmax(0, 1fr);
  width: fit-content;
  max-width: min(100%, 400px);
}

.life-images.two {
  grid-template-columns: repeat(2, minmax(0, 1fr));
  width: min(100%, 520px);
}

.life-images.two.wide {
  grid-template-columns: minmax(0, 1fr);
  width: min(100%, 560px);
}

.life-images.grid {
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.life-images button {
  display: block;
  width: 100%;
  padding: 0;
  overflow: hidden;
  border-radius: 7px;
  border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg-mute);
  cursor: zoom-in;
}

.life-images.one button {
  aspect-ratio: auto;
  width: fit-content;
  max-width: 100%;
}

.life-images.two button {
  aspect-ratio: 3 / 4;
}

.life-images.two.wide button {
  aspect-ratio: auto;
}

.life-images.grid button {
  aspect-ratio: 1 / 1;
}

.life-images img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.life-images.one img {
  width: auto;
  height: auto;
  max-width: min(100%, 400px);
  max-height: 460px;
  object-fit: contain;
}

.life-images.wide img {
  height: auto;
  object-fit: contain;
}

.life-image-cards {
  position: relative;
  width: min(100%, 430px);
  margin-top: 16px;
  padding: 0 34px 28px 0;
  outline: none;
  touch-action: pan-y;
  user-select: none;
}

.life-image-cards:focus-visible {
  border-radius: 10px;
  box-shadow: 0 0 0 2px var(--vp-c-brand-1);
}

.life-card-stage {
  position: relative;
  aspect-ratio: 4 / 4.7;
  isolation: isolate;
}

.life-card-slide {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  width: 100%;
  padding: 0;
  overflow: hidden;
  border: 1px solid var(--vp-c-divider);
  border-radius: 9px;
  background: var(--vp-c-bg-mute);
  box-shadow: 0 14px 34px rgba(0, 0, 0, 0.16);
  cursor: zoom-in;
  transition:
    opacity 0.22s ease,
    transform 0.22s ease,
    filter 0.22s ease;
}

.life-card-slide img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: contain;
  -webkit-user-drag: none;
}

.life-card-slide.active {
  z-index: 3;
  opacity: 1;
  transform: translate3d(0, 0, 0) rotate(-0.4deg);
}

.life-card-slide.next,
.life-card-slide.prev,
.life-card-slide.hidden {
  pointer-events: auto;
}

.life-card-slide.next {
  z-index: 2;
  opacity: 0.54;
  transform: translate3d(22px, 18px, 0) rotate(2.2deg) scale(0.965);
  cursor: pointer;
  filter: saturate(0.9) brightness(0.92);
}

.life-card-slide.prev {
  z-index: 1;
  opacity: 0.28;
  transform: translate3d(-12px, 14px, 0) rotate(-2deg) scale(0.945);
  cursor: pointer;
  filter: saturate(0.82) brightness(0.86);
}

.life-card-slide.hidden {
  z-index: 0;
  opacity: 0;
  transform: translate3d(28px, 20px, 0) scale(0.94);
  pointer-events: none;
}

.life-card-nav {
  position: absolute;
  top: calc((100% - 28px) / 2);
  z-index: 5;
  display: grid;
  place-items: center;
  width: 34px;
  height: 44px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 999px;
  color: var(--vp-c-text-1);
  background: color-mix(in srgb, var(--vp-c-bg) 82%, transparent);
  backdrop-filter: blur(10px);
  transform: translateY(-50%);
  cursor: pointer;
  font-size: 1.6rem;
  line-height: 1;
}

.life-card-nav.prev {
  left: -14px;
}

.life-card-nav.next {
  right: 14px;
}

.life-card-count {
  position: absolute;
  right: 40px;
  bottom: 0;
  color: var(--vp-c-text-3);
  font-size: 0.84rem;
  line-height: 1.4;
}

.life-videos {
  display: grid;
  gap: 10px;
  margin-top: 16px;
  width: min(100%, 360px);
}

.life-video {
  margin: 0;
}

.life-video video {
  display: block;
  width: 100%;
  max-height: 540px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 7px;
  background: var(--vp-c-bg-mute);
  object-fit: contain;
}

.life-video figcaption {
  margin-top: 8px;
  color: var(--vp-c-text-3);
  font-size: 0.86rem;
  line-height: 1.6;
}

.life-time-row {
  display: flex;
  gap: 8px;
  align-items: center;
  margin-top: 14px;
  color: var(--vp-c-text-3);
  font-size: 0.9rem;
  line-height: 1.5;
}

.life-time-row i {
  font-style: normal;
  opacity: 0.7;
}

.life-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 14px;
}

.life-tags span {
  display: inline-flex;
  align-items: center;
  min-height: 24px;
  padding: 0 9px;
  border-radius: 999px;
  color: var(--vp-c-text-2);
  background: var(--vp-c-bg);
  border: 1px solid var(--vp-c-divider);
  font-size: 0.78rem;
}

.life-empty {
  margin-top: 22px;
  padding: 18px 0;
  color: var(--vp-c-text-3);
  font-size: 0.92rem;
}

.dark .life-card {
  background: transparent;
}

.dark .life-tags span {
  background: var(--vp-c-bg-mute);
}

.life-preview {
  position: fixed;
  inset: 0;
  z-index: 9999;
  display: grid;
  place-items: center;
  padding: 48px 68px;
  background: rgba(0, 0, 0, 0.82);
  touch-action: pan-y;
  user-select: none;
}

.life-preview img {
  display: block;
  max-width: min(92vw, 1180px);
  max-height: 86vh;
  border-radius: 8px;
  object-fit: contain;
  box-shadow: 0 24px 80px rgba(0, 0, 0, 0.38);
  -webkit-user-drag: none;
}

.life-preview-close,
.life-preview-nav {
  position: fixed;
  display: grid;
  place-items: center;
  border: 1px solid rgba(255, 255, 255, 0.18);
  color: rgba(255, 255, 255, 0.9);
  background: rgba(20, 20, 24, 0.56);
  backdrop-filter: blur(10px);
  cursor: pointer;
}

.life-preview-close {
  top: 22px;
  right: 24px;
  width: 38px;
  height: 38px;
  border-radius: 999px;
  font-size: 1.4rem;
  line-height: 1;
}

.life-preview-nav {
  top: 50%;
  width: 42px;
  height: 58px;
  border-radius: 999px;
  transform: translateY(-50%);
  font-size: 2.1rem;
  line-height: 1;
}

.life-preview-nav.prev {
  left: 22px;
}

.life-preview-nav.next {
  right: 22px;
}

.life-preview-count {
  position: fixed;
  bottom: 22px;
  left: 50%;
  transform: translateX(-50%);
  color: rgba(255, 255, 255, 0.72);
  font-size: 0.86rem;
}

@media (max-width: 720px) {
  .life-feed {
    padding-bottom: 44px;
  }

  .life-card {
    padding: 0;
  }

  .life-month-label {
    margin-bottom: 8px;
    padding-left: 0;
    padding-top: 0;
    text-align: left;
  }

  .life-month {
    grid-template-columns: 1fr;
  }

  .life-month-posts {
    padding-left: 0;
    border-left: 0;
  }

  .life-post {
    grid-template-columns: 38px minmax(0, 1fr);
    gap: 12px;
  }

  .life-post::before {
    display: none;
  }

  .life-avatar {
    width: 38px;
    height: 38px;
  }

  .life-images,
  .life-images.one,
  .life-images.two,
  .life-image-cards {
    width: 100%;
  }

  .life-videos {
    width: min(100%, 330px);
  }

  .life-image-cards {
    padding-right: 22px;
  }

  .life-card-slide img {
    height: 100%;
  }

  .life-card-slide.next {
    transform: translate3d(14px, 14px, 0) rotate(2deg) scale(0.965);
  }

  .life-card-nav {
    display: none;
  }

  .life-card-count {
    right: 28px;
  }

  .life-preview {
    padding: 38px 14px;
  }

  .life-preview-nav {
    width: 36px;
    height: 48px;
    font-size: 1.8rem;
  }
}
</style>
