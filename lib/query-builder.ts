import { SeriesDataContext } from '@/types/series-data';
import { DatabaseType } from '@/types/database';

interface ParsedQueryConfig {
  xAxis?: string;
  yAxis?: string;
  dateRange: { from: Date; to: Date } | null;
  groupBy?: string;
  aggregation?: {
    type: 'none'| 'avg' | 'min' | 'max' ;
    resolution: 'seconds' | 'minutes' | 'hours' | 'days';
    groupBy?: string;
  } | null;
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
      if (aggFunc === 'NONE') {
        selectClause = `SELECT ${config.xAxis}, ${config.yAxis}::numeric(18,3)`;
      } else {
        const pgResolution = config?.aggregation?.groupBy?.replace(/s$/, '');
        selectClause = `SELECT date_trunc('${pgResolution}', ${config.xAxis}) as ${config.xAxis}, ${aggFunc}(${config.yAxis}::numeric(18,3)) as ${config.yAxis}`;
      }
    } else {
      selectClause = `SELECT ${config.xAxis}, ${config.yAxis}::numeric(18,3)`;
      if (config.groupBy) {
        selectClause += `, ${config.groupBy}`;
      }
    }

    // Build WHERE clause
    const whereConditions: string[] = [];
    
    if (config.dateRange) {
      // Всегда UTC: берём epoch ms и форматируем ISO, чтобы исключить влияние локального пояса
      const toUtcIso = (d: Date | string): string =>
        typeof d === 'string' ? d : new Date(d.getTime()).toISOString();
      const fromDate = toUtcIso(config.dateRange.from);
      const toDate = toUtcIso(config.dateRange.to);

      if (dbType === 'postgresql') {
        // Явный ::timestamptz — литерал трактуется как UTC, сравнение с колонкой без сдвига
        whereConditions.push(`${config.xAxis} >= '${fromDate}'::timestamptz`);
        whereConditions.push(`${config.xAxis} <= '${toDate}'::timestamptz`);
      } else if (dbType === 'clickhouse') {
        whereConditions.push(`${config.xAxis} >= '${fromDate}'`);
        whereConditions.push(`${config.xAxis} <= '${toDate}'`);
      }
    }

    if (config.aggregation && config?.aggregation?.type === 'none' && dbType === 'postgresql') {
      const pgRes = config.aggregation.resolution.replace(/s$/, '');
      whereConditions.push(`${config.xAxis} = date_trunc('${pgRes}', ${config.xAxis})`);
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
        // Time-based grouping (PostgreSQL date_trunc wants singular: minute, hour, day)
        const aggFunc = config.aggregation.type.toUpperCase();
        const yExpr = aggFunc === 'NONE' ? `${config.yAxis}::numeric(18,3) as ${config.yAxis}` : `${aggFunc}(${config.yAxis}::numeric(18,3)) as ${config.yAxis}`;
        if (aggFunc !== 'NONE') {
          if (dbType === 'postgresql') {
            // groupByClause = `GROUP BY date_trunc('${pgResolution}', ${config.xAxis})`;
            groupByClause = `GROUP BY 1`;
            // selectClause = `SELECT date_trunc('${pgResolution}', ${config.xAxis}) as ${config.xAxis}, ${yExpr}`;
          } else if (dbType === 'clickhouse') {
            groupByClause = `GROUP BY toStartOfInterval(${config.xAxis}, INTERVAL 1 ${config.aggregation.groupBy})`;
            selectClause = `SELECT toStartOfInterval(${config.xAxis}, INTERVAL 1 ${config.aggregation.groupBy}) as ${config.xAxis}, ${yExpr}`;
          }
        }
      } 
      // else {
      //   groupByClause = `GROUP BY ${config.xAxis}`;
      // }
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

    console.log(query);

    return query;
  }

  private static parseContext(context: SeriesDataContext): ParsedQueryConfig {
    return {
      xAxis: context.xColumnName,
      yAxis: context.yColumnName,
      dateRange: context.dateRange,
      aggregation: context.aggregation ? {
        type: context.aggregation?.type,
        resolution: context.aggregation?.resolution,
        groupBy: context.aggregation?.resolution ?? undefined
      }:null
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

