import { DatabaseConnectionService } from './db-connection.service';
import { DataSourceService } from './data-source.service';
import { PostgresDriver } from '@/lib/drivers/postgres.driver';
import { ClickHouseDriver } from '@/lib/drivers/clickhouse.driver';
import { SeriesDataContext } from '@/types/series-data';
import { QueryBuilder } from '@/lib/query-builder';
import { CacheService } from './cache.service';
import type { DatabaseDriver } from '@/lib/drivers/base.driver';

export class QueryService {
  static async executeQuery(
    context: SeriesDataContext,
    connectionId: string,
    dataSourceId: string,
    useCache: boolean = false,
    cacheTTL: number = 3600
  ): Promise<unknown[]> {
    // Get connection
    const connection = await DatabaseConnectionService.getById(connectionId);
    if (!connection) {
      throw new Error('Connection not found');
    }

    // Get data source
    const dataSource = await DataSourceService.getById(dataSourceId);
    if (!dataSource || dataSource.connectionId !== connectionId) {
      throw new Error('Data source not found');
    }

    const tableName = dataSource.schemaName
      ? `${dataSource.schemaName}.${dataSource.tableName}`
      : dataSource.tableName;

    // Generate cache key
    const cacheKey = CacheService.generateKey({
      connectionId,
      dataSourceId,
      context: JSON.stringify(context),
    });

    // Try to get from cache
    if (useCache) {
      const cachedData = await CacheService.get<unknown[]>(cacheKey);
      if (cachedData) {
        return cachedData;
      }
    }

    // Build query
    const query = QueryBuilder.buildQuery(context, connection.type, tableName);
    // console.log(query);
    // Execute query
    let driver: DatabaseDriver | null = null;
    try {
      if (connection.type === 'postgresql') {
        driver = new PostgresDriver({
          host: connection.host,
          port: connection.port,
          database: connection.database,
          username: connection.username,
          password: connection.password,
        });
        await driver.connect?.();
      } else if (connection.type === 'clickhouse') {
        driver = new ClickHouseDriver({
          host: connection.host,
          port: connection.port,
          database: connection.database,
          username: connection.username,
          password: connection.password,
        });
      } else {
        throw new Error('Unsupported database type');
      }

      const data = await driver.query(query);

      // Cache the result
      if (useCache) {
        await CacheService.set<unknown[]>(cacheKey, data, cacheTTL);
      }

      return data;
    } finally {
      if (driver) {
        await driver.close();
      }
    }
  }
}

