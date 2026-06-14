<template>
  <v-dialog
    v-model="isOpen"
    max-width="600"
    persistent
    scrollable
  >
    <v-card rounded="xl" class="pa-2 pb-4" theme="dark">
      <v-card-title class="d-flex justify-space-between align-center px-4 pt-4 pb-2">
        <span class="text-h5 font-weight-bold">
          <v-icon icon="mdi-rocket-launch" color="primary" class="me-2" />
          Add Custom Rocket
        </span>
        <v-btn
          icon="mdi-close"
          variant="text"
          density="comfortable"
          @click="closeDialog"
        />
      </v-card-title>

      <v-divider opacity="0.1" />

      <v-card-text class="px-4 py-4">
        <v-form ref="formRef" v-model="isFormValid" @submit.prevent="submitForm">
          <v-row dense>
            <v-col cols="12">
              <v-text-field
                v-model="form.name"
                label="Rocket Name*"
                variant="outlined"
                density="comfortable"
                rounded="lg"
                color="primary"
                :rules="[rules.required]"
              />
            </v-col>

            <v-col cols="12" sm="6">
              <v-text-field
                v-model="form.country"
                label="Country*"
                variant="outlined"
                density="comfortable"
                rounded="lg"
                color="primary"
                :rules="[rules.required]"
              />
            </v-col>

            <v-col cols="12" sm="6">
              <v-text-field
                v-model="form.first_flight"
                label="First Flight (YYYY-MM-DD)*"
                placeholder="2026-06-14"
                variant="outlined"
                density="comfortable"
                rounded="lg"
                color="primary"
                :rules="[rules.required, rules.date]"
              />
            </v-col>

            <v-col cols="12" sm="6">
              <v-text-field
                v-model.number="form.cost_per_launch"
                label="Cost per Launch ($)*"
                type="number"
                prefix="$"
                variant="outlined"
                density="comfortable"
                rounded="lg"
                color="primary"
                :rules="[rules.required, rules.positiveNumber]"
              />
            </v-col>

            <v-col cols="12" sm="6" class="d-flex align-center justify-start ps-3">
              <v-switch
                v-model="form.active"
                label="Active Status"
                color="success"
                inset
                density="comfortable"
                hide-details
              />
            </v-col>

            <v-col cols="12">
              <v-text-field
                v-model="form.imageUrl"
                label="Image URL (Optional)"
                placeholder="https://example.com/rocket.jpg"
                variant="outlined"
                density="comfortable"
                rounded="lg"
                color="primary"
                prepend-inner-icon="mdi-image-outline"
                :rules="[rules.url]"
              />
            </v-col>

            <v-col cols="12">
              <v-textarea
                v-model="form.description"
                label="Description*"
                variant="outlined"
                density="comfortable"
                rounded="lg"
                color="primary"
                rows="3"
                auto-grow
                :rules="[rules.required]"
              />
            </v-col>
          </v-row>
        </v-form>
      </v-card-text>

      <v-card-actions class="px-6 pt-2">
        <v-spacer />
        <v-btn
          variant="text"
          class="text-none px-4"
          rounded="lg"
          :disabled="isSubmitting"
          @click="closeDialog"
        >
          Cancel
        </v-btn>
        <v-btn
          color="primary"
          variant="flat"
          class="text-none px-6 font-weight-bold"
          rounded="lg"
          :loading="isSubmitting"
          :disabled="!isFormValid || isSubmitting"
          @click="submitForm"
        >
          Create Rocket
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRockets } from '@/composables/useRockets'

const props = defineProps<{
  modelValue: boolean
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
}>()

const { addRocket } = useRockets()

const isOpen = ref(false)
const isFormValid = ref(false)
const isSubmitting = ref(false)
const formRef = ref<any>(null)

watch(() => props.modelValue, (newVal) => {
  isOpen.value = newVal
})

watch(isOpen, (newVal) => {
  emit('update:modelValue', newVal)
  if (!newVal) {
    resetForm()
  }
})

const defaultForm = {
  name: '',
  description: '',
  country: '',
  first_flight: '',
  cost_per_launch: 0,
  active: true,
  imageUrl: ''
}

const form = ref({ ...defaultForm })

// Form validation rules
const rules = {
  required: (value: any) => !!value || 'This field is required.',
  positiveNumber: (value: any) => (value !== null && value > 0) || 'Must be a number greater than 0.',
  date: (value: string) => {
    const pattern = /^\d{4}-\d{2}-\d{2}$/
    return pattern.test(value) || 'Date must be in YYYY-MM-DD format.'
  },
  url: (value: string) => {
    if (!value) return true
    try {
      new URL(value)
      return true
    } catch (_) {
      return 'Must be a valid URL.'
    }
  }
}

const closeDialog = () => {
  isOpen.value = false
}

const resetForm = () => {
  form.value = { ...defaultForm }
  if (formRef.value) {
    formRef.value.resetValidation()
  }
}

const submitForm = async () => {
  if (formRef.value) {
    const { valid } = await formRef.value.validate()
    if (valid) {
      isSubmitting.value = true
      try {
        await addRocket({
          name: form.value.name,
          description: form.value.description,
          country: form.value.country,
          first_flight: form.value.first_flight,
          cost_per_launch: form.value.cost_per_launch,
          active: form.value.active,
          flickr_images: form.value.imageUrl ? [form.value.imageUrl] : []
        })
        closeDialog()
      } catch (err) {
        console.error('Failed to save rocket:', err)
      } finally {
        isSubmitting.value = false
      }
    }
  }
}
</script>
