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
      component: () => import('./views/ExploreView.vue'),
      meta: {
        keepalive: true
      }
    },
    {
      path: '/settings',
      name: 'settings',
      component: () => import('./views/SettingsView.vue')
    },
    {
      path: '/messages',
      name: 'messages',
      component: () => import('./views/MessagesView.vue')
    },
    {
      path: '/bookmarks',
      name: 'bookmarks',
      component: () => import('./views/BookmarksView.vue')
    },
    {
      path: '/admin',
      name: 'admin',
      component: () => import('./views/AdminView.vue')
    },
    {
      path: '/friends',
      name: 'friends',
      component: () => import('./views/FriendLinksView.vue')
    }, {
      path: '/:user/status/:id',
      name: 'status',
      component: () => import('./views/StatusView.vue')
    }, {
      path: '/:user/status/:id/image/:num',
      name: 'imagestatus',
      component: () => import('./views/StatusImageView.vue')
    },
    {
      path: '/logout',
      name: 'logout',
      component: () => import('./views/LogoutView.vue')
    },
    {
      path: '/search/labels/:label',
      name: 'searchlabel',
      component: () => import('./views/SearchView.vue')
    }, {
      path: '/termsofservice',
      name: 'termsofservice',
      component: () => import('./views/TermsOfServiceView.vue')
    }, {
      path: '/privacypolicy',
      name: 'privacypolicy',
      component: () => import('./views/PrivacyPolicyView.vue')
    },
    {
      path: '/authorize/:provider',
      name: 'authorize',
      component: () => import('./views/AuthorizeView.vue')
    },
    {
      path: '/:uniqueName',
      name: 'profile',
      component: () => import('./views/ProfileView.vue')
    }
  ],
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return { top: 0, behavior: 'smooth' }
    }
  }
})

export default router
