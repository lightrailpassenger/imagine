<script setup>
import { ref, onMounted, onUpdated } from "vue";
import { RouterLink } from "vue-router";

import HomeButton from "./HomeButton.vue";

const shouldShowButton = ref(false);
const loginButton = ref(null);
const signupButton = ref(null);
const buttonStyle = ref({});

onMounted(() => {
    setTimeout(() => {
        shouldShowButton.value = true;
    }, 2000);
});
onUpdated(() => {
    if (shouldShowButton) {
        const { width: loginButtonWidth } =
            loginButton.value.button.getBoundingClientRect();
        const { width: signupButtonWidth } =
            signupButton.value.button.getBoundingClientRect();
        buttonStyle.value.width = `${Math.max(
            loginButtonWidth,
            signupButtonWidth
        )}px`;
    }
});
</script>

<template>
    <div class="home">
        <div class="introduction">
            <div class="centered">
                <h1 class="title">Imagine</h1>
                <h2 class="description">
                    Upload image that can only be shared once
                </h2>
            </div>
        </div>
        <div class="button-container">
            <RouterLink v-if="shouldShowButton" to="/login">
                <HomeButton
                    ref="loginButton"
                    class="button"
                    :style="buttonStyle"
                >
                    Log In
                </HomeButton>
            </RouterLink>
            <RouterLink v-if="shouldShowButton" to="/signup">
                <HomeButton
                    ref="signupButton"
                    class="button"
                    :style="buttonStyle"
                >
                    Sign Up
                </HomeButton>
            </RouterLink>
        </div>
    </div>
</template>

<style scoped>
.home {
    height: 100vh;
    display: flex;
    flex-direction: column;
}

.introduction {
    flex: 1 1 0;
    display: flex;
    flex-direction: column;
    text-align: center;
    justify-content: center;
}

.centered {
    flex: 0 0 auto;
    justify-content: center;
    align-items: center;
}

.title {
    font-size: 50px;
    margin-bottom: 10px;
}

.description {
    font-size: 30px;
}

.button-container {
    flex: 0 0 auto;
    text-align: center;
    min-height: 60px;
    padding-bottom: 20px;
}

.button {
    margin: 10px;
}
</style>
