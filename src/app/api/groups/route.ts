// app/api/groups/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, description, currency, participants } = body;

    if (!name || !participants || !Array.isArray(participants)) {
      return NextResponse.json(
        { error: 'Invalid input data' },
        { status: 400 }
      );
    }

    const validParticipants = participants.filter(p => p.name && typeof p.name === 'string');

    if (validParticipants.length === 0) {
      return NextResponse.json(
        { error: 'At least one valid participant is required' },
        { status: 400 }
      );
    }

    const group = await prisma.group.create({
      data: {
        name,
        description: description || null,
        currency: currency || 'USD',
        participants: {
          create: validParticipants.map(p => ({
            name: p.name
          }))
        }
      },
      include: {
        participants: true
      }
    });

    return NextResponse.json(group, { status: 201 });
  } catch (error) {
    console.error('Error creating group:', error);
    
    return NextResponse.json(
      { error: 'Failed to create group' },
      { status: 500 }
    );
  }
}