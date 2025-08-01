import Feedback from "../model/Feedback.js";
const submitFeedback = async (req, res) => {
  const feedback = await Feedback.create(req.body);
  res.status(201).json(feedback);
};


const getAllFeedback = async (req, res) => {
  const feedback = await Feedback.find();
  res.json(feedback);
}

export { getAllFeedback, submitFeedback };

