export class PaymeTransactionError extends Error {
  constructor(
    public readonly message: any, 
    public readonly code: number,
    public readonly id?: number | string, 
    public readonly data?: any
  ) {
    super(typeof message === "string" ? message : "Payme Error");
  }

  toPaymeResponse() {
    return {
      jsonrpc: "2.0",
      id: this.id || null,
      error: {
        code: this.code,
        message: this.message,
        data: this.data || null,
      },
    };
  }
}
