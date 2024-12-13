import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ groupId: string; participantId: string }> }
) {
  try {
    const { groupId, participantId } = (await params);
    const group = await prisma.group.findUnique({
      where: { id: groupId },
      include: {
        participants: true,
        expenses: {
          where: {
            paidById: participantId
          },
          select: {
            id: true
          }
        }
      },
    });

    if (!group) {
      return NextResponse.json(
        { error: 'Group not found' },
        { status: 404 }
      );
    }

    // Check if this is the last participant
    if (group.participants.length <= 1) {
      return NextResponse.json(
        { error: 'Cannot remove the last participant from the group' },
        { status: 400 }
      );
    }

    // Check if the participant exists in this group
    const participantExists = group.participants.some(p => p.id === participantId);
    if (!participantExists) {
      return NextResponse.json(
        { error: 'Participant not found in this group' },
        { status: 404 }
      );
    }

    // Check if the participant has paid for any expenses
    if (group.expenses.length > 0) {
      return NextResponse.json(
        {
          error: 'Cannot remove this participant because they have paid for expenses. ' +
            'You must first reassign or delete their expenses.'
        },
        { status: 400 }
      );
    }

    // Start a transaction to handle the participant removal and expense shares
    const updatedGroup = await prisma.$transaction(async (tx) => {
      // Remove participant's expense shares
      await tx.expenseParticipant.deleteMany({
        where: {
          participantId: participantId,
        },
      });

      // Remove the participant
      await tx.participant.delete({
        where: {
          id: participantId,
        },
      });

      // Return the updated group
      return tx.group.findUnique({
        where: { id: groupId },
        include: {
          participants: true,
          expenses: {
            include: {
              paidBy: true,
              participants: {
                include: {
                  participant: true,
                },
              },
            },
          },
        },
      });
    });

    return NextResponse.json(updatedGroup);
  } catch (error) {
    console.error('Error removing participant:', error);
    return NextResponse.json(
      { error: 'Failed to remove participant' },
      { status: 500 }
    );
  }
}