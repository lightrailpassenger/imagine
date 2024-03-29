import { createRouter, createWebHistory } from "vue-router";
import HomeView from "../views/HomeView.vue";

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: "/",
            name: "home",
            component: HomeView,
        },
        {
            path: "/login",
            name: "login",
            component: () => import("../views/LoginView.vue"),
        },
        {
            path: "/signup",
            name: "signup",
            component: () => import("../views/SignupView.vue"),
        },
        {
            path: "/list",
            name: "image-list",
            component: () => import("../views/ImageListView.vue"),
        },
        {
            path: "/upload",
            name: "upload-page",
            component: () => import("../views/UploadView.vue"),
        },
        {
            path: "/view/:imageId",
            name: "image-view",
            component: () => import("../views/ImageView.vue"),
        },
        {
            path: "/guest",
            name: "guest-view",
            component: () => import("../views/GuestView.vue"),
        },
        {
            path: "/guest/:token",
            name: "guest-view-entrypoint",
            redirect: (to) => ({
                name: "guest-view",
                state: {
                    token: to.params.token,
                },
            }),
        },
        // route level code-splitting
        // this generates a separate chunk (About.[hash].js) for this route
        // which is lazy-loaded when the route is visited.
    ],
});

export default router;
