
import { supabase } from "@/integrations/supabase/client";

export interface MpesaPaymentRequest {
  phoneNumber: string;
  amount: number;
  orderId: string;
}

export interface MpesaResponse {
  success: boolean;
  message: string;
  transactionId?: string;
}

export const initiateMpesaPayment = async (data: MpesaPaymentRequest): Promise<MpesaResponse> => {
  try {
    // Call the Supabase Edge Function for M-Pesa STK push
    const response = await fetch(
      "https://yhlxoypsnlraplpifrfg.supabase.co/functions/v1/mpesa-stk-push",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
        },
        body: JSON.stringify(data),
      }
    );

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || "Failed to initiate M-Pesa payment");
    }

    // Record the transaction in the database
    if (result.success) {
      await supabase.from("payment_transactions").insert({
        order_id: data.orderId,
        payment_method_code: "mpesa",
        amount: data.amount,
        currency: "KES",
        status: "pending",
        transaction_reference: result.CheckoutRequestID,
        phone_number: data.phoneNumber,
      });
    }

    return {
      success: result.success,
      message: result.message || "Payment initiated. Please complete on your phone.",
      transactionId: result.CheckoutRequestID,
    };
  } catch (error: any) {
    console.error("M-Pesa payment error:", error);
    return {
      success: false,
      message: error.message || "Failed to process payment",
    };
  }
};

export const checkMpesaTransactionStatus = async (transactionId: string) => {
  try {
    const { data, error } = await supabase
      .from("payment_transactions")
      .select("status, verification_status")
      .eq("transaction_reference", transactionId)
      .single();

    if (error) throw error;

    return {
      success: true,
      status: data?.status,
      verified: data?.verification_status === "verified",
    };
  } catch (error: any) {
    console.error("Error checking M-Pesa status:", error);
    return {
      success: false,
      message: error.message,
    };
  }
};

export const recordCashPayment = async (orderId: string, amount: number) => {
  try {
    const { data, error } = await supabase.from("payment_transactions").insert({
      order_id: orderId,
      payment_method_code: "cash",
      amount: amount,
      currency: "KES",
      status: "pending",
      transaction_reference: `COD-${Date.now()}`,
      verification_status: "pending",
    }).select();

    if (error) throw error;

    return {
      success: true,
      message: "Cash payment recorded. It will be verified upon delivery.",
      transactionId: data[0].transaction_reference,
    };
  } catch (error: any) {
    console.error("Error recording cash payment:", error);
    return {
      success: false,
      message: error.message || "Failed to record payment",
    };
  }
};
