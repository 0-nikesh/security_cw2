import axios from "axios";

const initiatePayment = async (req, res) => {
  const { amount, productIdentity, productName } = req.body;

  try {
    const response = await axios.post(
      "https://a.khalti.com/api/v2/epayment/initiate/",
      {
        return_url: "http://localhost:5173/dashboard",
        website_url: "http://localhost:5173",
        amount: amount * 100, // Convert to paisa
        purchase_order_id: productIdentity,
        purchase_order_name: productName,
        customer_info: {
          name: "Customer Name", // You should get this from your user system
          email: "customer@example.com", // You should get this from your user system
          phone: "98XXXXXXX" // You should get this from your user system
        }
      },
      {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Key ${process.env.KHALTI_SECRET_KEY}`
        }
      }
    );

    res.status(200).json(response.data);
  } catch (error) {
    console.error("Error initiating payment:", error.response?.data || error.message);
    res.status(500).json({ 
      message: "Payment initiation failed",
      error: error.response?.data || error.message 
    });
  }
};

const verifyPayment = async (req, res) => {
  const { token, amount } = req.body;

  try {
    const response = await axios.post(
      "https://a.khalti.com/api/v2/payment/verify/",
      { token, amount },
      {
        headers: {
          Authorization: `Key ${process.env.KHALTI_SECRET_KEY}`,
        },
      }
    );

    res.status(200).json(response.data);
  } catch (error) {
    console.error("Error verifying payment:", error.message);
    res.status(500).json({ message: "Payment verification failed" });
  }
};

export { initiatePayment, verifyPayment };
