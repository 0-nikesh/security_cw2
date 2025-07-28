import jwt from "jsonwebtoken"; // Change require to import

const generateToken = (id, isAdmin) => {
  return jwt.sign({ id, isAdmin }, process.env.JWT_SECRET, {
    expiresIn: "30d", // Token expires in 30 days
  });
};

export default generateToken;
