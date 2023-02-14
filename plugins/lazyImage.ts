export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.directive('lazy', {
    beforeMount (el) {
      if (el.tagName?.toLowerCase() === 'img') {
        alert('OKEEEI')
      }
    }
  })
})
