interface CachedSession {
  user: any;
  profile: any;
  expiresAt: number;
}

class SessionCache {
  private cache = new Map<string, CachedSession>();
  private readonly TTL = 5 * 60 * 1000; // 5 minutes

  set(userId: string, user: any, profile: any) {
    this.cache.set(userId, {
      user,
      profile,
      expiresAt: Date.now() + this.TTL
    });
  }

  get(userId: string): { user: any; profile: any } | null {
    const cached = this.cache.get(userId);
    if (!cached || Date.now() > cached.expiresAt) {
      this.cache.delete(userId);
      return null;
    }
    return { user: cached.user, profile: cached.profile };
  }

  invalidate(userId: string) {
    this.cache.delete(userId);
  }

  clear() {
    this.cache.clear();
  }
}

export const sessionCache = new SessionCache();

