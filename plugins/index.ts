export default defineNuxtPlugin(() => {
  return {
    provide: {
      getNumColor(num: number) {
        if (num <= 100) {
          return 'text-blue-500 dark:text-blue-400'
        }
        else if (num <= 500) {
          return 'text-green-500 dark:text-green-400'
        }
        else if (num <= 1000) {
          return 'text-violet-500 dark:text-violet-400'
        }
        else {
          return 'text-red-500 dark:text-red-400'
        }
      },
    },
  }
})
