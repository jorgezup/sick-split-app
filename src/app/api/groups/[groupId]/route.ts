import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
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

    const group = await prisma.group.findUnique({
      where: { id: groupId },
      include: {
        participants: true,
        expenses: {
          include: {
            paidBy: true,
            participants: {
              include: {
                participant: true
              }
            }
          }
        }
      }
    });

    if (!group) {
      return NextResponse.json(
        { error: 'Group not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(group);
  } catch (error) {
    console.error('Error fetching group:', error);
    return NextResponse.json(
      { error: 'Failed to fetch group' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ groupId: string }> }
) {
  try {
    const groupId = (await params).groupId;
    const body = await request.json();
    const { name } = body;

    if (!name) {
      return NextResponse.json(
        { error: 'Participant name is required' },
        { status: 400 }
      );
    }

    await prisma.participant.create({
      data: {
        name,
        groupId,
      }
    });

    // Then fetch the updated group
    const updatedGroup = await prisma.group.findUnique({
      where: { id: groupId },
      include: {
        participants: true,
        expenses: {
          include: {
            paidBy: true,
            participants: {
              include: {
                participant: true
              }
            }
          }
        }
      }
    });

    return NextResponse.json(updatedGroup);
  } catch (error) {
    console.error('Error adding participant:', error);
    return NextResponse.json(
      { error: 'Failed to add participant' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ groupId: string }> }
) {
  try {
    const groupId = (await params).groupId;
    const body = await request.json();
    const { name, description } = body;

    if (!name) {
      return NextResponse.json(
        { error: 'Group name is required' },
        { status: 400 }
      );
    }

    const group = await prisma.group.update({
      where: { id: groupId },
      data: {
        name,
        description: description || null,
      },
      include: {
        participants: true,
        expenses: {
          include: {
            paidBy: true,
            participants: {
              include: {
                participant: true
              }
            }
          }
        }
      }
    });

    return NextResponse.json(group);
  } catch (error) {
    console.error('Error updating group:', error);
    return NextResponse.json(
      { error: 'Failed to update group' },
      { status: 500 }
    );
  }
}