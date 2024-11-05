const { PrismaClient } = require('@prisma/client')

class PrismaSingleton {
  constructor() {
    if (!PrismaSingleton.instance) {
      this.prisma = new PrismaClient()
      this.isConnected = false

      this.connect()

      PrismaSingleton.instance = this
    }

    return PrismaSingleton.instance
  }

  async connect() {
    if (!this.isConnected) {
      await this.prisma.$connect()
      this.isConnected = true
      console.log('Connected to Postgres')
    }
  }

  async disconnect() {
    if (this.isConnected) {
      await this.prisma.$disconnect()
      this.isConnected = false
      console.log('Disconnected from Prisma')
    }
  }
}

module.exports = PrismaSingleton
