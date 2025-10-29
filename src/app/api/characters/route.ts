import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/database';
import sql from 'mssql';

// Force dynamic rendering for this API route
export const dynamic = 'force-dynamic';

// GET /api/characters - Get all game characters
export async function GET(request: NextRequest) {
  try {
    console.log('📊 Fetching game characters...');

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
      WHERE IsActive = 1
      ORDER BY IsFeatured DESC, CreatedAt DESC
    `;

    const characters = await executeQuery(query);

    // Transform data to match BlogPostType structure
    const transformedCharacters = characters.map((char: any) => ({
      id: char.id,
      title: char.title,
      content: char.content,
      coverImg: char.coverImg,
      createdAt: char.createdAt,
      view: char.view,
      share: char.share,
      category: char.category,
      featured: Boolean(char.featured),
      element: char.element,
      game: char.game,
      strength: char.strength,
      attack: char.attack,
      defense: char.defense,
      hp: char.hp,
      armor: char.armor,
      author: {
        id: char.id,
        name: char.AuthorName,
        avatar: char.AuthorAvatar,
      },
      comments: [], // Comments can be fetched separately if needed
    }));

    console.log(`✅ Successfully fetched ${transformedCharacters.length} characters`);

    return NextResponse.json({
      success: true,
      data: transformedCharacters,
      count: transformedCharacters.length,
    });

  } catch (error) {
    console.error('❌ Error fetching game characters:', error);
    
    return NextResponse.json({
      success: false,
      message: 'Failed to fetch game characters',
      error: error instanceof Error ? error.message : 'Unknown error',
      data: [],
    }, { status: 500 });
  }
}

// POST /api/characters - Create new game character
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      title,
      content,
      coverImg,
      category,
      element,
      game,
      strength = 3.0,
      attack = 3.0,
      defense = 3.0,
      hp = 3.0,
      armor = 3.0,
      authorName,
      authorAvatar,
      isFeatured = false,
    } = body;

    // Validate required fields
    if (!title) {
      return NextResponse.json({
        success: false,
        message: 'Title is required',
      }, { status: 400 });
    }

    // Validate stats range (1.0 - 5.0)
    const validateStat = (value: number, name: string) => {
      const num = parseFloat(value.toString());
      if (isNaN(num) || num < 1.0 || num > 5.0) {
        return { valid: false, message: `${name} must be between 1.0 and 5.0` };
      }
      return { valid: true };
    };

    const statValidation = [
      validateStat(strength, 'Strength'),
      validateStat(attack, 'Attack'),
      validateStat(defense, 'Defense'),
      validateStat(hp, 'HP'),
      validateStat(armor, 'Armor'),
    ].find(v => !v.valid);

    if (statValidation && !statValidation.valid) {
      return NextResponse.json({
        success: false,
        message: statValidation.message,
      }, { status: 400 });
    }

    const query = `
      INSERT INTO GameCharacters
        (Title, Content, CoverImg, Category, Element, Game, 
         Strength, Attack, Defense, HP, Armor, 
         AuthorName, AuthorAvatar, IsFeatured, IsActive, CreatedAt, UpdatedAt)
      VALUES
        (@title, @content, @coverImg, @category, @element, @game,
         @strength, @attack, @defense, @hp, @armor,
         @authorName, @authorAvatar, @isFeatured, 1, GETDATE(), GETDATE());
      
      SELECT SCOPE_IDENTITY() as newId;
    `;

    const result = await executeQuery(query, {
      title: { type: sql.NVarChar, value: title },
      content: { type: sql.NVarChar, value: content || '' },
      coverImg: { type: sql.NVarChar, value: coverImg || '' },
      category: { type: sql.NVarChar, value: category || '' },
      element: { type: sql.NVarChar, value: element || '' },
      game: { type: sql.NVarChar, value: game || '' },
      strength: { type: sql.Float, value: parseFloat(strength) || 3.0 },
      attack: { type: sql.Float, value: parseFloat(attack) || 3.0 },
      defense: { type: sql.Float, value: parseFloat(defense) || 3.0 },
      hp: { type: sql.Float, value: parseFloat(hp) || 3.0 },
      armor: { type: sql.Float, value: parseFloat(armor) || 3.0 },
      authorName: { type: sql.NVarChar, value: authorName || 'Unknown' },
      authorAvatar: { type: sql.NVarChar, value: authorAvatar || '/images/profile/user-1.jpg' },
      isFeatured: { type: sql.Bit, value: isFeatured },
    });

    console.log('✅ Character created successfully:', result);

    return NextResponse.json({
      success: true,
      message: 'Character created successfully',
      data: { id: result[0]?.newId },
    });

  } catch (error) {
    console.error('❌ Error creating game character:', error);
    
    return NextResponse.json({
      success: false,
      message: 'Failed to create game character',
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}
