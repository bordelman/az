// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  app: {
    head: {
      link: [{
        rel: 'icon',
        type: 'image/png',
        href: '/logo.png'
      }],
      meta: [
        {name: 'description', content: 'AZ Plzeň'},
        {name: 'author', content: 'pecaj.dev@gmail.com'},
        {property: 'og:description', content: 'AZ Plzeň'},
        {property: 'og:image', content: '/logo.png'},
        {property: 'og:title', content: 'AZ Plzeň'}
      ],
      htmlAttrs: {
        lang: 'cs'
      }
    }
  },
  compatibilityDate: '2024-04-03',
  devtools: {enabled: true},
  ssr: false
});
