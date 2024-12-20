// src/controllers/uploads.controller.ts
import path from "path";
import fs from "fs";
import { Request, Response } from "express";
import { BadRequestException, NotFoundException } from "../exceptions";

export const getFile = async (req: Request, res: Response) => {
  const { filename } = req.params;

  // Check if filename parameter exists
  if (!filename) {
    throw new BadRequestException("Filename is required");
  }
  // Use an environment variable for the uploads path
  const uploadDir = process.env.UPLOADS_PATH || "uploads";
  const filePath = path.resolve(uploadDir, filename);

  // Check if file exists
  if (!fs.existsSync(filePath)) {
    throw new NotFoundException("File not found");
  }

  // Set appropriate headers and send file
  res.sendFile(filePath, (err) => {
    if (err) {
      console.error("Error sending file:", err);
      res.status(500).send("Failed to send file.");
    }
  });
};
