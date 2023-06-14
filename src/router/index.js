import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/explore'
    },
    {
      path: '/explore',
      name: 'explore',
      component: () => import('../views/ExploreView.vue')
    },
    {
      path: '/settings',
      name: 'settings',
      component: () => import('../views/SettingsView.vue')
    },
    {
      path: '/messages',
      name: 'messages',
      component: () => import('../views/MessagesView.vue')
    },
    {
      path: '/bookmarks',
      name: 'bookmarks',
      component: () => import('../views/BookmarksView.vue')
    },
    {
      path: '/authorize/:provider',
      name: 'authorize',
      component: () => import('../views/AuthorizeView.vue')
    },
    {
      path: '/:uniqueName',
      name: 'profile',
      component: () => import('../views/ProfileView.vue')
    }
  ]
})

export default router
