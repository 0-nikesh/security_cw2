import bcrypt from "bcryptjs";
const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
};

const matchPassword = async (enteredPassword, hashedPassword) => {
  return await bcrypt.compare(enteredPassword, hashedPassword);
};

export { hashPassword, matchPassword };

