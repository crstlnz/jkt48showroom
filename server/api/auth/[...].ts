import type { DiscordProfile } from 'next-auth/providers/discord'
import DiscordProvider from 'next-auth/providers/discord'
import { NuxtAuthHandler } from '#auth'

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
    DiscordProvider.default({
      clientId: process.env.DISCORD_CLIENT_ID!,
      clientSecret: process.env.DISCORD_CLIENT_SECRET!,
      authorization: { params: { scope: scopes } },
      profile: (profile: DiscordProfile) => {
        if (profile.avatar === null) {
          const defaultAvatarNumber = Number.parseInt(profile.discriminator) % 5
          profile.image_url = `https://cdn.discordapp.com/embed/avatars/${defaultAvatarNumber}.png`
        }
        else {
          const format = profile.avatar.startsWith('a_') ? 'gif' : 'png'
          profile.image_url = `https://cdn.discordapp.com/avatars/${profile.id}/${profile.avatar}.${format}`
        }

        return {
          id: profile.id,
          name: profile.username,
          email: profile.email,
          image: profile.image_url,
          discriminator: profile.discriminator,
        }
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
        token.discriminator = user ? ((user as any).discriminator || '') : ''
      }
      return Promise.resolve(token)
    },
    session: ({ session, token }) => {
      (session as any).role = token.role;
      (session as any).id = token.id;
      (session as any).role = token.id ? (useAppConfig().isAdmin(token.id as any) ? 'admin' : 'user') : 'user';
      (session as any).discriminator = token.discriminator
      return Promise.resolve(session)
    },
  },
})
