import { SeriesDataContext } from '@/types/series-data';
import { DatabaseType } from '@/types/database';

interface ParsedQueryConfig {
  xAxis?: string;
  yAxis?: string;
  dateRange: { from: Date; to: Date } | null;
  groupBy?: string;
  aggregation?: {
    type: 'avg' | 'sum' | 'min' | 'max' | 'count';
    column: string;
    groupBy?: string;
  };
  valueFilters?: Array<{
    column: string;
    operator: 'eq' | 'gt' | 'lt' | 'gte' | 'lte' | 'in';
    value: unknown;
  }>;
}

export class QueryBuilder {
  static buildQuery(context: SeriesDataContext, dbType: DatabaseType, tableName: string): string {
    const config = this.parseContext(context);

    let selectClause = '';
    const fromClause = `FROM ${tableName}`;
    let whereClause = '';
    let groupByClause = '';
    let orderByClause = '';

    // Build SELECT clause
    if (config.aggregation) {
      const aggFunc = config.aggregation.type.toUpperCase();
      selectClause = `SELECT ${config.xAxis}, ${aggFunc}(${config.aggregation.column}) as ${config.yAxis}`;
    } else {
      selectClause = `SELECT ${config.xAxis}, ${config.yAxis}::numeric(18,3)`;
      if (config.groupBy) {
        selectClause += `, ${config.groupBy}`;
      }
    }

    // Build WHERE clause
    const whereConditions: string[] = [];
    
    if (config.dateRange) {
      const fromDate = config.dateRange.from instanceof Date 
        ? config.dateRange.from.toISOString() 
        : config.dateRange.from;
      const toDate = config.dateRange.to instanceof Date 
        ? config.dateRange.to.toISOString() 
        : config.dateRange.to;
      
      if (dbType === 'postgresql') {
        whereConditions.push(`${config.xAxis} >= '${fromDate}'`);
        whereConditions.push(`${config.xAxis} <= '${toDate}'`);
      } else if (dbType === 'clickhouse') {
        whereConditions.push(`${config.xAxis} >= '${fromDate}'`);
        whereConditions.push(`${config.xAxis} <= '${toDate}'`);
      }
    }

    if (config.valueFilters) {
      config.valueFilters.forEach(filter => {
        const operator = this.getOperator(filter.operator, dbType);
        whereConditions.push(`${filter.column} ${operator} ${this.formatValue(filter.value, dbType)}`);
      });
    }

    if (whereConditions.length > 0) {
      whereClause = `WHERE ${whereConditions.join(' AND ')}`;
    }

    // Build GROUP BY clause
    if (config.aggregation) {
      if (config.aggregation.groupBy) {
        // Time-based grouping
        if (dbType === 'postgresql') {
          groupByClause = `GROUP BY date_trunc('${config.aggregation.groupBy}', ${config.xAxis})`;
          selectClause = `SELECT date_trunc('${config.aggregation.groupBy}', ${config.xAxis}) as ${config.xAxis}, ${config.aggregation.type.toUpperCase()}(${config.aggregation.column}) as ${config.yAxis}`;
        } else if (dbType === 'clickhouse') {
          groupByClause = `GROUP BY toStartOfInterval(${config.xAxis}, INTERVAL 1 ${config.aggregation.groupBy})`;
          selectClause = `SELECT toStartOfInterval(${config.xAxis}, INTERVAL 1 ${config.aggregation.groupBy}) as ${config.xAxis}, ${config.aggregation.type.toUpperCase()}(${config.aggregation.column}) as ${config.yAxis}`;
        }
      } else {
        groupByClause = `GROUP BY ${config.xAxis}`;
      }
    } else if (config.groupBy) {
      groupByClause = `GROUP BY ${config.xAxis}, ${config.groupBy}`;
    }

    // Build ORDER BY clause
    orderByClause = `ORDER BY ${config.xAxis} ASC`;

    // Combine all clauses
    const query = [
      selectClause,
      fromClause,
      whereClause,
      groupByClause,
      orderByClause,
    ].filter(Boolean).join(' ');

    return query;
  }

  private static parseContext(context: SeriesDataContext): ParsedQueryConfig {
    return {
      xAxis: context.xColumnName,
      yAxis: context.yColumnName,
      dateRange: context.dateRange,
      // TODO: Реализовать извлечение groupBy, aggregation, valueFilters из context
    };
  }

  private static getOperator(operator: string, dbType: DatabaseType): string {
    const operators: Record<string, string> = {
      eq: '=',
      gt: '>',
      lt: '<',
      gte: '>=',
      lte: '<=',
      in: 'IN',
    };
    return operators[operator] || '=';
  }

  private static formatValue(value: unknown, dbType: DatabaseType): string {
    if (typeof value === 'string') {
      return `'${value.replace(/'/g, "''")}'`;
    }
    if (Array.isArray(value)) {
      return `(${value.map(v => this.formatValue(v, dbType)).join(', ')})`;
    }
    return String(value);
  }
}

