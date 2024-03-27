const generateRandomNumber = (limit = 3) => {
  return parseInt(Math.random().toString().split('.')[1].slice(limit));
};

export { generateRandomNumber };