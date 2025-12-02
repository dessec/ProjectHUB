export const storage = {
  get: async (key: string): Promise<any> => {
    try {
      const value = localStorage.getItem(key);
      return Promise.resolve(value ? JSON.parse(value) : null);
    } catch (e) {
      console.error('Storage Get Error:', e);
      return Promise.resolve(null);
    }
  },
  set: async (key: string, value: any): Promise<void> => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return Promise.resolve();
    } catch (e) {
      console.error('Storage Set Error:', e);
      return Promise.resolve();
    }
  }
};