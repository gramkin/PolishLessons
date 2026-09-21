<script setup lang="ts">
defineProps<{ etymology?: string; memory?: string }>()
</script>

<template>
  <section
    v-if="etymology || memory"
    id="proishozhdenie"
    aria-labelledby="proishozhdenie-title"
    class="origin"
  >
    <h2 id="proishozhdenie-title">Происхождение и как запомнить</h2>
    <p v-if="etymology" class="etymology">{{ etymology }}</p>
    <aside v-if="memory" class="callout memory" role="note">
      <strong>Как запомнить.</strong> {{ memory }}
    </aside>
  </section>
</template>

<style scoped>
.memory {
  border-left-color: var(--accent-pl);
}
</style>
