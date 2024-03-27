import { identifyContact } from "../services/contactServices.js";

const identifyContactController = async (req, res, next) => {
  try {
    const { email, phoneNumber } = req.body;
    const response = await identifyContact(email, phoneNumber);
    res.status(response.status).send(response);
  } catch (error) {
    next(error);
  }
}

export { identifyContactController };