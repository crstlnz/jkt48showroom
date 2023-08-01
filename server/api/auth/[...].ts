import CredentialsProvider from 'next-auth/providers/credentials'
import { NuxtAuthHandler } from '#auth'
import { parseCookieString } from '~~/library/utils'
import { logout } from '~~/library/api/showroom'
import { getSession } from '~~/library/showroom/session'

const scopes = ['identify'].join(' ')
export default NuxtAuthHandler({
  secret: process.env.AUTH_SECRET,
  pages: {
    // Change the default behavior to use `/login` as the path for the sign-in page
    signIn: '/login',
    signOut: '/logout',
  },
  providers: [
    // @ts-expect-error You need to use .default here for it to work during SSR. May be fixed via Vite at some point
    // DiscordProvider.default({
    //   clientId: process.env.DISCORD_CLIENT_ID!,
    //   clientSecret: process.env.DISCORD_CLIENT_SECRET!,
    //   authorization: { params: { scope: scopes } },
    //   profile: (profile: DiscordProfile) => {
    //     if (profile.avatar === null) {
    //       const defaultAvatarNumber = Number.parseInt(profile.discriminator) % 5
    //       profile.image_url = `https://cdn.discordapp.com/embed/avatars/${defaultAvatarNumber}.png`
    //     }
    //     else {
    //       const format = profile.avatar.startsWith('a_') ? 'gif' : 'png'
    //       profile.image_url = `https://cdn.discordapp.com/avatars/${profile.id}/${profile.avatar}.${format}`
    //     }

    //     return {
    //       id: profile.id,
    //       name: profile.global_name,
    //       email: profile.email,
    //       image: profile.image_url,
    //       username: profile.username,
    //       discriminator: profile.discriminator,
    //     }
    //   },
    // }),
    CredentialsProvider.default({
      name: 'Credentials',
      // credentials: {
      //   username: { label: 'Username', type: 'text', placeholder: '(hint: jsmith)' },
      //   password: { label: 'Password', type: 'password', placeholder: '(hint: hunter2)' },
      // },
      async authorize(credentials: any) {
        const body = new URLSearchParams()
        body.append('csrf_token', credentials.sr_csrf || '')
        body.append('account_id', credentials.username)
        body.append('password', credentials.password)
        if (credentials?.captcha_word) body.append('captcha_word', credentials.captcha_word)
        let cookie_id = null
        const data = await $fetch<ShowroomLogin.Data | ShowroomLogin.Error>('https://www.showroom-live.com/user/login', {
          method: 'POST',
          headers: {
            'Cookie': credentials?.cookie || '',
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: body.toString(),
          async onResponse({ response }) {
            const cookies = parseCookieString(response.headers.get('Set-Cookie') || '')
            cookie_id = cookies.sr_id?.value
          },
        })

        if ((data as any).error) throw new Error(JSON.stringify(data))
        if (!cookie_id) throw new Error('Token not provided!')
        if ((data as ShowroomLogin.Data)?.ok === 1) {
          const userData = data as ShowroomLogin.Data
          const userProfile = await $fetch<ShowroomAPI.UserProfile>('https://www.showroom-live.com/api/user/profile', { params: { user_id: userData.user_id } })
          return { id: userData.user_id, name: userProfile.name, account_id: userData.account_id || userProfile.account_id, image: userProfile.image, avatar_id: userProfile.avatar_id, cookie_id }
        }
        throw new Error(JSON.stringify(data))
      },
    }),
  ],
  callbacks: {
    jwt: ({ token, user }) => {
      const isSignIn = !!user
      if (isSignIn) {
        token.jwt = user ? ((user as any).access_token || '') : ''
        token.id = user ? (user.id || '') : ''
        token.role = user ? (useAppConfig().isAdmin(user.id) ? 'admin' : 'user') : 'user'
        token.name = user ? ((user as any).name || '') : ''
        token.img = user ? ((user as any).image || '') : ''
        token.account_id = user ? ((user as any).account_id || '') : ''
        token.cookie_id = user ? ((user as any).cookie_id || '') : ''
      }
      return Promise.resolve(token)
    },
    session: ({ session, token }) => {
      (session as any).role = useAppConfig().isAdmin(token.id as string) ? 'admin' : 'user';
      (session as any).id = token.id;
      (session as any).account_id = token.account_id as any
      (session as any).error = token.cookie_id == null
      return Promise.resolve(session)
    },
  },
  events: {
    signOut: async ({ session, token }) => {
      const sess = await getSession(`sr_id=${token.cookie_id};`)
      const body = new URLSearchParams()
      body.append('csrf_token', sess.csrf_token || '')
      await logout({
        headers: {
          'Cookie': `sr_id=${token.cookie_id};`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: body.toString(),
      })
    },
  },
})
