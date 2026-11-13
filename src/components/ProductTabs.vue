<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  description: { type: String, default: '' },
  reviews: { type: Array, default: () => [] },
})

const activeTab = ref('description')

const tabs = computed(() => [
  { id: 'description', label: 'Description' },
  { id: 'reviews', label: `Reviews (${props.reviews.length})` },
])

function stars(rating) {
  const filled = Math.min(5, Math.max(0, Math.round(Number(rating) || 0)))
  return '★'.repeat(filled) + '☆'.repeat(5 - filled)
}

function formatDate(value) {
  if (!value) return ''
  return new Date(value).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}
</script>

<template>
  <div class="detail-tabs">
    <div class="detail-tabs__list" role="tablist" aria-label="Product details">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        type="button"
        role="tab"
        class="detail-tabs__tab"
        :class="{ 'detail-tabs__tab--active': activeTab === tab.id }"
        :aria-selected="activeTab === tab.id"
        :id="`tab-${tab.id}`"
        :aria-controls="`panel-${tab.id}`"
        @click="activeTab = tab.id"
      >
        {{ tab.label }}
      </button>
    </div>

    <div
      v-show="activeTab === 'description'"
      id="panel-description"
      class="detail-tabs__panel"
      role="tabpanel"
      aria-labelledby="tab-description"
    >
      <p v-if="description" class="detail-tabs__text">{{ description }}</p>
      <p v-else class="detail-tabs__empty">No description available.</p>
    </div>

    <div
      v-show="activeTab === 'reviews'"
      id="panel-reviews"
      class="detail-tabs__panel"
      role="tabpanel"
      aria-labelledby="tab-reviews"
    >
      <ul v-if="reviews.length" class="detail-reviews">
        <li v-for="(review, index) in reviews" :key="index" class="detail-reviews__item">
          <div class="detail-reviews__meta">
            <span class="detail-reviews__stars" aria-hidden="true">{{
              stars(review.rating)
            }}</span>
            <strong class="detail-reviews__name">{{ review.reviewerName }}</strong>
            <time class="detail-reviews__date" :datetime="review.date">{{
              formatDate(review.date)
            }}</time>
          </div>
          <p class="detail-reviews__comment">{{ review.comment }}</p>
        </li>
      </ul>
      <p v-else class="detail-tabs__empty">No reviews yet.</p>
    </div>
  </div>
</template>
