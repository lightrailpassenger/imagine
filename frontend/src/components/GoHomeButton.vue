<script setup>
import { RouterLink } from "vue-router";
</script>

<template>
    <RouterLink to="/">
        <a href="/">
            {{ "<" }}
        </a>
    </RouterLink>
</template>

<style scoped>
a,
a:hover,
a:visited,
a:active,
a:link {
    background: transparent;
    border: none;
    text-decoration: none;
    color: black;
    font-size: 30px;
    padding: 2px;
}
</style>
