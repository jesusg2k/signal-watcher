import { Request, Response } from 'express';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';
import { APIResponse, CreateEventRequest } from '@/types';
import aiService from '@/services/aiService';
import logger from '@/utils/logger';

const prisma = new PrismaClient();

const createEventSchema = z.object({
  watchListId: z.string(),
  eventData: z.object({
    type: z.string(),
    domain: z.string().optional(),
    ip: z.string().optional(),
    description: z.string(),
    metadata: z.record(z.any()).optional()
  })
});

export const createEvent = async (req: Request, res: Response) => {
  const { correlationId } = req;
  
  try {
    const validatedData = createEventSchema.parse(req.body);
    const { watchListId, eventData } = validatedData;

    // Get watch list to access terms
    const watchList = await prisma.watchList.findUnique({
      where: { id: watchListId }
    });

    if (!watchList) {
      throw new Error('Watch list not found');
    }

    // Create event first
    const event = await prisma.event.create({
      data: {
        watchListId,
        rawData: eventData,
        correlationId,
        processed: false
      }
    });

    // Process with AI asynchronously
    processEventWithAI(event.id, eventData, watchList.terms, correlationId);

    logger.info('Event created', { correlationId, eventId: event.id });

    const response: APIResponse = {
      success: true,
      data: event,
      correlationId
    };

    res.status(201).json(response);
  } catch (error) {
    throw error;
  }
};

const processEventWithAI = async (eventId: string, eventData: any, terms: string[], correlationId: string) => {
  try {
    const analysis = await aiService.analyzeEvent(eventData, terms, correlationId);
    
    await prisma.event.update({
      where: { id: eventId },
      data: {
        summary: analysis.summary,
        severity: analysis.severity,
        suggestedAction: analysis.suggestedAction,
        processed: true
      }
    });

    logger.info('Event processed with AI', { correlationId, eventId, severity: analysis.severity });
  } catch (error) {
    logger.error('AI processing failed', { correlationId, eventId, error });
  }
};

export const getEvents = async (req: Request, res: Response) => {
  const { correlationId } = req;
  const { watchListId } = req.query;
  
  try {
    const where = watchListId ? { watchListId: watchListId as string } : {};
    
    const events = await prisma.event.findMany({
      where,
      include: {
        watchList: {
          select: { name: true }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 50
    });

    const response: APIResponse = {
      success: true,
      data: events,
      correlationId
    };

    res.json(response);
  } catch (error) {
    throw error;
  }
};

export const getEvent = async (req: Request, res: Response) => {
  const { correlationId } = req;
  const { id } = req.params;
  
  try {
    const event = await prisma.event.findUnique({
      where: { id },
      include: {
        watchList: true
      }
    });

    if (!event) {
      throw new Error('Event not found');
    }

    const response: APIResponse = {
      success: true,
      data: event,
      correlationId
    };

    res.json(response);
  } catch (error) {
    throw error;
  }
};