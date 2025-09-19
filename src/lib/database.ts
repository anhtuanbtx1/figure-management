
import sql from 'mssql';

// Database configuration
const config: sql.config = {
  server: process.env.DB_SERVER || '112.78.2.70',
  database: process.env.DB_DATABASE || 'zen50558_ManagementStore',
  user: process.env.DB_USER || 'zen50558_ManagementStore',
  password: process.env.DB_PASSWORD || 'Passwordla@123',
  options: {
    encrypt: true,
    trustServerCertificate: true, // Fix TLS warning
    enableArithAbort: true,
    cryptoCredentialsDetails: {
      minVersion: 'TLSv1'
    }
  },
  pool: {
    max: 10, 
    min: 0,
    idleTimeoutMillis: 30000,
  },
  requestTimeout: 60000, 
  connectionTimeout: 60000,
};

let pool: sql.ConnectionPool | null = null;

async function getConnection(): Promise<sql.ConnectionPool> {
  if (pool && pool.connected) {
    return pool;
  }
  try {
    pool = await new sql.ConnectionPool(config).connect();
    console.log('✅ Connected to SQL Server database');
    return pool;
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    throw new Error(`Database connection failed: ${error}`);
  }
}

export async function closeConnection(): Promise<void> {
  try {
    if (pool) {
      await pool.close();
      pool = null;
      console.log('✅ Database connection closed');
    }
  } catch (error) {
    console.error('❌ Error closing database connection:', error);
  }
}

// -- THE REAL FIX --
// This function was fundamentally broken. It was passing the entire parameter object as the value.
// It has been rewritten to correctly unpack the {type, value} and pass them to request.input().
export async function executeQuery<T = any>(
  query: string,
  params?: Record<string, { type: any; value: any }>
): Promise<T[]> {
  const connection = await getConnection();
  const request = connection.request();

  if (params) {
    for (const key in params) {
      if (Object.prototype.hasOwnProperty.call(params, key)) {
        const param = params[key];
        if (param && param.type && param.value !== undefined) {
          request.input(key, param.type, param.value);
        } else {
          console.warn(`Skipping invalid parameter: ${key}`);
        }
      }
    }
  }

  const result = await request.query(query);
  return result.recordset;
}

export async function executeStoredProcedure<T = any>(
  procedureName: string,
  params?: Record<string, { type: any; value: any }>
): Promise<T[]> {
  const connection = await getConnection();
  const request = connection.request();

  if (params) {
    for (const key in params) {
      if (Object.prototype.hasOwnProperty.call(params, key)) {
        const param = params[key];
        if (param && param.type && param.value !== undefined) {
          request.input(key, param.type, param.value);
        } else {
          console.warn(`Skipping invalid parameter for stored procedure ${procedureName}: ${key}`);
        }
      }
    }
  }

  const result = await request.execute(procedureName);
  return result.recordset;
}

process.on('SIGINT', async () => {
  await closeConnection();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await closeConnection();
  process.exit(0);
});

export default { getConnection, closeConnection, executeQuery, executeStoredProcedure };
