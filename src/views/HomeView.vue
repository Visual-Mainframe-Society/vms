<script setup lang="ts"></script>

<template>
  <v-app-bar v-if="$vuetify.display.smAndDown" color="background" class="border-b">
    <template #prepend>
      <v-app-bar-nav-icon :ripple="false" style="cursor: default; pointer-events: none">
        <v-icon icon="custom:vms" />
      </v-app-bar-nav-icon>
    </template>

    <v-text-field
      placeholder="Search"
      prepend-inner-icon="mdi-magnify"
      :class="!$vuetify.display.mobile ? 'mx-16 px-16' : ''"
      density="compact"
      variant="outlined"
      rounded="xl"
      color="info"
      hide-details
      single-line
    />
    <template #append>
      <v-btn icon="mdi-bell-outline" :to="{ name: 'notifications' }" />
    </template>
  </v-app-bar>

  <v-container>this is home</v-container>
</template>
