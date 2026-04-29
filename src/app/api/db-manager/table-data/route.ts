import { NextRequest, NextResponse } from "next/server";
import sql from "mssql";

const dbConfig: sql.config = {
  server: process.env.DB_SERVER || "localhost",
  database: process.env.DB_DATABASE || "master",
  user: process.env.DB_USER || "sa",
  password: process.env.DB_PASSWORD || "",
  options: {
    trustServerCertificate:
      process.env.DB_TRUST_SERVER_CERTIFICATE === "true" || true,
    encrypt: false,
  },
  connectionTimeout: 15000,
  requestTimeout: 15000,
};

let pool: sql.ConnectionPool | null = null;

async function getPool(): Promise<sql.ConnectionPool> {
  if (pool && pool.connected) return pool;
  pool = await new sql.ConnectionPool(dbConfig).connect();
  return pool;
}

// Sanitize identifier to prevent SQL injection
function sanitizeIdentifier(name: string): string {
  return name.replace(/[^a-zA-Z0-9_\-. ]/g, "");
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const tableName = searchParams.get("table");
    const schema = searchParams.get("schema") || "dbo";
    const page = Math.max(1, Number(searchParams.get("page") || "1"));
    const pageSize = Math.min(100, Math.max(1, Number(searchParams.get("pageSize") || "50")));

    if (!tableName) {
      return NextResponse.json(
        { success: false, message: "Table name is required", data: [] },
        { status: 400 }
      );
    }

    const safeTable = sanitizeIdentifier(tableName);
    const safeSchema = sanitizeIdentifier(schema);
    const offset = (page - 1) * pageSize;

    const db = await getPool();

    // Get columns
    const colResult = await db.request()
      .input("tableName", sql.NVarChar, safeTable)
      .input("schemaName", sql.NVarChar, safeSchema)
      .query(`
        SELECT 
          COLUMN_NAME AS [name],
          DATA_TYPE AS [dataType],
          CHARACTER_MAXIMUM_LENGTH AS [maxLength],
          IS_NULLABLE AS [nullable],
          COLUMN_DEFAULT AS [defaultValue],
          ORDINAL_POSITION AS [position]
        FROM INFORMATION_SCHEMA.COLUMNS
        WHERE TABLE_NAME = @tableName AND TABLE_SCHEMA = @schemaName
        ORDER BY ORDINAL_POSITION
      `);

    // Get total count
    const countResult = await db.request().query(
      `SELECT COUNT(*) AS total FROM [${safeSchema}].[${safeTable}]`
    );
    const total = countResult.recordset[0]?.total || 0;

    // Get paginated data
    const dataResult = await db.request().query(`
      SELECT * FROM [${safeSchema}].[${safeTable}]
      ORDER BY (SELECT NULL)
      OFFSET ${offset} ROWS FETCH NEXT ${pageSize} ROWS ONLY
    `);

    return NextResponse.json({
      success: true,
      columns: colResult.recordset,
      data: dataResult.recordset,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    });
  } catch (error) {
    console.error("[db-manager/table-data] Error:", error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Database error",
        data: [],
        columns: [],
      },
      { status: 500 }
    );
  }
}
