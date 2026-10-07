import sql from 'mssql';

// Database configuration
const config: sql.config = {
  server: process.env.DB_SERVER || '45.118.151.103',
  database: process.env.DB_DATABASE || 'ManagementStore',
  user: process.env.DB_USER || 'sa',
  password: process.env.DB_PASSWORD || 'Ots@123',
  options: {
    encrypt: false,
    trustServerCertificate: process.env.DB_TRUST_SERVER_CERTIFICATE !== 'false',
    enableArithAbort: true,
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
let isConnecting = false;
const MAX_CONNECTION_RETRIES = 3;

// Renamed from getConnection and exported
export async function getDbPool(): Promise<sql.ConnectionPool> {
  if (pool && pool.connected) {
    return pool;
  }

  // If already connecting, wait for existing connection attempt
  if (isConnecting) {
    while (isConnecting) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    if (pool && pool.connected) {
      return pool;
    }
  }

  isConnecting = true;

  // Close existing pool if not connected
  if (pool && !pool.connected) {
    try {
      await pool.close();
    } catch {
      // Ignore close error on dead pool
    }
    pool = null;
  }

  let lastError: any = null;
  for (let attempt = 1; attempt <= MAX_CONNECTION_RETRIES; attempt++) {
    try {
      const newPool = new sql.ConnectionPool(config);
      newPool.on('error', (err) => {
        console.error('❌ SQL Server connection pool error:', err);
        pool = null;
      });

      await newPool.connect();
      pool = newPool;
      isConnecting = false;
      console.log(`✅ Connected to SQL Server database (attempt ${attempt})`);
      return pool;
    } catch (error) {
      lastError = error;
      console.warn(`⚠️ Connection attempt ${attempt}/${MAX_CONNECTION_RETRIES} failed:`, error);
      if (attempt < MAX_CONNECTION_RETRIES) {
        await new Promise(resolve => setTimeout(resolve, 500 * attempt));
      }
    }
  }

  isConnecting = false;
  console.error('❌ Database connection failed after retries:', lastError);
  throw new Error(`Database connection failed: ${lastError?.message || lastError}`);
}

// Exported
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

// Helper to bind input parameters to an mssql Request safely
function bindParams(request: sql.Request, params?: Record<string, any>) {
  if (!params) return;
  for (const key in params) {
    if (Object.prototype.hasOwnProperty.call(params, key)) {
      const param = params[key];
      if (param !== undefined && param !== null) {
        if (typeof param === 'object' && 'type' in param && 'value' !== undefined) {
          request.input(key, param.type, param.value);
        } else {
          // Direct primitive or date
          request.input(key, param);
        }
      }
    }
  }
}

// Exported, and internal call updated to getDbPool
export async function executeQuery<T = any>(
  query: string,
  params?: Record<string, any>
): Promise<T[]> {
  const connection = await getDbPool();
  const request = connection.request();
  bindParams(request, params);
  const result = await request.query(query);
  return result.recordset;
}

// Exported, and internal call updated to getDbPool
export async function executeStoredProcedure<T = any>(
  procedureName: string,
  params?: Record<string, any>
): Promise<T[]> {
  const connection = await getDbPool();
  const request = connection.request();
  bindParams(request, params);
  const result = await request.execute(procedureName);
  return result.recordset;
}

// A new utility for transactions, now exported
export async function executeTransaction<T>(
  callback: (transaction: sql.Transaction) => Promise<T>
): Promise<T> {
  const pool = await getDbPool();
  const transaction = new sql.Transaction(pool);

  try {
    await transaction.begin();
    console.log('âœ… Transaction started');
    const result = await callback(transaction);
    await transaction.commit();
    console.log('âœ… Transaction committed successfully');
    return result;
  } catch (error) {
    console.error('âŒ Transaction failed, rolling back:', error);
    try {
      await transaction.rollback();
      console.log('âœ… Transaction rolled back successfully');
    } catch (rollbackError) {
      console.error('âŒ Failed to roll back transaction:', rollbackError);
    }
    // Re-throw the original error to be caught by the calling function
    throw error;
  }
}

process.on('SIGINT', async () => {
  await closeConnection();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await closeConnection();
  process.exit(0);
});

