import { parse } from 'node-html-parser'
import APIError from '../api'

const sr_url = 'https://www.showroom-live.com/'
export async function getSession(cookieString: string | null = null) {
  if (cookieString == null) {
    const res = await fetch(sr_url, {
      headers: {
        cookie: cookieString || '',
      },
    })
    if (!res.ok) throw new APIError(res.statusText, res.status)
    const body = await res.text()
    const document = parse(body)
    const csrf_token = document.querySelector('input[name=csrf_token]')?.getAttribute('value')
    const cookie = res.headers.get('set-cookie')
    return {
      csrf_token,
      cookie: cookie || '',
    }
  }
  else {
    let cookies = ''
    const token = await $fetch<{ csrf_token: string }>('https://www.showroom-live.com/api/csrf_token', {
      params: { _: new Date().getTime() },
      headers: {
        cookie: cookieString || '',
      },
      onResponse: ({ response }) => {
        cookies = response.headers.get('set-cookie') || ''
      },
    })
    const csrf_token = token.csrf_token
    return {
      csrf_token,
      cookie: cookies,
    }
  }
}
