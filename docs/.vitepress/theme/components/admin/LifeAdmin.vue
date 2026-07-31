<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { withBase } from 'vitepress'
import initialPosts from '../../../data/life-posts.json'
import LifeFeed from '../LifeFeed.vue'

type PublishAsset = {
  type: 'image' | 'video'
  file: File
  previewUrl: string
}

type LifeImage = {
  src: string
  alt?: string
}

type LifeVideo = {
  src: string
  title?: string
  type?: string
}

type LifePostRecord = {
  id: string
  date: string
  time?: string
  text: string[]
  images?: LifeImage[]
  videos?: LifeVideo[]
}

type ConsolePanel = 'publish' | 'manage'

const apiBase = ref('/api/admin')

function resolveApiBase() {
  const { hostname } = window.location
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return 'http://127.0.0.1:8787/api/admin'
  }
  return '/api/admin'
}
const password = ref('')
const date = ref(new Date().toISOString().slice(0, 10))
const time = ref(new Date().toTimeString().slice(0, 5))
const text = ref('')
const assets = ref<PublishAsset[]>([])
const isLoggingIn = ref(false)
const isPublishing = ref(false)
const statusMessage = ref('')
const errorMessage = ref('')
const authMessage = ref('')
const oauthEnabled = ref(false)
const authenticated = ref(false)
const currentUser = ref('')
const authMethod = ref('')
const showServiceSettings = ref(false)
const activePanel = ref<ConsolePanel>('publish')
const posts = ref<LifePostRecord[]>(normalizePosts(initialPosts))
const selectedPostId = ref(posts.value[0]?.id || '')
const editDate = ref('')
const editTime = ref('')
const editText = ref('')
const isLoadingPosts = ref(false)
const isSavingPost = ref(false)
const isDeletingPost = ref(false)
const manageMessage = ref('')
const previewImages = ref<LifeImage[]>([])
const previewIndex = ref(0)
const touchStartX = ref(0)
const touchStartY = ref(0)
const touchLastX = ref(0)
const touchLastY = ref(0)
const isTouchingPreview = ref(false)

const textLines = computed(() => text.value.split('\n'))
const canPublish = computed(() => authenticated.value && text.value.trim() && !isPublishing.value)
const selectedPost = computed(() => posts.value.find((post) => post.id === selectedPostId.value))
const currentPreview = computed(() => previewImages.value[previewIndex.value])
const editLines = computed(() => editText.value.split('\n'))
const editedPostPreview = computed<LifePostRecord | undefined>(() => {
  const post = selectedPost.value
  if (!post) return undefined

  return {
    ...post,
    date: editDate.value || post.date,
    time: editTime.value,
    text: editLines.value
  }
})
const managePreviewPosts = computed(() => {
  const preview = editedPostPreview.value
  if (!preview) return posts.value

  return posts.value.map((post) => (post.id === preview.id ? preview : post))
})
const manageFeedKey = computed(() => `${selectedPostId.value}:${editDate.value}:${editTime.value}:${editText.value}`)
const editorTitle = computed(() => editLines.value.find((line) => line.trim()) || '生活记录')
const publishPreviewPost = computed<LifePostRecord>(() => {
  const images = assets.value
    .filter((asset) => asset.type === 'image')
    .map((asset) => ({ src: asset.previewUrl, alt: asset.file.name || '待发布图片' }))
  const videos = assets.value
    .filter((asset) => asset.type === 'video')
    .map((asset) => ({ src: asset.previewUrl, title: asset.file.name || '待发布视频', type: asset.file.type || undefined }))

  return {
    id: `draft-${date.value}-${time.value}`,
    date: date.value,
    time: time.value,
    text: textLines.value,
    images,
    videos
  }
})
const hasPublishPreview = computed(() => Boolean(text.value.trim() || assets.value.length))
const selectedPostMediaCount = computed(() => {
  const post = selectedPost.value
  if (!post) return 0
  return (post.images?.length ?? 0) + (post.videos?.length ?? 0)
})

function normalizePosts(value: unknown): LifePostRecord[] {
  if (!Array.isArray(value)) return []

  return value
    .filter((post): post is LifePostRecord => {
      return Boolean(post && typeof post === 'object' && 'date' in post && 'text' in post)
    })
    .map((post) => ({
      ...post,
      id: post.id || `${post.date}-${post.time || ''}`
    }))
}

async function checkAuth() {
  authMessage.value = ''
  try {
    const response = await fetch(`${apiBase.value}/auth/me`, { credentials: 'include' })
    if (!response.ok) throw new Error('auth check failed')

    const result = await response.json().catch(() => ({}))
    oauthEnabled.value = Boolean(result.oauthEnabled)
    authenticated.value = Boolean(result.authenticated)
    currentUser.value = result.user || ''
    authMethod.value = result.method || ''
    authMessage.value = authenticated.value
      ? `已进入控制台${currentUser.value ? `：${currentUser.value}` : ''}`
      : '需要解锁控制台'

    if (authenticated.value) await fetchPosts()
  } catch {
    authMessage.value = '未连接发布服务'
    oauthEnabled.value = false
    authenticated.value = false
    currentUser.value = ''
    authMethod.value = ''
  }
}

async function loginWithSecret() {
  if (!password.value.trim() || isLoggingIn.value) return

  isLoggingIn.value = true
  errorMessage.value = ''
  statusMessage.value = ''

  try {
    const form = new FormData()
    form.append('password', password.value)

    const response = await fetch(`${apiBase.value}/auth/login`, {
      method: 'POST',
      body: form,
      credentials: 'include'
    })

    const result = await response.json().catch(() => ({}))
    if (response.status === 404) throw new Error('发布服务未连接：/api/admin 没有代理到后端')
    if (!response.ok) throw new Error(result.detail || '解锁失败')

    password.value = ''
    statusMessage.value = result.message || '已进入控制台'
    await checkAuth()
  } catch (error) {
    const message = error instanceof Error ? error.message : '解锁失败'
    errorMessage.value = message === 'Failed to fetch' ? '发布服务未连接：请先启动 admin-api 或配置 /api/admin 代理' : message
  } finally {
    isLoggingIn.value = false
  }
}

function loginWithGitHub() {
  window.location.href = `${apiBase.value}/auth/github/login`
}

function showPanel(panel: ConsolePanel) {
  activePanel.value = panel
  if (panel === 'manage') {
    syncEditor()
    fetchPosts()
  }
}

async function logout() {
  await fetch(`${apiBase.value}/auth/logout`, {
    method: 'POST',
    credentials: 'include'
  }).catch(() => undefined)

  authenticated.value = false
  currentUser.value = ''
  authMethod.value = ''
  statusMessage.value = ''
  errorMessage.value = ''
  manageMessage.value = ''
  activePanel.value = 'publish'
  posts.value = normalizePosts(initialPosts)
  selectedPostId.value = posts.value[0]?.id || ''
  syncEditor()
  resetForm()
}

function handleFiles(event: Event) {
  const input = event.target as HTMLInputElement
  const files = Array.from(input.files ?? [])

  for (const file of files) {
    const type = file.type.startsWith('video/') ? 'video' : 'image'
    assets.value.push({
      type,
      file,
      previewUrl: URL.createObjectURL(file)
    })
  }

  input.value = ''
}

function removeAsset(index: number) {
  const [asset] = assets.value.splice(index, 1)
  if (asset) URL.revokeObjectURL(asset.previewUrl)
}

function resetForm() {
  text.value = ''
  for (const asset of assets.value) URL.revokeObjectURL(asset.previewUrl)
  assets.value = []
  date.value = new Date().toISOString().slice(0, 10)
  time.value = new Date().toTimeString().slice(0, 5)
}

async function publishPost() {
  if (!canPublish.value) return

  isPublishing.value = true
  statusMessage.value = ''
  errorMessage.value = ''

  try {
    const form = new FormData()
    form.append('date', date.value)
    form.append('time', time.value)
    form.append('text', text.value)
    for (const asset of assets.value) form.append('files', asset.file)

    const response = await fetch(`${apiBase.value}/life/posts`, {
      method: 'POST',
      body: form,
      credentials: 'include'
    })

    const result = await response.json().catch(() => ({}))
    if (!response.ok) throw new Error(result.detail || '发布失败')

    statusMessage.value = result.message || '已发布，等待部署完成。'
    resetForm()
    await fetchPosts()
  } catch (error) {
    const message = error instanceof Error ? error.message : '发布失败'
    if (message.includes('session') || message.includes('required')) {
      authenticated.value = false
      authMessage.value = '登录已过期'
    }
    errorMessage.value = message
  } finally {
    isPublishing.value = false
  }
}

async function fetchPosts() {
  if (!authenticated.value || isLoadingPosts.value) return

  isLoadingPosts.value = true
  manageMessage.value = ''

  try {
    const response = await fetch(`${apiBase.value}/life/posts`, { credentials: 'include' })
    const result = await response.json().catch(() => ({}))
    if (!response.ok) throw new Error(result.detail || '读取失败')

    posts.value = normalizePosts(result.posts)
    if (!selectedPostId.value || !posts.value.some((post) => post.id === selectedPostId.value)) {
      selectedPostId.value = posts.value[0]?.id || ''
    }
    syncEditor()
  } catch (error) {
    manageMessage.value = error instanceof Error ? error.message : '读取失败'
    syncEditor()
  } finally {
    isLoadingPosts.value = false
  }
}

function syncEditor() {
  const post = selectedPost.value
  if (!post) {
    editDate.value = ''
    editTime.value = ''
    editText.value = ''
    return
  }

  editDate.value = post.date
  editTime.value = post.time || ''
  editText.value = post.text.join('\n')
}

function selectPost(post: LifePostRecord) {
  selectedPostId.value = post.id
  manageMessage.value = ''
  syncEditor()
}

function formatPostDate(post: LifePostRecord) {
  const day = post.date.replaceAll('-', '.')
  return post.time ? `${day} / ${post.time}` : day
}

function mediaSrc(src: string) {
  if (/^(blob:|data:|https?:)/.test(src)) return src
  const base = withBase('/')
  if (src.startsWith(base)) return src
  return withBase(src.startsWith('/') ? src : `/${src}`)
}

function openPreview(images: LifeImage[] | undefined, index: number) {
  if (!images?.length) return

  previewImages.value = images
  previewIndex.value = Math.max(0, Math.min(index, images.length - 1))
}

function closePreview() {
  previewImages.value = []
  previewIndex.value = 0
  resetPreviewTouch()
}

function showPrevPreview() {
  const count = previewImages.value.length
  if (!count) return
  previewIndex.value = (previewIndex.value - 1 + count) % count
}

function showNextPreview() {
  const count = previewImages.value.length
  if (!count) return
  previewIndex.value = (previewIndex.value + 1) % count
}

function handlePreviewKeydown(event: KeyboardEvent) {
  if (!currentPreview.value) return

  if (event.key === 'Escape') {
    closePreview()
    return
  }

  if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
    event.preventDefault()
    showPrevPreview()
  }

  if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
    event.preventDefault()
    showNextPreview()
  }
}

function resetPreviewTouch() {
  isTouchingPreview.value = false
  touchStartX.value = 0
  touchStartY.value = 0
  touchLastX.value = 0
  touchLastY.value = 0
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
  if (deltaX > 0) showPrevPreview()
  else showNextPreview()
}

async function saveSelectedPost() {
  const post = selectedPost.value
  if (!post || isSavingPost.value) return

  isSavingPost.value = true
  manageMessage.value = ''
  errorMessage.value = ''

  try {
    const response = await fetch(`${apiBase.value}/life/posts/${encodeURIComponent(post.id)}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        date: editDate.value,
        time: editTime.value,
        text: editText.value.split('\n')
      })
    })

    const result = await response.json().catch(() => ({}))
    if (!response.ok) throw new Error(result.detail || '保存失败')

    const updatedPost: LifePostRecord = {
      ...post,
      date: editDate.value,
      time: editTime.value,
      text: editLines.value
    }
    posts.value = posts.value.map((item) => (item.id === post.id ? updatedPost : item))
    selectedPostId.value = post.id
    activePanel.value = 'manage'
    manageMessage.value = result.message || '已保存'
  } catch (error) {
    manageMessage.value = error instanceof Error ? error.message : '保存失败'
  } finally {
    isSavingPost.value = false
  }
}

async function deleteSelectedPost() {
  const post = selectedPost.value
  if (!post || isDeletingPost.value) return
  if (!window.confirm('确认从页面移除这条生活记录吗？素材文件会先保留。')) return

  isDeletingPost.value = true
  manageMessage.value = ''
  errorMessage.value = ''

  try {
    const response = await fetch(`${apiBase.value}/life/posts/${encodeURIComponent(post.id)}`, {
      method: 'DELETE',
      credentials: 'include'
    })

    const result = await response.json().catch(() => ({}))
    if (!response.ok) throw new Error(result.detail || '删除失败')

    manageMessage.value = result.message || '已删除'
    selectedPostId.value = ''
    await fetchPosts()
  } catch (error) {
    manageMessage.value = error instanceof Error ? error.message : '删除失败'
  } finally {
    isDeletingPost.value = false
  }
}

onMounted(() => {
  apiBase.value = resolveApiBase()
  showServiceSettings.value = new URLSearchParams(window.location.search).get('debug') === '1'
  window.addEventListener('keydown', handlePreviewKeydown)
  checkAuth()
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', handlePreviewKeydown)
})
</script>

<template>
  <section class="life-admin">
    <header>
      <div>
        <p>wie0 console</p>
        <h1>{{ authenticated ? '生活控制台' : '登录' }}</h1>
      </div>
      <div class="header-actions">
        <span class="service-pill">{{ authMessage || '发布服务未检查' }}</span>
        <button v-if="authenticated" class="ghost-button" type="button" @click="logout">退出</button>
      </div>
    </header>

    <section v-if="!authenticated" class="login-shell">
      <form class="login-card" @submit.prevent="loginWithSecret">
        <p>输入密码进入控制台。</p>
        <label>
          密码
          <input v-model="password" type="password" autocomplete="current-password" autofocus>
        </label>
        <button class="publish-button" type="submit" :disabled="!password.trim() || isLoggingIn">
          {{ isLoggingIn ? '进入中...' : '进入控制台' }}
        </button>
        <button v-if="oauthEnabled" class="github-button" type="button" @click="loginWithGitHub">
          GitHub 登录
        </button>
        <p v-if="statusMessage" class="status ok">{{ statusMessage }}</p>
        <p v-if="errorMessage" class="status error">{{ errorMessage }}</p>
      </form>
    </section>

    <div v-else class="console-body">
      <nav class="console-tabs" aria-label="控制台功能">
        <button
          type="button"
          :class="{ active: activePanel === 'publish' }"
          @click="showPanel('publish')"
        >
          发布
        </button>
        <button
          type="button"
          :class="{ active: activePanel === 'manage' }"
          @click="showPanel('manage')"
        >
          管理
        </button>
      </nav>

      <div v-if="activePanel === 'publish'" class="admin-grid">
        <form class="admin-panel" @submit.prevent="publishPost">
          <details v-if="showServiceSettings" class="service-settings">
            <summary>发布服务设置</summary>
            <div class="service-settings-body">
              <label>
                API 地址
                <input v-model="apiBase" type="text" autocomplete="off" @blur="checkAuth">
              </label>

              <div class="auth-row">
                <span>{{ authMessage || '检查发布服务状态' }}</span>
                <button v-if="oauthEnabled && !authenticated" type="button" @click="loginWithGitHub">GitHub 登录</button>
                <button v-else type="button" @click="checkAuth">检查</button>
              </div>
            </div>
          </details>

          <label class="content-field">
            内容
            <textarea v-model="text" rows="8" placeholder="写下这一条。换行会保留。" />
          </label>

          <div class="date-row">
            <label>
              日期
              <input v-model="date" type="date">
            </label>
            <label>
              时间
              <input v-model="time" type="time">
            </label>
          </div>

          <label class="file-picker">
            <span>添加图片 / 视频</span>
            <input type="file" multiple accept="image/*,video/*,.heic,.heif,.mov,.mp4,.m4v,.webm" @change="handleFiles">
          </label>

          <div v-if="assets.length" class="asset-list">
            <article v-for="(asset, index) in assets" :key="asset.previewUrl">
              <img v-if="asset.type === 'image'" :src="asset.previewUrl" alt="待上传图片预览">
              <video v-else :src="asset.previewUrl" muted playsinline controls />
              <button type="button" @click="removeAsset(index)">删除</button>
            </article>
          </div>

          <div class="publish-row">
            <span class="publish-note">发布后会写入生活记录；实况可以把照片和短视频一起选中上传。</span>
            <button class="publish-button" type="submit" :disabled="!canPublish">
              {{ isPublishing ? '发布中...' : '发布' }}
            </button>
          </div>

          <p v-if="statusMessage" class="status ok">{{ statusMessage }}</p>
          <p v-if="errorMessage" class="status error">{{ errorMessage }}</p>
        </form>

        <aside class="preview-panel">
          <p class="preview-label">预览</p>
          <div class="real-preview-shell">
            <LifeFeed
              v-if="hasPublishPreview"
              class="admin-life-preview"
              :posts="[publishPreviewPost]"
              :show-header="false"
            />
            <p v-else class="empty-state">写点内容或添加素材后，这里会显示发布后的真实排版。</p>
          </div>
        </aside>
      </div>

      <div v-else class="manage-grid">
        <section class="post-stream-panel">
          <div class="panel-head">
            <div>
              <p class="preview-label">管理</p>
              <h2>途中</h2>
              <span>{{ posts.length }} 条记录</span>
            </div>
            <button class="ghost-button" type="button" :disabled="isLoadingPosts" @click="fetchPosts">
              {{ isLoadingPosts ? '读取中...' : '刷新' }}
            </button>
          </div>

          <div v-if="posts.length" class="manage-feed-shell">
            <LifeFeed
              :key="manageFeedKey"
              class="admin-manage-feed"
              :posts="managePreviewPosts"
              :show-header="false"
              editable
              :selected-id="selectedPostId"
              @edit="selectPost"
            />
          </div>
          <p v-else class="empty-state">还没有读到记录。</p>
          <p v-if="manageMessage" class="status manage-status">{{ manageMessage }}</p>
        </section>

        <section class="editor-panel">
          <template v-if="selectedPost">
            <div class="panel-head">
              <div>
                <p class="preview-label">编辑</p>
                <h2>{{ editorTitle }}</h2>
              </div>
              <span v-if="selectedPostMediaCount" class="service-pill">{{ selectedPostMediaCount }} 个素材</span>
            </div>

            <div class="date-row">
              <label>
                日期
                <input v-model="editDate" type="date">
              </label>
              <label>
                时间
                <input v-model="editTime" type="time">
              </label>
            </div>

            <label class="content-field">
              内容
              <textarea v-model="editText" rows="5" placeholder="修改这一条。" />
            </label>

            <div v-if="selectedPost.images?.length || selectedPost.videos?.length" class="existing-assets">
              <button
                v-for="(image, imageIndex) in selectedPost.images"
                :key="image.src"
                class="asset-thumb"
                type="button"
                @click="openPreview(selectedPost?.images, imageIndex)"
              >
                <img :src="mediaSrc(image.src)" :alt="image.alt || '生活记录图片'">
              </button>
              <template v-for="video in selectedPost.videos" :key="video.src">
                <video :src="mediaSrc(video.src)" muted playsinline controls />
              </template>
            </div>

            <div class="editor-actions">
              <button class="publish-button" type="button" :disabled="isSavingPost" @click="saveSelectedPost">
                {{ isSavingPost ? '保存中...' : '保存修改' }}
              </button>
              <button class="danger-button" type="button" :disabled="isDeletingPost" @click="deleteSelectedPost">
                {{ isDeletingPost ? '删除中...' : '删除记录' }}
              </button>
            </div>

            <p v-if="manageMessage" class="status ok">{{ manageMessage }}</p>
          </template>
          <p v-else class="empty-state">选择一条记录后编辑。</p>
        </section>
      </div>
    </div>

    <Teleport to="body">
      <div
        v-if="currentPreview"
        class="admin-lightbox"
        role="dialog"
        aria-modal="true"
        @click.self="closePreview"
        @touchstart.passive="handlePreviewTouchStart"
        @touchmove.passive="handlePreviewTouchMove"
        @touchend="handlePreviewTouchEnd"
      >
        <button class="lightbox-close" type="button" aria-label="关闭预览" @click="closePreview">×</button>
        <button
          v-if="previewImages.length > 1"
          class="lightbox-nav prev"
          type="button"
          aria-label="上一张"
          @click.stop="showPrevPreview"
        >
          ‹
        </button>
        <img :src="mediaSrc(currentPreview.src)" :alt="currentPreview.alt || '生活记录图片预览'">
        <button
          v-if="previewImages.length > 1"
          class="lightbox-nav next"
          type="button"
          aria-label="下一张"
          @click.stop="showNextPreview"
        >
          ›
        </button>
        <p v-if="previewImages.length > 1" class="lightbox-count">
          {{ previewIndex + 1 }} / {{ previewImages.length }}
        </p>
      </div>
    </Teleport>
  </section>
</template>

<style scoped>
.life-admin {
  --admin-editor-width: min(560px, calc(42vw - 32px));

  width: min(calc(100vw - 48px), 1440px);
  max-width: 100%;
  margin: 0 auto;
  padding: 0 0 80px;
}

.life-admin header {
  display: flex;
  gap: 18px;
  align-items: end;
  justify-content: space-between;
  padding: 8px 0 20px;
  border-bottom: 1px solid var(--vp-c-divider);
}

.life-admin header p,
.preview-label {
  margin: 0 0 8px;
  color: var(--vp-c-brand-1);
  font-size: 0.84rem;
  font-weight: 700;
}

.life-admin h1 {
  margin: 0;
  border: 0;
  color: var(--vp-c-text-1);
  font-size: 2rem;
  line-height: 1.25;
}

.service-pill {
  max-width: min(100%, 360px);
  padding: 7px 12px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 999px;
  color: var(--vp-c-text-3);
  background: var(--vp-c-bg-soft);
  font-size: 0.84rem;
  line-height: 1.4;
}

.header-actions {
  display: flex;
  gap: 10px;
  align-items: center;
  justify-content: flex-end;
}

.ghost-button,
.github-button {
  min-height: 34px;
  padding: 0 14px;
  border-radius: 999px;
  border: 1px solid var(--vp-c-divider);
  color: var(--vp-c-text-1);
  background: var(--vp-c-bg-soft);
  font-weight: 700;
}

.login-shell {
  display: grid;
  place-items: start center;
  padding: 42px 0 80px;
}

.login-card {
  display: grid;
  gap: 16px;
  width: min(100%, 460px);
  padding: 26px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  background: var(--vp-c-bg-soft);
}

.login-card p {
  margin: 0;
  color: var(--vp-c-text-2);
  line-height: 1.7;
}

.login-card label {
  display: grid;
  gap: 8px;
  color: var(--vp-c-text-2);
  font-size: 0.9rem;
  font-weight: 700;
}

.login-card input {
  width: 100%;
  height: 44px;
  padding: 0 12px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  color: var(--vp-c-text-1);
  background: var(--vp-c-bg);
  font: inherit;
}

.console-body {
  display: grid;
  gap: 20px;
  margin-top: 18px;
}

.console-tabs {
  display: inline-flex;
  width: fit-content;
  padding: 4px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 999px;
  background: var(--vp-c-bg-soft);
}

.console-tabs button {
  min-width: 92px;
  min-height: 36px;
  padding: 0 18px;
  border-radius: 999px;
  color: var(--vp-c-text-2);
  font-weight: 700;
}

.console-tabs button.active {
  color: white;
  background: var(--vp-c-brand-1);
}

.admin-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(420px, 540px);
  gap: 28px;
}

.admin-panel,
.editor-panel {
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  background: var(--vp-c-bg-soft);
}

.admin-panel {
  display: grid;
  gap: 18px;
  padding: 22px;
}

.admin-panel label,
.editor-panel label {
  display: grid;
  gap: 8px;
  color: var(--vp-c-text-2);
  font-size: 0.9rem;
  font-weight: 700;
}

.date-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
}

.service-settings {
  margin: -4px 0 2px;
  border-bottom: 1px solid var(--vp-c-divider);
}

.service-settings summary {
  display: flex;
  align-items: center;
  width: fit-content;
  min-height: 34px;
  padding: 0 2px;
  color: var(--vp-c-text-3);
  cursor: pointer;
  font-size: 0.86rem;
  font-weight: 700;
}

.service-settings-body {
  display: grid;
  gap: 12px;
  padding: 8px 0 16px;
}

.auth-row {
  display: flex;
  gap: 12px;
  align-items: center;
  justify-content: space-between;
  min-height: 42px;
  padding: 8px 10px 8px 12px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  color: var(--vp-c-text-2);
  background: var(--vp-c-bg);
  font-size: 0.88rem;
  line-height: 1.5;
}

.auth-row button {
  flex: 0 0 auto;
  min-height: 30px;
  padding: 0 12px;
  border-radius: 999px;
  border: 1px solid var(--vp-c-divider);
  color: var(--vp-c-text-1);
  background: var(--vp-c-bg-soft);
  font-size: 0.82rem;
  font-weight: 700;
}

.admin-panel input,
.admin-panel textarea,
.editor-panel input,
.editor-panel textarea {
  width: 100%;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  color: var(--vp-c-text-1);
  background: var(--vp-c-bg);
  font: inherit;
}

.admin-panel input,
.editor-panel input {
  height: 42px;
  padding: 0 12px;
}

.admin-panel textarea {
  min-height: 180px;
}

.editor-panel textarea {
  min-height: 128px;
}

.admin-panel textarea,
.editor-panel textarea {
  padding: 12px;
  resize: vertical;
  line-height: 1.65;
}

.content-field textarea {
  font-size: 1rem;
}

.file-picker {
  min-height: 76px;
  place-items: center;
  border: 1px dashed var(--vp-c-divider);
  border-radius: 8px;
  cursor: pointer;
}

.file-picker input {
  display: none;
}

.asset-list,
.real-preview-shell :deep(.life-images.grid) {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 8px;
}

.asset-list article {
  position: relative;
  overflow: hidden;
  border-radius: 8px;
  border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg);
}

.asset-list img,
.asset-list video {
  display: block;
  width: 100%;
  aspect-ratio: 1 / 1;
  object-fit: cover;
}

.asset-list button {
  position: absolute;
  top: 6px;
  right: 6px;
  min-height: 28px;
  padding: 0 9px;
  border-radius: 999px;
  color: white;
  background: rgba(0, 0, 0, 0.62);
  font-size: 0.76rem;
}

.publish-button {
  align-self: end;
  min-height: 44px;
  min-width: 104px;
  border-radius: 999px;
  color: white;
  background: var(--vp-c-brand-1);
  font-weight: 700;
}

.publish-row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 14px;
  align-items: end;
  padding-top: 4px;
}

.publish-note {
  align-self: center;
  color: var(--vp-c-text-3);
  font-size: 0.86rem;
  line-height: 1.6;
}

.publish-button:disabled {
  cursor: not-allowed;
  opacity: 0.48;
}

.status {
  margin: 0;
  font-size: 0.92rem;
  line-height: 1.6;
}

.status.ok {
  color: var(--vp-c-brand-1);
}

.status.error {
  color: var(--vp-c-danger-1);
}

.manage-status {
  margin-top: 12px;
  color: var(--vp-c-text-3);
}

.preview-panel {
  min-width: 0;
}

.real-preview-shell {
  min-height: 320px;
  max-height: 720px;
  overflow: auto;
  padding: 18px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  background: var(--vp-c-bg-soft);
}

.real-preview-shell :deep(.life-feed) {
  max-width: none;
  padding: 0;
}

.real-preview-shell :deep(.life-stream) {
  gap: 0;
  margin-top: 0;
}

.real-preview-shell :deep(.life-month) {
  grid-template-columns: 72px minmax(0, 1fr);
  column-gap: 16px;
}

.real-preview-shell :deep(.life-month-posts) {
  padding-left: 22px;
}

.real-preview-shell :deep(.life-post) {
  padding-top: 8px;
  padding-bottom: 8px;
  border-bottom: 0;
}

.real-preview-shell :deep(.life-post::before) {
  top: 24px;
  left: -27px;
}

.real-preview-shell :deep(.life-text p) {
  font-size: 1rem;
}

.real-preview-shell :deep(.life-images.one img) {
  max-height: 360px;
}

.manage-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) var(--admin-editor-width);
  gap: 32px;
  align-items: start;
}

.post-stream-panel {
  min-width: 0;
}

.editor-panel {
  min-width: 0;
  padding: 20px;
}

.panel-head {
  display: flex;
  gap: 14px;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.panel-head h2 {
  margin: 0;
  border: 0;
  color: var(--vp-c-text-1);
  font-size: 1.18rem;
  line-height: 1.35;
}

.panel-head span {
  display: block;
  margin-top: 4px;
  color: var(--vp-c-text-3);
  font-size: 0.82rem;
  font-weight: 700;
}

.manage-feed-shell {
  min-width: 0;
}

.manage-feed-shell :deep(.life-feed) {
  max-width: none;
  padding: 0;
}

.manage-feed-shell :deep(.life-head) {
  display: none;
}

.manage-feed-shell :deep(.life-stream) {
  gap: 0;
  margin-top: 0;
}

.manage-feed-shell :deep(.life-post.selected) {
  padding-left: 12px;
  border-radius: 8px;
}

.manage-feed-shell :deep(.life-post.selected::before) {
  box-shadow:
    0 0 0 4px var(--vp-c-bg),
    0 0 0 8px color-mix(in srgb, var(--vp-c-brand-1) 14%, transparent);
}

.editor-panel {
  display: flex;
  flex-direction: column;
  gap: 16px;
  position: fixed;
  top: calc(var(--vp-nav-height, 64px) + 16px);
  right: max(24px, calc((100vw - 1440px) / 2 + 24px));
  z-index: 20;
  width: var(--admin-editor-width);
  height: calc(100vh - var(--vp-nav-height, 64px) - 32px);
  max-height: calc(100vh - var(--vp-nav-height, 64px) - 32px);
  overflow-y: auto;
  overscroll-behavior: contain;
}

.manage-grid .editor-panel .content-field {
  flex: 1 1 auto;
  min-height: 0;
}

.manage-grid .editor-panel .content-field textarea {
  flex: 1 1 auto;
  min-height: clamp(160px, 32vh, 360px);
  max-height: none;
}

.existing-assets {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 8px;
  margin-top: 4px;
}

.asset-thumb {
  display: block;
  overflow: hidden;
  width: 100%;
  padding: 0;
  border: 0;
  border-radius: 8px;
  background: transparent;
  cursor: zoom-in;
}

.existing-assets img,
.existing-assets video {
  display: block;
  width: 100%;
  aspect-ratio: 1 / 1;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  object-fit: cover;
  background: var(--vp-c-bg);
}

.asset-thumb:focus-visible {
  outline: 2px solid var(--vp-c-brand-1);
  outline-offset: 2px;
}

.editor-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: center;
  justify-content: flex-end;
}

.danger-button {
  min-height: 44px;
  min-width: 104px;
  padding: 0 16px;
  border: 1px solid color-mix(in srgb, var(--vp-c-danger-1) 55%, var(--vp-c-divider));
  border-radius: 999px;
  color: var(--vp-c-danger-1);
  background: transparent;
  font-weight: 700;
}

.danger-button:disabled {
  cursor: not-allowed;
  opacity: 0.48;
}

.empty-state {
  margin: 0;
  color: var(--vp-c-text-3);
  line-height: 1.7;
}

:global(.admin-lightbox) {
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: grid;
  place-items: center;
  padding: 48px 72px;
  background: rgba(0, 0, 0, 0.88);
}

:global(.admin-lightbox img) {
  display: block;
  max-width: min(92vw, 1100px);
  max-height: 82vh;
  border-radius: 8px;
  object-fit: contain;
  box-shadow: 0 24px 80px rgba(0, 0, 0, 0.45);
}

:global(.lightbox-close),
:global(.lightbox-nav) {
  position: fixed;
  display: grid;
  place-items: center;
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 999px;
  color: rgba(255, 255, 255, 0.86);
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(10px);
}

:global(.lightbox-close) {
  top: 24px;
  right: 24px;
  width: 44px;
  height: 44px;
  font-size: 1.8rem;
  line-height: 1;
}

:global(.lightbox-nav) {
  top: 50%;
  width: 52px;
  height: 52px;
  transform: translateY(-50%);
  font-size: 2.2rem;
  line-height: 1;
}

:global(.lightbox-nav.prev) {
  left: 28px;
}

:global(.lightbox-nav.next) {
  right: 28px;
}

:global(.lightbox-count) {
  position: fixed;
  left: 50%;
  bottom: 24px;
  margin: 0;
  transform: translateX(-50%);
  color: rgba(255, 255, 255, 0.72);
  font-size: 0.92rem;
  font-weight: 700;
}

@media (max-width: 1220px) {
  .life-admin {
    --admin-editor-width: min(440px, calc(42vw - 24px));

    width: min(calc(100vw - 40px), 1100px);
  }

  .admin-grid {
    grid-template-columns: minmax(0, 1fr) minmax(360px, 480px);
  }

  .manage-grid {
    grid-template-columns: minmax(0, 1fr) var(--admin-editor-width);
    gap: 22px;
  }

  .editor-panel {
    right: max(20px, calc((100vw - 1100px) / 2 + 20px));
  }
}

@media (max-width: 860px) {
  .life-admin header {
    display: grid;
    align-items: start;
  }

  .header-actions {
    justify-content: flex-start;
  }

  .admin-grid {
    grid-template-columns: 1fr;
  }

  .manage-grid {
    grid-template-columns: 1fr;
  }

  .editor-panel {
    position: static;
    width: auto;
    max-height: none;
    overflow: visible;
  }
}

@media (max-width: 560px) {
  .life-admin {
    width: min(calc(100vw - 28px), 100%);
  }

  .date-row,
  .publish-row,
  .asset-list {
    grid-template-columns: 1fr;
  }

  .publish-button {
    width: 100%;
  }

  .console-tabs {
    width: 100%;
  }

  .console-tabs button {
    flex: 1;
    min-width: 0;
  }

  .existing-assets {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .real-preview-shell {
    padding: 12px;
  }

  .real-preview-shell :deep(.life-month) {
    grid-template-columns: 1fr;
  }

  .real-preview-shell :deep(.life-month-label) {
    text-align: left;
  }

  .real-preview-shell :deep(.life-month-posts) {
    padding-left: 0;
    border-left: 0;
  }

  .real-preview-shell :deep(.life-post::before) {
    display: none;
  }

  .manage-feed-shell :deep(.life-month) {
    grid-template-columns: 1fr;
  }

  .manage-feed-shell :deep(.life-month-label) {
    text-align: left;
  }

  .manage-feed-shell :deep(.life-month-posts) {
    padding-left: 0;
    border-left: 0;
  }

  .manage-feed-shell :deep(.life-post::before) {
    display: none;
  }

  .editor-actions {
    display: grid;
  }

  .danger-button {
    width: 100%;
  }

  :global(.admin-lightbox) {
    padding: 56px 18px;
  }

  :global(.admin-lightbox img) {
    max-width: 100%;
    max-height: 78vh;
  }

  :global(.lightbox-nav) {
    width: 44px;
    height: 44px;
    font-size: 1.9rem;
  }

  :global(.lightbox-nav.prev) {
    left: 12px;
  }

  :global(.lightbox-nav.next) {
    right: 12px;
  }
}
</style>
