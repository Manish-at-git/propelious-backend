
const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { StatusMessage } = require("../utils/statusMessage");

const signup = async (req, res) => {
	/* 	#swagger.tags = ['Auth']
        #swagger.description = 'Endpoint to signup a specific user' */
	const { name, email, password, confirmPassword } = req.body;

	if (!name || !email || !password) {
		return res.status(204).json({ message: StatusMessage.NO_CONTENT });
	}

	try {
		const user = await User.findOne({ email });
		if (user) {
			return res.status(400).json({ message: StatusMessage.USER_ALREADY_EXISTS });
		}

		const hashedPassword = await bcrypt.hash(password, 10);
		const newUser = new User({
			name,
			email,
			password: hashedPassword,
			created: Date.now(),
		});

		await newUser.save();
		res.status(201).json({ message: StatusMessage.SUCCESS });
	} catch (error) {
		res.status(500).json({ error: StatusMessage.INTERNAL_SERVER_ERROR });
	}
};


const signin = async (req, res) => {
	/* 	#swagger.tags = ['Auth']
        #swagger.description = 'Endpoint to signin a specific user' */
	const { email, password } = req.body;

	try {
		const user = await User.findOne({ email });
		if (!user) {
			return res.status(400).json({ message: StatusMessage.INVALID_CREDENTIALS });
		}
		
		const isValidPassword = await bcrypt.compare(password, user.password);
		if (!isValidPassword) {
			return res.status(401).json({ message: StatusMessage.INVALID_CREDENTIALS });
		}

		const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET);
		res.status(200).json({ message: StatusMessage.SUCCESS, token });
	} catch (error) {
		res.status(500).json({ error: StatusMessage.INTERNAL_SERVER_ERROR });
	}
};

module.exports = { signin, signup };
