const bcrypt = require("bcrypt");

const user = (sequelize, DataTypes) => {
	const User = sequelize.define("user", {
		username: {
			type: DataTypes.STRING,
		},
		email: {
			type: DataTypes.STRING,
			unique: true,
			allowNull: false,
			validate: {
				notEmpty: true,
			},
		},
		password: {
			type: DataTypes.STRING,
			unique: true,
		},
		google_id: {
			type: DataTypes.STRING,
			unique: true,
		},
	});

	User.associate = (models) => {
		User.hasMany(models.Post, { onDelete: "CASCADE" });
	};

	User.findByLogin = async (login) => {
		let user = await User.findOne({
			where: { username: login },
		});

		if (!user) {
			user = await User.findOne({
				where: { email: login },
			});
		}

		return user;
	};

	User.beforeCreate(async (user) => {
		if (user.password) {
			user.password = await user.generatePasswordHash();
		}
	});

	User.prototype.generatePasswordHash = async function () {
		const saltRounds = 10;
		return await bcrypt.hash(this.password, saltRounds);
	};

	User.prototype.validatePassword = async function (password) {
		return await bcrypt.compare(password, this.password);
	};

	return User;
};

module.exports = user;
