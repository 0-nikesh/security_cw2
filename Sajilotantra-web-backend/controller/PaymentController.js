import axios from "axios";

const initiatePayment = async (req, res) => {
  const { amount, productIdentity, productName } = req.body;

  try {
    const response = await axios.post(
      "https://khalti.com/api/v2/payment/initiate/",
      {
        amount,
        product_identity: productIdentity,
        product_name: productName,
        return_url: "http://your-frontend-url/payment-success",
      },
      {
        headers: {
          Authorization: `Key ${process.env.KHALTI_SECRET_KEY}`,
        },
      }
    );

    res.status(200).json(response.data);
  } catch (error) {
    console.error("Error initiating payment:", error.message);
    res.status(500).json({ message: "Payment initiation failed" });
  }
};

const verifyPayment = async (req, res) => {
  const { token, amount } = req.body;

  try {
    const response = await axios.post(
      "https://khalti.com/api/v2/payment/verify/",
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
