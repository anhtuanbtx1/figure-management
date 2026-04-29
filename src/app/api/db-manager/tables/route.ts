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

export async function GET(request: NextRequest) {
  try {
    const db = await getPool();

    const result = await db.request().query(`
      SELECT 
        t.TABLE_SCHEMA AS [schema],
        t.TABLE_NAME AS [name],
        t.TABLE_TYPE AS [type],
        (
          SELECT COUNT(*) 
          FROM INFORMATION_SCHEMA.COLUMNS c 
          WHERE c.TABLE_NAME = t.TABLE_NAME AND c.TABLE_SCHEMA = t.TABLE_SCHEMA
        ) AS [columnCount],
        p.rows AS [rowCount]
      FROM INFORMATION_SCHEMA.TABLES t
      LEFT JOIN (
        SELECT 
          OBJECT_NAME(i.object_id) AS table_name,
          OBJECT_SCHEMA_NAME(i.object_id) AS schema_name,
          SUM(p.rows) AS rows
        FROM sys.indexes i
        INNER JOIN sys.partitions p ON i.object_id = p.object_id AND i.index_id = p.index_id
        WHERE i.index_id IN (0, 1)
        GROUP BY i.object_id
      ) p ON p.table_name = t.TABLE_NAME AND p.schema_name = t.TABLE_SCHEMA
      ORDER BY t.TABLE_SCHEMA, t.TABLE_NAME
    `);

    return NextResponse.json({
      success: true,
      data: result.recordset,
    });
  } catch (error) {
    console.error("[db-manager/tables] Error:", error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Database error",
        data: [],
      },
      { status: 500 }
    );
  }
}
