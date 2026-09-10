import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/database';
import sql from 'mssql';

export const dynamic = 'force-dynamic';

// GET /api/characters/[id] - Get single character
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    if (isNaN(id)) {
      return NextResponse.json({ success: false, message: 'Invalid ID' }, { status: 400 });
    }

    const query = `
      SELECT 
        Id as id,
        Title as title,
        Content as content,
        CoverImg as coverImg,
        CreatedAt as createdAt,
        ViewCount as [view],
        ShareCount as share,
        Category as category,
        IsFeatured as featured,
        Element as element,
        Game as game,
        Strength as strength,
        Attack as attack,
        Defense as defense,
        HP as hp,
        Armor as armor,
        AuthorName,
        AuthorAvatar
      FROM GameCharacters
      WHERE Id = @id AND IsActive = 1
    `;

    const result = await executeQuery(query, {
      id: { type: sql.Int, value: id },
    });

    if (!result || result.length === 0) {
      return NextResponse.json({ success: false, message: 'Character not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: result[0] });
  } catch (error) {
    console.error('Error fetching character:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to fetch character',
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}

// PUT /api/characters/[id] - Update character (bao gom CoverImg)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    if (isNaN(id)) {
      return NextResponse.json({ success: false, message: 'Invalid ID' }, { status: 400 });
    }

    const body = await request.json();
    const {
      title,
      content,
      coverImg,
      category,
      element,
      game,
      strength,
      attack,
      defense,
      hp,
      armor,
      authorName,
      authorAvatar,
      isFeatured,
    } = body;

    if (!title) {
      return NextResponse.json({ success: false, message: 'Title is required' }, { status: 400 });
    }

    const query = `
      UPDATE GameCharacters
      SET
        Title        = @title,
        Content      = @content,
        CoverImg     = @coverImg,
        Category     = @category,
        Element      = @element,
        Game         = @game,
        Strength     = @strength,
        Attack       = @attack,
        Defense      = @defense,
        HP           = @hp,
        Armor        = @armor,
        AuthorName   = @authorName,
        AuthorAvatar = @authorAvatar,
        IsFeatured   = @isFeatured,
        UpdatedAt    = GETDATE()
      WHERE Id = @id AND IsActive = 1
    `;

    await executeQuery(query, {
      id:           { type: sql.Int,      value: id },
      title:        { type: sql.NVarChar, value: title },
      content:      { type: sql.NVarChar, value: content      || '' },
      coverImg:     { type: sql.NVarChar, value: coverImg     || '' },
      category:     { type: sql.NVarChar, value: category     || '' },
      element:      { type: sql.NVarChar, value: element      || '' },
      game:         { type: sql.NVarChar, value: game         || '' },
      strength:     { type: sql.Float,    value: parseFloat(strength)  || 3.0 },
      attack:       { type: sql.Float,    value: parseFloat(attack)    || 3.0 },
      defense:      { type: sql.Float,    value: parseFloat(defense)   || 3.0 },
      hp:           { type: sql.Float,    value: parseFloat(hp)        || 3.0 },
      armor:        { type: sql.Float,    value: parseFloat(armor)     || 3.0 },
      authorName:   { type: sql.NVarChar, value: authorName   || 'Unknown' },
      authorAvatar: { type: sql.NVarChar, value: authorAvatar || '/images/profile/user-1.jpg' },
      isFeatured:   { type: sql.Bit,      value: isFeatured  ?? false },
    });

    console.log(`Character ${id} updated successfully`);

    return NextResponse.json({
      success: true,
      message: 'Character updated successfully',
    });
  } catch (error) {
    console.error('Error updating character:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to update character',
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}

// DELETE /api/characters/[id] - Soft delete character
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    if (isNaN(id)) {
      return NextResponse.json({ success: false, message: 'Invalid ID' }, { status: 400 });
    }

    const query = `
      UPDATE GameCharacters
      SET IsActive = 0, UpdatedAt = GETDATE()
      WHERE Id = @id
    `;

    await executeQuery(query, {
      id: { type: sql.Int, value: id },
    });

    console.log(`Character ${id} deleted successfully`);

    return NextResponse.json({
      success: true,
      message: 'Character deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting character:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to delete character',
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}

// PATCH /api/characters/[id] - Update only CoverImg
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    if (isNaN(id)) {
      return NextResponse.json({ success: false, message: 'Invalid ID' }, { status: 400 });
    }

    const body = await request.json();
    const { coverImg } = body;

    if (coverImg === undefined || coverImg === null) {
      return NextResponse.json({ success: false, message: 'coverImg is required' }, { status: 400 });
    }

    const query = `
      UPDATE GameCharacters
      SET CoverImg = @coverImg, UpdatedAt = GETDATE()
      WHERE Id = @id AND IsActive = 1
    `;

    await executeQuery(query, {
      id:       { type: sql.Int,      value: id },
      coverImg: { type: sql.NVarChar, value: coverImg },
    });

    console.log(`CoverImg updated for character ${id}: ${coverImg}`);

    return NextResponse.json({
      success: true,
      message: 'CoverImg updated successfully',
    });
  } catch (error) {
    console.error('Error updating CoverImg:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to update CoverImg',
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}
