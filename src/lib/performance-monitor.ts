import { executeQuery } from './database-optimized';

export interface PerformanceMetric {
  timestamp: Date;
  operation: string;
  duration: number;
  success: boolean;
  details?: any;
}

export interface DatabaseHealthCheck {
  status: 'healthy' | 'degraded' | 'unhealthy';
  responseTime: number;
  activeConnections?: number;
  cacheHitRatio?: number;
  slowQueries?: number;
  recommendations?: string[];
}

class PerformanceMonitor {
  private metrics: PerformanceMetric[] = [];
  private maxMetrics = 1000;
  
  // Log performance metric
  logMetric(operation: string, duration: number, success: boolean, details?: any) {
    const metric: PerformanceMetric = {
      timestamp: new Date(),
      operation,
      duration,
      success,
      details
    };
    
    this.metrics.push(metric);
    
    // Keep only latest metrics to prevent memory leak
    if (this.metrics.length > this.maxMetrics) {
      this.metrics = this.metrics.slice(-this.maxMetrics);
    }
    
    // Log slow operations
    if (duration > 1000) {
      console.warn(`🐌 Slow operation detected: ${operation} took ${duration}ms`, details);
    }
    
    // Log failed operations
    if (!success) {
      console.error(`❌ Operation failed: ${operation}`, details);
    }
  }
  
  // Get performance statistics
  getStats(timeWindow?: number): {
    totalOperations: number;
    successRate: number;
    averageResponseTime: number;
    slowOperations: number;
    errorRate: number;
    operationsByType: Record<string, number>;
  } {
    let filteredMetrics = this.metrics;
    
    if (timeWindow) {
      const cutoff = new Date(Date.now() - timeWindow);
      filteredMetrics = this.metrics.filter(m => m.timestamp >= cutoff);
    }
    
    if (filteredMetrics.length === 0) {
      return {
        totalOperations: 0,
        successRate: 0,
        averageResponseTime: 0,
        slowOperations: 0,
        errorRate: 0,
        operationsByType: {}
      };
    }
    
    const totalOperations = filteredMetrics.length;
    const successfulOperations = filteredMetrics.filter(m => m.success).length;
    const slowOperations = filteredMetrics.filter(m => m.duration > 1000).length;
    const totalResponseTime = filteredMetrics.reduce((sum, m) => sum + m.duration, 0);
    
    const operationsByType = filteredMetrics.reduce((acc, m) => {
      acc[m.operation] = (acc[m.operation] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return {
      totalOperations,
      successRate: (successfulOperations / totalOperations) * 100,
      averageResponseTime: totalResponseTime / totalOperations,
      slowOperations,
      errorRate: ((totalOperations - successfulOperations) / totalOperations) * 100,
      operationsByType
    };
  }
  
  // Get recent errors
  getRecentErrors(limit = 10): PerformanceMetric[] {
    return this.metrics
      .filter(m => !m.success)
      .slice(-limit)
      .reverse();
  }
  
  // Get slow operations
  getSlowOperations(threshold = 1000, limit = 10): PerformanceMetric[] {
    return this.metrics
      .filter(m => m.duration > threshold)
      .sort((a, b) => b.duration - a.duration)
      .slice(0, limit);
  }
  
  // Database health check
  async checkDatabaseHealth(): Promise<DatabaseHealthCheck> {
    const startTime = Date.now();
    
    try {
      // Basic connectivity test
      await executeQuery('SELECT 1 as health_check');
      const responseTime = Date.now() - startTime;
      
      let status: DatabaseHealthCheck['status'] = 'healthy';
      const recommendations: string[] = [];
      
      // Check response time
      if (responseTime > 2000) {
        status = 'unhealthy';
        recommendations.push('Database response time is too slow (>2s)');
      } else if (responseTime > 1000) {
        status = 'degraded';
        recommendations.push('Database response time is slow (>1s)');
      }
      
      // Check recent performance
      const recentStats = this.getStats(300000); // Last 5 minutes
      
      if (recentStats.errorRate > 10) {
        status = 'unhealthy';
        recommendations.push(`High error rate: ${recentStats.errorRate.toFixed(1)}%`);
      }
      
      if (recentStats.averageResponseTime > 800) {
        if (status === 'healthy') status = 'degraded';
        recommendations.push(`High average response time: ${recentStats.averageResponseTime.toFixed(0)}ms`);
      }
      
      if (recentStats.slowOperations > 5) {
        if (status === 'healthy') status = 'degraded';
        recommendations.push(`Multiple slow operations detected: ${recentStats.slowOperations}`);
      }
      
      // Add performance recommendations
      if (status === 'healthy' && recentStats.totalOperations > 0) {
        if (recentStats.averageResponseTime < 100) {
          recommendations.push('Performance is excellent ✅');
        } else if (recentStats.averageResponseTime < 300) {
          recommendations.push('Performance is good 👍');
        } else {
          recommendations.push('Performance could be improved');
        }
      }
      
      return {
        status,
        responseTime,
        cacheHitRatio: 0, // Will be calculated by cache layer
        slowQueries: recentStats.slowOperations,
        recommendations
      };
      
    } catch (error) {
      return {
        status: 'unhealthy',
        responseTime: Date.now() - startTime,
        slowQueries: 0,
        recommendations: [
          'Database connection failed',
          error instanceof Error ? error.message : 'Unknown database error'
        ]
      };
    }
  }
  
  // Get performance report
  async getPerformanceReport(): Promise<{
    health: DatabaseHealthCheck;
    stats: any;
    slowOperations: PerformanceMetric[];
    recentErrors: PerformanceMetric[];
    recommendations: string[];
  }> {
    const health = await this.checkDatabaseHealth();
    const stats = this.getStats(3600000); // Last hour
    const slowOperations = this.getSlowOperations(500, 5);
    const recentErrors = this.getRecentErrors(5);
    
    const recommendations: string[] = [
      ...(health.recommendations || []),
    ];
    
    // Add specific recommendations based on patterns
    if (slowOperations.length > 3) {
      recommendations.push('Consider adding database indexes for frequently used queries');
    }
    
    if (recentErrors.length > 2) {
      recommendations.push('Check error patterns and implement better error handling');
    }
    
    if (stats.successRate < 95) {
      recommendations.push('Success rate is below 95%, investigate error causes');
    }
    
    return {
      health,
      stats,
      slowOperations,
      recentErrors,
      recommendations: Array.from(new Set(recommendations)) // Remove duplicates
    };
  }
  
  // Clear old metrics
  clearMetrics(olderThan?: number) {
    if (olderThan) {
      const cutoff = new Date(Date.now() - olderThan);
      this.metrics = this.metrics.filter(m => m.timestamp >= cutoff);
    } else {
      this.metrics = [];
    }
  }
}

// Singleton instance
export const performanceMonitor = new PerformanceMonitor();

// Middleware function to wrap operations with monitoring
export function withPerformanceMonitoring<T extends (...args: any[]) => any>(
  operation: string,
  fn: T
): T {
  return ((...args: any[]) => {
    const startTime = Date.now();
    
    try {
      const result = fn(...args);
      
      // Handle both sync and async functions
      if (result && typeof result.then === 'function') {
        return result
          .then((res: any) => {
            const duration = Date.now() - startTime;
            performanceMonitor.logMetric(operation, duration, true, { args: args.length });
            return res;
          })
          .catch((error: any) => {
            const duration = Date.now() - startTime;
            performanceMonitor.logMetric(operation, duration, false, { 
              error: error.message,
              args: args.length 
            });
            throw error;
          });
      } else {
        const duration = Date.now() - startTime;
        performanceMonitor.logMetric(operation, duration, true, { args: args.length });
        return result;
      }
    } catch (error) {
      const duration = Date.now() - startTime;
      performanceMonitor.logMetric(operation, duration, false, { 
        error: error instanceof Error ? error.message : 'Unknown error',
        args: args.length 
      });
      throw error;
    }
  }) as T;
}

// API endpoint helpers
export async function getHealthStatus(): Promise<DatabaseHealthCheck> {
  return await performanceMonitor.checkDatabaseHealth();
}

export async function getPerformanceReport() {
  return await performanceMonitor.getPerformanceReport();
}

export function getPerformanceStats(timeWindow?: number) {
  return performanceMonitor.getStats(timeWindow);
}

// Export the monitor instance for direct access
export default performanceMonitor;