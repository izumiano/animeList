import type MALUserTokenResponse from "../responses/MALUserTokenResponse";

export class MALUserToken {
  accessToken: string;
  refreshToken: string;
  expiresAt: Date;

  private constructor({
    accessToken,
    refreshToken,
    expiresAt,
  }: {
    accessToken: string;
    refreshToken: string;
    expiresAt: Date;
  }) {
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;
    this.expiresAt = expiresAt;
  }

  public static create(data?: MALUserTokenResponse | null) {
    let accessToken;
    let refreshToken;
    let expiresAt;
    if (!data) {
      accessToken = localStorage.getItem("accessToken");
      refreshToken = localStorage.getItem("refreshToken");
      const expiresAtStr = localStorage.getItem("expiresAt");
      expiresAt = expiresAtStr ? new Date(parseInt(expiresAtStr)) : null;
    } else {
      accessToken = data.access_token;
      refreshToken = data.refresh_token;
      expiresAt = data.expires_in
        ? new Date(Date.now() + data.expires_in * 1000)
        : null;
    }

    if (!accessToken || !refreshToken || !expiresAt) {
      return;
    }

    localStorage.setItem("accessToken", accessToken);
    localStorage.setItem("refreshToken", refreshToken);
    localStorage.setItem("expiresAt", String(expiresAt.getTime()));

    return new MALUserToken({
      accessToken: accessToken,
      refreshToken: refreshToken,
      expiresAt: expiresAt,
    });
  }

  public isExpired() {
    return this.expiresAt.getTime() - Date.now() <= 0;
  }
}
