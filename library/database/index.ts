/* eslint-disable no-restricted-globals */
/* eslint-disable no-var */
/* eslint-disable vars-on-top */
import type { Connection, Mongoose } from 'mongoose'
import mongoose from 'mongoose'
import { database as srDB } from '../../library/database/showroomDB'

declare global {
  var _mongoClientPromise: Promise<Mongoose>
}

class Singleton {
  private static _instance: Singleton
  private client: Mongoose
  private clientPromise: Promise<Mongoose>
  private constructor() {
    this.client = mongoose
    this.clientPromise = mongoose.connect(process.env.MONGODB_URI ?? '')
    if (process.env.NODE_ENV === 'development') {
      // In development mode, use a global variable so that the value
      // is preserved across module reloads caused by HMR (Hot Module Replacement).
      global._mongoClientPromise = this.clientPromise
    }
  }

  public static get instance() {
    if (!this._instance) {
      this._instance = new Singleton()
    }
    return this._instance.clientPromise
  }
}
const clientPromise = Singleton.instance

export async function dbConnect(db: 0 | 1 | 2 = 0) {
  // 0 -> main mongodb
  // 1 -> second mongodb
  // 2 -> all mongodb
  if (db === 0) {
    await clientPromise
  }
  else if (db === 1) {
    await srDB
  }
  else {
    await clientPromise
    await srDB
  }
}

// Export a module-scoped MongoClient promise. By doing this in a
// separate module, the client can be shared across functions.
export default clientPromise
