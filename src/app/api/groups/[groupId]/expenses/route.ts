import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ groupId: string }> }
) {
  try {
    const groupId = (await params).groupId;

    if (!groupId) {
      return NextResponse.json(
        { error: 'Invalid group ID' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { description, amount, paidById, splitBetween } = body;

    const totalParticipants = splitBetween.length;
    const shareAmount = amount / totalParticipants;

    const expense = await prisma.expense.create({
      data: {
        description,
        amount,
        groupId,
        paidById,
        participants: {
          create: splitBetween.map((participantId: string) => ({
            participantId,
            share: shareAmount
          }))
        }
      },
      include: {
        paidBy: true,
        participants: {
          include: {
            participant: true
          }
        }
      }
    });

    return NextResponse.json(expense, { status: 201 });
  } catch (error) {
    console.error('Error creating expense:', error);
    return NextResponse.json(
      { error: 'Failed to create expense' },
      { status: 500 }
    );
  }
}