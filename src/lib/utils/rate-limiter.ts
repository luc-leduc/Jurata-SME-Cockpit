export class RateLimiter {
  private queue: Array<() => Promise<void>> = [];
  private processing = false;
  private lastProcessed = 0;
  private interval: number;

  constructor(requestsPerSecond: number = 1) {
    this.interval = 1000 / requestsPerSecond; // Interval in milliseconds
  }

  async add<T>(task: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.queue.push(async () => {
        try {
          const result = await task();
          resolve(result);
        } catch (error) {
          reject(error);
        }
      });

      if (!this.processing) {
        this.processQueue();
      }
    });
  }

  private async processQueue() {
    if (this.queue.length === 0) {
      this.processing = false;
      return;
    }

    this.processing = true;

    const now = Date.now();
    const timeToWait = Math.max(0, this.interval - (now - this.lastProcessed));

    await new Promise(resolve => setTimeout(resolve, timeToWait));

    const task = this.queue.shift();
    if (task) {
      this.lastProcessed = Date.now();
      await task();
    }

    // Process next item in queue
    this.processQueue();
  }
}