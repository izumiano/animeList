const crypto = globalThis.crypto;

export class MALCryptography {
  public codeChallenge: string | undefined;

  constructor() {
    this.codeChallenge = this.generateCodeChallenge();
  }

  private generateCodeChallenge(size: number = 128) {
    const mask =
      "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-._~";

    let result = "";

    const randomUints = crypto.getRandomValues(new Uint8Array(size));

    for (let i = 0; i < size; i++) {
      const randomIndex = randomUints[i] % mask.length;

      result += mask[randomIndex];
    }

    return result;
  }
}
