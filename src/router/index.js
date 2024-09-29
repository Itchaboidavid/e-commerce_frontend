import AppLayout from '@/layout/AppLayout.vue';
import { useAuthStore } from '@/stores/auth';
import { createRouter, createWebHistory } from 'vue-router';


const router = createRouter({
    history: createWebHistory(),
    routes: [
        {
            path: '/',
            component: AppLayout,
            children: [
                {
                    path: '/',
                    name: 'dashboard',
                    component: () => import('@/views/Dashboard.vue'),
                    meta: {auth: true}
                },
                {
                    path: '/products',
                    name: 'products',
                    component: () => import('@/views/pages/Products.vue'),
                    meta: {auth: true}
                },
                {
                    path: '/categories',
                    name: 'categories',
                    component: () => import('@/views/pages/Categories.vue'),
                    meta: {auth: true}
                },
                {
                    path: '/products/list',
                    name: 'productList',
                    component: () => import('@/views/pages/ProductList.vue'),
                    meta: {auth: true}
                }
            ]
        },
        {
            path: '/landing',
            name: 'landing',
            component: () => import('@/views/pages/Landing.vue'),
            meta: {guest: true}
        },
        {
            path: '/pages/notfound',
            name: 'notfound',
            component: () => import('@/views/pages/NotFound.vue'),
            meta: {guest: true}
        },
        {
            path: '/auth/login',
            name: 'login',
            component: () => import('@/views/pages/auth/Login.vue'),
            meta: {guest: true}
        },
        {
            path: '/auth/register',
            name: 'register',
            component: () => import('@/views/pages/auth/Register.vue'),
            meta: {guest: true}
        },
        {
            path: '/auth/access',
            name: 'accessDenied',
            component: () => import('@/views/pages/auth/Access.vue'),
        },
        {
            path: '/auth/error',
            name: 'error',
            component: () => import('@/views/pages/auth/Error.vue'),
            meta: {guest: true}
        }
    ]
});

router.beforeEach(async (to, from) => {
    const authStore = useAuthStore();
    await authStore.getUser();

    if(authStore.user && to.meta.guest) {
        return {name: 'dashboard'}
    }

    if(!authStore.user && to.meta.auth) {
        return {name: 'landing'}
    }
})

export default router;
