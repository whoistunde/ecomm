const { check } = require("express-validator");
const usersRepo = require("../../repositories/users");

module.exports = {
  requireEmail: check("email")
    .trim()
    .normalizeEmail()
    .isEmail()
    .withMessage("Must be a valid email")
    .custom(async (email) => {
      const existingUser = await usersRepo.getOneBy({ email });
      if (existingUser) {
        throw new Error("Email in use");
      }
    }),
  requirePassword: check("password")
    .trim()
    .isLength({ min: 4, max: 20 })
    .withMessage("Must be between 4 and 20 characters"),
  requirePasswordConfirmation: check("passwordConfirmation")
    .trim()
    .isLength({ min: 4, max: 20 })
    .withMessage("Must be between 4 and 20 characters")
    .custom((passwordConfirmation, { req }) => {
      if (passwordConfirmation != req.body.password) {
        throw new Error("Passwords must match");
      }
      // This is the issue click on the link to know why: https://express-validator.github.io/docs/custom-validators-sanitizers.html#:~:text=//%20Indicates%20the%20success%20of%20this%20synchronous%20custom%20validator%0A%20%20%20%20return%20true%3B
      return true;
    }),
  requireEmailExists: check("email")
    .trim()
    .normalizeEmail()
    .isEmail()
    .withMessage("Must provide a valid email")
    .custom(async (email) => {
      const user = await usersRepo.getOneBy({ email });
      if (!user) {
        throw new Error("Email not found!");
      }
    }),
  requirePasswordForUser: check("password")
    .trim()
    .custom(async (password, { req }) => {
      const user = await usersRepo.getOneBy({ email: req.body.email });
      console.log(password);
      if (!user) {
        throw new Error("Invalid password");
      }

      const validPassword = await usersRepo.comparePasswords(
        user.password,
        password
      );
      if (!validPassword) {
        throw new Error("Invalid password");
      }
    }),
};
