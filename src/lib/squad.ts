/**
 * Squad Payment Integration Utility
 * Documentation: https://squadco.com/documentation/
 */

const SQUAD_SECRET_KEY = process.env.SQUAD_SECRET_KEY || "";
const SQUAD_API_URL = process.env.NODE_ENV === "production" 
  ? "https://api-d.squadco.com" // Live
  : "https://sandbox-api-d.squadco.com"; // Sandbox

export interface SquadTransactionInitiate {
  amount: number;
  email: string;
  currency: "NGN" | "USD";
  initiate_type: "inline";
  transaction_ref?: string;
  callback_url?: string;
  metadata?: any;
}

export const squadClient = {
  /**
   * Initiate a transaction
   */
  async initiateTransaction(payload: SquadTransactionInitiate) {
    try {
      const response = await fetch(`${SQUAD_API_URL}/transaction/initiate`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${SQUAD_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to initiate transaction");
      }

      return data;
    } catch (error) {
      console.error("Squad Transaction Error:", error);
      throw error;
    }
  },

  /**
   * Verify a transaction
   */
  async verifyTransaction(transactionRef: string) {
    try {
      const response = await fetch(`${SQUAD_API_URL}/transaction/verify/${transactionRef}`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${SQUAD_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to verify transaction");
      }

      return data;
    } catch (error) {
      console.error("Squad Verification Error:", error);
      throw error;
    }
  }
};
