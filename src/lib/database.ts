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
    max: 5, // Reduce pool size
    min: 0,
    idleTimeoutMillis: 30000,
  },
  requestTimeout: 60000, // Increase timeout
  connectionTimeout: 60000,
};

// Connection pool
let pool: sql.ConnectionPool | null = null;
let isConnecting = false;

export async function getConnection(): Promise<sql.ConnectionPool> {
  try {
    // If pool exists and is connected, return it
    if (pool && pool.connected) {
      return pool;
    }

    // If already connecting, wait for it
    if (isConnecting) {
      while (isConnecting) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      if (pool && pool.connected) {
        return pool;
      }
    }

    // Start connecting
    isConnecting = true;

    // Close existing pool if not connected
    if (pool && !pool.connected) {
      try {
        await pool.close();
      } catch (closeError) {
        console.warn('Warning closing existing pool:', closeError);
      }
    }

    // Create new pool
    pool = new sql.ConnectionPool(config);
    await pool.connect();

    isConnecting = false;
    console.log('✅ Connected to SQL Server database');
    return pool;
  } catch (error) {
    isConnecting = false;
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

// Helper function to execute queries
export async function executeQuery<T = any>(
  query: string,
  params?: Record<string, any>
): Promise<T[]> {
  const connection = await getConnection();
  const request = connection.request();

  // Add parameters if provided
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      request.input(key, value);
    });
  }

  const result = await request.query(query);
  return result.recordset;
}

// Helper function to execute stored procedures
export async function executeStoredProcedure<T = any>(
  procedureName: string,
  params?: Record<string, any>
): Promise<T[]> {
  const connection = await getConnection();
  const request = connection.request();

  // Add parameters if provided
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      request.input(key, value);
    });
  }

  const result = await request.execute(procedureName);
  return result.recordset;
}

// Graceful shutdown
process.on('SIGINT', async () => {
  await closeConnection();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await closeConnection();
  process.exit(0);
});

export default { getConnection, closeConnection, executeQuery, executeStoredProcedure };
