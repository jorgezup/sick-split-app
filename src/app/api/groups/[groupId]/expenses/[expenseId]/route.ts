import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ groupId: string; expenseId: string }> }
) {
  try {
    const expenseId = (await params).expenseId;
    const body = await request.json();
    const { description, amount, paidById, splitBetween } = body;

    const totalParticipants = splitBetween.length;
    const shareAmount = amount / totalParticipants;

    // Delete existing expense participants
    await prisma.expenseParticipant.deleteMany({
      where: { expenseId }
    });

    // Update expense and create new participants
    const expense = await prisma.expense.update({
      where: { id: expenseId },
      data: {
        description,
        amount,
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

    return NextResponse.json(expense);
  } catch (error) {
    console.error('Error updating expense:', error);
    return NextResponse.json(
      { error: 'Failed to update expense' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ groupId: string; expenseId: string }> }
) {
  try {
    const expenseId = (await params).expenseId;

    // Delete expense participants first
    await prisma.expenseParticipant.deleteMany({
      where: { expenseId }
    });

    // Then delete the expense
    await prisma.expense.delete({
      where: { id: expenseId }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting expense:', error);
    return NextResponse.json(
      { error: 'Failed to delete expense' },
      { status: 500 }
    );
  }
}