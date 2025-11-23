/**
 * Mixin Route API Types
 * Based on: https://github.com/MixinNetwork/route-docs/blob/main/mixin_swap_api_cn.md
 */

export interface TokenChain {
  chainId: string;
  symbol: string;
  name: string;
  icon: string;
  decimals: number;
}

export interface TokenView {
  assetId: string;
  name: string;
  symbol: string;
  icon: string;
  chain: TokenChain;
}

export interface QuoteRespView {
  inputMint: string;
  inAmount: string;
  outputMint: string;
  outAmount: string;
  payload: string;
}

export interface SwapRequest {
  payer: string;
  inputMint: string;
  outputMint: string;
  inputAmount: string;
  payload: string;
  referral?: string;
}

export interface SwapTx {
  trace: string;
  payee: string;
  asset: string;
  amount: string;
  memo: string;
  orderId: string;
}

export interface SwapRespView {
  tx: string;
  quote: QuoteRespView;
}

export function decodeSwapTx(txUrl: string): SwapTx {
  try {
    // mixin://mixin.one/pay/${uid}?asset=...&amount=...&memo=...&trace=...
    // 处理 mixin:// 协议, 转换为 http url 进行解析
    const urlStr = txUrl.replace("mixin://", "http://");
    const url = new URL(urlStr);

    const searchParams = url.searchParams;

    // Path: /pay/${uid}
    // pathname 可能是 /mixin.one/pay/${uid} 或者 /pay/${uid}
    const parts = url.pathname.split("/pay/");
    if (parts.length < 2) {
      throw new Error(`Invalid uid in path: ${url.pathname}`);
    }
    const uid = parts[1];

    if (!uid) {
      throw new Error(`Invalid uid in path: ${url.pathname}`);
    }

    const amount = searchParams.get("amount");
    if (!amount) {
      throw new Error("Invalid amount in query");
    }

    const memo = searchParams.get("memo") || "";

    return {
      trace: searchParams.get("trace") || "",
      payee: uid,
      asset: searchParams.get("asset") || "",
      amount: amount,
      memo: memo,
      orderId: memo, // Go implementation uses memo as orderId
    };
  } catch (error) {
    throw new Error(`Failed to decode tx: ${(error as Error).message}`);
  }
}

export interface QuoteRange {
  min: string;
  max: string;
}

export interface RouteErrorResponse {
  error: {
    code: number;
    description: string;
    extra?: {
      range?: QuoteRange;
    };
  };
}

export enum HistoryPriceType {
  ONE_DAY = "1D",
  ONE_WEEK = "1W",
  ONE_MONTH = "1M",
  YTD = "YTD",
  ALL = "ALL",
}

export class MixinRouteAPIError extends Error {
  constructor(
    public statusCode: number,
    public code?: number,
    public description?: string,
    public rawBody?: string,
    public range?: QuoteRange
  ) {
    super(description || rawBody || "Mixin Route API Error");
    this.name = "MixinRouteAPIError";
  }
}

export enum SwapOrderState {
  Created = "created",
  Pending = "pending",
  Success = "success",
  Failed = "failed",
}

export interface SwapOrder {
  order_id: string;
  user_id: string;
  asset_id: string;
  receive_asset_id: string;
  amount: string;
  receive_amount: string;
  payment_trace_id: string;
  receive_trace_id: string;
  state: SwapOrderState;
  created_at: string;
}
