
// Centralized authentication storage module
// Defaults to sessionStorage to allow multiple concurrent users in different tabs
// Can be configured to use localStorage if persistence across sessions is required

export const STORAGE_KEYS = {
  ACCESS_TOKEN: "access_token",
  USER_ID: "user_id",
  USER_DATA: "user_data",
  SELECTED_ORG: "selected_org",
  DEBUG_TOKENS: "debug_tokens",
};

type StorageType = "session" | "local";

class AuthStorage {
  private storageType: StorageType = "session";

  constructor() {
    // We can potentially read a config or env var here to determine default storage
  }

  private getStorage(): Storage | null {
    if (typeof window === "undefined") return null;
    return this.storageType === "session" ? sessionStorage : localStorage;
  }

  public setStorageType(type: StorageType) {
    this.storageType = type;
  }

  // Access Token
  public getAuthToken(): string | null {
    const token = this.getStorage()?.getItem(STORAGE_KEYS.ACCESS_TOKEN);
    if (!token || token === "undefined" || token === "null") return null;
    return token;
  }

  public setAuthToken(token: string) {
    this.getStorage()?.setItem(STORAGE_KEYS.ACCESS_TOKEN, token);
  }

  public removeAuthToken() {
    this.getStorage()?.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
  }

  // User ID
  public getUserId(): string | null {
    return this.getStorage()?.getItem(STORAGE_KEYS.USER_ID) || null;
  }

  public setUserId(id: string | number) {
    this.getStorage()?.setItem(STORAGE_KEYS.USER_ID, id.toString());
  }

  public removeUserId() {
    this.getStorage()?.removeItem(STORAGE_KEYS.USER_ID);
  }

  // User Data
  public getUserData(): any | null {
    const data = this.getStorage()?.getItem(STORAGE_KEYS.USER_DATA);
    if (!data) return null;
    try {
      return JSON.parse(data);
    } catch (e) {
      return null;
    }
  }

  public setUserData(data: any) {
    this.getStorage()?.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(data));
  }

  public removeUserData() {
    this.getStorage()?.removeItem(STORAGE_KEYS.USER_DATA);
  }

  // Selected Org
  public getSelectedOrg(): any | null {
    const data = this.getStorage()?.getItem(STORAGE_KEYS.SELECTED_ORG);
    if (!data) return null;
    try {
      return JSON.parse(data);
    } catch (e) {
      return null;
    }
  }

  public setSelectedOrg(org: any) {
    this.getStorage()?.setItem(STORAGE_KEYS.SELECTED_ORG, JSON.stringify(org));
  }

  public removeSelectedOrg() {
    this.getStorage()?.removeItem(STORAGE_KEYS.SELECTED_ORG);
  }

  // Debugging
  public isDebugEnabled(): boolean {
    if (typeof window === "undefined") return false;
    // Debug flag might still be useful in localStorage to persist across tabs/reloads easily
    // or we can check both
    return (
      localStorage.getItem(STORAGE_KEYS.DEBUG_TOKENS) === "true" ||
      sessionStorage.getItem(STORAGE_KEYS.DEBUG_TOKENS) === "true"
    );
  }

  public setDebugEnabled(enabled: boolean) {
    if (typeof window === "undefined") return;
    const value = enabled ? "true" : "false";
    // Set in both for convenience or just localStorage
    localStorage.setItem(STORAGE_KEYS.DEBUG_TOKENS, value);
  }

  // Clear all auth data
  public clearAll() {
    this.removeAuthToken();
    this.removeUserId();
    this.removeUserData();
    this.removeSelectedOrg();

    // Also try to clear from localStorage to be safe during migration/mixed usage
    if (typeof window !== "undefined") {
      localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
      localStorage.removeItem(STORAGE_KEYS.USER_ID);
      localStorage.removeItem(STORAGE_KEYS.USER_DATA);
      localStorage.removeItem(STORAGE_KEYS.SELECTED_ORG);
    }
  }
}

export const authStorage = new AuthStorage();
