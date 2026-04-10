<script setup lang="ts"></script>

<template>
  <v-app-bar color="background">
    <template v-slot:prepend>
      <v-app-bar-nav-icon :ripple="false" style="cursor: default; pointer-events: none">
        <v-icon icon="custom:vms" size="36" />
      </v-app-bar-nav-icon>
    </template>
    <v-app-bar-title class="font-condensed">Visual Mainframe Society</v-app-bar-title>
    <template v-slot:append>
      <v-btn icon="mdi-magnify" />
      <v-btn icon="mdi-bell-outline" />
      <v-btn icon="mdi-shopping-outline" />
    </template>
  </v-app-bar>
</template>
