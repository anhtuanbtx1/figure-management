import sql from 'mssql';

// Simple in-memory cache implementation (replace with Redis in production)
interface CacheItem<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

class SimpleCache {
  private cache: Map<string, CacheItem<any>> = new Map();
  private cleanupInterval: NodeJS.Timeout;

  constructor() {
    // Cleanup expired items every minute
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 60000);
  }

  set<T>(key: string, data: T, ttl: number = 300): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttl * 1000 // Convert to milliseconds
    });
  }

  get<T>(key: string): T | null {
    const item = this.cache.get(key);
    if (!item) return null;

    // Check if expired
    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key);
      return null;
    }

    return item.data;
  }

  delete(key: string): void {
    this.cache.delete(key);
  }

  keys(): string[] {
    return Array.from(this.cache.keys());
  }

  clear(): void {
    this.cache.clear();
  }

  getStats() {
    return {
      size: this.cache.size,
      keys: this.cache.size
    };
  }

  private cleanup(): void {
    const now = Date.now();
    const keysToDelete: string[] = [];
    
    this.cache.forEach((item, key) => {
      if (now - item.timestamp > item.ttl) {
        keysToDelete.push(key);
      }
    });
    
    keysToDelete.forEach(key => this.cache.delete(key));
  }

  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    this.clear();
  }
}

// Cache layer for query results (TTL: 5 minutes for most queries)
const queryCache = new SimpleCache();

// Enhanced database configuration
const config: sql.config = {
  server: process.env.DB_SERVER || '112.78.2.70',
  database: process.env.DB_DATABASE || 'zen50558_ManagementStore',
  user: process.env.DB_USER || 'zen50558_ManagementStore',
  password: process.env.DB_PASSWORD || 'Passwordla@123',
  options: {
    encrypt: true,
    trustServerCertificate: true,
    enableArithAbort: true,
    cryptoCredentialsDetails: {
      minVersion: 'TLSv1'
    }
  },
  pool: {
    max: 10, // Increased pool size for better concurrency
    min: 2,  // Keep minimum connections alive
    idleTimeoutMillis: 300000, // 5 minutes
    acquireTimeoutMillis: 60000, // 1 minute to get connection
    createTimeoutMillis: 60000,
    destroyTimeoutMillis: 5000,
    reapIntervalMillis: 1000, // Check for idle connections every second
    createRetryIntervalMillis: 200,
  },
  requestTimeout: 30000, // Reduced timeout for better UX
  connectionTimeout: 60000,
};

// Connection pool with retry logic
let pool: sql.ConnectionPool | null = null;
let isConnecting = false;
let connectionRetries = 0;
const MAX_CONNECTION_RETRIES = 3;

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

    // Create new pool with retry logic
    let lastError;
    for (let attempt = 1; attempt <= MAX_CONNECTION_RETRIES; attempt++) {
      try {
        pool = new sql.ConnectionPool(config);
        
        // Add connection event listeners
        pool.on('error', (err) => {
          console.error('❌ Connection pool error:', err);
          pool = null; // Reset pool on error
        });

        await pool.connect();
        
        connectionRetries = 0; // Reset retry counter on success
        isConnecting = false;
        console.log(`✅ Connected to SQL Server database (attempt ${attempt})`);
        return pool;
        
      } catch (error) {
        lastError = error;
        console.warn(`⚠️ Connection attempt ${attempt}/${MAX_CONNECTION_RETRIES} failed:`, error);
        
        if (attempt < MAX_CONNECTION_RETRIES) {
          // Wait before retry with exponential backoff
          const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    isConnecting = false;
    throw new Error(`Database connection failed after ${MAX_CONNECTION_RETRIES} attempts: ${lastError}`);

  } catch (error) {
    isConnecting = false;
    console.error('❌ Database connection failed:', error);
    throw new Error(`Database connection failed: ${error}`);
  }
}

// Cached query execution
export async function executeQueryCached<T = any>(
  query: string,
  params?: Record<string, any>,
  cacheKey?: string,
  cacheTTL?: number
): Promise<T[]> {
  // Generate cache key if not provided
  const finalCacheKey = cacheKey || `query:${Buffer.from(query + JSON.stringify(params || {})).toString('base64')}`;
  
  // Check cache first
  if (cacheKey || process.env.NODE_ENV !== 'development') {
    const cached = queryCache.get<T[]>(finalCacheKey);
    if (cached) {
      console.log('🎯 Cache hit for query:', finalCacheKey.substring(0, 50) + '...');
      return cached;
    }
  }

  // Execute query
  const result = await executeQuery<T>(query, params);
  
  // Cache result
  if (cacheKey || process.env.NODE_ENV !== 'development') {
    queryCache.set(finalCacheKey, result, cacheTTL || 300);
    console.log('💾 Cached query result:', finalCacheKey.substring(0, 50) + '...');
  }
  
  return result;
}

// Optimized query execution with prepared statements
export async function executeQuery<T = any>(
  query: string,
  params?: Record<string, any>
): Promise<T[]> {
  const connection = await getConnection();
  const request = connection.request();

  // Add parameters with proper types
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value === null || value === undefined) {
        request.input(key, sql.NVarChar, null);
      } else if (typeof value === 'string') {
        request.input(key, sql.NVarChar, value);
      } else if (typeof value === 'number') {
        if (Number.isInteger(value)) {
          request.input(key, sql.Int, value);
        } else {
          request.input(key, sql.Decimal(18, 2), value);
        }
      } else if (typeof value === 'boolean') {
        request.input(key, sql.Bit, value ? 1 : 0);
      } else {
        request.input(key, value);
      }
    });
  }

  const startTime = Date.now();
  const result = await request.query(query);
  const executionTime = Date.now() - startTime;
  
  // Log slow queries
  if (executionTime > 1000) {
    console.warn(`🐌 Slow query detected (${executionTime}ms):`, query.substring(0, 100) + '...');
  }

  return result.recordset;
}

// Optimized stored procedure execution
export async function executeStoredProcedureCached<T = any>(
  procedureName: string,
  params?: Record<string, any>,
  cacheKey?: string,
  cacheTTL?: number
): Promise<T[]> {
  // Generate cache key if not provided
  const finalCacheKey = cacheKey || `sp:${procedureName}:${Buffer.from(JSON.stringify(params || {})).toString('base64')}`;
  
  // Check cache first
  if (cacheKey || process.env.NODE_ENV !== 'development') {
    const cached = queryCache.get<T[]>(finalCacheKey);
    if (cached) {
      console.log('🎯 Cache hit for stored procedure:', procedureName);
      return cached;
    }
  }

  // Execute stored procedure
  const result = await executeStoredProcedure<T>(procedureName, params);
  
  // Cache result
  if (cacheKey || process.env.NODE_ENV !== 'development') {
    queryCache.set(finalCacheKey, result, cacheTTL || 300);
    console.log('💾 Cached stored procedure result:', procedureName);
  }
  
  return result;
}

// Original stored procedure execution
export async function executeStoredProcedure<T = any>(
  procedureName: string,
  params?: Record<string, any>
): Promise<T[]> {
  const connection = await getConnection();
  const request = connection.request();

  // Add parameters with proper types
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value === null || value === undefined) {
        request.input(key, sql.NVarChar, null);
      } else if (typeof value === 'string') {
        request.input(key, sql.NVarChar, value);
      } else if (typeof value === 'number') {
        if (Number.isInteger(value)) {
          request.input(key, sql.Int, value);
        } else {
          request.input(key, sql.Decimal(18, 2), value);
        }
      } else if (typeof value === 'boolean') {
        request.input(key, sql.Bit, value ? 1 : 0);
      } else {
        request.input(key, value);
      }
    });
  }

  const startTime = Date.now();
  const result = await request.execute(procedureName);
  const executionTime = Date.now() - startTime;
  
  // Log slow procedures
  if (executionTime > 1000) {
    console.warn(`🐌 Slow stored procedure detected (${executionTime}ms):`, procedureName);
  }

  return result.recordset;
}

// Batch operations for better performance
export async function executeBatch<T = any>(
  queries: Array<{query: string, params?: Record<string, any>}>
): Promise<T[][]> {
  const connection = await getConnection();
  const transaction = new sql.Transaction(connection);
  
  try {
    await transaction.begin();
    
    const results: T[][] = [];
    
    for (const {query, params} of queries) {
      const request = new sql.Request(transaction);
      
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          request.input(key, value);
        });
      }
      
      const result = await request.query(query);
      results.push(result.recordset);
    }
    
    await transaction.commit();
    return results;
    
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
}

// Cache management functions
export function clearCache(pattern?: string) {
  if (pattern) {
    const keys = queryCache.keys().filter((key: string) => key.includes(pattern));
    keys.forEach(key => queryCache.delete(key));
    console.log(`🗑️ Cleared ${keys.length} cache entries matching pattern: ${pattern}`);
  } else {
    queryCache.clear();
    console.log('🗑️ Cleared entire query cache');
  }
}

export function getCacheStats() {
  return {
    keys: queryCache.keys().length,
    stats: queryCache.getStats()
  };
}

// Health check function
export async function checkDatabaseHealth() {
  try {
    const startTime = Date.now();
    await executeQuery('SELECT 1 as health_check');
    const responseTime = Date.now() - startTime;
    
    return {
      status: 'healthy',
      responseTime,
      cacheStats: getCacheStats()
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      error: error instanceof Error ? error.message : 'Unknown error',
      cacheStats: getCacheStats()
    };
  }
}

export async function closeConnection(): Promise<void> {
  try {
    if (pool) {
      await pool.close();
      pool = null;
      console.log('✅ Database connection closed');
    }
    queryCache.clear();
    console.log('✅ Query cache cleared');
  } catch (error) {
    console.error('❌ Error closing database connection:', error);
  }
}

// Graceful shutdown
process.on('SIGINT', async () => {
  await closeConnection();
  queryCache.destroy();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await closeConnection();
  queryCache.destroy();
  process.exit(0);
});

export default { 
  getConnection, 
  closeConnection, 
  executeQuery, 
  executeQueryCached,
  executeStoredProcedure,
  executeStoredProcedureCached,
  executeBatch,
  clearCache,
  getCacheStats,
  checkDatabaseHealth
};