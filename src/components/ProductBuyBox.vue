<script setup>
import VariantPicker from './VariantPicker.vue'

defineProps({
  product: { type: Object, required: true },
  displayPrice: { type: Number, required: true },
  originalPrice: { type: Number, required: true },
  hasDiscount: { type: Boolean, default: false },
  filledStars: { type: String, default: '☆☆☆☆☆' },
  stockLeft: { type: Number, default: 0 },
  hasVariants: { type: Boolean, default: false },
  optionKeys: { type: Array, default: () => [] },
  selectedOptions: { type: Object, default: () => ({}) },
  optionValues: { type: Function, required: true },
  selectedVariant: { type: Object, default: null },
  qty: { type: Number, default: 1 },
  canAdd: { type: Boolean, default: false },
})

defineEmits(['select', 'decrease-qty', 'increase-qty', 'add-to-cart', 'buy-now'])
</script>

<template>
  <div class="detail__info">
    <p v-if="product.brand" class="detail__brand">{{ product.brand }}</p>
    <h1 class="detail__title">{{ product.title }}</h1>
    <span v-if="product.category" class="detail__category">{{ product.category }}</span>

    <div class="detail__meta">
      <span class="detail__stars" aria-hidden="true">{{ filledStars }}</span>
      <span>({{ product.rating }})</span>
    </div>

    <div class="detail__price-row">
      <span class="detail__price">${{ displayPrice.toFixed(2) }}</span>
      <template v-if="hasDiscount">
        <s class="detail__original">${{ originalPrice.toFixed(2) }}</s>
        <span class="detail__discount"
          >{{ Number(product.discountPercentage).toFixed(0) }}% off</span
        >
      </template>
    </div>

    <p v-if="stockLeft > 0" class="detail__stock">In stock · {{ stockLeft }} available</p>
    <p v-else class="detail__stock detail__stock--out">Out of stock</p>

    <div v-if="hasVariants" class="detail__variants">
      <VariantPicker
        :option-keys="optionKeys"
        :selected-options="selectedOptions"
        :option-values="optionValues"
        @select="(key, value) => $emit('select', key, value)"
      />
    </div>

    <p v-if="product.description" class="detail__desc">{{ product.description }}</p>

    <ul
      v-if="product.sku || product.warrantyInformation || product.shippingInformation"
      class="detail__specs"
    >
      <li v-if="selectedVariant?.sku || product.sku">
        <span class="detail__spec-label">SKU</span>
        <span class="detail__spec-value">{{ selectedVariant?.sku || product.sku }}</span>
      </li>
      <li v-if="product.warrantyInformation">
        <span class="detail__spec-label">Warranty</span>
        <span class="detail__spec-value">{{ product.warrantyInformation }}</span>
      </li>
      <li v-if="product.shippingInformation">
        <span class="detail__spec-label">Shipping</span>
        <span class="detail__spec-value">{{ product.shippingInformation }}</span>
      </li>
    </ul>

    <div class="detail__actions">
      <div class="detail__actions-row">
        <div class="detail__qty">
          <button
            type="button"
            class="qty__btn"
            aria-label="Decrease quantity"
            :disabled="qty <= 1"
            @click="$emit('decrease-qty')"
          >
            −
          </button>
          <span class="qty__value">{{ qty }}</span>
          <button
            type="button"
            class="qty__btn"
            aria-label="Increase quantity"
            :disabled="qty >= stockLeft"
            @click="$emit('increase-qty')"
          >
            +
          </button>
        </div>

        <button
          type="button"
          class="btn btn--primary"
          :disabled="!canAdd"
          @click="$emit('buy-now')"
        >
          Buy Now
        </button>
      </div>

      <button
        type="button"
        class="btn btn--secondary detail__add-cart"
        :disabled="!canAdd"
        @click="$emit('add-to-cart')"
      >
        Add to Cart
      </button>
    </div>
  </div>
</template>
