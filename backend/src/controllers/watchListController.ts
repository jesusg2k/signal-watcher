import { Request, Response } from 'express';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';
import { APIResponse, CreateWatchListRequest } from '@/types';
import logger from '@/utils/logger';

const prisma = new PrismaClient();

const createWatchListSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().optional(),
  terms: z.array(z.string().min(1)).min(1).max(50)
});

export const createWatchList = async (req: Request, res: Response) => {
  const { correlationId } = req;
  
  try {
    const validatedData = createWatchListSchema.parse(req.body);
    
    const watchList = await prisma.watchList.create({
      data: validatedData
    });

    logger.info('Watch list created', { correlationId, watchListId: watchList.id });

    const response: APIResponse = {
      success: true,
      data: watchList,
      correlationId
    };

    res.status(201).json(response);
  } catch (error) {
    throw error;
  }
};

export const getWatchLists = async (req: Request, res: Response) => {
  const { correlationId } = req;
  
  try {
    const watchLists = await prisma.watchList.findMany({
      include: {
        _count: {
          select: { events: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    const response: APIResponse = {
      success: true,
      data: watchLists,
      correlationId
    };

    res.json(response);
  } catch (error) {
    throw error;
  }
};

export const getWatchList = async (req: Request, res: Response) => {
  const { correlationId } = req;
  const { id } = req.params;
  
  try {
    const watchList = await prisma.watchList.findUnique({
      where: { id },
      include: {
        events: {
          orderBy: { createdAt: 'desc' },
          take: 10
        }
      }
    });

    if (!watchList) {
      throw new Error('Watch list not found');
    }

    const response: APIResponse = {
      success: true,
      data: watchList,
      correlationId
    };

    res.json(response);
  } catch (error) {
    throw error;
  }
};

export const deleteWatchList = async (req: Request, res: Response) => {
  const { correlationId } = req;
  const { id } = req.params;
  
  try {
    await prisma.watchList.delete({
      where: { id }
    });

    logger.info('Watch list deleted', { correlationId, watchListId: id });

    const response: APIResponse = {
      success: true,
      correlationId
    };

    res.json(response);
  } catch (error) {
    throw error;
  }
};