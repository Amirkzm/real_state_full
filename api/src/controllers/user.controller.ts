import prisma from "../../lib/prisma";
import {
  BadRequestException,
  InternalException,
  NotAuthorizedException,
  UserNotFoundException,
} from "../exceptions";

import { sendSuccessResponse } from "../responses";
import e, { Request, Response } from "express";
import { UpdateProfileSchema } from "../schema/user.schema";
import bcrypt from "bcrypt";
import path from "path";

export const getUsers = async (req: Request, res: Response) => {
  console.log("getUsers is running");
  const users = await prisma.user.findMany();
  if (users) {
    sendSuccessResponse(res, users, 200);
  }
};

export const getUser = async (req: Request, res: Response) => {
  const userId = req.params?.id;

  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
  });
  if (user) {
    sendSuccessResponse(res, user, 200);
  } else {
    throw new UserNotFoundException("User not found");
  }
};

export const updateUser = async (req: Request, res: Response) => {
  const id = req.params?.id;
  const userId = req.user.id;

  if (id !== userId) throw new NotAuthorizedException();

  const sentData = req.body;
  const avatar = req.file;

  const { password: userPass, ...otherInfo } = sentData;

  const parsedData = !userPass
    ? UpdateProfileSchema.parse(otherInfo)
    : UpdateProfileSchema.parse(sentData);

  const { password, ...rest } = parsedData;
  let hashedPassword;

  if (password) {
    hashedPassword = await bcrypt.hash(password, 10);
  }

  const infoToSave = {
    ...rest,
    ...(password && { password: hashedPassword }),
    avatar: avatar ? path.join("uploads", avatar.filename) : null,
  };

  const updatedUser = await prisma.user.update({
    where: {
      id,
    },
    data: infoToSave,
  });

  sendSuccessResponse(res, updatedUser, 200);
};

export const deleteUser = async (req: Request, res: Response) => {
  const id = req.params?.id;
  const userId = req.user?.id;
  if (id !== userId) {
    throw new NotAuthorizedException();
  }
  await prisma.user.delete({
    where: {
      id,
    },
  });
  sendSuccessResponse(res, {}, 200);
};

export const savePost = async (req: Request, res: Response) => {
  console.log("savePost is running");
  console.log("req.body", req.body);
  const reqMethod = req.method;
  console.log("reqMethod", reqMethod);
  const { postId } = req.body;
  console.log("postId", postId);
  const userId = req?.user?.id;

  if (!userId) throw new NotAuthorizedException();
  if (!postId) throw new BadRequestException("Post id is required");

  const existingSavedPost = await prisma.savedPost.findUnique({
    where: {
      userId_postId: {
        userId,
        postId,
      },
    },
  });

  if (reqMethod === "POST") {
    if (existingSavedPost) {
      sendSuccessResponse(res, { message: "Post saved successfully!" }, 200);
    } else {
      const savedPost = await prisma.savedPost.create({
        data: {
          user: { connect: { id: userId } },
          post: { connect: { id: postId } },
        },
      });
      sendSuccessResponse(res, { message: "Post saved successfully!" }, 201);
    }
  } else if (reqMethod === "DELETE") {
    if (existingSavedPost) {
      await prisma.savedPost.delete({
        where: {
          id: existingSavedPost.id,
        },
      });
    }
    sendSuccessResponse(
      res,
      { message: "Post removed from saved posts!" },
      200
    );
  }
};

export const profilePosts = async (req: Request, res: Response) => {
  const userId = req.user.id;
  const myPosts = await prisma.post.findMany({
    where: {
      userId,
    },
  });

  const savedPosts = await prisma.savedPost.findMany({
    where: {
      userId,
    },
    include: {
      post: true,
    },
  });

  const allPosts = { myPosts, savedPosts };
  console.log("all posts", allPosts);

  sendSuccessResponse(res, allPosts, 200);
};
