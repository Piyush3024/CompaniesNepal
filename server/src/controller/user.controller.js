import pkg from "@prisma/client";
const { PrismaClient } = pkg;
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

const getUser = async (req, res) => {
  try {
    const users = await prisma.user.findMany();
    if (!users) {
      res.status(404).json({
        error: "There is no user",
      });
      return;
    }
    res.json({
      message: "Users fetched",
      users,
    });
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
};

const createUser = async (req, res) => {
  try {
    const { username, email, password, phone, profile_picture } = req.body;
    if (!email || !password || !username) {
      return res.status(400).json({
        error: "email , password and username are required",
        success: false,
      });
    }
    const existingUser = await prisma.user.findUnique({
      where: {
        email,
      },
    });
    if (existingUser) {
      return res.status(400).json({
        error: "User with this email already exists",
        success: false,
      });
    }
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
        phone,
        profile_picture,
      },
      select: {
        id: true,
        username: true,
        email: true,
        phone: true,
        profile_picture: true,
      },
    });
    res.json({
      message: "user created",
      newUser,
    });
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
};

const deleteUser = async (req, res) => {
  try {
    const id = req.user.id || parseInt(req.params.id);
    await prisma.user.delete({
      where: {
        id,
      },
    });
    res.json({
      message: "user deleted",
    });
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
};

const updateUser = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { username, email, phone, profile_picture } = req.body;
    const existingUser = await prisma.user.findUnique({
      where: {
        id,
      },
    });
    if (!existingUser) {
      return res.status(404).json({
        error: "user does not exist",
      });
    }
    const editUser = await prisma.user.update({
      where: {
        id,
      },
      data: {
        username: username ?? existingUser.username,
        email: email ?? existingUser.email,
        phone: phone ?? existingUser.phone,

        profile_picture: profile_picture ?? existingUser.profile_picture,
      },
    });
    res.json({
      message: "user is updated ",
      editUser,
    });
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
};

export { getUser, createUser, deleteUser, updateUser };
